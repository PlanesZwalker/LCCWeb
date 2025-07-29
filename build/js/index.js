// Complete Game Engine for Letters Cascade Challenge
// Implements all functionalities from technical specifications

class LettersCascadeGame {
    constructor() {
        console.log('🎮 LettersCascadeGame constructor called');
        
        // Game Configuration
        this.gridSizes = [8, 10, 12];
        this.currentGridSize = 10;
        this.cellSize = 40;
        this.canvas = null;
        this.ctx = null;
        
        // Game State
        this.gameRunning = false;
        this.paused = false;
        this.gameOver = false;
        this.level = 1;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.combo = 0;
        this.maxCombo = 0;
        
        // Game Mechanics
        this.letters = [];
        this.letterQueue = [];
        this.wordsFound = [];
        this.targetWords = [];
        this.fallingLetter = null;
        this.fallSpeed = 1000; // milliseconds
        this.fallTimer = null;
        
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
        
        // Audio System
        this.audioManager = new AudioManager();
        
        // Particle System
        this.particleSystem = new ParticleSystem();
        
        // Statistics
        this.stats = {
            lettersPlaced: 0,
            wordsCompleted: 0,
            totalScore: 0,
            playTime: 0,
            startTime: null
        };
        
        console.log('✅ LettersCascadeGame constructor completed');
    }
    
    // Initialize game
    init() {
        console.log('🚀 Initializing LettersCascadeGame...');
        
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('❌ Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Initialize game systems
        this.createGrid();
        this.generateLetterQueue();
        this.updateDisplay();
        this.setupEventListeners();
        
        console.log('✅ LettersCascadeGame initialized successfully');
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
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
        
        // Balanced letter distribution
        for (let i = 0; i < 10; i++) {
            if (Math.random() < 0.4) {
                this.letterQueue.push(vowels[Math.floor(Math.random() * vowels.length)]);
            } else {
                this.letterQueue.push(consonants[Math.floor(Math.random() * consonants.length)]);
            }
        }
        
        console.log('✅ Letter queue generated:', this.letterQueue);
        this.updateLetterQueueDisplay();
    }
    
    // Word Detection System
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
        console.log('🏆 Completing word:', word);
        
        // Add word to found list
        this.wordsFound.push(word);
        
        // Calculate score
        const wordScore = word.length * 10;
        this.addScore(wordScore);
        
        // Remove word from grid
        this.removeWordFromGrid(word);
        
        // Create particle effect
        this.particleSystem.createWordCompletionEffect(word);
        
        // Play sound
        this.audioManager.playWordComplete();
        
        // Check level progression
        this.levelManager.checkLevelProgression(this.wordsFound.length);
        
        console.log('✅ Word completed:', word, 'Score:', wordScore);
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
        console.log('💰 Adding score:', points);
        this.score += points;
        this.stats.totalScore += points;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.scoreManager.updateScore(this.score);
        this.updateDisplay();
    }
    
    // Level System
    updateLevel() {
        const newLevel = this.levelManager.getCurrentLevel(this.wordsFound.length);
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.fallSpeed = Math.max(200, 1000 - (this.level - 1) * 100);
            this.audioManager.playLevelUp();
            this.showLevelUpEffect();
        }
    }
    
    // Game Controls
    setupControls() {
        console.log('🎮 Setting up game controls...');
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleKeyPress(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        console.log('✅ Controls setup completed');
    }
    
    handleKeyPress(key) {
        if (!this.gameRunning || this.paused) return;
        
        switch(key) {
            case 'ArrowLeft':
                this.moveFallingLetter(-1);
                break;
            case 'ArrowRight':
                this.moveFallingLetter(1);
                break;
            case 'ArrowDown':
                this.dropFallingLetter();
                break;
            case ' ':
                this.rotateFallingLetter();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
            case 'r':
            case 'R':
                this.resetGame();
                break;
        }
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
        if (y >= this.currentGridSize) return true;
        if (x < 0 || x >= this.currentGridSize) return true;
        return this.grid[y] && this.grid[y][x] !== null;
    }
    
    placeLetter() {
        if (!this.fallingLetter) return;
        
        const { x, y, letter } = this.fallingLetter;
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
    
    // Game Loop
    startGame() {
        console.log('▶️ Starting game...');
        
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.paused = false;
        this.gameOver = false;
        this.stats.startTime = Date.now();
        
        this.createFallingLetter();
        this.startFallTimer();
        this.gameLoop();
        
        this.audioManager.playStart();
        console.log('✅ Game started');
    }
    
    pauseGame() {
        console.log('⏸️ Pausing game...');
        
        if (!this.gameRunning) return;
        
        this.paused = !this.paused;
        
        if (this.paused) {
            this.stopFallTimer();
            this.audioManager.playPause();
        } else {
            this.startFallTimer();
            this.audioManager.playResume();
        }
        
        this.updateDisplay();
        console.log('✅ Game paused:', this.paused);
    }
    
    resetGame() {
        console.log('🔄 Resetting game...');
        
        this.gameRunning = false;
        this.paused = false;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.wordsFound = [];
        this.fallingLetter = null;
        this.fallSpeed = 1000;
        
        this.stopFallTimer();
        this.createGrid();
        this.generateLetterQueue();
        this.updateDisplay();
        
        this.audioManager.playReset();
        console.log('✅ Game reset');
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
    
    // Rendering
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw grid
        this.drawGrid();
        
        // Draw falling letter
        if (this.fallingLetter) {
            this.drawFallingLetter();
        }
        
        // Draw particles
        this.particleSystem.render(this.ctx);
    }
    
    drawBackground() {
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid() {
        for (let row = 0; row < this.currentGridSize; row++) {
            for (let col = 0; col < this.currentGridSize; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                if (this.grid[row][col]) {
                    this.drawCell(x, y, this.grid[row][col]);
                } else {
                    this.drawEmptyCell(x, y);
                }
            }
        }
    }
    
    drawCell(x, y, letter) {
        // Cell background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Letter
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(letter, x + this.cellSize / 2, y + this.cellSize / 2);
    }
    
    drawEmptyCell(x, y) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
    }
    
    drawFallingLetter() {
        const x = this.fallingLetter.x * this.cellSize;
        const y = this.fallingLetter.y * this.cellSize;
        
        // Falling letter background
        this.ctx.fillStyle = 'rgba(118, 75, 162, 0.9)';
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Falling letter text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.fallingLetter.letter, x + this.cellSize / 2, y + this.cellSize / 2);
    }
    
    // Display Updates
    updateDisplay() {
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateWordList();
        this.updateLetterQueueDisplay();
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    updateLevelDisplay() {
        const levelElement = document.getElementById('levelValue');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }
    
    updateWordList() {
        const wordListElement = document.getElementById('wordList');
        if (wordListElement) {
            wordListElement.innerHTML = '';
            this.wordsFound.forEach(word => {
                const li = document.createElement('li');
                li.textContent = word;
                li.className = 'completed';
                wordListElement.appendChild(li);
            });
        }
    }
    
    updateLetterQueueDisplay() {
        const queueElement = document.getElementById('letterQueue');
        if (queueElement) {
            queueElement.innerHTML = '';
            this.letterQueue.slice(0, 5).forEach(letter => {
                const span = document.createElement('span');
                span.textContent = letter;
                span.className = 'queue-letter';
                queueElement.appendChild(span);
            });
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