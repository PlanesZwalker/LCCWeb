// Minimal Ollama HTTP client (no external deps)
// Env: OLLAMA_HOST (default: http://127.0.0.1:11434)

const http = require('http');
const https = require('https');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

function postJSON(urlString, payload) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlString);
      const body = Buffer.from(JSON.stringify(payload));
      const isHttps = u.protocol === 'https:';
      const req = (isHttps ? https : http).request(
        {
          hostname: u.hostname,
          port: u.port || (isHttps ? 443 : 80),
          path: u.pathname + (u.search || ''),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
          },
        },
        (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const json = JSON.parse(data || '{}');
              resolve(json);
            } catch (e) {
              reject(new Error(`Invalid JSON from Ollama (${res.statusCode}): ${e.message}`));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function chat({ model, messages, options }) {
  const url = `${OLLAMA_HOST}/api/chat`;
  const resp = await postJSON(url, {
    model,
    messages,
    stream: false,
    options: options || { temperature: 0.2 },
  });
  const content = resp?.message?.content || '';
  return content;
}

module.exports = {
  OLLAMA_HOST,
  chat,
};


