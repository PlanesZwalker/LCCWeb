#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findHtmlFiles(dir) {
  const out = [];
  const walk = (p) => {
    const items = fs.readdirSync(p, { withFileTypes: true });
    for (const it of items) {
      const ip = path.join(p, it.name);
      if (it.isDirectory()) walk(ip);
      else if (it.name.toLowerCase().endsWith('.html')) out.push(ip);
    }
  };
  walk(dir);
  return out;
}

function ensureLinkOrder(html) {
  // Insert base-theme.css before other CSS links; avoid duplicates
  const linkTag = `<link rel="stylesheet" href="css/base-theme.css">`;
  if (html.includes('href="css/base-theme.css"')) return html; // already there
  // Insert after first <meta charset> or just after <head>
  if (html.includes('<meta charset')) {
    return html.replace(/<meta[^>]*charset[^>]*>/i, (m) => `${m}\n    ${linkTag}`);
  }
  return html.replace(/<head>/i, `<head>\n    ${linkTag}`);
}

function main() {
  const root = path.join(process.cwd(), 'public');
  const files = findHtmlFiles(root);
  let changed = 0;
  for (const f of files) {
    try {
      let html = fs.readFileSync(f, 'utf8');
      const updated = ensureLinkOrder(html);
      if (updated !== html) {
        fs.writeFileSync(f, updated, 'utf8');
        changed++;
        console.log(`Injected base-theme.css into: ${path.relative(process.cwd(), f)}`);
      }
    } catch (e) {
      console.warn(`Skip ${f}: ${e.message}`);
    }
  }
  console.log(`Done. Updated ${changed} HTML file(s).`);
}

if (require.main === module) main();


