# Technical Documentation

Last updated: 2025-08-07

## Overview
- Dev source: `public/`
- Prod build: `dist/`
- Local server: `python -m http.server 8000`
- Main entry (dev): `/public/index.html`
- Tests: `/public/test-suite-comprehensive.html`, `/public/test-modular.html`

## Architecture
- 2D Game (Canvas): modular ES modules in `public/js/modules/`
- 3D Game (Babylon.js): `public/js/babylon-optimized-game.js`
- Test pages and harnesses live under `public/`
- Sync script: `Sync-Folders.ps1` keeps `dist/` updated

## Key Modules (2D)
- `GameCore`: orchestrates managers; methods: `init(canvas)`, events setup, loop
- `GameState`: state/config; methods: `init()`, `reset()`, getters/setters
- `LetterManager`: grid/letters; methods: `init()`, `createGrid()`, `generateLetterQueue()`
- `WordManager`: word detection; core operations on grid letters
- `ScoreManager`: scoring & combos
- `LevelManager`: progression, speed tuning
- `UIManager`: effects, notifications, themes
- `AudioManager` (Enhanced): `init()`, `playSound(name)`, `playMusic(name)`, `playGameplayMusic()`, `setSoundVolume(v)`, `setMusicVolume(v)`, `mute()`, `unmute()`; WebAudio with HTML5 fallback
- `AnalyticsManager`: session + metrics
- `BackgroundManager`: background image and parallax

## 3D Engine (BabylonOptimizedGame)
- Fallbacks: WebGL check + graceful UI
- Camera/lighting/environment optimized
- Performance monitor hooks; glow and emissive materials

## Running Locally
```
python -m http.server 8000
# Dev URLs
/public/index.html
/public/test-suite-comprehensive.html
/public/test-optimized-3d-game.html
/public/test-modular.html
```

## Build/Sync to Prod
```
powershell -ExecutionPolicy Bypass -File "Sync-Folders.ps1" -Verbose
# Then open /dist/index.html (same relative structure as public)
```

## File Structure (simplified)
```
public/
  index.html
  test-suite-comprehensive.html
  test-optimized-3d-game.html
  test-modular.html
  js/
    babylon-optimized-game.js
    modules/
      GameCore.js, GameState.js, LetterManager.js, ...
  images/
  docs/
    index.html
    md/
      technical-documentation.md
      user-guide.md
      api-reference.md
      deployment-guide.md
      testing-guide.md
      troubleshooting.md
```

## Performance & Compatibility
- Target 60 FPS; buffer allocations reduced; object pooling (`MemoryManager`)
- Audio fallbacks, WebGL fallback UI
- Mobile: responsive UIs; touch-friendly controls planned in Phase 6

## Security & QA (Phase 6)
- Static hosting recommended; no secrets in repo
- Manual review for third-party links; CSP can be added later

## Next
- Expand automated tests coverage
- Accessibility audit (WCAG 2.1 AA)
- Document API details per manager in `api-reference.md`
