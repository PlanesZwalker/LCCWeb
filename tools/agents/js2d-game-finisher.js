#!/usr/bin/env node
const BaseAgent = require('./base-agent');
const fileBridge = require('../file-bridge');
const path = require('path');

class JS2DGameFinisher extends BaseAgent {
    constructor() {
        super('js2d-game-finisher');
    }

    analyzeInstruction(instruction) {
        const analysis = {
            needsModularArchitecture: false,
            needsSmoothAnimations: false,
            needsMobileAdaptation: false,
            needsPerformanceOptimization: false,
            needsTouchSupport: false,
            needsResponsiveDesign: false,
            priority: 'medium'
        };

        const lowerInstruction = instruction.toLowerCase();

        if (lowerInstruction.includes('modulaire') || lowerInstruction.includes('architecture')) {
            analysis.needsModularArchitecture = true;
        }

        if (lowerInstruction.includes('animation') || lowerInstruction.includes('fluide')) {
            analysis.needsSmoothAnimations = true;
        }

        if (lowerInstruction.includes('mobile') || lowerInstruction.includes('touch')) {
            analysis.needsMobileAdaptation = true;
        }

        if (lowerInstruction.includes('performance') || lowerInstruction.includes('optimisation')) {
            analysis.needsPerformanceOptimization = true;
        }

        if (lowerInstruction.includes('touch') || lowerInstruction.includes('mobile')) {
            analysis.needsTouchSupport = true;
        }

        if (lowerInstruction.includes('responsive') || lowerInstruction.includes('adaptatif')) {
            analysis.needsResponsiveDesign = true;
        }

        return analysis;
    }

