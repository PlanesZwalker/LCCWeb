#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BATCH_ROOT = path.join(ROOT, '.agents', 'logs', 'screenshots');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'previews');

function getLatestBatchDir() {
  if (!fs.existsSync(BATCH_ROOT)) return null;
  const entries = fs.readdirSync(BATCH_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('batch-'))
    .map(d => ({ name: d.name, full: path.join(BATCH_ROOT, d.name) }));
  if (entries.length === 0) return null;
  entries.sort((a, b) => b.name.localeCompare(a.name));
  return entries[0].full;
}

function findOneByPatterns(dir, patterns) {
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.png'));
  for (const pat of patterns) {
    const re = new RegExp(pat);
    const found = files.find(f => re.test(f));
    if (found) return path.join(dir, found);
  }
  return null;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyPreview(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Preview updated: ${dest}`);
}

function main() {
  const batchDir = getLatestBatchDir();
  if (!batchDir) {
    console.error('No screenshot batch found under .agents/logs/screenshots');
    process.exit(1);
  }

  const targets = [
    {
      key: '2d',
      patterns: [
        /^classic-2d-game-enhanced-start-.*\.png$/,
        /^classic-2d-game-start-.*\.png$/,
        /^classic-2d-game-enhanced-.*\.png$/,
      ],
      out: path.join(OUT_DIR, 'preview-2d.png'),
    },
    {
      key: 'babylon',
      patterns: [/^unified-3d-game-start-.*\.png$/, /^unified-3d-game-.*\.png$/],
      out: path.join(OUT_DIR, 'preview-babylon.png'),
    },
    {
      key: 'three',
      patterns: [/^threejs-3d-game-start-.*\.png$/, /^threejs-3d-game-.*\.png$/],
      out: path.join(OUT_DIR, 'preview-three.png'),
    },
  ];

  for (const t of targets) {
    const src = findOneByPatterns(batchDir, t.patterns.map(p => p.source || p));
    if (src && fs.existsSync(src)) {
      copyPreview(src, t.out);
    } else {
      console.warn(`No match for ${t.key} in ${batchDir}`);
    }
  }

  console.log('Done updating previews.');
}

main();


