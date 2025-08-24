# Deployment Guide

## Prerequisites
- Static hosting (GitHub Pages, Netlify, Vercel, or any static server)

## Build (Sync) Steps
1. From project root (Windows):
```
npm run build
```
2. Verify `dist/` mirrors `public/` updates. Alternative manual sync:
```
powershell -ExecutionPolicy Bypass -File "Sync-Folders.ps1" -Verbose
```

## Deploy
- Upload `dist/` contents to your static host
- Ensure correct base path: root `/` recommended

## Caching
- Bust cache by appending `?_=` to URLs during testing if needed
- Consider adding version query params for assets in production

## Scripts
- `npm run build`: copies `public/` to `dist/` and prepares for prod
- `npm run dist:check`: checks `dist/` health, `npm run dist:fix` to repair
