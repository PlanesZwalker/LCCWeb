# Guide de Dépannage

## Problèmes Communs
- **Erreur de test**: Lancer `npm test` (E2E) et vérifier la page `/public/test-suite-comprehensive.html`.
- **Problèmes de performance**: Viser 60 FPS (2D) et 30–60 FPS (3D).

## Solutions
- Accessibilité: Corriger les erreurs signalées dans la section A11y des tests.

## 3D does not load
- WebGL may be unavailable. Use latest Chrome/Firefox/Edge/Safari
- The game shows a fallback UI with suggestions

## No sound
- Some browsers block autoplay. Interact with the page (click) first
- Use `Audio` controls to unmute; check system volume
 - On iOS/Safari, audio requires a user gesture; cliquer sur l’écran puis relancer la musique.

## 404 for assets
- Ensure `dist/` is synced from `public/`
- Paths are relative to `/public/` during local dev
 - En production, déployer tout le dossier `dist/` (y compris `images/`, `js/`, `css/`).

## Performance is low
- Close other heavy tabs
- Use desktop GPU if possible; reduce effects
 - Désactiver les ombres/post-process (3D) si le mode qualité est disponible.

## General
- Clear cache (Ctrl+F5)
- Check console for errors
 - Essayer un autre navigateur pour comparer.
