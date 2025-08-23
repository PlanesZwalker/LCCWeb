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
function handleAPIRequest(endpoint, data = null) {
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
