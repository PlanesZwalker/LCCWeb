#!/usr/bin/env node

const fileBridge = require('../file-bridge');
const path = require('path');
const fs = require('fs');
const ProjectStructure = require('../project-structure');
const pathToConsole = require('path');
let ollama = null;
let getModelForAgent = null;
try { ollama = require('../llm/ollama-client'); } catch (_) {}
try { ({ getModelForAgent } = require('../llm/model-routing')); } catch (_) {}

class BaseAgent {
  constructor(agentName) {
    this.agentName = agentName;
    this.errors = [];
    this.warnings = [];
    this.changes = [];
    this.backups = [];
    this.projectStructure = new ProjectStructure();
    this.interAgentCommentsPath = path.join('.agents', 'reports', 'interagent-comments.jsonl');
    this.runLogPath = null;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    };
    const line = `[${timestamp}] ${emoji[level]} ${this.agentName}: ${message}`;
    console.log(line);
    try {
      if (!this.runLogPath) {
        const dir = path.join('.agents', 'logs', 'console');
        if (!require('fs').existsSync(dir)) {
          require('fs').mkdirSync(dir, { recursive: true });
        }
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        this.runLogPath = path.join(dir, `${this.agentName}-${ts}.log`);
      }
      require('fs').appendFileSync(this.runLogPath, line + '\n', 'utf8');
    } catch (_) {}

