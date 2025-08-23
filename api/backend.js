// Simple backend API for GitHub Pages
// This will be called via GitHub Actions

const API_ENDPOINTS = {
  health: '/api/health',
  prompt: '/api/prompt',
  models: '/api/models'
};

// Mock backend responses for now
const mockResponses = {
  health: {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LCC Backend (GitHub Pages)',
    environment: 'production'
  },
  
  models: {
    models: [
      {
        name: 'llama2:7b-q4_K_M',
        modified_at: new Date().toISOString(),
        size: 4096
      },
      {
        name: 'mistral:7b-instruct-q4_K_M', 
        modified_at: new Date().toISOString(),
        size: 4096
      }
    ]
  }
};

// Simple API handler
async function handleAPIRequest(endpoint, data = null) {
  // Check if we're running locally
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocal) {
    // Use real API calls for local development
    try {
      switch (endpoint) {
        case 'health':
          const healthResponse = await fetch('http://localhost:8011/health');
          return await healthResponse.json();
          
        case 'prompt':
          const promptResponse = await fetch('http://localhost:8011/prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return await promptResponse.json();
          
        case 'models':
          const modelsResponse = await fetch('http://localhost:11434/api/tags');
          return await modelsResponse.json();
          
        default:
          return { error: 'Endpoint not found' };
      }
    } catch (error) {
      console.error('API request failed:', error);
      // Fall back to mock responses if local API fails
      return getMockResponse(endpoint, data);
    }
  } else {
    // Use mock responses for GitHub Pages
    return getMockResponse(endpoint, data);
  }
}

// Mock response generator
function getMockResponse(endpoint, data = null) {
  switch (endpoint) {
    case 'health':
      return mockResponses.health;
      
    case 'prompt':
      return {
        response: `This is a mock response from GitHub Pages backend. Your prompt was: "${data?.prompt || 'No prompt provided'}". In production, this would connect to Ollama.`,
        done: true,
        model: 'llama2:7b-q4_K_M',
        created_at: new Date().toISOString(),
        done_reason: 'stop',
        total_duration: 1234567890,
        load_duration: 123456789,
        prompt_eval_count: 10,
        prompt_eval_duration: 12345678,
        eval_count: 50,
        eval_duration: 123456789
      };
      
    case 'models':
      return mockResponses.models;
      
    default:
      return { error: 'Endpoint not found' };
  }
}

// Export for use in other scripts
window.LCC_API = {
  handleAPIRequest,
  endpoints: API_ENDPOINTS
};
