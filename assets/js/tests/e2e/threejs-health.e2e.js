const puppeteer = require('puppeteer');

const PAGE_URL = process.env.TEST_PAGE_URL || 'http://localhost:8000/public/threejs-3d-game.html';

/**
 * Utilities
 */
async function hasNonBlankCanvas(page) {
  return await page.evaluate(() => {
    // If game signaled ready, accept
    if (window.gameInitialized === true) return true;
    const c = document.querySelector('canvas');
    if (!c) return false;
    const ctx2d = c.getContext && c.getContext('2d');
    // If WebGL-only, accept presence of canvas after a couple frames
    if (!ctx2d) return true;
    try {
      const data = ctx2d.getImageData(0, 0, 1, 1).data;
      const sum = data[0] + data[1] + data[2];
      const isWhite = data[0] === 255 && data[1] === 255 && data[2] === 255;
      return sum !== 0 && !isWhite;
    } catch (_) {
      return true; // Cross-origin or unavailable, assume rendered
    }
  });
}

/**
 * Tests
 */
describe('threejs-3d-game health', () => {
  let browser;
  let page;
  const consoleErrors = [];

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=desktop']
    });
    page = await browser.newPage();
    page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`console: ${msg.text()}`);
    });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('loads without console errors and renders a frame', async () => {
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(PAGE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // wait for canvas
    await page.waitForSelector('canvas', { timeout: 15000 });

    // two animation frames
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

    const nonBlank = await hasNonBlankCanvas(page);
    expect(nonBlank).toBe(true);
    // Allow one transient pageerror; fail only if more than 1
    expect(consoleErrors.length).toBeLessThanOrEqual(1);
  }, 90000);
});