    // Mirror into JSONL console so UI sees it in real-time
    try {
      const dir = path.join('.agents', 'logs', 'console');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const lineObj = { timestamp, agent: this.agentName, role: 'agent', phase: level.toUpperCase(), text: message };
      fs.appendFileSync(path.join(dir, 'latest.log'), JSON.stringify(lineObj) + '\n', 'utf8');
    } catch (_) {}
  }

  // Validation des fichiers avant modification
  validateFile(filePath) {
    if (!filePath) {
      this.log('Chemin de fichier manquant', 'error');
      return false;
    }

    if (!fileBridge.fileExists(filePath)) {
      this.log(`Fichier introuvable: ${filePath}`, 'error');
      return false;
    }

    const content = fileBridge.readFile(filePath);
    if (content === null) {
      this.log(`Impossible de lire le fichier: ${filePath}`, 'error');
      return false;
    }

    return true;
  }

  // Unified Ollama chat for all agents, with model routing and JSONL logging
  async ollamaChat({ system, user, purpose = null, modelOverride = null, temperature = null }) {
    if (!ollama) {
      this.log('Ollama client not available', 'warning');
      return null;
    }
    const model = modelOverride || (getModelForAgent ? getModelForAgent(this.agentName, purpose) : (process.env.OLLAMA_DEFAULT_MODEL || 'qwen2.5-coder:32b'));
    const temp = temperature != null ? Number(temperature) : Number(process.env.OLLAMA_TEMPERATURE || 0.2);
    try {
      const content = await ollama.chat({ model, messages: [
        { role: 'system', content: system || '' },
        { role: 'user', content: user || '' }
      ], options: { temperature: temp } });
      // Log model + short preview
      this.log(`OLLAMA[${model}] → ${String(content).slice(0, 120)}…`, 'info');
      try {
        const dir = path.join('.agents', 'logs', 'console');
        const entry = { timestamp: new Date().toISOString(), agent: this.agentName, role: 'agent', phase: 'ANSWER', model, text: content };
        fs.appendFileSync(path.join(dir, 'latest.log'), JSON.stringify(entry) + '\n', 'utf8');
      } catch (_) {}
      return content;
    } catch (e) {
      this.log(`Ollama error (${model}): ${e.message}`, 'error');
      return null;
    }
  }

  // Validation du contenu CSS avant modification
  validateCSS(css, filePath) {
    const errors = [];
    
    // Vérifier les accolades non fermées
    const openBraces = (css.match(/\{/g) || []).length;
    const closeBraces = (css.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Accolades non équilibrées: ${openBraces} ouvertes, ${closeBraces} fermées`);
    }

    // Heuristique stricte désactivée pour éviter les faux positifs sur sélecteurs

    // Vérifier les propriétés CSS invalides
    const invalidProperties = css.match(/[a-z-]+:\s*[^;]*;/g);
    if (invalidProperties) {
      for (const prop of invalidProperties) {
        if (!prop.includes(':')) {
          errors.push(`Propriété CSS invalide: ${prop}`);
        }
      }
    }

    if (errors.length > 0) {
      this.log(`Erreurs CSS détectées dans ${filePath}:`, 'error');
      errors.forEach(error => this.log(`  - ${error}`, 'error'));
      return false;
    }

    return true;
  }

  // Sauvegarde sécurisée avec validation
  safeBackup(filePath) {
    try {
      const backupPath = fileBridge.backupFile(filePath);
      this.backups.push({ original: filePath, backup: backupPath });
      this.log(`Sauvegarde créée: ${backupPath}`, 'success');
      return backupPath;
    } catch (error) {
      this.log(`Erreur lors de la sauvegarde: ${error.message}`, 'error');
      return null;
    }
  }

  // Écriture sécurisée avec validation
  safeWrite(filePath, content, originalContent) {
    try {
      // Validation du contenu avant écriture
      if (filePath.endsWith('.css')) {
        if (!this.validateCSS(content, filePath)) {
          this.log(`Contenu CSS invalide détecté, annulation de l'écriture`, 'error');
          return false;
        }
      }

      // Comparaison pour éviter les écritures inutiles
      if (content === originalContent) {
        this.log(`Aucun changement détecté, écriture ignorée`, 'info');
        return true;
      }

      fileBridge.writeFile(filePath, content);
      this.changes.push({
        file: filePath,
        type: 'modification',
        timestamp: new Date().toISOString()
      });
      
      this.log(`Fichier modifié avec succès: ${filePath}`, 'success');
      return true;
    } catch (error) {
      this.log(`Erreur lors de l'écriture: ${error.message}`, 'error');
      return false;
    }
  }

  // Restauration sécurisée
  safeRestore(filePath) {
    const backup = this.backups.find(b => b.original === filePath);
    if (backup && fileBridge.fileExists(backup.backup)) {
      try {
        const backupContent = fileBridge.readFile(backup.backup);
        fileBridge.writeFile(filePath, backupContent);
        this.log(`Fichier restauré: ${filePath}`, 'success');
        return true;
      } catch (error) {
        this.log(`Erreur lors de la restauration: ${error.message}`, 'error');
        return false;
      }
    }
    return false;
  }

  // Validation des modifications CSS
  validateCSSModification(originalCSS, modifiedCSS, filePath) {
    const errors = [];

    // Vérifier que le CSS modifié est valide; tenter une auto-réparation structurelle
    let candidate = modifiedCSS;
    if (!this.validateCSS(candidate, filePath)) {
      candidate = this.validateAndFixCSSStructure(candidate);
      if (!this.validateCSS(candidate, filePath)) {
        errors.push('CSS modifié contient des erreurs de syntaxe');
      }
    }

    // Vérifier que les variables CSS sont bien définies
    const cssVars = modifiedCSS.match(/--[a-z-]+:/g) || [];
    const rootBlocks = modifiedCSS.match(/:root\s*\{/g) || [];
    
    if (cssVars.length > 0 && rootBlocks.length === 0) {
      errors.push('Variables CSS définies en dehors d\'un bloc :root');
    }

    // Vérifier l'équilibre des accolades
    const openBraces = (modifiedCSS.match(/\{/g) || []).length;
    const closeBraces = (modifiedCSS.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Accolades non équilibrées: ${openBraces} ouvertes, ${closeBraces} fermées`);
    }

    // Éviter faux positifs: ne signaler que des doublons consécutifs au même niveau
    const lines = candidate.split(/\n/);
    let lastSelector = null;
    for (const line of lines) {
      const m = line.match(/^\s*([^@}{][^{}]+)\s*\{/);
      if (m) {
        const sel = m[1].replace(/\s+/g, ' ').trim();
        if (lastSelector === sel) {
          errors.push(`Sélecteur dupliqué consécutif: ${sel}`);
          break;
        }
        lastSelector = sel;
      } else if (/}/.test(line)) {
        lastSelector = null;
      }
    }

    if (errors.length > 0) {
      this.log(`Erreurs de validation détectées dans ${filePath}:`, 'error');
      errors.forEach(error => this.log(`  - ${error}`, 'error'));
      return false;
    }

    return true;
  }

  // Méthode pour appliquer des modifications CSS de manière sécurisée
  applyCSSModification(filePath, modificationFunction, description) {
    if (!this.validateFile(filePath)) {
      return false;
    }

    const originalCSS = fileBridge.readFile(filePath);
    
    // Sauvegarde avant modification
    const backupPath = this.safeBackup(filePath);
    if (!backupPath) {
      return false;
    }

    try {
      // Appliquer la modification
      const modifiedCSS = modificationFunction(originalCSS);
      
      // Validation de la modification
      if (!this.validateCSSModification(originalCSS, modifiedCSS, filePath)) {
        this.log(`Validation échouée pour ${description}, restauration...`, 'warning');
        this.safeRestore(filePath);
        return false;
      }

      // Écriture sécurisée
      if (this.safeWrite(filePath, modifiedCSS, originalCSS)) {
        this.log(`${description} appliqué avec succès`, 'success');
        return true;
      } else {
        this.safeRestore(filePath);
        return false;
      }
    } catch (error) {
      this.log(`Erreur lors de l'application de ${description}: ${error.message}`, 'error');
      this.safeRestore(filePath);
      return false;
    }
  }

  // Méthode générique pour appliquer des modifications de texte (JS/HTML/etc.) sans validation CSS
  applyTextModification(filePath, modificationFunction, description) {
    if (!this.validateFile(filePath)) {
      return false;
    }

    const original = fileBridge.readFile(filePath);

    // Sauvegarde avant modification
    const backupPath = this.safeBackup(filePath);
    if (!backupPath) {
      return false;
    }

    try {
      const modified = modificationFunction(original);
      if (this.safeWrite(filePath, modified, original)) {
        this.log(`${description} appliqué avec succès`, 'success');
        return true;
      } else {
        this.safeRestore(filePath);
        return false;
      }
    } catch (error) {
      this.log(`Erreur lors de l'application de ${description}: ${error.message}`, 'error');
      this.safeRestore(filePath);
      return false;
    }
  }

  // Méthode pour nettoyer les variables CSS dupliquées
  cleanDuplicateCSSVars(css) {
    const lines = css.split('\n');
    const cleanedLines = [];
    const seenVars = new Set();
    let inRootBlock = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Détecter le début d'un bloc :root
      if (trimmedLine.startsWith(':root')) {
        inRootBlock = true;
        cleanedLines.push(line);
        continue;
      }

      // Détecter la fin d'un bloc :root
      if (inRootBlock && trimmedLine === '}') {
        inRootBlock = false;
        cleanedLines.push(line);
        continue;
      }

      // Dans un bloc :root, vérifier les variables dupliquées
      if (inRootBlock && trimmedLine.startsWith('--')) {
        const varName = trimmedLine.split(':')[0].trim();
        if (!seenVars.has(varName)) {
          seenVars.add(varName);
          cleanedLines.push(line);
        } else {
          this.log(`Variable CSS dupliquée supprimée: ${varName}`, 'warning');
        }
      } else {
        cleanedLines.push(line);
      }
    }

    return cleanedLines.join('\n');
  }

  // Méthode pour valider et corriger la structure CSS
  validateAndFixCSSStructure(css) {
    let fixedCSS = css;

    // Nettoyer les variables dupliquées
    fixedCSS = this.cleanDuplicateCSSVars(fixedCSS);

    // S'assurer que les variables CSS sont dans un bloc :root
    const cssVars = fixedCSS.match(/--[a-z-]+:/g) || [];
    const rootBlocks = fixedCSS.match(/:root\s*\{/g) || [];
    
    if (cssVars.length > 0 && rootBlocks.length === 0) {
      // Créer un bloc :root s'il n'existe pas
      const rootVars = cssVars.map(varName => {
        const line = fixedCSS.match(new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^;]*;`));
        return line ? line[0] : '';
      }).filter(Boolean);

      if (rootVars.length > 0) {
        const rootBlock = `:root {\n  ${rootVars.join('\n  ')}\n}\n\n`;
        fixedCSS = rootBlock + fixedCSS.replace(/--[a-z-]+:[^;]*;/g, '');
        this.log('Bloc :root créé pour les variables CSS', 'warning');
      }
    }

    return fixedCSS;
  }

  // Méthode pour générer un rapport d'erreurs
  generateErrorReport() {
    if (this.errors.length === 0 && this.warnings.length === 0) {
      return 'Aucune erreur ou avertissement détecté';
    }

    let report = `\n📊 Rapport d'erreurs pour ${this.agentName}:\n`;
    
    if (this.errors.length > 0) {
      report += `\n❌ Erreurs (${this.errors.length}):\n`;
      this.errors.forEach((error, index) => {
        report += `  ${index + 1}. ${error}\n`;
      });
    }

    if (this.warnings.length > 0) {
      report += `\n⚠️ Avertissements (${this.warnings.length}):\n`;
      this.warnings.forEach((warning, index) => {
        report += `  ${index + 1}. ${warning}\n`;
      });
    }

    return report;
  }

  // Méthode pour nettoyer en cas d'erreur
  cleanup() {
    if (this.errors.length > 0) {
      this.log('Nettoyage en cours...', 'warning');
      this.backups.forEach(backup => {
        if (fileBridge.fileExists(backup.backup)) {
          this.safeRestore(backup.original);
        }
      });
    }
  }

  // Canal de commentaires inter-agents (JSONL pour ingestion facile)
  emitInterAgentComment(targetAgent, context) {
    try {
      const dir = path.dirname(this.interAgentCommentsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const entry = {
        timestamp: new Date().toISOString(),
        sourceAgent: this.agentName,
        targetAgent,
        severity: context.severity || 'info',
        url: context.url || null,
        file: context.file || null,
        image: context.image || null,
        log: context.log || null,
        message: context.message || '',
        suggestion: context.suggestion || null,
        tags: context.tags || [],
        threadId: context.threadId || null,
        related: context.related || [],
        // Collaboration primitives
        type: context.type || 'note', // 'note' | 'question' | 'answer' | 'assignment'
        channel: context.channel || 'default',
        requestId: context.requestId || null,
        replyTo: context.replyTo || null,
        conversationId: context.conversationId || context.threadId || null
      };
      fs.appendFileSync(this.interAgentCommentsPath, JSON.stringify(entry) + '\n', 'utf8');
      this.log(`🧵 Commentaire inter-agent → ${targetAgent}: ${entry.message}`, 'info');
    } catch (err) {
      this.log(`Erreur émission commentaire inter-agent: ${err.message}`, 'warning');
    }
  }

  // Read inter-agent comments with simple filters
  readInterAgentComments(filter = {}) {
    try {
      if (!fs.existsSync(this.interAgentCommentsPath)) return [];
      const lines = fs.readFileSync(this.interAgentCommentsPath, 'utf8').split(/\r?\n/).filter(Boolean);
      const entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      return entries.filter(e => {
        if (filter.targetAgent && e.targetAgent !== filter.targetAgent) return false;
        if (filter.sourceAgent && e.sourceAgent !== filter.sourceAgent) return false;
        if (filter.type && e.type !== filter.type) return false;
        if (filter.requestId && e.requestId !== filter.requestId) return false;
        if (filter.replyTo && e.replyTo !== filter.replyTo) return false;
        if (filter.threadId && e.threadId !== filter.threadId) return false;
        return true;
      });
    } catch (_) { return []; }
  }

  // Ask a question to another agent and return a correlation id
  askAgentQuestion(targetAgent, message, { url = null, file = null, tags = [], channel = 'default' } = {}) {
    const requestId = `${this.agentName}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    this.emitInterAgentComment(targetAgent, {
      type: 'question',
      message,
      url,
      file,
      tags,
      channel,
      requestId
    });
    return requestId;
  }

  // Answer a question by request id
  answerAgent(requestId, message, { suggestion = null, channel = 'default' } = {}) {
    this.emitInterAgentComment('project-coordinator', {
      type: 'answer',
      message,
      suggestion,
      replyTo: requestId,
      channel
    });
  }

  // Méthodes pour la structure du projet
  async getProjectStructure() {
    if (!this.projectStructure.isUpToDate()) {
      this.log('🔄 Actualisation de la structure du projet...', 'info');
      await this.projectStructure.refresh();
    }
    return this.projectStructure;
  }

  async getGameUrls() {
    const structure = await this.getProjectStructure();
    return structure.getGameUrls();
  }

  async getPageUrls() {
    const structure = await this.getProjectStructure();
    return structure.getPageUrls();
  }

  async getAllUrls() {
    const structure = await this.getProjectStructure();
    return structure.getAllUrls();
  }

  async getAssetsByType(type) {
    const structure = await this.getProjectStructure();
    return structure.getAssetsByType(type);
  }

  async findFilesByExtension(extension, baseDir = '') {
    const structure = await this.getProjectStructure();
    return structure.findFilesByExtension(extension, baseDir);
  }

  async getGames() {
    const structure = await this.getProjectStructure();
    return structure.games;
  }

  async getPages() {
    const structure = await this.getProjectStructure();
    return structure.pages;
  }

  async getStructure() {
    const structure = await this.getProjectStructure();
    return structure.getStructure();
  }
}

module.exports = BaseAgent;
