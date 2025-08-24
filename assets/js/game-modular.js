/**
 * game-modular.js - Main modular game file
 * Uses ES6 modules for better organization and maintainability
 */

// Fallback classes in case modules fail to load
class FallbackGameState {
    constructor() {
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.level = 1;
        this.debugMode = false;
    }
    
    setRunning(value) { this.running = value; }
    setPaused(value) { this.paused = value; }
    setGameOver(value) { this.gameOver = value; }
    setLevel(value) { this.level = value; }
    isRunning() { return this.running; }
    isPaused() { return this.paused; }
    isGameOver() { return this.gameOver; }
    getLevel() { return this.level; }
    isDebugMode() { return this.debugMode; }
    
    async init() { console.log('✅ FallbackGameState initialized'); }
    reset() { 
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.level = 1;
    }
}

class FallbackManager {
    constructor(name) {
        this.name = name;
    }
    
    async init() { console.log(`✅ ${this.name} initialized`); }
    reset() { console.log(`🔄 ${this.name} reset`); }
    update() { /* No-op */ }
    render() { /* No-op */ }
}

class FallbackGameCore {
    constructor() {
        this.gameState = new FallbackGameState();
        this.letterManager = new FallbackManager('LetterManager');
        this.wordManager = new FallbackManager('WordManager');
        this.scoreManager = new FallbackManager('ScoreManager');
        this.levelManager = new FallbackManager('LevelManager');
        this.powerUpManager = new FallbackManager('PowerUpManager');
        this.achievementManager = new FallbackManager('AchievementManager');
        this.tutorialManager = new FallbackManager('TutorialManager');
        this.uiManager = new FallbackManager('UIManager');
        this.audioManager = new FallbackManager('AudioManager');
        this.analyticsManager = new FallbackManager('AnalyticsManager');
        this.backgroundManager = new FallbackManager('BackgroundManager');
        
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        
        // Game grid properties (will be calculated based on canvas size)
        this.gridWidth = 15;  // More columns for wider display
        this.gridHeight = 12; // Fewer rows for better visibility
        this.cellSize = 45;   // Larger cells for better visibility
        this.grid = [];
        this.gridOffsetX = 0; // Will be calculated in calculateGridSize
        this.gridOffsetY = 0; // Will be calculated in calculateGridSize
        
        // Falling letter properties
        this.fallingLetter = null;
        this.fallTimer = null;
        this.fallSpeed = 1000; // milliseconds
        
        // Score and level
        this.score = 0;
        this.level = 1;
        this.wordsCompleted = 0;
        
        // Word list for detection
        this.wordList = ['CAT', 'DOG', 'BAT', 'HAT', 'RAT', 'MAT', 'SAT', 'FAT', 'PAT', 'EAT'];
        this.completedWords = [];
        
        // Background image
        this.backgroundImage = null;
        
        // Bind event handlers
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    
    async init(canvas) {
        try {
            console.log('🎮 FallbackGameCore starting initialization...');
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            // Calculate optimal grid size for canvas
            this.calculateGridSize();
            
            // Initialize grid
            this.initializeGrid();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize all managers
            console.log('🎮 Initializing fallback managers...');
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
            console.log('✅ FallbackGameCore initialized successfully');
        } catch (error) {
            console.error('❌ FallbackGameCore initialization failed:', error);
            throw error;
        }
    }
    
    calculateGridSize() {
        // Calculate optimal grid size to fit the canvas
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Reserve some space for UI elements (margins)
        const gameAreaWidth = canvasWidth - 100; // 50px margin on each side
        const gameAreaHeight = canvasHeight - 120; // 60px margin top/bottom for UI
        
        // Calculate cell size that fits the area
        const maxCellsWidth = Math.floor(gameAreaWidth / this.cellSize);
        const maxCellsHeight = Math.floor(gameAreaHeight / this.cellSize);
        
        // Adjust grid dimensions to fit optimally
        this.gridWidth = Math.min(15, maxCellsWidth);
        this.gridHeight = Math.min(12, maxCellsHeight);
        
        // Calculate starting position to center the grid
        this.gridOffsetX = (canvasWidth - (this.gridWidth * this.cellSize)) / 2;
        this.gridOffsetY = 60; // Start below the top UI area
        
        console.log(`📐 Grid calculated: ${this.gridWidth}x${this.gridHeight}, cell size: ${this.cellSize}px, offset: (${this.gridOffsetX}, ${this.gridOffsetY})`);
    }
    
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = null;
            }
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress);
    }
    
    handleKeyPress(event) {
        if (!this.gameState.isRunning() || this.gameState.isPaused()) return;
        
        switch (event.code) {
            case 'ArrowLeft':
                this.moveFallingLetter('left');
                break;
            case 'ArrowRight':
                this.moveFallingLetter('right');
                break;
            case 'ArrowDown':
                this.moveFallingLetter('down');
                break;
            case 'Space':
            case 'Enter':
                this.dropFallingLetter();
                break;
            case 'KeyR':
                this.rotateFallingLetter();
                break;
        }
    }
    
    createFallingLetter() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        
        this.fallingLetter = {
            letter: randomLetter,
            x: Math.floor(this.gridWidth / 2),
            y: 0,
            rotation: 0
        };
        
        console.log(`🎯 New falling letter: ${randomLetter}`);
    }
    
    moveFallingLetter(direction) {
        if (!this.fallingLetter) return;
        
        let newX = this.fallingLetter.x;
        let newY = this.fallingLetter.y;
        
        switch (direction) {
            case 'left':
                newX = Math.max(0, this.fallingLetter.x - 1);
                break;
            case 'right':
                newX = Math.min(this.gridWidth - 1, this.fallingLetter.x + 1);
                break;
            case 'down':
                newY = this.fallingLetter.y + 1;
                break;
        }
        
        // Check if move is valid
        if (this.isValidPosition(newX, newY)) {
            this.fallingLetter.x = newX;
            this.fallingLetter.y = newY;
        } else if (direction === 'down') {
            // Letter has landed
            this.placeFallingLetter();
        }
    }
    
    isValidPosition(x, y) {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
            return false;
        }
        return this.grid[y][x] === null;
    }
    
    placeFallingLetter() {
        if (!this.fallingLetter) return;
        
        const x = this.fallingLetter.x;
        const y = this.fallingLetter.y;
        
        if (y >= 0 && y < this.gridHeight && x >= 0 && x < this.gridWidth) {
            this.grid[y][x] = this.fallingLetter.letter;
            console.log(`📍 Placed letter ${this.fallingLetter.letter} at (${x}, ${y})`);
            
            // Check for word completion
            this.checkWordCompletion();
            
            // Create new falling letter
            this.createFallingLetter();
            
            // Check if new letter can be placed
            if (!this.isValidPosition(this.fallingLetter.x, this.fallingLetter.y)) {
                console.log('🎮 Game Over - Grid is full!');
                this.gameState.setGameOver(true);
            }
        }
    }
    
    dropFallingLetter() {
        if (!this.fallingLetter) return;
        
        // Drop letter to bottom
        while (this.isValidPosition(this.fallingLetter.x, this.fallingLetter.y + 1)) {
            this.fallingLetter.y++;
        }
        this.placeFallingLetter();
    }
    
    rotateFallingLetter() {
        if (!this.fallingLetter) return;
        this.fallingLetter.rotation = (this.fallingLetter.rotation + 90) % 360;
    }
    
    checkWordCompletion() {
        // Check horizontal words
        for (let y = 0; y < this.gridHeight; y++) {
            let word = '';
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) {
                    word += this.grid[y][x];
                } else {
                    if (word.length >= 3 && this.wordList.includes(word)) {
                        this.completeWord(word, {x: x - word.length, y: y}, 'horizontal');
                    }
                    word = '';
                }
            }
            if (word.length >= 3 && this.wordList.includes(word)) {
                this.completeWord(word, {x: this.gridWidth - word.length, y: y}, 'horizontal');
            }
        }
        
        // Check vertical words
        for (let x = 0; x < this.gridWidth; x++) {
            let word = '';
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[y][x]) {
                    word += this.grid[y][x];
                } else {
                    if (word.length >= 3 && this.wordList.includes(word)) {
                        this.completeWord(word, {x: x, y: y - word.length}, 'vertical');
                    }
                    word = '';
                }
            }
            if (word.length >= 3 && this.wordList.includes(word)) {
                this.completeWord(word, {x: x, y: this.gridHeight - word.length}, 'vertical');
            }
        }
        
        // Check diagonal words (top-left to bottom-right)
        this.checkDiagonalWords('diagonal-tl-br');
        
        // Check diagonal words (top-right to bottom-left)
        this.checkDiagonalWords('diagonal-tr-bl');
    }
    
    checkDiagonalWords(direction) {
        const isTopLeftToBottomRight = direction === 'diagonal-tl-br';
        
        // Check diagonals starting from top edge
        for (let startX = 0; startX < this.gridWidth; startX++) {
            let word = '';
            let x = startX;
            let y = 0;
            
            while (x < this.gridWidth && y < this.gridHeight) {
                if (this.grid[y][x]) {
                    word += this.grid[y][x];
                } else {
                    if (word.length >= 3 && this.wordList.includes(word)) {
                        const startPos = isTopLeftToBottomRight ? 
                            {x: x - word.length, y: y - word.length} : 
                            {x: x + word.length, y: y - word.length};
                        this.completeWord(word, startPos, direction);
                    }
                    word = '';
                }
                x += isTopLeftToBottomRight ? 1 : -1;
                y += 1;
            }
            if (word.length >= 3 && this.wordList.includes(word)) {
                const startPos = isTopLeftToBottomRight ? 
                    {x: x - word.length, y: y - word.length} : 
                    {x: x + word.length, y: y - word.length};
                this.completeWord(word, startPos, direction);
            }
        }
        
        // Check diagonals starting from left edge (for tl-br) or right edge (for tr-bl)
        const startY = 1; // Skip the corner that's already checked
        for (let startY = 1; startY < this.gridHeight; startY++) {
            let word = '';
            let x = isTopLeftToBottomRight ? 0 : this.gridWidth - 1;
            let y = startY;
            
            while (x >= 0 && x < this.gridWidth && y < this.gridHeight) {
                if (this.grid[y][x]) {
                    word += this.grid[y][x];
                } else {
                    if (word.length >= 3 && this.wordList.includes(word)) {
                        const startPos = isTopLeftToBottomRight ? 
                            {x: x - word.length, y: y - word.length} : 
                            {x: x + word.length, y: y - word.length};
                        this.completeWord(word, startPos, direction);
                    }
                    word = '';
                }
                x += isTopLeftToBottomRight ? 1 : -1;
                y += 1;
            }
            if (word.length >= 3 && this.wordList.includes(word)) {
                const startPos = isTopLeftToBottomRight ? 
                    {x: x - word.length, y: y - word.length} : 
                    {x: x + word.length, y: y - word.length};
                this.completeWord(word, startPos, direction);
            }
        }
    }
    
    completeWord(word, position, direction) {
        if (this.completedWords.includes(word)) return; // Already completed
        
        this.completedWords.push(word);
        this.wordsCompleted++;
        this.score += word.length * 10 * this.level;
        
        console.log(`🎉 Word completed: ${word} (${direction}) (+${word.length * 10 * this.level} points)`);
        
        // Remove letters from grid
        this.removeWordFromGrid(word, position, direction);
        
        // Level up every 5 words
        if (this.wordsCompleted % 5 === 0) {
            this.level++;
            this.fallSpeed = Math.max(200, this.fallSpeed - 100);
            console.log(`🚀 Level up! Now level ${this.level}`);
        }
    }
    
    removeWordFromGrid(word, position, direction) {
        const startX = position.x;
        const startY = position.y;
        
        if (direction === 'horizontal') {
            // Remove horizontal word
            for (let i = 0; i < word.length; i++) {
                const x = startX + i;
                if (x >= 0 && x < this.gridWidth && startY >= 0 && startY < this.gridHeight) {
                    this.grid[startY][x] = null;
                }
            }
        } else if (direction === 'vertical') {
            // Remove vertical word
            for (let i = 0; i < word.length; i++) {
                const y = startY + i;
                if (startX >= 0 && startX < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.grid[y][startX] = null;
                }
            }
        } else if (direction === 'diagonal-tl-br') {
            // Remove diagonal word (top-left to bottom-right)
            for (let i = 0; i < word.length; i++) {
                const x = startX + i;
                const y = startY + i;
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.grid[y][x] = null;
                }
            }
        } else if (direction === 'diagonal-tr-bl') {
            // Remove diagonal word (top-right to bottom-left)
            for (let i = 0; i < word.length; i++) {
                const x = startX - i;
                const y = startY + i;
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.grid[y][x] = null;
                }
            }
        }
        
        // Apply gravity
        this.applyGravity();
    }
    
    applyGravity() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = this.gridHeight - 1; y > 0; y--) {
                if (this.grid[y][x] === null && this.grid[y-1][x] !== null) {
                    this.grid[y][x] = this.grid[y-1][x];
                    this.grid[y-1][x] = null;
                }
            }
        }
    }
    
    startGame() {
        if (!this.isInitialized) {
            throw new Error('Game not initialized');
        }
        this.gameState.setRunning(true);
        this.gameState.setPaused(false);
        this.gameState.setGameOver(false);
        
        // Create first falling letter
        this.createFallingLetter();
        
        // Start fall timer
        this.startFallTimer();
        
        // Start a simple game loop for the fallback
        this.startFallbackGameLoop();
        
        console.log('🎮 FallbackGameCore game started');
    }
    
    startFallTimer() {
        this.fallTimer = setInterval(() => {
            if (this.gameState.isRunning() && !this.gameState.isPaused()) {
                this.moveFallingLetter('down');
            }
        }, this.fallSpeed);
    }
    
    stopFallTimer() {
        if (this.fallTimer) {
            clearInterval(this.fallTimer);
            this.fallTimer = null;
        }
    }
    
    startFallbackGameLoop() {
        const gameLoop = () => {
            if (this.gameState.isRunning() && !this.gameState.isPaused()) {
                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw background image if available
                this.drawBackground();
                
                // Draw grid
                this.drawGrid();
                
                // Draw placed letters
                this.drawPlacedLetters();
                
                // Draw falling letter
                this.drawFallingLetter();
                
                // Draw UI
                this.drawUI();
            }
            
            // Continue the loop
            if (this.gameState.isRunning()) {
                requestAnimationFrame(gameLoop);
            }
        };
        
        requestAnimationFrame(gameLoop);
    }
    
    drawBackground() {
        // Try to load and draw the background image
        if (!this.backgroundImage) {
            this.loadBackgroundImage();
        }
        
        if (this.backgroundImage && this.backgroundImage.complete) {
            // Draw background image with proper scaling
            const img = this.backgroundImage;
            const imgAspectRatio = img.width / img.height;
            const canvasAspectRatio = this.canvas.width / this.canvas.height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgAspectRatio > canvasAspectRatio) {
                // Image is wider than canvas
                drawHeight = this.canvas.height;
                drawWidth = drawHeight * imgAspectRatio;
                offsetX = (this.canvas.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                // Image is taller than canvas
                drawWidth = this.canvas.width;
                drawHeight = drawWidth / imgAspectRatio;
                offsetX = 0;
                offsetY = (this.canvas.height - drawHeight) / 2;
            }
            
            this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            
            // Add a subtle overlay for better text readability
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback gradient background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    loadBackgroundImage() {
        if (!this.backgroundImage) {
            this.backgroundImage = new Image();
            this.backgroundImage.onload = () => {
                console.log('🖼️ Background image loaded in fallback mode');
            };
            this.backgroundImage.onerror = () => {
                console.warn('⚠️ Failed to load background image in fallback mode');
            };
            this.backgroundImage.src = 'images/Cascade Letters - 02 - Decor concept 01.png';
        }
    }
    
    drawGrid() {
        // Draw grid lines with proper offset and better visibility
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= this.gridWidth; x++) {
            const posX = this.gridOffsetX + (x * this.cellSize);
            this.ctx.beginPath();
            this.ctx.moveTo(posX, this.gridOffsetY);
            this.ctx.lineTo(posX, this.gridOffsetY + (this.gridHeight * this.cellSize));
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.gridHeight; y++) {
            const posY = this.gridOffsetY + (y * this.cellSize);
            this.ctx.beginPath();
            this.ctx.moveTo(this.gridOffsetX, posY);
            this.ctx.lineTo(this.gridOffsetX + (this.gridWidth * this.cellSize), posY);
            this.ctx.stroke();
        }
    }
    
    drawPlacedLetters() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) {
                    const centerX = this.gridOffsetX + (x * this.cellSize) + (this.cellSize / 2);
                    const centerY = this.gridOffsetY + (y * this.cellSize) + (this.cellSize / 2);
                    this.ctx.fillText(this.grid[y][x], centerX, centerY);
                }
            }
        }
    }
    
    drawFallingLetter() {
        if (!this.fallingLetter) return;
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.gridOffsetX + (this.fallingLetter.x * this.cellSize) + (this.cellSize / 2);
        const centerY = this.gridOffsetY + (this.fallingLetter.y * this.cellSize) + (this.cellSize / 2);
        this.ctx.fillText(this.fallingLetter.letter, centerX, centerY);
    }
    
    drawUI() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // Draw score and level
        this.ctx.fillText(`Score: ${this.score}`, 10, 10);
        this.ctx.fillText(`Level: ${this.level}`, 10, 30);
        this.ctx.fillText(`Words: ${this.wordsCompleted}`, 10, 50);
        
        // Draw word list
        this.drawWordList();
        
        // Draw controls
        this.ctx.fillText('Controls: Arrow Keys = Move, Space = Drop, R = Rotate', 10, this.canvas.height - 30);
        this.ctx.fillText('Fallback Mode - Word Formation Active', 10, this.canvas.height - 10);
        
        // Draw game over message
        if (this.gameState.isGameOver()) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`Words Completed: ${this.wordsCompleted}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
    
    drawWordList() {
        // Draw word list panel
        const panelX = this.canvas.width - 200;
        const panelY = 10;
        const panelWidth = 180;
        const panelHeight = 300;
        
        // Draw panel background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw panel border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TARGET WORDS', panelX + panelWidth/2, panelY + 25);
        
        // Draw word list
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        let yOffset = 50;
        
        for (let i = 0; i < this.wordList.length; i++) {
            const word = this.wordList[i];
            const isCompleted = this.completedWords.includes(word);
            
            // Set color based on completion status
            this.ctx.fillStyle = isCompleted ? '#00ff00' : '#ffffff';
            
            // Add checkmark for completed words
            const displayText = isCompleted ? `✓ ${word}` : `  ${word}`;
            
            this.ctx.fillText(displayText, panelX + 10, panelY + yOffset);
            yOffset += 20;
        }
        
        // Draw progress
        const completedCount = this.completedWords.length;
        const totalCount = this.wordList.length;
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Progress: ${completedCount}/${totalCount}`, panelX + panelWidth/2, panelY + panelHeight - 15);
    }
    
    pauseGame() {
        this.gameState.setPaused(true);
        this.stopFallTimer();
        console.log('⏸ FallbackGameCore game paused');
    }
    
    resumeGame() {
        this.gameState.setPaused(false);
        this.startFallTimer();
        console.log('▶ FallbackGameCore game resumed');
    }
    
    resetGame() {
        this.gameState.reset();
        this.initializeGrid();
        this.fallingLetter = null;
        this.score = 0;
        this.level = 1;
        this.wordsCompleted = 0;
        this.completedWords = [];
        this.fallSpeed = 1000;
        this.stopFallTimer();
        console.log('🔄 FallbackGameCore game reset');
    }
    
    cleanup() {
        this.stopFallTimer();
        document.removeEventListener('keydown', this.handleKeyPress);
        this.gameState.reset();
        console.log('🧹 FallbackGameCore cleanup complete');
    }
}

