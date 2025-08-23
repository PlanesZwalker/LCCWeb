// Centralized model routing for agents → Ollama models
// Allows environment overrides while providing sensible defaults

'use strict';

function upper(id) {
  return (id || '').replace(/[^a-z0-9]+/gi, '_').toUpperCase();
}

function getEnvOverride(agentId, purpose) {
  // Highest precedence: per-agent env override
  const agentKey = `OLLAMA_MODEL_${upper(agentId)}`;
  if (process.env[agentKey]) return process.env[agentKey];

  // Purpose-specific overrides
  if (purpose === 'reasoning' && process.env.OLLAMA_REASONING_MODEL) return process.env.OLLAMA_REASONING_MODEL;
  if (purpose === 'code' && process.env.OLLAMA_CODE_MODEL) return process.env.OLLAMA_CODE_MODEL;
  if (purpose === 'ui' && process.env.OLLAMA_UI_MODEL) return process.env.OLLAMA_UI_MODEL;
  if (purpose === 'qa' && process.env.OLLAMA_QA_MODEL) return process.env.OLLAMA_QA_MODEL;
  if (purpose === 'coord' && process.env.OLLAMA_COORD_MODEL) return process.env.OLLAMA_COORD_MODEL;

  // Global default override
  if (process.env.OLLAMA_DEFAULT_MODEL) return process.env.OLLAMA_DEFAULT_MODEL;

  return null;
}

function getModelForAgent(agentId, purpose = null) {
  // Preferred defaults based on user's installed list (from shared context):
  // - qwen2.5-coder:32b (code-heavy)
  // - mistral-large:latest (general)
  // - deepseek-r1:32b (reasoning/coordination)
  // - llama2:7b (light fallback)
  const defaults = {
    'website-beautifier': 'mistral-large:latest',
    'fixer-agent': 'qwen2.5-coder:32b',
    'test-runner': 'mistral-large:latest',
    'project-coordinator': 'deepseek-r1:32b',
    'prompt-wave-coordinator': 'deepseek-r1:32b',
    'babylon-game-finisher': 'qwen2.5-coder:32b',
    'threejs-game-finisher': 'qwen2.5-coder:32b',
    'js2d-game-finisher': 'qwen2.5-coder:32b',
    'pdf-generator': 'mistral-large:latest',
    'screenshot-agent': 'mistral-large:latest',
    'qa-agent': 'mistral-large:latest'
  };

  // Purpose-first default
  const purposeDefaults = {
    reasoning: 'deepseek-r1:32b',
    code: 'qwen2.5-coder:32b',
    ui: 'mistral-large:latest',
    qa: 'mistral-large:latest',
    coord: 'deepseek-r1:32b'
  };

  const envOverride = getEnvOverride(agentId, purpose);
  if (envOverride) return envOverride;

  if (purpose && purposeDefaults[purpose]) return purposeDefaults[purpose];

  if (defaults[agentId]) return defaults[agentId];

  return 'qwen2.5-coder:32b'; // safe fallback if installed
}

module.exports = { getModelForAgent };


