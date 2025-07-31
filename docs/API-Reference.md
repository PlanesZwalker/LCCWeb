# 📚 API Reference

## Overview

This document provides comprehensive API documentation for the **Letters Cascade Challenge** game engine. All classes, methods, and interfaces are documented with examples and usage guidelines.

## 🎮 Core Classes

### GameEngine

The main game engine that coordinates all game systems.

```javascript
class GameEngine {
  constructor(config = {})
  initializeSystems()
  startGame()
  pauseGame()
  resetGame()
  update(deltaTime)
  render()
}
```

#### Constructor
```javascript
const game = new GameEngine({
  renderer: '2D', // '2D' | '3D'
  gridSize: 10,
  difficulty: 'normal'
});
```

#### Methods

##### `initializeSystems()`
Initializes all game systems and components.

```javascript
await game.initializeSystems();
```

##### `startGame()`
Starts the game loop and begins gameplay.

```javascript
game.startGame();
```

##### `pauseGame()`
Pauses the current game session.

```javascript
game.pauseGame();
```

##### `resetGame()`
Resets the game to initial state.

```javascript
game.resetGame();
```

##### `update(deltaTime)`
Updates game logic for the current frame.

```javascript
game.update(16.67); // 60fps delta time
```

##### `render()`
Renders the current game state.

```javascript
game.render();
```

### GameState

Manages the centralized game state with history and event system.

```javascript
class GameState {
  constructor(initialState = {})
  update(newState)
  getState()
  getHistory()
  undo()
  subscribe(listener)
  unsubscribe(listener)
  emit(event, data)
}
```

#### Constructor
```javascript
const state = new GameState({
  score: 0,
  level: 1,
  grid: [],
  gameOver: false
});
```

#### Methods

##### `update(newState)`
Updates the current state and adds to history.

```javascript
state.update({
  score: 100,
  level: 2
});
```

##### `getState()`
Returns the current game state.

```javascript
const currentState = state.getState();
```

##### `getHistory()`
Returns the state history array.

```javascript
const history = state.getHistory();
```

##### `undo()`
Reverts to the previous state.

```javascript
state.undo();
```

##### `subscribe(listener)`
Subscribes to state change events.

```javascript
state.subscribe((newState) => {
  console.log('State updated:', newState);
});
```

##### `unsubscribe(listener)`
Unsubscribes from state change events.

```javascript
state.unsubscribe(listener);
```

##### `emit(event, data)`
Emits an event to all listeners.

```javascript
state.emit('wordCompleted', { word: 'HELLO', score: 50 });
```

## 🎨 Renderer Classes

### RendererFactory

Factory for creating renderer instances.

```javascript
class RendererFactory {
  static createRenderer(type, config = {})
  static getSupportedTypes()
}
```

#### Methods

##### `createRenderer(type, config)`
Creates a renderer instance of the specified type.

```javascript
const renderer2D = RendererFactory.createRenderer('2D', {
  canvas: document.getElementById('gameCanvas'),
  width: 800,
  height: 600
});

const renderer3D = RendererFactory.createRenderer('3D', {
  container: document.getElementById('gameContainer'),
  antialias: true,
  shadows: true
});
```

##### `getSupportedTypes()`
Returns array of supported renderer types.

```javascript
const types = RendererFactory.getSupportedTypes(); // ['2D', '3D']
```

### Renderer2D

2D canvas-based renderer for the game.

```javascript
class Renderer2D {
  constructor(config)
  render(gameState)
  clear()
  drawGrid(grid)
  drawLetter(letter, x, y)
  drawUI(score, level, combo)
  drawParticles(particles)
  resize(width, height)
}
```

#### Constructor
```javascript
const renderer2D = new Renderer2D({
  canvas: document.getElementById('canvas'),
  cellSize: 40,
  colors: {
    background: '#1a1a2e',
    grid: '#4facfe',
    letter: '#ffffff'
  }
});
```

#### Methods

##### `render(gameState)`
Renders the complete game state.

