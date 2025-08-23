# Free Deployment Guide

Complete free deployment setup for Letters Cascade Challenge.

## Quick Start

1. **Deploy Frontend to GitHub Pages**
2. **Deploy Backend to Railway** 
3. **Set up Local Ollama + ngrok**
4. **Configure URLs**

## Step 1: GitHub Pages

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Then enable GitHub Pages in repository settings.

## Step 2: Railway Backend

```bash
cd backend
npm install -g @railway/cli
railway login
railway up
```

## Step 3: Local Ollama + ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start Ollama
ollama serve

# Expose with ngrok
ngrok http 11434
```

## Step 4: Configure URLs

Update `public/config.js` with your Railway and ngrok URLs.

## Cost: $0/month! 🎉