class LettersCascadeGameModular {
    constructor() {
        this.gameCore = null;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        this.isGameStarted = false;
        this.useFallback = false;
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            console.log('🎮 LettersCascadeGameModular starting initialization...');
            
            // Get canvas element
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            console.log('✅ Canvas element found');

            // Use fallback system directly for better performance and reliability
            console.log('📦 Using FallbackGameCore for optimal performance...');
            this.gameCore = new FallbackGameCore();
            this.useFallback = true;
            console.log('✅ FallbackGameCore created');

            // Initialize game core directly
            console.log('🎮 Initializing game core...');
            await this.gameCore.init(this.canvas);
            
            this.isInitialized = true;
            console.log('🎮 LettersCascadeGameModular initialized successfully');
            console.log('🎮 Using fallback mode:', this.useFallback);
            console.log('🎮 isInitialized flag set to:', this.isInitialized);
            
            // Don't auto-start - wait for user to click start button
            console.log('⏳ Game ready - waiting for user to start...');
            
        } catch (error) {
            console.error('❌ Failed to initialize LettersCascadeGameModular:', error);
            throw error;
        }
    }

    /**
     * Start the game
     */
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

    /**
     * Pause the game
     */
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

    /**
     * Resume the game
     */
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

    /**
     * Reset the game
     */
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

    /**
     * Cleanup resources
     */
    cleanup() {
        try {
            this.gameCore.cleanup();
            this.isGameStarted = false;
            console.log('🧹 LettersCascadeGameModular cleanup complete');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }
}

// Export for use in HTML
window.LettersCascadeGameModular = LettersCascadeGameModular;

// Don't auto-initialize - let the HTML handle initialization
console.log('🎮 LettersCascadeGameModular class loaded and ready for instantiation');
console.log('🎮 Module timestamp:', new Date().toISOString());
console.log('🎮 Module loaded at:', performance.now());
