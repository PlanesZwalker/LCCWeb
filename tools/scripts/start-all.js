#!/usr/bin/env node
// Start static server (8000), SSE server (8011), and ensure Ollama is running.
// On Windows/macOS/Linux, attempts best-effort process spawn without blocking.

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

function waitHttp(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const end = Date.now() + timeoutMs;
    const tryOnce = () => {
      const req = http.get(url, (res) => { res.resume(); resolve(true); });
      req.on('error', () => { if (Date.now() < end) setTimeout(tryOnce, 500); else resolve(false); });
    };
    tryOnce();
  });
}

function isUp(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
  });
}

function spawnDetached(cmd, args, name) {
  const proc = spawn(cmd, args, { stdio: 'ignore', detached: true, shell: process.platform === 'win32' });
  proc.unref();
  console.log(`[start-all] Launched ${name}: ${cmd} ${args.join(' ')}`);
}

function spawnWithLog(cmd, args, name, logFile) {
  try { fs.mkdirSync(path.dirname(logFile), { recursive: true }); } catch {}
  const out = fs.createWriteStream(logFile, { flags: 'a' });
  const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' });
  proc.stdout.pipe(out);
  proc.stderr.pipe(out);
  console.log(`[start-all] Launched ${name}: ${cmd} ${args.join(' ')} (logging to ${logFile})`);
  return proc;
}

(async function main(){
  // 1) Static server on 8000
  if (await isUp('http://localhost:8000')) {
    console.log('[start-all] 8000 already UP');
  } else {
    spawnDetached(process.platform === 'win32' ? 'python' : 'python3', ['-m', 'http.server', '8000'], 'static (8000)');
    const ok8000 = await waitHttp('http://localhost:8000');
    console.log(`[start-all] 8000 ${ok8000 ? 'UP' : 'DOWN (static server failed to start)'} `);
  }

  // 2) SSE server on 8011
  if (await isUp('http://localhost:8011/logs/list')) {
    console.log('[start-all] 8011 already UP');
  } else {
    // Use npm script as requested (equivalent to: node tools/logs-sse.js 8011)
    spawnWithLog('npm', ['run', 'logs:sse'], 'logs-sse (8011)', path.join('.agents','logs','console','sse-server.log'));
    const ok8011 = await waitHttp('http://localhost:8011/logs/list');
    console.log(`[start-all] 8011 ${ok8011 ? 'UP' : 'DOWN (check CORS or port)'} `);
  }

  // 3) Ensure Ollama daemon is running (optional)
  let ollamaReady = await isUp('http://localhost:11434/api/tags');
  if (ollamaReady) {
    console.log('[start-all] ollama already UP');
  } else {
    spawnDetached('ollama', ['serve'], 'ollama');
    ollamaReady = await waitHttp('http://localhost:11434/api/tags', 12000);
  }

  // 4) Prepare/pull models once Ollama is ready
  if (ollamaReady) {
    spawnWithLog(process.execPath, ['tools/scripts/ollama-prepare.js'], 'ollama-prepare', path.join('.agents','logs','console','ollama-prepare.log'));
  }
})();


