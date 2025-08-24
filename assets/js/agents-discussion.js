/*
  Agents Discussion Viewer
  - Lists recent console logs from .agents/logs/console/
  - Streams/loads latest log and renders messages as chat bubbles
  Notes: This is a client-only viewer; server must expose the logs via HTTP or static copy.
*/
(function () {
  const chatEl = document.getElementById('chat');
  const logFilesEl = document.getElementById('logFiles');
  const currentSourceEl = document.getElementById('currentSource');
  const refreshBtn = document.getElementById('refreshBtn');
  const loadLatestBtn = document.getElementById('loadLatest');
  const toggleAutoBtn = document.getElementById('toggleAuto');
  const autoLabel = document.getElementById('autoLabel');
  const refreshInfo = document.getElementById('refreshInfo');
  const legendEl = document.getElementById('legend');
  const promptForm = document.getElementById('promptForm');
  const promptInput = document.getElementById('promptInput');
  const sendPromptBtn = document.getElementById('sendPrompt');
  const copySourceBtn = document.getElementById('copySource');
  const currentSourceElPath = document.getElementById('currentSourcePath');
  // Filters and playback controls
  const phaseSel = document.getElementById('phaseFilter');
  const agentSel = document.getElementById('agentFilter');
  const searchInput = document.getElementById('searchInput');
  const autoScrollEl = document.getElementById('autoScroll');
  const pauseBtn = document.getElementById('pauseLive');
  // Test interface elements
  const tiOutput = document.getElementById('tiOutput');
  const tiProgress = document.getElementById('tiProgress');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const btnCode = document.getElementById('btnCode');
  const btnPerf = document.getElementById('btnPerf');
  const btnTodo = document.getElementById('btnTodo');
  const btnReview = document.getElementById('btnReview');
  const btnRecom = document.getElementById('btnRecom');

  let autoTimer = null;
  let currentLogPath = null;
  let processedLineCount = 0;
  let sse = null;
  let pendingLines = [];
  let allMessages = [];
  let paused = false;
  const enableSSE = (() => {
    try {
      const qp = new URLSearchParams(window.location.search);
      if (qp.get('sse') === '1') return true;
      const ls = localStorage.getItem('agents_sse');
      return ls === '1';
    } catch (_) { return false; }
  })();

  let demoEnabled = (() => {
    try {
      const qp = new URLSearchParams(window.location.search);
      if (qp.get('demo') === '1') return true;
      const ls = localStorage.getItem('agents_demo');
      return ls === '1';
    } catch (_) { return false; }
  })();

  // Agent nicknames, colors and shapes
  const agentMap = {
    'user': { nickname: 'Vous', color: '#10b981', shape: 'shape-circle', icon: 'fa-user' },
    'prompt-wave-coordinator': { nickname: 'Wave Coord', color: '#06b6d4', shape: 'shape-diamond', icon: 'fa-wave-square' },
    'website-beautifier': { nickname: 'Beautifier', color: '#667eea', shape: 'shape-circle', icon: 'fa-wand-magic-sparkles' },
    'fixer-agent': { nickname: 'Fixer', color: '#10b981', shape: 'shape-square', icon: 'fa-screwdriver-wrench' },
    'test-runner': { nickname: 'Tester', color: '#f59e0b', shape: 'shape-circle', icon: 'fa-vial' },
    'project-coordinator': { nickname: 'Coordinator', color: '#f093fb', shape: 'shape-diamond', icon: 'fa-diagram-project' },
    'babylon-game-finisher': { nickname: 'Babylon Finisher', color: '#a78bfa', shape: 'shape-square', icon: 'fa-cube' },
    'threejs-game-finisher': { nickname: 'Three Finisher', color: '#22d3ee', shape: 'shape-circle', icon: 'fa-mountain' },
    'screenshot-agent': { nickname: 'Screener', color: '#38bdf8', shape: 'shape-circle', icon: 'fa-camera' },
  };

  function agentMeta(agentId) {
    return agentMap[agentId] || { nickname: agentId || 'agent', color: '#94a3b8', shape: 'shape-square' };
  }

  function renderLegend() { /* removed legend section; keep no-op for compatibility */ }

  // Populate agent filter options
  function populateAgentFilter() {
    if (!agentSel) return;
    // Clear except first option
    while (agentSel.options.length > 1) agentSel.remove(1);
    Object.entries(agentMap).forEach(([id, meta]) => {
      const opt = document.createElement('option');
      opt.value = id; opt.textContent = meta.nickname || id;
      agentSel.appendChild(opt);
    });
  }

  // Console logs directories to probe (root-first, then relative to /public)
  const consoleBases = ['/.agents/logs/console/', '.agents/logs/console/'];
  let activeConsoleBase = null;

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function passesFilters(msg) {
    const p = (phaseSel?.value || '').trim();
    const a = (agentSel?.value || '').trim();
    const q = (searchInput?.value || '').toLowerCase();
    if (p && (msg.phase || '').toUpperCase() !== p.toUpperCase()) return false;
    if (a && (msg.agent || '') !== a) return false;
    if (q && !(msg.text || msg.message || '').toLowerCase().includes(q)) return false;
    return true;
  }

  function safeAppend(node) {
    if (paused) return; 
    chatEl.appendChild(node);
    if (autoScrollEl?.checked) chatEl.scrollTop = chatEl.scrollHeight;
  }

  function renderMessage(msg) {
    allMessages.push(msg);
    if (!passesFilters(msg)) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'bubble ' + (msg.role || 'agent');
    const meta = document.createElement('div');
    meta.className = 'meta';
    const aMeta = agentMeta(msg.agent);
    const avatar = document.createElement('span');
    avatar.className = `avatar ${aMeta.shape}`;
    avatar.style.background = aMeta.color;
    const iconEl = document.createElement('i');
    iconEl.className = `fas ${aMeta.icon || 'fa-robot'}`;
    avatar.appendChild(iconEl);
    const metaText = document.createElement('span');
    metaText.textContent = `[${msg.timestamp || ''}] ${aMeta.nickname}${msg.phase ? ' – ' + msg.phase : ''}`;
    meta.appendChild(avatar);
    meta.appendChild(metaText);
    const content = document.createElement('div');
    content.innerHTML = escapeHtml(msg.text || msg.message || '').replace(/\n/g, '<br>');
    const phase = document.createElement('span');
    if (msg.phase) { phase.className = 'phase-tag'; phase.textContent = msg.phase; }
    wrapper.appendChild(meta);
    if (msg.phase) wrapper.appendChild(phase);
    wrapper.appendChild(content);
    safeAppend(wrapper);
  }

  function clearChat() {
    chatEl.innerHTML = '';
  }

  function scrollToEnd() {
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  // ---- Inline Test Interface (mixin) ----
  function tiLog(message, type='info') {
    if (!tiOutput) return;
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    tiOutput.textContent += `[${timestamp}] ${prefix} ${message}\n`;
    tiOutput.scrollTop = tiOutput.scrollHeight;
  }
  async function tiSimulateProgress(duration=1800) {
    if (!tiProgress) return;
    const start = Date.now();
    return new Promise(resolve => {
      (function step(){
        const p = Math.min(((Date.now()-start)/duration)*100, 100);
        tiProgress.style.width = `${p}%`;
        if (p < 100) requestAnimationFrame(step); else resolve();
      })();
    });
  }
  function bindTestActions(){
    if (btnAnalyze) btnAnalyze.onclick = async ()=>{ tiLog('Starting project analysis…'); await tiSimulateProgress(1500); tiLog('Project analysis completed!', 'success'); };
    if (btnCode) btnCode.onclick = async ()=>{ tiLog('Generating optimized code…'); await tiSimulateProgress(1800); tiLog('Code generation completed!', 'success'); };
    if (btnPerf) btnPerf.onclick = async ()=>{ tiLog('Optimizing performance…'); await tiSimulateProgress(2000); tiLog('Performance optimization done!', 'success'); };
    if (btnTodo) btnTodo.onclick = async ()=>{ tiLog('Implementing TODO item…'); await tiSimulateProgress(2200); tiLog('TODO implemented!', 'success'); };
    if (btnReview) btnReview.onclick = async ()=>{ tiLog('Reviewing file js/babylon-enhanced-game.js…'); await tiSimulateProgress(1600); tiLog('File review complete with suggestions.', 'success'); };
    if (btnRecom) btnRecom.onclick = async ()=>{ tiLog('Computing recommendations…'); await tiSimulateProgress(1700); tiLog('Recommendations generated!', 'success'); };
  }

  async function listLogFiles() {
    logFilesEl.textContent = 'Chargement…';
    for (const base of consoleBases) {
      let fromIndex = [];
      let fromListing = [];
      // 1) index.json if present
      try {
        const res = await fetch(base + 'index.json', { cache: 'no-store' });
        if (res.ok) {
          const files = await res.json();
          if (Array.isArray(files)) fromIndex = files;
        }
      } catch (_) {}
      // 2) Parse directory listing HTML (merge with index.json)
      try {
        const res = await fetch(base, { cache: 'no-store' });
        if (res.ok) {
          const html = await res.text();
          fromListing = [...html.matchAll(/href="([^\"]+\.log)"/g)].map(m => m[1]);
        }
      } catch (_) {}
      const merged = Array.from(new Set([...(fromIndex || []), ...(fromListing || [])])).filter(Boolean);
      if (merged.length) {
        activeConsoleBase = base;
        // Prefer latest.log first, then others sorted by name desc
        const latestFirst = [
          ...merged.filter(n => /latest\.log$/i.test(n)),
          ...merged.filter(n => !/latest\.log$/i.test(n)).sort().reverse()
        ];
        renderFileList(latestFirst);
        return;
      }
    }
    // 3) Fallback
    activeConsoleBase = consoleBases[0];
    renderFileList(['latest.log']);
  }

  function renderFileList(files) {
    logFilesEl.innerHTML = '';
    files.forEach(name => {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = name;
      a.addEventListener('click', e => {
        e.preventDefault();
        [...logFilesEl.querySelectorAll('a')].forEach(x=>x.classList.remove('active'));
        a.classList.add('active');
        loadLog(name);
      });
      logFilesEl.appendChild(a);
    });
    // Mark latest as active by default
    const first = logFilesEl.querySelector('a');
    if (first) first.classList.add('active');
  }

  async function loadLog(nameOrPath) {
    const base = activeConsoleBase || consoleBases[0];
    const path = nameOrPath.includes('/') ? nameOrPath : base + nameOrPath;
    currentLogPath = path;
    currentSourceEl.textContent = 'Source: ' + path;
    clearChat();
    processedLineCount = 0;
    closeSSE();
    try {
      await fetchAndAppend(path, true);
      if (enableSSE) tryInitSSE(path);
    } catch (err) {
      renderMessage({ text: 'Impossible de charger le log: ' + err.message, agent: 'viewer', role: 'system' });
    }
  }

  async function fetchAndAppend(path, isInitial = false) {
    const res = await fetch(path + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const start = isInitial ? 0 : processedLineCount;
    for (let i = start; i < lines.length; i++) pendingLines.push(lines[i]);
    drainPendingGroups();
    processedLineCount = lines.length;
    if (lines.length > start) scrollToEnd();
  }

  function parseLogLine(line) {
    try {
      const msg = JSON.parse(line);
      if (msg && (msg.text || msg.message)) return msg;
    } catch (_) {}
    // Fallback: [timestamp] agent phase: message
    const m = line.match(/^\[([^\]]+)\]\s*(\w+)?(?:\s*[-–]\s*(\w+))?\s*:?\s*(.*)$/);
    if (m) {
      return {
        timestamp: m[1],
        agent: (m[2] || 'log').toLowerCase(),
        phase: m[3] || undefined,
        text: m[4] || line,
        role: 'agent'
      };
    }
    return { text: line, agent: 'log', role: 'system' };
  }

  const headerRe = /^\[([^\]]+)\]\s*(.+?)\s*[–-]\s*(\w+)\s*$/;
  const displayToId = {
    'Vous': 'user',
    'Wave Coord': 'prompt-wave-coordinator',
    'Beautifier': 'website-beautifier',
    'Fixer': 'fixer-agent',
    'Tester': 'test-runner',
    'Coordinator': 'project-coordinator',
    'Babylon Finisher': 'babylon-game-finisher',
    'Three Finisher': 'threejs-game-finisher',
    'Screener': 'screenshot-agent',
    'Screenshot': 'screenshot-agent'
  };

  function drainPendingGroups() {
    if (!pendingLines.length) return;
    const headerIdxs = [];
    for (let i = 0; i < pendingLines.length; i++) if (headerRe.test(pendingLines[i])) headerIdxs.push(i);
    if (!headerIdxs.length) return;
    // Process all complete groups, keep the last header chunk pending
    const lastCompleteIdx = headerIdxs.length > 1 ? headerIdxs[headerIdxs.length - 2] : -1;
    for (let h = 0; h < headerIdxs.length - 1; h++) {
      const start = headerIdxs[h];
      const end = headerIdxs[h + 1];
      renderGroup(start, end);
    }
    // Trim processed lines, keep last header chunk if any
    if (headerIdxs.length > 1) {
      pendingLines = pendingLines.slice(headerIdxs[headerIdxs.length - 1]);
    }
  }

  function renderGroup(start, end) {
    const header = pendingLines[start];
    const body = pendingLines.slice(start + 1, end);
    const m = header.match(headerRe);
    if (!m) return;
    const timestamp = m[1];
    const displayName = m[2].trim();
    const phase = m[3].trim();
    // Drop duplicated phase line at start of body
    const bodyLines = body.slice();
    if (bodyLines.length && bodyLines[0].trim().toUpperCase() === phase.toUpperCase()) bodyLines.shift();
    const text = bodyLines.join('\n').trim() || phase;
    const agentId = displayToId[displayName] || displayName.toLowerCase();
    renderMessage({ timestamp, agent: agentId, phase, text, role: 'agent' });
  }

  function setConnectionStatus(connected){
    const el = document.getElementById('connStatus');
    if(!el) return;
    el.textContent = connected ? 'Connected' : 'Disconnected';
    el.classList.toggle('badge-connected', connected);
    el.classList.toggle('badge-disconnected', !connected);
  }

  function tryInitSSE(path) {
    // Optional SSE endpoint; prefer dedicated SSE server to avoid 404s from static server
    const fileOnly = encodeURIComponent(path.split('/').pop());
    const candidates = [
      `http://127.0.0.1:8011/logs/stream?file=${fileOnly}`,
      `http://localhost:8011/logs/stream?file=${fileOnly}`
    ];
    let index = 0;
    const tryNext = () => {
      if (index >= candidates.length) return; // give up, polling remains active
      const url = candidates[index++];
      let opened = false;
      let ev;
      try { ev = new EventSource(url); } catch (_) { return tryNext(); }
      const timer = setTimeout(() => {
        if (!opened) { try { ev.close(); } catch (_) {} ; tryNext(); }
      }, 2000);
      ev.onopen = () => { opened = true; clearTimeout(timer); sse = ev; if (refreshInfo) refreshInfo.textContent = 'stream'; setConnectionStatus(true); };
      ev.onmessage = (e) => { const msg = parseLogLine(e.data); renderMessage(msg); scrollToEnd(); };
      ev.onerror = () => { setConnectionStatus(false); if (!opened) { clearTimeout(timer); try { ev.close(); } catch (_) {}; tryNext(); } };
    };
    tryNext();
  }

  function closeSSE() { try { sse?.close(); } catch (_) {} finally { sse = null; } }

  function toggleAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
      autoLabel.textContent = 'Auto (off)';
      refreshInfo.textContent = 'manuelle';
      return;
    }
    autoTimer = setInterval(() => {
      if (currentLogPath) fetchAndAppend(currentLogPath, false).catch(() => {});
    }, 1000);
    autoLabel.textContent = 'Auto (on)';
    refreshInfo.textContent = 'auto 1s';
  }

  refreshBtn?.addEventListener('click', () => currentLogPath && loadLog(currentLogPath));
  loadLatestBtn?.addEventListener('click', () => loadLog('latest.log'));
  toggleAutoBtn?.addEventListener('click', toggleAuto);

  // Playback controls
  autoScrollEl?.addEventListener('change', () => { if (autoScrollEl.checked) chatEl.scrollTop = chatEl.scrollHeight; });
  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    if (pauseBtn) pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (!paused && autoScrollEl?.checked) chatEl.scrollTop = chatEl.scrollHeight;
  });

  copySourceBtn?.addEventListener('click', async () => {
    try {
      const text = (currentSourceElPath?.textContent || '').trim();
      if (!text) return;
      await navigator.clipboard.writeText(text);
      copySourceBtn.classList.add('badge-connected');
      setTimeout(()=>copySourceBtn.classList.remove('badge-connected'), 600);
    } catch(_) {}
  });

  // Filters
  function rerenderFromAll() {
    clearChat();
    allMessages.forEach(renderMessage);
  }
  phaseSel?.addEventListener('change', rerenderFromAll);
  agentSel?.addEventListener('change', rerenderFromAll);
  searchInput?.addEventListener('input', () => {
    // debounce minimal
    clearTimeout(rerenderFromAll._t);
    rerenderFromAll._t = setTimeout(rerenderFromAll, 100);
  });

  function emitUserPrompt() {
    const text = (promptInput?.value || '').trim();
    if (!text) return;
    // Display locally
    renderMessage({ timestamp: new Date().toISOString(), agent: 'user', role: 'user', text, phase: 'PROMPT' });
    scrollToEnd();
    try { localStorage.setItem('agents_user_last_prompt', text); } catch (_) {}
    // Try server prompt endpoint (SSE helper) then fall back silently
    try {
      fetch('http://127.0.0.1:8011/prompt', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      }).catch(() => {});
    } catch (_) {}
    promptInput.value = '';
    try { promptInput.focus(); } catch(_) {}
    // Force disable client-side demo when SSE is enabled
    if (enableSSE) demoEnabled = false;
    if (demoEnabled) {
      simulateAgentWave(text);
    } else {
      // Real mode: rely on logs written by agents; no client-side simulation
      renderMessage({ timestamp: new Date().toISOString(), agent: 'viewer', role: 'system', phase: 'INFO', text: 'En attente des réponses des agents (via logs)…' });
    }
  }

  function simulateAgentWave(promptText) {
    // Simple, client-side simulation so user sees activity
    const now = () => new Date().toISOString();
    setTimeout(() => {
      renderMessage({ timestamp: now(), agent: 'prompt-wave-coordinator', role: 'agent', phase: 'PROPOSAL', text: `Analyse du prompt: "${promptText}"` });
      scrollToEnd();
    }, 300);
    setTimeout(() => {
      renderMessage({ timestamp: now(), agent: 'website-beautifier', role: 'agent', phase: 'DISCUSSION', text: 'Plan: harmoniser typographie, nav, panneaux verre, et boutons sur pages ciblées.' });
      scrollToEnd();
    }, 900);
    setTimeout(() => {
      renderMessage({ timestamp: now(), agent: 'fixer-agent', role: 'agent', phase: 'DISCUSSION', text: 'Vérifier duplications CSS et équilibrer accolades avant écriture.' });
      scrollToEnd();
    }, 1400);
    setTimeout(() => {
      renderMessage({ timestamp: now(), agent: 'project-coordinator', role: 'agent', phase: 'CONSENSUS', text: 'Consensus atteint (≥70%). Exécution approuvée.' });
      scrollToEnd();
    }, 1900);
    setTimeout(() => {
      renderMessage({ timestamp: now(), agent: 'test-runner', role: 'agent', phase: 'DECISION', text: 'Tests de fumée: OK. Pages harmonisées.' });
      scrollToEnd();
    }, 2400);
  }

  sendPromptBtn?.addEventListener('click', emitUserPrompt);
  promptForm?.addEventListener('submit', (e) => { e.preventDefault(); emitUserPrompt(); });
  promptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); emitUserPrompt(); }
  });

  // Enable focus and typing even if parent panels use pointer-events patterns
  try { promptInput?.setAttribute('tabindex', '0'); } catch (_) {}

  // Init
  renderLegend();
  populateAgentFilter();
  listLogFiles().then(() => loadLog('latest.log')).then(() => toggleAuto());
  bindTestActions();
})();


