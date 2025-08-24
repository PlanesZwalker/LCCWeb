#!/usr/bin/env node

const BaseAgent = require('./base-agent');
const fileBridge = require('../file-bridge');
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class FixerAgent extends BaseAgent {
  constructor() {
    super('fixer-agent');
    this.fixes = [];
    this.issues = [];
  }

  analyzeInstruction(instruction) {
    const keywords = {
      test: ['test', 'failure', 'error', 'bug'],
      lint: ['lint', 'eslint', 'style', 'format'],
      css: ['css', 'style', 'layout', 'responsive', 'sanitize', 'brace', 'selector'],
      js: ['javascript', 'js', 'script', 'function'],
      html: ['html', 'markup', 'semantic'],
      performance: ['performance', 'speed', 'optimization'],
      accessibility: ['accessibility', 'a11y', 'wcag'],
      security: ['security', 'vulnerability', 'xss'],
      all: ['all', 'complete', 'everything']
    };

    const analysis = {
      needsTestFixes: false,
      needsLintFixes: false,
      needsCSSFixes: false,
      needsJSFixes: false,
      needsHTMLFixes: false,
      needsPerformanceFixes: false,
      needsAccessibilityFixes: false,
      needsSecurityFixes: false,
      fixAll: false,
      priority: 'medium'
    };

    const lowerInstruction = instruction.toLowerCase();

    // Map categories to the correct Fixes key suffix (handle acronyms)
    const keySuffix = {
      test: 'Test',
      lint: 'Lint',
      css: 'CSS',
      js: 'JS',
      html: 'HTML',
      performance: 'Performance',
      accessibility: 'Accessibility',
      security: 'Security'
    };
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerInstruction.includes(word))) {
        if (category === 'all') {
          analysis.fixAll = true;
        } else {
          const suffix = keySuffix[category] || (category.charAt(0).toUpperCase() + category.slice(1));
          analysis[`needs${suffix}Fixes`] = true;
        }
      }
    }

    // Déterminer la priorité
    if (analysis.fixAll) analysis.priority = 'high';
    if (analysis.needsSecurityFixes) analysis.priority = 'high';
    if (analysis.needsTestFixes) analysis.priority = 'high';

    return analysis;
  }

  findTestReports() {
    const reports = [];
    const logFiles = fileBridge.listFiles('tools/logs', 'test-report-*.json');
    
    for (const file of logFiles) {
      try {
        const content = fileBridge.readFile(file.path);
        const report = JSON.parse(content);
        reports.push({
          path: file.path,
          data: report,
          timestamp: report.timestamp
        });
      } catch (error) {
        this.log(`⚠️ Impossible de lire le rapport: ${file.path}`, 'warning');
      }
    }

    // Trier par timestamp (plus récent en premier)
    return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  findLintIssues() {
    this.log('🔍 Recherche des problèmes de linting...', 'info');

    try {
      const tempDir = path.join('.agents', 'temp');
      try { fs.mkdirSync(tempDir, { recursive: true }); } catch (_) {}
      const reportPath = path.join(tempDir, `eslint-report-${Date.now()}.json`);

      // Résoudre eslint local
      const isWin = process.platform === 'win32';
      const localEslint = path.join(process.cwd(), 'node_modules', '.bin', isWin ? 'eslint.cmd' : 'eslint');
      const hasLocal = fs.existsSync(localEslint);

      let cmd = hasLocal ? localEslint : 'npx';
      const baseArgs = ['--format','json','--output-file',reportPath,'--quiet',
        '--ignore-pattern','public/js/libs/**',
        '--ignore-pattern','**/*.min.js',
        '--ignore-pattern','public/js/html2pdf.bundle.min.js'];
      let args = hasLocal
        ? [...baseArgs, 'public/js/**/*.js']
        : ['--yes','eslint',...baseArgs,'public/js/**/*.js'];

      const res = spawnSync(cmd, args, {
        cwd: process.cwd(),
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 100,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false
      });

      if (res.error) {
        this.log(`⚠️ Échec du lancement ESLint: ${res.error.message}`, 'warning');
      }
      if (res.stderr) {
        const trimmed = (res.stderr || '').toString().trim();
        if (trimmed) this.log(`ℹ️ ESLint stderr: ${trimmed.substring(0, 500)}`, 'info');
      }

      // ESLint returns non-zero when errors are found; that's fine. We read the report file regardless.
      if (!fs.existsSync(reportPath)) {
        // Fallback: try capturing stdout if any
        const stdout = res.stdout || '';
        if (stdout && stdout.trim().startsWith('[')) {
          const lintResults = JSON.parse(stdout);
          return this._collectIssuesFromResults(lintResults);
        }
        this.log(`⚠️ Rapport ESLint introuvable et aucune sortie disponible. Code: ${res.status}`, 'warning');
        return [];
      }

      const lintOutput = fs.readFileSync(reportPath, 'utf8');
      const lintResults = lintOutput ? JSON.parse(lintOutput) : [];
      return this._collectIssuesFromResults(lintResults);
    } catch (error) {
      this.log(`⚠️ Erreur lors du linting: ${error.message}`, 'warning');
      return [];
    }
  }

  _collectIssuesFromResults(lintResults) {
    const issues = [];
    for (const file of lintResults || []) {
      for (const message of file.messages || []) {
        issues.push({
          file: file.filePath,
          line: message.line,
          column: message.column,
          rule: message.ruleId,
          message: message.message,
          severity: message.severity
        });
      }
    }
    return issues;
  }

  fixLintIssues(issues) {
    this.log(`🔧 Correction de ${issues.length} problèmes de linting...`, 'info');
    
    let fixedCount = 0;
    
    for (const issue of issues) {
      if (issue.severity === 2) { // Erreur
        const fixed = this.fixLintIssue(issue);
        if (fixed) {
          fixedCount++;
          this.fixes.push({
            type: 'lint',
            file: issue.file,
            rule: issue.rule,
            description: issue.message
          });
        }
      }
    }

    this.log(`✅ ${fixedCount} problèmes de linting corrigés`, 'success');
    return fixedCount;
  }

  fixLintIssue(issue) {
    try {
      const content = fileBridge.readFile(issue.file);
      const lines = content.split('\n');
      
      // Corriger selon le type de règle
      switch (issue.rule) {
        case 'no-unused-vars':
          // Supprimer les variables non utilisées
          const line = lines[issue.line - 1];
          if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
            lines[issue.line - 1] = `// ${line} // TODO: Remove if unused`;
          }
          break;
          
        case 'no-console':
          // Commenter les console.log
          const consoleLine = lines[issue.line - 1];
          if (consoleLine.includes('console.log')) {
            lines[issue.line - 1] = `// ${consoleLine}`;
          }
          break;
          
        case 'semi':
          // Ajouter les points-virgules manquants
          const semiLine = lines[issue.line - 1];
          if (!semiLine.trim().endsWith(';') && !semiLine.trim().endsWith('{') && !semiLine.trim().endsWith('}')) {
            lines[issue.line - 1] = semiLine + ';';
          }
          break;
          
        case 'quotes':
          // Standardiser les guillemets
          const quoteLine = lines[issue.line - 1];
          if (quoteLine.includes('"') && !quoteLine.includes("'")) {
            lines[issue.line - 1] = quoteLine.replace(/"/g, "'");
          }
          break;
      }
      
      const fixedContent = lines.join('\n');
      fileBridge.writeFile(issue.file, fixedContent);
      return true;
    } catch (error) {
      this.log(`❌ Erreur lors de la correction: ${error.message}`, 'error');
      return false;
    }
  }

  fixCSSIssues() {
    this.log('🎨 Correction des problèmes CSS...', 'info');

    const cssFiles = fileBridge.listFiles('public/css', '\\.(css)$');
    if (cssFiles.length === 0) {
      this.log('Aucun fichier CSS trouvé sous public/css', 'warning');
      return 0;
    }

    // 1) Run the dedicated css-auto-fix script for robust sanitation
    try {
      const scriptPath = path.join(process.cwd(), 'tools', 'css-auto-fix.js');
      if (fs.existsSync(scriptPath)) {
        const args = [scriptPath, ...cssFiles.map(f => f.path)];
        const res = spawnSync(process.execPath, args, { encoding: 'utf8' });
        if (res.error) this.log(`⚠️ css-auto-fix error: ${res.error.message}`, 'warning');
        if (res.stderr && res.stderr.trim()) this.log(`css-auto-fix stderr: ${res.stderr.substring(0, 500)}`, 'info');
        if (res.stdout && res.stdout.trim()) this.log(res.stdout.split('\n').slice(0, 10).join('\n'), 'info');
      } else {
        this.log('css-auto-fix.js introuvable; fallback aux corrections simples', 'warning');
      }
    } catch (e) {
      this.log(`⚠️ Échec css-auto-fix: ${e.message}`, 'warning');
    }

    // 2) Apply lightweight textual fixes as a complement
    let fixedCount = 0;
    for (const file of cssFiles) {
      const content = fileBridge.readFile(file.path);
      let fixedContent = content;
      const fixes = [
        {
          // Remove duplicate identical property lines inside same block
          pattern: /([a-z-]+:\s*[^;]+;)\s*\1/g,
          replacement: '$1'
        },
        {
          // Replace empty rules with a minimal stub
          pattern: /([^{}]+)\s*\{\s*\}/g,
          replacement: '$1 {\n  /* rule preserved */\n}'
        }
      ];
      for (const fix of fixes) {
        const before = fixedContent;
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
        if (before !== fixedContent) fixedCount++;
      }
      if (fixedContent !== content) {
        fileBridge.writeFile(file.path, fixedContent);
        this.fixes.push({ type: 'css', file: file.path, description: 'CSS fixes applied' });
      }
    }

    this.log(`✅ ${fixedCount} corrections CSS appliquées`, 'success');
    return fixedCount;
  }

  fixJavaScriptIssues() {
    this.log('⚙️ Correction des problèmes JavaScript...', 'info');
    
    const jsFiles = fileBridge.listFiles('public/js', '.*\\.js$');
    let fixedCount = 0;
    
    for (const file of jsFiles) {
      // Skip third-party libs and minified files
      const normalizedPath = file.path.replace(/\\/g, '/');
      if (normalizedPath.includes('/libs/') || /\.min\.js$/.test(normalizedPath)) {
        continue;
      }
      const content = fileBridge.readFile(file.path);
      let fixedContent = content;
      
      // Corriger les problèmes JS courants
      const fixes = [
        // Ajouter les points-virgules manquants
        {
          pattern: /([^;{}])\s*\n\s*([a-zA-Z_$])/g,
          replacement: '$1;\n$2'
        },
        // Corriger les variables non déclarées
        {
          pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
          replacement: (match, varName) => {
            if (!match.startsWith('const ') && !match.startsWith('let ') && !match.startsWith('var ')) {
              return `let ${match}`;
            }
            return match;
          }
        },
        // Corriger les fonctions fléchées
        {
          pattern: /function\s*\(([^)]*)\)\s*=>/g,
          replacement: '($1) =>'
        }
      ];
      
      for (const fix of fixes) {
        const before = fixedContent;
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
        if (before !== fixedContent) {
          fixedCount++;
        }
      }
      
      if (fixedContent !== content) {
        fileBridge.writeFile(file.path, fixedContent);
        this.fixes.push({
          type: 'javascript',
          file: file.path,
          description: 'JavaScript fixes applied'
        });
      }
    }
    
    this.log(`✅ ${fixedCount} corrections JavaScript appliquées`, 'success');
    return fixedCount;
  }

  fixAccessibilityIssues() {
    this.log('♿ Correction des problèmes d\'accessibilité...', 'info');
    
    const htmlFiles = fileBridge.listFiles('public', '*.html');
    let fixedCount = 0;
    
    for (const file of htmlFiles) {
      const content = fileBridge.readFile(file.path);
      let fixedContent = content;
      
      // Corriger les problèmes d'accessibilité courants
      const fixes = [
        // Ajouter les attributs alt manquants
        {
          pattern: /<img([^>]*?)(?<!alt=)[^>]*>/g,
          replacement: '<img$1 alt="Image" />'
        },
        // Ajouter les labels pour les inputs
        {
          pattern: /<input([^>]*?)(?<!id=)[^>]*>/g,
          replacement: '<input$1 id="input-' + Math.random().toString(36).substr(2, 9) + '" />'
        },
        // Ajouter les rôles ARIA
        {
          pattern: /<button([^>]*?)(?<!role=)[^>]*>/g,
          replacement: '<button$1 role="button" />'
        }
      ];
      
      for (const fix of fixes) {
        const before = fixedContent;
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
        if (before !== fixedContent) {
          fixedCount++;
        }
      }
      
      if (fixedContent !== content) {
        fileBridge.writeFile(file.path, fixedContent);
        this.fixes.push({
          type: 'accessibility',
          file: file.path,
          description: 'Accessibility fixes applied'
        });
      }
    }
    
    this.log(`✅ ${fixedCount} corrections d'accessibilité appliquées`, 'success');
    return fixedCount;
  }

  generateFixReport() {
    let report = `\n🔧 Rapport de corrections pour ${this.agentName}:\n`;
    
    if (this.fixes.length === 0) {
      report += 'Aucune correction appliquée\n';
      return report;
    }

    report += `\n📊 Total de corrections: ${this.fixes.length}\n`;
    
    // Grouper par type
    const lintFixes = this.fixes.filter(f => f.type === 'lint');
    const cssFixes = this.fixes.filter(f => f.type === 'css');
    const jsFixes = this.fixes.filter(f => f.type === 'javascript');
    const a11yFixes = this.fixes.filter(f => f.type === 'accessibility');

    if (lintFixes.length > 0) {
      report += `\n🔍 Corrections de linting: ${lintFixes.length}\n`;
      lintFixes.forEach(fix => {
        report += `  - ${fix.file}: ${fix.description}\n`;
      });
    }

    if (cssFixes.length > 0) {
      report += `\n🎨 Corrections CSS: ${cssFixes.length}\n`;
      cssFixes.forEach(fix => {
        report += `  - ${fix.file}: ${fix.description}\n`;
      });
    }

    if (jsFixes.length > 0) {
      report += `\n⚙️ Corrections JavaScript: ${jsFixes.length}\n`;
      jsFixes.forEach(fix => {
        report += `  - ${fix.file}: ${fix.description}\n`;
      });
    }

    if (a11yFixes.length > 0) {
      report += `\n♿ Corrections d'accessibilité: ${a11yFixes.length}\n`;
      a11yFixes.forEach(fix => {
        report += `  - ${fix.file}: ${fix.description}\n`;
      });
    }

    return report;
  }

  run(instruction) {
    this.log(`🔧 Instruction reçue: ${instruction}`);
    
    const analysis = this.analyzeInstruction(instruction);
    this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

    // Analyser les rapports de test récents
    if (analysis.fixAll || analysis.needsTestFixes) {
      const testReports = this.findTestReports();
      if (testReports.length > 0) {
        this.log(`📄 ${testReports.length} rapport(s) de test trouvé(s)`, 'info');
        
        for (const report of testReports) {
          const failedTests = report.data.results.filter(r => !r.success);
          if (failedTests.length > 0) {
            this.log(`❌ ${failedTests.length} test(s) échoué(s) dans ${report.path}`, 'warning');
            this.issues.push(...failedTests);
          }
        }
      }
    }

    // Corriger les problèmes de linting
    if (analysis.fixAll || analysis.needsLintFixes) {
      const lintIssues = this.findLintIssues();
      if (lintIssues.length > 0) {
        this.fixLintIssues(lintIssues);
      }
    }

    // Corriger les problèmes CSS
    if (analysis.fixAll || analysis.needsCSSFixes) {
      this.fixCSSIssues();
    }

    // Corriger les problèmes JavaScript
    if (analysis.fixAll || analysis.needsJSFixes) {
      this.fixJavaScriptIssues();
    }

    // Corriger les problèmes d'accessibilité
    if (analysis.fixAll || analysis.needsAccessibilityFixes) {
      this.fixAccessibilityIssues();
    }

    // Générer le rapport
    const report = this.generateFixReport();
    this.log(report, 'info');

    // Sauvegarder le rapport
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `tools/logs/fixer-report-${timestamp}.json`;
    
    const fullReport = {
      timestamp: new Date().toISOString(),
      instruction,
      analysis,
      fixes: this.fixes,
      issues: this.issues,
      summary: {
        totalFixes: this.fixes.length,
        totalIssues: this.issues.length,
        lintFixes: this.fixes.filter(f => f.type === 'lint').length,
        cssFixes: this.fixes.filter(f => f.type === 'css').length,
        jsFixes: this.fixes.filter(f => f.type === 'javascript').length,
        a11yFixes: this.fixes.filter(f => f.type === 'accessibility').length
      }
    };

    fileBridge.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
    this.log(`📄 Rapport sauvegardé: ${reportPath}`, 'success');

    this.log(`✅ ${this.fixes.length} correction(s) appliquée(s) avec succès`, 'success');
  }
}

// Exécution de l'agent
const args = process.argv.slice(2);
const instruction = args.join(' ');

if (!instruction) {
  console.error('❌ Instruction requise');
  process.exit(1);
}

const agent = new FixerAgent();
agent.run(instruction);
