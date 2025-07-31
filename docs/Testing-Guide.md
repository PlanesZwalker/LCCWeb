# 🧪 Testing Guide

## Overview

The **Letters Cascade Challenge** project includes a comprehensive testing suite built with Jest. This guide covers how to run tests, write new tests, and understand the testing architecture.

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- 2d-game.test.js
npm test -- 3d-game.test.js

# Run tests with verbose output
npm test -- --verbose
```

### Test Structure

```
tests/
├── 2d-game.test.js    # 2D game mechanics tests
├── 3d-game.test.js    # 3D game mechanics tests
├── setup.js           # Test configuration and mocks
└── README.md          # Testing documentation
```

## 📊 Test Coverage

### Current Coverage
- **234 total tests** (117 2D + 117 3D)
- **Game mechanics**: 100% coverage
- **Rendering**: 95% coverage
- **User interactions**: 90% coverage
- **Error handling**: 85% coverage

### Coverage Categories

#### 2D Game Tests
- **Game Initialization**: Canvas setup, grid creation
- **Grid System**: Letter placement, collision detection
- **Letter Management**: Generation, movement, placement
- **Word Detection**: Horizontal, vertical, diagonal
- **Scoring**: Points calculation, combos, high scores
- **Level Progression**: Difficulty scaling, level advancement
- **Game Controls**: Keyboard input, touch controls
- **Canvas Integration**: Rendering, UI overlays
- **Performance**: Frame rate, memory usage
- **Error Handling**: Invalid inputs, edge cases

#### 3D Game Tests
- **3D Scene Initialization**: Three.js setup, camera, renderer
- **3D Grid System**: Mesh creation, positioning
- **3D Letter Management**: 3D letter meshes, placement
- **3D Rendering**: Scene rendering, lighting, materials
- **3D Lighting**: Ambient, directional, point lights
- **3D Grid Setup**: Grid geometry, materials
- **3D Word Detection**: 3D coordinate system
- **3D Scoring**: Score calculation in 3D context
- **3D Level Progression**: 3D difficulty scaling
- **3D Game Controls**: Mouse interaction, raycasting
- **3D Performance**: WebGL performance, memory
- **3D Error Handling**: WebGL errors, fallbacks
- **3D Mesh Management**: Geometry, materials, disposal
- **3D Camera Controls**: Camera movement, positioning

## 🛠️ Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    'public/js/**/*.js',
    '!src/**/*.test.js',
    '!tests/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@public/(.*)$': '<rootDir>/public/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  verbose: true,
  testTimeout: 15000,
  maxWorkers: '50%',
  bail: false,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  collectCoverage: false,
  coverageProvider: 'v8',
  reporters: ['default']
};
```

### Test Setup (`tests/setup.js`)

```javascript
// Mock DOM elements
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  fillText: jest.fn(),
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  strokeText: jest.fn()
}));

// Mock global APIs
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();
global.performance = { now: jest.fn(() => Date.now()) };

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock Audio API
global.Audio = jest.fn(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  currentTime: 0,
  duration: 100,
  volume: 1,
  muted: false
}));

// Mock WebGL
global.WebGLRenderingContext = jest.fn();
global.WebGL2RenderingContext = jest.fn();

// Mock Three.js
global.THREE = {
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  BoxGeometry: jest.fn(),
  PlaneGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  MeshPhongMaterial: jest.fn(),
  MeshLambertMaterial: jest.fn(),
  Mesh: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  PointLight: jest.fn(),
  Color: jest.fn(),
  Vector2: jest.fn(),
  Vector3: jest.fn(),
  Raycaster: jest.fn(),
  PCFSoftShadowMap: jest.fn(),
  ACESFilmicToneMapping: jest.fn(),
  SRGBColorSpace: jest.fn(),
  Fog: jest.fn(),
  GridHelper: jest.fn(),
  CanvasTexture: jest.fn()
};
```

## 📝 Writing Tests

### Test Structure