```javascript
renderer2D.render({
  grid: [[...], [...], ...],
  score: 1000,
  level: 5,
  combo: 3
});
```

##### `drawGrid(grid)`
Draws the game grid.

```javascript
renderer2D.drawGrid([
  ['A', 'B', 'C'],
  ['D', 'E', 'F'],
  ['G', 'H', 'I']
]);
```

##### `drawLetter(letter, x, y)`
Draws a single letter at specified position.

```javascript
renderer2D.drawLetter('A', 2, 3);
```

##### `drawUI(score, level, combo)`
Draws the user interface overlay.

```javascript
renderer2D.drawUI(1000, 5, 3);
```

### Renderer3D

3D WebGL renderer using Three.js.

```javascript
class Renderer3D {
  constructor(config)
  render(gameState)
  setupScene()
  createGrid()
  createLetter(letter, position)
  updateCamera(position)
  addLighting()
  addParticles()
  resize(width, height)
}
```

#### Constructor
```javascript
const renderer3D = new Renderer3D({
  container: document.getElementById('container'),
  antialias: true,
  shadows: true,
  postProcessing: true
});
```

#### Methods

##### `render(gameState)`
Renders the 3D scene.

```javascript
renderer3D.render({
  grid: [...],
  camera: { x: 0, y: 5, z: 10 },
  lighting: { intensity: 1.0 }
});
```

##### `createGrid()`
Creates the 3D grid geometry.

```javascript
renderer3D.createGrid(10, 10); // 10x10 grid
```

##### `createLetter(letter, position)`
Creates a 3D letter mesh.

```javascript
renderer3D.createLetter('A', { x: 0, y: 0, z: 0 });
```

## 🎯 Game Logic Classes

### WordDetector

Handles word detection and validation.

```javascript
class WordDetector {
  constructor(dictionary = [])
  detectWords(grid)
  detectHorizontal(grid)
  detectVertical(grid)
  detectDiagonal(grid)
  isValidWord(word)
  loadDictionary(url)
  addCustomWords(words)
}
```

#### Constructor
```javascript
const detector = new WordDetector(['HELLO', 'WORLD', 'GAME']);
```

#### Methods

##### `detectWords(grid)`
Detects all valid words in the grid.

```javascript
const words = detector.detectWords([
  ['H', 'E', 'L'],
  ['W', 'O', 'L'],
  ['G', 'A', 'M']
]);
// Returns: ['HELLO', 'WORLD', 'GAME']
```

##### `detectHorizontal(grid)`
Detects horizontal words only.

```javascript
const horizontalWords = detector.detectHorizontal(grid);
```

##### `detectVertical(grid)`
Detects vertical words only.

```javascript
const verticalWords = detector.detectVertical(grid);
```

##### `detectDiagonal(grid)`
Detects diagonal words only.

```javascript
const diagonalWords = detector.detectDiagonal(grid);
```

##### `isValidWord(word)`
Checks if a word is in the dictionary.

```javascript
const isValid = detector.isValidWord('HELLO'); // true
```

### ScoreManager

Manages scoring, combos, and statistics.

```javascript
class ScoreManager {
  constructor()
  calculateScore(word, combo)
  addScore(points)
  getScore()
  getHighScore()
  getCombo()
  resetCombo()
  getStatistics()
}
```

#### Methods

##### `calculateScore(word, combo)`
Calculates score for a word with combo multiplier.

```javascript
const score = scoreManager.calculateScore('HELLO', 3);
// Returns: 500 (base: 50, combo: 3x)
```

##### `addScore(points)`
Adds points to the current score.

```javascript
scoreManager.addScore(100);
```

##### `getScore()`
Returns the current score.

```javascript
const currentScore = scoreManager.getScore();
```

##### `getHighScore()`
Returns the highest score achieved.

```javascript
const highScore = scoreManager.getHighScore();
```

##### `getCombo()`
Returns the current combo multiplier.

```javascript
const combo = scoreManager.getCombo();
```

### LevelManager

Manages difficulty progression and level mechanics.

