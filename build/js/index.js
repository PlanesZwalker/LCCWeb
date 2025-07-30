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
        this.level = 1;
        this.score = 0;
        this.highScore = this.loadHighScore();
        
        // Game Mechanics
        this.letters = [];
        this.letterQueue = [];
        this.wordsFound = [];
        this.targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'];
        this.fallingLetter = null;
        this.fallSpeed = 1000; // milliseconds
        this.fallTimer = null;
        
        // Scoring System
        this.combo = 1;
        this.lastWordTime = 0;
        this.comboTimeout = 5000; // 5 seconds for combo
        
        // Statistics
        this.stats = {
            lettersPlaced: 0,
            wordsCompleted: 0,
            totalScore: 0,
            playTime: 0,
            startTime: null
        };
        
        // Systems
        this.particleSystem = new ParticleSystem();
        this.audioManager = new AudioManager();
        
        console.log('📊 Initial game state:', {
            gridSize: this.currentGridSize,
            cellSize: this.cellSize,
            level: this.level,
            score: this.score,
            targetWords: this.targetWords.length
        });
    }
    
    // Initialize game
    init() {
        console.log('🚀 Initializing LettersCascadeGame...');
        
        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            console.error('❌ Canvas initialization failed');
            return;
        }
        
        console.log('✅ Canvas initialized:', {
            width: this.canvas.width,
            height: this.canvas.height,
            context: this.ctx
        });
        
        // Initialize grid
        this.createGrid();
        
        // Word Detection System
        this.dictionary = this.loadDictionary();
        this.wordDetector = new WordDetector(this.dictionary);
        
        // Scoring System
        this.scoreManager = new ScoreManager();
        
        // Level System
        this.levelManager = new LevelManager();
        
        // Controls
        this.keys = {};
        this.setupControls();
        
        // Generate initial letter queue
        this.generateLetterQueue();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial display update
        this.updateDisplay();
        
        console.log('✅ LettersCascadeGame initialized successfully');
        console.log('📊 Game ready state:', {
            gridCreated: !!this.grid,
            letterQueueLength: this.letterQueue.length,
            targetWordsCount: this.targetWords.length,
            dictionarySize: this.dictionary.size
        });
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
        console.log('🎯 Word completed:', {
            word: word,
            length: word.length,
            currentScore: this.score,
            currentLevel: this.level
        });
        
        // Calculate score based on word length
        let points = 0;
        switch (word.length) {
            case 3: points = 10; break;
            case 4: points = 25; break;
            case 5: points = 50; break;
            case 6: points = 100; break;
            default: points = 200; break;
        }
        
        console.log('📊 Word scoring:', {
            word: word,
            length: word.length,
            basePoints: points,
            combo: this.combo,
            totalPoints: points * this.combo
        });
        
        // Add to words found
        if (!this.wordsFound.includes(word)) {
            this.wordsFound.push(word);
            console.log('📝 Words found updated:', {
                totalWords: this.wordsFound.length,
                newWord: word,
                allWords: this.wordsFound
            });
        }
        
        // Add score
        this.addScore(points);
        
        // Check for level progression
        const oldLevel = this.level;
        this.updateLevel();
        
        if (this.level > oldLevel) {
            console.log('📈 Level up!:', {
                previousLevel: oldLevel,
                newLevel: this.level,
                wordsFound: this.wordsFound.length,
                score: this.score
            });
            this.showLevelUpEffect();
        }
        
        // Show completion effect
        this.showWordCompletionNotification(word, points);
        this.particleSystem.createWordCompletionEffect(word);
        
        // Update combo
        const now = Date.now();
        if (now - this.lastWordTime < this.comboTimeout) {
            this.combo++;
            console.log('🔥 Combo increased:', {
                newCombo: this.combo,
                timeSinceLastWord: now - this.lastWordTime
            });
        } else {
            this.combo = 1;
            console.log('🔄 Combo reset to 1');
        }
        this.lastWordTime = now;
        
        // Remove word from grid
        this.removeWordFromGrid(word);
        
        // Update display
        this.updateDisplay();
        
        console.log('✅ Word completion finished:', {
            word: word,
            finalScore: this.score,
            finalLevel: this.level,
            combo: this.combo,
            wordsFound: this.wordsFound.length
        });
    }
    
    showWordCompletionNotification(word, score) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'word-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 Mot trouvé!</h3>
                <p class="word">${word}</p>
                <p class="score">+${score} points</p>
            </div>
        `;
        
        // Add styles
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
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationAppear {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            .word-completion-notification .word {
                font-size: 2rem;
                font-weight: bold;
                margin: 1rem 0;
            }
            .word-completion-notification .score {
                font-size: 1.2rem;
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'notificationDisappear 0.5s ease-out';
            notification.style.animationFillMode = 'forwards';
            
            const disappearStyle = document.createElement('style');
            disappearStyle.textContent = `
                @keyframes notificationDisappear {
                    from {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                }
            `;
            document.head.appendChild(disappearStyle);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
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
        console.log('📈 Checking level progression:', {
            currentLevel: this.level,
            wordsFound: this.wordsFound.length,
            score: this.score
        });
        
        const oldLevel = this.level;
        
        // Level progression based on words found and score
        if (this.wordsFound.length >= 3 && this.score >= 100) {
            this.level = 2;
        }
        if (this.wordsFound.length >= 5 && this.score >= 250) {
            this.level = 3;
        }
        if (this.wordsFound.length >= 7 && this.score >= 500) {
            this.level = 4;
        }
        if (this.wordsFound.length >= 10 && this.score >= 1000) {
            this.level = 5;
        }
        
        if (this.level > oldLevel) {
            console.log('🎉 Level up achieved:', {
                previousLevel: oldLevel,
                newLevel: this.level,
                wordsFound: this.wordsFound.length,
                score: this.score,
                requirements: {
                    level2: { words: 3, score: 100 },
                    level3: { words: 5, score: 250 },
                    level4: { words: 7, score: 500 },
                    level5: { words: 10, score: 1000 }
                }
            });
            
            // Level up effects
            this.audioManager.playLevelUp();
            this.showLevelUpEffect();
        } else {
            console.log('📊 Level progression status:', {
                currentLevel: this.level,
                wordsFound: this.wordsFound.length,
                score: this.score,
                nextLevelRequirements: this.getNextLevelRequirements()
            });
        }
        
        this.updateLevelDisplay();
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
        if (this.letterQueue.length === 0) {
            this.generateLetterQueue();
        }
        
        const letter = this.letterQueue.shift();
        this.fallingLetter = {
            letter: letter,
            x: Math.floor(this.currentGridSize / 2),
            y: 0,
            rotation: 0
        };
        
        this.updateLetterQueueDisplay();
        console.log('📝 Created falling letter:', letter);
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
        if (!this.fallingLetter) return;
        
        const { x, y, letter } = this.fallingLetter;
        
        // Add safety checks for grid
        if (!this.grid) {
            console.error('❌ Grid is undefined in placeLetter');
            return;
        }
        
        if (!this.grid[y]) {
            console.error('❌ Grid row is undefined:', y);
            return;
        }
        
        this.grid[y][x] = letter;
        this.stats.lettersPlaced++;
        
        this.audioManager.playPlace();
        this.particleSystem.createPlacementEffect(x, y);
        
        // Check for word completion
        this.checkWordCompletion();
        
        // Create next falling letter
        this.createFallingLetter();
        
        console.log('✅ Letter placed:', letter, 'at', x, y);
    }
    
    // Enhanced Game State Management
    startGame() {
        console.log('▶️ startGame() called');
        console.log('🎮 Game state before start:', {
            running: this.gameRunning,
            paused: this.paused,
            level: this.level,
            score: this.score,
            wordsFound: this.wordsFound.length
        });
        
        this.gameRunning = true;
        this.paused = false;
        this.stats.startTime = Date.now();
        
        console.log('📊 Game started with stats:', {
            startTime: this.stats.startTime,
            level: this.level,
            targetWords: this.targetWords.length,
            letterQueueLength: this.letterQueue.length
        });
        
        this.createFallingLetter();
        this.startFallTimer();
        this.showGameStartNotification();
        
        console.log('✅ Game started successfully');
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
        if (!this.gameRunning) return;
        
        this.render();
        this.updateLevel();
        this.updateStats();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Enhanced Rendering
    render() {
        if (!this.ctx) return;
        
        // Clear canvas with enhanced background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw enhanced background
        this.drawEnhancedBackground();
        
        // Draw grid with enhanced styling
        this.drawEnhancedGrid();
        
        // Draw falling letter with enhanced effects
        if (this.fallingLetter) {
            this.drawEnhancedFallingLetter();
        }
        
        // Draw particles
        this.particleSystem.render(this.ctx);
        
        // Draw UI overlays
        this.drawUIOverlays();
    }
    
    drawEnhancedBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }
    
    drawEnhancedGrid() {
        for (let row = 0; row < this.currentGridSize; row++) {
            for (let col = 0; col < this.currentGridSize; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                if (this.grid[row][col]) {
                    this.drawEnhancedCell(x, y, this.grid[row][col]);
                } else {
                    this.drawEnhancedEmptyCell(x, y);
                }
            }
        }
    }
    
    drawEnhancedCell(x, y, letter) {
        // Cell background with gradient
        const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Cell border
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Letter with enhanced styling
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add text shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        this.ctx.fillText(letter, x + this.cellSize / 2, y + this.cellSize / 2);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    drawEnhancedEmptyCell(x, y) {
        // Empty cell with subtle styling
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        this.ctx.setLineDash([]);
    }
    
    drawEnhancedFallingLetter() {
        if (!this.fallingLetter) return;
        
        const x = this.fallingLetter.x * this.cellSize;
        const y = this.fallingLetter.y * this.cellSize;
        
        // Check bounds to prevent gradient errors
        if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
            return;
        }
        
        // Falling letter background with gradient
        const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
        gradient.addColorStop(0, 'rgba(118, 75, 162, 0.9)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.9)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Falling letter border with glow effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Falling letter text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add glow effect
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.fillText(this.fallingLetter.letter, x + this.cellSize / 2, y + this.cellSize / 2);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    drawUIOverlays() {
        // Draw score overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 120, 40);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        
        // Draw level overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 60, 120, 40);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`Level: ${this.level}`, 20, 80);
        
        // Draw combo overlay if active
        if (this.combo > 1) {
            this.ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
            this.ctx.fillRect(10, 110, 120, 40);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(`Combo: x${this.combo}`, 20, 130);
        }
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
            
            // Add target words for the game
            const targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'];
            targetWords.forEach(word => {
                const li = document.createElement('li');
                li.textContent = word;
                li.className = this.wordsFound.includes(word) ? 'completed' : 'demo-word';
                wordListElement.appendChild(li);
            });
            console.log('✅ Word list updated with', targetWords.length, 'items');
        } else {
            console.error('❌ Word list element not found');
        }
        
        // Update progression display
        const currentLevelElement = document.getElementById('currentLevel');
        const targetScoreElement = document.getElementById('targetScore');
        const wordsFoundElement = document.getElementById('wordsFound');
        
        if (currentLevelElement) currentLevelElement.textContent = this.level;
        if (targetScoreElement) targetScoreElement.textContent = this.level * 100;
        if (wordsFoundElement) wordsFoundElement.textContent = this.wordsFound.length;
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
                li.textContent = letter;
                li.className = 'queue-letter';
                queueElement.appendChild(li);
            });
            console.log('✅ Letter queue updated with', queueElement.children.length, 'letters');
        } else {
            console.error('❌ Letter queue element not found');
        }
    }
    
    // Utility Methods
    resizeCanvas() {
        const size = this.currentGridSize * this.cellSize;
        this.canvas.width = size;
        this.canvas.height = size;
    }
    
    updateStats() {
        if (this.stats.startTime) {
            this.stats.playTime = Math.floor((Date.now() - this.stats.startTime) / 1000);
        }
    }
    
    showComboEffect(bonus) {
        // Create combo effect
        this.particleSystem.createComboEffect(bonus);
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
    
    playSound(type) {
        if (this.muted) return;
        
        // Create audio context if not exists
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Generate simple tones for different sounds
        const frequency = this.getFrequencyForSound(type);
        const duration = 0.1;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
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
            levelUp: 1320
        };
        return frequencies[type] || 440;
    }
}

// Particle System
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createPlacementEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x * 40 + 20,
                y: y * 40 + 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color: '#667eea'
            });
        }
    }
    
    createWordCompletionEffect(word) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: 200,
                y: 200,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1.0,
                color: '#4ecdc4'
            });
        }
    }
    
    createComboEffect(bonus) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: 200,
                y: 200,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1.0,
                color: '#fbbf24'
            });
        }
    }
    
    createLevelUpEffect() {
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: 200,
                y: 200,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                life: 1.0,
                color: '#ef4444'
            });
        }
    }
    
    render(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            // Draw particle
            if (particle.life > 0) {
                ctx.save();
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
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