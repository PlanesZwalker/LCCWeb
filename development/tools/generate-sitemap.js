#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fileBridge = require('./file-bridge');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

function isHtml(file) {
  return file.toLowerCase().endsWith('.html');
}

function shouldSkip(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.startsWith('.agents/') || normalized.includes('/legacy-root/')) return true;
  if (normalized.endsWith('-backup.html') || normalized.includes('.backup')) return true;
  return fileBridge.shouldIgnore(relPath);
}

function walkHtmlFiles(dirAbs, baseRel = '') {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    const relFromRoot = path.relative(PROJECT_ROOT, abs).replace(/\\/g, '/');
    const relFromPublic = path.relative(PUBLIC_DIR, abs).replace(/\\/g, '/');
    if (shouldSkip(relFromRoot)) continue;
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(abs, path.join(baseRel, entry.name)));
    } else if (isHtml(entry.name)) {
      results.push({ abs, relFromRoot, relFromPublic });
    }
  }
  return results;
}

function classify(relFromPublic) {
  const p = relFromPublic.replace(/\\/g, '/');
  if (p.startsWith('docs/')) return 'Documentation';
  if (p.includes('3d')) return 'Jeux 3D';
  if (p.includes('2d')) return 'Jeux 2D';
  if (p.startsWith('tests') || p.includes('/tests/')) return 'Tests';
  return 'Site';
}

function buildHtml(groups) {
  const now = new Date().toISOString();
  const sections = Object.keys(groups).sort().map(cat => {
    const items = groups[cat]
      .sort((a, b) => a.relFromPublic.localeCompare(b.relFromPublic))
      .map(item => {
        const url = `public/${item.relFromPublic}`.replace(/\\/g, '/');
        const name = item.relFromPublic;
        return `<li><a href="${url}">${name}</a></li>`;
      }).join('\n');
    return `
    <section class="sitemap-section">
      <h2>${cat}</h2>
      <ul class="sitemap-list">${items}</ul>
    </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Plan du site</title>
  <link rel="stylesheet" href="css/base-theme.css" />
  <style>
    .container { max-width: 1100px; margin: 0 auto; padding: var(--space-6); }
    header { margin-bottom: var(--space-6); }
    .sitemap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); }
    .sitemap-section { background: var(--surface-2); border-radius: var(--radius-3); box-shadow: var(--shadow-1); padding: var(--space-4); }
    .sitemap-list { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }
    .sitemap-list a { color: var(--brand-3); text-decoration: none; }
    .sitemap-list a:hover { text-decoration: underline; }
    footer { margin-top: var(--space-6); opacity: .8; font-size: .9rem; }
  </style>
  <script defer src="js/navigation.js"></script>
  <script defer src="js/credits.js"></script>
  <script>window.gameInitialized = true;</script>
  <link rel="manifest" href="manifest.json" />
  <script>
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('service-worker.js').catch(()=>{}); }
  </script>
  <meta name="description" content="Plan du site – toutes les pages accessibles du projet" />
  <meta name="robots" content="index,follow" />
</head>
<body>
  <nav id="global-nav"></nav>
  <main class="container">
    <header>
      <h1>Plan du site</h1>
      <p>Toutes les pages HTML détectées automatiquement dans le dossier public.</p>
    </header>
    <div class="sitemap-grid">
      ${sections}
    </div>
    <footer>
      Généré le ${now}
    </footer>
  </main>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('❌ Dossier public/ introuvable');
    process.exit(1);
  }
  const files = walkHtmlFiles(PUBLIC_DIR);
  const filtered = files.filter(f => f.relFromPublic !== 'sitemap.html');
  const groups = {};
  for (const f of filtered) {
    const cat = classify(f.relFromPublic);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(f);
  }
  const html = buildHtml(groups);
  const outPath = path.join(PUBLIC_DIR, 'sitemap.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✅ Plan du site généré: public/sitemap.html (${filtered.length} pages)`);
}

if (require.main === module) {
  main();
}


