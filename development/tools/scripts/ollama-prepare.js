#!/usr/bin/env node
// Best-effort model preparation for Ollama: pulls coordinator/qa/code/ui models.

const { spawn } = require('child_process');

function pull(model) {
  return new Promise((resolve) => {
    if (!model) return resolve();
    const p = spawn('ollama', ['pull', model], { stdio: 'inherit', shell: process.platform === 'win32' });
    p.on('exit', () => resolve());
    p.on('error', () => resolve());
  });
}

(async function main(){
  // Read env overrides; fallback to light-weight defaults
  const list = [
    process.env.OLLAMA_COORD_MODEL,
    process.env.OLLAMA_QA_MODEL,
    process.env.OLLAMA_CODE_MODEL,
    process.env.OLLAMA_UI_MODEL,
  ].filter(Boolean);

  const defaults = ['deepseek-r1:7b', 'qwen2.5-coder:7b', 'mistral:latest'];
  const models = Array.from(new Set(list.length ? list : defaults));

  console.log('[ollama-prepare] Pulling models:', models.join(', '));
  for (const m of models) {
    await pull(m);
  }
  console.log('[ollama-prepare] Done');
})();


