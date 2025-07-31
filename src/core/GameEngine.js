/**
 * Game Engine
 * Main game engine implementing the IGameEngine interface
 */

import { IGameEngine } from './interfaces.js';
import { GameState } from './GameState.js';
import { EventManager } from './EventManager.js';
import { WordDetector } from './WordDetector.js';
import { ScoreManager } from './ScoreManager.js';
import { LevelManager } from './LevelManager.js';
import { AudioManager } from './AudioManager.js';
import { ParticleSystem } from './ParticleSystem.js';
import { RendererFactory } from './RendererFactory.js';

export class GameEngine extends IGameEngine {
  constructor() {
    super();
    this.gameState = new GameState();
    this.eventManager = new EventManager();
    this.wordDetector = new WordDetector();
    this.scoreManager = new ScoreManager();
    this.levelManager = new LevelManager();
    this.audioManager = new AudioManager();
    this.particleSystem = null;
    this.renderer = null;

    this.gameLoop = null;
    this.lastTime = 0;
    this.fallSpeed = 1000; // milliseconds
    this.lastFallTime = 0;

    this.setupEventListeners();
  }

  init() {
    console.log('🎮 Initializing Game Engine...');

    // Initialize systems
    this.initializeSystems();

    // Set up game state
    this.resetGame();

    console.log('✅ Game Engine initialized successfully');
  }

  initializeSystems() {
    // Initialize word detector with dictionary
    this.wordDetector = new WordDetector();

    // Initialize managers
    this.scoreManager = new ScoreManager();
    this.levelManager = new LevelManager();
    this.audioManager = new AudioManager();

    // Initialize particle system (if container is available)
    if (document.getElementById('game-container')) {
      this.particleSystem = new ParticleSystem(document.getElementById('game-container'));
    }
  }

  setupEventListeners() {
    // Game state events
    this.eventManager.on('gameStart', () => this.startGame());
    this.eventManager.on('gamePause', () => this.pauseGame());
    this.eventManager.on('gameReset', () => this.resetGame());

    // Input events
    this.eventManager.on('keyPress', (data) => this.handleKeyPress(data));
    this.eventManager.on('mouseClick', (data) => this.handleMouseClick(data));

    // Game logic events
    this.eventManager.on('letterPlaced', (data) => this.onLetterPlaced(data));
    this.eventManager.on('wordFound', (data) => this.onWordFound(data));
    this.eventManager.on('levelUp', (data) => this.onLevelUp(data));
  }

  setupGameLoop() {
    this.gameLoop = (currentTime) => {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.update(deltaTime);

      if (this.gameState.get('status') === 'playing') {
        requestAnimationFrame(this.gameLoop);
      }
    };
  }

  startGameLoop() {
    if (!this.gameLoop) {
      this.setupGameLoop();
    }
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  pauseGameLoop() {
    this.gameLoop = null;
  }

  resumeGameLoop() {
    this.startGameLoop();
  }

  stopGameLoop() {
    this.gameLoop = null;
  }

  update(deltaTime) {
    // Update falling letter
    this.updateFallingLetter(deltaTime);

    // Check for word completion
    this.checkWordCompletion();

    // Update particle system
    if (this.particleSystem) {
      this.particleSystem.update(deltaTime);
    }

    // Render game state
    if (this.renderer) {
      this.renderer.render(this.gameState.getState());
    }
  }

  updateFallingLetter(deltaTime) {
    const currentTime = performance.now();

    if (currentTime - this.lastFallTime > this.fallSpeed) {
      this.lastFallTime = currentTime;

      const fallingLetter = this.gameState.get('fallingLetter');
      if (fallingLetter) {
        fallingLetter.y += 1;

        // Check if letter should be placed
        if (fallingLetter.y >= 8 || this.isPositionOccupied(fallingLetter.x, fallingLetter.y)) {
          this.placeLetter(fallingLetter);
        } else {
          this.gameState.setFallingLetter(fallingLetter);
        }
      } else {
        // Generate new falling letter
        this.generateFallingLetter();
      }
    }
  }

  generateFallingLetter() {
    const queue = this.gameState.get('letterQueue');
    if (queue.length > 0) {
      const char = queue.shift();
      const x = Math.floor(Math.random() * 8);
      const fallingLetter = { char, x, y: 0 };

      this.gameState.setFallingLetter(fallingLetter);
      this.eventManager.emit('letterGenerated', fallingLetter);
    } else {
      // Refill queue
      this.refillLetterQueue();
    }
  }

  refillLetterQueue() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const queue = [];

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      queue.push(letters[randomIndex]);
    }

