#!/usr/bin/env node

const BaseAgent = require('./base-agent');
const fileBridge = require('../file-bridge');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class ScreenshotAgent extends BaseAgent {
  constructor() {
    super('screenshot-agent');
    this.screenshots = [];
    this.baseUrl = 'http://localhost:8000/public/';
    this.runTimestamp = null;
    this.batchDir = null;
    this.maxShots = Infinity;
  }

  normalizeUrl(url) {
    try {
      let cleaned = (url || '').replace(/\\/g, '/');
      // Strip common trailing punctuation accidentally included from prose
      cleaned = cleaned.replace(/[\)\]\>"'\.\,;:!]+$/g, '');
      const u = new URL(cleaned);
      // Force localhost port to 8000 if 3000
      if (u.hostname === 'localhost' && (u.port === '3000' || u.port === '')) {
        // keep path and protocol, just ensure port 8000
        u.port = '8000';
      }
      // Ensure /public prefix is single
      if (u.pathname.startsWith('/public/public/')) {
        u.pathname = u.pathname.replace('/public/public/', '/public/');
      }
      return u.toString();
    } catch (_err) {
      let out = (url || '').replace(/\\/g, '/');
      out = out.replace(/[\)\]\>"'\.\,;:!]+$/g, '');
      out = out.replace('http://localhost:8000/public/public/', 'http://localhost:8000/public/');
      out = out.replace('http://localhost:3000/public/', 'http://localhost:8000/public/');
      out = out.replace('http://localhost:3000/', 'http://localhost:8000/');
      return out;
    }
  }

  analyzeInstruction(instruction) {
    const keywords = {
      // IMPORTANT: do not treat "full" as ALL (it refers to "full page")
      all: ['all', 'complete', 'everything', 'tout', 'toute', 'toutes', 'complet', 'complète', 'entier'],
      specific: ['specific', 'particular', 'certain', 'spécifique', 'particulier', 'certain'],
      responsive: ['responsive', 'mobile', 'tablet', 'desktop', 'réactif', 'responsif', 'tablette', 'bureau'],
      game: ['game', 'games', 'babylon', 'threejs', 'canvas', 'jeu', 'jeux'],
      // Avoid matching the word "page" alone in phrases like "full page"
      website: ['website', 'main', 'home', 'site', 'pages', 'accueil'],
      comparison: ['comparison', 'before', 'after', 'diff', 'comparaison', 'avant', 'après'],
      error: ['error', 'bug', 'issue', 'problem', 'erreur', 'bugs', 'problème'],
      fullscreen: ['fullscreen', 'plein ecran', 'plein écran', 'full screen'],
      gameplay: ['gameplay', 'moments', 'steps', 'séquence', 'sequence']
    };

    const analysis = {
      needsAllScreenshots: false,
      needsSpecificScreenshots: false,
      needsResponsiveScreenshots: false,
      needsGameScreenshots: false,
      needsWebsiteScreenshots: false,
      needsComparisonScreenshots: false,
      needsErrorScreenshots: false,
      needsFullscreen: false,
      needsGameplaySequence: false,
      priority: 'medium',
      maxShots: Infinity
    };

    const lowerInstruction = (instruction || '').toLowerCase();
    // Sanitize by removing URLs and the 'save under' path to avoid false matches (e.g., 'site-all')
    const dirs = this.parseDirectives(instruction);
    let sanitizedLower = lowerInstruction;
    if (dirs.urls && dirs.urls.length) {
      for (const u of dirs.urls) {
        sanitizedLower = sanitizedLower.replace(u.toLowerCase(), '');
      }
    }
    if (dirs.saveUnderPath) {
      sanitizedLower = sanitizedLower.replace(dirs.saveUnderPath.toLowerCase(), '');
    }
    
    for (const [category, words] of Object.entries(keywords)) {
      const hit = words.some(word => new RegExp(`(^|\b)${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\b|$)`, 'i').test(sanitizedLower));
      if (hit) {
        if (category === 'all') {
          analysis.needsAllScreenshots = true;
        } else if (category === 'game') {
          analysis.needsGameScreenshots = true;
        } else if (category === 'website') {
          analysis.needsWebsiteScreenshots = true;
        } else if (category === 'responsive') {
          analysis.needsResponsiveScreenshots = true;
        } else if (category === 'comparison') {
          analysis.needsComparisonScreenshots = true;
        } else if (category === 'error') {
          analysis.needsErrorScreenshots = true;
        } else if (category === 'specific') {
          analysis.needsSpecificScreenshots = true;
        } else if (category === 'fullscreen') {
          analysis.needsFullscreen = true;
        } else if (category === 'gameplay') {
          analysis.needsGameplaySequence = true;
        }
      }
    }

    // Déterminer la priorité
    if (analysis.needsAllScreenshots) analysis.priority = 'high';
    if (analysis.needsErrorScreenshots) analysis.priority = 'high';

    // Déterminer la limite de captures (ex: "seulement 3", "limit 3", "only 3")
    const limitMatch = sanitizedLower.match(/(?:limite|limit|seulement|only|juste)\D*(\d{1,3})/);
    if (limitMatch) {
      const n = parseInt(limitMatch[1], 10);
      if (!isNaN(n) && n > 0) analysis.maxShots = n;
    }

    // Negations, e.g., "no games", "sans jeux", "pas de jeux"
    if (/(^|\b)(no|sans|pas\s+de)\s+(games?|jeux)\b/i.test(sanitizedLower)) {
      analysis.needsGameScreenshots = false;
    }
    if (/(^|\b)(no|sans|pas\s+de)\s+(website|pages?|site)\b/i.test(sanitizedLower)) {
      analysis.needsWebsiteScreenshots = false;
    }

    // If "only" and a target domain is indicated, bias towards that target
    if (/(^|\b)(only|uniquement|seulement)\b/i.test(sanitizedLower)) {
      const wantsGamesRaw = /(games?|jeux)\b/i.test(sanitizedLower);
      const wantsWebsite = /(website|pages?|site)\b/i.test(sanitizedLower);
      const negNoGames = /(no|sans|pas\s+de)\s+(games?|jeux)\b/i.test(sanitizedLower);
      const wantsGames = wantsGamesRaw && !negNoGames;
      if (wantsWebsite) {
        analysis.needsGameScreenshots = false;
        // Explicitly mark website screenshots requested
        analysis.needsWebsiteScreenshots = true;
      }
      if (wantsGames && !wantsWebsite) {
        analysis.needsWebsiteScreenshots = false;
        analysis.needsGameScreenshots = true;
      }
      // Do not treat as "all"
      analysis.needsAllScreenshots = false;
    }

    return analysis;
  }

  parseDirectives(instruction) {
    const text = instruction || '';
    const lower = text.toLowerCase();
    const urls = [];
    const urlMatches = text.match(/https?:\/\/[^\s"')]+/gi) || [];
    for (const u of urlMatches) {
      urls.push(this.normalizeUrl(u));
    }

    // Save under path
    let saveUnderPath = null;
    const saveMatch = text.match(/save\s+(?:under|to|dans|sous)\s+([^\n"']+)/i);
    if (saveMatch) {
      saveUnderPath = saveMatch[1].trim();
      // If the captured path accidentally contains following directives like "Limit ...",
      // cut them off.
      const cutIdx = saveUnderPath.toLowerCase().search(/\blimit\b|\blimite\b/);
      if (cutIdx > -1) saveUnderPath = saveUnderPath.slice(0, cutIdx);
      // strip trailing punctuation
      saveUnderPath = saveUnderPath.replace(/[\s.]+$/g, '');
      // normalize slashes and ensure relative path stays under .agents/logs/screenshots if bare
      saveUnderPath = saveUnderPath.replace(/\\/g, '/');
    }

    // Limit
    let limit = null;
    const limitMatch = lower.match(/(?:limite|limit|seulement|only|juste)\D*(\d{1,3})/);
    if (limitMatch) {
      const n = parseInt(limitMatch[1], 10);
      if (!isNaN(n) && n > 0) limit = n;
    }

    const wantsFullPage = /full\s*page|page\s*compl[eè]te/i.test(lower);
    const wantsFullscreen = /fullscreen|plein\s*[eé]cran/i.test(lower);
    const wantsRunTests = /run\s+(?:tests?|suite)|ex[eé]cuter\s+les\s+tests?/i.test(lower);
    const strictOnly = /\bonly\b|uniquement|seulement/i.test(lower);

    return { urls, saveUnderPath, limit, wantsFullPage, wantsFullscreen, wantsRunTests, strictOnly };
  }

  async takeScreenshot(url, filename, options = {}) {
    if (this.screenshots.length >= (this.maxShots || Infinity)) {
      this.log(`⏭️ Limite de ${this.maxShots} capture(s) atteinte, ignoré: ${url}`, 'info');
      return null;
    }
    this.log(`📸 Capture d'écran de: ${url}`, 'info');
    
    try {
      // Créer le dossier de lot horodaté s'il n'existe pas (redirigé vers .agents)
      const screenshotsDir = this.batchDir || path.join('.agents', 'logs', 'screenshots');
      if (!fileBridge.fileExists(screenshotsDir)) {
        try { fs.mkdirSync(screenshotsDir, { recursive: true }); } catch (_) {}
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(screenshotsDir, `${filename}-${timestamp}.png`);
      const logPath = path.join(screenshotsDir, `${filename}-${timestamp}.log`);
      const safeScreenshotPath = JSON.stringify(screenshotPath.replace(/\\/g, '/'));
      const safeLogPath = JSON.stringify(logPath.replace(/\\/g, '/'));
      
      // Options par défaut
      const defaultOptions = {
        width: 1920,
        height: 1080,
        fullPage: false,
        waitForSelector: 'canvas',
        delay: 2000,
        fullscreen: false,
        keySequence: '',
        runTests: false
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Utiliser Puppeteer pour prendre la capture d'écran
      const puppeteerScript = `
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
            width: ${finalOptions.width},
            height: ${finalOptions.height}
          });

          // Wire console and error logs to file
          const logPath = ${safeLogPath};
          const append = (line) => { try { fs.appendFileSync(logPath, line + os.EOL); } catch(_){} };
          page.on('console', msg => append('[console] ' + msg.type().toUpperCase() + ': ' + msg.text()));
          page.on('pageerror', err => append('[pageerror] ' + err.message));
          page.on('requestfailed', req => append('[requestfailed] ' + req.url() + ' ' + req.failure().errorText));
          
          await page.goto('${url}', { waitUntil: 'networkidle2' });
          
          const waitSelector = ${finalOptions.waitForSelector ? `'${finalOptions.waitForSelector}'` : `'canvas'`};
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
          if (${finalOptions.runTests ? 'true' : 'false'}) {
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
          
          if (${finalOptions.fullscreen ? 'true' : 'false'}) {
            try {
              await page.evaluate(() => {
                const target = document.querySelector('#renderCanvas') || document.querySelector('#gameCanvas') || document.querySelector('canvas') || document.documentElement;
                if (target && target.requestFullscreen) target.requestFullscreen().catch(() => {});
              });
            } catch (_) {}
            try { await page.click(waitSelector); } catch (_) {}
          }

          const keySeq = ${JSON.stringify((defaultOptions.keySequence || '') + '') ? JSON.stringify(finalOptions.keySequence || '') : "''"};
          if (keySeq) {
            const keys = keySeq.split(',').map(k => k.trim()).filter(Boolean);
            for (const k of keys) {
              try { await page.keyboard.press(k); } catch(_) {}
              await new Promise(r => setTimeout(r, 250));
            }
          }

          await new Promise(resolve => setTimeout(resolve, ${finalOptions.delay}));
          
          await page.screenshot({
            path: ${safeScreenshotPath},
            fullPage: ${finalOptions.fullPage}
          });
          
          await browser.close();
          console.log('Screenshot saved: ' + ${safeScreenshotPath});
        })();
      `;

      // Écrire le script temporaire
      const scriptPath = 'tools/scripts/temp-screenshot.js';
      fileBridge.writeFile(scriptPath, puppeteerScript);

      // Exécuter le script
      execSync(`node ${scriptPath}`, { 
        encoding: 'utf8', 
        cwd: process.cwd(),
        timeout: 90000 // 90 secondes pour laisser le temps de charger
      });

      // Nettoyer le script temporaire
      if (fileBridge.fileExists(scriptPath)) {
        fileBridge.deleteFile(scriptPath);
      }

      this.screenshots.push({
        url,
        path: screenshotPath,
        logPath: logPath,
        timestamp: new Date().toISOString(),
        options: finalOptions
      });

      this.log(`✅ Capture d'écran sauvegardée: ${screenshotPath}`, 'success');
      return screenshotPath;
    } catch (error) {
      this.log(`❌ Erreur lors de la capture d'écran: ${error.message}`, 'error');
      return null;
    }
  }

  async takeResponsiveScreenshots(url, baseFilename) {
    this.log(`📱 Captures d'écran responsive pour: ${url}`, 'info');
    
    const devices = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    const screenshots = [];
    
    for (const device of devices) {
      const filename = `${baseFilename}-${device.name}`;
      const screenshotPath = await this.takeScreenshot(url, filename, {
        width: device.width,
        height: device.height,
        fullPage: true
      });
      
      if (screenshotPath) {
        screenshots.push({
          device: device.name,
          path: screenshotPath,
          dimensions: `${device.width}x${device.height}`
        });
      }
    }

    return screenshots;
  }

  async takeGameScreenshots() {
    this.log('🎮 Captures d\'écran des jeux...', 'info');
    
    // Utiliser la structure dynamique du projet
    const games = await this.getGames();
    
    if (games.length === 0) {
      this.log('Aucun jeu trouvé dans la structure du projet', 'warning');
      return [];
    }

    const gameScreenshots = [];

    for (const game of games) {
      this.log(`🎮 Capture du jeu: ${game.name}`, 'info');

      // Normaliser l'URL (éviter les doublons de /public/ et \\)
      const normalizedUrl = this.normalizeUrl(game.url);

      // Séquences de gameplay: début, déplacement, action (en plein écran)
      const moments = [
        { suffix: 'start', delay: 3000, keys: '', fullscreen: true },
        { suffix: 'move', delay: 4000, keys: 'ArrowRight,ArrowUp,ArrowLeft,ArrowDown', fullscreen: true },
        { suffix: 'action', delay: 4000, keys: 'Space,Space', fullscreen: true }
      ];

      for (const m of moments) {
        const shot = await this.takeScreenshot(normalizedUrl, `${game.name}-${m.suffix}`, {
          waitForSelector: 'canvas',
          delay: m.delay,
          fullPage: false,
          fullscreen: m.fullscreen,
          keySequence: m.keys
        });
        if (shot) {
          gameScreenshots.push({
            game: game.name,
            path: shot,
            url: normalizedUrl,
            type: game.type,
            moment: m.suffix
          });
        }
      }
    }

    return gameScreenshots;
  }

  async takeWebsiteScreenshots() {
    this.log('🌐 Captures d\'écran du site web...', 'info');
    
    const websiteScreenshots = [];
    
    // Utiliser la structure dynamique du projet
    const pages = await this.getPages();
    const mainUrl = 'http://localhost:8000/public/';
    
    // Page principale
    const mainScreenshot = await this.takeScreenshot(
      mainUrl, 
      'website-main',
      { fullPage: true }
    );
    
    if (mainScreenshot) {
      websiteScreenshots.push({
        page: 'main',
        path: mainScreenshot,
        url: mainUrl
      });
    }

    // Captures des autres pages
    for (const page of pages) {
      this.log(`🌐 Capture de la page: ${page.name}`, 'info');
      
      const normalizedUrl = this.normalizeUrl(page.url);

      const pageScreenshot = await this.takeScreenshot(
        normalizedUrl,
        `page-${page.name}`,
        {
          fullPage: true,
          // If this looks like a test page, trigger its tests before shooting
          runTests: /test|suite/i.test(page.name) || /test|suite/i.test(normalizedUrl),
          // Give tests a little more time to render summaries
          delay: (/test|suite/i.test(page.name) || /test|suite/i.test(normalizedUrl)) ? 4000 : 2000,
          // For test pages, we don't need canvas selector
          waitForSelector: (/test|suite/i.test(page.name) || /test|suite/i.test(normalizedUrl)) ? 'body' : 'canvas'
        }
      );
      
      if (pageScreenshot) {
        websiteScreenshots.push({
          page: page.name,
          path: pageScreenshot,
          url: normalizedUrl
        });
      }
    }

    // Captures responsive
    const responsiveScreenshots = await this.takeResponsiveScreenshots(
      mainUrl,
      'website-responsive'
    );
    
    websiteScreenshots.push(...responsiveScreenshots);

    return websiteScreenshots;
  }

  async takeErrorScreenshots() {
    this.log('🚨 Captures d\'écran d\'erreurs...', 'info');
    
    const errorScreenshots = [];
    
    // Tester des URLs qui pourraient causer des erreurs
    const errorUrls = [
      'http://localhost:8000/public/nonexistent',
      'http://localhost:8000/public/error',
      'http://localhost:8000/public/500'
    ].map(u => u.replace(/\\/g, '/'));

    for (const url of errorUrls) {
      const normalizedUrl = this.normalizeUrl(url);

      const screenshotPath = await this.takeScreenshot(normalizedUrl, 'error-page', {
        delay: 3000,
        fullPage: true
      });
      
      if (screenshotPath) {
        errorScreenshots.push({
          url: normalizedUrl,
          path: screenshotPath,
          type: 'error'
        });
      }
    }

    return errorScreenshots;
  }

  generateScreenshotReport() {
    let report = `\n📸 Rapport de captures d'écran pour ${this.agentName}:\n`;
    
    if (this.screenshots.length === 0) {
      report += 'Aucune capture d\'écran prise\n';
      return report;
    }

    report += `\n📊 Total de captures: ${this.screenshots.length}\n`;
    
    // Grouper par type
    const gameScreenshots = this.screenshots.filter(s => s.path.includes('game'));
    const websiteScreenshots = this.screenshots.filter(s => s.path.includes('website'));
    const errorScreenshots = this.screenshots.filter(s => s.path.includes('error'));
    const responsiveScreenshots = this.screenshots.filter(s => s.path.includes('responsive'));

    if (gameScreenshots.length > 0) {
      report += `\n🎮 Captures de jeux: ${gameScreenshots.length}\n`;
      gameScreenshots.forEach(s => {
        report += `  - ${s.path}\n`;
      });
    }

    if (websiteScreenshots.length > 0) {
      report += `\n🌐 Captures du site: ${websiteScreenshots.length}\n`;
      websiteScreenshots.forEach(s => {
        report += `  - ${s.path}\n`;
      });
    }

    if (responsiveScreenshots.length > 0) {
      report += `\n📱 Captures responsive: ${responsiveScreenshots.length}\n`;
      responsiveScreenshots.forEach(s => {
        report += `  - ${s.path}\n`;
      });
    }

    if (errorScreenshots.length > 0) {
      report += `\n🚨 Captures d'erreurs: ${errorScreenshots.length}\n`;
      errorScreenshots.forEach(s => {
        report += `  - ${s.path}\n`;
      });
    }

    return report;
  }

  // Build per-agent comments to guide follow-up agents based on logs and filenames
  buildAgentComments() {
    const comments = {
      'website-beautifier': [],
      'babylon-game-finisher': [],
      'threejs-game-finisher': [],
      'js2d-game-finisher': [],
      'fixer-agent': []
    };

    for (const s of this.screenshots) {
      const lower = (s.url || '').toLowerCase();

      // Derive a human-friendly description and quick observations from filename/options/logs
      let description = `Capture ${s.options?.width || 1920}x${s.options?.height || 1080}${s.options?.fullscreen ? ' en plein écran' : ''} de ${s.url}`;
      const notes = [];
      let errors = 0, warnings = 0, failed = 0;
      try {
        if (s.logPath && fileBridge.fileExists(s.logPath)) {
          const logTxt = fileBridge.readFile(s.logPath);
          errors = (logTxt.match(/\[pageerror\]/g) || []).length;
          warnings = (logTxt.match(/\[console\] (WARN|WARNING)/gi) || []).length;
          failed = (logTxt.match(/\[requestfailed\]/g) || []).length;
          if (errors) notes.push(`${errors} erreur(s) console/page`);
          if (warnings) notes.push(`${warnings} avertissement(s)`);
          if (failed) notes.push(`${failed} requête(s) réseau en échec`);
        }
      } catch (_) {}

      // Route by type and attach rich context
      const entry = {
        url: s.url,
        image: s.path,
        log: s.logPath,
        description,
        notes,
        priority: errors > 0 || failed > 0 ? 'high' : 'medium'
      };

      if (lower.includes('threejs')) {
        comments['threejs-game-finisher'].push(entry);
        this.emitInterAgentComment('threejs-game-finisher', {
          severity: errors || failed ? 'warning' : 'info',
          url: s.url,
          image: s.path,
          log: s.logPath,
          message: description,
          suggestion: 'Vérifier game3d.js et shaders pour initialisation de frame non-blanche',
          tags: ['render', 'webgl', 'threejs'],
          threadId: `shot:${path.basename(s.path)}`
        });
      } else if (lower.includes('unified-3d') || lower.includes('babylon')) {
        comments['babylon-game-finisher'].push(entry);
        this.emitInterAgentComment('babylon-game-finisher', {
          severity: errors || failed ? 'warning' : 'info',
          url: s.url,
          image: s.path,
          log: s.logPath,
          message: description,
          suggestion: 'Profiler collisions/particules et confirmer stabilité FPS',
          tags: ['render', 'babylonjs'],
          threadId: `shot:${path.basename(s.path)}`
        });
      } else if (lower.includes('2d') || lower.includes('classic') || lower.includes('canvas')) {
        comments['js2d-game-finisher'].push(entry);
        this.emitInterAgentComment('js2d-game-finisher', {
          severity: errors || failed ? 'warning' : 'info',
          url: s.url,
          image: s.path,
          log: s.logPath,
          message: description,
          suggestion: 'Vérifier boucle d’animation et input clavier',
          tags: ['canvas', '2d'],
          threadId: `shot:${path.basename(s.path)}`
        });
      } else {
        comments['website-beautifier'].push(entry);
        this.emitInterAgentComment('website-beautifier', {
          severity: errors || failed ? 'warning' : 'info',
          url: s.url,
          image: s.path,
          log: s.logPath,
          message: description,
          suggestion: 'Contrôler contrastes/typo/espacements et liens cassés',
          tags: ['ui', 'ux', 'css'],
          threadId: `shot:${path.basename(s.path)}`
        });
      }

      // Always route to fixer if we have a log (lets it scan for quick code issues)
      if (s.logPath) {
        comments['fixer-agent'].push(entry);
        this.emitInterAgentComment('fixer-agent', {
          severity: errors || failed ? 'warning' : 'info',
          url: s.url,
          image: s.path,
          log: s.logPath,
          message: `Analyser erreurs/avertissements extraits (${errors}E/${warnings}W/${failed}F)` ,
          suggestion: 'Lint ciblé et corrections automatiques CSS/JS si possible',
          tags: ['lint', 'auto-fix'],
          threadId: `shot:${path.basename(s.path)}`
        });
      }
    }

    return comments;
  }

  async run(instruction) {
    this.log(`📸 Instruction reçue: ${instruction}`);
    
    const analysis = this.analyzeInstruction(instruction);
    this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

    // Appliquer la limite globale de captures pour cette exécution
    this.maxShots = analysis.maxShots || Infinity;

    // Préparer le dossier de lot (honorer "Save under ..." s'il est fourni)
    const directives = this.parseDirectives(instruction);
    if (analysis.maxShots === Infinity && directives.limit != null) {
      analysis.maxShots = directives.limit;
      this.maxShots = directives.limit;
    }
    this.runTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (directives.saveUnderPath) {
      // Respect the provided path literally (no template interpolation)
      const provided = directives.saveUnderPath;
      // If it ends with '/', keep it; otherwise keep as-is
      this.batchDir = provided;
    } else {
      this.batchDir = path.join('.agents', 'logs', 'screenshots', `batch-${this.runTimestamp}`);
    }
    try { fs.mkdirSync(this.batchDir, { recursive: true }); } catch (_) {}

    // Installer Puppeteer si nécessaire
    try {
      execSync('npm list puppeteer', { encoding: 'utf8' });
    } catch (error) {
      this.log('📦 Installation de Puppeteer...', 'info');
      execSync('npm install --save-dev puppeteer', { encoding: 'utf8' });
    }

    // Si des URLs explicites sont fournies, on exécute STRICTEMENT ces URLs
    if (directives.urls && directives.urls.length > 0) {
      for (const url of directives.urls) {
        const safeName = (url.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()) || 'page';
        await this.takeScreenshot(url, safeName, {
          fullPage: !!directives.wantsFullPage,
          fullscreen: !!directives.wantsFullscreen,
          runTests: !!directives.wantsRunTests,
          waitForSelector: directives.wantsRunTests ? 'body' : 'canvas',
          delay: directives.wantsRunTests ? 4000 : 2000
        });
      }
      // Générer et sauvegarder le rapport puis terminer
      const report = this.generateScreenshotReport();
      this.log(report, 'info');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      try { fs.mkdirSync(this.batchDir, { recursive: true }); } catch (_) {}
      const reportPath = path.join(this.batchDir, `screenshot-report-${timestamp}.json`);
      const fullReport = {
        timestamp: new Date().toISOString(),
        instruction,
        analysis,
        screenshots: this.screenshots,
        agentComments: this.buildAgentComments(),
        summary: {
          total: this.screenshots.length,
          games: this.screenshots.filter(s => s.path.includes('game')).length,
          website: this.screenshots.filter(s => s.path.includes('website')).length,
          responsive: this.screenshots.filter(s => s.path.includes('responsive')).length,
          errors: this.screenshots.filter(s => s.path.includes('error')).length
        }
      };
      fileBridge.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
      this.log(`📄 Rapport sauvegardé: ${reportPath}`, 'success');
      this.log(`✅ ${this.screenshots.length} capture(s) d'écran prises avec succès`, 'success');
      return;
    }

    // Prendre les captures d'écran selon l'analyse (mode générique)
    if (analysis.needsAllScreenshots || analysis.needsGameScreenshots) {
      await this.takeGameScreenshots();
    }

    if (analysis.needsAllScreenshots || analysis.needsWebsiteScreenshots) {
      await this.takeWebsiteScreenshots();
    }

    if (analysis.needsAllScreenshots || analysis.needsResponsiveScreenshots) {
      await this.takeResponsiveScreenshots(
        'http://localhost:8000/public/',
        'responsive'
      );
    }

    if (analysis.needsAllScreenshots || analysis.needsErrorScreenshots) {
      await this.takeErrorScreenshots();
    }

    // Générer le rapport
    const report = this.generateScreenshotReport();
    this.log(report, 'info');

    // Sauvegarder le rapport
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join('.agents', 'logs', 'screenshots');
    try { fs.mkdirSync(reportDir, { recursive: true }); } catch (_) {}
    const reportPath = path.join(this.batchDir, `screenshot-report-${timestamp}.json`);
    
    const fullReport = {
      timestamp: new Date().toISOString(),
      instruction,
      analysis,
      screenshots: this.screenshots,
      agentComments: this.buildAgentComments(),
      summary: {
        total: this.screenshots.length,
        games: this.screenshots.filter(s => s.path.includes('game')).length,
        website: this.screenshots.filter(s => s.path.includes('website')).length,
        responsive: this.screenshots.filter(s => s.path.includes('responsive')).length,
        errors: this.screenshots.filter(s => s.path.includes('error')).length
      }
    };

    fileBridge.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
    this.log(`📄 Rapport sauvegardé: ${reportPath}`, 'success');

    this.log(`✅ ${this.screenshots.length} capture(s) d'écran prises avec succès`, 'success');
  }
}

// Exécution de l'agent
const args = process.argv.slice(2);
const instruction = args.join(' ');

if (!instruction) {
  console.error('❌ Instruction requise');
  process.exit(1);
}

const agent = new ScreenshotAgent();
agent.run(instruction);
