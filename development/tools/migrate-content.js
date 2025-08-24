#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicDir = path.join(root, 'public');
const legacyDir = path.join(publicDir, 'legacy-root');
const oldDir = path.join(root, 'old_files');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function movePreserveStructure(srcFile, baseDir, destBase) {
  const rel = path.relative(baseDir, srcFile);
  const dest = path.join(destBase, rel);
  ensureDir(path.dirname(dest));
  fs.renameSync(srcFile, dest);
  return dest;
}

function removeEnhanced2D(publicDir) {
  const candidates = [
    'classic-2d-game-enhanced.html',
    'enhanced-2d-game.html'
  ];
  for (const file of candidates) {
    const p = path.join(publicDir, file);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true });
  }
}

function updateNavigation(navPath) {
  if (!fs.existsSync(navPath)) return false;
  let s = fs.readFileSync(navPath, 'utf8');
  const before = s;
  // Remove pageHierarchy entry
  s = s.replace(/\s*'classic-2d-game-enhanced\.html':\s*\{[^}]*\},?/m, '');
  // Remove navigationItems entry
  s = s.replace(/\{\s*href:\s*'classic-2d-game-enhanced\.html'[^}]*\},?\s*/m, '');
  if (s !== before) {
    fs.writeFileSync(navPath, s, 'utf8');
    return true;
  }
  return false;
}

function main() {
  ensureDir(oldDir);
  // Move GDD.html to public root if present
  const gddInLegacy = path.join(legacyDir, 'GDD.html');
  if (fs.existsSync(gddInLegacy)) {
    const target = path.join(publicDir, 'GDD.html');
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
    ensureDir(path.dirname(target));
    fs.renameSync(gddInLegacy, target);
    console.log('Moved GDD.html to public/');
  }

  // Move remaining legacy-root files to old_files and remove legacy-root
  if (fs.existsSync(legacyDir)) {
    const entries = fs.readdirSync(legacyDir, { withFileTypes: true });
    const moveAll = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) moveAll(p);
        else movePreserveStructure(p, legacyDir, oldDir);
      }
    };
    moveAll(legacyDir);
    fs.rmSync(legacyDir, { recursive: true, force: true });
    console.log('Moved legacy-root contents to old_files/ and removed legacy-root');
  }

  // Remove enhanced 2D game files
  removeEnhanced2D(publicDir);
  const navPath = path.join(publicDir, 'js', 'navigation.js');
  const updatedNav = updateNavigation(navPath);
  if (updatedNav) console.log('Updated navigation to remove enhanced 2D link');

  console.log('Migration complete');
}

main();
