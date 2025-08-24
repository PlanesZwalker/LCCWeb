/**
 * game-modular-simple.js - Simplified game module for testing
 * This version doesn't depend on external modules
 */

// Simple fallback classes
class SimpleGameState {
    constructor() {
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.level = 1;
    }
    
    async init() { 
        console.log('✅ SimpleGameState initialized');
        return Promise.resolve();
    }
    
    reset() { 
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.level = 1;
    }
    
    setRunning(value) { this.running = value; }
    setPaused(value) { this.paused = value; }
    setGameOver(value) { this.gameOver = value; }
    isRunning() { return this.running; }
    isPaused() { return this.paused; }
    isGameOver() { return this.gameOver; }
}

class SimpleManager {
    constructor(name) {
        this.name = name;
    }
    
    async init() { 
        console.log(`✅ ${this.name} initialized`);
        return Promise.resolve();
    }
    
    reset() { 
        console.log(`🔄 ${this.name} reset`);
    }
}

class SimpleGameCore {
    constructor() {
        this.gameState = new SimpleGameState();
        this.letterManager = new SimpleManager('LetterManager');
        this.wordManager = new SimpleManager('WordManager');
        this.scoreManager = new SimpleManager('ScoreManager');
        this.levelManager = new SimpleManager('LevelManager');
        this.powerUpManager = new SimpleManager('PowerUpManager');
        this.achievementManager = new SimpleManager('AchievementManager');
        this.tutorialManager = new SimpleManager('TutorialManager');
        this.uiManager = new SimpleManager('UIManager');
        this.audioManager = new SimpleManager('AudioManager');
        this.analyticsManager = new SimpleManager('AnalyticsManager');
        this.backgroundManager = new SimpleManager('BackgroundManager');
        
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
    }
    
    async init(canvas) {
        try {
            console.log('🎮 SimpleGameCore starting initialization...');
            
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            // Initialize all managers
            await this.gameState.init();
            await this.letterManager.init();
            await this.wordManager.init();
            await this.scoreManager.init();
            await this.levelManager.init();
            await this.powerUpManager.init();
            await this.achievementManager.init();
            await this.tutorialManager.init();
            await this.uiManager.init();
            await this.audioManager.init();
            await this.analyticsManager.init();
            await this.backgroundManager.init();
            
            this.isInitialized = true;
            console.log('✅ SimpleGameCore initialized successfully');
        } catch (error) {
            console.error('❌ SimpleGameCore initialization failed:', error);
            throw error;
        }
    }
    
    startGame() {
        if (!this.isInitialized) {
            throw new Error('Game not initialized');
        }
        this.gameState.setRunning(true);
        this.gameState.setPaused(false);
        this.gameState.setGameOver(false);
        console.log('🎮 SimpleGameCore game started');
    }
    
    pauseGame() {
        this.gameState.setPaused(true);
        console.log('⏸ SimpleGameCore game paused');
    }
    
    resumeGame() {
        this.gameState.setPaused(false);
        console.log('▶ SimpleGameCore game resumed');
    }
    
    resetGame() {
        this.gameState.reset();
        this.letterManager.reset();
        this.wordManager.reset();
        this.scoreManager.reset();
        this.levelManager.reset();
        this.powerUpManager.reset();
        this.achievementManager.reset();
        this.tutorialManager.reset();
        this.uiManager.reset();
        this.audioManager.reset();
        this.analyticsManager.reset();
        this.backgroundManager.reset();
        console.log('🔄 SimpleGameCore game reset');
    }
    
    cleanup() {
        this.gameState.reset();
        console.log('🧹 SimpleGameCore cleanup complete');
    }
}

class LettersCascadeGameSimple {
    constructor() {
        this.gameCore = null;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        this.isGameStarted = false;
        this.useFallback = false;
    }

    async init() {
        try {
            console.log('🎮 LettersCascadeGameSimple starting initialization...');
            
            // Get canvas element
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }

            // Create game core
            this.gameCore = new SimpleGameCore();
            console.log('✅ SimpleGameCore created');

            // Initialize game core
            await this.gameCore.init(this.canvas);
            
            this.isInitialized = true;
            console.log('🎮 LettersCascadeGameSimple initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize LettersCascadeGameSimple:', error);
            throw error;
        }
    }

    startGame() {
        try {
            if (!this.isInitialized) {
                throw new Error('Game not initialized');
            }
            
            if (this.isGameStarted) {
                console.log('⚠️ Game already started');
                return;
            }
            
            this.gameCore.startGame();
            this.isGameStarted = true;
            console.log('🎮 Game started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start game:', error);
            throw error;
        }
    }

    pauseGame() {
        try {
            if (!this.isGameStarted) {
                console.log('⚠️ Game not started yet');
                return;
            }
            this.gameCore.pauseGame();
        } catch (error) {
            console.error('❌ Failed to pause game:', error);
        }
    }

    resumeGame() {
        try {
            if (!this.isGameStarted) {
                console.log('⚠️ Game not started yet');
                return;
            }
            this.gameCore.resumeGame();
        } catch (error) {
            console.error('❌ Failed to resume game:', error);
        }
    }

    resetGame() {
        try {
            if (this.isGameStarted) {
                this.gameCore.resetGame();
            }
            this.isGameStarted = false;
            console.log('🔄 Game reset');
        } catch (error) {
            console.error('❌ Failed to reset game:', error);
        }
    }

    cleanup() {
        try {
            this.gameCore.cleanup();
            this.isGameStarted = false;
            console.log('🧹 LettersCascadeGameSimple cleanup complete');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }
}

// Export for use in HTML
window.LettersCascadeGameModular = LettersCascadeGameSimple;

console.log('🎮 LettersCascadeGameSimple class loaded and ready for instantiation');
console.log('🎮 Module timestamp:', new Date().toISOString());
console.log('🎮 Module loaded at:', performance.now());
