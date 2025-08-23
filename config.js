// Frontend Configuration
const config = {
  // Development backend (local)
  development: {
    sseBase: 'http://localhost:8011',
    ollamaUrl: 'http://localhost:11434'
  },
  
  // Production backend (GitHub Pages)
  production: {
    sseBase: window.location.origin, // Use same origin for GitHub Pages
    ollamaUrl: 'http://localhost:11434' // Local Ollama for now
  }
};

// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const currentConfig = config[isProduction ? 'production' : 'development'];

// Export configuration
window.LCC_CONFIG = currentConfig;
