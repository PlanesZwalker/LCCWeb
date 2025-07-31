# 🚀 Deployment Guide

## Overview

This guide covers deploying the **Letters Cascade Challenge** game to various hosting platforms and environments. The game is designed as a static web application that can be deployed to any modern hosting service.

## 📦 Production Build

### Building for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The dist/ folder now contains all production files
```

### Build Output

The `dist/` folder contains:
- **Optimized HTML files** (minified)
- **Compressed JavaScript** (bundled and minified)
- **Optimized CSS** (minified and compressed)
- **Compressed assets** (images, fonts)
- **Webpack bundles** (with content hashing)

### Build Verification

```bash
# Check build output
ls -la dist/

# Verify file sizes
du -sh dist/*

# Test production build locally
npx serve dist/
```

## 🌐 Hosting Platforms

### GitHub Pages

#### Automatic Deployment
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Navigate to Pages section
   - Select source: "Deploy from a branch"
   - Choose branch: `main`
   - Select folder: `/ (root)`
   - Save

3. **Configure for dist/ folder**:
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '16'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

#### Manual Deployment
```bash
# Build the project
npm run build

# Copy dist/ contents to gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### Netlify

#### Automatic Deployment
1. **Connect Repository**:
   - Sign up at netlify.com
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 16
   ```

3. **Environment Variables** (optional):
   ```
   NODE_ENV=production
   NPM_FLAGS=--production
   ```

#### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy --dir=dist --prod
```

### Vercel

#### Automatic Deployment
1. **Connect Repository**:
   - Sign up at vercel.com
   - Import your GitHub repository
   - Vercel auto-detects the build settings

2. **Configure Build Settings**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### AWS S3 + CloudFront

#### Setup S3 Bucket
```bash
# Create S3 bucket
aws s3 mb s3://your-game-bucket

# Enable static website hosting
aws s3 website s3://your-game-bucket \
  --index-document index.html \
  --error-document 404.html
```

#### Deploy to S3
```bash
# Build project
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-game-bucket \
  --delete \
  --cache-control "max-age=31536000"

# Make files public
aws s3 cp dist/ s3://your-game-bucket \
  --recursive \
  --acl public-read
```

#### Setup CloudFront
1. **Create Distribution**:
   - Origin: S3 bucket
   - Viewer protocol: Redirect HTTP to HTTPS
   - Default root object: index.html

2. **Configure Cache**:
   - Cache based on selected request headers
   - Add custom headers for cache control

### Firebase Hosting

#### Setup Firebase
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting
```

#### Configure firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### Deploy
```bash
# Build project
npm run build

# Deploy to Firebase
firebase deploy
```

## 🔧 Environment Configuration

### Environment Variables

Create `.env.production`:
```env
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Build Configuration

Update `webpack.config.js` for production:
```javascript
const webpack = require('webpack');

module.exports = {
  // ... existing config
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL)
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

## 📱 Progressive Web App (PWA)

### Create manifest.json
```json
{
  "name": "Letters Cascade Challenge",
  "short_name": "LCC Game",
  "description": "A modern word puzzle game with 2D/3D modes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#4facfe",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add Service Worker
Create `public/sw.js`:
```javascript
const CACHE_NAME = 'lcc-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/unified-game.html',
  '/css/shared.css',
  '/js/index.js',
  '/js/game3d.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### Register Service Worker
Add to `public/index.html`:
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>
```

## 🔒 Security Configuration

### Content Security Policy
Add to HTML files:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:;">
```

### HTTPS Enforcement
```javascript
// Redirect HTTP to HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### Security Headers
For Apache (.htaccess):
```apache
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

For Nginx:
```nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## 📊 Performance Optimization

### Image Optimization
```bash
# Install image optimization tools
npm install -g imagemin-cli

# Optimize images
imagemin public/images/* --out-dir=dist/images
```

### Compression
```bash
# Install compression middleware
npm install compression

# Add to server configuration
const compression = require('compression');
app.use(compression());
```

### CDN Configuration
```html
<!-- Use CDN for external libraries -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>
```

## 🧪 Testing Deployment

### Pre-deployment Checklist
- [ ] All tests pass (`npm test`)
- [ ] Build completes without errors (`npm run build`)
- [ ] Production build works locally (`npx serve dist/`)
- [ ] All assets load correctly
- [ ] Game functionality works in production
- [ ] Performance metrics are acceptable

### Post-deployment Testing
```bash
# Test production URL
curl -I https://your-domain.com

# Check for 404 errors
curl -I https://your-domain.com/nonexistent-page

# Verify HTTPS redirect
curl -I http://your-domain.com
```

### Performance Monitoring
```javascript
// Add performance monitoring
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
});
```

## 🔄 Continuous Deployment

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
      - run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
```

## 📈 Monitoring and Analytics

### Google Analytics
Add to HTML files:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Error Tracking
```javascript
// Add error tracking
window.addEventListener('error', (event) => {
  console.error('Game error:', event.error);
  // Send to error tracking service
});
```

### Performance Monitoring
```javascript
// Monitor game performance
const gameMetrics = {
  frameRate: 0,
  memoryUsage: 0,
  loadTime: 0
};

// Track frame rate
let frameCount = 0;
let lastTime = performance.now();

function trackPerformance() {
  frameCount++;
  const currentTime = performance.now();
  
  if (currentTime - lastTime >= 1000) {
    gameMetrics.frameRate = frameCount;
    frameCount = 0;
    lastTime = currentTime;
  }
  
  requestAnimationFrame(trackPerformance);
}

trackPerformance();
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 404 Errors
- Check file paths in HTML
- Verify all assets are copied to dist/
- Check server configuration for SPA routing

#### Performance Issues
- Optimize image sizes
- Enable gzip compression
- Use CDN for external libraries
- Implement lazy loading

#### HTTPS Issues
- Ensure SSL certificate is valid
- Check mixed content warnings
- Verify CSP headers

### Debug Commands
```bash
# Check build output
ls -la dist/

# Test local server
npx serve dist/

# Check file sizes
du -sh dist/*

# Validate HTML
npx html-validate dist/*.html

# Check for broken links
npx broken-link-checker http://localhost:3000
```

---

*This deployment guide covers the most common hosting scenarios. For platform-specific issues, refer to the hosting provider's documentation.* 