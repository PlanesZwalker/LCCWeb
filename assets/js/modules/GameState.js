/**
 * GameState.js - Game state management module
 * Handles game state, configuration, and state transitions
 */

export class GameState {
    constructor() {
        // Core game state
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.gameOverReason = '';
        
        // Game configuration
        this.config = {
            gridSizes: [10, 12, 14],
            currentGridSize: 10,
            gridRows: 14,
            cellSize: 40,
            maxGridFill: 0.85,
            timeLimit: 300000, // 5 minutes in milliseconds
            scoreThreshold: 1000
        };
        
        // Game statistics
        this.stats = {
            level: 1,
            score: 0,
            highScore: 0,
            wordsCompleted: 0,
            lettersPlaced: 0,
            playTime: 0,
            maxCombo: 1,
            startTime: 0
        };
        
        // Game over state
        this.gameOverScreen = {
            visible: false,
            fadeIn: 0,
            showStats: false,
            finalStats: {
                totalScore: 0,
                wordsCompleted: 0,
                lettersPlaced: 0,
                playTime: 0,
                levelReached: 1,
                maxCombo: 1
            }
        };
        
        // Game limits
        this.gameLimits = {
            maxGridFill: 0.85,
            timeLimit: 300000,
            scoreThreshold: 1000
        };
        
        // Game over conditions
        this.gameOverConditions = {
            gridFull: false,
            timeLimit: false,
            noValidMoves: false,
            scoreThreshold: false
        };
    }

    /**
     * Initialize the game state
     */
    async init() {
        try {
            // Load high score from localStorage
            this.stats.highScore = this.loadHighScore();
            
            // Load configuration from localStorage if available
            this.loadConfiguration();
            
            console.log('📊 GameState initialized');
        } catch (error) {
            console.error('❌ GameState initialization failed:', error);
            throw error;
        }
    }

    /**
     * Reset the game state
     */
    reset() {
        try {
            this.running = false;
            this.paused = false;
            this.gameOver = false;
            this.gameOverReason = '';
            
            // Reset statistics
            this.stats.level = 1;
            this.stats.score = 0;
            this.stats.wordsCompleted = 0;
            this.stats.lettersPlaced = 0;
            this.stats.playTime = 0;
            this.stats.maxCombo = 1;
            this.stats.startTime = 0;
            
            // Reset game over screen
            this.gameOverScreen.visible = false;
            this.gameOverScreen.fadeIn = 0;
            this.gameOverScreen.showStats = false;
            
            // Reset game over conditions
            this.gameOverConditions.gridFull = false;
            this.gameOverConditions.timeLimit = false;
            this.gameOverConditions.noValidMoves = false;
            this.gameOverConditions.scoreThreshold = false;
            
            console.log('🔄 GameState reset');
        } catch (error) {
            console.error('❌ Error resetting GameState:', error);
        }
    }

    // Getters and setters for game state
    isRunning() { return this.running; }
    setRunning(value) { this.running = value; }
    
    isPaused() { return this.paused; }
    setPaused(value) { this.paused = value; }
    
    isGameOver() { return this.gameOver; }
    setGameOver(value) { this.gameOver = value; }
    
    getGameOverReason() { return this.gameOverReason; }
    setGameOverReason(reason) { this.gameOverReason = reason; }

    // Configuration getters and setters
    getConfig() { return this.config; }
    setConfig(config) { this.config = { ...this.config, ...config }; }
    
    getGridSize() { return this.config.currentGridSize; }
    setGridSize(size) { 
        if (this.config.gridSizes.includes(size)) {
            this.config.currentGridSize = size;
        }
    }
    
    getGridRows() { return this.config.gridRows; }
    setGridRows(rows) { this.config.gridRows = rows; }
    
    getCellSize() { return this.config.cellSize; }
    setCellSize(size) { this.config.cellSize = size; }

    // Statistics getters and setters
    getStats() { return this.stats; }
    setStats(stats) { this.stats = { ...this.stats, ...stats }; }
    
    getLevel() { return this.stats.level; }
    setLevel(level) { this.stats.level = level; }
    
    getScore() { return this.stats.score; }
    setScore(score) { this.stats.score = score; }
    
    getHighScore() { return this.stats.highScore; }
    setHighScore(score) { 
        this.stats.highScore = score;
        this.saveHighScore();
    }
    
    getWordsCompleted() { return this.stats.wordsCompleted; }
    setWordsCompleted(count) { this.stats.wordsCompleted = count; }
    
    getLettersPlaced() { return this.stats.lettersPlaced; }
    setLettersPlaced(count) { this.stats.lettersPlaced = count; }
    
    getPlayTime() { return this.stats.playTime; }
    setPlayTime(time) { this.stats.playTime = time; }
    
