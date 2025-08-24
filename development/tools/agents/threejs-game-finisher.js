#!/usr/bin/env node
const BaseAgent = require('./base-agent');
const fileBridge = require('../file-bridge');
const path = require('path');

class ThreeJSGameFinisher extends BaseAgent {
    constructor() {
        super('threejs-game-finisher');
    }

    analyzeInstruction(instruction) {
        const analysis = {
            needsOptimization: false,
            needsShaderWork: false,
            needsPerformanceProfiling: false,
            needsRenderingImprovement: false,
            needsAnimationWork: false,
            needsCameraWork: false,
            priority: 'medium'
        };

        const lowerInstruction = instruction.toLowerCase();

        if (lowerInstruction.includes('optimiser') || lowerInstruction.includes('performance')) {
            analysis.needsOptimization = true;
        }

        if (lowerInstruction.includes('shader') || lowerInstruction.includes('rendu')) {
            analysis.needsShaderWork = true;
        }

        if (lowerInstruction.includes('profiling') || lowerInstruction.includes('performance')) {
            analysis.needsPerformanceProfiling = true;
        }

        if (lowerInstruction.includes('rendu') || lowerInstruction.includes('rendering')) {
            analysis.needsRenderingImprovement = true;
        }

        if (lowerInstruction.includes('animation')) {
            analysis.needsAnimationWork = true;
        }

        if (lowerInstruction.includes('caméra') || lowerInstruction.includes('camera')) {
            analysis.needsCameraWork = true;
        }

        return analysis;
    }

    async execute(instruction) {
        this.log(`🧠 Instruction reçue: ${instruction}`);
        
        const analysis = this.analyzeInstruction(instruction);
        this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

        // Recherche des fichiers Three.js
        const threejsFiles = await this.findThreeJSFiles(instruction);
        this.log(`📁 Fichiers Three.js trouvés: ${threejsFiles.length}`);

        let totalModifications = 0;

        for (const filePath of threejsFiles) {
            this.log(`🔧 Traitement de: ${filePath}`);
            
            try {
                const content = await fileBridge.readFile(filePath);
                let modified = false;

                // Optimisations de performance
                if (analysis.needsOptimization) {
                    const optimizedContent = this.optimizePerformance(content);
                    if (optimizedContent !== content) {
                        await this.applyTextModification(filePath, () => optimizedContent, 'Optimisations de performance Three.js');
                        modified = true;
                    }
                }

                // Améliorations des shaders
                if (analysis.needsShaderWork) {
                    const shaderContent = this.improveShaders(content);
                    if (shaderContent !== content) {
                        await this.applyTextModification(filePath, () => shaderContent, 'Améliorations des shaders');
                        modified = true;
                    }
                }

                // Profiling des performances
                if (analysis.needsPerformanceProfiling) {
                    const profiledContent = this.addPerformanceProfiling(content);
                    if (profiledContent !== content) {
                        await this.applyTextModification(filePath, () => profiledContent, 'Ajout du profiling de performance');
                        modified = true;
                    }
                }

                // Améliorations du rendu
                if (analysis.needsRenderingImprovement) {
                    const renderContent = this.improveRendering(content);
                    if (renderContent !== content) {
                        await this.applyTextModification(filePath, () => renderContent, 'Améliorations du rendu');
                        modified = true;
                    }
                }

                if (!modified) {
                    this.log(`ℹ️ Aucun changement nécessaire dans ${filePath}`);
                } else {
                    totalModifications++;
                }

            } catch (error) {
                this.log(`❌ Erreur lors du traitement de ${filePath}: ${error.message}`);
            }
        }

        this.log(`🎯 Résumé: ${totalModifications} modification(s) totale(s) sur ${threejsFiles.length} fichier(s)`);
    }

