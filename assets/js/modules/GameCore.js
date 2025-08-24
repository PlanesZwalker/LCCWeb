/**
 * GameCore.js - Enhanced core game logic module
 * Handles main game state, initialization, and core mechanics
 */

import { GameState } from './GameState.js';
import { LetterManager } from './LetterManager.js';
import { WordManager } from './WordManager.js';
import { ScoreManager } from './ScoreManager.js';
import { LevelManager } from './LevelManager.js';
import { PowerUpManager } from './PowerUpManager.js';
import { AchievementManager } from './AchievementManager.js';
import { TutorialManager } from './TutorialManager.js';
import { UIManager } from './UIManager.js';
import { AudioManager } from './AudioManager.js';
import { AnalyticsManager } from './AnalyticsManager.js';
import { BackgroundManager } from './BackgroundManager.js';

export class GameCore {
    constructor() {
        // Initialize all managers
        this.gameState = new GameState();
        this.letterManager = new LetterManager();
        this.wordManager = new WordManager();
        this.scoreManager = new ScoreManager();
        this.levelManager = new LevelManager();
        this.powerUpManager = new PowerUpManager();
        this.achievementManager = new AchievementManager();
        this.tutorialManager = new TutorialManager();
        this.uiManager = new UIManager();
        this.audioManager = new AudioManager();
        this.analyticsManager = new AnalyticsManager();
        this.backgroundManager = new BackgroundManager();

        // Core game properties
        this.canvas = null;
        this.ctx = null;
        this.fallTimer = null;
        // Use a separate handle to avoid masking the method name
        this.gameLoopHandle = null;
        this._boundGameLoop = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;

        // Performance tracking
        this.fps = 0;
        this.frameTimes = [];

        // Bind methods to maintain context
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    /**
     * Initialize the game
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    async init(canvas) {
        try {
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

            // Setup event listeners
            this.setupEventListeners();

            // Start tutorial if first time
            if (this.shouldShowTutorial()) {
                this.tutorialManager.start();
            }

            // Start background music
            this.audioManager.playGameplayMusic();

            // Start analytics monitoring
            this.analyticsManager.startRealTimeMonitoring();

            // Read difficulty from data-attribute or URL param
            try {
                const param = new URLSearchParams(window.location.search).get('difficulty');
                const htmlDiff = (canvas && canvas.dataset && canvas.dataset.difficulty) ? canvas.dataset.difficulty : null;
                const difficulty = (param || htmlDiff || '').toLowerCase();
                if (['easy','normal','hard','extreme'].includes(difficulty)) {
                    this.levelManager.setDifficulty(difficulty);
                    console.log(`⚙️ Difficulty set to: ${difficulty}`);
                }
            } catch (_) {}

            console.log('🎮 GameCore initialized successfully with enhanced features');
        } catch (error) {
            console.error('❌ GameCore initialization failed:', error);
            throw error;
        }
    }

    /**
     * Start the game
     */
    startGame() {
        try {
            this.gameState.setRunning(true);
            this.gameState.setPaused(false);
            this.gameState.setGameOver(false);

            // Reset all managers
            this.scoreManager.reset();
            this.levelManager.reset();
            this.powerUpManager.reset();
            this.achievementManager.reset();
            this.letterManager.reset();
            this.wordManager.reset();
            this.uiManager.reset();
            this.analyticsManager.reset();
            this.backgroundManager.reset();

            // Start game loop
            this.startGameLoop();

            // Start fall timer
            this.startFallTimer();

            // Track game start
            this.analyticsManager.trackGameStart();

            // Play start sound
            this.audioManager.playSound('button_click');

            console.log('🎮 Game started');
        } catch (error) {
            console.error('❌ Failed to start game:', error);
            throw error;
        }
    }

    /**
     * Start the game loop
     */
    startGameLoop() {
        if (this.gameLoopHandle) {
            cancelAnimationFrame(this.gameLoopHandle);
        }
        
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        const gameLoop = (currentTime) => {
            if (!this.gameState.isRunning() || this.gameState.isPaused()) {
                return;
            }

            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            this.frameCount++;

            // Update game state
            this.update(deltaTime);

            // Render everything
            this.render();

            // Continue the loop
            this.gameLoopHandle = requestAnimationFrame(gameLoop);
        };

        this.gameLoopHandle = requestAnimationFrame(gameLoop);
        console.log('🔄 Game loop started');
    }

    /**
     * Stop the game loop
     */
    stopGameLoop() {
        if (this.gameLoopHandle) {
            cancelAnimationFrame(this.gameLoopHandle);
            this.gameLoopHandle = null;
            console.log('⏹️ Game loop stopped');
        }
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        // Update all managers
        this.backgroundManager.update(deltaTime);
        this.letterManager.update(deltaTime);
        this.wordManager.update(deltaTime);
        this.scoreManager.update(deltaTime);
        this.levelManager.update(deltaTime);
        this.powerUpManager.update(deltaTime);
        this.achievementManager.update(deltaTime);
        this.tutorialManager.update(deltaTime);
        this.uiManager.update(deltaTime);
        this.audioManager.update(deltaTime);
        this.analyticsManager.update(deltaTime);
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render background
        this.backgroundManager.render(this.ctx, this.canvas.width, this.canvas.height);

        // Render game elements
        this.letterManager.render(this.ctx);
        this.wordManager.render(this.ctx);
        this.powerUpManager.render(this.ctx);
        this.achievementManager.render(this.ctx);
        this.tutorialManager.render(this.ctx);
        this.uiManager.render(this.ctx);

        // Render UI overlay
        this.scoreManager.render(this.ctx);
        this.levelManager.render(this.ctx);
    }

    /**
     * Start fall timer
     */
    startFallTimer() {
        if (this.fallTimer) {
            clearInterval(this.fallTimer);
        }
        
        const fallInterval = Math.max(1000 - (this.levelManager.getLevel() * 50), 200);
        this.fallTimer = setInterval(() => {
            if (this.gameState.isRunning() && !this.gameState.isPaused()) {
                this.letterManager.moveFallingLetter('down');
            }
        }, fallInterval);
        
        console.log(`⏰ Fall timer started with ${fallInterval}ms interval`);
    }

    /**
     * Stop fall timer
     */
    stopFallTimer() {
        if (this.fallTimer) {
            clearInterval(this.fallTimer);
            this.fallTimer = null;
            console.log('⏹️ Fall timer stopped');
        }
    }

    /**
     * Pause the game
     */
    pauseGame() {
        try {
            this.gameState.setPaused(true);
            this.stopFallTimer();
            this.audioManager.playSound('button_click');
            console.log('⏸️ Game paused');
        } catch (error) {
            console.error('❌ Failed to pause game:', error);
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        try {
            this.gameState.setPaused(false);
            this.startFallTimer();
            this.audioManager.playSound('button_click');
            console.log('▶️ Game resumed');
        } catch (error) {
            console.error('❌ Failed to resume game:', error);
        }
    }

    /**
     * Reset the game
     */
    resetGame() {
        try {
            this.stopFallTimer();
            this.stopGameLoop();
            
            // Reset all managers
            this.scoreManager.reset();
            this.levelManager.reset();
            this.powerUpManager.reset();
            this.achievementManager.reset();
            this.letterManager.reset();
            this.wordManager.reset();
            this.uiManager.reset();
            this.tutorialManager.reset();
            this.analyticsManager.reset();
            this.backgroundManager.reset();

            this.gameState.setRunning(false);
            this.gameState.setPaused(false);
            this.gameState.setGameOver(false);

            this.audioManager.playSound('button_click');
            console.log('🔄 Game reset');
        } catch (error) {
            console.error('❌ Failed to reset game:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Mouse events
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('click', this.handleMouseClick);
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouch);
        this.canvas.addEventListener('touchmove', this.handleTouch);
        this.canvas.addEventListener('touchend', this.handleTouch);
    }

    /**
     * Handle key press events
     */
    handleKeyPress(event) {
        if (!this.gameState.isRunning() || this.gameState.isPaused()) return;

        switch (event.code) {
            case 'ArrowLeft':
                this.letterManager.moveFallingLetter('left');
                this.audioManager.playSound('button_click', 0.3);
                break;
            case 'ArrowRight':
                this.letterManager.moveFallingLetter('right');
                this.audioManager.playSound('button_click', 0.3);
                break;
            case 'ArrowDown':
                this.letterManager.moveFallingLetter('down');
                this.audioManager.playSound('button_click', 0.3);
                break;
            case 'Space':
            case 'Enter':
                this.letterManager.dropFallingLetter();
                this.audioManager.playLetterPlace();
                break;
            case 'KeyR':
                this.letterManager.rotateFallingLetter();
                this.audioManager.playSound('button_click', 0.3);
                break;
            case 'Escape':
                if (this.gameState.isPaused()) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
                break;
        }
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(event) {
        // Handle mouse hover effects for UI elements
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Add hover effects for UI elements
        this.uiManager.addParticle(x, y, 'sparkle');
    }

    /**
     * Handle mouse clicks
     */
    handleMouseClick(event) {
        if (!this.gameState.isRunning() || this.gameState.isPaused()) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Handle UI button clicks
        // This would be implemented based on UI button positions

        this.audioManager.playSound('button_click');
    }

    /**
     * Handle touch events
     */
    handleTouch(event) {
        event.preventDefault();
        
        if (!this.gameState.isRunning() || this.gameState.isPaused()) return;

        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Handle touch interactions
        // This would be implemented based on touch position and game state
    }

    /**
     * Start the game loop
     */
    startGameLoop() {
        this.lastFrameTime = performance.now();
        if (!this._boundGameLoop) this._boundGameLoop = this._gameMainLoop.bind(this);
        this.gameLoopHandle = requestAnimationFrame(this._boundGameLoop);
    }

    /**
     * Stop the game loop
     */
    stopGameLoop() {
        if (this.gameLoopHandle) {
            cancelAnimationFrame(this.gameLoopHandle);
            this.gameLoopHandle = null;
        }
    }

    /**
     * Main game loop
     */
    _gameMainLoop(currentTime) {
        // Calculate FPS
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.frameTimes.push(deltaTime);
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }
        
        this.fps = 1000 / (this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length);

        // Update performance analytics
        this.analyticsManager.updatePerformanceMetrics(this.fps);

        // Update game state
        this.update(deltaTime);

        // Render game
        this.render();

        // Continue loop
        if (this.gameState.isRunning()) {
            this.gameLoopHandle = requestAnimationFrame(this._boundGameLoop);
        }
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        if (!this.gameState.isRunning() || this.gameState.isPaused()) return;

        // Update all managers
        this.letterManager.update();
        this.wordManager.update();
        this.scoreManager.update();
        this.levelManager.update();
        this.powerUpManager.update();
        this.achievementManager.update();
        this.tutorialManager.update();
        this.uiManager.update();
        this.analyticsManager.update();
        this.backgroundManager.update(deltaTime);

        // Check for word completion
        const completedWords = this.wordManager.checkWordCompletion(this.letterManager.getGrid());
        completedWords.forEach(word => {
            if (this.wordManager.completeWord(word)) {
                const scoreResult = this.scoreManager.completeWord(word);
                this.levelManager.updateLevel(this.scoreManager.getWordsCompleted());
                
                // Track word completion
                this.analyticsManager.trackWordCompleted(word, scoreResult.totalPoints, this.levelManager.getLevel());
                
                // Play sound effects
                this.audioManager.playWordComplete();
                if (this.scoreManager.getCombo() > 1) {
                    this.audioManager.playCombo();
                }
                
                // Add visual effects
                this.uiManager.addParticle(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    'success'
                );
                
                // Add notification
                this.uiManager.addNotification(
                    `Word completed: ${word} (+${scoreResult.totalPoints} pts)`,
                    'success'
                );
            }
        });

        // Check for level up
        if (this.levelManager.getLevel() > this.gameState.getLevel()) {
            const oldLevel = this.gameState.getLevel();
            const newLevel = this.levelManager.getLevel();
            this.gameState.setLevel(newLevel);
            
            // Track level up
            this.analyticsManager.trackLevelUp(oldLevel, newLevel);
            
            this.audioManager.playLevelUp();
            this.uiManager.addNotification('Level Up!', 'info');
        }

        // Check for achievements
        const stats = this.scoreManager.getScoreStats();
        const newAchievements = this.achievementManager.checkAchievements(stats);
        newAchievements.forEach(achievement => {
            // Track achievement unlock
            this.analyticsManager.trackAchievementUnlocked(achievement.name);
            
            this.audioManager.playAchievement();
            this.uiManager.addNotification(
                `Achievement: ${achievement.name}`,
                'success'
            );
        });

        // Check game over conditions
        this.checkGameOverConditions();
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render background using BackgroundManager
        this.backgroundManager.render(this.ctx, this.canvas.width, this.canvas.height);

        // Render game elements
        this.letterManager.render(this.ctx);
        this.wordManager.render(this.ctx);
        this.scoreManager.render(this.ctx);
        this.powerUpManager.render(this.ctx);
        this.achievementManager.render(this.ctx);
        this.tutorialManager.render(this.ctx);
        this.uiManager.render(this.ctx);

        // Render FPS (debug)
        if (this.gameState.isDebugMode()) {
            this.renderFPS();
        }
    }

    /**
     * Render FPS counter
     */
    renderFPS() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${Math.round(this.fps)}`, 10, this.canvas.height - 10);
    }

    /**
     * Start fall timer
     */
    startFallTimer() {
        this.stopFallTimer();
        this.fallTimer = setInterval(() => {
            if (this.gameState.isRunning() && !this.gameState.isPaused()) {
                this.letterManager.updateFallingLetter();
            }
        }, this.levelManager.getFallSpeed());
    }

    /**
     * Stop fall timer
     */
    stopFallTimer() {
        if (this.fallTimer) {
            clearInterval(this.fallTimer);
            this.fallTimer = null;
        }
    }

    /**
     * Check game over conditions
     */
    checkGameOverConditions() {
        const grid = this.letterManager.getGrid();
        
        // Check if grid is full
        if (this.letterManager.isGridFull()) {
            this.endGame('Grid is full!');
            return;
        }

        // Check if no valid moves
        if (this.letterManager.noValidMoves()) {
            this.endGame('No valid moves!');
            return;
        }

        // Check time limit (if implemented)
        // Check score threshold (if implemented)
    }

    /**
     * End the game
     */
    endGame(reason) {
        this.gameState.setGameOver(true);
        this.gameState.setGameOverReason(reason);
        this.stopFallTimer();
        this.stopGameLoop();

        // Track game end
        const finalStats = this.getGameStats();
        this.analyticsManager.trackGameEnd(reason, finalStats);

        this.audioManager.playGameOver();
        this.uiManager.addNotification('Game Over!', 'error');

        console.log(`🎮 Game ended: ${reason}`);
    }

    /**
     * Check if tutorial should be shown
     */
    shouldShowTutorial() {
        try {
            const hasPlayedBefore = localStorage.getItem('hasPlayedBefore');
            return !hasPlayedBefore;
        } catch (error) {
            return true;
        }
    }

    /**
     * Mark tutorial as completed
     */
    completeTutorial() {
        try {
            localStorage.setItem('hasPlayedBefore', 'true');
        } catch (error) {
            console.warn('⚠️ Failed to save tutorial completion');
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        try {
            // Remove event listeners
            document.removeEventListener('keydown', this.handleKeyPress);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('click', this.handleMouseClick);
            this.canvas.removeEventListener('touchstart', this.handleTouch);
            this.canvas.removeEventListener('touchmove', this.handleTouch);
            this.canvas.removeEventListener('touchend', this.handleTouch);

            // Stop timers and loops
            this.stopFallTimer();
            this.stopGameLoop();

            // Cleanup analytics
            this.analyticsManager.cleanup();

            // Reset all managers
            this.resetGame();

            console.log('🧹 GameCore cleanup complete');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }

    /**
     * Get game statistics
     */
    getGameStats() {
        return {
            score: this.scoreManager.getScoreStats(),
            level: this.levelManager.getLevel(),
            achievements: this.achievementManager.achievements,
            powerUps: this.powerUpManager.getPowerUpStats(),
            words: this.wordManager.getWordProgress(),
            performance: {
                fps: this.fps,
                frameCount: this.frameCount
            },
            analytics: this.analyticsManager.getAnalytics(),
            background: this.backgroundManager.getPerformanceMetrics()
        };
    }

    /**
     * Start the game
     */
    startGame() {
        try {
            console.log('🎮 Starting game...');
            
            // Set game state to running
            this.gameState.setRunning(true);
            this.gameState.setPaused(false);
            this.gameState.setGameOver(false);
            
            // Create initial falling letter
            this.letterManager.createFallingLetter();
            
            // Start fall timer
            this.startFallTimer();
            
            // Start game loop
            this.startGameLoop();
            
            // Start background music
            this.audioManager.playGameplayMusic();
            
            console.log('✅ Game started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start game:', error);
        }
    }

    /**
     * Pause the game
     */
    pauseGame() {
        try {
            this.gameState.setPaused(true);
            this.stopFallTimer();
            this.stopGameLoop();
            this.audioManager.pauseGameplayMusic();
            console.log('⏸ Game paused');
        } catch (error) {
            console.error('❌ Failed to pause game:', error);
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        try {
            this.gameState.setPaused(false);
            this.startFallTimer();
            this.startGameLoop();
            this.audioManager.resumeGameplayMusic();
            console.log('▶ Game resumed');
        } catch (error) {
            console.error('❌ Failed to resume game:', error);
        }
    }

    /**
     * Start the game loop
     */
    startGameLoop() {
        try {
            this.stopGameLoop();
            
            this._boundGameLoop = this.gameLoop.bind(this);
            this.gameLoopHandle = requestAnimationFrame(this._boundGameLoop);
            
            console.log('🔄 Game loop started');
        } catch (error) {
            console.error('❌ Failed to start game loop:', error);
        }
    }

    /**
     * Stop the game loop
     */
    stopGameLoop() {
        try {
            if (this.gameLoopHandle) {
                cancelAnimationFrame(this.gameLoopHandle);
                this.gameLoopHandle = null;
            }
        } catch (error) {
            console.error('❌ Failed to stop game loop:', error);
        }
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        try {
            // Calculate delta time
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            // Update FPS
            this.updateFPS(deltaTime);
            
            // Update game state if running and not paused
            if (this.gameState.isRunning() && !this.gameState.isPaused()) {
                this.update(deltaTime);
            }
            
            // Always render
            this.render();
            
            // Continue loop
            this.gameLoopHandle = requestAnimationFrame(this._boundGameLoop);
            
        } catch (error) {
            console.error('❌ Error in game loop:', error);
        }
    }

    /**
     * Update FPS calculation
     */
    updateFPS(deltaTime) {
        this.frameTimes.push(deltaTime);
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }
        
        const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
        this.fps = 1000 / avgFrameTime;
        this.frameCount++;
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        try {
            // Update all managers
            this.letterManager.update(deltaTime);
            this.wordManager.update(deltaTime);
            this.scoreManager.update(deltaTime);
            this.levelManager.update(deltaTime);
            this.powerUpManager.update(deltaTime);
            this.achievementManager.update(deltaTime);
            this.tutorialManager.update(deltaTime);
            this.uiManager.update(deltaTime);
            this.audioManager.update(deltaTime);
            this.analyticsManager.update(deltaTime);
            this.backgroundManager.update(deltaTime);
            
            // Check for game over conditions
            this.checkGameOverConditions();
            
        } catch (error) {
            console.error('❌ Error updating game:', error);
        }
    }
}
