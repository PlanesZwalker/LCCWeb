// Simple SSE log streamer for .agents/logs/console
// Usage: node tools/logs-sse.js [port]
// Exposes: GET /logs/stream?file=<name or relative path>
// CORS enabled so it can be used alongside python http.server

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
// No Ollama dependency - using simple rule-based responses
console.log('[logs-sse] Running without Ollama - using rule-based responses');
const { getModelForAgent } = (() => { try { return require('./llm/model-routing'); } catch (_) { return { getModelForAgent: ()=>'qwen2.5-coder:32b' }; } })();
const { setTimeout: delay } = require('timers/promises');
const fileBridgePath = path.join(__dirname, 'logs', 'file-bridge.log');

const PORT = Number(process.argv[2]) || 8001;
const LOG_ROOT = path.resolve(process.cwd(), '.agents', 'logs', 'console');
try { fs.mkdirSync(LOG_ROOT, { recursive: true }); } catch (_) {}

// --- Minimal sequential queue to ensure finish-then-next semantics ---
const jobQueue = [];
let isRunning = false;

function getDailyLogFile() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(LOG_ROOT, `daily-${today}.log`);
}

function appendJSON(lineObj) {
  const dailyLogFile = getDailyLogFile();
  const latestLogFile = path.join(LOG_ROOT, 'latest.log');
  
  // Write to daily log
  fs.appendFile(dailyLogFile, JSON.stringify(lineObj) + '\n', () => {});
  
  // Also write to latest.log for backward compatibility
  fs.appendFile(latestLogFile, JSON.stringify(lineObj) + '\n', () => {});
  
  // Check if latest.log is getting too large (> 1MB) and rotate if needed
  try {
    const stats = fs.statSync(latestLogFile);
    if (stats.size > 1024 * 1024) { // 1MB limit
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(LOG_ROOT, `latest-backup-${timestamp}.log`);
      fs.renameSync(latestLogFile, backupFile);
      console.log(`[logs-sse] Rotated large log file: ${backupFile}`);
    }
  } catch (error) {
    // File doesn't exist or other error, ignore
  }
}

function appendLog(agent, phase, text, role = 'agent') {
  appendJSON({ timestamp: new Date().toISOString(), agent, role, phase, text });
}

function classifyPrompt(prompt) {
  const p = prompt.toLowerCase();
  const tasks = [];
  const add = (agent, instruction) => tasks.push({ agent, instruction });

  // Image analysis with LLaVA
  if (/\b(image|screenshot|photo|picture|capture|écran|image|photo)\b/i.test(p) && 
      /\b(describe|analyze|explain|what|décrire|analyser|expliquer|quoi)\b/i.test(p)) {
    add('llava-agent', 'Analyser et décrire en détail les images/screenshots disponibles avec LLaVA.');
  }

  // Run tests quickly
  if (/(run|launch|start)\s+(all\s+)?tests?|test\s*suite|run\s*e2e|run\s*unit/.test(p)) {
    add('test-runner', 'Exécuter tous les tests disponibles (unit/perf/a11y).');
  }

  // Direct code/file generation intents
  const createIntent = /(ecris|écris|creer|créer|crée|create|write)\b/; 
  const typeHint = /(html|css|js)\b/;
  if (createIntent.test(p) && typeHint.test(p)) {
    const ext = (p.match(typeHint)?.[1] || 'html').toLowerCase();
    const isHeart = /(coeur|cœur|heart)/.test(p);
    const baseName = isHeart ? `heart.${ext}` : `generated.${ext}`;
    add('_direct_', `CREATE_FILE ${baseName} :: ${prompt}`);
    return tasks;
  }

  if (/dark|theme|style|harmonis(er|e)/.test(p)) {
    add('website-beautifier', 'Harmoniser le thème sombre sur toutes les pages: réduire surfaces claires, conserver glassmorphism, renforcer contraste, garder lisibilité des boutons/inputs.');
  }
  if (/css|brace|sanitize|validation|selector|duplicate/.test(p)) {
    add('fixer-agent', 'Sanitiser CSS: équilibrer accolades, supprimer doublons, normaliser variables et sélecteurs, éviter restaurations.');
  }
  if (/test|lighthouse|axe|accessibilit|perf|performance/.test(p)) {
    add('test-runner', 'Exécuter tests: fumée/performances/accessibilité; sauter Cypress par défaut.');
  }
  if (/babylon|3d|unified/.test(p)) {
    add('babylon-game-finisher', 'Améliorer visuels et appliquer les règles de gameplay dans le jeu 3D unifié; garder overlay de perfs et contrôles rapides.');
  }
  if (/three\.js|threejs|three\b/.test(p)) {
    add('threejs-game-finisher', 'Optimiser la page Three.js: rendu, passes post-processing, FPS, logs propres.');
  }
  if (/2d|canvas|classique/.test(p)) {
    add('js2d-game-finisher', 'Améliorer UI/UX et performances de la version 2D; aligner HUD et menus.');
  }

  if (tasks.length === 0) {
    add('prompt-wave-coordinator', `Coordonner une vague d'agents pour: ${prompt}`);
  }
  return tasks;
}