    async execute(instruction) {
        this.log(`🧠 Instruction reçue: ${instruction}`);
        
        const analysis = this.analyzeInstruction(instruction);
        this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

        // Recherche des fichiers 2D (essayez d'abord d'inférer à partir de l'instruction URL)
        let js2dFiles = [];
        const urlMatch = instruction.match(/http:\/\/localhost:8000\/(public\/[\w\-\/\.]+\.html)/i);
        if (urlMatch && urlMatch[1]) {
            // Map URL path to repo file path
            const candidate = urlMatch[1].replace(/\\/g, '/');
            if (await fileBridge.fileExists(candidate)) {
                js2dFiles.push(candidate);
            }
        }
        if (js2dFiles.length === 0) {
            js2dFiles = await this.findJS2DFiles();
        }
        this.log(`📁 Fichiers 2D trouvés: ${js2dFiles.length}`);

        let totalModifications = 0;

        for (const filePath of js2dFiles) {
            this.log(`🔧 Traitement de: ${filePath}`);
            
            try {
                const content = await fileBridge.readFile(filePath);
                let modified = false;

                // Optimisation de l'architecture modulaire
                if (analysis.needsModularArchitecture) {
                    const modularContent = this.improveModularArchitecture(content);
                    if (modularContent !== content) {
                        await this.applyTextModification(filePath, () => modularContent, 'Amélioration de l\'architecture modulaire');
                        modified = true;
                    }
                }

                // Ajout d'animations fluides
                if (analysis.needsSmoothAnimations) {
                    const animatedContent = this.addSmoothAnimations(content);
                    if (animatedContent !== content) {
                        await this.applyTextModification(filePath, () => animatedContent, 'Ajout d\'animations fluides');
                        modified = true;
                    }
                }

                // Adaptation mobile
                if (analysis.needsMobileAdaptation) {
                    const mobileContent = this.adaptForMobile(content);
                    if (mobileContent !== content) {
                        await this.applyTextModification(filePath, () => mobileContent, 'Adaptation mobile');
                        modified = true;
                    }
                }

                // Optimisation des performances
                if (analysis.needsPerformanceOptimization) {
                    const optimizedContent = this.optimizePerformance(content);
                    if (optimizedContent !== content) {
                        await this.applyTextModification(filePath, () => optimizedContent, 'Optimisation des performances');
                        modified = true;
                    }
                }

                // Support tactile
                if (analysis.needsTouchSupport) {
                    const touchContent = this.addTouchSupport(content);
                    if (touchContent !== content) {
                        await this.applyTextModification(filePath, () => touchContent, 'Ajout du support tactile');
                        modified = true;
                    }
                }

                // Design responsive
                if (analysis.needsResponsiveDesign) {
                    const responsiveContent = this.addResponsiveDesign(content);
                    if (responsiveContent !== content) {
                        await this.applyTextModification(filePath, () => responsiveContent, 'Ajout du design responsive');
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

        this.log(`🎯 Résumé: ${totalModifications} modification(s) totale(s) sur ${js2dFiles.length} fichier(s)`);
    }

    async findJS2DFiles() {
        const searchPatterns = [
            '**/game2d*.js',
            '**/2d*.js',
            '**/*2d*.js',
            '**/canvas*.js',
            '**/game2d*.html',
            '**/2d*.html',
            '**/canvas*.html'
        ];

        const files = [];
        for (const pattern of searchPatterns) {
            try {
                const found = await fileBridge.listFiles(pattern);
                files.push(...found);
            } catch (error) {
                // Pattern not found, continue
            }
        }

        return [...new Set(files)]; // Remove duplicates
    }

    improveModularArchitecture(content) {
        let modular = content;

        // Ajout de classes modulaires
        if (!modular.includes('class GameState')) {
            modular = modular.replace(
                /let gameState = \{/g,
                `class GameState {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.isGameOver = false;
    }
    
    updateScore(points) {
        this.score += points;
    }
    
    updateLevel() {
        this.level++;
    }
    
    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.isGameOver = true;
        }
    }
}

const gameState = new GameState();`
            );
        }

        // Ajout de gestionnaires d'événements modulaires
        if (!modular.includes('class EventManager')) {
            modular = modular.replace(
                /document\.addEventListener\(/g,
                `class EventManager {
    constructor() {
        this.listeners = new Map();
    }
    
    addListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

const eventManager = new EventManager();

document.addEventListener(`
            );
        }

        return modular;
    }

    addSmoothAnimations(content) {
        let animated = content;

        // Ajout d'animations CSS
        if (!animated.includes('@keyframes')) {
            animated = animated.replace(
                /<style>/g,
                `<style>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
}

.animated {
    animation: fadeIn 0.5s ease-out;
}

.pulse {
    animation: pulse 2s infinite;
}

.slide-in {
    animation: slideIn 0.3s ease-out;
}`
            );
        }

        // Ajout d'animations JavaScript
        if (!animated.includes('requestAnimationFrame')) {
            animated = animated.replace(
                /function animate\(\) \{/g,
                `function animate() {
    requestAnimationFrame(animate);
    
    // Smooth animations
    if (gameState.isGameOver) {
        return;
    }
    
    // Update game objects with smooth transitions
    updateGameObjects();
    
    // Render with smooth interpolation
    render();
}`
            );
        }

        return animated;
    }

    adaptForMobile(content) {
        let mobile = content;

        // Ajout de meta viewport
        if (!mobile.includes('viewport')) {
            mobile = mobile.replace(
                /<head>/g,
                `<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`
            );
        }

        // Ajout de styles mobiles
        if (!mobile.includes('@media')) {
            mobile = mobile.replace(
                /<\/style>/g,
                `@media (max-width: 768px) {
    .game-container {
        width: 100vw;
        height: 100vh;
        padding: 10px;
    }
    
    .controls {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
    }
    
    .button {
        padding: 15px 25px;
        font-size: 18px;
        margin: 5px;
    }
}

@media (max-width: 480px) {
    .game-container {
        padding: 5px;
    }
    
    .button {
        padding: 12px 20px;
        font-size: 16px;
    }
}
</style>`
            );
        }

        return mobile;
    }

    optimizePerformance(content) {
        let optimized = content;

        // Optimisation du canvas
        if (optimized.includes('getContext')) {
            optimized = optimized.replace(
                /const ctx = canvas\.getContext\('2d'\);/g,
                `const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
    powerPreference: 'high-performance'
});`
            );
        }

        // Optimisation des objets de jeu
        if (!optimized.includes('object pooling')) {
            optimized = optimized.replace(
                /class GameObject \{/g,
                `class ObjectPool {
    constructor(createFn, resetFn) {
        this.pool = [];
        this.createFn = createFn;
        this.resetFn = resetFn;
    }
    
    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }
    
    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}

class GameObject {`
            );
        }

        // Optimisation du rendu
        if (!optimized.includes('culling')) {
            optimized = optimized.replace(
                /function render\(\) \{/g,
                `function isInViewport(obj) {
    return obj.x >= 0 && obj.x <= canvas.width &&
           obj.y >= 0 && obj.y <= canvas.height;
}

function render() {
    // Clear canvas efficiently
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only render visible objects
    gameObjects.forEach(obj => {
        if (isInViewport(obj)) {
            obj.render(ctx);
        }
    });
}`
            );
        }

        return optimized;
    }

    addTouchSupport(content) {
        let touch = content;

        // Ajout d'événements tactiles
        if (!touch.includes('touchstart')) {
            touch = touch.replace(
                /document\.addEventListener\('click'/g,
                `// Touch support
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', handleTouch, { passive: false });

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Handle touch events
    handleInput(x, y, e.type);
}

document.addEventListener('click'`
            );
        }

        // Ajout de contrôles tactiles
        if (!touch.includes('touch controls')) {
            touch = touch.replace(
                /<\/body>/g,
                `<div class="touch-controls">
    <button class="touch-btn" id="left-btn">←</button>
    <button class="touch-btn" id="right-btn">→</button>
    <button class="touch-btn" id="action-btn">Action</button>
</div>

<style>
.touch-controls {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 1000;
}

.touch-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.8);
    font-size: 24px;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

@media (max-width: 768px) {
    .touch-controls {
        display: flex;
    }
}

@media (min-width: 769px) {
    .touch-controls {
        display: none;
    }
}
</style>
</body>`
            );
        }

        return touch;
    }

    addResponsiveDesign(content) {
        let responsive = content;

        // Ajout de design responsive
        if (!responsive.includes('responsive')) {
            responsive = responsive.replace(
                /<style>/g,
                `<style>
/* Responsive design */
.game-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

@media (max-width: 1200px) {
    .game-container {
        padding: 15px;
    }
}

@media (max-width: 768px) {
    .game-container {
        padding: 10px;
    }
    
    canvas {
        max-width: 100%;
        height: auto;
    }
}

@media (max-width: 480px) {
    .game-container {
        padding: 5px;
    }
    
    .ui-element {
        font-size: 14px;
    }
}

/* Flexible layout */
.flex-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.flex-item {
    flex: 1;
    min-width: 200px;
}

@media (max-width: 600px) {
    .flex-item {
        flex: 100%;
    }
}`
            );
        }

        return responsive;
    }
}

// Exécution directe si appelé en ligne de commande
if (require.main === module) {
    const agent = new JS2DGameFinisher();
    const instruction = process.argv[2] || "Optimise l'architecture modulaire et ajoute des animations fluides";
    
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

module.exports = JS2DGameFinisher;
