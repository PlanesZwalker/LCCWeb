#!/usr/bin/env node
/**
 * Prune old log artifacts to keep the workspace clean.
 * - .agents/logs/console: keep N days
 * - .agents/logs/screenshots: keep N days per batch folder
 * Usage: node tools/scripts/cleanup-logs.js --days 14
 */
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--days');
  const days = idx !== -1 ? Number(args[idx + 1]) : 14;
  return { days: Number.isFinite(days) && days > 0 ? days : 14 };
}

function isOlderThan(filePath, days) {
  try {
    const st = fs.statSync(filePath);
    const ageMs = Date.now() - st.mtimeMs;
    return ageMs > days * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function pruneConsoleLogs(root, days) {
  const dir = path.join(root, '.agents', 'logs', 'console');
  if (!fs.existsSync(dir)) return { removed: 0 };
  let removed = 0;
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    if (name === 'latest.log' || name === 'index.json') continue;
    if (isOlderThan(fp, days)) {
      try { fs.unlinkSync(fp); removed++; } catch {}
    }
  }
  return { removed };
}

function pruneScreenshotBatches(root, days) {
  const dir = path.join(root, '.agents', 'logs', 'screenshots');
  if (!fs.existsSync(dir)) return { removed: 0 };
  let removed = 0;
  for (const name of fs.readdirSync(dir)) {
    const batchDir = path.join(dir, name);
    if (!fs.statSync(batchDir).isDirectory()) continue;
    if (isOlderThan(batchDir, days)) {
      try {
        fs.rmSync(batchDir, { recursive: true, force: true });
        removed++;
      } catch {}
    }
  }
  return { removed };
}

function main() {
  const { days } = parseArgs();
  const root = process.cwd();
  const a = pruneConsoleLogs(root, days);
  const b = pruneScreenshotBatches(root, days);
  console.log(`[cleanup-logs] Kept last ${days} day(s). Removed: console=${a.removed}, screenshots=${b.removed}`);
}

main();


