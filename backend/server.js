const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8011;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'LCC Backend Server'
  });
});

// SSE endpoint for real-time logs
app.get('/logs/stream', (req, res) => {
  const { file = 'latest.log' } = req.query;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    message: 'SSE connection established',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Simulate log streaming (you can replace this with actual log reading)
  const logInterval = setInterval(() => {
    const logEntry = {
      type: 'log',
      message: `Server running - ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString()
    };
    
    res.write(`data: ${JSON.stringify(logEntry)}\n\n`);
  }, 5000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(logInterval);
    console.log('SSE client disconnected');
  });
});

// Prompt endpoint - proxy to Ollama
app.post('/prompt', async (req, res) => {
  try {
    const { prompt, agents = ['coordinator'] } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ollamaUrl = process.env.OLLAMA_SERVER_URL || 'http://localhost:11434';
    
    // Create a mock response for now (since we don't have Ollama running yet)
    const mockResponse = {
      response: `This is a mock response from the backend. Your prompt was: "${prompt}". Agents selected: ${agents.join(', ')}. In production, this would be processed by Ollama.`,
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

    // If you have Ollama running, uncomment this:
    /*
    const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2:7b-q4_K_M',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    */

    // For now, return mock response
    res.json(mockResponse);
    
  } catch (error) {
    console.error('Prompt error:', error);
    res.status(500).json({ 
      error: 'Failed to process prompt',
      details: error.message 
    });
  }
});

// Models endpoint
app.get('/api/models', async (req, res) => {
  try {
    const ollamaUrl = process.env.OLLAMA_SERVER_URL || 'http://localhost:11434';
    
    // Mock models response
    const mockModels = {
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
    };

    res.json(mockModels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LCC Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 SSE endpoint: http://localhost:${PORT}/logs/stream`);
  console.log(`💬 Prompt endpoint: http://localhost:${PORT}/prompt`);
});
