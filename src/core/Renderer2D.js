// Renderer2D.js

export class Renderer2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = 40;
    this.gridPadding = 5;
    this.letterSize = 30;
    this.colors = {
      background: '#1a1a2e',
      grid: '#16213e',
      letter: '#ffffff',
      falling: '#ff6b6b',
      placed: '#4ecdc4',
      word: '#ffd93d',
      score: '#ff6b6b',
      level: '#4ecdc4',
    };
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  render(gameState) {
    this.clear();
    this.drawBackground();
    this.drawGrid(gameState.grid);
    this.drawFallingLetter(gameState.fallingLetter);
    this.drawScore(gameState.score);
    this.drawLevel(gameState.level);
    this.drawQueue(gameState.letterQueue);
  }

  clear() {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground() {
    // Draw gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid(grid) {
    const startX = (this.canvas.width - grid[0].length * this.gridSize) / 2;
    const startY = (this.canvas.height - grid.length * this.gridSize) / 2;

    // Draw grid cells
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const x = startX + col * this.gridSize;
        const y = startY + row * this.gridSize;

        // Draw cell background
        this.ctx.fillStyle = this.colors.grid;
        this.ctx.fillRect(x, y, this.gridSize, this.gridSize);

        // Draw cell border
        this.ctx.strokeStyle = '#ffffff20';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, this.gridSize, this.gridSize);

        // Draw letter if present
        if (grid[row][col]) {
          this.drawLetter(grid[row][col], x, y, this.colors.placed);
        }
      }
    }
  }

  drawFallingLetter(letter) {
    if (!letter) return;

    const x = letter.x * this.gridSize + (this.canvas.width - 8 * this.gridSize) / 2;
    const y = letter.y * this.gridSize + (this.canvas.height - 8 * this.gridSize) / 2;

    this.drawLetter(letter.char, x, y, this.colors.falling);
  }

  drawLetter(char, x, y, color) {
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;

    // Draw letter background
    this.ctx.fillStyle = `${color}20`;
    this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);

    // Draw letter
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${this.letterSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(char, centerX, centerY);
  }

  drawScore(score) {
    this.ctx.fillStyle = this.colors.score;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${score}`, 20, 40);
  }

  drawLevel(level) {
    this.ctx.fillStyle = this.colors.level;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Level: ${level}`, this.canvas.width - 20, 40);
  }

  drawQueue(queue) {
    const queueX = 20;
    const queueY = this.canvas.height - 60;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Next:', queueX, queueY);

    for (let i = 0; i < Math.min(queue.length, 5); i++) {
      const x = queueX + 60 + i * 30;
      const y = queueY + 10;

      this.ctx.fillStyle = this.colors.letter;
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillText(queue[i], x, y);
    }
  }

  highlightWord(wordInfo) {
    const startX = (this.canvas.width - 8 * this.gridSize) / 2;
    const startY = (this.canvas.height - 8 * this.gridSize) / 2;

    const x1 = startX + wordInfo.start.col * this.gridSize;
    const y1 = startY + wordInfo.start.row * this.gridSize;
    const x2 = startX + wordInfo.end.col * this.gridSize;
    const y2 = startY + wordInfo.end.row * this.gridSize;

    this.ctx.strokeStyle = this.colors.word;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + this.gridSize / 2, y1 + this.gridSize / 2);
    this.ctx.lineTo(x2 + this.gridSize / 2, y2 + this.gridSize / 2);
    this.ctx.stroke();
  }
}
