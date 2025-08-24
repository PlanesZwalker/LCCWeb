# Setting up Real Ollama Access for GitHub Pages

## Option 1: Cloudflare Tunnel (Recommended)

### Step 1: Install Cloudflare Tunnel
```bash
# Download and install cloudflared
# Windows: Download from https://github.com/cloudflare/cloudflared/releases
# Or use winget:
winget install Cloudflare.cloudflared
```

### Step 2: Authenticate with Cloudflare
```bash
cloudflared tunnel login
```

### Step 3: Create a tunnel for Ollama
```bash
cloudflared tunnel create ollama-tunnel
```

### Step 4: Configure the tunnel
Create a file `tunnel-config.yml`:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/your/tunnel-credentials.json

ingress:
  - hostname: ollama.yourdomain.com
    service: http://localhost:11434
  - service: http_status:404
```

### Step 5: Start the tunnel
```bash
cloudflared tunnel run ollama-tunnel
```

### Step 6: Update your GitHub Pages configuration
Update the backend API to use the tunnel URL:

```javascript
// In api/backend.js
const OLLAMA_TUNNEL_URL = 'https://ollama.yourdomain.com';

// Update the API calls to use the tunnel
const modelsResponse = await fetch(`${OLLAMA_TUNNEL_URL}/api/tags`);
```

## Option 2: ngrok (Alternative)

### Step 1: Install ngrok
```bash
# Download from https://ngrok.com/download
# Or use winget:
winget install ngrok.ngrok
```

### Step 2: Start ngrok tunnel
```bash
ngrok http 11434
```

### Step 3: Use the provided URL
ngrok will give you a URL like `https://abc123.ngrok.io`
Update your API calls to use this URL.

## Option 3: LocalTunnel

### Step 1: Install LocalTunnel
```bash
npm install -g localtunnel
```

### Step 2: Start tunnel
```bash
lt --port 11434 --subdomain your-ollama
```

## Security Considerations

⚠️ **Important**: Exposing your local Ollama server to the internet has security implications:

1. **Authentication**: Add authentication to your Ollama server
2. **Rate Limiting**: Implement rate limiting
3. **CORS**: Configure CORS properly
4. **HTTPS**: Always use HTTPS for production

## Recommended Setup

1. Use **Cloudflare Tunnel** (most reliable)
2. Set up a custom domain
3. Add authentication to Ollama
4. Configure CORS headers

## Quick Test

After setting up the tunnel, test it:
```bash
curl https://your-tunnel-url/api/tags
```

You should see your local models listed.