```javascript
class LevelManager {
  constructor()
  getCurrentLevel()
  advanceLevel()
  calculateDifficulty(level)
  getFallSpeed(level)
  getGridSize(level)
  getWordComplexity(level)
}
```

#### Methods

##### `getCurrentLevel()`
Returns the current level.

```javascript
const level = levelManager.getCurrentLevel();
```

##### `advanceLevel()`
Advances to the next level.

```javascript
levelManager.advanceLevel();
```

##### `calculateDifficulty(level)`
Calculates difficulty parameters for a level.

```javascript
const difficulty = levelManager.calculateDifficulty(5);
// Returns: { fallSpeed: 2.0, gridSize: 12, wordComplexity: 4 }
```

## 🔊 Audio Classes

### AudioManager

Manages sound effects and audio playback.

```javascript
class AudioManager {
  constructor()
  playSound(soundName)
  playMusic(trackName)
  setVolume(volume)
  mute()
  unmute()
  isMuted()
  loadSounds(sounds)
}
```

#### Methods

##### `playSound(soundName)`
Plays a sound effect.

```javascript
audioManager.playSound('letterPlace');
audioManager.playSound('wordComplete');
audioManager.playSound('levelUp');
```

##### `playMusic(trackName)`
Plays background music.

```javascript
audioManager.playMusic('background');
```

##### `setVolume(volume)`
Sets the audio volume (0.0 to 1.0).

```javascript
audioManager.setVolume(0.7);
```

##### `mute()`
Mutes all audio.

```javascript
audioManager.mute();
```

##### `unmute()`
Unmutes all audio.

```javascript
audioManager.unmute();
```

## 🎨 Visual Effects Classes

### ParticleSystem

Manages particle effects and visual feedback.

```javascript
class ParticleSystem {
  constructor(renderer)
  createExplosion(position, color)
  createTrail(start, end, color)
  createSparkle(position)
  update(deltaTime)
  render()
  clear()
}
```

#### Methods

##### `createExplosion(position, color)`
Creates an explosion effect at the specified position.

```javascript
particleSystem.createExplosion(
  { x: 100, y: 200 },
  '#ff6b6b'
);
```

##### `createTrail(start, end, color)`
Creates a particle trail between two points.

```javascript
particleSystem.createTrail(
  { x: 0, y: 0 },
  { x: 100, y: 100 },
  '#4facfe'
);
```

##### `update(deltaTime)`
Updates all particle effects.

```javascript
particleSystem.update(16.67);
```

## 🔄 Event System

### EventManager

Manages event communication between components.

```javascript
class EventManager {
  constructor()
  on(event, listener)
  off(event, listener)
  emit(event, data)
  once(event, listener)
  clear()
}
```

#### Methods

##### `on(event, listener)`
Registers an event listener.

```javascript
eventManager.on('wordCompleted', (data) => {
  console.log('Word completed:', data.word);
});
```

##### `off(event, listener)`
Removes an event listener.

```javascript
eventManager.off('wordCompleted', listener);
```

##### `emit(event, data)`
Emits an event to all listeners.

```javascript
eventManager.emit('letterPlaced', {
  letter: 'A',
  position: { x: 2, y: 3 }
});
```

##### `once(event, listener)`
Registers a one-time event listener.

```javascript
eventManager.once('gameStart', () => {
  console.log('Game started!');
});
```

## 🎮 Game-Specific Classes

### LettersCascadeGame (2D)

The main 2D game implementation.

```javascript
class LettersCascadeGame {
  constructor(canvas, config)
  init()
  startGame()
  pauseGame()
  resetGame()
  handleKeyPress(event)
  handleMouseClick(event)
  update()
  render()
}
```

#### Constructor
```javascript
const game = new LettersCascadeGame(
  document.getElementById('canvas'),
  {
    gridSize: 10,
    cellSize: 40,
    fallSpeed: 2.0
  }
);
```

#### Methods

##### `init()`
Initializes the 2D game.

```javascript
await game.init();
```

##### `startGame()`
Starts the 2D game.

```javascript
game.startGame();
```