    getMaxCombo() { return this.stats.maxCombo; }
    setMaxCombo(combo) { this.stats.maxCombo = combo; }

    /**
     * Start the game
     */
    startGame() {
        try {
            this.running = true;
            this.paused = false;
            this.gameOver = false;
            this.gameOverReason = '';
            this.stats.startTime = Date.now();
            
            console.log('🎮 Game started');
        } catch (error) {
            console.error('❌ Error starting game:', error);
        }
    }

    /**
     * Pause the game
     */
    pauseGame() {
        try {
            this.paused = true;
            console.log('⏸️ Game paused');
        } catch (error) {
            console.error('❌ Error pausing game:', error);
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        try {
            this.paused = false;
            console.log('▶️ Game resumed');
        } catch (error) {
            console.error('❌ Error resuming game:', error);
        }
    }

    /**
     * End the game
     * @param {string} reason - Reason for game over
     */
    endGame(reason) {
        try {
            this.running = false;
            this.gameOver = true;
            this.gameOverReason = reason;
            this.stats.playTime = Date.now() - this.stats.startTime;
            
            // Calculate final stats
            this.calculateFinalStats();
            
            console.log('🏁 Game ended:', reason);
        } catch (error) {
            console.error('❌ Error ending game:', error);
        }
    }

    /**
     * Update play time
     */
    updatePlayTime() {
        try {
            if (this.running && !this.paused && !this.gameOver) {
                this.stats.playTime = Date.now() - this.stats.startTime;
            }
        } catch (error) {
            console.error('❌ Error updating play time:', error);
        }
    }

    /**
     * Add score
     * @param {number} points - Points to add
     */
    addScore(points) {
        try {
            this.stats.score += points;
            
            // Update high score if necessary
            if (this.stats.score > this.stats.highScore) {
                this.stats.highScore = this.stats.score;
                this.saveHighScore();
            }
        } catch (error) {
            console.error('❌ Error adding score:', error);
        }
    }

    /**
     * Increment words completed
     */
    incrementWordsCompleted() {
        try {
            this.stats.wordsCompleted++;
        } catch (error) {
            console.error('❌ Error incrementing words completed:', error);
        }
    }

    /**
     * Increment letters placed
     */
    incrementLettersPlaced() {
        try {
            this.stats.lettersPlaced++;
        } catch (error) {
            console.error('❌ Error incrementing letters placed:', error);
        }
    }

    /**
     * Update max combo
     * @param {number} combo - New combo value
     */
    updateMaxCombo(combo) {
        try {
            if (combo > this.stats.maxCombo) {
                this.stats.maxCombo = combo;
            }
        } catch (error) {
            console.error('❌ Error updating max combo:', error);
        }
    }

    /**
     * Calculate final statistics
     */
    calculateFinalStats() {
        try {
            this.gameOverScreen.finalStats = {
                totalScore: this.stats.score,
                wordsCompleted: this.stats.wordsCompleted,
                lettersPlaced: this.stats.lettersPlaced,
                playTime: this.stats.playTime,
                levelReached: this.stats.level,
                maxCombo: this.stats.maxCombo
            };
        } catch (error) {
            console.error('❌ Error calculating final stats:', error);
        }
    }

    /**
     * Check if time limit is reached
     * @returns {boolean} Whether time limit is reached
     */
    isTimeLimitReached() {
        try {
            return this.stats.playTime >= this.gameLimits.timeLimit;
        } catch (error) {
            console.error('❌ Error checking time limit:', error);
            return false;
        }
    }

    /**
     * Check if score threshold is reached
     * @returns {boolean} Whether score threshold is reached
     */
    isScoreThresholdReached() {
        try {
            return this.stats.score >= this.gameLimits.scoreThreshold;
        } catch (error) {
            console.error('❌ Error checking score threshold:', error);
            return false;
        }
    }

    /**
     * Get remaining time
     * @returns {number} Remaining time in milliseconds
     */
    getRemainingTime() {
        try {
            const remaining = this.gameLimits.timeLimit - this.stats.playTime;
            return Math.max(0, remaining);
        } catch (error) {
            console.error('❌ Error getting remaining time:', error);
            return 0;
        }
    }

    /**
     * Get time limit
     * @returns {number} Time limit in milliseconds
     */
    getTimeLimit() {
        return this.gameLimits.timeLimit;
    }

    /**
     * Set time limit
     * @param {number} limit - Time limit in milliseconds
     */
    setTimeLimit(limit) {
        this.gameLimits.timeLimit = limit;
    }

    /**
     * Get score threshold
     * @returns {number} Score threshold
     */
    getScoreThreshold() {
        return this.gameLimits.scoreThreshold;
    }

    /**
     * Set score threshold
     * @param {number} threshold - Score threshold
     */
    setScoreThreshold(threshold) {
        this.gameLimits.scoreThreshold = threshold;
    }

    /**
     * Get max grid fill
     * @returns {number} Max grid fill percentage
     */
    getMaxGridFill() {
        return this.gameLimits.maxGridFill;
    }

    /**
     * Set max grid fill
     * @param {number} fill - Max grid fill percentage
     */
    setMaxGridFill(fill) {
        this.gameLimits.maxGridFill = fill;
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        try {
            localStorage.setItem('lettersCascadeHighScore', this.stats.highScore.toString());
        } catch (error) {
            console.error('❌ Error saving high score:', error);
        }
    }

    /**
     * Load high score from localStorage
     * @returns {number} High score
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('lettersCascadeHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.error('❌ Error loading high score:', error);
            return 0;
        }
    }

    /**
     * Save configuration to localStorage
     */
    saveConfiguration() {
        try {
            const config = {
                gridSize: this.config.currentGridSize,
                gridRows: this.config.gridRows,
                cellSize: this.config.cellSize,
                timeLimit: this.gameLimits.timeLimit,
                scoreThreshold: this.gameLimits.scoreThreshold,
                maxGridFill: this.gameLimits.maxGridFill
            };
            localStorage.setItem('lettersCascadeConfig', JSON.stringify(config));
        } catch (error) {
            console.error('❌ Error saving configuration:', error);
        }
    }

    /**
     * Load configuration from localStorage
     */
    loadConfiguration() {
        try {
            const saved = localStorage.getItem('lettersCascadeConfig');
            if (saved) {
                const config = JSON.parse(saved);
                this.config.currentGridSize = config.gridSize || this.config.currentGridSize;
                this.config.gridRows = config.gridRows || this.config.gridRows;
                this.config.cellSize = config.cellSize || this.config.cellSize;
                this.gameLimits.timeLimit = config.timeLimit || this.gameLimits.timeLimit;
                this.gameLimits.scoreThreshold = config.scoreThreshold || this.gameLimits.scoreThreshold;
                this.gameLimits.maxGridFill = config.maxGridFill || this.gameLimits.maxGridFill;
            }
        } catch (error) {
            console.error('❌ Error loading configuration:', error);
        }
    }

    /**
     * Get game over screen state
     * @returns {Object} Game over screen state
     */
    getGameOverScreen() {
        return this.gameOverScreen;
    }

    /**
     * Set game over screen state
     * @param {Object} state - Game over screen state
     */
    setGameOverScreen(state) {
        this.gameOverScreen = { ...this.gameOverScreen, ...state };
    }

    /**
     * Show game over screen
     */
    showGameOverScreen() {
        try {
            this.gameOverScreen.visible = true;
            this.gameOverScreen.fadeIn = 0;
            this.gameOverScreen.showStats = false;
        } catch (error) {
            console.error('❌ Error showing game over screen:', error);
        }
    }

    /**
     * Hide game over screen
     */
    hideGameOverScreen() {
        try {
            this.gameOverScreen.visible = false;
            this.gameOverScreen.fadeIn = 0;
            this.gameOverScreen.showStats = false;
        } catch (error) {
            console.error('❌ Error hiding game over screen:', error);
        }
    }

    /**
     * Get game over conditions
     * @returns {Object} Game over conditions
     */
    getGameOverConditions() {
        return this.gameOverConditions;
    }

    /**
     * Set game over condition
     * @param {string} condition - Condition name
     * @param {boolean} value - Condition value
     */
    setGameOverCondition(condition, value) {
        this.gameOverConditions[condition] = value;
    }

    /**
     * Check if any game over condition is met
     * @returns {boolean} Whether any game over condition is met
     */
    isAnyGameOverConditionMet() {
        return Object.values(this.gameOverConditions).some(condition => condition);
    }

    /**
     * Get game state as JSON
     * @returns {Object} Game state as JSON
     */
    toJSON() {
        return {
            running: this.running,
            paused: this.paused,
            gameOver: this.gameOver,
            gameOverReason: this.gameOverReason,
            config: this.config,
            stats: this.stats,
            gameLimits: this.gameLimits,
            gameOverConditions: this.gameOverConditions
        };
    }

    /**
     * Load game state from JSON
     * @param {Object} json - Game state JSON
     */
    fromJSON(json) {
        try {
            this.running = json.running || false;
            this.paused = json.paused || false;
            this.gameOver = json.gameOver || false;
            this.gameOverReason = json.gameOverReason || '';
            this.config = { ...this.config, ...json.config };
            this.stats = { ...this.stats, ...json.stats };
            this.gameLimits = { ...this.gameLimits, ...json.gameLimits };
            this.gameOverConditions = { ...this.gameOverConditions, ...json.gameOverConditions };
        } catch (error) {
            console.error('❌ Error loading game state from JSON:', error);
        }
    }
}
