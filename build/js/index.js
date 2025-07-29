// Complete Game Engine for Letters Cascade Challenge - 2D Version
class LettersCascadeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 10;
        this.cellSize = 40;
        this.grid = [];
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.letterQueue = [];
        this.completedWords = [];
        this.targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'];
        this.currentLetter = null;
        this.letterPosition = { x: 0, y: 0 };
        this.gameSpeed = 1000;
        this.gameInterval = null;
        this.paused = false;
        this.wordsFound = 0;
        this.targetScore = 100;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.generateSmartLetterQueue();
        this.drawGrid();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateLetterPreview();
    }

    setupCanvas() {
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= this.gridSize; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.gridSize; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }

        // Draw placed letters
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row] && this.grid[row][col]) {
                    this.drawLetter(this.grid[row][col], col, row);
                }
            }
        }

        // Draw current falling letter
        if (this.currentLetter && this.gameRunning && !this.paused) {
            this.drawLetter(this.currentLetter, this.letterPosition.x, this.letterPosition.y);
        }
    }

    drawLetter(letter, col, row) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;

        // Draw letter background
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);

        // Draw letter
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(letter, x, y);
    }

    generateSmartLetterQueue() {
        this.letterQueue = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Analyze word requirements
        const wordRequirements = this.analyzeWordRequirements();
        
        // Create balanced letter queue
        this.letterQueue = this.createBalancedLetterQueue(wordRequirements, 20);
        
        this.updateLetterPreview();
    }

    analyzeWordRequirements() {
        const requirements = {};
        this.targetWords.forEach(word => {
            if (!this.completedWords.includes(word)) {
                for (let letter of word) {
                    requirements[letter] = (requirements[letter] || 0) + 1;
                }
            }
        });
        return requirements;
    }

    createBalancedLetterQueue(requirements, count) {
        const queue = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Add required letters first
        for (let letter in requirements) {
            const needed = requirements[letter];
            for (let i = 0; i < Math.min(needed, 3); i++) {
                queue.push(letter);
            }
        }
        
        // Fill remaining slots with random letters
        while (queue.length < count) {
            queue.push(letters[Math.floor(Math.random() * letters.length)]);
        }
        
        // Shuffle the queue
        return this.shuffleArray(queue);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    updateLetterPreview() {
        const preview = document.getElementById('letterPreview');
        if (preview) {
            preview.innerHTML = '';
            this.letterQueue.slice(0, 5).forEach(letter => {
                const li = document.createElement('li');
                li.textContent = letter;
                preview.appendChild(li);
            });
        }
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.paused = false;
            this.spawnNewLetter();
            this.gameLoop();
            
            if (typeof Utils !== 'undefined') {
                Utils.playSound('start', 800, 0.3);
            }
        }
    }

    stopGame() {
        this.gameRunning = false;
        this.paused = false;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }

    pauseGame() {
        if (this.gameRunning) {
            this.paused = !this.paused;
            if (this.paused) {
                if (this.gameInterval) {
                    clearInterval(this.gameInterval);
                    this.gameInterval = null;
                }
            } else {
                this.gameLoop();
            }
        }
    }

    resetGame() {
        this.stopGame();
        this.grid = [];
        this.score = 0;
        this.level = 1;
        this.completedWords = [];
        this.wordsFound = 0;
        this.targetScore = 100;
        this.generateSmartLetterQueue();
        this.drawGrid();
        this.updateDisplay();
        this.updateWordList();
    }

    spawnNewLetter() {
        if (this.letterQueue.length > 0) {
            this.currentLetter = this.letterQueue.shift();
            this.letterPosition = { x: Math.floor(this.gridSize / 2), y: 0 };
            this.updateLetterPreview();
        } else {
            this.generateSmartLetterQueue();
            this.spawnNewLetter();
        }
    }

    gameLoop() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        this.gameInterval = setInterval(() => {
            if (this.gameRunning && !this.paused) {
                this.moveLetterDown();
                this.drawGrid();
            }
        }, this.gameSpeed);
    }

    placeLetter() {
        if (this.currentLetter && !this.isCellOccupied(this.letterPosition.x, this.letterPosition.y)) {
            if (!this.grid[this.letterPosition.y]) {
                this.grid[this.letterPosition.y] = [];
            }
            this.grid[this.letterPosition.y][this.letterPosition.x] = this.currentLetter;
            
            if (typeof Utils !== 'undefined') {
                Utils.playSound('place', 600, 0.2);
                Utils.createParticleEffect(
                    this.letterPosition.x * this.cellSize + this.cellSize / 2,
                    this.letterPosition.y * this.cellSize + this.cellSize / 2,
                    8,
                    '#4ecdc4'
                );
            }
            
            this.checkWordCompletion();
            this.spawnNewLetter();
        }
    }

    isCellOccupied(col, row) {
        return this.grid[row] && this.grid[row][col];
    }

    checkWordCompletion() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row] && this.grid[row][col]) {
                    for (let [dx, dy] of directions) {
                        const word = this.checkWordInDirection(col, row, dx, dy);
                        if (word && this.targetWords.includes(word) && !this.completedWords.includes(word)) {
                            this.completeWord(word);
                        }
                    }
                }
            }
        }
    }

    checkWordInDirection(startX, startY, dx, dy) {
        let word = '';
        let x = startX;
        let y = startY;
        
        while (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            if (this.grid[y] && this.grid[y][x]) {
                word += this.grid[y][x];
            } else {
                break;
            }
            x += dx;
            y += dy;
        }
        
        return word.length >= 3 ? word : null;
    }

    completeWord(word) {
        this.completedWords.push(word);
        this.score += word.length * 10;
        this.wordsFound++;
        
        if (typeof Utils !== 'undefined') {
            Utils.playSound('complete', 1000, 0.5);
            Utils.createVictorySparkles(15);
        }
        
        this.updateDisplay();
        this.updateWordList();
        
        // Check level progression
        if (this.score >= this.targetScore) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.targetScore = this.level * 100;
        this.gameSpeed = Math.max(200, 1000 - (this.level - 1) * 100);
        
        if (typeof Utils !== 'undefined') {
            Utils.showModal(
                'Niveau ' + this.level + ' !',
                'Félicitations ! Vous avez atteint le niveau ' + this.level + '. La vitesse augmente !',
                [{ text: 'Continuer', action: () => this.gameLoop() }]
            );
        }
        
        this.updateDisplay();
    }

    moveLetterDown() {
        if (this.currentLetter) {
            if (this.letterPosition.y < this.gridSize - 1 && !this.isCellOccupied(this.letterPosition.x, this.letterPosition.y + 1)) {
                this.letterPosition.y++;
                this.drawGrid(); // Redraw to show letter in new position
            } else {
                this.placeLetter();
            }
        }
    }

    moveLetterLeft() {
        if (this.currentLetter && this.letterPosition.x > 0 && !this.isCellOccupied(this.letterPosition.x - 1, this.letterPosition.y)) {
            this.letterPosition.x--;
            this.drawGrid();
        }
    }

    moveLetterRight() {
        if (this.currentLetter && this.letterPosition.x < this.gridSize - 1 && !this.isCellOccupied(this.letterPosition.x + 1, this.letterPosition.y)) {
            this.letterPosition.x++;
            this.drawGrid();
        }
    }

    updateDisplay() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        const levelDisplay = document.getElementById('levelDisplay');
        const wordsCompleted = document.getElementById('wordsCompleted');
        const currentLevel = document.getElementById('currentLevel');
        const targetScore = document.getElementById('targetScore');
        const wordsFound = document.getElementById('wordsFound');
        
        if (scoreDisplay) scoreDisplay.textContent = this.score;
        if (levelDisplay) levelDisplay.textContent = this.level;
        if (wordsCompleted) wordsCompleted.textContent = this.wordsFound;
        if (currentLevel) currentLevel.textContent = this.level;
        if (targetScore) targetScore.textContent = this.targetScore;
        if (wordsFound) wordsFound.textContent = this.wordsFound;
    }

    updateWordList() {
        const wordList = document.getElementById('wordList');
        if (wordList) {
            const items = wordList.querySelectorAll('li');
            items.forEach((item, index) => {
                const word = this.targetWords[index];
                if (this.completedWords.includes(word)) {
                    item.classList.add('completed');
                } else {
                    item.classList.remove('completed');
                }
            });
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.paused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveLetterLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveLetterRight();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveLetterDown();
                    this.drawGrid();
                    break;
                case ' ':
                    e.preventDefault();
                    this.placeLetter();
                    break;
            }
        });

        // Canvas click to place letter
        this.canvas.addEventListener('click', (e) => {
            if (this.gameRunning && !this.paused) {
                const rect = this.canvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) / this.cellSize);
                const y = Math.floor((e.clientY - rect.top) / this.cellSize);
                
                if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                    this.letterPosition.x = x;
                    this.letterPosition.y = y;
                    this.placeLetter();
                }
            }
        });
    }
}

// Global game instance
let game;

// Global functions for button controls
function startGame() {
    if (!game) {
        game = new LettersCascadeGame();
    }
    game.startGame();
}

function resetGame() {
    if (game) {
        game.resetGame();
    }
}

function pauseGame() {
    if (game) {
        game.pauseGame();
    }
}

function moveLeft() {
    if (game && game.gameRunning && !game.paused) {
        game.moveLetterLeft();
    }
}

function moveRight() {
    if (game && game.gameRunning && !game.paused) {
        game.moveLetterRight();
    }
}

function rotate() {
    // Placeholder for rotation functionality
    if (game && game.gameRunning && !game.paused) {
        if (typeof Utils !== 'undefined') {
            Utils.playSound('place', 600, 0.1);
        }
    }
}

function drop() {
    if (game && game.gameRunning && !game.paused) {
        game.moveLetterDown();
        game.drawGrid();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    game = new LettersCascadeGame();
});