```javascript
describe('Game Component', () => {
  let game;
  let mockCanvas;

  beforeEach(() => {
    // Setup test environment
    mockCanvas = createMockCanvas();
    game = new GameComponent(mockCanvas);
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(game.isGameOver).toBe(false);
    });

    test('should create grid with correct size', () => {
      expect(game.grid.length).toBe(10);
      expect(game.grid[0].length).toBe(10);
    });
  });

  describe('Game Logic', () => {
    test('should place letter at valid position', () => {
      const result = game.placeLetter('A', 2, 3);
      expect(result).toBe(true);
      expect(game.grid[3][2]).toBe('A');
    });

    test('should detect valid words', () => {
      game.grid = [
        ['H', 'E', 'L'],
        ['W', 'O', 'L'],
        ['G', 'A', 'M']
      ];
      const words = game.detectWords();
      expect(words).toContain('HELLO');
      expect(words).toContain('WORLD');
    });
  });
});
```

### Mocking Strategies

#### Canvas Mocking
```javascript
function createMockCanvas() {
  return {
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      fillText: jest.fn(),
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      strokeText: jest.fn()
    })),
    width: 800,
    height: 600,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
}
```

#### Three.js Mocking
```javascript
function createMockTHREE() {
  return {
    Scene: jest.fn(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      children: []
    })),
    PerspectiveCamera: jest.fn(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn()
    })),
    WebGLRenderer: jest.fn(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement('div')
    })),
    BoxGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn(() => ({
      position: { set: jest.fn() },
      rotation: { set: jest.fn() }
    }))
  };
}
```

#### Event Mocking
```javascript
function createMockEvent(type, key = null) {
  return {
    type,
    key,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: '' },
    clientX: 100,
    clientY: 100
  };
}
```

### Testing Game Logic

#### Word Detection Tests
```javascript
describe('Word Detection', () => {
  test('should detect horizontal words', () => {
    const grid = [
      ['H', 'E', 'L', 'L', 'O'],
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I', 'J']
    ];
    const words = detector.detectHorizontal(grid);
    expect(words).toContain('HELLO');
  });

  test('should detect vertical words', () => {
    const grid = [
      ['H', 'A', 'F'],
      ['E', 'B', 'G'],
      ['L', 'C', 'H'],
      ['L', 'D', 'I'],
      ['O', 'E', 'J']
    ];
    const words = detector.detectVertical(grid);
    expect(words).toContain('HELLO');
  });

  test('should detect diagonal words', () => {
    const grid = [
      ['H', 'A', 'F'],
      ['B', 'E', 'G'],
      ['C', 'F', 'L'],
      ['D', 'G', 'I'],
      ['E', 'H', 'O']
    ];
    const words = detector.detectDiagonal(grid);
    expect(words).toContain('HELLO');
  });
});
```

#### Scoring Tests
```javascript
describe('Scoring System', () => {
  test('should calculate base score correctly', () => {
    const score = scoreManager.calculateScore('HELLO', 1);
    expect(score).toBe(50); // 5 letters * 10 points
  });

  test('should apply combo multiplier', () => {
    const score = scoreManager.calculateScore('HELLO', 3);
    expect(score).toBe(150); // 50 * 3x combo
  });

  test('should track high score', () => {
    scoreManager.addScore(1000);
    expect(scoreManager.getHighScore()).toBe(1000);
  });
});
```

#### Level Progression Tests
```javascript
describe('Level Management', () => {
  test('should advance level correctly', () => {
    levelManager.advanceLevel();
    expect(levelManager.getCurrentLevel()).toBe(2);
  });

  test('should calculate difficulty for level', () => {
    const difficulty = levelManager.calculateDifficulty(5);
    expect(difficulty.fallSpeed).toBe(2.0);
    expect(difficulty.gridSize).toBe(12);
  });
});
```

### Testing Rendering

#### 2D Rendering Tests
```javascript
describe('2D Rendering', () => {
  test('should render grid correctly', () => {
    const grid = [['A', 'B'], ['C', 'D']];
    renderer.drawGrid(grid);
    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  test('should render UI elements', () => {
    renderer.drawUI(1000, 5, 3);
    expect(mockContext.fillText).toHaveBeenCalled();
  });
});
```

