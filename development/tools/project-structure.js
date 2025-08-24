#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fileBridge = require('./file-bridge');

class ProjectStructure {
  constructor() {
    this.structure = {};
    this.urls = [];
    this.games = [];
    this.pages = [];
    this.assets = {
      css: [],
      js: [],
      images: [],
      html: []
    };
    this.lastScan = null;
  }

  async scanProject(rootDir = '.') {
    this.log('🔍 Analyse de la structure du projet...', 'info');
    
    try {
      this.structure = await this.scanDirectory(rootDir);
      this.extractUrls();
      this.extractGames();
      this.extractPages();
      this.extractAssets();
      this.lastScan = new Date().toISOString();
      
      // Sauvegarder la structure
      const structurePath = 'tools/logs/project-structure.json';
      fileBridge.writeFile(structurePath, JSON.stringify({
        timestamp: this.lastScan,
        structure: this.structure,
        urls: this.urls,
        games: this.games,
        pages: this.pages,
        assets: this.assets
      }, null, 2));
      
      this.log(`✅ Structure analysée: ${this.urls.length} URLs, ${this.games.length} jeux, ${this.pages.length} pages`, 'success');
      return this.structure;
    } catch (error) {
      this.log(`❌ Erreur lors de l'analyse: ${error.message}`, 'error');
      return null;
    }
  }

  async scanDirectory(dir, relativePath = '') {
    const result = {
      type: 'directory',
      name: path.basename(dir),
      path: relativePath,
      children: []
    };

    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          // Ignorer certains dossiers
          if (['node_modules', '.git', 'tools/logs', 'tools/screenshots'].includes(item)) {
            continue;
          }
          
          const childDir = await this.scanDirectory(fullPath, relativeItemPath);
          result.children.push(childDir);
        } else {
          result.children.push({
            type: 'file',
            name: item,
            path: relativeItemPath,
            extension: path.extname(item)
          });
        }
      }
    } catch (error) {
      this.log(`⚠️ Erreur lors du scan de ${dir}: ${error.message}`, 'warning');
    }

    return result;
  }

  extractUrls() {
    this.urls = [];
    
    // URLs principales
    this.urls.push('http://localhost:8000/public/');
    
    // Chercher les fichiers HTML dans public/
    const htmlFiles = this.findFilesByExtension('.html', 'public');
    for (const file of htmlFiles) {
      const webPath = file.path.replace(/\\/g, '/');
      const route = webPath.replace(/^public\//, '').replace('.html', '');
      if (route) {
        this.urls.push(`http://localhost:8000/public/${route}`);
      }
    }
    
    // Ajouter les routes spécifiques
    this.urls.push('http://localhost:8000/public/babylon-game.html');
    this.urls.push('http://localhost:8000/public/threejs-game.html');
    this.urls.push('http://localhost:8000/public/js2d-game.html');
  }

  extractGames() {
    this.games = [];
    
    const gameFiles = this.findFilesByExtension('.html', 'public').filter(file => 
      file.name.includes('game') || file.name.includes('babylon') || file.name.includes('threejs') || file.name.includes('js2d')
    );
    
    for (const game of gameFiles) {
      const webPath = game.path.replace(/\\/g, '/');
      this.games.push({
        name: game.name.replace('.html', ''),
        path: webPath,
        url: `http://localhost:8000/public/${webPath.replace(/^public\//, '')}`,
        type: this.detectGameType(game.name)
      });
    }
  }

  extractPages() {
    this.pages = [];
    
    const htmlFiles = this.findFilesByExtension('.html', 'public');
    for (const file of htmlFiles) {
      if (!file.name.includes('game')) {
        const webPath = file.path.replace(/\\/g, '/');
        this.pages.push({
          name: file.name.replace('.html', ''),
          path: webPath,
          url: `http://localhost:8000/public/${webPath.replace(/^public\//, '')}`
        });
      }
    }
  }

  extractAssets() {
    this.assets = {
      css: [],
      js: [],
      images: [],
      html: []
    };
    
    // CSS files
    this.assets.css = this.findFilesByExtension('.css', 'public');
    
    // JS files
    this.assets.js = this.findFilesByExtension('.js', 'public');
    
    // Image files
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    for (const ext of imageExtensions) {
      this.assets.images.push(...this.findFilesByExtension(ext, 'public'));
    }
    
    // HTML files
    this.assets.html = this.findFilesByExtension('.html', 'public');
  }

  findFilesByExtension(extension, baseDir = '') {
    const files = [];
    this.scanForFiles(this.structure, extension, baseDir, files);
    return files;
  }

  scanForFiles(node, extension, baseDir, files) {
    if (node.type === 'file' && node.extension === extension) {
      if (!baseDir || node.path.startsWith(baseDir)) {
        files.push(node);
      }
    } else if (node.type === 'directory' && node.children) {
      for (const child of node.children) {
        this.scanForFiles(child, extension, baseDir, files);
      }
    }
  }

  detectGameType(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('babylon')) return 'babylon';
    if (lower.includes('threejs') || lower.includes('three')) return 'threejs';
    if (lower.includes('js2d') || lower.includes('canvas')) return 'js2d';
    if (lower.includes('game')) return 'generic';
    return 'unknown';
  }

  getGameUrls() {
    return this.games.map(game => game.url);
  }

  getPageUrls() {
    return this.pages.map(page => page.url);
  }

  getAllUrls() {
    return this.urls;
  }

  getAssetsByType(type) {
    return this.assets[type] || [];
  }

  getStructure() {
    return this.structure;
  }

  isUpToDate() {
    if (!this.lastScan) return false;
    
    const now = new Date();
    const lastScan = new Date(this.lastScan);
    const diffMinutes = (now - lastScan) / (1000 * 60);
    
    // Considérer comme périmé après 5 minutes
    return diffMinutes < 5;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  // Méthode pour forcer une nouvelle analyse
  async refresh() {
    this.log('🔄 Actualisation de la structure du projet...', 'info');
    return await this.scanProject();
  }
}

// Export pour utilisation par les agents
module.exports = ProjectStructure;

// Si exécuté directement, analyser le projet
if (require.main === module) {
  const analyzer = new ProjectStructure();
  analyzer.scanProject().then(() => {
    console.log('\n📊 Structure du projet analysée:');
    console.log(`URLs: ${analyzer.urls.length}`);
    console.log(`Jeux: ${analyzer.games.length}`);
    console.log(`Pages: ${analyzer.pages.length}`);
    console.log(`Assets CSS: ${analyzer.assets.css.length}`);
    console.log(`Assets JS: ${analyzer.assets.js.length}`);
    console.log(`Assets Images: ${analyzer.assets.images.length}`);
  });
}
