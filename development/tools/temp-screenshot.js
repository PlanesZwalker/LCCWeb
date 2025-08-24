
        const puppeteer = require('puppeteer');
        const fs = require('fs');
        const os = require('os');
        
        (async () => {
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
          await page.setViewport({
            width: 1920,
            height: 1080
          });

          // Wire console and error logs to file
          const logPath = ".agents/logs/screenshots/site-only/page-rules-2025-08-08T22-13-15-635Z.log";
          const append = (line) => { try { fs.appendFileSync(logPath, line + os.EOL); } catch(_){} };
          page.on('console', msg => append('[console] ' + msg.type().toUpperCase() + ': ' + msg.text()));
          page.on('pageerror', err => append('[pageerror] ' + err.message));
          page.on('requestfailed', req => append('[requestfailed] ' + req.url() + ' ' + req.failure().errorText));
          
          await page.goto('http://localhost:8000/public/rules.html', { waitUntil: 'networkidle2' });
          
          const waitSelector = 'canvas';
          try { await page.waitForSelector(waitSelector, { timeout: 15000 }); } catch (_) {}

          // Wait for a couple of animation frames
          try {
            await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
          } catch(_) {}

          // Wait for game initialization flag or non-blank canvas
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
                  // if any channel non-zero and non-255 uniform white
                  return (data[0] + data[1] + data[2]) !== 0 && !(data[0] === 255 && data[1] === 255 && data[2] === 255);
                } catch(_) { return false; }
              }, selector);
              if (ok) return true;
              await new Promise(r => setTimeout(r, 300));
            }
            return false;
          }

          try { await waitForRender(page, waitSelector, 15000); } catch(_) {}

          // Optional: trigger in-page test suite prior to snapshot for test pages
          if (false) {
            try {
              // Try to start tests via well-known hooks or buttons
              await page.evaluate(() => {
                const w = window;
                if (typeof w.runAllTests === 'function') { w.runAllTests(); return 'runAllTests()'; }
                const btn = Array.from(document.querySelectorAll('button, input[type="button"], a'))
                  .find(el => /test|run|lancer|suite/i.test((el.textContent||el.value||'').trim()));
                if (btn) { btn.click(); return 'clicked'; }
                return 'no-op';
              });

              // Wait for completion indicators
              const waitForTests = async (timeoutMs) => {
                const start = Date.now();
                while (Date.now() - start < timeoutMs) {
                  const done = await page.evaluate(() => {
                    const t = document.body.innerText || '';
                    if (window.testsCompleted === true) return true;
                    if (/tests? (finished|complete|termin[eé])|passed|failed/i.test(t)) return true;
                    if (document.querySelector('#test-results, .test-results, .test-summary')) return true;
                    return false;
                  });
                  if (done) return true;
                  await new Promise(r => setTimeout(r, 500));
                }
                return false;
              };
              await waitForTests(20000);
            } catch (_) {}
          }
          
          if (false) {
            try {
              await page.evaluate(() => {
                const target = document.querySelector('#renderCanvas') || document.querySelector('#gameCanvas') || document.querySelector('canvas') || document.documentElement;
                if (target && target.requestFullscreen) target.requestFullscreen().catch(() => {});
              });
            } catch (_) {}
            try { await page.click(waitSelector); } catch (_) {}
          }

          const keySeq = "";
          if (keySeq) {
            const keys = keySeq.split(',').map(k => k.trim()).filter(Boolean);
            for (const k of keys) {
              try { await page.keyboard.press(k); } catch(_) {}
              await new Promise(r => setTimeout(r, 250));
            }
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await page.screenshot({
            path: ".agents/logs/screenshots/site-only/page-rules-2025-08-08T22-13-15-635Z.png",
            fullPage: true
          });
          
          await browser.close();
          console.log('Screenshot saved: ' + ".agents/logs/screenshots/site-only/page-rules-2025-08-08T22-13-15-635Z.png");
        })();
      