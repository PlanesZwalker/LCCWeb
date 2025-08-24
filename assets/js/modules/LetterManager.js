/**
 * LetterManager.js - Letter and grid management module
 * Handles letter generation, movement, placement, and grid operations
 */

import { GameState } from './GameState.js';

export class LetterManager {
    constructor() {
        // Grid properties
        this.grid = [];
        this.gridSize = 10;
        this.gridRows = 14;
        this.cellSize = 40;
        
        // Letter properties
        this.fallingLetter = null;
        this.letterQueue = [];
        this.letters = [];
        
        // Letter frequency and balancing
        this.letterFrequency = {
            'A': 9, 'B': 2, 'C': 2, 'D': 3, 'E': 15, 'F': 2, 'G': 2, 'H': 2, 'I': 8,
            'J': 1, 'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 6, 'P': 2, 'Q': 1, 'R': 6,
            'S': 4, 'T': 6, 'U': 6, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 1
        };
        
        // Canvas properties
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        // Background image
        this.backgroundImage = null;
        this.isBackgroundLoaded = false;
        this.backgroundImagePath = 'images/Cascade Letters - 02 - Decor concept 01.png';
    }

    /**
     * Initialize the letter manager
     */
    async init() {
        try {
            // Initialize grid
            this.createGrid();
            
            // Load background image
            await this.loadBackgroundImage();
            
            // Generate initial letter queue
            this.generateLetterQueue();
            
            // Create first falling letter
            this.createFallingLetter();
            
            console.log('📝 LetterManager initialized');
        } catch (error) {
            console.error('❌ LetterManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Reset the letter manager
     */
    reset() {
        try {
            this.grid = [];
            this.fallingLetter = null;
            this.letterQueue = [];
            this.letters = [];
            
            this.createGrid();
            this.generateLetterQueue();
            this.createFallingLetter();
            
            console.log('🔄 LetterManager reset');
        } catch (error) {
            console.error('❌ Error resetting LetterManager:', error);
        }
    }

    /**
     * Create the game grid
     */
    createGrid() {
        try {
            this.grid = [];
            for (let row = 0; row < this.gridRows; row++) {
                this.grid[row] = [];
                for (let col = 0; col < this.gridSize; col++) {
                    this.grid[row][col] = null;
                }
            }
        } catch (error) {
            console.error('❌ Error creating grid:', error);
        }
    }

    /**
     * Load background image
     */
    async loadBackgroundImage() {
        try {
            this.backgroundImage = new Image();
            this.backgroundImage.onload = () => {
                this.isBackgroundLoaded = true;
                console.log('🖼️ Background image loaded');
            };
            this.backgroundImage.onerror = () => {
                console.warn('⚠️ Failed to load background image');
                this.isBackgroundLoaded = false;
            };
            this.backgroundImage.src = this.backgroundImagePath;
        } catch (error) {
            console.error('❌ Error loading background image:', error);
            this.isBackgroundLoaded = false;
        }
    }

    /**
     * Generate letter queue with balanced frequency
     */
    generateLetterQueue() {
        try {
            this.letterQueue = [];
            const totalFrequency = Object.values(this.letterFrequency).reduce((sum, freq) => sum + freq, 0);
            
            // Generate 50 letters for the queue
            for (let i = 0; i < 50; i++) {
                const random = Math.random() * totalFrequency;
                let cumulative = 0;
                
                for (const [letter, frequency] of Object.entries(this.letterFrequency)) {
                    cumulative += frequency;
                    if (random <= cumulative) {
                        this.letterQueue.push(letter);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error generating letter queue:', error);
        }
    }

    /**
     * Create a new falling letter
     */
    createFallingLetter() {
        try {
            if (this.letterQueue.length === 0) {
                this.generateLetterQueue();
            }
            
            const letter = this.letterQueue.shift();
            this.fallingLetter = {
                letter: letter,
                x: Math.floor(this.gridSize / 2),
                y: 0,
                rotation: 0,
                time: Date.now()
            };
        } catch (error) {
            console.error('❌ Error creating falling letter:', error);
        }
    }

    /**
     * Move the falling letter
     * @param {string} direction - Direction to move ('left', 'right', 'down')
     */
    moveFallingLetter(direction) {
        try {
            if (!this.fallingLetter) return;
            
            let newX = this.fallingLetter.x;
            let newY = this.fallingLetter.y;
            
            switch (direction) {
                case 'left':
                    newX = Math.max(0, this.fallingLetter.x - 1);
                    break;
                case 'right':
                    newX = Math.min(this.gridSize - 1, this.fallingLetter.x + 1);
                    break;
                case 'down':
                    newY = Math.min(this.gridRows - 1, this.fallingLetter.y + 1);
                    break;
            }
            
            // Check if the new position is valid
            if (this.isValidPosition(newX, newY)) {
                this.fallingLetter.x = newX;
                this.fallingLetter.y = newY;
            }
        } catch (error) {
            console.error('❌ Error moving falling letter:', error);
        }
    }

    /**
     * Rotate the falling letter
     */
    rotateFallingLetter() {
        try {
            if (this.fallingLetter) {
                this.fallingLetter.rotation = (this.fallingLetter.rotation + 90) % 360;
            }
        } catch (error) {
            console.error('❌ Error rotating falling letter:', error);
        }
    }

    /**
     * Drop the falling letter
     */
    dropFallingLetter() {
        try {
            if (!this.fallingLetter) return;
            
            // Find the lowest valid position
            let finalY = this.fallingLetter.y;
            while (finalY < this.gridRows - 1 && this.isValidPosition(this.fallingLetter.x, finalY + 1)) {
                finalY++;
            }
            
            // Place the letter
            this.placeLetter(this.fallingLetter.x, finalY, this.fallingLetter.letter);
            
            // Create new falling letter
            this.createFallingLetter();
        } catch (error) {
            console.error('❌ Error dropping falling letter:', error);
        }
    }

    /**
     * Update falling letter (called by timer)
     */
    updateFallingLetter() {
        try {
            if (!this.fallingLetter) return;
            
            // Move down one step
            if (this.isValidPosition(this.fallingLetter.x, this.fallingLetter.y + 1)) {
                this.fallingLetter.y++;
            } else {
                // Can't move down, place the letter
                this.placeLetter(this.fallingLetter.x, this.fallingLetter.y, this.fallingLetter.letter);
                this.createFallingLetter();
            }
        } catch (error) {
            console.error('❌ Error updating falling letter:', error);
        }
    }

    /**
     * Check if position is valid for letter placement
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether position is valid
     */
    isValidPosition(x, y) {
        try {
            // Check bounds
            if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridRows) {
                return false;
            }
            
            // Check if cell is empty
            return this.grid[y][x] === null;
        } catch (error) {
            console.error('❌ Error checking valid position:', error);
            return false;
        }
    }

    /**
     * Place a letter in the grid
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} letter - Letter to place
     */
    placeLetter(x, y, letter) {
        try {
            if (this.isValidPosition(x, y)) {
                this.grid[y][x] = {
                    letter: letter,
                    time: Date.now(),
                    placed: true
                };
                
                // Add to letters array for tracking
                this.letters.push({
                    x: x,
                    y: y,
                    letter: letter,
                    time: Date.now()
                });
                
                console.log(`📝 Letter '${letter}' placed at (${x}, ${y})`);
            }
        } catch (error) {
            console.error('❌ Error placing letter:', error);
        }
    }

    /**
     * Check if grid is full
     * @returns {boolean} Whether grid is full
     */
    isGridFull() {
        try {
            let filledCells = 0;
            const totalCells = this.gridSize * this.gridRows;
            
            for (let row = 0; row < this.gridRows; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.grid[row][col] !== null) {
                        filledCells++;
                    }
                }
            }
            
            return filledCells / totalCells >= 0.85; // 85% fill threshold
        } catch (error) {
            console.error('❌ Error checking if grid is full:', error);
            return false;
        }
    }

    /**
     * Check if there are no valid moves
     * @returns {boolean} Whether there are no valid moves
     */
    noValidMoves() {
        try {
            if (!this.fallingLetter) return false;
            
            // Check if falling letter can be placed anywhere
            for (let row = 0; row < this.gridRows; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.isValidPosition(col, row)) {
                        return false; // Found a valid position
                    }
                }
            }
            
            return true; // No valid positions found
        } catch (error) {
            console.error('❌ Error checking for valid moves:', error);
            return false;
        }
    }

    /**
     * Get grid data
     * @returns {Array} Grid data
     */
    getGrid() {
        return this.grid;
    }

    /**
     * Get falling letter
     * @returns {Object} Falling letter data
     */
    getFallingLetter() {
        return this.fallingLetter;
    }

    /**
     * Get letter queue
     * @returns {Array} Letter queue
     */
    getLetterQueue() {
        return this.letterQueue;
    }

    /**
     * Get letters array
     * @returns {Array} Letters array
     */
    getLetters() {
        return this.letters;
    }

    /**
     * Update canvas size
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    updateCanvasSize(width, height) {
        try {
            this.canvasWidth = width;
            this.canvasHeight = height;
        } catch (error) {
            console.error('❌ Error updating canvas size:', error);
        }
    }

    /**
     * Update letter manager
     */
    update() {
        try {
            // Update falling letter time
            if (this.fallingLetter) {
                this.fallingLetter.time = Date.now();
            }
            
            // Update placed letters time
            for (let row = 0; row < this.gridRows; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.grid[row][col]) {
                        this.grid[row][col].time = Date.now();
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error updating LetterManager:', error);
        }
    }

    /**
     * Render the letter manager
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        try {
            // Draw background
            this.drawBackground(ctx);
            
            // Draw grid
            this.drawGrid(ctx);
            
            // Draw falling letter
            this.drawFallingLetter(ctx);
        } catch (error) {
            console.error('❌ Error rendering LetterManager:', error);
        }
    }

    /**
     * Draw background
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawBackground(ctx) {
        try {
            if (this.isBackgroundLoaded && this.backgroundImage) {
                // Calculate aspect ratio
                const imgAspect = this.backgroundImage.width / this.backgroundImage.height;
                const canvasAspect = this.canvasWidth / this.canvasHeight;
                
                let drawWidth, drawHeight, drawX, drawY;
                
                if (imgAspect > canvasAspect) {
                    // Image is wider than canvas
                    drawHeight = this.canvasHeight;
                    drawWidth = drawHeight * imgAspect;
                    drawX = (this.canvasWidth - drawWidth) / 2;
                    drawY = 0;
                } else {
                    // Image is taller than canvas
                    drawWidth = this.canvasWidth;
                    drawHeight = drawWidth / imgAspect;
                    drawX = 0;
                    drawY = (this.canvasHeight - drawHeight) / 2;
                }
                
                // Draw background image
                ctx.drawImage(this.backgroundImage, drawX, drawY, drawWidth, drawHeight);
                
                // Add semi-transparent overlay for readability
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            } else {
                // Fallback gradient background
                const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            }
        } catch (error) {
            console.error('❌ Error drawing background:', error);
        }
    }

    /**
     * Draw grid
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawGrid(ctx) {
        try {
            const gridWidth = this.gridSize * this.cellSize;
            const gridHeight = this.gridRows * this.cellSize;
            const startX = (this.canvasWidth - gridWidth) / 2;
            const startY = (this.canvasHeight - gridHeight) / 2;
            
            // Draw grid cells
            for (let row = 0; row < this.gridRows; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    const x = startX + col * this.cellSize;
                    const y = startY + row * this.cellSize;
                    const cell = this.grid[row][col];
                    
                    if (cell) {
                        this.drawLetterCell(ctx, x, y, cell.letter, cell.time);
                    } else {
                        this.drawEmptyCell(ctx, x, y);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error drawing grid:', error);
        }
    }

    /**
     * Draw letter cell
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} letter - Letter to draw
     * @param {number} time - Placement time
     */
    drawLetterCell(ctx, x, y, letter, time) {
        try {
            const timeSincePlacement = Date.now() - time;
            const animationProgress = Math.min(timeSincePlacement / 1000, 1);
            
            // Draw cell background
            ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + 0.1 * animationProgress})`;
            ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            // Draw cell border
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + 0.2 * animationProgress})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            
            // Draw letter
            ctx.fillStyle = this.getLetterColor(letter);
            ctx.font = `bold ${this.cellSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, x + this.cellSize / 2, y + this.cellSize / 2);
        } catch (error) {
            console.error('❌ Error drawing letter cell:', error);
        }
    }

