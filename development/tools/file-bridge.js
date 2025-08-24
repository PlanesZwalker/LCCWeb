#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class FileBridge {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.logFile = path.join(__dirname, 'logs', 'file-bridge.log');
    this.ensureLogDir();
    this.agentIgnore = this.loadAgentIgnore();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(action, filePath, details = '') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${action}: ${filePath} ${details}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  resolvePath(relativePath) {
    return path.resolve(this.projectRoot, relativePath);
  }

  loadAgentIgnore() {
    try {
      const p = path.resolve(this.projectRoot, '.agentignore');
      if (!fs.existsSync(p)) return [];
      const raw = fs.readFileSync(p, 'utf8');
      return raw
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'))
        .map(l => l.replace(/\\/g, '/'));
    } catch (_) {
      return [];
    }
  }

  shouldIgnore(relOrAbsPath) {
    try {
      const full = path.isAbsolute(relOrAbsPath)
        ? relOrAbsPath.replace(/\\/g, '/')
        : this.resolvePath(relOrAbsPath).replace(/\\/g, '/');
      const root = this.projectRoot.replace(/\\/g, '/');
      const rel = full.startsWith(root) ? full.slice(root.length + 1) : full;

      const escapeRegex = (s) => s.replace(/[.+^${}()|[\]\\]/g, r => `\\${r}`);
      const globToRegex = (glob) => {
        // Normalize leading ./ and //
        let g = glob.replace(/^\.*\/?/, '');
        // Escape special, then replace ** and *
        g = escapeRegex(g)
          .replace(/\\\\\*\\\\\*/g, '.*') // "**" -> .*
          .replace(/\\\\\*/g, '[^/]*');       // "*" -> any except '/'
        // Allow directory prefix patterns to match descendants
        return new RegExp('^' + g + '$');
      };

      for (const pat of this.agentIgnore) {
        if (!pat) continue;
        const hasGlob = pat.includes('*');
        if (hasGlob) {
          const re = globToRegex(pat);
          if (re.test(rel)) return true;
        } else {
          const patNorm = pat.replace(/^[./]+/, '');
          if (!patNorm) continue;
          // Treat as directory/file prefix ignore
          if (rel === patNorm || rel.startsWith(patNorm + '/') ) return true;
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  fileExists(filePath) {
    const fullPath = this.resolvePath(filePath);
    const exists = fs.existsSync(fullPath);
    this.log('CHECK_EXISTS', filePath, exists ? 'EXISTS' : 'NOT_FOUND');
    return exists;
  }

  readFile(filePath) {
    const fullPath = this.resolvePath(filePath);
    if (!this.fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    this.log('READ', filePath, `Size: ${content.length} chars`);
    return content;
  }

  writeFile(filePath, content) {
    const fullPath = this.resolvePath(filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    this.log('WRITE', filePath, `Size: ${content.length} chars`);
  }

  listFiles(dirPath, pattern = null) {
    const fullPath = this.resolvePath(dirPath);
    if (!fs.existsSync(fullPath)) {
      return [];
    }
    
    const files = fs.readdirSync(fullPath, { withFileTypes: true });
    let result = files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.join(dirPath, file.name)
    }));
    // Filter ignored
    result = result.filter(entry => !this.shouldIgnore(entry.path));
    
    if (pattern) {
      // Support simple wildcard like *.html and raw regex patterns
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let regex;
      if (pattern.includes('*')) {
        const parts = pattern.split('*').map(p => escapeRegex(p));
        const regexStr = `^${parts.join('.*')}$`;
        regex = new RegExp(regexStr);
      } else {
        regex = new RegExp(pattern);
      }
      result = result.filter(file => regex.test(file.name));
    }
    
    this.log('LIST', dirPath, `Found ${result.length} files`);
    return result;
  }

  backupFile(filePath) {
    const fullPath = this.resolvePath(filePath);
    const relFromRoot = fullPath.replace(this.projectRoot + path.sep, '').replace(/\\/g, '/');
    const backupRoot = path.join(this.projectRoot, '.agents', 'backups');
    const backupRel = relFromRoot + `.backup.${Date.now()}`;
    const backupFull = path.join(backupRoot, backupRel);
    const backupDir = path.dirname(backupFull);

    if (this.fileExists(filePath)) {
      const content = this.readFile(filePath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(backupFull, content, 'utf8');
      this.log('BACKUP', filePath, `Backup: ${backupFull}`);
      return backupFull;
    }
    return null;
  }

  restoreFile(filePath, backupPath) {
    if (fs.existsSync(backupPath)) {
      const content = fs.readFileSync(backupPath, 'utf8');
      this.writeFile(filePath, content);
      this.log('RESTORE', filePath, `From: ${backupPath}`);
      return true;
    }
    return false;
  }

  deleteFile(filePath) {
    const fullPath = this.resolvePath(filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      this.log('DELETE', filePath, 'DELETED');
      return true;
    }
    this.log('DELETE', filePath, 'NOT_FOUND');
    return false;
  }

  // Méthodes spécialisées pour les projets de jeu
  findGameFiles(projectName) {
    const projectPath = path.join(this.projectRoot, projectName);
    if (!fs.existsSync(projectPath)) {
      return [];
    }
    
    const gameFiles = [];
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        const relFromRoot = fullPath.replace(this.projectRoot + path.sep, '');
        if (this.shouldIgnore(relFromRoot)) continue;
        if (file.isDirectory()) {
          scanDir(fullPath);
        } else if (file.name.match(/\.(js|html|css|json)$/)) {
          gameFiles.push(fullPath.replace(projectPath, projectName));
        }
      }
    };
    
    scanDir(projectPath);
    this.log('SCAN_GAME_FILES', projectName, `Found ${gameFiles.length} files`);
    return gameFiles;
  }

  getProjectStructure() {
    const projects = ['babylon-game', 'threejs-game', 'js2d-game', 'website'];
    const structure = {};
    
    for (const project of projects) {
      structure[project] = this.findGameFiles(project);
    }
    
    return structure;
  }
}

module.exports = new FileBridge();