    this.gameState.set('letterQueue', queue);
  }

  placeLetter(letter) {
    const grid = this.gameState.get('grid');
    if (letter.y < 8 && !this.isPositionOccupied(letter.x, letter.y)) {
      grid[letter.y][letter.x] = letter.char;
      this.gameState.set('grid', grid);
      this.gameState.setFallingLetter(null);

      this.eventManager.emit('letterPlaced', letter);

      // Check for words after placing
      this.checkWordCompletion();
    }
  }

  isPositionOccupied(x, y) {
    const grid = this.gameState.get('grid');
    return grid[y] && grid[y][x];
  }

  checkWordCompletion() {
    const grid = this.gameState.get('grid');
    const words = this.wordDetector.findWords(grid);

    if (words.length > 0) {
      words.forEach(wordInfo => {
        this.completeWord(wordInfo);
      });
    }
  }

  completeWord(wordInfo) {
    // Calculate score
    const score = this.calculateWordScore(wordInfo.word);
    this.scoreManager.addPoints(score);

    // Remove word from grid
    this.removeWordFromGrid(wordInfo);

    // Emit events
    this.eventManager.emit('wordFound', { wordInfo, score });

    // Check for level up
    this.checkLevelProgression();
  }

  calculateWordScore(word) {
    return word.length * 10;
  }

  removeWordFromGrid(wordInfo) {
    const grid = this.gameState.get('grid');

    if (wordInfo.direction === 'horizontal') {
      for (let { col } = wordInfo.start; col <= wordInfo.end.col; col++) {
        grid[wordInfo.start.row][col] = null;
      }
    } else if (wordInfo.direction === 'vertical') {
      for (let { row } = wordInfo.start; row <= wordInfo.end.row; row++) {
        grid[row][wordInfo.start.col] = null;
      }
    } else if (wordInfo.direction === 'diagonal') {
      for (let i = 0; i < wordInfo.word.length; i++) {
        grid[wordInfo.start.row + i][wordInfo.start.col + i] = null;
      }
    }

    this.gameState.set('grid', grid);
  }

  checkLevelProgression() {
    const score = this.scoreManager.getScore();
    const currentLevel = this.levelManager.getLevel();
    const newLevel = Math.floor(score / 100) + 1;

    if (newLevel > currentLevel) {
      this.levelUp(newLevel);
    }
  }

  levelUp(newLevel) {
    this.levelManager.nextLevel();
    this.fallSpeed = Math.max(200, 1000 - (newLevel - 1) * 50);

    this.eventManager.emit('levelUp', { newLevel });
  }

  handleKeyPress(data) {
    const { key } = data;

    if (this.gameState.get('status') !== 'playing') return;

    const fallingLetter = this.gameState.get('fallingLetter');
    if (!fallingLetter) return;

    switch (key) {
    case 'ArrowLeft':
      if (fallingLetter.x > 0) {
        fallingLetter.x--;
        this.gameState.setFallingLetter(fallingLetter);
      }
      break;
    case 'ArrowRight':
      if (fallingLetter.x < 7) {
        fallingLetter.x++;
        this.gameState.setFallingLetter(fallingLetter);
      }
      break;
    case 'ArrowDown':
    case ' ':
      this.placeLetter(fallingLetter);
      break;
    }
  }

  handleMouseClick(data) {
    // Handle mouse clicks for letter placement
    // Implementation depends on renderer
  }

  onLetterPlaced(data) {
    console.log('Letter placed:', data);
  }

  onWordFound(data) {
    console.log('Word found:', data.wordInfo.word, 'Score:', data.score);

    // Play sound
    this.audioManager.play('wordComplete');

    // Add particles
    if (this.particleSystem) {
      this.particleSystem.spawnParticle({
        type: 'wordComplete',
        position: data.wordInfo.start,
        color: '#ffd93d',
      });
    }
  }

  onLevelUp(data) {
    console.log('Level up! New level:', data.newLevel);
    this.audioManager.play('levelUp');
  }

  startGame() {
    this.gameState.startGame();
    this.startGameLoop();
    this.eventManager.emit('gameStarted');
  }

  pauseGame() {
    this.gameState.pauseGame();
    this.pauseGameLoop();
    this.eventManager.emit('gamePaused');
  }

  resetGame() {
    this.gameState.reset();
    this.scoreManager.reset();
    this.levelManager.reset();
    this.fallSpeed = 1000;
    this.refillLetterQueue();
    this.eventManager.emit('gameReset');
  }

  getState() {
    return this.gameState.getState();
  }

  injectRenderer(renderer) {
    this.renderer = renderer;
    if (renderer) {
      renderer.init();
    }
  }

  injectWordDetector(wordDetector) {
    this.wordDetector = wordDetector;
  }

  injectScoreManager(scoreManager) {
    this.scoreManager = scoreManager;
  }

  injectLevelManager(levelManager) {
    this.levelManager = levelManager;
  }

  injectAudioManager(audioManager) {
    this.audioManager = audioManager;
  }

  injectParticleSystem(particleSystem) {
    this.particleSystem = particleSystem;
  }

  updateFPS(currentTime) {
    // FPS monitoring
  }

  startPerformanceMonitoring() {
    // Performance monitoring
  }

  dispose() {
    this.stopGameLoop();
    this.eventManager.removeAllListeners();
  }
}
