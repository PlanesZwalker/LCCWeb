#!/usr/bin/env node
/**
 * Move backup-like files from `public/` into `.agents/backups/auto-cleanup/` to keep the web root clean.
 * Patterns moved: *.backup, *.backup.*, *-backup.*, *.bak, *.old, *.orig
 *
 * Usage:
 *   node tools/cleanup-public-backups.js          # move files
 *   node tools/cleanup-public-backups.js --dry    # dry run
 */
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const targetRoot = path.join(projectRoot, '.agents', 'backups', 'auto-cleanup');
const isDryRun = process.argv.includes('--dry');

const patterns = [
  // simple suffixes
  /\.backup$/i,
  /\.backup\.[^/\\]+$/i,
  /-backup(\.[^/\\]+)?$/i,
  /\.bak$/i,
  /\.old$/i,
  /\.orig$/i,
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function shouldMove(filePath) {
  const base = path.basename(filePath);
  return patterns.some((re) => re.test(base));
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function moveFilePreserveRelative(src, baseDir, destRoot) {
  const rel = path.relative(baseDir, src);
  const dest = path.join(destRoot, 'public', rel);
  ensureDir(path.dirname(dest));
  if (isDryRun) {
    console.log(`[dry] MOVE ${path.relative(projectRoot, src)} -> ${path.relative(projectRoot, dest)}`);
    return;
  }
  fs.renameSync(src, dest);
  console.log(`Moved ${path.relative(projectRoot, src)} -> ${path.relative(projectRoot, dest)}`);
}

function main() {
  if (!fs.existsSync(publicDir)) {
    console.error('public/ directory not found.');
    process.exit(1);
  }
  ensureDir(targetRoot);

  let moved = 0;
  for (const filePath of walk(publicDir)) {
    if (shouldMove(filePath)) {
      moveFilePreserveRelative(filePath, publicDir, targetRoot);
      moved++;
    }
  }

  console.log(`${isDryRun ? '[dry] ' : ''}Done. ${moved} file(s) ${isDryRun ? 'would be ' : ''}moved.`);
}

main();