async function runTask(agent, instruction) {
  appendLog('coordinator', 'RUN', `Lancement de ${agent}: ${instruction}`);
  appendLog('coordinator', 'INFO', `CMD: node tools/agent-run.js ${agent} "${instruction}"`);
  const child = spawn(process.execPath, ['tools/agent-run.js', agent, instruction], {
    env: { ...process.env, TEST_RUNNER_ENABLE_CYPRESS: 'false' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const tag = agent;
  child.stdout.on('data', chunk => {
    const text = chunk.toString('utf8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    lines.forEach(line => appendLog(tag, 'INFO', line));
    // Opportunistic: surface any recent file writes
    try {
      if (fs.existsSync(fileBridgePath)) {
        const recent = fs.readFileSync(fileBridgePath, 'utf8').split(/\r?\n/).slice(-50);
        const writes = recent.filter(l => /\] WRITE: /.test(l));
        if (writes.length) {
          appendLog('coordinator', 'INFO', `Modifiés: ${writes.map(l=>l.replace(/^.*\] WRITE: /,'')).join(' | ')}`);
        }
      }
    } catch (_) {}
  });
  child.stderr.on('data', chunk => {
    const text = chunk.toString('utf8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    lines.forEach(line => appendLog(tag, 'ERROR', line));
  });
  await new Promise((resolve) => child.on('close', (code) => {
    appendLog(tag, code === 0 ? 'DONE' : 'ERROR', `Exit code: ${code}`);
    resolve();
  }));
  appendLog('coordinator', 'RUN', `Fin de ${agent}`);
}

async function processQueue() {
  if (isRunning) return;
  const job = jobQueue.shift();
  if (!job) return;
  isRunning = true;
  try {
    const { prompt, tasks } = job;
    appendLog('coordinator', 'INFO', `Job reçu pour prompt: "${prompt}"`);
    appendLog('coordinator', 'INFO', `File d'exécution: ${tasks.map(t=>`${t.agent}`).join(', ')}`);
    // Real queue execution – no placeholder discussion lines here. Agents will log their own output.
    for (const t of tasks) {
      if (t.agent === '_direct_') {
        await runDirectTask(t.instruction);
      } else {
        await runTask(t.agent, t.instruction);
      }
    }
    appendLog('coordinator', 'DONE', 'Vague terminée.');
  } catch (e) {
    appendLog('coordinator', 'ERROR', e.message || String(e));
  } finally {
    isRunning = false;
    if (jobQueue.length) processQueue();
  }
}

function ensureDirSync(dir) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
}

async function runDirectTask(instruction) {
  try {
    appendLog('coordinator', 'RUN', `Action directe: ${instruction}`);
    const m = instruction.match(/^CREATE_FILE\s+([^\s]+)\s*::\s*[\s\S]*$/);
    if (m) {
      const fileName = m[1].replace(/[^a-z0-9_.-]/gi, '_');
      const ext = (fileName.split('.').pop() || 'html').toLowerCase();
      const outDir = path.join('public', 'generated');
      const outPath = path.join(outDir, fileName);
      ensureDirSync(outDir);
      let content = '';
      if (ext === 'html') {
        const isHeart = /heart|coeur|cœur/i.test(instruction);
        const heart = isHeart ? '❤️' : '⭐';
        content = `<!DOCTYPE html>\n<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heart} Fichier généré</title><style>html,body{height:100%;margin:0}body{display:flex;align-items:center;justify-content:center;background:#0f172a;color:#e6edf7;font-family:Inter,system-ui,sans-serif} .heart{font-size:14vmin;filter:drop-shadow(0 8px 30px rgba(255,0,130,.35));}</style></head><body><div class="heart" aria-label="coeur">${heart}</div></body></html>`;
      } else if (ext === 'css') {
        content = `:root{--accent:#667eea} .pulse{animation:p 1.2s infinite alternate ease-in-out}@keyframes p{from{transform:scale(1)}to{transform:scale(1.06)}}`;
      } else if (ext === 'js') {
        content = `document.addEventListener('DOMContentLoaded',()=>{console.log('Generated file loaded')});`;
      }
      fs.writeFileSync(outPath, content, 'utf8');
      appendLog('coordinator', 'DONE', `Fichier créé: ${outPath}`);
    } else {
      appendLog('coordinator', 'ERROR', `Instruction directe inconnue: ${instruction}`);
    }
  } catch (e) {
    appendLog('coordinator', 'ERROR', `Direct task error: ${e.message}`);
  }
}

// ===== Simple rule-based responses (no Ollama) =====
function getSimpleResponse(prompt) {
  const p = prompt.toLowerCase();
  
  // Specific game rules questions (not functionalities)
  if (/\b(règles du jeu|game rules|règles de jeu|règles gameplay)\b/i.test(p)) {
    return `RÈGLES DE JEU LETTERS CASCADE CHALLENGE:

🎯 OBJECTIF: Former des mots français valides en connectant des lettres qui tombent

📋 RÈGLES DE BASE:
• Les lettres tombent du haut vers le bas
• Connectez les lettres pour former des mots français
• Seuls les mots du dictionnaire français sont acceptés
• Les mots doivent avoir au moins 3 lettres

🏆 SYSTÈME DE POINTS:
• A=1 point, B=2 points, C=3 points... Z=26 points
• Bonus combo: +50% pour chaque mot consécutif
• Multiplicateur de difficulté selon le niveau

🎮 NIVEAUX DE DIFFICULTÉ:
• Facile: Lettres plus lentes, plus de temps
• Moyen: Vitesse normale, temps standard
• Difficile: Lettres rapides, temps limité

⏰ CONDITIONS DE FIN:
• Game Over quand les lettres atteignent le bas
• Score final = somme des points + bonus combos`;
  }
  
  // Game functionalities/features questions
  if (/\b(fonctionnalités|features|fonctions|caractéristiques)\b/i.test(p)) {
    return `FONCTIONNALITÉS DU JEU LETTERS CASCADE CHALLENGE:

🎮 MODES DE JEU:
• Mode Classique: Jeu standard avec progression
• Mode Défi: Objectifs spécifiques à atteindre
• Mode Entraînement: Pratique sans limite de temps

🎛️ CONTRÔLES:
• Clavier: Flèches directionnelles ou WASD
• Souris: Clic et glisser pour connecter
• Tactile: Glisser le doigt sur mobile

💾 FONCTIONNALITÉS:
• Sauvegarde automatique des scores
• Tableau des meilleurs scores
• Mode plein écran
• Design responsive (mobile/desktop)
• 4,700+ mots français validés

🎨 PERSONNALISATION:
• 3 thèmes visuels différents
• Effets sonores optionnels
• Paramètres de difficulté ajustables`;
  }
  
  // How to play questions
  if (/\b(comment jouer|how to play|tutoriel|tutorial)\b/i.test(p)) {
    return `COMMENT JOUER À LETTERS CASCADE CHALLENGE:

🎯 DÉBUT DE PARTIE:
1. Choisissez votre niveau de difficulté
2. Les lettres commencent à tomber du haut
3. Observez les lettres disponibles

🔤 FORMATION DE MOTS:
1. Cliquez sur la première lettre de votre mot
2. Glissez vers les lettres suivantes
3. Relâchez pour valider le mot
4. Le mot doit être en français et valide

⚡ STRATÉGIES:
• Privilégiez les lettres à haute valeur (Z=26, Y=25...)
• Créez des combos en enchaînant les mots
• Surveillez la vitesse de chute
• Planifiez vos mots à l'avance

🏆 OBJECTIF:
• Marquez le plus de points possible
• Évitez que les lettres atteignent le bas
• Battez vos records personnels!`;
  }
  
  // Project structure questions
  if (/\b(structure|architecture|organisation|organization)\b/i.test(p)) {
    return `STRUCTURE DU PROJET:
- 3 versions du jeu: 2D (Canvas), 3D (Three.js), 3D unifié (Babylon.js)
- Système d'agents inter-connectés pour développement automatique
- Technologies: HTML5, CSS3, JavaScript, Three.js, Babylon.js
- Agents disponibles: test-runner, website-beautifier, fixer-agent, screenshot-agent, llava-agent, etc.`;
  }
  
  // Technology questions
  if (/\b(technologies|tech|framework|library)\b/i.test(p)) {
    return `TECHNOLOGIES UTILISÉES:
- Frontend: HTML5, CSS3, JavaScript ES6+
- 3D: Three.js, Babylon.js
- 2D: Canvas API
- Agents: Node.js, système de logs SSE
- Tests: Jest, Lighthouse, Axe
- Image Analysis: LLaVA pour description d'images`;
  }
  
  // Agent questions
  if (/\b(agent|agents|système d'agents)\b/i.test(p)) {
    return `SYSTÈME D'AGENTS DISPONIBLES:

🤖 AGENTS PRINCIPAUX:
• coordinator: Coordonne les réponses et tâches
• test-runner: Exécute les tests de qualité
• website-beautifier: Améliore l'interface utilisateur
• fixer-agent: Corrige les bugs et problèmes
• screenshot-agent: Prend des captures d'écran
• llava-agent: Analyse les images et screenshots
• project-coordinator: Gère la coordination des agents

🔄 FONCTIONNEMENT:
• Les agents communiquent via le système de logs
• Chaque agent a des compétences spécialisées
• Le coordinator orchestre les réponses
• Les agents peuvent être activés/désactivés`;
  }
  
  // Default response with more options
  return `Je peux vous aider avec plusieurs sujets:

🎮 JEU:
• "Règles du jeu" - Les règles de gameplay
• "Fonctionnalités" - Les caractéristiques du jeu
• "Comment jouer" - Guide de jeu

🏗️ PROJET:
• "Structure du projet" - Architecture
• "Technologies" - Stack technique
• "Agents" - Système d'agents

🛠️ DÉVELOPPEMENT:
• "Exécuter des tests" - Tests de qualité
• "Analyser le code" - Audit du code
• "Prendre des screenshots" - Captures d'écran

Posez votre question plus spécifiquement pour une réponse détaillée!`;
}

async function simpleDeliberation(userPrompt, agentsOverride = null) {
  const defaultAgents = ['website-beautifier', 'fixer-agent', 'test-runner', 'project-coordinator'];
  const agents = Array.isArray(agentsOverride) && agentsOverride.length ? agentsOverride : defaultAgents;
  
  // Simple agent proposals based on prompt keywords
  const proposals = agents.map(agent => {
    const p = userPrompt.toLowerCase();
    if (agent === 'website-beautifier' && /(theme|style|ui|ux|design)/.test(p)) {
      return { agent, text: 'Harmoniser le thème sombre et améliorer l\'interface utilisateur' };
    }
    if (agent === 'fixer-agent' && /(css|bug|fix|error)/.test(p)) {
      return { agent, text: 'Corriger les problèmes CSS et les erreurs détectées' };
    }
    if (agent === 'test-runner' && /(test|quality|performance)/.test(p)) {
      return { agent, text: 'Exécuter les tests de qualité et de performance' };
    }
    if (agent === 'project-coordinator') {
      return { agent, text: 'Coordonner les actions des autres agents' };
    }
    return { agent, text: 'Analyser et traiter la demande' };
  });
  
  proposals.forEach(p => {
    appendJSON({ timestamp: new Date().toISOString(), agent: p.agent, role: 'agent', phase: 'PROPOSAL', text: p.text });
  });
  
  // Simple synthesis
  const synthesis = `Plan d'action basé sur "${userPrompt}":
1. Analyser la demande
2. Identifier les agents appropriés
3. Exécuter les tâches nécessaires
4. Valider les résultats`;
  
  appendJSON({ timestamp: new Date().toISOString(), agent: 'project-coordinator', role: 'agent', phase: 'DISCUSSION', text: synthesis });
}

function sanitizeFileParam(param) {
  if (!param) return null;
  // allow only basename or relative under LOG_ROOT
  const unsafe = param.replace(/\\/g, '/');
  const rel = unsafe.startsWith('/') ? unsafe.slice(1) : unsafe;
  const resolved = path.resolve(LOG_ROOT, rel);
  if (!resolved.startsWith(LOG_ROOT)) return null;
  return resolved;
}

function writeEvent(res, data) {
  res.write(`data: ${data}\n\n`);
}

function streamFile(res, filePath) {
  let lastSize = 0;
  let closed = false;

  const sendInitial = () => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (!err && typeof content === 'string') {
        const lines = content.split(/\r?\n/).filter(Boolean);
        lines.forEach(line => writeEvent(res, line));
        lastSize = Buffer.byteLength(content, 'utf8');
      }
    });
  };

  const onChange = () => {
    if (closed) return;
    fs.stat(filePath, (err, st) => {
      if (err || !st || st.size <= lastSize) return;
      const stream = fs.createReadStream(filePath, { start: lastSize, end: st.size });
      let buf = '';
      stream.on('data', chunk => { buf += chunk.toString('utf8'); });
      stream.on('end', () => {
        buf.split(/\r?\n/).filter(Boolean).forEach(line => writeEvent(res, line));
        lastSize = st.size;
      });
    });
  };

  sendInitial();
  const watcher = fs.watch(filePath, { persistent: true }, onChange);
  res.on('close', () => { closed = true; try { watcher.close(); } catch (_) {} });
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  // CORS (allow http://localhost:8000 and same-origin)
  // Permissive CORS for local tools (avoid EventSource issues across localhost/127.0.0.1)
  const origin = req.headers && req.headers.origin ? req.headers.origin : '*';
  // More permissive CORS for localhost development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Cache-Control, Accept, Last-Event-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  // Allow SSE to stay alive behind some proxies
  res.setHeader('Cache-Control', 'no-cache');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (pathname === '/prompt' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const prompt = (data.prompt || '').toString().trim();
        if (!prompt) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ok:false, error:'Missing prompt' })); }
        appendJSON({ timestamp: new Date().toISOString(), agent: 'user', role: 'user', phase: 'PROMPT', text: prompt });

        // If prompt looks like a math expression, answer directly
        const expr = prompt.replace(/[=?]/g, '').trim();
        const isArithmetic = /^[0-9+\-*/().%\s]+$/.test(expr) && /[0-9]/.test(expr);
        if (isArithmetic) {
          try {
            // eslint-disable-next-line no-new-func
            const value = Function('return (' + expr + ')')();
            appendJSON({ timestamp: new Date().toISOString(), agent: 'coordinator', role: 'agent', phase: 'ANSWER', text: `${expr} = ${value}` });
          } catch (e) {
            appendJSON({ timestamp: new Date().toISOString(), agent: 'coordinator', role: 'agent', phase: 'ERROR', text: `Erreur de calcul: ${e.message}` });
          }
        } else {
          // Greetings / small talk → quick answer
          if (/\b(bonjour|salut|hello|hi)\b/i.test(prompt)) {
            appendJSON({ timestamp: new Date().toISOString(), agent: 'coordinator', role: 'agent', phase: 'ANSWER', text: 'Bonjour ! Dites-moi la tâche à exécuter (ex: “run all tests”, “moderniser le thème sombre”, “crée un fichier html avec un coeur”).' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true }));
          }

          // First classify prompt to detect direct actions
          const tasks = classifyPrompt(prompt);
          appendLog('coordinator', 'INFO', `Tâches proposées: ${tasks.map(t=>`${t.agent}`).join(', ') || 'aucune'}`);

          // If it's a direct action (e.g., CREATE_FILE), do NOT run deliberation
          const hasDirect = tasks.some(t => t.agent === '_direct_');

                     // Decide between Q&A and code/task execution
           const isQuestion = /\?|\b(what|which|quel|quelle|que|qu'est|explique|explain|défin|define|doc|gdd|game design document|model|mod[eè]le|règles|rules|comment|how|comment ça marche|how does it work|gameplay|mécaniques|mechanics|code|structure|architecture|technologies|tech)\b/i.test(prompt);
           if (isQuestion && !hasDirect) {
             // Use simple rule-based responses instead of Ollama
             const response = getSimpleResponse(prompt);
             appendJSON({ timestamp: new Date().toISOString(), agent: 'coordinator', role: 'agent', phase: 'ANSWER', text: response });
           } else {
             if (!hasDirect) {
               // Simple deliberation without Ollama
               const agentsOverride = Array.isArray(data.agents) ? data.agents.filter(Boolean) : null;
               if (agentsOverride && agentsOverride.length) appendLog('coordinator', 'INFO', `Agents sélectionnés par l'utilisateur: ${agentsOverride.join(', ')}`);
               await simpleDeliberation(prompt, agentsOverride);
             }
            // Then queue concrete tasks derived from the prompt for execution
            jobQueue.push({ prompt, tasks });
            processQueue();
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok:false, error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/logs/stream') {
    const fileParam = query.file || 'latest.log';
    const filePath = sanitizeFileParam(fileParam) || path.join(LOG_ROOT, path.basename(fileParam));
    // Ensure file exists so SSE can open even when empty
    try { if (!fs.existsSync(filePath)) { fs.mkdirSync(path.dirname(filePath), { recursive: true }); fs.writeFileSync(filePath, ''); } } catch (_) {}
    // Important: write CORS headers again here because writeHead overwrites previous headers
    // More permissive CORS for localhost development
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Expose-Headers': 'Content-Type, Cache-Control, Connection',
      'X-Accel-Buffering': 'no'
    });
    streamFile(res, filePath);
    return;
  }

  if (pathname === '/logs/list') {
    try {
      const entries = fs.readdirSync(LOG_ROOT, { withFileTypes: true })
        .filter(d => d.isFile())
        .map(d => d.name)
        .filter(name => /\.(log|jsonl)$/i.test(name))
        .map(name => ({ name, full: path.join(LOG_ROOT, name) }));
      // Sort by mtime desc
      const withTimes = entries.map(e => {
        try { return { name: e.name, mtime: fs.statSync(e.full).mtimeMs }; } catch { return { name: e.name, mtime: 0 }; }
      }).sort((a,b) => b.mtime - a.mtime);
      const files = withTimes.map(e => e.name);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ files }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // JSONL tail endpoint for fallback polling
  if (pathname === '/logs/tail') {
    const fileParam = query.file || 'latest.log';
    const from = Number(query.offset || 0);
    const filePath = sanitizeFileParam(fileParam) || path.join(LOG_ROOT, path.basename(fileParam));
    try {
      let st;
      try { st = fs.statSync(filePath); } catch (e) {
        if (e && e.code === 'ENOENT') { fs.mkdirSync(path.dirname(filePath), { recursive: true }); fs.writeFileSync(filePath, ''); st = fs.statSync(filePath); }
        else throw e;
      }
      const start = Math.max(0, Math.min(from, st.size));
      const stream = fs.createReadStream(filePath, { start });
      let buf = '';
      stream.on('data', c => { buf += c.toString('utf8'); });
      stream.on('end', () => {
        const lines = buf.split(/\r?\n/).filter(Boolean);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ lines, size: st.size }));
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (pathname === '/logs/changes') {
    try {
      if (!fs.existsSync(fileBridgePath)) { res.writeHead(200, { 'Content-Type': 'application/json'}); return res.end(JSON.stringify({ files: [] })); }
      const raw = fs.readFileSync(fileBridgePath, 'utf8');
      const lines = raw.split(/\r?\n/).filter(Boolean);
      const changes = lines
        .map(l => {
          const m = l.match(/^\[(.*?)\]\s+(WRITE|DELETE|RESTORE|BACKUP):\s+(.*)$/);
          return m ? { timestamp: m[1], action: m[2], path: m[3] } : null;
        })
        .filter(Boolean)
        .slice(-500);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ files: changes }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  if (pathname === '/logs/clear' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const name = (data.file || 'latest.log').toString();
        const filePath = sanitizeFileParam(name) || path.join(LOG_ROOT, path.basename(name));
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '');
        } else {
          fs.truncateSync(filePath, 0);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok:false, error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/logs/ingest' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const now = new Date().toISOString();
        const agent = (data.agent || 'browser-console').toString();
        const role = (data.role || 'console').toString();
        const phase = (data.phase || 'INFO').toString().toUpperCase();
        const text = (data.text || '').toString();
        const fileName = (data.file || 'latest.log').toString();
        const filePath = sanitizeFileParam(fileName) || path.join(LOG_ROOT, path.basename(fileName));
        const entry = { timestamp: now, agent, role, phase, text, meta: data.meta || null };
        fs.appendFile(filePath, JSON.stringify(entry) + '\n', () => {});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok:false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`[logs-sse] Listening on http://localhost:${PORT} (root: ${LOG_ROOT})`);
});