    async findThreeJSFiles(instruction = '') {
        // If instruction contains a target HTML (e.g., threejs-3d-game.html, unified-3d-game.html), parse it for linked JS
        const match = instruction.match(/http:\/\/localhost:8000\/(public\/[\w\-\/\.]*?(three|threejs|3d|optimized)[\w\-\.]*\.html)/i);
        if (match && match[1]) {
            const htmlPath = match[1];
            try {
                const html = await fileBridge.readFile(htmlPath);
                const jsHrefs = Array.from(html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/gi)).map(m => m[1]);
                const resolved = jsHrefs
                  .map(src => src.startsWith('http') ? null : ('public/' + src.replace(/^\/?/, '')))
                  .filter(Boolean)
                  .filter(p => /three|threejs|optimized|shader|game3d|unified|renderer/i.test(p) && !/\/libs\//i.test(p));
                if (resolved.length) return [...new Set(resolved)];
            } catch (_) {
                // fallback to generic scan
            }
        }

        // Fallback: scan public/js entries only (exclude libs)
        const entries = await fileBridge.listFiles('public/js');
        const files = (entries || [])
          .filter(e => !e.isDirectory)
          .map(e => e.path)
          .filter(p => /three|threejs|optimized|shader|game3d|unified|renderer/i.test(p) && !/\/libs\//i.test(p));
        return [...new Set(files)];
    }

    optimizePerformance(content) {
        // Optimisations Three.js spécifiques
        let optimized = content;

        // Optimisation des géométries
        optimized = optimized.replace(
            /new THREE\.BoxGeometry\(([^)]+)\)/g,
            'new THREE.BoxGeometry($1).toNonIndexed()'
        );

        // Optimisation des matériaux
        optimized = optimized.replace(
            /new THREE\.MeshBasicMaterial\(/g,
            'new THREE.MeshLambertMaterial('
        );

        // Optimisation du frustum culling
        if (optimized.includes('THREE.Frustum')) {
            optimized = optimized.replace(
                /const frustum = new THREE\.Frustum\(\);/g,
                `const frustum = new THREE.Frustum();
const camera = new THREE.PerspectiveCamera();
frustum.setFromProjectionMatrix(camera.projectionMatrix);`
            );
        }

        // Optimisation des textures
        optimized = optimized.replace(
            /texture\.wrapS = THREE\.RepeatWrapping;/g,
            `texture.wrapS = THREE.RepeatWrapping;
texture.generateMipmaps = false;
texture.minFilter = THREE.LinearFilter;`
        );

        return optimized;
    }

    improveShaders(content) {
        let improved = content;

        // Ajout de shaders personnalisés
        if (improved.includes('THREE.ShaderMaterial')) {
            improved = improved.replace(
                /const material = new THREE\.ShaderMaterial\(\{/g,
                `const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() }
    },`
            );
        }

        // Amélioration des effets visuels
        if (improved.includes('THREE.Mesh')) {
            improved = improved.replace(
                /const mesh = new THREE\.Mesh\(geometry, material\);/g,
                `const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;`
            );
        }

        return improved;
    }

    addPerformanceProfiling(content) {
        let profiled = content;

        // Ajout de métriques de performance
        if (!profiled.includes('performance.now()')) {
            profiled = profiled.replace(
                /function animate\(\) \{/g,
                `let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

function animate() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        console.log('FPS:', fps);
        frameCount = 0;
        lastTime = currentTime;
    }`
            );
        }

        // Ajout de monitoring mémoire
        if (!profiled.includes('memory')) {
            profiled = profiled.replace(
                /renderer\.render\(scene, camera\);/g,
                `renderer.render(scene, camera);
    
    // Monitoring mémoire
    if (performance.memory) {
        console.log('Memory used:', performance.memory.usedJSHeapSize / 1048576, 'MB');
    }`
            );
        }

        return profiled;
    }

    improveRendering(content) {
        let improved = content;

        // Amélioration du rendu
        if (improved.includes('THREE.WebGLRenderer')) {
            improved = improved.replace(
                /const renderer = new THREE\.WebGLRenderer\(\);/g,
                `const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});`
            );
        }

        // Ajout d'effets de post-processing
        if (!improved.includes('EffectComposer')) {
            improved = improved.replace(
                /renderer\.render\(scene, camera\);/g,
                `// Post-processing effects
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom effect
const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
);
composer.addPass(bloomPass);

composer.render();`
            );
        }

        return improved;
    }
}

// Exécution directe si appelé en ligne de commande
if (require.main === module) {
    const agent = new ThreeJSGameFinisher();
    const instruction = process.argv[2] || "Optimise les performances et améliore le rendu Three.js";
    
    agent.execute(instruction)
        .then(() => {
            console.log('✅ Agent exécuté avec succès');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Erreur lors de l\'exécution de l\'agent:', error.message);
            process.exit(1);
        });
}

module.exports = ThreeJSGameFinisher;
