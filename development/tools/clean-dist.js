#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

const allowedExtensions = new Set([
  '.html', '.css', '.js', '.mjs', '.json', '.map', '.ico', '.txt', '.xml', '.webmanifest',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif',
  '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.mov',
  '.woff', '.woff2', '.ttf', '.otf',
  '.glb', '.gltf', '.fbx', '.obj', '.mtl', '.hdr', '.ktx2', '.env'
]);

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function listFilesRecursive(root, base = '') {
  if (!exists(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = path.join(base, entry.name);
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(full, rel));
    } else {
      files.push({ relPath: rel.replace(/\\/g, '/'), fullPath: full, ext: path.extname(entry.name).toLowerCase() });
    }
  }
  return files;
}

function ensureDir(p) {
  if (!exists(p)) fs.mkdirSync(p, { recursive: true });
}

function deleteEmptyDirs(dir) {
  if (!exists(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const e of entries) {
    const full = path.join(dir, e);
    if (fs.statSync(full).isDirectory()) {
      deleteEmptyDirs(full);
    }
  }
  // if now empty, remove
  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

function main() {
  const args = process.argv.slice(2);
  const isCheck = args.includes('--check');
  const isFix = args.includes('--fix');
  const isPurge = args.includes('--purge'); // stronger: delete extras and empty dirs

  ensureDir(distDir);

  const publicFiles = listFilesRecursive(publicDir);
  const distFiles = listFilesRecursive(distDir);

  const publicSet = new Set(publicFiles.map(f => f.relPath));

  const extras = [];

  for (const file of distFiles) {
    const allowedExt = allowedExtensions.has(file.ext);
    const hasSource = publicSet.has(file.relPath);
    if (!allowedExt || !hasSource) {
      extras.push(file);
    }
  }

  // Report
  console.log(`\n📦 dist/ audit`);
  console.log(` - Total dist files: ${distFiles.length}`);
  console.log(` - Total public files: ${publicFiles.length}`);
  console.log(` - Extra files detected: ${extras.length}`);

  if (extras.length) {
    for (const x of extras.slice(0, 50)) {
      console.log(`   • ${x.relPath} ${allowedExtensions.has(x.ext) ? '' : '(disallowed ext)'} ${publicSet.has(x.relPath) ? '' : '(no source in public)'} `);
    }
    if (extras.length > 50) console.log(`   … and ${extras.length - 50} more`);
  }

  if (isCheck && !isFix && !isPurge) {
    process.exit(extras.length ? 2 : 0);
  }

  if (isFix || isPurge) {
    let deleted = 0;
    for (const x of extras) {
      try {
        fs.unlinkSync(x.fullPath);
        deleted++;
      } catch (e) {
        console.error(`Failed to delete ${x.relPath}: ${e.message}`);
      }
    }
    if (isPurge) deleteEmptyDirs(distDir);
    console.log(`\n🧹 Removed ${deleted} extra file(s).${isPurge ? ' Emptied dangling folders.' : ''}`);
  }

  // Mirror missing files from public (optional; keeps dist in sync)
  if (isFix || isPurge) {
    let copied = 0;
    for (const pf of publicFiles) {
      if (!allowedExtensions.has(pf.ext)) continue; // only copy allowed
      const target = path.join(distDir, pf.relPath);
      if (!exists(target)) {
        ensureDir(path.dirname(target));
        fs.copyFileSync(path.join(publicDir, pf.relPath), target);
        copied++;
      }
    }
    console.log(`📥 Copied ${copied} missing file(s) from public/ to dist/`);
  }

  console.log(`\n✅ dist/ is ${extras.length ? 'now clean' : 'clean'} relative to public/ (allowed types only).`);
}

main();
