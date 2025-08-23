#!/usr/bin/env node

const fileBridge = require('../file-bridge');
const ProjectStructure = require('../project-structure');
const path = require('path');

class BabylonGameFinisher {
  constructor() {
    this.agentName = 'babylon-game-finisher';
    this.projectFiles = [
      'public/unified-3d-game.html',
      'public/js/game-engine.js',
      'public/js/game-mechanics.js',
      'public/js/3d-scene-manager.js'
    ];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🎮 ${this.agentName}: ${message}`);
  }

  analyzeInstruction(instruction) {
    const keywords = {
      optimize: ['optimise', 'optimiser', 'performance', 'perf', 'fps'],
      collision: ['collision', 'collide', 'hit', 'contact', 'physics'],
      visual: ['visuel', 'effet', 'particule', 'shader', 'rendu'],
      bug: ['bug', 'erreur', 'corrige', 'fix', 'problème'],
      animation: ['animation', 'mouvement', 'fluide', 'smooth'],
      camera: ['caméra', 'camera', 'vue', 'view', 'angle']
    };

    const analysis = {
      needsOptimization: false,
      needsCollisionFix: false,
      needsVisualImprovement: false,
      needsBugFix: false,
      needsAnimationWork: false,
      needsCameraWork: false,
      priority: 'medium'
    };

    const lowerInstruction = instruction.toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerInstruction.includes(word))) {
        analysis[`needs${category.charAt(0).toUpperCase() + category.slice(1)}`] = true;
      }
    }

    // Déterminer la priorité
    if (analysis.needsBugFix) analysis.priority = 'high';
    if (analysis.needsOptimization && analysis.needsCollisionFix) analysis.priority = 'high';
    if (analysis.needsVisualImprovement && !analysis.needsBugFix) analysis.priority = 'medium';

    return analysis;
  }

  async findBabylonFiles(instruction = '') {
    const results = new Set();
    // If instruction targets unified-3d-game.html, parse linked scripts
    const m = instruction.match(/http:\/\/localhost:8000\/(public\/[\w\-\/\.]*unified[\w\-\.]*\.html)/i);
    if (m && m[1]) {
      try {
        const html = fileBridge.readFile(m[1]);
        const jsHrefs = Array.from(html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/gi)).map(x => x[1]);
        jsHrefs
          .map(src => src.startsWith('http') ? null : ('public/' + src.replace(/^\/?/, '')))
          .filter(Boolean)
          .filter(p => /babylon|unified|scene|game|3d/i.test(p))
          .forEach(p => results.add(p));
      } catch(_) {}
    }
    try {
      const ps = new ProjectStructure();
      await ps.scanProject(path.resolve(__dirname, '..', '..'));
      const htmls = ps.getAssetsByType('html') || [];
      for (const h of htmls) {
        const name = (h.name || '').toLowerCase();
        if (name.includes('unified-3d') || name.includes('babylon')) {
          results.add(h.path.replace(/\\/g,'/'));
        }
      }
      const jss = ps.getAssetsByType('js') || [];
      for (const j of jss) {
        const p = (j.path || '').replace(/\\/g,'/');
        if (p.includes('public/js/') && /(unified|babylon|scene|game|3d)/i.test(p) && !/\/libs\//.test(p)) {
          results.add(p);
        }
      }
    } catch(_) {}
    return Array.from(results);
  }

  optimizePerformance(code) {
    let optimized = code;
    
    // Optimisations Babylon.js courantes
    const optimizations = [
      // Réduire les draw calls
      {
        pattern: /mesh\.visibility\s*=\s*0\.5/g,
        replacement: 'mesh.visibility = 1.0'
      },
      // Optimiser les matériaux
      {
        pattern: /new BABYLON\.StandardMaterial\(/g,
        replacement: 'new BABYLON.StandardMaterial("optimized", '
      },
      // Activer le frustum culling
      {
        pattern: /scene\.createDefaultCameraOrLight\(/g,
        replacement: 'scene.createDefaultCameraOrLight();\nscene.frustumCullingEnabled = true;'
      },
      // Optimiser les textures
      {
        pattern: /texture\.hasAlpha\s*=\s*true/g,
        replacement: 'texture.hasAlpha = false'
      }
    ];

    for (const opt of optimizations) {
      optimized = optimized.replace(opt.pattern, opt.replacement);
    }

    return optimized;
  }

  fixCollisionIssues(code) {
    let fixed = code;
    
    // Corrections de collision courantes
    const collisionFixes = [
      // Améliorer la détection de collision
      {
        pattern: /mesh\.checkCollisions\s*=\s*true/g,
        replacement: 'mesh.checkCollisions = true;\nmesh.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5);'
      },
      // Ajouter des marges de collision
      {
        pattern: /scene\.collisionsEnabled\s*=\s*true/g,
        replacement: 'scene.collisionsEnabled = true;\nscene.gravity = new BABYLON.Vector3(0, -9.81, 0);'
      }
    ];

    for (const fix of collisionFixes) {
      fixed = fixed.replace(fix.pattern, fix.replacement);
    }

    return fixed;
  }

  improveVisualEffects(code) {
    let improved = code;
    
    // Améliorations visuelles
    const visualImprovements = [
      // Ajouter des effets de post-processing
      {
        pattern: /scene\.createDefaultCameraOrLight\(/g,
        replacement: 'scene.createDefaultCameraOrLight();\n// Post-processing effects\nconst pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, scene);\npipeline.bloomEnabled = true;\npipeline.bloomThreshold = 0.3;'
      },
      // Améliorer l'éclairage
      {
        pattern: /new BABYLON\.HemisphericLight\(/g,
        replacement: 'new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);\nlight.intensity = 0.7;'
      }
    ];

    for (const improvement of visualImprovements) {
      improved = improved.replace(improvement.pattern, improvement.replacement);
    }

    return improved;
  }

  async run(instruction) {
    this.log(`🧠 Instruction reçue: ${instruction}`);
    
    const analysis = this.analyzeInstruction(instruction);
    this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

    const babylonFiles = await this.findBabylonFiles(instruction);
    this.log(`📁 Fichiers Babylon.js trouvés: ${babylonFiles.length}`);

    if (babylonFiles.length === 0) {
      this.log('⚠️ Aucun fichier Babylon.js trouvé. Vérifiez la structure du projet.');
      return;
    }

    let totalChanges = 0;

    for (const filePath of babylonFiles) {
      if (!fileBridge.fileExists(filePath)) {
        this.log(`⚠️ Fichier introuvable: ${filePath}`);
        continue;
      }

      this.log(`🔧 Traitement de: ${filePath}`);
      let code = fileBridge.readFile(filePath);
      let originalCode = code;
      let changes = 0;

      // Sauvegarde avant modification
      if (process.env.DRY_RUN !== 'true') {
        fileBridge.backupFile(filePath);
      }

      // Appliquer les optimisations selon l'analyse
      if (analysis.needsOptimization) {
        const optimized = this.optimizePerformance(code);
        if (optimized !== code) {
          code = optimized;
          changes++;
          this.log(`⚡ Optimisations de performance appliquées`);
        }
      }

      if (analysis.needsCollisionFix) {
        const fixed = this.fixCollisionIssues(code);
        if (fixed !== code) {
          code = fixed;
          changes++;
          this.log(`🎯 Corrections de collision appliquées`);
        }
      }

      if (analysis.needsVisualImprovement) {
        const improved = this.improveVisualEffects(code);
        if (improved !== code) {
          code = improved;
          changes++;
          this.log(`✨ Améliorations visuelles appliquées`);
        }
      }

      // Écrire les modifications si des changements ont été faits
      if (code !== originalCode && process.env.DRY_RUN !== 'true') {
        fileBridge.writeFile(filePath, code);
        totalChanges += changes;
        this.log(`✅ ${changes} modification(s) appliquée(s) dans ${filePath}`);
      } else if (process.env.DRY_RUN === 'true') {
        this.log(`🔍 Mode dry-run: ${changes} modification(s) simulée(s) dans ${filePath}`);
      } else {
        this.log(`ℹ️ Aucun changement nécessaire dans ${filePath}`);
      }
    }

    this.log(`🎯 Résumé: ${totalChanges} modification(s) totale(s) sur ${babylonFiles.length} fichier(s)`);
    
    if (totalChanges > 0) {
      this.log('💡 Recommandations:');
      this.log('   - Testez les performances avec les outils de développement');
      this.log('   - Vérifiez que les collisions fonctionnent correctement');
      this.log('   - Ajustez les paramètres visuels selon vos préférences');
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

const agent = new BabylonGameFinisher();
agent.run(instruction);