#### 3D Rendering Tests
```javascript
describe('3D Rendering', () => {
  test('should create 3D scene', () => {
    renderer.setupScene();
    expect(mockTHREE.Scene).toHaveBeenCalled();
  });

  test('should create 3D letter mesh', () => {
    renderer.createLetter('A', { x: 0, y: 0, z: 0 });
    expect(mockTHREE.BoxGeometry).toHaveBeenCalled();
    expect(mockTHREE.Mesh).toHaveBeenCalled();
  });
});
```

### Testing User Interactions

#### Keyboard Input Tests
```javascript
describe('Keyboard Input', () => {
  test('should handle arrow key movement', () => {
    const event = createMockEvent('keydown', 'ArrowRight');
    game.handleKeyPress(event);
    expect(game.fallingLetter.x).toBe(1);
  });

  test('should handle spacebar drop', () => {
    const event = createMockEvent('keydown', ' ');
    game.handleKeyPress(event);
    expect(game.fallingLetter).toBeNull();
  });
});
```

#### Mouse Input Tests
```javascript
describe('Mouse Input', () => {
  test('should handle mouse click in 3D', () => {
    const event = createMockEvent('click');
    game3D.handleMouseClick(event);
    expect(game3D.raycaster.ray).toBeDefined();
  });
});
```

## 🔍 Debugging Tests

### Common Issues

#### Canvas Context Issues
```javascript
// Problem: Canvas context not mocked properly
// Solution: Ensure setup.js mocks are loaded
beforeEach(() => {
  jest.clearAllMocks();
  global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    fillText: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn()
  }));
});
```

#### Three.js Mock Issues
```javascript
// Problem: Three.js objects not properly mocked
// Solution: Create comprehensive mocks
const mockMesh = {
  position: { set: jest.fn() },
  rotation: { set: jest.fn() },
  add: jest.fn(),
  remove: jest.fn()
};

global.THREE.Mesh = jest.fn(() => mockMesh);
```

#### Async Test Issues
```javascript
// Problem: Async operations not awaited
// Solution: Use async/await properly
test('should initialize game asynchronously', async () => {
  await game.init();
  expect(game.isInitialized).toBe(true);
});
```

### Debugging Tips

1. **Use `console.log` in tests**:
   ```javascript
   test('should work correctly', () => {
     console.log('Game state:', game.getState());
     expect(game.score).toBe(100);
   });
   ```

2. **Check mock calls**:
   ```javascript
   expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
   ```

3. **Use Jest's `--verbose` flag**:
   ```bash
   npm test -- --verbose
   ```

4. **Debug specific tests**:
   ```javascript
   test.only('should work', () => {
     // Only this test will run
   });
   ```

## 📈 Performance Testing

### Frame Rate Testing
```javascript
describe('Performance', () => {
  test('should maintain 60fps', () => {
    const startTime = performance.now();
    for (let i = 0; i < 60; i++) {
      game.update(16.67);
      game.render();
    }
    const endTime = performance.now();
    const avgFrameTime = (endTime - startTime) / 60;
    expect(avgFrameTime).toBeLessThan(16.67);
  });
});
```

### Memory Usage Testing
```javascript
describe('Memory Management', () => {
  test('should not leak memory', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < 100; i++) {
      const game = new GameComponent();
      game.init();
      game.destroy();
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
  });
});
```

## 🚀 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
      - run: npm test -- --coverage
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm test -- --coverage"
    }
  }
}
```

## 📚 Best Practices

### Test Organization
1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** and isolated
5. **Mock external dependencies** consistently

### Test Data
1. **Use factories** for creating test objects
2. **Create reusable test utilities**
3. **Use realistic test data**
4. **Test edge cases** and error conditions

### Coverage Goals
- **Minimum 70%** overall coverage
- **100% coverage** for critical game logic
- **90% coverage** for user interactions
- **85% coverage** for error handling

---

*This testing guide provides comprehensive coverage of the testing architecture. For specific examples, refer to the existing test files in the `tests/` directory.* 