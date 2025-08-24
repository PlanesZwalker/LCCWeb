#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

function findLatestScreenshotReport() {
  const bases = ['.agents/logs/screenshots', 'tools/screenshots'];
  let candidates = [];
  for (const base of bases) {
    try {
      if (!fs.existsSync(base)) continue;
      const walk = (dir) => {
        for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
          const ip = path.join(dir, it.name);
          if (it.isDirectory()) walk(ip);
          else if (/screenshot-report-[\w\-]+\.json$/.test(it.name)) candidates.push(ip);
        }
      };
      walk(base);
    } catch (_) {}
  }
  candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return candidates[0] || null;
}

function aggregate() {
  const outDir = path.join('.agents', 'reports');
  try { fs.mkdirSync(outDir, { recursive: true }); } catch {}

  // Read inter-agent comments
  const busPath = path.join(outDir, 'interagent-comments.jsonl');
  const comments = [];
  if (fs.existsSync(busPath)) {
    const lines = fs.readFileSync(busPath, 'utf8').split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try { comments.push(JSON.parse(line)); } catch (_) {}
    }
  }

  // Read latest screenshot report
  const latestReportPath = findLatestScreenshotReport();
  const screenshotReport = latestReportPath ? loadJsonSafe(latestReportPath) : null;

  const summary = {
    timestamp: new Date().toISOString(),
    latestScreenshotReport: latestReportPath || null,
    commentsCount: comments.length,
    threads: {}
  };

  for (const c of comments) {
    const key = c.conversationId || c.threadId || `${c.targetAgent}`;
    if (!summary.threads[key]) summary.threads[key] = [];
    summary.threads[key].push(c);
  }

  const jsonOut = path.join(outDir, 'interagent-aggregate.json');
  fs.writeFileSync(jsonOut, JSON.stringify({ summary, screenshotReport }, null, 2), 'utf8');

  let md = `# Inter-Agent Aggregate Report\n\nGenerated: ${summary.timestamp}\n\n`;
  md += `- Comments: ${comments.length}\n`;
  md += `- Latest screenshot report: ${latestReportPath || 'none'}\n\n`;
  for (const [thread, items] of Object.entries(summary.threads)) {
    md += `## Thread: ${thread}\n`;
    for (const it of items.slice(0, 50)) {
      md += `- [${it.type || 'note'}|${it.severity}] ${it.sourceAgent} → ${it.targetAgent}: ${it.message}${it.suggestion ? `\n  Suggestion: ${it.suggestion}` : ''}\n`;
    }
    md += `\n`;
  }
  const mdOut = path.join(outDir, 'interagent-aggregate.md');
  fs.writeFileSync(mdOut, md, 'utf8');

  console.log(`✅ Aggregate written:\n- ${jsonOut}\n- ${mdOut}`);
}

aggregate();


