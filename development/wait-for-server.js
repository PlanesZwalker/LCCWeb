#!/usr/bin/env node

// Simple utility to wait until a local HTTP server responds before continuing.
// Usage:
//   node wait-for-server.js --url http://localhost:8000/public/index.html --timeout 90000 --interval 1000

const http = require('http');
const https = require('https');
const { URL } = require('url');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const part = argv[i];
    if (!part.startsWith('--')) continue;
    const [key, ...rest] = part.replace(/^--/, '').split('=');
    const next = rest.length ? rest.join('=') : argv[i + 1]?.startsWith('--') ? undefined : argv[++i];
    args[key] = next === undefined ? true : next;
  }
  return args;
}

async function waitForServer(options) {
  const {
    url,
    timeoutMs = 120000,
    intervalMs = 1000,
    requestTimeoutMs = 5000,
    expectStatus = 200,
    silent = false,
  } = options;

  let target;
  try {
    target = new URL(url);
  } catch (err) {
    console.error(`Invalid URL: ${url}`);
    process.exit(2);
  }

  const lib = target.protocol === 'https:' ? https : http;

  const started = Date.now();
  if (!silent) {
    console.log(`Waiting for server at ${url} (timeout ${timeoutMs} ms, every ${intervalMs} ms)...`);
  }

  function checkOnce() {
    return new Promise((resolve) => {
      const req = lib.get(
        {
          hostname: target.hostname,
          port: target.port || (target.protocol === 'https:' ? 443 : 80),
          path: target.pathname + (target.search || ''),
          headers: { 'User-Agent': 'wait-for-server/1.0' },
        },
        (res) => {
          // Accept 2xx; optionally accept 3xx as alive as well
          const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 400;
          res.resume();
          resolve(ok && (expectStatus ? res.statusCode === Number(expectStatus) : true));
        }
      );
      req.on('error', () => resolve(false));
      req.setTimeout(requestTimeoutMs, () => {
        req.destroy(new Error('request timeout'));
        resolve(false);
      });
    });
  }

  // Poll until timeout
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ok = await checkOnce();
    if (ok) {
      if (!silent) {
        console.log(`Server at ${url} is up!`);
        console.log('Server is ready. Proceeding with tests.');
      }
      return true;
    }
    if (Date.now() - started >= timeoutMs) {
      console.error(`Timed out after ${timeoutMs} ms waiting for ${url}`);
      return false;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

(async () => {
  const args = parseArgs(process.argv);
  const url =
    args.url ||
    process.env.BASE_URL ||
    process.env.SERVER_URL ||
    'http://localhost:8000/public/index.html';
  const timeoutMs = Number(args.timeout || args.timeoutMs || 120000);
  const intervalMs = Number(args.interval || args.intervalMs || 1000);
  const requestTimeoutMs = Number(args.requestTimeout || args.requestTimeoutMs || 5000);
  const expectStatus = args.expectStatus ? Number(args.expectStatus) : 0;
  const silent = Boolean(args.silent || false);

  const ok = await waitForServer({
    url,
    timeoutMs,
    intervalMs,
    requestTimeoutMs,
    expectStatus,
    silent,
  });
  process.exit(ok ? 0 : 1);
})();


