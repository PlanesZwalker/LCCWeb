#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function snap(url, outDir, name) {
  const puppeteer = require('puppeteer');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = outDir || path.join('tools', 'screenshots', `quick-${ts}`);
  fs.mkdirSync(dir, { recursive: true });
  const png = path.join(dir, `${name || 'page'}-${ts}.png`);
  const log = path.join(dir, `${name || 'page'}-${ts}.log`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=desktop',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const append = (line) => { try { fs.appendFileSync(log, line + '\n'); } catch(_){} };
  page.on('console', msg => append('[console] ' + msg.type().toUpperCase() + ': ' + msg.text()));
  page.on('pageerror', err => append('[pageerror] ' + err.message));
  page.on('requestfailed', req => append('[requestfailed] ' + req.url() + ' ' + req.failure().errorText));

  await page.goto(url, { waitUntil: 'networkidle2' });
  try { await page.waitForSelector('canvas', { timeout: 15000 }); } catch {}
  try { await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); } catch {}

  async function waitForRender(page, selector, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await page.evaluate((sel) => {
        if (window.gameInitialized === true) return true;
        const c = document.querySelector(sel) || document.querySelector('canvas');
        if (!c) return false;
        const ctx = c.getContext && c.getContext('2d');
        if (!ctx) return false;
        const w = Math.min(c.width, 4), h = Math.min(c.height, 4);
        if (w === 0 || h === 0) return false;
        try {
          const data = ctx.getImageData(0, 0, 1, 1).data;
          return (data[0] + data[1] + data[2]) !== 0 && !(data[0] === 255 && data[1] === 255 && data[2] === 255);
        } catch(_) { return false; }
      }, selector);
      if (ok) return true;
      await new Promise(r => setTimeout(r, 300));
    }
    return false;
  }

  try { await waitForRender(page, 'canvas', 15000); } catch {}
  await page.screenshot({ path: png, fullPage: false });
  await browser.close();
  console.log('Saved', png);
}

const url = process.argv[2] || 'http://localhost:8000/public/threejs-3d-game.html';
const outDir = process.argv[3];
const name = process.argv[4];

snap(url, outDir, name).catch(err => { console.error(err); process.exit(1); });
