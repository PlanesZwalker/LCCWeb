#!/usr/bin/env node

const BaseAgent = require('./base-agent');
const fileBridge = require('../file-bridge');
const ProjectStructure = require('../project-structure');
const path = require('path');

class WebsiteBeautifier extends BaseAgent {
  constructor() {
    super('website-beautifier');
    this.websiteFiles = [
      'public/index.html',
      'public/css/styles.css',
      'public/js/main.js'
    ];
  }

  analyzeInstruction(instruction) {
    const keywords = {
      responsive: ['responsive', 'mobile', 'tablet', 'adaptatif', 'adaptation'],
      modern: ['moderne', 'modern', 'design', 'ui', 'ux', 'interface'],
      animation: ['animation', 'transition', 'effet', 'mouvement', 'fluide'],
      color: ['couleur', 'color', 'thème', 'theme', 'palette', 'contrast'],
      layout: ['layout', 'disposition', 'grille', 'grid', 'flexbox'],
      typography: ['typographie', 'font', 'texte', 'text', 'police']
    };

    const analysis = {
      needsResponsiveDesign: false,
      needsModernUI: false,
      needsAnimations: false,
      needsColorWork: false,
      needsLayoutImprovement: false,
      needsTypographyWork: false,
      priority: 'medium'
    };

    const lowerInstruction = instruction.toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerInstruction.includes(word))) {
        // Map categories to the actual flags used elsewhere in this agent
        if (category === 'modern') {
          analysis.needsModernUI = true;
        } else if (category === 'animation') {
          analysis.needsAnimations = true;
        } else if (category === 'responsive') {
          analysis.needsResponsiveDesign = true;
        } else if (category === 'typography') {
          analysis.needsTypographyWork = true;
        } else if (category === 'layout') {
          analysis.needsLayoutImprovement = true;
        } else if (category === 'color') {
          analysis.needsColorWork = true;
        }
      }
    }

    // Déterminer la priorité
    if (analysis.needsResponsiveDesign) analysis.priority = 'high';
    if (analysis.needsModernUI && analysis.needsResponsiveDesign) analysis.priority = 'high';
    if (analysis.needsAnimations && !analysis.needsResponsiveDesign) analysis.priority = 'medium';

    return analysis;
  }

  ensureBalancedBraces(css) {
    try {
      const open = (css.match(/\{/g) || []).length;
      const close = (css.match(/\}/g) || []).length;
      let fixed = css;
      if (open > close) {
        fixed += '\n'.repeat(open - close) + '}'.repeat(open - close);
      } else if (close > open) {
        // Remove extra closing braces from the end of the file
        let toRemove = close - open;
        while (toRemove > 0 && /\}\s*$/.test(fixed)) {
          fixed = fixed.replace(/\}\s*$/, '');
          toRemove--;
        }
      }
      return fixed;
    } catch (_) {
      return css;
    }
  }

  async findWebsiteFiles() {
    const websiteFiles = new Set();
    try {
      const ps = new ProjectStructure();
      await ps.scanProject(path.resolve(__dirname, '..', '..'));
      // Target CSS only for beautification
      const cssAssets = ps.getAssetsByType('css') || [];
      for (const asset of cssAssets) {
        const rel = (asset.path || '').replace(/\\/g, '/');
        // Only CSS under public/css
        if (rel.startsWith('public/css/')) {
          websiteFiles.add(rel);
        }
      }
      // Ensure base theme is included if present
      if (fileBridge.fileExists('public/css/base-theme.css')) {
        websiteFiles.add('public/css/base-theme.css');
      }
    } catch (_) {}
    return Array.from(websiteFiles);
  }

  improveResponsiveDesign(css) {
    let improved = css;
    
    // Améliorations responsive
    const responsiveImprovements = [
      // Ajouter des breakpoints modernes
      {
        pattern: /@media.*max-width.*768px/g,
        replacement: `@media (max-width: 768px) {
  .game-versions {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .game-container {
    padding: 1rem;
  }
  
  .ui-panel {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
  
  .score-panel,
  .level-panel {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    margin-bottom: 0.5rem;
  }
  
  .controls-panel {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .notification {
    max-width: 250px;
    right: 0.5rem;
    top: 0.5rem;
  }
}`
      },
      // Ajouter des breakpoints pour mobile
      {
        pattern: /@media.*max-width.*480px/g,
        replacement: `@media (max-width: 480px) {
  :root {
    --spacing-lg: 16px;
    --spacing-xl: 24px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;
  }
  
  .game-container {
    padding: 0.25rem;
  }
  
  .ui-panel {
    padding: 0.25rem;
    font-size: 0.75rem;
  }
}`
      }
    ];

    for (const improvement of responsiveImprovements) {
      if (!improved.includes(improvement.replacement)) {
        const before = improved;
        improved = improved.replace(improvement.pattern, improvement.replacement);
        if (improved === before) {
          // Pattern not found, append the block at the end safely
          improved += `\n\n${improvement.replacement}\n`;
        }
      }
    }

    return improved;
  }

  modernizeUI(css) {
    let modernized = css;
    
    // Nettoyer et valider la structure CSS d'abord
    modernized = this.validateAndFixCSSStructure(modernized);
    
    // Améliorations UI modernes
    const modernImprovements = [
      // Ajouter des variables CSS modernes si elles n'existent pas
      {
        condition: !modernized.includes('--primary-color'),
        addition: `/* CSS Variables for theming */
:root {
  /* Color Palette */
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #FFD700;
  --success-color: #4ECDC4;
  --warning-color: #FF6B6B;
  --info-color: #45B7D1;
  --error-color: #e74c3c;
  
  /* Background Colors */
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-surface: #0f3460;
  --bg-overlay: rgba(0, 0, 0, 0.8);
  
  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: #b8b8b8;
  --text-muted: #7f8c8d;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 20px rgba(102, 126, 234, 0.4);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Orbitron', monospace;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-xxl: 32px;
}

`
      },
      // Améliorer les boutons
      {
        pattern: /\.btn\s*\{[^}]*\}/g,
        replacement: `.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--transition-slow);
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-danger {
  background: var(--error-color);
  color: var(--text-primary);
}

.btn-success {
  background: var(--success-color);
  color: var(--text-primary);
}`
      }
    ];

    for (const improvement of modernImprovements) {
      if (improvement.condition !== undefined) {
        if (improvement.condition) {
          modernized = improvement.addition + modernized;
        }
      } else if (improvement.pattern) {
        if (!modernized.includes(improvement.replacement)) {
          const before = modernized;
          modernized = modernized.replace(improvement.pattern, improvement.replacement);
          if (modernized === before) {
            // Pattern not present; append replacement block to ensure effect
            modernized += `\n\n${improvement.replacement}\n`;
          }
        }
      }
    }

    return modernized;
  }

  addAnimations(css) {
    let animated = css;
    
    // Animations modernes
    const animations = [
      // Keyframes pour les animations
      {
        condition: !animated.includes('@keyframes slideInRight'),
        addition: `
/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px var(--primary-color);
  }
  50% {
    box-shadow: 0 0 20px var(--primary-color), 0 0 30px var(--primary-color);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

`
      },
      // Améliorer les transitions
      {
        pattern: /transition:\s*[^;]*;/g,
        replacement: 'transition: var(--transition-normal);'
      }
    ];

    for (const animation of animations) {
      if (animation.condition !== undefined) {
        if (animation.condition) {
          animated += animation.addition;
        }
      } else if (animation.pattern) {
        animated = animated.replace(animation.pattern, animation.replacement);
      }
    }

    return animated;
  }

  improveTypography(css) {
    let improved = css;
    
    // Améliorations typographiques
    const typographyImprovements = [
      // Ajouter des styles de base pour la typographie
      {
        condition: !improved.includes('font-family: var(--font-primary)'),
        addition: `
/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-xxl); }
h2 { font-size: var(--font-size-xl); }
h3 { font-size: var(--font-size-lg); }
h4 { font-size: var(--font-size-md); }

p {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

body {
  font-family: var(--font-primary);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
}

`
      }
    ];

    for (const improvement of typographyImprovements) {
      if (improvement.condition !== undefined) {
        if (improvement.condition) {
          improved = improvement.addition + improved;
        }
      }
    }

    return improved;
  }

  async run(instruction) {
    this.log(`🧠 Instruction reçue: ${instruction}`);
    
    const analysis = this.analyzeInstruction(instruction);
    this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

    const websiteFiles = await this.findWebsiteFiles();
    this.log(`📁 Fichiers website trouvés: ${websiteFiles.length}`);

    if (websiteFiles.length === 0) {
      this.log('⚠️ Aucun fichier website trouvé. Vérifiez la structure du projet.', 'warning');
      return;
    }

    let totalChanges = 0;

    for (const filePath of websiteFiles) {
      if (!fileBridge.fileExists(filePath)) {
        this.log(`⚠️ Fichier introuvable: ${filePath}`, 'warning');
        continue;
      }

      this.log(`🔧 Traitement de: ${filePath}`);
      
      // Traiter seulement les fichiers CSS pour les améliorations visuelles
      if (filePath.endsWith('.css')) {
        // Pré-normalisation minimale pour éviter les échecs systématiques de validation
        this.applyCSSModification(
          filePath,
          (css) => this.ensureBalancedBraces(css),
          'Pré-normalisation (équilibrage des accolades)'
        );
        // Utiliser la méthode sécurisée pour appliquer les modifications
        if (analysis.needsResponsiveDesign) {
          if (this.applyCSSModification(filePath, 
              (css) => this.improveResponsiveDesign(css), 
              'Améliorations responsive')) {
            totalChanges++;
          }
        }

        if (analysis.needsModernUI) {
          if (this.applyCSSModification(filePath, 
              (css) => this.modernizeUI(css), 
              'Modernisations UI')) {
            totalChanges++;
          }
        }

        if (analysis.needsAnimations) {
          if (this.applyCSSModification(filePath, 
              (css) => this.addAnimations(css), 
              'Animations')) {
            totalChanges++;
          }
        }

        if (analysis.needsTypographyWork) {
          if (this.applyCSSModification(filePath, 
              (css) => this.improveTypography(css), 
              'Améliorations typographiques')) {
            totalChanges++;
          }
        }
      } else {
        this.log(`ℹ️ Fichier non-CSS ignoré: ${filePath}`, 'info');
      }
    }

    this.log(`🎯 Résumé: ${totalChanges} modification(s) totale(s) sur ${websiteFiles.length} fichier(s)`, 'success');
    
    // Générer le rapport d'erreurs
    const errorReport = this.generateErrorReport();
    if (errorReport !== 'Aucune erreur ou avertissement détecté') {
      this.log(errorReport, 'warning');
    }
    
    if (totalChanges > 0) {
      this.log('💡 Recommandations:', 'info');
      this.log('   - Testez le site sur différents appareils', 'info');
      this.log('   - Vérifiez la lisibilité et l\'accessibilité', 'info');
      this.log('   - Ajustez les couleurs selon vos préférences', 'info');
      this.log('   - Considérez ajouter des polices web (Google Fonts)', 'info');
    }

    // Nettoyage en cas d'erreur
    if (this.errors.length > 0) {
      this.cleanup();
    }
  }
}

// Exécution de l'agent
const args = process.argv.slice(2);
const instruction = args.join(' ');

if (!instruction) {
  console.error('❌ Instruction requise');
  process.exit(1);
}

const agent = new WebsiteBeautifier();
agent.run(instruction);
