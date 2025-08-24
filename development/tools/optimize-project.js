#!/usr/bin/env node
/**
 * Project Optimizer
 * - Create .agents/ structure and ignores
 * - Deduplicate FINAL-TODO-LIST.md items
 * - Cleanup old screenshots/logs/backups
 * - Generate optimization report
 *
 * Usage:
 *   node tools/optimize-project.js [--dry] [--days 7] [--keep-batches 5]
 */
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ProjectOptimizer {
  constructor(opts = {}) {
    this.cwd = process.cwd();
    this.dry = !!opts.dry;
    this.days = Number.isFinite(opts.days) ? opts.days : 7;
    this.keepBatches = Number.isFinite(opts.keepBatches) ? opts.keepBatches : 5;
    this.todoFile = path.join(this.cwd, 'FINAL-TODO-LIST.md');
    this.agentsRoot = path.join(this.cwd, '.agents');
    this.structDirs = [
      '.agents/logs/screenshots',
      '.agents/logs/tests',
      '.agents/logs/fixes',
      '.agents/logs/archive',
      '.agents/backups/css',
      '.agents/backups/js',
      '.agents/backups/auto-cleanup',
      '.agents/temp',
      '.agents/reports',
      '.agents/config'
    ];
  }

  async ensureDirs() {
    for (const rel of this.structDirs) {
      const p = path.join(this.cwd, rel);
      if (!fs.existsSync(p)) {
        if (!this.dry) fs.mkdirSync(p, { recursive: true });
      }
    }
  }

  async upsertGitignore() {
    const gitignorePath = path.join(this.cwd, '.gitignore');
    const block = [
      '# 🤖 Agent files (auto-generated)',
      '.agents/logs/',
      '.agents/backups/',
      '.agents/temp/',
      '.agents/reports/',
      'tools/screenshots/batch-*/',
      '*.agent.tmp',
      '*.backup',
      '*-backup.*',
      ''
    ].join('\n');
    let content = '';
    try { content = fs.readFileSync(gitignorePath, 'utf8'); } catch (_) {}
    if (!content.includes('.agents/logs/')) {
      if (!this.dry) fs.writeFileSync(gitignorePath, content ? content + (content.endsWith('\n') ? '' : '\n') + block : block, 'utf8');
    }
  }

  async writeAgentIgnore() {
    const agentIgnore = [
      '# 🚫 Fichiers ignorés par les agents',
      '.agents/',
      'node_modules/',
      'dist/',
      'coverage/',
      '*.backup',
      '*.tmp',
      '*.log.old',
      '*.agent.tmp',
      'tools/screenshots/batch-*/',
      ''
    ].join('\n');
    const p = path.join(this.cwd, '.agentignore');
    if (!this.dry) fs.writeFileSync(p, agentIgnore, 'utf8');
  }

  normalizeTaskLine(line) {
    const withoutTs = line.replace(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z/g, '');
    const withoutSpaces = withoutTs.replace(/\s+/g, ' ').trim();
    return withoutSpaces;
  }

  createTaskHash(line) {
    const norm = this.normalizeTaskLine(line);
    const urlMatch = norm.match(/https?:\/\/\S+/);
    const url = urlMatch ? urlMatch[0] : '';
    const base = norm.replace(/https?:\/\/\S+/, '');
    return crypto.createHash('md5').update(url + '|' + base).digest('hex').slice(0, 10);
  }

  async deduplicateTodo() {
    try {
      const raw = fs.readFileSync(this.todoFile, 'utf8');
      const lines = raw.split(/\r?\n/);
      const out = [];
      const seen = new Set();
      let removed = 0;
      for (const line of lines) {
        if (/^- \[( |x|X)\]/.test(line)) {
          const hash = this.createTaskHash(line);
          if (seen.has(hash)) { removed++; continue; }
          seen.add(hash);
          out.push(`${line} <!-- AUTO-TODO:${hash} -->`);
        } else {
          out.push(line);
        }
      }
      if (!this.dry) fs.writeFileSync(this.todoFile, out.join('\n'), 'utf8');
      return { removed, kept: seen.size };
    } catch (err) {
      return { removed: 0, kept: 0, error: err.message };
    }
  }

  async cleanupOldArtifacts() {
    const cutoff = Date.now() - this.days * 24 * 60 * 60 * 1000;
    const dirs = [
      path.join(this.cwd, 'tools', 'screenshots'),
      path.join(this.cwd, '.agents', 'logs'),
      path.join(this.cwd, '.agents', 'backups')
    ];

    let deleted = 0;
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      const items = fs.readdirSync(dir, { withFileTypes: true });
      // Keep latest N screenshot batches regardless of time
      const isScreenshots = dir.endsWith(path.sep + 'screenshots') || dir.includes(path.sep + 'screenshots');
      let batches = [];
      if (isScreenshots) {
        batches = items
          .filter(d => d.isDirectory() && d.name.startsWith('batch-'))
          .map(d => ({ name: d.name, time: this.parseBatchTime(d.name) }))
          .sort((a, b) => b.time - a.time);
      }
      for (const item of items) {
        const p = path.join(dir, item.name);
        try {
          const stat = fs.statSync(p);
          let keep = stat.mtimeMs >= cutoff;
          if (isScreenshots && item.isDirectory() && item.name.startsWith('batch-')) {
            const index = batches.findIndex(b => b.name === item.name);
            if (index > -1 && index < this.keepBatches) keep = true; // keep most recent N
          }
          if (!keep) {
            if (!this.dry) fs.rmSync(p, { recursive: true, force: true });
            deleted++;
          }
        } catch (_) {}
      }
    }
    return { deleted };
  }

  parseBatchTime(name) {
    // batch-2025-08-08T13-23-05-630Z
    const iso = name.replace(/^batch-/, '').replace(/-/g, ':').replace('T', 'T');
    const t = Date.parse(iso.replace(/:(\d{3})Z$/, '.$1Z'));
    return isNaN(t) ? 0 : t;
  }

  async countFiles(dir) {
    let count = 0;
    const walk = (p) => {
      if (!fs.existsSync(p)) return;
      const items = fs.readdirSync(p, { withFileTypes: true });
      for (const it of items) {
        const ip = path.join(p, it.name);
        if (it.isDirectory()) walk(ip);
        else count++;
      }
    };
    walk(dir);
    return count;
  }

  async report() {
    const report = {
      timestamp: new Date().toISOString(),
      dry: this.dry,
      days: this.days,
      keepBatches: this.keepBatches,
      todoEntries: 0,
      backups: await this.countFiles(path.join(this.cwd, '.agents', 'backups')),
      logs: await this.countFiles(path.join(this.cwd, '.agents', 'logs')),
      temp: await this.countFiles(path.join(this.cwd, '.agents', 'temp'))
    };
    try {
      const content = fs.readFileSync(this.todoFile, 'utf8');
      report.todoEntries = (content.match(/^- \[( |x|X)\]/gm) || []).length;
    } catch (_) {}

    const outDir = path.join(this.cwd, '.agents', 'reports');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const file = path.join(outDir, `optimize-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    if (!this.dry) fs.writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');
    return report;
  }

  async run() {
    console.log(`🚀 Optimisation (dry=${this.dry}, days=${this.days}, keepBatches=${this.keepBatches})`);
    await this.ensureDirs();
    await this.upsertGitignore();
    await this.writeAgentIgnore();
    const dd = await this.deduplicateTodo();
    console.log(`📝 TODO: ${dd.removed} doublons supprimés, ${dd.kept} conservés`);
    const cl = await this.cleanupOldArtifacts();
    console.log(`🗑️ Nettoyage: ${cl.deleted} éléments supprimés`);
    const rep = await this.report();
    console.log(`📊 Rapport: ${rep.todoEntries} entrées TODO, backups=${rep.backups}, logs=${rep.logs}, temp=${rep.temp}`);
  }
}

function parseArgs(argv) {
  const opts = { dry: false, days: 7, keepBatches: 5 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry') opts.dry = true;
    else if (a === '--days') opts.days = parseInt(argv[++i], 10);
    else if (a === '--keep-batches') opts.keepBatches = parseInt(argv[++i], 10);
  }
  return opts;
}

if (require.main === module) {
  const opts = parseArgs(process.argv);
  const optimizer = new ProjectOptimizer(opts);
  optimizer.run().catch(err => {
    console.error('❌ Erreur optimisation:', err);
    process.exit(1);
  });
}

module.exports = ProjectOptimizer;


