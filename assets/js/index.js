// Complete Game Engine for Letters Cascade Challenge
// Implements all functionalities from technical specifications

class LettersCascadeGame {
    constructor() {
        // console.log('🎮 LettersCascadeGame constructor called');
        
        // Grid Configuration - IMPROVED: Larger grid for better gameplay
        this.gridSizes = [10, 12, 14];
        this.currentGridSize = 10; // Default to 10 columns
        this.gridRows = 14; // IMPROVED: 14 rows for more vertical space
        this.cellSize = 40;
        
        // Game State
        this.gameRunning = false;
        this.paused = false;
        this.gameOver = false;
        this.gameOverReason = '';
        this.level = 1;
        this.score = 0;
        this.highScore = this.loadHighScore();
        
        // Game Over State
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
        
        // Game Mechanics
        this.letters = [];
        this.letterQueue = [];
        this.wordsFound = [];
        this.targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'];
        this.fallingLetter = null;
        
        // 🎯 NEW: Power-up System
        this.powerUps = {
            available: ['multiplier', 'timeExtend', 'bomb', 'hint'],
            active: [],
            multiplier: { duration: 10000, factor: 2 },
            timeExtend: { duration: 15000, bonus: 30000 },
            bomb: { radius: 2, cost: 50 },
            hint: { cost: 30 }
        };
        
        // 🎯 NEW: Achievement System
        this.achievements = {
            firstWord: { name: 'First Word', description: 'Complete your first word', earned: false },
            combo3: { name: 'Combo Master', description: 'Get a 3-word combo', earned: false },
            level5: { name: 'Level 5', description: 'Reach level 5', earned: false },
            score1000: { name: 'High Scorer', description: 'Score 1000 points', earned: false }
        };
        
        // 🎯 NEW: Tutorial System
        this.tutorial = {
            active: false,
            step: 0,
            steps: [
                { message: 'Welcome! Use arrow keys to move the falling letter', action: 'highlight_controls' },
                { message: 'Place letters to form words', action: 'highlight_grid' },
                { message: 'Complete words to score points!', action: 'highlight_words' }
            ]
        };
        // IMPROVED: Configurable fall speed with level-based progression - MUCH SLOWER for better gameplay
        // ALL SPEEDS DIVIDED BY 10 FOR SLOWER GAMEPLAY
        this.levelFallSpeedMap = {
            1: 40000,   // Level 1: 40 seconds per drop (very slow for beginners)
            2: 35000,   // Level 2: 35 seconds
            3: 30000,   // Level 3: 30 seconds
            4: 25000,   // Level 4: 25 seconds
            5: 20000,   // Level 5: 20 seconds
            6: 18000,   // Level 6: 18 seconds
            7: 16000,   // Level 7: 16 seconds
            8: 14000,   // Level 8: 14 seconds
            9: 12000,   // Level 9: 12 seconds
            10: 10000   // Level 10: 10 seconds (still manageable)
        };
        this.fallSpeed = this.levelFallSpeedMap[1]; // Start with level 1 speed
        this.fallTimer = null;
        
        // Game Over Conditions
        this.gameOverConditions = {
            gridFull: false,
            timeLimit: false,
            noValidMoves: false,
            scoreThreshold: false
        };
        
        // Game Limits
        this.gameLimits = {
            maxGridFill: 0.85, // 85% grid fill triggers game over
            timeLimit: 300000, // 5 minutes in milliseconds
            minScoreForLevel: 100,
            maxLevel: 10
        };
        
        // 🎯 INTELLIGENT BALANCING SYSTEM
        this.balancingSystem = {
            // Letter Distribution based on target words
            letterFrequency: this.calculateLetterFrequency(),
            
            // Dynamic speed adjustment - ALL SPEEDS DIVIDED BY 10
            baseFallSpeed: 20000,
            minFallSpeed: 10000,
            maxFallSpeed: 40000,
            speedMultiplier: 1.0,
            
            // Grid size optimization
            optimalGridSize: 10,
            gridSizeAdjustment: 0,
            
            // Word difficulty scaling
            wordDifficulty: {
                easy: ['CHAT', 'LIVRE', 'TABLE'],
                medium: ['MAISON', 'JARDIN', 'PORTE'],
                hard: ['MUSIQUE', 'FENÊTRE']
            },
            
            // Level progression balance
            levelBalance: {
                lettersPerLevel: 3,
                speedIncrease: 0.1,
                complexityIncrease: 0.15
            }
        };
        
        // Scoring System
        this.combo = 1;
        this.maxCombo = 1;
        this.lastWordTime = 0;
        this.comboTimeout = 5000; // 5 seconds for combo
        
        // Statistics
        this.stats = {
            lettersPlaced: 0,
            wordsCompleted: 0,
            totalScore: 0,
            playTime: 0,
            startTime: null,
            gameStartTime: null
        };
        
        // Systems
        this.particleSystem = new ParticleSystem();
        this.audioManager = new AudioManager();
        this.scoreManager = new ScoreManager();
        this.levelManager = new LevelManager();
        
        // Input handling
        this.keys = {};
        
        // Apply initial balancing
        this.applyBalancing();
        
        console.log('📊 Initial game state:', {
            gridSize: this.currentGridSize,
            cellSize: this.cellSize,
            level: this.level,
            score: this.score,
            targetWords: this.targetWords.length,
            fallSpeed: this.fallSpeed,
            letterFrequency: this.balancingSystem.letterFrequency
        });
    }
    
