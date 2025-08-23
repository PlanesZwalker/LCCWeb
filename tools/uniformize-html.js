#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function listHtmlFiles(rootDir) {
  const results = [];
  (function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.html?$/i.test(e.name)) results.push(p);
    }
  })(rootDir);
  return results;
}

function ensureStringOnce(html, snippet, where) {
  if (html.includes(snippet)) return html;
  return where(html, snippet);
}

function insertInHead(html, snippet) {
  return html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${snippet}`);
}

function insertAfterBodyOpen(html, snippet) {
  return html.replace(/<body[^>]*>/i, (m) => `${m}\n    ${snippet}`);
}

function insertBeforeBodyClose(html, snippet) {
  return html.replace(/<\/body>/i, `${snippet}\n  </body>`);
}

function upsertAttr(tagOpen, attr, value) {
  if (new RegExp(`${attr}=`).test(tagOpen)) {
    return tagOpen.replace(new RegExp(`${attr}=("|')[^"']*("|')`), `${attr}="${value}"`);
  }
  // inject attr before closing '>'
  return tagOpen.replace(/>$/, ` ${attr}="${value}">`);
}

function ensureBodyDataTheme(html) {
  return html.replace(/<body[^>]*>/i, (m) => upsertAttr(m, 'data-theme', 'dark'));
}

function getPageTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (m) return m[1].trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return h1[1].trim();
  return 'Bienvenue';
}

function hasSelector(html, re) {
  return re.test(html);
}

function uniformize(html) {
  let changed = false;

  // Ensure Font Awesome CDN (once)
  const faCdn = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">';
  if (!html.includes('font-awesome') && !html.includes('fontawesome') && !html.includes('fa-')) {
    const newer = ensureStringOnce(html, faCdn, (h, s) => insertInHead(h, s));
    changed = changed || newer !== html; html = newer;
  }

  // Ensure base-theme.css is linked early
  const baseTheme = '<link rel="stylesheet" href="css/base-theme.css">';
  if (!html.includes('href="css/base-theme.css"')) {
    const newer = ensureStringOnce(html, baseTheme, (h, s) => insertInHead(h, s));
    changed = changed || newer !== html; html = newer;
  }

  // Ensure shared.css & theme-dark.css
  const sharedCss = '<link rel="stylesheet" href="css/shared.css">';
  if (!html.includes('href="css/shared.css"')) {
    const newer = ensureStringOnce(html, sharedCss, (h, s) => insertInHead(h, s));
    changed = changed || newer !== html; html = newer;
  }
  const darkCss = '<link rel="stylesheet" href="css/theme-dark.css">';
  if (!html.includes('href="css/theme-dark.css"')) {
    const newer = ensureStringOnce(html, darkCss, (h, s) => insertInHead(h, s));
    changed = changed || newer !== html; html = newer;
  }

  // Ensure navigation container and navigation.js
  if (!hasSelector(html, /<div[^>]+class=["'][^"']*navigation-container/i)) {
    const nav = '<div class="navigation-container"></div>';
    const newer = ensureStringOnce(html, nav, (h, s) => insertAfterBodyOpen(h, s));
    changed = changed || newer !== html; html = newer;
  }
  if (!/\bsrc=["']js\/navigation\.js["']/.test(html)) {
    const navJs = '  <script src="js/navigation.js"></script>';
    const newer = ensureStringOnce(html, navJs, (h, s) => insertBeforeBodyClose(h, `\n${s}`));
    changed = changed || newer !== html; html = newer;
  }

  // Ensure hero block
  if (!hasSelector(html, /<section[^>]*class=["'][^"']*hero/i)) {
    const title = getPageTitle(html);
    const hero = `
    <section class="hero glass-panel" aria-label="En-tête">
      <div class="hero-content">
        <h1>${title}</h1>
        <p class="subtitle">Explorez notre contenu</p>
        <div class="actions">
          <a href="index.html" class="btn primary" aria-label="Retour à l'accueil"><i class="fas fa-home"></i> Accueil</a>
          <a href="sitemap.html" class="btn subtle" aria-label="Plan du site"><i class="fas fa-sitemap"></i> Plan du site</a>
        </div>
      </div>
    </section>`;
    const newer = ensureStringOnce(html, hero, (h, s) => insertAfterBodyOpen(h, s));
    changed = changed || newer !== html; html = newer;
  }

  // Ensure footer date-only
  if (!hasSelector(html, /<footer[^>]*id=["']page-footer["']/i)) {
    const footer = '\n    <footer class="glass-panel" id="page-footer" style="margin: var(--spacing-xl,2rem) 0; text-align:center;"></footer>';
    const newer = ensureStringOnce(html, footer, (h, s) => insertBeforeBodyClose(h, s));
    changed = changed || newer !== html; html = newer;
  }
  if (!/getElementById\('page-footer'\)/.test(html)) {
    const dateScript = `\n    <script>(function(){try{var el=document.getElementById('page-footer');if(el){var d=new Date();el.textContent=d.toLocaleDateString('fr-FR',{year:'numeric',month:'long',day:'numeric'});}}catch(e){}})();<\/script>`;
    const newer = ensureStringOnce(html, dateScript, (h, s) => insertBeforeBodyClose(h, s));
    changed = changed || newer !== html; html = newer;
  }

  // Body data-theme
  const themed = ensureBodyDataTheme(html);
  changed = changed || themed !== html; html = themed;

  return { html, changed };
}

function main() {
  const root = path.join(process.cwd(), 'public');
  const files = listHtmlFiles(root);
  const report = [];
  let totalChanged = 0;

  for (const f of files) {
    // Skip game canvases if needed (optional)
    const base = path.basename(f).toLowerCase();
    if (/classic-2d-game/.test(base) || /unified-3d-game/.test(base) || /test-optimized-3d-game/.test(base)) {
      continue; // avoid interfering with pure game canvases
    }

    try {
      const orig = fs.readFileSync(f, 'utf8');
      const { html, changed } = uniformize(orig);
      if (changed) {
        fs.writeFileSync(f, html, 'utf8');
        totalChanged++;
        report.push(`Updated: ${path.relative(process.cwd(), f)}`);
      }
    } catch (e) {
      report.push(`Skipped ${path.relative(process.cwd(), f)}: ${e.message}`);
    }
  }

  const outDir = path.join('.agents', 'reports');
  try { fs.mkdirSync(outDir, { recursive: true }); } catch(_){}
  const outPath = path.join(outDir, 'uniformize-html-report.md');
  const md = [`# Uniformize HTML Report`, `Changed files: ${totalChanged}`, '', ...report].join('\n');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`Done. Changed ${totalChanged} file(s). Report: ${outPath}`);
}

if (require.main === module) main();


