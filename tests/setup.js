// Jest setup file for Letters Cascade Challenge tests
// Updated to match actual game implementation

// Mock DOM elements that might not exist in jsdom
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  quadraticCurveTo: jest.fn(),
  strokeText: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now())
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 1,
  volume: 1,
  muted: false,
}));

// Mock WebGL context
global.WebGLRenderingContext = jest.fn();
global.WebGL2RenderingContext = jest.fn();

// Enhanced Three.js mocks based on actual usage in the game
if (typeof global.THREE === 'undefined') {
  global.THREE = {
    // Core classes
    Scene: jest.fn(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
      background: null,
      fog: null,
      userData: {},
    })),
    PerspectiveCamera: jest.fn(() => ({
      position: { x: 0, y: 0, z: 0 },
      lookAt: jest.fn(),
      aspect: 1,
      fov: 75,
      near: 0.1,
      far: 1000,
      userData: {},
    })),
    WebGLRenderer: jest.fn(() => ({
      render: jest.fn(),
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      shadowMap: { enabled: true, type: 'PCFSoftShadowMap' },
      domElement: document.createElement('canvas'),
      setPixelRatio: jest.fn(),
      toneMapping: null,
      toneMappingExposure: 1.0,
      outputColorSpace: null,
      userData: {},
    })),
    
    // Geometry classes
    BoxGeometry: jest.fn(() => ({
      parameters: { width: 1, height: 1, depth: 1 },
      userData: {},
    })),
    PlaneGeometry: jest.fn(() => ({
      parameters: { width: 1, height: 1 },
      userData: {},
    })),
    
    // Material classes
    MeshBasicMaterial: jest.fn(() => ({
      color: { r: 0, g: 0, b: 0 },
      transparent: false,
      opacity: 1.0,
      userData: {},
    })),
    MeshPhongMaterial: jest.fn(() => ({
      color: { r: 0, g: 0, b: 0 },
      transparent: false,
      opacity: 1.0,
      userData: {},
    })),
    MeshLambertMaterial: jest.fn(() => ({
      color: { r: 0, g: 0, b: 0 },
      transparent: false,
      opacity: 1.0,
      userData: {},
    })),
    
    // Mesh and Object classes
    Mesh: jest.fn(() => ({
      position: { x: 0, y: 0, z: 0 },
      userData: {},
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
    })),
    
    // Light classes
    AmbientLight: jest.fn(() => ({
      position: { x: 0, y: 0, z: 0 },
      intensity: 0.6,
      color: { r: 0, g: 0, b: 0 },
      userData: {},
    })),
    DirectionalLight: jest.fn(() => ({
      position: { x: 0, y: 0, z: 0 },
      intensity: 1.0,
      color: { r: 1, g: 1, b: 1 },
      castShadow: false,
      shadow: { mapSize: { width: 2048, height: 2048 } },
      userData: {},
    })),
    PointLight: jest.fn(() => ({
      position: { x: 0, y: 0, z: 0 },
      intensity: 1.0,
      color: { r: 0, g: 0, b: 0 },
      distance: 100,
      userData: {},
    })),
    
    // Color and Math classes
    Color: jest.fn(() => ({ r: 0, g: 0, b: 0 })),
    Vector2: jest.fn(() => ({ x: 0, y: 0 })),
    Vector3: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
    
    // Interaction classes
    Raycaster: jest.fn(() => ({
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn(() => []),
      userData: {},
    })),
    
    // Constants
    PCFSoftShadowMap: 'PCFSoftShadowMap',
    ACESFilmicToneMapping: 'ACESFilmicToneMapping',
    SRGBColorSpace: 'SRGBColorSpace',
    
    // Fog
    Fog: jest.fn(() => ({
      color: { r: 0, g: 0, b: 0 },
      near: 1,
      far: 1000,
    })),
    
    // Grid helper
    GridHelper: jest.fn(() => ({
      position: { x: 0, y: 0, z: 0 },
      userData: {},
    })),
    
    // Canvas texture
    CanvasTexture: jest.fn(() => ({
      userData: {},
    })),
  };
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock window methods
global.window = {
  ...global.window,
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  requestAnimationFrame: global.requestAnimationFrame,
  cancelAnimationFrame: global.cancelAnimationFrame,
};

// Mock document methods
global.document = {
  ...global.document,
  createElement: jest.fn((tagName) => {
    if (tagName === 'canvas') {
      return {
        getContext: jest.fn(() => ({
          fillRect: jest.fn(),
          clearRect: jest.fn(),
          getImageData: jest.fn(() => ({ data: new Array(4) })),
          putImageData: jest.fn(),
          createImageData: jest.fn(() => []),
          setTransform: jest.fn(),
          drawImage: jest.fn(),
          save: jest.fn(),
          fillText: jest.fn(),
          restore: jest.fn(),
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          closePath: jest.fn(),
          stroke: jest.fn(),
          translate: jest.fn(),
          scale: jest.fn(),
          rotate: jest.fn(),
          arc: jest.fn(),
          fill: jest.fn(),
          measureText: jest.fn(() => ({ width: 0 })),
          transform: jest.fn(),
          rect: jest.fn(),
          quadraticCurveTo: jest.fn(),
          strokeText: jest.fn(),
        })),
        width: 800,
        height: 600,
        style: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
    }
    return {};
  }),
  getElementById: jest.fn(() => ({
    clientWidth: 800,
    clientHeight: 600,
    innerHTML: '',
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  querySelector: jest.fn(() => ({
    clientWidth: 800,
    clientHeight: 600,
    innerHTML: '',
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Create canvas element for tests
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild(canvas);
  
  // Create container for 3D tests
  const container = document.createElement('div');
  container.id = 'threejsCanvas';
  container.style.width = '500px';
  container.style.height = '500px';
  document.body.appendChild(container);
});

afterEach(() => {
  // Clean up after each test
  document.body.innerHTML = '';
}); 