    // Initialize game
    async init() {
        console.log('🚀 Initializing LettersCascadeGame...');
        
        try {
            // Wait for DOM to be ready
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize canvas with retry mechanism
            let retryCount = 0;
            const maxRetries = 10;
            
            while (retryCount < maxRetries) {
                this.canvas = document.getElementById('gameCanvas');
                if (this.canvas) {
                    break;
                }
                console.log(`🔄 Canvas not found, retrying... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 100));
                retryCount++;
            }
            
            if (!this.canvas) {
                throw new Error('Canvas element #gameCanvas not found after multiple retries');
            }
            
            // Get 2D context with retry mechanism
            retryCount = 0;
            while (retryCount < maxRetries) {
                this.ctx = this.canvas.getContext('2d');
                if (this.ctx) {
                    break;
                }
                console.log(`🔄 Canvas context not available, retrying... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 100));
                retryCount++;
            }
            
            if (!this.ctx) {
                throw new Error('Unable to get 2D rendering context after multiple retries');
            }
            
            console.log('✅ Canvas initialized:', {
                width: this.canvas.width,
                height: this.canvas.height,
                context: this.ctx
            });
            
            // Initialize grid
            this.createGrid();
            
            // Initialize letter queue
            this.generateLetterQueue();
            
            // Load dictionary first
            this.dictionary = this.loadDictionary();
            
            // Initialize word detector with dictionary
            this.wordDetector = new WordDetector(this.dictionary);
            
            // Initialize score and level managers
            this.scoreManager = new ScoreManager();
            this.levelManager = new LevelManager();
            
            // Initialize particle system
            this.particleSystem = new ParticleSystem();
            
            // Initialize audio manager
            this.audioManager = new AudioManager();
            
            // Initialize shader system for 2D
            if (window.gameShaders) {
                window.gameShaders.init2DShaders(this.canvas);
            }
            
            // Setup controls
            this.setupControls();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Apply intelligent balancing
            this.applyBalancing();
            
            // Resize canvas to proper dimensions
            this.resizeCanvas();
            
            // Initial render
            this.render();
            
            console.log('✅ Game initialization completed successfully');
            return Promise.resolve();
            
        } catch (error) {
            console.error('❌ Error during game initialization:', error);
            return Promise.reject(error);
        }
    }
    
    // 🎯 INTELLIGENT BALANCING METHODS
    
    calculateLetterFrequency() {
        // console.log('📊 Calculating letter frequency for target words...');
        
        const frequency = {};
        const allLetters = this.targetWords.join('').split('');
        
        // Count letter frequency
        allLetters.forEach(letter => {
            frequency[letter] = (frequency[letter] || 0) + 1;
        });
        
        // Calculate percentages
        const totalLetters = allLetters.length;
        Object.keys(frequency).forEach(letter => {
            frequency[letter] = {
                count: frequency[letter],
                percentage: (frequency[letter] / totalLetters) * 100,
                priority: frequency[letter] / totalLetters
            };
        });
        
        // console.log('📈 Letter frequency calculated:', frequency);
        return frequency;
    }
    
    applyBalancing() {
        // console.log('⚖️ Applying intelligent game balancing...');
        
        // 1. Adjust fall speed based on level and complexity
        this.adjustFallSpeed();
        
        // 2. Optimize grid size for current words
        this.optimizeGridSize();
        
        // 3. Generate balanced letter queue
        this.generateBalancedLetterQueue();
        
        // 4. Update target words based on level
        this.updateTargetWords();
        
        // console.log('✅ Balancing applied:', {
        //     fallSpeed: this.fallSpeed,
        //     gridSize: this.currentGridSize,
        //     targetWords: this.targetWords,
        //     queueLength: this.letterQueue.length
        // });
    }
    
    adjustFallSpeed() {
        // IMPROVED: Use level-based fall speed map for better pacing
        const maxLevel = Math.max(...Object.keys(this.levelFallSpeedMap).map(Number));
        const currentLevel = Math.min(this.level, maxLevel);
        
        // Get fall speed for current level, with fallback to level 1 speed
        const newFallSpeed = this.levelFallSpeedMap[currentLevel] || this.levelFallSpeedMap[1];
        
        // Apply complexity multiplier for word difficulty
        const complexityMultiplier = this.calculateComplexityMultiplier();
        this.fallSpeed = Math.round(newFallSpeed * complexityMultiplier);
        
        // Ensure speed stays within reasonable bounds - ALL SPEEDS DIVIDED BY 10
        this.fallSpeed = Math.max(3000, Math.min(20000, this.fallSpeed)); // Increased minimum to 3000ms (3 seconds)
        
        console.log('⚡ Fall speed adjusted:', {
            level: this.level,
            currentLevel: currentLevel,
            fallSpeed: this.fallSpeed,
            complexityMultiplier: complexityMultiplier
        });
        
        // Restart timer with new speed if game is running
        if (this.gameRunning && this.fallTimer) {
            this.restartFallTimer();
        }
    }
    
    calculateComplexityMultiplier() {
        const avgWordLength = this.targetWords.reduce((sum, word) => sum + word.length, 0) / this.targetWords.length;
        const complexityScore = avgWordLength / 5; // Normalize to 5-letter words
        
        // More complex words = slower speed for better control
        return Math.max(0.8, Math.min(1.2, 1.1 - (complexityScore - 1) * 0.1));
    }
    
    optimizeGridSize() {
        const maxWordLength = Math.max(...this.targetWords.map(word => word.length));
        const avgWordLength = this.targetWords.reduce((sum, word) => sum + word.length, 0) / this.targetWords.length;
        
        // Calculate optimal grid size based on word lengths
        let optimalSize = Math.max(8, Math.min(12, Math.ceil(maxWordLength * 1.5)));
        
        // Adjust for number of words
        if (this.targetWords.length > 6) {
            optimalSize = Math.min(optimalSize + 1, 12);
        }
        
        // Ensure grid size is in available options
        if (!this.gridSizes.includes(optimalSize)) {
            optimalSize = this.gridSizes.reduce((prev, curr) => 
                Math.abs(curr - optimalSize) < Math.abs(prev - optimalSize) ? curr : prev
            );
        }
        
        this.currentGridSize = optimalSize;
        this.cellSize = Math.floor(400 / optimalSize); // Adjust cell size for grid
        
        // console.log('📐 Grid size optimized:', {
        //     maxWordLength: maxWordLength,
        //     avgWordLength: avgWordLength,
        //     wordCount: this.targetWords.length,
        //     optimalSize: optimalSize,
        //     cellSize: this.cellSize
        // });
    }
    
    generateBalancedLetterQueue() {
        // console.log('🎲 Generating balanced letter queue...');
        
        this.letterQueue = [];
        const frequency = this.balancingSystem.letterFrequency;
        const targetQueueSize = 15; // Optimal queue size
        
        // Create weighted letter pool
        const letterPool = [];
        Object.keys(frequency).forEach(letter => {
            const weight = Math.ceil(frequency[letter].priority * 100);
            for (let i = 0; i < weight; i++) {
                letterPool.push(letter);
            }
        });
        
        // Add some common letters for variety
        const commonLetters = ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T', 'N', 'L'];
        commonLetters.forEach(letter => {
            if (!frequency[letter]) {
                for (let i = 0; i < 5; i++) {
                    letterPool.push(letter);
                }
            }
        });
        
        // Generate balanced queue
        for (let i = 0; i < targetQueueSize; i++) {
            const randomIndex = Math.floor(Math.random() * letterPool.length);
            this.letterQueue.push(letterPool[randomIndex]);
        }
        
        // console.log('📋 Balanced letter queue generated:', {
        //     queueLength: this.letterQueue.length,
        //     uniqueLetters: [...new Set(this.letterQueue)].length,
        //     nextLetters: this.letterQueue.slice(0, 5)
        // });
    }
    
    updateTargetWords() {
        // console.log('📝 Updating target words for level', this.level);
        
        const difficulty = this.getDifficultyForLevel();
        const wordCount = Math.min(3 + Math.floor(this.level / 2), 8);
        
        // Select words based on difficulty and level
        let selectedWords = [];
        
        if (difficulty === 'easy') {
            selectedWords = [...this.balancingSystem.wordDifficulty.easy];
        } else if (difficulty === 'medium') {
            selectedWords = [
                ...this.balancingSystem.wordDifficulty.easy,
                ...this.balancingSystem.wordDifficulty.medium
            ];
        } else {
            selectedWords = [
                ...this.balancingSystem.wordDifficulty.easy,
                ...this.balancingSystem.wordDifficulty.medium,
                ...this.balancingSystem.wordDifficulty.hard
            ];
        }
        
        // Shuffle and select appropriate number
        selectedWords = this.shuffleArray(selectedWords).slice(0, wordCount);
        
        this.targetWords = selectedWords;
        
        // console.log('🎯 Target words updated:', {
        //     level: this.level,
        //     difficulty: difficulty,
        //     wordCount: this.targetWords.length,
        //     words: this.targetWords
        // });
    }
    
    getDifficultyForLevel() {
        if (this.level <= 3) return 'easy';
        if (this.level <= 6) return 'medium';
        return 'hard';
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Update balancing when level changes
    updateBalancingForLevel() {
        console.log('🔄 Updating balancing for level', this.level);
        
        this.applyBalancing();
        
        // Update display
        this.updateDisplay();
        
        // Show level up effect
        this.showLevelUpEffect();
    }
    
    startGameLoop() {
        console.log('🔄 Starting game loop...');
        
        const gameLoop = () => {
            if (this.gameRunning && !this.paused && !this.gameOver) {
                this.updateFallingLetter();
                this.render();
                this.checkGameOverConditions();
            }
            
            // Continue the loop
            if (this.gameRunning) {
                requestAnimationFrame(gameLoop);
            }
        };
        
        // Start the game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Grid System
    createGrid() {
        // console.log('🏗️ Creating game grid...');
        this.grid = [];
        // IMPROVED: Use larger grid with 14 rows and 10 columns for better gameplay
        for (let row = 0; row < this.gridRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.currentGridSize; col++) {
                this.grid[row][col] = null;
            }
        }
        // console.log('✅ Grid created:', this.currentGridSize + 'x' + this.gridRows);
    }
    
    // Letter Generation System
    generateLetterQueue() {
        // console.log('📝 Generating letter queue...');
        this.letterQueue = [];
        
        // Enhanced letter distribution for better gameplay
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
        
        // Target words for better letter distribution
        const targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'PORTE', 'FENETRE'];
        
        // Generate letters based on target words
        for (let i = 0; i < 10; i++) {
            if (i < 5) {
                // First 5 letters: balanced distribution
                if (Math.random() < 0.4) {
                    this.letterQueue.push(vowels[Math.floor(Math.random() * vowels.length)]);
                } else {
                    this.letterQueue.push(consonants[Math.floor(Math.random() * consonants.length)]);
                }
            } else {
                // Last 5 letters: weighted towards target words
                const targetWord = targetWords[Math.floor(Math.random() * targetWords.length)];
                const targetLetter = targetWord[Math.floor(Math.random() * targetWord.length)];
                this.letterQueue.push(targetLetter);
            }
        }
        
        // console.log('✅ Letter queue generated:', this.letterQueue);
        this.updateLetterQueueDisplay();
    }
    
    // Enhanced Word Detection System
    checkWordCompletion() {
        console.log('🔍 Checking word completion...');
        
        // Check if wordDetector is available
        if (!this.wordDetector) {
            console.error('❌ WordDetector not initialized');
            return;
        }
        
        try {
            const words = this.wordDetector.scanGrid(this.grid);
            console.log('📝 Words found:', words);
            
            if (words.length > 0) {
                words.forEach(word => {
                    this.completeWord(word);
                });
                
                // Update combo
                this.combo += words.length;
                if (this.combo > this.maxCombo) {
                    this.maxCombo = this.combo;
                }
                
                // Add combo bonus
                if (this.combo > 1) {
                    const comboBonus = this.combo * 50;
                    this.addScore(comboBonus);
                    this.showComboEffect(comboBonus);
                }
            } else {
                this.combo = 0;
            }
            
            this.updateDisplay();
        } catch (error) {
            console.error('❌ Error checking word completion:', error);
        }
    }
    
    completeWord(word) {
        console.log('🎉 Word completed:', word);
        
        // Add to found words
        this.wordsFound.push(word);
        
        // Calculate score according to rules
        let baseScore = 0;
        switch(word.length) {
            case 3:
                baseScore = 100;
                break;
            case 4:
                baseScore = 250;
                break;
            case 5:
                baseScore = 500;
                break;
            default: // 6+ letters
                baseScore = 1000 + (word.length - 6) * 100; // Bonus for longer words
                break;
        }
        
        // Apply combo multiplier (+50% per word in combo)
        const comboMultiplier = 1 + (this.combo - 1) * 0.5;
        const totalScore = Math.floor(baseScore * comboMultiplier);
        
        this.addScore(totalScore);
        
        // Update combo
        this.combo++;
        this.lastWordTime = Date.now();
        
        // Enhanced visual effects
        this.showEnhancedWordCompletionNotification(word, totalScore);
        
        // Remove word from grid with enhanced effect
        this.removeWordFromGrid(word);
        
        // Check for victory condition - all target words completed
        this.checkVictoryCondition();
        
        // Update level
        this.updateLevel();
        
        // Random power-up chance
        if (Math.random() < 0.2) {
            this.addPowerUp();
        }
        
        console.log('📊 Word completion stats:', {
            word: word,
            wordLength: word.length,
            baseScore: baseScore,
            comboMultiplier: comboMultiplier,
            totalScore: totalScore,
            combo: this.combo,
            wordsFound: this.wordsFound.length
        });
    }
    
    showEnhancedWordCompletionNotification(word, score) {
        console.log('🎉 Showing word completion notification:', { word, score });
        
        // Create notification element with enhanced styling
        const notification = document.createElement('div');
        notification.className = 'word-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="word-display">
                    <span class="word-text">${word}</span>
                    <span class="score-bonus">+${score}</span>
                </div>
                <div class="combo-display">
                    <span class="combo-text">Combo x${this.combo}</span>
                </div>
                <div class="particle-container"></div>
            </div>
        `;
        
        // Add enhanced CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .word-completion-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                animation: wordCompletionAppear 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            @keyframes wordCompletionAppear {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.3) rotate(-10deg);
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.1) rotate(2deg);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1) rotate(0deg);
                }
            }
            
            .notification-content {
                background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 20px;
                padding: 30px 40px;
                box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
                border: 3px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(20px);
                position: relative;
                overflow: hidden;
            }
            
            .notification-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
                animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.6; }
            }
            
            .word-display {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .word-text {
                display: block;
                font-size: 3rem;
                font-weight: 900;
                color: white;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                margin-bottom: 10px;
                animation: wordGlow 1s ease-in-out infinite alternate;
            }
            
            @keyframes wordGlow {
                from { text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
                to { text-shadow: 0 4px 30px rgba(255, 255, 255, 0.5); }
            }
            
            .score-bonus {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: #fbbf24;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                animation: scoreBounce 0.6s ease-out;
            }
            
            @keyframes scoreBounce {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .combo-display {
                text-align: center;
            }
            
            .combo-text {
                display: inline-block;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 1rem;
                animation: comboPulse 1s ease-in-out infinite;
            }
            
            @keyframes comboPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .particle-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Create particle effects
        this.createNotificationParticles(notification);
        
        // Create celebration particles using shader system
        if (window.gameShaders && window.gameShaders.createCelebrationParticles) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            window.gameShaders.createCelebrationParticles(centerX, centerY, 30);
        }
        
        // Play sound effect
        this.audioManager.playWordComplete();
        
        // Remove notification after animation
        setTimeout(() => {
            notification.style.animation = 'wordCompletionDisappear 0.5s ease-out forwards';
            
            // Add disappear animation
            const disappearStyle = document.createElement('style');
            disappearStyle.textContent = `
                @keyframes wordCompletionDisappear {
                    to {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8) rotate(10deg);
                    }
                }
            `;
            document.head.appendChild(disappearStyle);
            
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
                document.head.removeChild(disappearStyle);
            }, 500);
        }, 2000);
    }
    
    createNotificationParticles(notification) {
        const container = notification.querySelector('.particle-container');
        const rect = container.getBoundingClientRect();
        
        // Create celebration particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#ef4444' : '#8b5cf6'};
                border-radius: 50%;
                pointer-events: none;
                animation: particleFloat 2s ease-out forwards;
            `;
            
            // Random position
            particle.style.left = Math.random() * rect.width + 'px';
            particle.style.top = Math.random() * rect.height + 'px';
            
            // Random animation delay
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            
            container.appendChild(particle);
            
            // Add particle animation
            const particleStyle = document.createElement('style');
            particleStyle.textContent = `
                @keyframes particleFloat {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-100px) scale(0);
                    }
                }
            `;
            document.head.appendChild(particleStyle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                if (particleStyle.parentNode) {
                    particleStyle.parentNode.removeChild(particleStyle);
                }
            }, 2500);
        }
    }
    
    removeWordFromGrid(word) {
        // Find and remove letters of the word from grid
        for (let row = 0; row < this.currentGridSize; row++) {
            for (let col = 0; col < this.currentGridSize; col++) {
                if (this.grid[row][col] === word[0]) {
                    // Check if this is the start of the word
                    if (this.checkWordAtPosition(row, col, word)) {
                        this.removeWordAtPosition(row, col, word);
                        return;
                    }
                }
            }
        }
    }
    
    checkWordAtPosition(row, col, word) {
        // Check horizontal
        if (col + word.length <= this.currentGridSize) {
            let match = true;
            for (let i = 0; i < word.length; i++) {
                if (this.grid[row][col + i] !== word[i]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        
        // Check vertical
        if (row + word.length <= this.currentGridSize) {
            let match = true;
            for (let i = 0; i < word.length; i++) {
                if (this.grid[row + i][col] !== word[i]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        
        return false;
    }
    
    removeWordAtPosition(row, col, word) {
        // Remove letters from grid
        for (let i = 0; i < word.length; i++) {
            this.grid[row][col + i] = null;
        }
    }
    
    // Scoring System
    addScore(points) {
        console.log('💰 Score update:', {
            previousScore: this.score,
            pointsEarned: points,
            combo: this.combo,
            level: this.level
        });
        
        const oldScore = this.score;
        this.score += points * this.combo;
        
        console.log('✅ Score updated:', {
            oldScore: oldScore,
            newScore: this.score,
            pointsAdded: points * this.combo,
            comboMultiplier: this.combo
        });
        
        // Update high score if needed
        if (this.score > this.highScore) {
            console.log('🏆 New high score!:', {
                previousHigh: this.highScore,
                newHigh: this.score
            });
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.updateScoreDisplay();
    }
    
    // Level System
    updateLevel() {
        console.log('📈 updateLevel() called');
        console.log('📊 Level progression check:', {
            currentLevel: this.level,
            wordsFound: this.wordsFound.length,
            score: this.score,
            targetWords: this.targetWords.length
        });
        
        const previousLevel = this.level;
        
        // Level progression based on score according to rules
        const levelRequirements = {
            1: 1000,
            2: 2500,
            3: 5000,
            4: 10000,
            5: 15000,
            6: 20000,
            7: 25000,
            8: 30000,
            9: 35000,
            10: 40000
        };
        
        const currentRequirement = levelRequirements[this.level];
        
        if (this.score >= currentRequirement) {
            this.level++;
            console.log('🎉 Level up! Level', previousLevel, '→ Level', this.level);
            
            // IMPROVED: Adjust fall speed for new level
            this.adjustFallSpeed();
            
            // Apply intelligent balancing for new level
            this.updateBalancingForLevel();
            
            console.log('🏆 Level up achievement unlocked!');
            this.showLevelUpEffect();
            this.updateProgressionBar();
        }
        
        console.log('📊 Level progression result:', {
            previousLevel: previousLevel,
            newLevel: this.level,
            levelChanged: this.level > previousLevel,
            currentScore: this.score,
            requiredScore: currentRequirement,
            wordsFound: this.wordsFound.length
        });
    }
    
    updateProgressionBar() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = (this.wordsFound.length / this.targetWords.length) * 100;
            progressFill.style.width = Math.min(progress, 100) + '%';
            console.log('📊 Progression bar updated:', progress + '%');
        }
    }
    
    getNextLevelRequirements() {
        const requirements = {
            1: { score: 1000 },
            2: { score: 2500 },
            3: { score: 5000 },
            4: { score: 10000 },
            5: { score: 15000 },
            6: { score: 20000 },
            7: { score: 25000 },
            8: { score: 30000 },
            9: { score: 35000 },
            10: { score: 40000 }
        };
        
        return requirements[this.level] || { score: 'MAX' };
    }
    
    // Enhanced Game Controls
    setupControls() {
        // console.log('🎮 Setting up enhanced game controls...');
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleEnhancedKeyPress(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Add touch controls for mobile
        this.setupTouchControls();
        
        // console.log('✅ Enhanced controls setup completed');
    }
    
    handleEnhancedKeyPress(key) {
        if (!this.gameRunning || this.paused) return;
        
        switch(key) {
            case 'ArrowLeft':
                this.moveFallingLetter(-1);
                this.audioManager.playMove();
                break;
            case 'ArrowRight':
                this.moveFallingLetter(1);
                this.audioManager.playMove();
                break;
            case 'ArrowDown':
                this.dropFallingLetter();
                this.audioManager.playDrop();
                break;
            case 'Enter':
                this.dropFallingLetter();
                this.audioManager.playDrop();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
            case 'r':
            case 'R':
                this.resetGame();
                break;
            case 'f':
            case 'F':
                this.toggleFullScreen();
                break;
        }
    }
    
    setupTouchControls() {
        const canvas = this.canvas;
        if (!canvas) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 50) {
                    this.moveFallingLetter(1);
                } else if (deltaX < -50) {
                    this.moveFallingLetter(-1);
                }
            } else {
                // Vertical swipe
                if (deltaY > 50) {
                    this.dropFallingLetter();
                }
            }
        });
    }
    
    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.log('Error attempting to exit fullscreen:', err);
            });
        }
    }
    
    togglePause() {
        if (this.paused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    resumeGame() {
        if (this.paused) {
            this.paused = false;
            this.startFallTimer();
            this.hidePauseNotification();
            console.log('▶️ Game resumed');
        }
    }
    
    showGameOverMessage() {
        console.log('🎮 Showing game over message');
        
        // Stop any timers
        this.stopFallTimer();
        
        // Create game over overlay
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;
        
        const gameOverOverlay = document.createElement('div');
        gameOverOverlay.className = 'game-over-overlay';
        gameOverOverlay.innerHTML = `
            <div class="game-over-content">
                <h2>🎮 Partie Terminée</h2>
                <div class="game-over-stats">
                    <p><strong>Score Final:</strong> ${this.score}</p>
                    <p><strong>Niveau Atteint:</strong> ${this.level}</p>
                    <p><strong>Lettres Placées:</strong> ${this.stats.lettersPlaced}</p>
                    <p><strong>Mots Complétés:</strong> ${this.wordsFound.length}</p>
                </div>
                <div class="game-over-buttons">
                    <button onclick="window.game.resetGame()" class="btn-restart">
                        <i class="fas fa-redo"></i> Rejouer
                    </button>
                </div>
            </div>
        `;
        
        gameOverOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: fadeIn 0.5s ease-out;
        `;
        
        gameContainer.appendChild(gameOverOverlay);
        
        // Save high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            console.log('🏆 New high score:', this.highScore);
        }
    }
    
    // Falling Letter System
    createFallingLetter() {
        if (this.letterQueue.length === 0) {
            console.log('📝 Letter queue empty, generating new queue...');
            this.generateLetterQueue();
        }
        
        const letter = this.letterQueue.shift();
        const gridSize = this.currentGridSize;
        
        // Start falling letter at top center of grid
        this.fallingLetter = {
            letter: letter,
            x: Math.floor(gridSize / 2),
            y: 0,
            rotation: 0
        };
        
        console.log('📝 Created falling letter:', {
            letter: letter,
            position: { x: this.fallingLetter.x, y: this.fallingLetter.y },
            queueLength: this.letterQueue.length
        });
        
        // Update display to show new letter
        this.updateDisplay();
    }
    
    moveFallingLetter(direction) {
        if (!this.fallingLetter) return;
        
        const newX = this.fallingLetter.x + direction;
        if (newX >= 0 && newX < this.currentGridSize && !this.checkCollision(newX, this.fallingLetter.y)) {
            this.fallingLetter.x = newX;
            this.audioManager.playMove();
        }
    }
    
    dropFallingLetter() {
        if (!this.fallingLetter) return;
        
        while (!this.checkCollision(this.fallingLetter.x, this.fallingLetter.y + 1)) {
            this.fallingLetter.y++;
        }
        
        this.placeLetter();
    }
    
    checkCollision(x, y) {
        // Add safety checks for grid
        if (!this.grid) {
            console.error('❌ Grid is undefined in checkCollision');
            return true; // Return collision to prevent further errors
        }
        
        // IMPROVED: Use new grid dimensions for collision detection
        if (y >= this.gridRows) return true;
        if (x < 0 || x >= this.currentGridSize) return true;
        
        // Add safety check for grid row
        if (!this.grid[y]) {
            console.error('❌ Grid row is undefined:', y);
            return true;
        }
        
        return this.grid[y][x] !== null;
    }
    
    placeLetter() {
        if (!this.fallingLetter) {
            console.log('❌ No falling letter to place');
            return;
        }
        
        const x = this.fallingLetter.x;
        const y = this.fallingLetter.y;
        const letter = this.fallingLetter.letter;
        
        console.log('📝 Placing letter:', {
            letter: letter,
            position: { x: x, y: y },
            gridBounds: { rows: this.gridRows, cols: this.currentGridSize }
        });
        
        // IMPROVED: Check bounds using new grid dimensions
        if (x < 0 || x >= this.currentGridSize || y < 0 || y >= this.gridRows) {
            console.error('❌ Letter placement out of bounds:', { x, y });
            
            // Game over - letter fell out of bounds
            console.log('🎮 Game Over: Letter out of bounds');
            this.gameOver = true;
            this.gameRunning = false;
            this.fallingLetter = null;
            
            // Show game over message
            this.showGameOverMessage();
            return;
        }
        
        // Check if position is already occupied
        if (this.grid[y] && this.grid[y][x] !== null) {
            console.error('❌ Position already occupied:', { x, y, existingLetter: this.grid[y][x] });
            
            // Try to find a valid position nearby
            const validPosition = this.findValidPosition(x, y);
            if (validPosition) {
                console.log('🔄 Found valid position:', validPosition);
                this.fallingLetter.x = validPosition.x;
                this.fallingLetter.y = validPosition.y;
                // Don't call placeLetter recursively to avoid infinite loops
                // Instead, let the game loop handle the placement on the next frame
                return;
            } else {
                // Game over - no valid placement position
                console.log('🎮 Game Over: No valid placement position');
                this.gameOver = true;
                this.gameRunning = false;
                this.fallingLetter = null;
                
                // Show game over message
                this.showGameOverMessage();
                return;
            }
        }
        
        // Ensure grid row exists
        if (!this.grid[y]) {
            this.grid[y] = [];
        }
        
        // Place the letter
        this.grid[y][x] = letter;
        
        console.log('✅ Letter placed successfully:', {
            letter: letter,
            position: { x: x, y: y },
            gridState: this.grid[y][x],
            totalLettersInGrid: this.grid.flat().filter(cell => cell !== null).length
        });
        
        // Update statistics
        this.stats.lettersPlaced++;
        
        // Create enhanced placement effect with letter
        if (this.particleSystem) {
            this.particleSystem.createPlacementEffect(x * this.cellSize, y * this.cellSize, letter);
        }
        
        // Create water particles using shader system
        if (window.gameShaders && window.gameShaders.createWaterParticles) {
            const canvasX = (x * this.cellSize) + (this.canvas.width - this.currentGridSize * this.cellSize) / 2;
            const canvasY = (y * this.cellSize) + (this.canvas.height - this.gridRows * this.cellSize) / 2;
            window.gameShaders.createWaterParticles(canvasX, canvasY, 15);
        }
        
        // Play sound
        if (this.audioManager) {
            this.audioManager.playPlace();
        }
        
        // Check for word completion
        this.checkWordCompletion();
        
        // Create new falling letter
        this.createFallingLetter();
        
        // Update display
        this.updateDisplay();
        
        // Force a render to ensure letters are visible
        this.render();
        
        console.log('📊 Grid state after placement:', {
            totalLetters: this.grid.flat().filter(cell => cell !== null).length,
            gridSnapshot: this.grid.map(row => row.map(cell => cell || '.').join('')).join('\n')
        });
    }
    
    // Helper method to find a valid position for letter placement
    findValidPosition(originalX, originalY) {
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: -1 }, // Up-Left
            { x: 1, y: -1 },  // Up-Right
            { x: -1, y: 1 },  // Down-Left
            { x: 1, y: 1 }    // Down-Right
        ];
        
        for (let i = 0; i < directions.length; i++) {
            const newX = originalX + directions[i].x;
            const newY = originalY + directions[i].y;
            
            // Check bounds using correct grid dimensions
            if (newX < 0 || newX >= this.currentGridSize || newY < 0 || newY >= this.gridRows) {
                continue;
            }
            
            // Check if position is free
            if (!this.grid[newY] || this.grid[newY][newX] === null) {
                return { x: newX, y: newY };
            }
        }
        
        // If no immediate position found, try to find any free position in the grid
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.currentGridSize; col++) {
                if (!this.grid[row] || this.grid[row][col] === null) {
                    return { x: col, y: row };
                }
            }
        }
        
        return null; // No valid position found
    }
    
    // Enhanced Game State Management
    startGame() {
        console.log('🚀 startGame() called');
        
        try {
            // Ensure grid is initialized
            if (!this.grid) {
                console.log('🏗️ Grid not initialized, creating grid...');
                this.createGrid();
            }
            
            // Ensure letter queue is initialized
            if (!this.letterQueue || this.letterQueue.length === 0) {
                console.log('📝 Letter queue not initialized, generating queue...');
                this.generateLetterQueue();
            }
            
            // Ensure word detector is initialized
            if (!this.wordDetector) {
                console.log('🔍 Word detector not initialized, creating...');
                this.dictionary = this.loadDictionary();
                this.wordDetector = new WordDetector(this.dictionary);
            }
            
            // Ensure particle system is initialized
            if (!this.particleSystem) {
                console.log('✨ Particle system not initialized, creating...');
                this.particleSystem = new ParticleSystem();
            }
            
            // Ensure audio manager is initialized
            if (!this.audioManager) {
                console.log('🔊 Audio manager not initialized, creating...');
                this.audioManager = new AudioManager();
            }
            
            console.log('📊 Game state before start:', {
                gameRunning: this.gameRunning,
                paused: this.paused,
                fallingLetter: this.fallingLetter,
                gridSize: this.currentGridSize,
                gridLetters: this.grid ? this.grid.flat().filter(cell => cell !== null).length : 0
            });
            
            // Reset game state
            this.gameRunning = true;
            this.paused = false;
            this.gameOver = false;
            this.score = 0;
            this.level = 1;
            this.combo = 1;
            this.maxCombo = 1;
            this.lastWordTime = Date.now();
            
            // Initialize statistics
            this.stats = {
                lettersPlaced: 0,
                wordsCompleted: 0,
                playTime: 0,
                startTime: Date.now()
            };
            
            // Create initial falling letter
            console.log('📝 Creating initial falling letter...');
            this.createFallingLetter();
            
            // Start fall timer
            this.startFallTimer();
            
            // Start game loop
            this.startGameLoop();
            
            // Show start notification
            this.showGameStartNotification();
            
            // Initial render
            this.render();
            
            console.log('✅ Game started successfully');
            
        } catch (error) {
            console.error('❌ Error starting game:', error);
            this.gameRunning = false;
        }
    }
    
    showGameStartNotification() {
        const notification = document.createElement('div');
        notification.className = 'game-start-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎮 Commencer le jeu!</h3>
                <p>Utilisez les flèches pour déplacer les lettres</p>
                <p>Espace pour faire pivoter</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: notificationAppear 0.5s ease-out;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'notificationDisappear 0.5s ease-out';
            notification.style.animationFillMode = 'forwards';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    pauseGame() {
        console.log('⏸️ pauseGame() called');
        console.log('📊 Pause state:', {
            wasRunning: this.gameRunning,
            wasPaused: this.paused,
            currentScore: this.score,
            playTime: this.stats.playTime
        });
        
        this.paused = !this.paused;
        
        if (this.paused) {
            this.stopFallTimer();
            this.showPauseNotification();
            console.log('⏸️ Game paused');
        } else {
            this.startFallTimer();
            this.hidePauseNotification();
            console.log('▶️ Game resumed');
        }
    }
    
    showPauseNotification() {
        const notification = document.createElement('div');
        notification.className = 'pause-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>⏸️ Jeu en pause</h3>
                <p>Appuyez sur P pour reprendre</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            z-index: 10000;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        this.pauseNotification = notification;
    }
    
    hidePauseNotification() {
        if (this.pauseNotification) {
            document.body.removeChild(this.pauseNotification);
            this.pauseNotification = null;
        }
    }
    
    resetGame() {
        console.log('🔄 resetGame() called');
        console.log('📊 Game state before reset:', {
            score: this.score,
            level: this.level,
            wordsFound: this.wordsFound.length,
            playTime: this.stats.playTime
        });
        
        this.gameRunning = false;
        this.paused = false;
        this.score = 0;
        this.level = 1;
        this.wordsFound = [];
        this.combo = 1;
        this.lastWordTime = 0;
        
        // Reset statistics
        this.stats = {
            lettersPlaced: 0,
            wordsCompleted: 0,
            totalScore: 0,
            playTime: 0,
            startTime: null
        };
        
        // Reset grid and letter queue
        this.grid = this.createGrid();
        this.generateLetterQueue();
        this.fallingLetter = null;
        
        // Stop timers
        this.stopFallTimer();
        
        // Update display
        this.updateDisplay();
        
        console.log('✅ Game reset successfully');
        console.log('📊 Reset game state:', {
            score: this.score,
            level: this.level,
            wordsFound: this.wordsFound.length,
            letterQueueLength: this.letterQueue.length
        });
    }
    
    startFallTimer() {
        // Clear any existing timer first
        this.stopFallTimer();
        
        this.fallTimer = setInterval(() => {
            if (this.gameRunning && !this.paused) {
                this.updateFallingLetter();
            }
        }, this.fallSpeed);
    }
    
    // New method to restart timer with updated speed
    restartFallTimer() {
        this.stopFallTimer();
        this.startFallTimer();
    }
    
    stopFallTimer() {
        if (this.fallTimer) {
            clearInterval(this.fallTimer);
            this.fallTimer = null;
        }
    }
    
    updateFallingLetter() {
        if (!this.fallingLetter) return;
        
        if (this.checkCollision(this.fallingLetter.x, this.fallingLetter.y + 1)) {
            this.placeLetter();
        } else {
            this.fallingLetter.y++;
        }
    }
    
    gameLoop() {
        if (!this.gameRunning || this.paused) return;
        
        // Update falling letter position
        if (this.fallingLetter) {
            this.updateFallingLetter();
        }
        
        // Check for word completion
        this.checkWordCompletion();
        
        // Update level progression
        this.updateLevel();
        
        // Update statistics
        this.updateStats();
        
        // Render the frame
        this.render();
        
        // Continue the loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Test function to manually place letters for debugging
    testLetterPlacement() {
        console.log('🧪 Testing letter placement...');
        
        // Place some test letters in the grid
        const testLetters = ['A', 'B', 'C', 'D', 'E'];
        for (let i = 0; i < testLetters.length; i++) {
            const row = Math.floor(i / this.currentGridSize);
            const col = i % this.currentGridSize;
            if (row < this.currentGridSize) {
                this.grid[row][col] = testLetters[i];
                console.log(`🧪 Placed test letter "${testLetters[i]}" at position (${row}, ${col})`);
            }
        }
        
        // Create a falling letter
        this.fallingLetter = {
            letter: 'F',
            x: Math.floor(this.currentGridSize / 2),
            y: 2,
            rotation: 0
        };
        
        console.log('🧪 Test setup complete. Grid state:', this.grid);
        
        // Force a render
        this.render();
    }
    
    // Enhanced Rendering
    render() {
        if (!this.ctx) {
            console.error('❌ Canvas context not available for rendering');
            return;
        }
        
        if (!this.canvas) {
            console.error('❌ Canvas not available for rendering');
            return;
        }
        
        // Count letters in grid before rendering
        const lettersInGrid = this.grid ? this.grid.flat().filter(cell => cell !== null).length : 0;
        
        console.log('🎨 Rendering frame:', {
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            gridSize: this.currentGridSize,
            cellSize: this.cellSize,
            fallingLetter: this.fallingLetter ? this.fallingLetter.letter : 'none',
            gridCells: lettersInGrid,
            gameRunning: this.gameRunning,
            paused: this.paused
        });
        
        try {
            // Clear canvas with enhanced background
            this.drawEnhancedBackground();
            
            // Draw enhanced grid
            this.drawEnhancedGrid();
            
            // Draw enhanced falling letter with VFX
            if (this.fallingLetter) {
                this.drawEnhancedFallingLetter();
            }
            
            // Render particle effects
            if (this.particleSystem) {
                this.particleSystem.render(this.ctx);
            }
            
            // Draw UI overlays
            this.drawUIOverlays();
            
            // Draw game over screen if active
            if (this.gameOverScreen && this.gameOverScreen.visible) {
                this.drawGameOverScreen();
            }
            
            console.log('✅ Frame rendered successfully with', lettersInGrid, 'letters in grid');
        } catch (error) {
            console.error('❌ Error during rendering:', error);
        }
    }
    
    drawEnhancedBackground() {
        const time = Date.now() * 0.001;
        
        // Use shader background if available
        if (window.gameShaders && window.gameShaders.backgroundShader2D) {
            window.gameShaders.backgroundShader2D.render(this.ctx, this.canvas.width, this.canvas.height, time);
        } else {
            // Fallback to gradient background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Add animated particles in background
            for (let i = 0; i < 20; i++) {
                const x = (i * 50 + time * 30) % this.canvas.width;
                const y = (i * 30 + time * 20) % this.canvas.height;
                const size = Math.sin(time + i) * 2 + 3;
                const alpha = Math.sin(time + i) * 0.3 + 0.1;
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
        
        // Update shader animations
        if (window.gameShaders) {
            window.gameShaders.update(time);
        }
    }
    
    drawEnhancedGrid() {
        console.log('🏗️ Drawing enhanced grid...');
        
        // IMPROVED: Use new grid dimensions (10 columns x 14 rows)
        const gridCols = this.currentGridSize;
        const gridRows = this.gridRows;
        const cellSize = this.cellSize;
        
        // Center the grid on canvas
        const startX = (this.canvas.width - gridCols * cellSize) / 2;
        const startY = (this.canvas.height - gridRows * cellSize) / 2;
        
        console.log('📐 Grid dimensions:', {
            gridCols: gridCols,
            gridRows: gridRows,
            cellSize: cellSize,
            startX: startX,
            startY: startY,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        });
        
        // IMPROVED: Draw grid cells with enhanced effects using new dimensions
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const x = startX + col * cellSize;
                const y = startY + row * cellSize;
                const letter = this.grid[row][col];
                
                if (letter) {
                    console.log(`📝 Drawing letter "${letter}" at grid position (${row}, ${col}) -> canvas position (${x}, ${y})`);
                    this.drawEnhancedCell(x, y, letter);
                } else {
                    this.drawEnhancedEmptyCell(x, y);
                }
            }
        }
        
        console.log('✅ Enhanced grid drawn with', this.grid.flat().filter(cell => cell !== null).length, 'letters');
        
        // IMPROVED: Add debug overlay showing fall speed and level
        this.drawDebugOverlay();
    }
    
    drawDebugOverlay() {
        // Draw debug information in top-left corner
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 80);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        this.ctx.fillText(`Level: ${this.level}`, 15, 15);
        this.ctx.fillText(`Fall Speed: ${this.fallSpeed}ms`, 15, 30);
        this.ctx.fillText(`Grid: ${this.currentGridSize}x${this.gridRows}`, 15, 45);
        this.ctx.fillText(`Letters: ${this.grid.flat().filter(cell => cell !== null).length}`, 15, 60);
        
        this.ctx.restore();
    }
    
    drawEnhancedCell(x, y, letter) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const time = Date.now() * 0.002;
        
        // Create sophisticated 3D-style letter cell
        this.drawLetterCellBackground(x, y, letter, time);
        this.drawLetterCellBorder(x, y, letter, time);
        this.drawLetterCellContent(x, y, letter, time);
        this.drawLetterCellEffects(x, y, letter, time);
    }
    
    drawLetterCellBackground(x, y, letter, time) {
        // Create dynamic gradient based on letter
        const letterColor = this.getLetterColor(letter);
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const gradient = this.ctx.createRadialGradient(
            x + this.cellSize * 0.3, y + this.cellSize * 0.3, 0,
            centerX, centerY, this.cellSize * 0.8
        );
        
        gradient.addColorStop(0, `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.9)`);
        gradient.addColorStop(0.5, `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.7)`);
        gradient.addColorStop(1, `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.3)`);
        
        // Draw main cell background
        this.ctx.save();
        this.ctx.fillStyle = gradient;
        this.ctx.shadowColor = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.5)`;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4;
        this.ctx.fillRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6);
        this.ctx.restore();
        
        // Add inner highlight
        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        this.ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize * 0.3);
        this.ctx.restore();
    }
    
    drawLetterCellBorder(x, y, letter, time) {
        const letterColor = this.getLetterColor(letter);
        const pulse = Math.sin(time + x * 0.1 + y * 0.1) * 0.1 + 1;
        
        // Draw animated border
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.8)`;
        this.ctx.lineWidth = 3 * pulse;
        this.ctx.shadowColor = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.6)`;
        this.ctx.shadowBlur = 15;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        this.ctx.restore();
        
        // Add corner accents
        this.ctx.save();
        this.ctx.fillStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.4)`;
        const cornerSize = 6;
        this.ctx.fillRect(x + 2, y + 2, cornerSize, cornerSize);
        this.ctx.fillRect(x + this.cellSize - 8, y + 2, cornerSize, cornerSize);
        this.ctx.fillRect(x + 2, y + this.cellSize - 8, cornerSize, cornerSize);
        this.ctx.fillRect(x + this.cellSize - 8, y + this.cellSize - 8, cornerSize, cornerSize);
        this.ctx.restore();
    }
    
    drawLetterCellContent(x, y, letter, time) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const displayLetter = this.ensureLetterDisplay(letter);
        
        // Draw letter with 3D effect
        this.ctx.save();
        this.ctx.font = `bold ${Math.floor(this.cellSize * 0.6)}px "Segoe UI", "Arial", sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw letter shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillText(displayLetter, centerX + 2, centerY + 2);
        
        // Draw main letter
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 8;
        this.ctx.fillText(displayLetter, centerX, centerY);
        
        // Draw letter highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText(displayLetter, centerX - 1, centerY - 1);
        
        this.ctx.restore();
    }
    
    drawLetterCellEffects(x, y, letter, time) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const letterColor = this.getLetterColor(letter);
        
        // Add floating particles
        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
            const angle = (time * 0.5 + i * Math.PI * 2 / particleCount) % (Math.PI * 2);
            const radius = this.cellSize * 0.4;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.8)`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Add pulsing glow
        const pulse = Math.sin(time * 2) * 0.3 + 0.7;
        this.ctx.save();
        this.ctx.globalAlpha = 0.3 * pulse;
        this.ctx.fillStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 1)`;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.cellSize * 0.4 * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    getLetterColor(letter) {
        // Define unique colors for each letter
        const colorMap = {
            'A': { r: 255, g: 99, b: 132 },   // Pink
            'B': { r: 99, g: 102, b: 241 },   // Indigo
            'C': { r: 34, g: 197, b: 94 },    // Green
            'D': { r: 245, g: 158, b: 11 },   // Amber
            'E': { r: 239, g: 68, b: 68 },    // Red
            'F': { r: 168, g: 85, b: 247 },   // Purple
            'G': { r: 6, g: 182, b: 212 },    // Cyan
            'H': { r: 251, g: 146, b: 60 },   // Orange
            'I': { r: 236, g: 72, b: 153 },   // Pink
            'J': { r: 59, g: 130, b: 246 },   // Blue
            'K': { r: 16, g: 185, b: 129 },   // Emerald
            'L': { r: 245, g: 101, b: 101 },  // Red
            'M': { r: 139, g: 92, b: 246 },   // Violet
            'N': { r: 14, g: 165, b: 233 },   // Sky
            'O': { r: 34, g: 197, b: 94 },    // Green
            'P': { r: 251, g: 146, b: 60 },   // Orange
            'Q': { r: 168, g: 85, b: 247 },   // Purple
            'R': { r: 239, g: 68, b: 68 },    // Red
            'S': { r: 6, g: 182, b: 212 },    // Cyan
            'T': { r: 99, g: 102, b: 241 },   // Indigo
            'U': { r: 16, g: 185, b: 129 },   // Emerald
            'V': { r: 245, g: 158, b: 11 },   // Amber
            'W': { r: 236, g: 72, b: 153 },   // Pink
            'X': { r: 59, g: 130, b: 246 },   // Blue
            'Y': { r: 139, g: 92, b: 246 },   // Violet
            'Z': { r: 14, g: 165, b: 233 }    // Sky
        };
        
        return colorMap[letter.toUpperCase()] || { r: 156, g: 163, b: 175 }; // Gray default
    }
    
    // Helper method to ensure proper letter display
    ensureLetterDisplay(letter) {
        // Map common problematic characters
        const letterMap = {
            'B': 'B',
            '6': 'B', // Fix for B appearing as 6
            '8': 'B',
            '0': 'O',
            'O': 'O',
            '1': 'I',
            'I': 'I',
            '5': 'S',
            'S': 'S',
            'Z': 'Z',
            '2': 'Z'
        };
        
        // Return mapped letter or original if no mapping
        return letterMap[letter] || letter;
    }
    
    drawEnhancedEmptyCell(x, y) {
        // Draw subtle grid lines for empty cells
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
    }
    
    drawEnhancedFallingLetter() {
        if (!this.fallingLetter) return;
        
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const startX = (this.canvas.width - gridSize * cellSize) / 2;
        const startY = (this.canvas.height - gridSize * cellSize) / 2;
        
        const x = startX + this.fallingLetter.x * cellSize;
        const y = startY + this.fallingLetter.y * cellSize;
        const letter = this.fallingLetter.letter;
        const time = Date.now() * 0.005;
        
        // Use the same sophisticated rendering as placed letters
        this.drawFallingLetterBackground(x, y, letter, time);
        this.drawFallingLetterBorder(x, y, letter, time);
        this.drawFallingLetterContent(x, y, letter, time);
        this.drawFallingLetterEffects(x, y, letter, time);
        
        // Add special falling animation particles
        this.drawFallingLetterParticles(x + cellSize / 2, y + cellSize / 2, time);
    }
    
    drawFallingLetterBackground(x, y, letter, time) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const letterColor = this.getLetterColor(letter);
        
        // Create dynamic gradient with enhanced glow for falling letters
        const gradient = this.ctx.createRadialGradient(
            x + this.cellSize * 0.3, y + this.cellSize * 0.3, 0,
            centerX, centerY, this.cellSize * 1.2
        );
        
        gradient.addColorStop(0, `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.95)`);
        gradient.addColorStop(0.3, `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.8)`);
        gradient.addColorStop(0.7, `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.4)`);
        gradient.addColorStop(1, `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.1)`);
        
        // Draw enhanced glow background
        this.ctx.save();
        this.ctx.fillStyle = gradient;
        this.ctx.shadowColor = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.8)`;
        this.ctx.shadowBlur = 40;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 8;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        this.ctx.restore();
        
        // Add inner highlight with animation
        const pulse = Math.sin(time * 3) * 0.2 + 0.8;
        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 255, 255, 0.4 * ${pulse})`;
        this.ctx.fillRect(x + 3, y + 3, this.cellSize - 6, this.cellSize * 0.4);
        this.ctx.restore();
    }
    
    drawFallingLetterBorder(x, y, letter, time) {
        const letterColor = this.getLetterColor(letter);
        const pulse = Math.sin(time * 2) * 0.2 + 1;
        
        // Draw animated border with enhanced glow
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.9)`;
        this.ctx.lineWidth = 4 * pulse;
        this.ctx.shadowColor = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.8)`;
        this.ctx.shadowBlur = 25;
        this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        this.ctx.restore();
        
        // Add animated corner accents
        this.ctx.save();
        this.ctx.fillStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 0.6)`;
        const cornerSize = 8;
        const cornerPulse = Math.sin(time * 4) * 0.3 + 0.7;
        this.ctx.fillRect(x + 1, y + 1, cornerSize * cornerPulse, cornerSize * cornerPulse);
        this.ctx.fillRect(x + this.cellSize - 9, y + 1, cornerSize * cornerPulse, cornerSize * cornerPulse);
        this.ctx.fillRect(x + 1, y + this.cellSize - 9, cornerSize * cornerPulse, cornerSize * cornerPulse);
        this.ctx.fillRect(x + this.cellSize - 9, y + this.cellSize - 9, cornerSize * cornerPulse, cornerSize * cornerPulse);
        this.ctx.restore();
    }
    
    drawFallingLetterContent(x, y, letter, time) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const displayLetter = this.ensureLetterDisplay(letter);
        
        // Draw letter with enhanced 3D effect and animation
        this.ctx.save();
        this.ctx.font = `bold ${Math.floor(this.cellSize * 0.7)}px "Segoe UI", "Arial", sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Animated letter shadow
        const shadowPulse = Math.sin(time * 2) * 0.5 + 1.5;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillText(displayLetter, centerX + shadowPulse, centerY + shadowPulse);
        
        // Main letter with enhanced glow
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        this.ctx.shadowBlur = 12;
        this.ctx.fillText(displayLetter, centerX, centerY);
        
        // Animated letter highlight
        const highlightPulse = Math.sin(time * 3) * 0.3 + 0.7;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${highlightPulse})`;
        this.ctx.fillText(displayLetter, centerX - 1, centerY - 1);
        
        this.ctx.restore();
    }
    
    drawFallingLetterEffects(x, y, letter, time) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const letterColor = this.getLetterColor(letter);
        
        // Add enhanced floating particles for falling letters
        const particleCount = 6;
        for (let i = 0; i < particleCount; i++) {
            const angle = (time * 0.8 + i * Math.PI * 2 / particleCount) % (Math.PI * 2);
            const radius = this.cellSize * 0.6;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 1)`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 3 + Math.sin(time * 2 + i) * 1, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Add pulsing glow with enhanced animation
        const pulse = Math.sin(time * 2) * 0.4 + 0.8;
        this.ctx.save();
        this.ctx.globalAlpha = 0.5 * pulse;
        this.ctx.fillStyle = `rgba(${letterColor.r}, ${letterColor.g}, ${letterColor.b}, 1)`;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.cellSize * 0.6 * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawFallingLetterParticles(x, y, time) {
        this.ctx.save();
        
        // Create multiple particle rings with different colors and animations
        const particleRings = [
            { count: 6, radius: 25, speed: 0.5, size: 2, alpha: 0.8, hue: 240 },
            { count: 4, radius: 40, speed: 0.3, size: 3, alpha: 0.6, hue: 280 },
            { count: 8, radius: 15, speed: 0.8, size: 1, alpha: 0.9, hue: 200 }
        ];
        
        particleRings.forEach((ring, ringIndex) => {
            for (let i = 0; i < ring.count; i++) {
                const angle = (i / ring.count) * Math.PI * 2 + time * ring.speed;
                const radius = ring.radius + Math.sin(time * 2 + i + ringIndex) * 5;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                
                // Animated particle size and alpha
                const sizePulse = Math.sin(time * 3 + i) * 0.5 + ring.size;
                const alphaPulse = Math.sin(time * 2 + i) * 0.2 + ring.alpha;
                
                this.ctx.save();
                this.ctx.globalAlpha = alphaPulse;
                this.ctx.fillStyle = `hsla(${ring.hue + i * 15}, 80%, 70%, ${alphaPulse})`;
                this.ctx.beginPath();
                this.ctx.arc(px, py, sizePulse, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
        
        // Add trailing particles
        for (let i = 0; i < 5; i++) {
            const trailTime = time - i * 0.1;
            const trailY = y + i * 8;
            const trailX = x + Math.sin(trailTime * 4) * 3;
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.4 - i * 0.08;
            this.ctx.fillStyle = `hsla(220, 90%, 70%, ${0.4 - i * 0.08})`;
            this.ctx.beginPath();
            this.ctx.arc(trailX, trailY, 2 - i * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    drawUIOverlays() {
        // Calculate grid position to avoid overlap
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const startX = (this.canvas.width - gridSize * cellSize) / 2;
        const startY = (this.canvas.height - gridSize * cellSize) / 2;
        
        // Position UI overlays completely outside the grid area
        // Check if there's enough space on the right side
        const gridRight = startX + gridSize * cellSize;
        const availableRightSpace = this.canvas.width - gridRight;
        
        let uiX, uiY;
        
        if (availableRightSpace >= 150) {
            // Position on the right side of the grid
            uiX = gridRight + 10;
            uiY = startY;
        } else {
            // Position in top-right corner if not enough space
            uiX = this.canvas.width - 140;
            uiY = 10;
        }
        
        // Enhanced score overlay with gradient
        const scoreGradient = this.ctx.createLinearGradient(uiX, uiY, uiX + 130, uiY + 40);
        scoreGradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
        scoreGradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)');
        
        this.ctx.fillStyle = scoreGradient;
        this.ctx.fillRect(uiX, uiY, 130, 40);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 2;
        this.ctx.fillText(`Score: ${this.score}`, uiX + 10, uiY + 25);
        
        // Enhanced level overlay - positioned below score
        const levelGradient = this.ctx.createLinearGradient(uiX, uiY + 50, uiX + 130, uiY + 90);
        levelGradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
        levelGradient.addColorStop(1, 'rgba(5, 150, 105, 0.9)');
        
        this.ctx.fillStyle = levelGradient;
        this.ctx.fillRect(uiX, uiY + 50, 130, 40);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        this.ctx.fillText(`Level: ${this.level}`, uiX + 10, uiY + 75);
        
        // Enhanced combo overlay with animation - positioned below level
        if (this.combo > 1) {
            const comboGradient = this.ctx.createLinearGradient(uiX, uiY + 100, uiX + 130, uiY + 140);
            comboGradient.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
            comboGradient.addColorStop(1, 'rgba(245, 158, 11, 0.9)');
            
            this.ctx.fillStyle = comboGradient;
            this.ctx.fillRect(uiX, uiY + 100, 130, 40);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
            this.ctx.fillText(`Combo: x${this.combo}`, uiX + 10, uiY + 125);
            
            // Add pulsing effect for combo
            const time = Date.now() * 0.005;
            const pulse = Math.sin(time) * 0.2 + 1;
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.beginPath();
            this.ctx.arc(uiX + 65, uiY + 125, 15 * pulse, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Add game progress indicator
        this.drawProgressIndicator();
    }
    
    drawProgressIndicator() {
        const progressWidth = 200;
        const progressHeight = 8;
        const x = (this.canvas.width - progressWidth) / 2;
        const y = this.canvas.height - 30;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x, y, progressWidth, progressHeight);
        
        // Progress bar
        const progress = Math.min((this.wordsFound.length / this.targetWords.length) * 100, 100);
        const progressGradient = this.ctx.createLinearGradient(x, y, x + progressWidth, y);
        progressGradient.addColorStop(0, '#667eea');
        progressGradient.addColorStop(1, '#8b5cf6');
        
        this.ctx.fillStyle = progressGradient;
        this.ctx.fillRect(x, y, (progressWidth * progress) / 100, progressHeight);
        
        // Progress text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.wordsFound.length}/${this.targetWords.length} mots`, this.canvas.width / 2, y - 5);
    }
    
    // Display Updates
    updateDisplay() {
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateWordList();
        this.updateLetterQueueDisplay();
        this.updateComboDisplay();
        this.updatePlayTime();
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toLocaleString();
        }
    }
    
    updateLevelDisplay() {
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
        
        // Update fall speed display
        const fallSpeedElement = document.getElementById('fallSpeed');
        if (fallSpeedElement) {
            fallSpeedElement.textContent = `${this.fallSpeed}ms`;
        }
    }
    
    updateWordList() {
        // Update words completed counter in the current layout
        const wordsCompletedElement = document.getElementById('wordsCompleted');
        if (wordsCompletedElement) {
            wordsCompletedElement.textContent = this.wordsFound.length;
        }
        
        // Update target words list
        const targetWordsList = document.getElementById('targetWordsList');
        if (targetWordsList) {
            targetWordsList.innerHTML = '';
            this.targetWords.forEach(word => {
                const isCompleted = this.wordsFound.includes(word);
                const wordItem = document.createElement('div');
                wordItem.className = `word-item ${isCompleted ? 'completed' : ''}`;
                wordItem.dataset.word = word;
                wordItem.innerHTML = `
                    <span class="word-text">${word}</span>
                    <span class="word-status">${isCompleted ? '✅' : '⏳'}</span>
                `;
                targetWordsList.appendChild(wordItem);
            });
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if (progressFill && progressText) {
            const progress = Math.min((this.wordsFound.length / this.targetWords.length) * 100, 100);
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${this.wordsFound.length}/${this.targetWords.length} mots`;
        }
        
        // Update canvas info display
        const canvasInfoElement = document.querySelector('.canvas-info');
        if (canvasInfoElement) {
            canvasInfoElement.textContent = `${this.wordsFound.length}/${this.targetWords.length} mots`;
        }
        
        // Update level display
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }
    
    updateLetterQueueDisplay() {
        // Update next letters display
        const nextLettersElement = document.getElementById('nextLetters');
        if (nextLettersElement && this.letterQueue) {
            nextLettersElement.innerHTML = '';
            const nextLetters = this.letterQueue.slice(0, 5); // Show next 5 letters
            nextLetters.forEach(letter => {
                const letterItem = document.createElement('div');
                letterItem.className = 'letter-item';
                letterItem.textContent = letter;
                nextLettersElement.appendChild(letterItem);
            });
        }
        
        // Update letters count
        const lettersCountElement = document.getElementById('lettersCount');
        if (lettersCountElement) {
            let totalLetters = 0;
            for (let row = 0; row < this.gridRows; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    if (this.grid[row][col]) {
                        totalLetters++;
                    }
                }
            }
            lettersCountElement.textContent = totalLetters;
        }
    }
    
    updateComboDisplay() {
        const comboElement = document.getElementById('combo');
        if (comboElement) {
            comboElement.textContent = `x${this.combo}`;
        }
    }
    
    updatePlayTime() {
        const playTimeElement = document.getElementById('playTime');
        if (playTimeElement && this.stats.gameStartTime) {
            const elapsed = Date.now() - this.stats.gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            playTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Utility Methods
    resizeCanvas() {
        console.log('📏 Resizing canvas...');
        try {
            // Check if canvas exists
            if (!this.canvas) {
                console.error('❌ Canvas not available for resizing');
                return;
            }
            
            const container = this.canvas.parentElement;
            if (!container) {
                // Default size if no container
                const size = this.currentGridSize * this.cellSize;
                this.canvas.width = size;
                this.canvas.height = size;
                console.log('✅ Canvas resized with default size:', size);
                return;
            }
            
            // IMPROVED: Calculate responsive size for larger grid
            const containerWidth = container.clientWidth || 800;
            const containerHeight = container.clientHeight || 600;
            
            // Calculate optimal canvas size for 10x14 grid
            const maxWidth = Math.min(containerWidth * 0.9, 800);
            const maxHeight = Math.min(containerHeight * 0.9, 600);
            
            // Use the smaller dimension to maintain square cells
            const size = Math.min(maxWidth, maxHeight);
            const finalSize = Math.max(500, size); // Minimum 500px for better visibility
            
            this.canvas.width = finalSize;
            this.canvas.height = finalSize;
            
            // Calculate cell size based on grid dimensions
            this.cellSize = Math.min(
                finalSize / this.currentGridSize,  // Width-based cell size
                finalSize / this.gridRows          // Height-based cell size
            );
            
            console.log('✅ Canvas resized:', {
                containerSize: `${containerWidth}x${containerHeight}`,
                canvasSize: `${this.canvas.width}x${this.canvas.height}`,
                cellSize: this.cellSize
            });
            
        } catch (error) {
            console.error('❌ Error resizing canvas:', error);
            // Fallback to default size
            if (this.canvas) {
                const size = this.currentGridSize * this.cellSize;
                this.canvas.width = size;
                this.canvas.height = size;
                console.log('✅ Canvas resized with fallback size:', size);
            }
        }
    }
    
    updateStats() {
        if (this.stats.startTime) {
            this.stats.playTime = Math.floor((Date.now() - this.stats.startTime) / 1000);
        }
        
        // Update all UI elements in the current layout
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        
        // Update combo display
        const comboElement = document.getElementById('combo');
        if (comboElement) {
            comboElement.textContent = this.combo || 0;
        }
        
        // Update words completed
        const wordsCompletedElement = document.getElementById('wordsCompleted');
        if (wordsCompletedElement) {
            wordsCompletedElement.textContent = this.wordsFound.length;
        }
        
        // Update canvas info
        const canvasInfoElement = document.querySelector('.canvas-info');
        if (canvasInfoElement) {
            canvasInfoElement.textContent = `${this.wordsFound.length}/3 mots`;
        }
    }
    
    showComboEffect(bonus) {
        // Create combo effect
        this.particleSystem.createComboEffect(bonus, this.fallingLetter.x * this.cellSize, this.fallingLetter.y * this.cellSize);
    }
    
    showLevelUpEffect() {
        // Create level up effect
        this.particleSystem.createLevelUpEffect();
    }
    
    // Storage
    saveHighScore() {
        localStorage.setItem('lettersCascadeHighScore', this.highScore.toString());
    }
    
    loadHighScore() {
        const saved = localStorage.getItem('lettersCascadeHighScore');
        return saved ? parseInt(saved) : 0;
    }
    
    loadDictionary() {
        // French dictionary for word validation (including target words for testing)
        return new Set([
            // Target words from tests
            'CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE',
            
            // Common French words
            'BONJOUR', 'AU REVOIR', 'MERCI', 'SIL VOUS PLAIT', 'PARDON',
            'OUI', 'NON', 'PEUT ETRE', 'CERTAINEMENT', 'PROBABLEMENT',
            'MAINTENANT', 'AUJOURDHUI', 'HIER', 'DEMAIN', 'TOUJOURS',
            'JAMAIS', 'PARFOIS', 'SOUVENT', 'RAREMENT', 'QUELQUEFOIS',
            'BON', 'MAUVAIS', 'GRAND', 'PETIT', 'NOUVEAU', 'VIEUX',
            'BEAU', 'JOLI', 'MOCHE', 'FORT', 'FAIBLE', 'RAPIDE', 'LENT',
            'CHALEUREUX', 'FROID', 'CHAUD', 'DOUX', 'DUR', 'MOLLE',
            'CLAIR', 'SOMBRE', 'LUMINEUX', 'OBSCUR', 'TRANSPARENT',
            'OPAQUE', 'COLORE', 'BLANC', 'NOIR', 'ROUGE', 'BLEU',
            'VERT', 'JAUNE', 'ORANGE', 'VIOLET', 'ROSE', 'GRIS',
            'MARRON', 'BEIGE', 'DORE', 'ARGENTE', 'BRONZE', 'CUIVRE'
        ]);
    }
    
    // Event Listeners
    setupEventListeners() {
        // Canvas click for letter placement
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameRunning || this.paused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const col = Math.floor(x / this.cellSize);
            const row = Math.floor(y / this.cellSize);
            
            if (col >= 0 && col < this.currentGridSize && row >= 0 && row < this.currentGridSize) {
                if (this.grid[row][col] === null && this.fallingLetter) {
                    this.fallingLetter.x = col;
                    this.fallingLetter.y = row;
                    this.placeLetter();
                }
            }
        });
    }
    
    // Add enhanced gameplay features
    addPowerUp() {
        const powerUps = ['freeze', 'clear', 'hint', 'bonus'];
        const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        
        this.activatePowerUp(randomPowerUp);
        console.log('🎁 Power-up activated:', randomPowerUp);
    }
    
    activatePowerUp(type) {
        switch(type) {
            case 'freeze':
                this.freezeTime = 5000; // 5 seconds
                this.showPowerUpNotification('⏰ Temps Gelé!', '#3b82f6');
                break;
            case 'clear':
                this.clearRandomLetters();
                this.showPowerUpNotification('🧹 Nettoyage!', '#ef4444');
                break;
            case 'hint':
                this.showHint();
                this.showPowerUpNotification('💡 Indice!', '#f59e0b');
                break;
            case 'bonus':
                this.addScore(100);
                this.showPowerUpNotification('💰 Bonus!', '#10b981');
                break;
        }
    }
    
    showPowerUpNotification(message, color) {
        const notification = document.createElement('div');
        notification.className = 'powerup-notification';
        notification.innerHTML = `
            <div class="powerup-content">
                <span class="powerup-message">${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${color};
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: powerupAppear 0.5s ease-out;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'powerupDisappear 0.5s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }
    
    clearRandomLetters() {
        let cleared = 0;
        const maxToClear = Math.min(3, this.letters.length);
        
        for (let i = 0; i < this.currentGridSize && cleared < maxToClear; i++) {
            for (let j = 0; j < this.currentGridSize && cleared < maxToClear; j++) {
                if (this.grid[i][j] && Math.random() < 0.3) {
                    this.grid[i][j] = null;
                    cleared++;
                    
                    // Add explosion effect
                    this.particleSystem.createExplosionEffect(
                        j * this.cellSize + this.cellSize / 2,
                        i * this.cellSize + this.cellSize / 2,
                        0.5
                    );
                }
            }
        }
        
        console.log('🧹 Cleared', cleared, 'letters');
    }
    
    showHint() {
        if (this.targetWords.length === 0) return;
        
        const remainingWords = this.targetWords.filter(word => !this.wordsFound.includes(word));
        if (remainingWords.length === 0) return;
        
        const hintWord = remainingWords[0];
        const hintLetter = hintWord[0];
        
        // Highlight cells that could contain this letter
        this.hintCells = [];
        for (let i = 0; i < this.currentGridSize; i++) {
            for (let j = 0; j < this.currentGridSize; j++) {
                if (this.grid[i][j] === hintLetter) {
                    this.hintCells.push({row: i, col: j});
                }
            }
        }
        
        // Show hint notification
        this.showPowerUpNotification(`💡 Cherchez "${hintLetter}"`, '#f59e0b');
        
        // Clear hint after 3 seconds
        setTimeout(() => {
            this.hintCells = [];
        }, 3000);
    }
    
    // Victory and Game Over Detection and Handling
    checkVictoryCondition() {
        console.log('🏆 Checking victory condition...');
        console.log('📊 Victory check:', {
            wordsFound: this.wordsFound.length,
            targetWords: this.targetWords.length,
            uniqueWordsFound: [...new Set(this.wordsFound)].length
        });
        
        // Check if all target words have been completed
        const uniqueWordsFound = [...new Set(this.wordsFound)];
        const allTargetWordsCompleted = this.targetWords.every(word => 
            uniqueWordsFound.includes(word)
        );
        
        if (allTargetWordsCompleted) {
            console.log('🎉 VICTORY: All target words completed!');
            this.triggerVictory();
            return true;
        }
        
        return false;
    }
    
    checkGameOverConditions() {
        console.log('🔍 Checking game over conditions...');
        
        // Check if grid is too full
        const filledCells = this.letters.length;
        const totalCells = this.currentGridSize * this.currentGridSize;
        const fillPercentage = filledCells / totalCells;
        
        if (fillPercentage >= this.gameLimits.maxGridFill) {
            console.log('❌ Game Over: Grid too full');
            this.triggerGameOver('Grid trop plein !', 'gridFull');
            return true;
        }
        
        // Check time limit
        if (this.stats.gameStartTime) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - this.stats.gameStartTime;
            
            if (elapsedTime >= this.gameLimits.timeLimit) {
                console.log('❌ Game Over: Time limit reached');
                this.triggerGameOver('Temps écoulé !', 'timeLimit');
                return true;
            }
        }
        
        // Check if no valid moves are possible
        if (this.checkNoValidMoves()) {
            console.log('❌ Game Over: No valid moves');
            this.triggerGameOver('Aucun mouvement possible !', 'noValidMoves');
            return true;
        }
        
        // Check score threshold for level progression
        if (this.score < this.gameLimits.minScoreForLevel && this.level > 1) {
            console.log('❌ Game Over: Score too low for level');
            this.triggerGameOver('Score insuffisant !', 'scoreThreshold');
            return true;
        }
        
        return false;
    }
    
    checkNoValidMoves() {
        // Check if there's space for the falling letter
        if (!this.fallingLetter) return false;
        
        // Check if the falling letter can be placed anywhere
        for (let row = 0; row < this.currentGridSize; row++) {
            for (let col = 0; col < this.currentGridSize; col++) {
                if (!this.checkCollision(col, row)) {
                    return false; // Found a valid position
                }
            }
        }
        
        return true; // No valid positions found
    }
    
    triggerVictory() {
        console.log('🏆 Triggering Victory!');
        
        this.gameOver = true;
        this.gameOverReason = 'Victoire ! Tous les mots complétés !';
        this.gameOverConditions.victory = true;
        
        // Stop game loop
        this.stopFallTimer();
        this.gameRunning = false;
        
        // Calculate final stats
        this.calculateFinalStats();
        
        // Show victory screen
        this.showVictoryScreen();
        
        // Play victory sound
        this.audioManager.playLevelUp(); // Use level up sound for victory
        
        // Save high score if applicable
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.showNewHighScoreNotification();
        }
        
        // Create victory particles
        this.particleSystem.createLevelUpEffect();
    }
    
    triggerGameOver(reason, condition) {
        console.log('🎯 Triggering Game Over:', reason);
        
        this.gameOver = true;
        this.gameOverReason = reason;
        this.gameOverConditions[condition] = true;
        
        // Stop game loop
        this.stopFallTimer();
        this.gameRunning = false;
        
        // Calculate final stats
        this.calculateFinalStats();
        
        // Show game over screen
        this.showGameOverScreen();
        
        // Play game over sound
        this.audioManager.playGameOver();
        
        // Save high score if applicable
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.showNewHighScoreNotification();
        }
        
        // Create game over particles
        this.particleSystem.createGameOverEffect();
    }
    
    calculateFinalStats() {
        const currentTime = Date.now();
        const playTime = this.stats.gameStartTime ? 
            (currentTime - this.stats.gameStartTime) / 1000 : 0;
        
        this.gameOverScreen.finalStats = {
            totalScore: this.score,
            wordsCompleted: this.wordsFound.length,
            lettersPlaced: this.stats.lettersPlaced,
            playTime: playTime,
            levelReached: this.level,
            maxCombo: this.maxCombo
        };
        
        console.log('📊 Final Stats:', this.gameOverScreen.finalStats);
    }
    
    showVictoryScreen() {
        console.log('🏆 Showing Victory Screen');
        this.gameOverScreen.visible = true;
        this.gameOverScreen.fadeIn = 0;
        this.gameOverScreen.showStats = false;
        this.gameOverScreen.isVictory = true;
        
        // Animate the victory screen
        this.animateGameOverScreen();
    }
    
    showGameOverScreen() {
        console.log('🎮 Showing Game Over Screen');
        this.gameOverScreen.visible = true;
        this.gameOverScreen.fadeIn = 0;
        this.gameOverScreen.showStats = false;
        this.gameOverScreen.isVictory = false;
        
        // Animate the game over screen
        this.animateGameOverScreen();
    }
    
    animateGameOverScreen() {
        const animate = () => {
            if (!this.gameOverScreen.visible) return;
            
            // Fade in animation
            if (this.gameOverScreen.fadeIn < 1) {
                this.gameOverScreen.fadeIn += 0.02;
            } else {
                // Show stats after fade in
                if (!this.gameOverScreen.showStats) {
                    this.gameOverScreen.showStats = true;
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    showNewHighScoreNotification() {
        const notification = document.createElement('div');
        notification.className = 'high-score-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🏆 Nouveau Record !</h3>
                <p>Score: ${this.score}</p>
                <p>Félicitations !</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    restartGame() {
        console.log('🔄 Restarting Game');
        
        // Reset game state
        this.gameOver = false;
        this.gameOverReason = '';
        this.gameOverScreen.visible = false;
        this.gameOverScreen.fadeIn = 0;
        this.gameOverScreen.showStats = false;
        
        // Reset game conditions
        Object.keys(this.gameOverConditions).forEach(key => {
            this.gameOverConditions[key] = false;
        });
        
        // Reset game data
        this.score = 0;
        this.level = 1;
        this.combo = 1;
        this.maxCombo = 1;
        this.wordsFound = [];
        this.letters = [];
        this.letterQueue = [];
        this.fallingLetter = null;
        
        // Reset stats
        this.stats = {
            lettersPlaced: 0,
            wordsCompleted: 0,
            totalScore: 0,
            playTime: 0,
            startTime: null,
            gameStartTime: null
        };
        
        // Reset balancing
        this.applyBalancing();
        
        // Start new game
        this.startGame();
    }
    
    // Enhanced game loop with game over checks
    gameLoop() {
        if (!this.gameRunning || this.paused) return;
        
        // Update game time
        if (this.stats.gameStartTime) {
            this.stats.playTime = (Date.now() - this.stats.gameStartTime) / 1000;
        }
        
        // Check game over conditions
        if (this.checkGameOverConditions()) {
            return; // Game over, stop the loop
        }
        
        // Update falling letter
        this.updateFallingLetter();
        
        // Update particles
        this.particleSystem.update();
        
        // Render everything
        this.render();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    drawGameOverScreen() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const isVictory = this.gameOverScreen.isVictory;
        
        // Create beautiful gradient overlay
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn * 0.9;
        
        // Create gradient background - different colors for victory vs game over
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (isVictory) {
            gradient.addColorStop(0, 'rgba(46, 204, 113, 0.95)'); // Green for victory
            gradient.addColorStop(0.5, 'rgba(39, 174, 96, 0.95)');
            gradient.addColorStop(1, 'rgba(0, 184, 148, 0.95)');
        } else {
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.95)');
            gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.95)');
            gradient.addColorStop(1, 'rgba(255, 71, 87, 0.95)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // Add animated particles in background
        this.drawGameOverParticles();
        
        // Title with enhanced styling
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn;
        
        // Create text gradient
        const textGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        if (isVictory) {
            textGradient.addColorStop(0, '#2ecc71');
            textGradient.addColorStop(0.5, '#27ae60');
            textGradient.addColorStop(1, '#00b894');
        } else {
            textGradient.addColorStop(0, '#ff4757');
            textGradient.addColorStop(0.5, '#ff3838');
            textGradient.addColorStop(1, '#c44569');
        }
        
        ctx.fillStyle = textGradient;
        ctx.font = 'bold 64px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Enhanced glow effect
        ctx.shadowColor = isVictory ? '#2ecc71' : '#ff4757';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add stroke for better visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        const titleText = isVictory ? 'VICTOIRE !' : 'GAME OVER';
        ctx.strokeText(titleText, canvas.width / 2, canvas.height / 2 - 120);
        ctx.fillText(titleText, canvas.width / 2, canvas.height / 2 - 120);
        ctx.restore();
        
        // Reason with better styling
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(this.gameOverReason, canvas.width / 2, canvas.height / 2 - 60);
        ctx.restore();
        
        // Final Stats with enhanced design
        if (this.gameOverScreen.showStats) {
            this.drawGameOverStats();
        }
        
        // Action Buttons with modern styling
        if (this.gameOverScreen.showStats) {
            this.drawGameOverButtons();
        }
    }
    
    drawGameOverParticles() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const time = Date.now() * 0.001;
        
        // Create floating particles
        for (let i = 0; i < 15; i++) {
            const x = (i * 100 + time * 50) % canvas.width;
            const y = (i * 80 + time * 30) % canvas.height;
            const size = Math.sin(time + i) * 3 + 4;
            const alpha = Math.sin(time + i) * 0.3 + 0.2;
            
            ctx.save();
            ctx.globalAlpha = alpha * this.gameOverScreen.fadeIn;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    drawGameOverStats() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const stats = this.gameOverScreen.finalStats;
        
        // Enhanced stats background with glass morphism effect
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn;
        
        // Create gradient background
        const statsGradient = ctx.createLinearGradient(0, 0, 0, 250);
        statsGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        statsGradient.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
        
        ctx.fillStyle = statsGradient;
        
        // Rounded rectangle effect
        const statsX = canvas.width / 2 - 220;
        const statsY = canvas.height / 2 - 40;
        const statsWidth = 440;
        const statsHeight = 220;
        const radius = 20;
        
        ctx.beginPath();
        ctx.moveTo(statsX + radius, statsY);
        ctx.lineTo(statsX + statsWidth - radius, statsY);
        ctx.quadraticCurveTo(statsX + statsWidth, statsY, statsX + statsWidth, statsY + radius);
        ctx.lineTo(statsX + statsWidth, statsY + statsHeight - radius);
        ctx.quadraticCurveTo(statsX + statsWidth, statsY + statsHeight, statsX + statsWidth - radius, statsY + statsHeight);
        ctx.lineTo(statsX + radius, statsY + statsHeight);
        ctx.quadraticCurveTo(statsX, statsY + statsHeight, statsX, statsY + statsHeight - radius);
        ctx.lineTo(statsX, statsY + radius);
        ctx.quadraticCurveTo(statsX, statsY, statsX + radius, statsY);
        ctx.closePath();
        ctx.fill();
        
        // Add shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        ctx.restore();
        
        // Stats title with gradient
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn;
        
        const titleGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        titleGradient.addColorStop(0, '#667eea');
        titleGradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = titleGradient;
        ctx.font = 'bold 32px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.fillText('🏆 Statistiques Finales', canvas.width / 2, canvas.height / 2 - 20);
        ctx.restore();
        
        // Stats content with better layout
        const statsContentY = canvas.height / 2 + 20;
        const statsData = [
            { label: '🎯 Score Final', value: stats.totalScore, color: '#667eea' },
            { label: '📝 Mots Complétés', value: stats.wordsCompleted, color: '#764ba2' },
            { label: '🔤 Lettres Placées', value: stats.lettersPlaced, color: '#4ecdc4' },
            { label: '⏱️ Temps de Jeu', value: `${Math.floor(stats.playTime / 60)}:${(stats.playTime % 60).toFixed(0).padStart(2, '0')}`, color: '#ff6b6b' },
            { label: '📈 Niveau Atteint', value: stats.levelReached, color: '#ffa726' },
            { label: '🔥 Combo Max', value: stats.maxCombo, color: '#ff4757' }
        ];
        
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn;
        ctx.font = 'bold 18px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        statsData.forEach((stat, index) => {
            const y = statsContentY + (index * 35);
            const x = canvas.width / 2 - 180;
            
            // Label with color
            ctx.fillStyle = stat.color;
            ctx.fillText(stat.label, x, y);
            
            // Value
            ctx.fillStyle = '#333';
            ctx.fillText(`: ${stat.value}`, x + 200, y);
        });
        ctx.restore();
    }
    
    drawGameOverButtons() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Restart Button
        const restartBtn = {
            x: canvas.width / 2 - 140,
            y: canvas.height / 2 + 120,
            width: 120,
            height: 50,
            text: '🔄 Recommencer',
            gradient: ['#667eea', '#764ba2']
        };
        
        // Main Menu Button
        const menuBtn = {
            x: canvas.width / 2 + 20,
            y: canvas.height / 2 + 120,
            width: 120,
            height: 50,
            text: '🏠 Menu Principal',
            gradient: ['#ff6b6b', '#ff4757']
        };
        
        // Draw buttons with enhanced styling
        [restartBtn, menuBtn].forEach(btn => {
            ctx.save();
            ctx.globalAlpha = this.gameOverScreen.fadeIn;
            
            // Create button gradient
            const btnGradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
            btnGradient.addColorStop(0, btn.gradient[0]);
            btnGradient.addColorStop(1, btn.gradient[1]);
            
            // Button background with rounded corners
            ctx.fillStyle = btnGradient;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 5;
            
            // Rounded rectangle
            const radius = 25;
            ctx.beginPath();
            ctx.moveTo(btn.x + radius, btn.y);
            ctx.lineTo(btn.x + btn.width - radius, btn.y);
            ctx.quadraticCurveTo(btn.x + btn.width, btn.y, btn.x + btn.width, btn.y + radius);
            ctx.lineTo(btn.x + btn.width, btn.y + btn.height - radius);
            ctx.quadraticCurveTo(btn.x + btn.width, btn.y + btn.height, btn.x + btn.width - radius, btn.y + btn.height);
            ctx.lineTo(btn.x + radius, btn.y + btn.height);
            ctx.quadraticCurveTo(btn.x, btn.y + btn.height, btn.x, btn.y + btn.height - radius);
            ctx.lineTo(btn.x, btn.y + radius);
            ctx.quadraticCurveTo(btn.x, btn.y, btn.x + radius, btn.y);
            ctx.closePath();
            ctx.fill();
            
            // Button text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
            ctx.restore();
        });
        
        // Store button positions for click handling
        this.gameOverButtons = { restartBtn, menuBtn };
    }

    showGameControlsDialog() {
        // Remove existing dialog if present
        const existingDialog = document.querySelector('.game-controls-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialog = document.createElement('div');
        dialog.className = 'game-controls-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <i class="fas fa-gamepad"></i>
                    <h2>Contrôles du Jeu</h2>
                    <button class="dialog-close" onclick="this.closest('.game-controls-dialog').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="dialog-body">
                    <div class="controls-section">
                        <div class="section-header">
                            <i class="fas fa-crosshairs"></i>
                            <h3>Contrôles de Jeu</h3>
                        </div>
                        <div class="controls-grid">
                            <div class="control-item">
                                <div class="key-label">Flèches</div>
                                <div class="key-description">Déplacer la lettre tombante</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">Espace</div>
                                <div class="key-description">Placer la lettre rapidement</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">S</div>
                                <div class="key-description">Démarrer/Arrêter le jeu</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">P</div>
                                <div class="key-description">Pause/Reprendre</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">R</div>
                                <div class="key-description">Recommencer la partie</div>
                            </div>
                        </div>
                    </div>

                    <div class="controls-section">
                        <div class="section-header">
                            <i class="fas fa-camera"></i>
                            <h3>Contrôles Caméra</h3>
                        </div>
                        <div class="controls-grid">
                            <div class="control-item">
                                <div class="key-label">1</div>
                                <div class="key-description">Vue de face</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">2</div>
                                <div class="key-description">Vue de côté</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">F</div>
                                <div class="key-description">Vue de face</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">I</div>
                                <div class="key-description">Vue isométrique</div>
                            </div>
                        </div>
                    </div>

                    <div class="controls-section">
                        <div class="section-header">
                            <i class="fas fa-cog"></i>
                            <h3>Interface</h3>
                        </div>
                        <div class="controls-grid">
                            <div class="control-item">
                                <div class="key-label">H</div>
                                <div class="key-description">Afficher l'aide</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">G</div>
                                <div class="key-description">Basculer l'interface</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">M</div>
                                <div class="key-description">Menu principal</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">T</div>
                                <div class="key-description">Basculer les tutoriels</div>
                            </div>
                        </div>
                    </div>

                    <div class="controls-section">
                        <div class="section-header">
                            <i class="fas fa-gamepad"></i>
                            <h3>Navigation</h3>
                        </div>
                        <div class="controls-grid">
                            <div class="control-item">
                                <div class="key-label">Échap</div>
                                <div class="key-description">Quitter le mode plein écran</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">F11</div>
                                <div class="key-description">Basculer plein écran</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">Tab</div>
                                <div class="key-description">Navigation entre éléments</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">Entrée</div>
                                <div class="key-description">Valider/Activer</div>
                            </div>
                        </div>
                    </div>

                    <div class="controls-section">
                        <div class="section-header">
                            <i class="fas fa-mouse"></i>
                            <h3>Contrôles Souris</h3>
                        </div>
                        <div class="controls-grid">
                            <div class="control-item">
                                <div class="key-label">Clic Gauche</div>
                                <div class="key-description">Sélectionner/Placer</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">Molette</div>
                                <div class="key-description">Zoom avant/arrière</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">Clic Droit</div>
                                <div class="key-description">Menu contextuel</div>
                            </div>
                            <div class="control-item">
                                <div class="key-label">Glisser</div>
                                <div class="key-description">Rotation de la caméra</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dialog-footer">
                    <button class="btn-secondary" onclick="this.closest('.game-controls-dialog').remove()">
                        <i class="fas fa-times"></i>
                        Fermer
                    </button>
                    <button class="btn-primary" onclick="this.closest('.game-controls-dialog').remove(); if(window.game2D) window.game2D.startGame();">
                        <i class="fas fa-play"></i>
                        Commencer à Jouer
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .game-controls-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .dialog-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .dialog-content {
                position: relative;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
                border-radius: 20px;
                padding: 0;
                max-width: 800px;
                max-height: 90vh;
                width: 90%;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(25px);
            }

            .dialog-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px 30px;
                display: flex;
                align-items: center;
                gap: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }

            .dialog-header h2 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 700;
                flex: 1;
            }

            .dialog-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .dialog-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            .dialog-body {
                padding: 30px;
                max-height: 60vh;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #667eea #f1f5f9;
            }

            .dialog-body::-webkit-scrollbar {
                width: 8px;
            }

            .dialog-body::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
            }

            .dialog-body::-webkit-scrollbar-thumb {
                background: #667eea;
                border-radius: 4px;
            }

            .controls-section {
                margin-bottom: 30px;
            }

            .section-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }

            .section-header i {
                color: #667eea;
                font-size: 1.2rem;
            }

            .section-header h3 {
                margin: 0;
                color: #1e293b;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .controls-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
            }

            .control-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                border: 1px solid rgba(102, 126, 234, 0.2);
                transition: all 0.3s ease;
            }

            .control-item:hover {
                background: rgba(255, 255, 255, 0.95);
                border-color: #667eea;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
            }

            .key-label {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 0.9rem;
                min-width: 80px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }

            .key-description {
                color: #374151;
                font-size: 0.95rem;
                font-weight: 500;
                flex: 1;
            }

            .dialog-footer {
                background: #f8fafc;
                padding: 20px 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid #e2e8f0;
            }

            .btn-secondary, .btn-primary {
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                border: none;
            }

            .btn-secondary {
                background: rgba(102, 126, 234, 0.1);
                color: #667eea;
                border: 2px solid rgba(102, 126, 234, 0.3);
            }

            .btn-secondary:hover {
                background: rgba(102, 126, 234, 0.2);
                transform: translateY(-2px);
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
            }

            @media (max-width: 768px) {
                .dialog-content {
                    width: 95%;
                    max-height: 95vh;
                }

                .dialog-header {
                    padding: 15px 20px;
                }

                .dialog-body {
                    padding: 20px;
                }

                .controls-grid {
                    grid-template-columns: 1fr;
                }

                .dialog-footer {
                    flex-direction: column;
                    gap: 10px;
                }

                .btn-secondary, .btn-primary {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(dialog);

        // Add click outside to close
        dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
            dialog.remove();
        });

        // Add escape key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                dialog.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
}

// Word Detection System
class WordDetector {
    constructor(dictionary) {
        this.dictionary = dictionary;
    }
    
    scanGrid(grid) {
        const words = [];
        
        // Scan horizontal
        for (let row = 0; row < grid.length; row++) {
            const rowWords = this.findWordsInRow(grid[row]);
            words.push(...rowWords);
        }
        
        // Scan vertical
        for (let col = 0; col < grid[0].length; col++) {
            const colLetters = grid.map(row => row[col]);
            const colWords = this.findWordsInRow(colLetters);
            words.push(...colWords);
        }
        
        return words;
    }
    
    findWordsInRow(letters) {
        const words = [];
        const rowString = letters.map(letter => letter || ' ').join('');
        
        // Find all possible words of 3+ letters
        for (let start = 0; start < rowString.length; start++) {
            for (let length = 3; length <= rowString.length - start; length++) {
                const word = rowString.substr(start, length).replace(/\s/g, '');
                if (word.length >= 3 && this.validateWord(word)) {
                    words.push(word);
                }
            }
        }
        
        return words;
    }
    
    validateWord(word) {
        return this.dictionary.has(word.toUpperCase());
    }
}

// Scoring System
class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.highScore = 0;
    }
    
    updateScore(score) {
        this.currentScore = score;
        if (score > this.highScore) {
            this.highScore = score;
        }
    }
    
    getScore() {
        return this.currentScore;
    }
    
    getHighScore() {
        return this.highScore;
    }
}

// Level System
class LevelManager {
    constructor() {
        this.levels = [
            { minWords: 0, maxWords: 5, speed: 1000 },
            { minWords: 5, maxWords: 10, speed: 900 },
            { minWords: 10, maxWords: 15, speed: 800 },
            { minWords: 15, maxWords: 20, speed: 700 },
            { minWords: 20, maxWords: 25, speed: 600 },
            { minWords: 25, maxWords: 30, speed: 500 },
            { minWords: 30, maxWords: 35, speed: 400 },
            { minWords: 35, maxWords: 40, speed: 300 },
            { minWords: 40, maxWords: 45, speed: 200 },
            { minWords: 45, maxWords: 50, speed: 150 }
        ];
    }
    
    getCurrentLevel(wordsFound) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (wordsFound >= this.levels[i].minWords) {
                return i + 1;
            }
        }
        return 1;
    }
    
    checkLevelProgression(wordsFound) {
        const newLevel = this.getCurrentLevel(wordsFound);
        return newLevel;
    }
}

// Audio System
class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
    }
    
    playStart() {
        this.playSound('start');
    }
    
    playPause() {
        this.playSound('pause');
    }
    
    playResume() {
        this.playSound('resume');
    }
    
    playReset() {
        this.playSound('reset');
    }
    
    playMove() {
        this.playSound('move');
    }
    
    playRotate() {
        this.playSound('rotate');
    }
    
    playPlace() {
        this.playSound('place');
    }
    
    playDrop() {
        this.playSound('drop');
    }
    
    playWordComplete() {
        this.playSound('wordComplete');
    }
    
    playLevelUp() {
        this.playSound('levelUp');
    }
    
    playGameOver() {
        this.playSound('gameOver');
    }
    
    playSound(type) {
        try {
            const audioContext = this.audioContext;
            if (!audioContext) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const frequency = this.getFrequencyForSound(type);
            const duration = this.getDurationForSound(type);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
            console.log(`🔊 Playing sound: ${type} (${frequency}Hz, ${duration}s)`);
        } catch (error) {
            console.warn('⚠️ Audio playback failed:', error);
        }
    }
    
    getFrequencyForSound(type) {
        const frequencies = {
            start: 440,
            pause: 330,
            resume: 440,
            reset: 220,
            move: 660,
            rotate: 550,
            place: 880,
            drop: 770,
            wordComplete: 1100,
            levelUp: 1320,
            gameOver: 1500
        };
        return frequencies[type] || 440;
    }
    
    getDurationForSound(type) {
        const durations = {
            start: 0.3,
            pause: 0.2,
            resume: 0.2,
            reset: 0.4,
            move: 0.1,
            rotate: 0.1,
            place: 0.2,
            drop: 0.15,
            wordComplete: 0.5,
            levelUp: 0.8,
            gameOver: 1.0
        };
        return durations[type] || 0.2;
    }
}

