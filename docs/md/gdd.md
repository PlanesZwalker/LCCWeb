# Game Design Document (GDD) – Letters Cascade Challenge

> Version courte restaurée depuis la maquette actuelle pour remplacer l'ancien `GDD.html`. Cette page centralise les règles, boucles de jeu et UX clés.

## Vision
- Jeu poétique de lettres qui chutent comme une cascade. Objectif : former des mots français valides pour marquer des points, avancer de niveau et découvrir un univers 2D/3D inspiré nature (rivière, cascade, arbres, rochers).

## Versions jouables
- 2D Canvas (classique et rapide).
- 3D Babylon.js (environnement rivi�re/cascade, lettres volum�triques).
- 3D Three.js (environnement naturel simplifi�).

## Boucle de jeu
1. Des lettres tombent (distribution selon liste de mots cible et équilibrage de niveau).
2. Le joueur place/dirige les lettres pour former des mots horizontaux/verticaux.
3. Un mot valide est détecté, retiré de la grille ; score ajouté ; progression mise à jour.
4. La difficulté augmente par niveaux (vitesse, distribution, objectifs).

## Règles et scoring
- Mots valides : issus de la liste cible du niveau (FR).
- Score de base 2D : points en fonction de la longueur du mot, bonus pour lettres rares ; combos et séries augmentent le score. 3D (Babylon/Three) peut appliquer un bonus +25% (optionnel selon version).
- Fin : la pile atteint le haut (2D) ou limite (3D). Victoire : tous les mots de la liste trouvés.

## Contrôles
- 2D : Flèches (gauche/droite/bas), Entrée/Espace pour placer, R pour rotation, P/Echap pour pause. Aperçu des prochaines lettres.
- 3D Babylon : Souris (rotation), molette (zoom), clic (interaction), R (reset caméra), F (plein écran), P (pause).
- 3D Three.js : équivalent Babylon.

## Distribution des lettres
- Pondération par fréquences des lettres présentes dans les mots cibles du niveau.
- Anti-répétition (mémoire récente) et file d’aperçu (2D).

## UX & UI
- Thème sombre uniforme ; composants glassmorphism ; navigation unifiée.
- Panneaux : Score/Niveau, Mots trouvés, Mots cibles, Performance, Prochaines lettres (2D).
- Crédit visuel automatique « Cascade Letters – Kris VOID » pour les images correspondantes.

## Audio
- Gestion robuste avec alias et synthèse de secours si assets manquants.

## Tests
- Suite navigateur : unitaires (AudioManager, GameBridge), perf (FPS), a11y (axe-core).

## Production
- Répertoire `dist/` nettoyé et synchronisé. Entrées : `index.html`, `classic-2d-game-enhanced.html`, `unified-3d-game.html`, `threejs-3d-game.html`.

---
Notes : Cette GDD courte remplace l’ancien `GDD.html`. Pour une version complète : niveaux/combos/power-ups, progression campagne, economy loop, UX flows, accessibilité, localisation, QA.