    /**
     * Draw empty cell
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    drawEmptyCell(ctx, x, y) {
        try {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        } catch (error) {
            console.error('❌ Error drawing empty cell:', error);
        }
    }

    /**
     * Draw falling letter
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawFallingLetter(ctx) {
        try {
            if (!this.fallingLetter) return;
            
            const gridWidth = this.gridSize * this.cellSize;
            const gridHeight = this.gridRows * this.cellSize;
            const startX = (this.canvasWidth - gridWidth) / 2;
            const startY = (this.canvasHeight - gridHeight) / 2;
            
            const x = startX + this.fallingLetter.x * this.cellSize;
            const y = startY + this.fallingLetter.y * this.cellSize;
            const time = this.fallingLetter.time;
            
            this.drawFallingLetterCell(ctx, x, y, this.fallingLetter.letter, time);
        } catch (error) {
            console.error('❌ Error drawing falling letter:', error);
        }
    }

    /**
     * Draw falling letter cell
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} letter - Letter to draw
     * @param {number} time - Animation time
     */
    drawFallingLetterCell(ctx, x, y, letter, time) {
        try {
            const animationProgress = (Date.now() - time) % 2000 / 2000;
            const pulse = Math.sin(animationProgress * Math.PI * 2) * 0.3 + 0.7;
            
            // Draw cell background with pulse effect
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * pulse})`;
            ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            // Draw cell border with pulse effect
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * pulse})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            
            // Draw letter
            ctx.fillStyle = this.getLetterColor(letter);
            ctx.font = `bold ${this.cellSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, x + this.cellSize / 2, y + this.cellSize / 2);
        } catch (error) {
            console.error('❌ Error drawing falling letter cell:', error);
        }
    }

    /**
     * Get color for letter
     * @param {string} letter - Letter to get color for
     * @returns {string} Color string
     */
    getLetterColor(letter) {
        try {
            const colors = {
                'A': '#FF6B6B', 'B': '#4ECDC4', 'C': '#45B7D1', 'D': '#96CEB4',
                'E': '#FFEAA7', 'F': '#DDA0DD', 'G': '#98D8C8', 'H': '#F7DC6F',
                'I': '#BB8FCE', 'J': '#85C1E9', 'K': '#F8C471', 'L': '#82E0AA',
                'M': '#F1948A', 'N': '#85C1E9', 'O': '#F8C471', 'P': '#82E0AA',
                'Q': '#F1948A', 'R': '#85C1E9', 'S': '#F8C471', 'T': '#82E0AA',
                'U': '#F1948A', 'V': '#85C1E9', 'W': '#F8C471', 'X': '#82E0AA',
                'Y': '#F1948A', 'Z': '#85C1E9'
            };
            
            return colors[letter] || '#FFFFFF';
        } catch (error) {
            console.error('❌ Error getting letter color:', error);
            return '#FFFFFF';
        }
    }
}
