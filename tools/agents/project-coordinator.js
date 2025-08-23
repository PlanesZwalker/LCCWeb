#!/usr/bin/env node

const fileBridge = require('../file-bridge');
const path = require('path');

class ProjectCoordinator {
  constructor() {
    this.agentName = 'project-coordinator';
    // Logical projects mapped to actual paths in this repo
    this.projectMap = {
      'website': { type: 'site', roots: ['public'] },
      'babylon-3d': { type: 'game', html: ['public/unified-3d-game.html'] },
      'threejs-3d': { type: 'game', html: ['public/threejs-3d-game.html'] },
      'js2d-classic': { type: 'game', html: ['public/classic-2d-game.html'] }
    };
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🎯 ${this.agentName}: ${message}`);
  }

  analyzeInstruction(instruction) {
    const keywords = {
      analyze: ['analyse', 'analyze', 'audit', 'état', 'status', 'rapport'],
      roadmap: ['roadmap', 'plan', 'planning', 'stratégie', 'strategy'],
      sync: ['sync', 'synchroniser', 'uniformiser', 'cohérence', 'coherence'],
      test: ['test', 'tester', 'validation', 'vérification'],
      deploy: ['deploy', 'déployer', 'release', 'publication']
    };

    const analysis = {
      needsAnalysis: false,
      needsRoadmap: false,
      needsSync: false,
      needsTesting: false,
      needsDeployment: false,
      priority: 'medium'
    };

    const lowerInstruction = instruction.toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerInstruction.includes(word))) {
        if (category === 'analyze') {
          analysis.needsAnalysis = true;
        } else {
          analysis[`needs${category.charAt(0).toUpperCase() + category.slice(1)}`] = true;
        }
      }
    }

    // Déterminer la priorité
    if (analysis.needsAnalysis && analysis.needsRoadmap) analysis.priority = 'high';
    if (analysis.needsTesting) analysis.priority = 'high';
    if (analysis.needsDeployment) analysis.priority = 'high';

    return analysis;
  }

  getProjectStatus() {
    const status = {};
    const root = process.env.PROJECT_ROOT || '.';

    for (const [logicalName, info] of Object.entries(this.projectMap)) {
      let exists = false;
      let files = [];

      if (info.type === 'site') {
        // Site exists if public directory exists and index.html present
        const pubPath = path.join(root, info.roots[0]);
        const indexPath = path.join(pubPath, 'index.html');
        exists = fileBridge.fileExists(pubPath) && fileBridge.fileExists(indexPath);
        if (exists) {
          // Count key site files
          const candidates = ['index.html', 'rules.html', 'sitemap.html', 'technical-spec.html', 'docs/index.html'];
          files = candidates.filter(p => fileBridge.fileExists(path.join(pubPath, p)));
        }
      } else if (info.type === 'game') {
        // Game exists if its main HTML exists
        files = (info.html || []).filter(p => fileBridge.fileExists(path.join(root, p)));
        exists = files.length > 0;
      }

      status[logicalName] = {
        exists,
        fileCount: files.length,
        files: files.slice(0, 5),
        lastModified: exists ? this.getLastModified(path.join(root, (info.roots && info.roots[0]) || path.dirname((info.html||[''])[0]||'.'))) : null
      };
    }

    return status;
  }

  getLastModified(dirPath) {
    try {
      const stats = require('fs').statSync(dirPath);
      return stats.mtime;
    } catch (error) {
      return null;
    }
  }

  generateProjectReport() {
    const status = this.getProjectStatus();
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProjects: Object.keys(this.projectMap).length,
        existingProjects: Object.values(status).filter(p => p.exists).length,
        totalFiles: Object.values(status).reduce((sum, p) => sum + p.fileCount, 0)
      },
      projects: status,
      recommendations: []
    };

    // Analyser et générer des recommandations
    for (const [projectName, projectStatus] of Object.entries(status)) {
      if (!projectStatus.exists) {
        report.recommendations.push(`Vérifier la présence des fichiers requis pour ${projectName}`);
      } else if (projectStatus.fileCount === 0) {
        report.recommendations.push(`Initialiser les fichiers de base pour ${projectName}`);
      }
    }

    return report;
  }

  // Parse screenshot report JSON(s) and build actionable TODO updates and agent assignments
  consumeScreenshotReports(reportPaths) {
    const fs = require('fs');
    const assignments = {};
    const todos = [];
    const interAgent = [];
    for (const rpt of reportPaths) {
      try {
        if (!fileBridge.fileExists(rpt)) continue;
        const data = JSON.parse(fileBridge.readFile(rpt));
        const comments = data.agentComments || {};
        for (const [agent, items] of Object.entries(comments)) {
          if (!assignments[agent]) assignments[agent] = [];
          assignments[agent].push(...items);
        }
        // Derive TODO entries per screenshot/log presence
        (data.screenshots || []).forEach(s => {
          if (s.logPath) {
            todos.push(`Analyser les logs ${s.logPath} et corriger les erreurs éventuelles sur ${s.url}`);
          }
        });
      } catch (e) {
        this.log(`⚠️ Erreur lecture rapport ${rpt}: ${e.message}`);
      }
    }

    // Merge inter-agent comments into a concise Markdown summary for IDE
    try {
      const fs = require('fs');
      const busPath = path.join('.agents', 'reports', 'interagent-comments.jsonl');
      if (fs.existsSync(busPath)) {
        const lines = fs.readFileSync(busPath, 'utf8').split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          try { interAgent.push(JSON.parse(line)); } catch (_) {}
        }
        // Build summary.md
        const groups = interAgent.reduce((acc, e) => {
          const key = `${e.targetAgent}`;
          acc[key] = acc[key] || [];
          acc[key].push(e);
          return acc;
        }, {});
        let md = `# Inter-Agent Summary (${new Date().toISOString()})\n\n`;
        for (const [agent, items] of Object.entries(groups)) {
          md += `## ${agent}\n`;
          for (const it of items.slice(0, 50)) {
            md += `- [${it.severity}] ${it.message}${it.url ? ` — ${it.url}` : ''}${it.suggestion ? `\n  Suggestion: ${it.suggestion}` : ''}\n`;
          }
          md += `\n`;
        }
        const outDir = path.join('.agents', 'reports');
        try { fs.mkdirSync(outDir, { recursive: true }); } catch {}
        const mdPath = path.join(outDir, 'interagent-summary.md');
        fs.writeFileSync(mdPath, md, 'utf8');
        this.log(`🧵 Résumé inter-agents généré: ${mdPath}`);
      }
    } catch (e) {
      this.log(`⚠️ Erreur génération résumé inter-agents: ${e.message}`);
    }

    // Persist assignments
    const outDir = path.join('tools', 'logs');
    try { require('fs').mkdirSync(outDir, { recursive: true }); } catch {}
    const outPath = path.join(outDir, `agent-assignments-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
    fileBridge.writeFile(outPath, JSON.stringify({ assignments, todos }, null, 2));
    this.log(`📄 Assignations agents sauvegardées: ${outPath}`);

    // Update/append TODO file
    const todoFile = 'FINAL-TODO-LIST.md';
    const header = `\n\n## Mises à jour automatiques (${new Date().toISOString()})\n`;
    const body = todos.length ? todos.map(t => `- [ ] ${t}`).join('\n') + '\n' : '- [ ] Revue visuelle générale\n';
    const current = fileBridge.fileExists(todoFile) ? fileBridge.readFile(todoFile) : '# TODO\n';
    fileBridge.writeFile(todoFile, current + header + body);

    return { outPath, todoFile };
  }

  createRoadmap() {
    const status = this.getProjectStatus();
    const roadmap = {
      phase1: {
        name: 'Analyse et Audit',
        tasks: [],
        duration: '1-2 jours'
      },
      phase2: {
        name: 'Développement Core',
        tasks: [],
        duration: '3-5 jours'
      },
      phase3: {
        name: 'Optimisation et Polish',
        tasks: [],
        duration: '2-3 jours'
      },
      phase4: {
        name: 'Tests et Déploiement',
        tasks: [],
        duration: '1-2 jours'
      }
    };

    // Remplir les phases selon l'état des projets
    for (const [projectName, projectStatus] of Object.entries(status)) {
      if (!projectStatus.exists) {
        roadmap.phase1.tasks.push(`Créer la structure de base pour ${projectName}`);
        roadmap.phase2.tasks.push(`Développer les fonctionnalités core de ${projectName}`);
      } else if (projectStatus.fileCount < 3) {
        roadmap.phase1.tasks.push(`Auditer et compléter ${projectName}`);
        roadmap.phase2.tasks.push(`Finaliser le développement de ${projectName}`);
      } else {
        roadmap.phase2.tasks.push(`Optimiser les performances de ${projectName}`);
        roadmap.phase3.tasks.push(`Ajouter les effets visuels à ${projectName}`);
      }
    }

    // Tâches communes
    roadmap.phase1.tasks.push('Audit complet de l\'architecture');
    roadmap.phase2.tasks.push('Synchroniser les assets entre projets');
    roadmap.phase3.tasks.push('Moderniser l\'interface utilisateur');
    roadmap.phase4.tasks.push('Tests E2E complets');
    roadmap.phase4.tasks.push('Déploiement et documentation');

    return roadmap;
  }

  syncSharedAssets() {
    const sharedAssets = {
      'public/assets': ['textures', 'models', 'sounds', 'images'],
      'public/css': ['styles.css', 'themes.css'],
      'public/js': ['utils.js', 'constants.js']
    };

    let syncCount = 0;
    
    for (const [assetDir, assets] of Object.entries(sharedAssets)) {
      for (const asset of assets) {
        const assetPath = path.join(assetDir, asset);
        if (fileBridge.fileExists(assetPath)) {
          // Copier vers chaque projet
          for (const project of this.projects) {
            const targetPath = path.join(project, assetDir, asset);
            try {
              const content = fileBridge.readFile(assetPath);
              fileBridge.writeFile(targetPath, content);
              syncCount++;
              this.log(`✅ Synchronisé: ${assetPath} → ${targetPath}`);
            } catch (error) {
              this.log(`⚠️ Erreur synchronisation: ${assetPath} → ${targetPath}`);
            }
          }
        }
      }
    }

    return syncCount;
  }

  runTests() {
    const testCommands = [
      'npm test',
      'npm run test:e2e',
      'npm run lint'
    ];

    const results = [];
    
    for (const command of testCommands) {
      try {
        const { execSync } = require('child_process');
        const output = execSync(command, { 
          cwd: process.env.PROJECT_ROOT || '.',
          encoding: 'utf8',
          stdio: 'pipe'
        });
        results.push({ command, success: true, output });
        this.log(`✅ Test réussi: ${command}`);
      } catch (error) {
        results.push({ command, success: false, error: error.message });
        this.log(`❌ Test échoué: ${command}`);
      }
    }

    return results;
  }

  run(instruction) {
    this.log(`🧠 Instruction reçue: ${instruction}`);
    
    const analysis = this.analyzeInstruction(instruction);
    this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

    if (analysis.needsAnalysis) {
      this.log('📋 Génération du rapport d\'état des projets...');
      const report = this.generateProjectReport();
      
      console.log('\n📊 RAPPORT D\'ÉTAT DES PROJETS');
      console.log('================================');
      console.log(`📅 Généré le: ${report.timestamp}`);
      console.log(`📁 Projets existants: ${report.summary.existingProjects}/${report.summary.totalProjects}`);
      console.log(`📄 Fichiers totaux: ${report.summary.totalFiles}`);
      
      console.log('\n📂 Détail par projet:');
      for (const [projectName, projectStatus] of Object.entries(report.projects)) {
        const status = projectStatus.exists ? '✅' : '❌';
        console.log(`   ${status} ${projectName}: ${projectStatus.fileCount} fichiers`);
      }
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommandations:');
        report.recommendations.forEach(rec => console.log(`   • ${rec}`));
      }
      // If instruction contains screenshot report paths, consume them
      let reportPaths = (instruction.match(/(?:(?:tools|\.agents\/logs\/screenshots)\/[\w\-\/]+)?screenshot-report-[\w\-]+\.json/g) || []);
      // Auto-discovery fallback: pick latest report from .agents and tools locations
      if (reportPaths.length === 0) {
        const fs = require('fs');
        const candidates = [];
        const pushLatest = (baseDir) => {
          try {
            if (!fs.existsSync(baseDir)) return;
            const files = [];
            const walk = (p) => {
              const items = fs.readdirSync(p, { withFileTypes: true });
              for (const it of items) {
                const ip = require('path').join(p, it.name);
                if (it.isDirectory()) walk(ip);
                else if (/screenshot-report-[\w\-]+\.json$/.test(it.name)) files.push(ip.replace(/\\/g, '/'));
              }
            };
            walk(baseDir);
            files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
            if (files[0]) candidates.push(files[0]);
          } catch (_) {}
        };
        pushLatest('.agents/logs/screenshots');
        pushLatest('tools/screenshots');
        if (candidates.length) reportPaths = [candidates[0]];
      }
      if (reportPaths.length) {
        const result = this.consumeScreenshotReports(reportPaths);
        console.log(`\n📦 Données distribuées aux agents. Assignations: ${result.outPath}`);
        console.log(`📝 TODO mis à jour: ${result.todoFile}`);
      }
    }

    if (analysis.needsRoadmap) {
      this.log('🗺️ Génération de la roadmap...');
      const roadmap = this.createRoadmap();
      
      console.log('\n🗺️ ROADMAP DE DÉVELOPPEMENT');
      console.log('============================');
      
      for (const [phaseKey, phase] of Object.entries(roadmap)) {
        console.log(`\n📋 ${phase.name} (${phase.duration})`);
        phase.tasks.forEach(task => console.log(`   • ${task}`));
      }
    }

    if (analysis.needsSync) {
      this.log('🔄 Synchronisation des assets partagés...');
      const syncCount = this.syncSharedAssets();
      console.log(`\n✅ ${syncCount} asset(s) synchronisé(s) entre les projets`);
    }

    if (analysis.needsTesting) {
      this.log('🧪 Lancement des tests...');
      const testResults = this.runTests();
      
      console.log('\n🧪 RÉSULTATS DES TESTS');
      console.log('=====================');
      testResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.command}`);
        if (!result.success) {
          console.log(`   Erreur: ${result.error}`);
        }
      });
    }

    if (analysis.needsDeployment) {
      this.log('🚀 Préparation du déploiement...');
      console.log('\n🚀 CHECKLIST DE DÉPLOIEMENT');
      console.log('==========================');
      console.log('   • Vérifier que tous les tests passent');
      console.log('   • Optimiser les assets (images, sons)');
      console.log('   • Minifier le code JavaScript et CSS');
      console.log('   • Vérifier la compatibilité navigateur');
      console.log('   • Préparer la documentation utilisateur');
      console.log('   • Configurer l\'environnement de production');
    }

    this.log('🎯 Coordination terminée');
  }
}

// Exécution de l'agent
const args = process.argv.slice(2);
const instruction = args.join(' ');

if (!instruction) {
  console.error('❌ Instruction requise');
  process.exit(1);
}

const agent = new ProjectCoordinator();
agent.run(instruction);
