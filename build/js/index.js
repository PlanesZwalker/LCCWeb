// Complete Game Engine for Letters Cascade Challenge
// Implements all functionalities from technical specifications

class LettersCascadeGame {
    constructor() {
        console.log('🎮 LettersCascadeGame constructor called');
        
        // Grid Configuration
        this.gridSizes = [8, 10, 12];
        this.currentGridSize = 10;
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
        this.fallSpeed = 1000; // milliseconds
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
            
            // Dynamic speed adjustment
            baseFallSpeed: 1000,
            minFallSpeed: 600,
            maxFallSpeed: 2000,
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
    init() {
        console.log('🚀 Initializing LettersCascadeGame...');
        
        try {
            // Initialize canvas
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                console.error('❌ Canvas initialization failed');
                return;
            }
            
            // Resize canvas to proper dimensions
            this.resizeCanvas();
            
            console.log('✅ Canvas initialized:', {
                width: this.canvas.width,
                height: this.canvas.height,
                context: this.ctx
            });
            
            // Initialize grid
            this.createGrid();
            
            // Initialize letter queue
            this.generateLetterQueue();
            
            // Initialize word detector
            this.wordDetector = new WordDetector(this.targetWords);
            
            // Setup controls
            this.setupControls();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load dictionary
            this.loadDictionary();
            
            // Initial render
            this.render();
            
            console.log('✅ Game initialization completed successfully');
            
        } catch (error) {
            console.error('❌ Error during game initialization:', error);
        }
    }
    
    // 🎯 INTELLIGENT BALANCING METHODS
    
    calculateLetterFrequency() {
        console.log('📊 Calculating letter frequency for target words...');
        
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
        
        console.log('📈 Letter frequency calculated:', frequency);
        return frequency;
    }
    
    applyBalancing() {
        console.log('⚖️ Applying intelligent game balancing...');
        
        // 1. Adjust fall speed based on level and complexity
        this.adjustFallSpeed();
        
        // 2. Optimize grid size for current words
        this.optimizeGridSize();
        
        // 3. Generate balanced letter queue
        this.generateBalancedLetterQueue();
        
        // 4. Update target words based on level
        this.updateTargetWords();
        
        console.log('✅ Balancing applied:', {
            fallSpeed: this.fallSpeed,
            gridSize: this.currentGridSize,
            targetWords: this.targetWords,
            queueLength: this.letterQueue.length
        });
    }
    
    adjustFallSpeed() {
        const baseSpeed = this.balancingSystem.baseFallSpeed;
        const levelMultiplier = 1 + (this.level - 1) * this.balancingSystem.levelBalance.speedIncrease;
        const complexityMultiplier = this.calculateComplexityMultiplier();
        
        this.fallSpeed = Math.max(
            this.balancingSystem.minFallSpeed,
            Math.min(
                this.balancingSystem.maxFallSpeed,
                baseSpeed * levelMultiplier * complexityMultiplier
            )
        );
        
        console.log('⚡ Fall speed adjusted:', {
            level: this.level,
            baseSpeed: baseSpeed,
            levelMultiplier: levelMultiplier,
            complexityMultiplier: complexityMultiplier,
            finalSpeed: this.fallSpeed
        });
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
        
        console.log('📐 Grid size optimized:', {
            maxWordLength: maxWordLength,
            avgWordLength: avgWordLength,
            wordCount: this.targetWords.length,
            optimalSize: optimalSize,
            cellSize: this.cellSize
        });
    }
    
    generateBalancedLetterQueue() {
        console.log('🎲 Generating balanced letter queue...');
        
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
        
        console.log('📋 Balanced letter queue generated:', {
            queueLength: this.letterQueue.length,
            uniqueLetters: [...new Set(this.letterQueue)].length,
            nextLetters: this.letterQueue.slice(0, 5)
        });
    }
    