// Particle System
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.effects = {
            placement: { count: 15, color: '#667eea', size: 3, speed: 2 },
            wordComplete: { count: 25, color: '#10b981', size: 4, speed: 3 },
            combo: { count: 20, color: '#f59e0b', size: 3, speed: 2.5 },
            levelUp: { count: 30, color: '#8b5cf6', size: 5, speed: 4 },
            explosion: { count: 40, color: '#ef4444', size: 6, speed: 5 }
        };
    }
    
    // Helper method to get canvas dimensions safely
    getCanvasDimensions() {
        let canvasWidth = 800; // Default fallback
        let canvasHeight = 600; // Default fallback
        
        // Try to get canvas dimensions from the game instance
        if (window.game && window.game.canvas) {
            canvasWidth = window.game.canvas.width;
            canvasHeight = window.game.canvas.height;
        }
        
        return { width: canvasWidth, height: canvasHeight };
    }
    
    createPlacementEffect(x, y, letter = 'A') {
        console.log('✨ Creating enhanced placement effect at:', { x, y, letter });
        
        // Call the new enhanced HTML-based effect if available
        if (typeof createLetterPlacementEffect === 'function') {
            createLetterPlacementEffect(x, y, letter);
        }
        
        // Original canvas-based particle effect
        const effect = this.effects.placement;
        
        for (let i = 0; i < effect.count * 1.5; i++) { // More particles
            const particle = {
                x: x + Math.random() * 40 - 20,
                y: y + Math.random() * 40 - 20,
                vx: (Math.random() - 0.5) * effect.speed * 1.2,
                vy: (Math.random() - 0.5) * effect.speed * 1.2,
                life: 1.0,
                maxLife: 1.0,
                size: effect.size + Math.random() * 3,
                color: effect.color,
                type: 'placement',
                alpha: 1.0,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            };
            this.particles.push(particle);
        }
    }
    
    createWordCompletionEffect(word, x, y) {
        console.log('🎉 Creating word completion effect for:', word);
        const effect = this.effects.wordComplete;
        
        // Create letter particles for each letter in the word
        for (let i = 0; i < word.length; i++) {
            for (let j = 0; j < 8; j++) {
                const particle = {
                    x: x + i * 30 + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * effect.speed * 2,
                    vy: (Math.random() - 0.5) * effect.speed * 2,
                    life: 1.5,
                    maxLife: 1.5,
                    size: effect.size + Math.random() * 3,
                    color: effect.color,
                    type: 'wordComplete',
                    alpha: 1.0,
                    letter: word[i],
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.3
                };
                this.particles.push(particle);
            }
        }
        
        // Create celebration particles
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const radius = 50 + Math.random() * 30;
            
            const particle = {
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                vx: Math.cos(angle) * effect.speed,
                vy: Math.sin(angle) * effect.speed,
                life: 2.0,
                maxLife: 2.0,
                size: effect.size + Math.random() * 2,
                color: '#ffd700',
                type: 'celebration',
                alpha: 1.0,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.4
            };
            this.particles.push(particle);
        }
    }
    
    createComboEffect(bonus, x, y) {
        console.log('🔥 Creating combo effect with bonus:', bonus);
        const effect = this.effects.combo;
        
        for (let i = 0; i < effect.count; i++) {
            const particle = {
                x: x + (Math.random() - 0.5) * 100,
                y: y + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * effect.speed,
                vy: (Math.random() - 0.5) * effect.speed,
                life: 1.2,
                maxLife: 1.2,
                size: effect.size + Math.random() * 3,
                color: effect.color,
                type: 'combo',
                alpha: 1.0,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                text: `+${bonus}`
            };
            this.particles.push(particle);
        }
    }
    
    createLevelUpEffect() {
        console.log('🌟 Creating level up effect');
        
        // Get canvas dimensions safely
        const { width: canvasWidth, height: canvasHeight } = this.getCanvasDimensions();
        
        // Create multiple particle bursts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createParticleBurst(
                    Math.random() * canvasWidth,
                    Math.random() * canvasHeight,
                    20,
                    ['#ffd700', '#ffed4e', '#fff200'],
                    2.0
                );
            }, i * 100);
        }
        
        // Create central explosion
        this.createParticleBurst(
            canvasWidth / 2,
            canvasHeight / 2,
            30,
            ['#667eea', '#764ba2', '#4ecdc4'],
            3.0
        );
    }
    
    createGameOverEffect() {
        console.log('💀 Creating game over effect');
        
        // Get canvas dimensions safely
        const { width: canvasWidth, height: canvasHeight } = this.getCanvasDimensions();
        
        // Create dark particles spreading from center
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Create multiple dark particle bursts
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createParticleBurst(
                    centerX + (Math.random() - 0.5) * 200,
                    centerY + (Math.random() - 0.5) * 200,
                    15,
                    ['#ff4757', '#ff3838', '#ff3838'],
                    1.5
                );
            }, i * 150);
        }
        
        // Create central dark explosion
        this.createParticleBurst(
            centerX,
            centerY,
            25,
            ['#2c2c54', '#40407a', '#706fd3'],
            2.5
        );
        
        // Create falling particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createFallingParticle(
                    Math.random() * canvasWidth,
                    -10,
                    ['#ff4757', '#ff3838', '#c44569']
                );
            }, i * 50);
        }
    }
    
    createFallingParticle(x, y, colors) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 2,
            life: 1.0,
            maxLife: 3.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2,
            type: 'falling'
        };
        
        this.particles.push(particle);
    }
    
    createParticleBurst(x, y, count, colors, intensity = 1.0) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;
            
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed * intensity,
                vy: Math.sin(angle) * speed * intensity,
                life: 1.0,
                maxLife: 2.0 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 6 + 3,
                type: 'burst'
            };
            
            this.particles.push(particle);
        }
    }
    
    render(ctx) {
        if (!ctx) return;
        
        // Update and render particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update life
            particle.life -= 0.016; // 60 FPS
            
            // Update rotation
            particle.rotation += particle.rotationSpeed;
            
            // Update alpha
            particle.alpha = particle.life / particle.maxLife;
            
            // Update size (pulse effect)
            const pulse = Math.sin(Date.now() * 0.01 + i) * 0.2 + 1;
            const currentSize = particle.size * pulse;
            
            // Render particle
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            
            // Draw particle based on type
            if (particle.type === 'wordComplete' && particle.letter) {
                // Draw letter particle with proper display
                ctx.fillStyle = particle.color;
                ctx.font = `${currentSize * 2}px "Segoe UI", "Arial", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Ensure proper letter display
                const displayLetter = window.game ? window.game.ensureLetterDisplay(particle.letter) : particle.letter;
                ctx.fillText(displayLetter, 0, 0);
            } else if (particle.type === 'combo' && particle.text) {
                // Draw combo text
                ctx.fillStyle = particle.color;
                ctx.font = `bold ${currentSize * 1.5}px "Segoe UI", "Arial", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(particle.text, 0, 0);
            } else {
                // Draw regular particle
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = currentSize * 2;
                ctx.beginPath();
                ctx.arc(0, 0, currentSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
}

// Game initialization is now handled by the specific game pages
// This prevents automatic initialization on the home page
// The game will only initialize when explicitly called from game pages
