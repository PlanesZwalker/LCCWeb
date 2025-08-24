#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'public');

function listHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listHtmlFiles(full));
    } else if (entry.name.toLowerCase().endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function fixContent(htmlPath) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  const original = content;

  // Normalize slashes in URLs
  content = content.replace(/\\/g, '/');

  // Fix duplicated /public paths
  content = content.replace(/\/public\/public\//g, '/public/');

  // Fix legacy-root asset references to actual public paths
  content = content.replace(/\/public\/legacy-root\/css\//g, '/public/css/');
  content = content.replace(/\/public\/legacy-root\/js\//g, '/public/js/');
  content = content.replace(/\/public\/legacy-root\/images\//g, '/public/images/');
  content = content.replace(/\/public\/legacy-root\/dist\//g, '/public/');

  // Fallback for missing font-awesome path: point to CDN if local missing
  if (content.includes('font-awesome.min.css') && !fs.existsSync(path.join(root, 'css', 'font-awesome.min.css'))) {
    content = content.replace(/href="[^"]*font-awesome\.min\.css"/g, 'href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"');
  }

  if (content !== original) {
    fs.writeFileSync(htmlPath, content, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const htmlFiles = listHtmlFiles(root).filter(p => p.includes(path.join('public', 'legacy-root')));
  let changed = 0;
  for (const file of htmlFiles) {
    if (fixContent(file)) changed++;
  }
  console.log(`Fixed ${changed} file(s) under public/legacy-root`);
}

main();