    updateTargetWords() {
        console.log('📝 Updating target words for level', this.level);
        
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
        
        console.log('🎯 Target words updated:', {
            level: this.level,
            difficulty: difficulty,
            wordCount: this.targetWords.length,
            words: this.targetWords
        });
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
            if (this.gameRunning && !this.paused) {
                this.render();
                this.updateLevel();
            } else {
                // Still render even when paused to show current state
                this.render();
            }
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
    
    // Grid System
    createGrid() {
        console.log('🏗️ Creating game grid...');
        this.grid = [];
        for (let row = 0; row < this.currentGridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.currentGridSize; col++) {
                this.grid[row][col] = null;
            }
        }
        console.log('✅ Grid created:', this.currentGridSize + 'x' + this.currentGridSize);
    }
    
    // Letter Generation System
    generateLetterQueue() {
        console.log('📝 Generating letter queue...');
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
        
        console.log('✅ Letter queue generated:', this.letterQueue);
        this.updateLetterQueueDisplay();
    }
    
    // Enhanced Word Detection System
    checkWordCompletion() {
        console.log('🔍 Checking word completion...');
        
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
    }
    
    completeWord(word) {
        console.log('🎉 Word completed:', word);
        
        // Add to found words
        this.wordsFound.push(word);
        
        // Calculate enhanced score
        const baseScore = word.length * 10;
        const comboBonus = this.combo * 5;
        const timeBonus = Math.max(0, 10 - Math.floor((Date.now() - this.lastWordTime) / 1000));
        const totalScore = baseScore + comboBonus + timeBonus;
        
        this.addScore(totalScore);
        
        // Update combo
        this.combo++;
        this.lastWordTime = Date.now();
        
        // Enhanced visual effects
        this.showEnhancedWordCompletionNotification(word, totalScore);
        
        // Remove word from grid with enhanced effect
        this.removeWordFromGrid(word);
        
        // Update level
        this.updateLevel();
        
        // Random power-up chance
        if (Math.random() < 0.2) {
            this.addPowerUp();
        }
        
        console.log('📊 Word completion stats:', {
            word: word,
            score: totalScore,
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
        
        // Intelligent level progression based on performance
        const wordsNeeded = this.level * 2; // 2 words per level
        const scoreNeeded = this.level * 100; // 100 points per level
        
        if (this.wordsFound.length >= wordsNeeded && this.score >= scoreNeeded) {
            this.level++;
            console.log('🎉 Level up! Level', previousLevel, '→ Level', this.level);
            
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
            wordsNeeded: wordsNeeded,
            scoreNeeded: scoreNeeded,
            currentWords: this.wordsFound.length,
            currentScore: this.score
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
            1: { words: 3, score: 100 },
            2: { words: 5, score: 250 },
            3: { words: 7, score: 500 },
            4: { words: 10, score: 1000 },
            5: { words: 15, score: 2000 }
        };
        
        return requirements[this.level] || { words: 'MAX', score: 'MAX' };
    }
    
    // Enhanced Game Controls
    setupControls() {
        console.log('🎮 Setting up enhanced game controls...');
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleEnhancedKeyPress(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Add touch controls for mobile
        this.setupTouchControls();
        
        console.log('✅ Enhanced controls setup completed');
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
            case ' ':
                this.rotateFallingLetter();
                this.audioManager.playRotate();
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
                } else if (deltaY < -50) {
                    this.rotateFallingLetter();
                }
            }
        });
    }
    
    // Falling Letter System
    createFallingLetter() {
        console.log('📝 Creating falling letter...');
        
        if (this.letterQueue.length === 0) {
            console.log('📝 Regenerating letter queue...');
            this.generateLetterQueue();
        }
        
        const letter = this.letterQueue.shift();
        
        if (!letter) {
            console.error('❌ No letters available in queue');
            return;
        }
        
        // Position the falling letter at the top center
        const x = Math.floor(this.currentGridSize / 2);
        const y = 0;
        
        this.fallingLetter = {
            letter: letter,
            x: x,
            y: y,
            rotation: 0
        };
        
        console.log('✅ Falling letter created:', {
            letter: letter,
            position: { x: x, y: y },
            queueRemaining: this.letterQueue.length,
            gridState: this.grid[y][x]
        });
        
        // Update letter queue display
        this.updateLetterQueueDisplay();
        
        // Force a render to show the falling letter
        this.render();
    }
    
    moveFallingLetter(direction) {
        if (!this.fallingLetter) return;
        
        const newX = this.fallingLetter.x + direction;
        if (newX >= 0 && newX < this.currentGridSize && !this.checkCollision(newX, this.fallingLetter.y)) {
            this.fallingLetter.x = newX;
            this.audioManager.playMove();
        }
    }
    
    rotateFallingLetter() {
        if (!this.fallingLetter) return;
        this.fallingLetter.rotation = (this.fallingLetter.rotation + 90) % 360;
        this.audioManager.playRotate();
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
        
        if (y >= this.currentGridSize) return true;
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
            gridBounds: { rows: this.currentGridSize, cols: this.currentGridSize }
        });
        
        // Check bounds
        if (x < 0 || x >= this.currentGridSize || y < 0 || y >= this.currentGridSize) {
            console.error('❌ Letter placement out of bounds:', { x, y });
            return;
        }
        
        // Check if position is already occupied
        if (this.grid[y][x] !== null) {
            console.error('❌ Position already occupied:', { x, y, existingLetter: this.grid[y][x] });
            return;
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
        
        // Create placement effect
        this.particleSystem.createPlacementEffect(x * this.cellSize, y * this.cellSize);
        
        // Play sound
        this.audioManager.playPlace();
        
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
    
    // Enhanced Game State Management
    startGame() {
        console.log('🚀 startGame() called');
        
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
        
        console.log('📊 Game state before start:', {
            gameRunning: this.gameRunning,
            paused: this.paused,
            fallingLetter: this.fallingLetter,
            gridSize: this.grid ? this.grid.length : 'undefined',
            gridLetters: this.grid ? this.grid.flat().filter(cell => cell !== null).length : 0
        });
        
        this.gameRunning = true;
        this.paused = false;
        
        // Ensure we have a falling letter
        if (!this.fallingLetter) {
            console.log('📝 Creating initial falling letter...');
            this.createFallingLetter();
        }
        
        // Start the fall timer
        this.startFallTimer();
        
        // Show start notification
        this.showGameStartNotification();
        
        // Force initial render
        this.render();
        
        console.log('✅ Game started successfully');
        console.log('📊 Game state after start:', {
            gameRunning: this.gameRunning,
            paused: this.paused,
            fallingLetter: this.fallingLetter,
            gridLetters: this.grid.flat().filter(cell => cell !== null).length
        });
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
        this.fallTimer = setInterval(() => {
            if (this.gameRunning && !this.paused) {
                this.updateFallingLetter();
            }
        }, this.fallSpeed);
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
        
        this.render();
        this.updateLevel();
        this.updateStats();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Test function to manually place letters
    testLetterPlacement() {
        console.log('🧪 Testing letter placement...');
        
        // Place some test letters
        this.grid[0][0] = 'A';
        this.grid[0][1] = 'B';
        this.grid[0][2] = 'C';
        this.grid[1][0] = 'D';
        this.grid[1][1] = 'E';
        this.grid[1][2] = 'F';
        
        console.log('📝 Test letters placed:', {
            gridState: this.grid.map(row => row.map(cell => cell || '.').join('')).join('\n'),
            totalLetters: this.grid.flat().filter(cell => cell !== null).length
        });
        
        // Force render
        this.render();
        
        console.log('✅ Test letter placement completed');
    }
    
    // Enhanced Rendering
    render() {
        if (!this.ctx) {
            console.error('❌ Canvas context not available for rendering');
            return;
        }
        
        // Count letters in grid before rendering
        const lettersInGrid = this.grid.flat().filter(cell => cell !== null).length;
        
        console.log('🎨 Rendering frame:', {
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            gridSize: this.currentGridSize,
            cellSize: this.cellSize,
            fallingLetter: this.fallingLetter ? this.fallingLetter.letter : 'none',
            gridCells: lettersInGrid,
            gridState: this.grid.map(row => row.map(cell => cell || '.').join('')).join('\n')
        });
        
        // Clear canvas with enhanced background
        this.drawEnhancedBackground();
        
        // Draw enhanced grid
        this.drawEnhancedGrid();
        
        // Draw enhanced falling letter with VFX
        if (this.fallingLetter) {
            this.drawEnhancedFallingLetter();
        }
        
        // Render particle effects
        this.particleSystem.render(this.ctx);
        
        // Draw UI overlays
        this.drawUIOverlays();
        
        // Draw game over screen if active
        if (this.gameOverScreen.visible) {
            this.drawGameOverScreen();
        }
        
        console.log('✅ Frame rendered successfully with', lettersInGrid, 'letters in grid');
    }
    
    drawEnhancedBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add animated particles in background
        const time = Date.now() * 0.001;
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
    
    drawEnhancedGrid() {
        console.log('🏗️ Drawing enhanced grid...');
        
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const startX = (this.canvas.width - gridSize * cellSize) / 2;
        const startY = (this.canvas.height - gridSize * cellSize) / 2;
        
        // Draw grid cells with enhanced effects
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = startX + col * cellSize;
                const y = startY + row * cellSize;
                const letter = this.grid[row][col];
                
                if (letter) {
                    this.drawEnhancedCell(x, y, letter);
                } else {
                    this.drawEnhancedEmptyCell(x, y);
                }
            }
        }
        
        console.log('✅ Enhanced grid drawn with', this.grid.flat().filter(cell => cell !== null).length, 'letters');
    }
    
    drawEnhancedCell(x, y, letter) {
        // Create gradient background with better contrast
        const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(1, 'rgba(240, 240, 250, 0.95)');
        
        this.ctx.save();
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        this.ctx.restore();
        
        // Add enhanced border and glow
        this.ctx.strokeStyle = '#4f46e5';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#4f46e5';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Draw letter with enhanced styling and better visibility
        this.ctx.fillStyle = '#1e1b4b'; // Dark blue for better contrast
        this.ctx.font = 'bold 24px "Segoe UI", "Arial", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // Ensure letter is properly displayed
        const displayLetter = this.ensureLetterDisplay(letter);
        this.ctx.fillText(displayLetter, x + this.cellSize / 2, y + this.cellSize / 2);
        
        // Add enhanced animation with pulsing effect
        const time = Date.now() * 0.003;
        const pulse = Math.sin(time + x + y) * 0.15 + 1;
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = '#4f46e5';
        this.ctx.beginPath();
        this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize * 0.35 * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // Add letter highlight effect
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
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
        
        const x = this.fallingLetter.x * this.cellSize + this.cellSize / 2;
        const y = this.fallingLetter.y * this.cellSize + this.cellSize / 2;
        const letter = this.fallingLetter.letter;
        const time = Date.now() * 0.005;
        
        // Create enhanced pulsing effect
        const pulse = Math.sin(time) * 0.3 + 1;
        const glowIntensity = Math.sin(time * 2) * 0.5 + 0.5;
        
        // Draw enhanced glow effect
        this.ctx.save();
        this.ctx.shadowColor = '#667eea';
        this.ctx.shadowBlur = 25 * pulse;
        this.ctx.globalAlpha = glowIntensity * 0.4;
        
        // Create enhanced gradient for glow
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.cellSize * 1.2);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.cellSize * 1.2 * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Draw falling letter with enhanced styling
        this.ctx.save();
        this.ctx.shadowColor = '#667eea';
        this.ctx.shadowBlur = 20;
        
        // Create enhanced gradient for letter background
        const letterGradient = this.ctx.createLinearGradient(x - this.cellSize/2, y - this.cellSize/2, x + this.cellSize/2, y + this.cellSize/2);
        letterGradient.addColorStop(0, '#667eea');
        letterGradient.addColorStop(0.5, '#8b5cf6');
        letterGradient.addColorStop(1, '#a855f7');
        
        this.ctx.fillStyle = letterGradient;
        this.ctx.fillRect(x - this.cellSize/2 + 3, y - this.cellSize/2 + 3, this.cellSize - 6, this.cellSize - 6);
        
        // Add border to falling letter
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - this.cellSize/2 + 3, y - this.cellSize/2 + 3, this.cellSize - 6, this.cellSize - 6);
        
        // Draw letter with enhanced styling
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 26px "Segoe UI", "Arial", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        // Ensure letter is properly displayed
        const displayLetter = this.ensureLetterDisplay(letter);
        this.ctx.fillText(displayLetter, x, y);
        
        this.ctx.restore();
        
        // Add enhanced rotation animation
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate((this.fallingLetter.rotation || 0) * Math.PI / 180);
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#667eea';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.cellSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // Add floating particles around falling letter
        this.drawFallingLetterParticles(x, y, time);
    }
    
    drawFallingLetterParticles(x, y, time) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const radius = 30 + Math.sin(time * 3 + i) * 10;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = `hsl(${240 + i * 30}, 70%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 2 + Math.sin(time * 2 + i) * 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawUIOverlays() {
        // Enhanced score overlay with gradient
        const scoreGradient = this.ctx.createLinearGradient(10, 10, 130, 50);
        scoreGradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
        scoreGradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)');
        
        this.ctx.fillStyle = scoreGradient;
        this.ctx.fillRect(10, 10, 120, 40);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 2;
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        
        // Enhanced level overlay
        const levelGradient = this.ctx.createLinearGradient(10, 60, 130, 100);
        levelGradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
        levelGradient.addColorStop(1, 'rgba(5, 150, 105, 0.9)');
        
        this.ctx.fillStyle = levelGradient;
        this.ctx.fillRect(10, 60, 120, 40);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        this.ctx.fillText(`Level: ${this.level}`, 20, 80);
        
        // Enhanced combo overlay with animation
        if (this.combo > 1) {
            const comboGradient = this.ctx.createLinearGradient(10, 110, 130, 150);
            comboGradient.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
            comboGradient.addColorStop(1, 'rgba(245, 158, 11, 0.9)');
            
            this.ctx.fillStyle = comboGradient;
            this.ctx.fillRect(10, 110, 120, 40);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
            this.ctx.fillText(`Combo: x${this.combo}`, 20, 130);
            
            // Add pulsing effect for combo
            const time = Date.now() * 0.005;
            const pulse = Math.sin(time) * 0.2 + 1;
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.beginPath();
            this.ctx.arc(70, 130, 15 * pulse, 0, Math.PI * 2);
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
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('scoreDisplay');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    updateLevelDisplay() {
        const levelElement = document.getElementById('levelDisplay');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }
    
    updateWordList() {
        console.log('📝 updateWordList() called - wordsFound:', this.wordsFound);
        const wordListElement = document.getElementById('wordList');
        if (wordListElement) {
            wordListElement.innerHTML = '';
            
            // Demo word list for display
            const targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'];
            targetWords.forEach(word => {
                const li = document.createElement('li');
                li.textContent = word;
                li.className = this.wordsFound.includes(word) ? 'completed' : 'demo-word';
                wordListElement.appendChild(li);
            });
            console.log('✅ Word list updated with', targetWords.length, 'items');
        } else {
            // Element not found - this is expected with the new layout
            console.log('ℹ️ Word list element not found - using new layout without word list display');
        }
        
        // Update progression display
        const currentLevelElement = document.getElementById('currentLevel');
        const targetScoreElement = document.getElementById('targetScore');
        const wordsFoundElement = document.getElementById('wordsFound');
        
        if (currentLevelElement) currentLevelElement.textContent = this.level;
        if (targetScoreElement) targetScoreElement.textContent = this.level * 100;
        if (wordsFoundElement) wordsFoundElement.textContent = this.wordsFound.length;
        
        // Log if elements are missing (expected with new layout)
        if (!currentLevelElement || !targetScoreElement || !wordsFoundElement) {
            console.log('ℹ️ Some progression elements not found - using new layout without detailed progression display');
        }
    }
    
    updateLetterQueueDisplay() {
        console.log('📝 updateLetterQueueDisplay() called - letterQueue:', this.letterQueue);
        const queueElement = document.getElementById('letterPreview');
        if (queueElement) {
            queueElement.innerHTML = '';
            
            // Ensure we have letters to display
            if (this.letterQueue.length === 0) {
                this.generateLetterQueue();
            }
            
            this.letterQueue.slice(0, 5).forEach(letter => {
                const li = document.createElement('li');
                // Ensure proper letter display
                li.textContent = this.ensureLetterDisplay(letter);
                li.className = 'queue-letter';
                queueElement.appendChild(li);
            });
            console.log('✅ Letter queue updated with', queueElement.children.length, 'letters');
        } else {
            // Element not found - this is expected with the new layout
            console.log('ℹ️ Letter queue element not found - using new layout without letter preview display');
        }
    }
    
    // Utility Methods
    resizeCanvas() {
        console.log('📏 Resizing canvas...');
        const size = this.currentGridSize * this.cellSize;
        this.canvas.width = size;
        this.canvas.height = size;
        
        console.log('✅ Canvas resized:', {
            width: this.canvas.width,
            height: this.canvas.height,
            gridSize: this.currentGridSize,
            cellSize: this.cellSize
        });
    }
    
    updateStats() {
        if (this.stats.startTime) {
            this.stats.playTime = Math.floor((Date.now() - this.stats.startTime) / 1000);
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
        // French dictionary for word validation
        return new Set([
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
    
    // Game Over Detection and Handling
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
    
    showGameOverScreen() {
        console.log('🎮 Showing Game Over Screen');
        this.gameOverScreen.visible = true;
        this.gameOverScreen.fadeIn = 0;
        this.gameOverScreen.showStats = false;
        
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
        
        // Create beautiful gradient overlay
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn * 0.9;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.95)');
        gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 71, 87, 0.95)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // Add animated particles in background
        this.drawGameOverParticles();
        
        // Game Over Title with enhanced styling
        ctx.save();
        ctx.globalAlpha = this.gameOverScreen.fadeIn;
        
        // Create text gradient
        const textGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        textGradient.addColorStop(0, '#ff4757');
        textGradient.addColorStop(0.5, '#ff3838');
        textGradient.addColorStop(1, '#c44569');
        
        ctx.fillStyle = textGradient;
        ctx.font = 'bold 64px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Enhanced glow effect
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add stroke for better visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeText('GAME OVER', canvas.width / 2, canvas.height / 2 - 120);
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 120);
        ctx.restore();
        
        // Game Over Reason with better styling
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
    
    createPlacementEffect(x, y) {
        console.log('✨ Creating placement effect at:', { x, y });
        const effect = this.effects.placement;
        
        for (let i = 0; i < effect.count; i++) {
            const particle = {
                x: x + Math.random() * 40 - 20,
                y: y + Math.random() * 40 - 20,
                vx: (Math.random() - 0.5) * effect.speed,
                vy: (Math.random() - 0.5) * effect.speed,
                life: 1.0,
                maxLife: 1.0,
                size: effect.size + Math.random() * 2,
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
        
        // Create multiple particle bursts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createParticleBurst(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    20,
                    ['#ffd700', '#ffed4e', '#fff200'],
                    2.0
                );
            }, i * 100);
        }
        
        // Create central explosion
        this.createParticleBurst(
            this.canvas.width / 2,
            this.canvas.height / 2,
            30,
            ['#667eea', '#764ba2', '#4ecdc4'],
            3.0
        );
    }
    
    createGameOverEffect() {
        console.log('💀 Creating game over effect');
        
        // Create dark particles spreading from center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
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
                    Math.random() * this.canvas.width,
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

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing LettersCascadeGame...');
    
    // Check if canvas exists
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('❌ Canvas element not found! Cannot initialize game.');
        return;
    }
    
    try {
        window.game = new LettersCascadeGame();
        window.game.init();
        console.log('✅ LettersCascadeGame initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing game:', error);
    }
});