##### `handleKeyPress(event)`
Handles keyboard input.

```javascript
game.handleKeyPress({
  key: 'ArrowRight',
  preventDefault: () => {}
});
```

### Game3D (3D)

The main 3D game implementation.

```javascript
class Game3D {
  constructor(container, config)
  initThreeJS()
  createGrid()
  createLetter3D(letter, position)
  handleMouseClick(event)
  update()
  render()
  resize()
}
```

#### Constructor
```javascript
const game3D = new Game3D(
  document.getElementById('container'),
  {
    gridSize: 10,
    cellSize: 1.0,
    cameraDistance: 15
  }
);
```

#### Methods

##### `initThreeJS()`
Initializes the Three.js scene.

```javascript
game3D.initThreeJS();
```

##### `createGrid()`
Creates the 3D grid.

```javascript
game3D.createGrid();
```

##### `createLetter3D(letter, position)`
Creates a 3D letter mesh.

```javascript
game3D.createLetter3D('A', { x: 0, y: 0, z: 0 });
```

## 🧪 Testing Utilities

### Test Helpers

Utility functions for testing.

```javascript
// Mock canvas context
function createMockCanvas() {
  return {
    getContext: () => ({
      fillRect: jest.fn(),
      fillText: jest.fn(),
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn()
    })
  };
}

// Mock Three.js
function createMockTHREE() {
  return {
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    WebGLRenderer: jest.fn(),
    BoxGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn()
  };
}
```

## 📊 Configuration Objects

### Game Configuration

```javascript
const gameConfig = {
  renderer: '2D', // '2D' | '3D'
  gridSize: 10,
  cellSize: 40,
  fallSpeed: 2.0,
  colors: {
    background: '#1a1a2e',
    grid: '#4facfe',
    letter: '#ffffff',
    ui: '#6366f1'
  },
  audio: {
    enabled: true,
    volume: 0.7
  },
  effects: {
    particles: true,
    animations: true
  }
};
```

### Renderer Configuration

```javascript
const rendererConfig = {
  // 2D Renderer
  canvas: document.getElementById('canvas'),
  width: 800,
  height: 600,
  
  // 3D Renderer
  container: document.getElementById('container'),
  antialias: true,
  shadows: true,
  postProcessing: true
};
```

## 🔧 Error Handling

### Common Errors

```javascript
// Invalid renderer type
try {
  const renderer = RendererFactory.createRenderer('INVALID');
} catch (error) {
  console.error('Invalid renderer type:', error.message);
}

// Canvas not found
try {
  const game = new LettersCascadeGame(null);
} catch (error) {
  console.error('Canvas element required:', error.message);
}

// WebGL not supported
try {
  const game3D = new Game3D(container);
} catch (error) {
  console.error('WebGL not supported:', error.message);
}
```

## 📝 Usage Examples

### Basic Game Setup

```javascript
// Initialize 2D game
const canvas = document.getElementById('gameCanvas');
const game = new LettersCascadeGame(canvas, {
  gridSize: 10,
  cellSize: 40
});

await game.init();
game.startGame();

// Initialize 3D game
const container = document.getElementById('gameContainer');
const game3D = new Game3D(container, {
  gridSize: 10,
  cellSize: 1.0
});

game3D.initThreeJS();
game3D.startGame();
```

### Event Handling

```javascript
// Listen for game events
eventManager.on('wordCompleted', (data) => {
  console.log(`Word completed: ${data.word} for ${data.score} points`);
  audioManager.playSound('wordComplete');
});

eventManager.on('levelUp', (data) => {
  console.log(`Level up! Now at level ${data.level}`);
  audioManager.playSound('levelUp');
});
```

### Custom Word Detection

```javascript
// Add custom words to dictionary
const detector = new WordDetector();
detector.addCustomWords(['CUSTOM', 'WORDS', 'HERE']);

// Check if word is valid
const isValid = detector.isValidWord('CUSTOM'); // true
```

---

*This API reference provides comprehensive documentation for all game components. For additional examples and advanced usage, refer to the test files and source code.* 