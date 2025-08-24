# 🎮 Écosystème d'Agents Intelligents pour le Développement de Jeux

Un système d'agents spécialisés pour automatiser et optimiser le développement de jeux web avec Babylon.js, Three.js et Canvas 2D.

## 🚀 Installation

```bash
# Exécuter le script d'installation
./setup.sh

# Ou manuellement
npm install
chmod +x tools/bin/agent-run.js
chmod +x tools/agents/*.js
```

## 📋 Agents Disponibles

### 🤖 babylon-game-finisher
**Expert Babylon.js pour finaliser le jeu 3D**

**Tâches principales :**
- Optimiser performances 3D
- Ajouter effets visuels et particules
- Corriger bugs de collision
- Améliorer contrôles utilisateur

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js babylon-game-finisher "Optimise scene.js et corrige les bugs de collision"
node tools/bin/agent-run.js babylon-game-finisher "Ajoute des effets visuels avancés"
```

### 🎯 threejs-game-finisher
**Expert Three.js pour finaliser le jeu 3D alternatif**

**Tâches principales :**
- Optimiser rendu et draw calls
- Implémenter shaders personnalisés
- Ajouter effets post-processing
- Profiling des performances

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js threejs-game-finisher "Profile les performances et optimise le rendu"
node tools/bin/agent-run.js threejs-game-finisher "Crée des shaders optimisés"
```

### 📱 js2d-game-finisher
**Expert JS modules pour finaliser le jeu 2D**

**Tâches principales :**
- Optimiser architecture modulaire
- Ajouter animations fluides
- Créer système de score et progression
- Adapter pour mobile

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js js2d-game-finisher "Optimise l'architecture modulaire"
node tools/bin/agent-run.js js2d-game-finisher "Ajoute des animations fluides"
```

### 🎨 website-beautifier
**Designer UI/UX pour embellir le site web**

**Tâches principales :**
- Redesign interface moderne
- Design responsive mobile
- Animations CSS avancées
- Optimisation CSS/JS

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js website-beautifier "Modernise l'interface et ajoute des animations"
node tools/bin/agent-run.js website-beautifier "Audit responsive design et corrige les problèmes"
```

### 🧪 test-runner
**Exécuteur de tests automatisés**

**Tâches principales :**
- Tests unitaires (Jest, Mocha, Vitest)
- Tests end-to-end (Cypress, Playwright)
- Tests de performance (Lighthouse)
- Tests d'accessibilité (axe-core)

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js test-runner "Exécute tous les tests disponibles"
node tools/bin/agent-run.js test-runner "Lance les tests de performance et d'accessibilité"
```

### 📸 screenshot-agent
**Agent de capture d'écran pour analyse visuelle**

**Tâches principales :**
- Captures d'écran des jeux
- Captures responsive (desktop, tablet, mobile)
- Analyse d'erreurs visuelles
- Comparaison avant/après

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js screenshot-agent "Prend des captures d'écran de tous les jeux"
node tools/bin/agent-run.js screenshot-agent "Captures responsive du site web"
```

### 🔧 fixer-agent
**Agent de correction automatique des problèmes**

**Tâches principales :**
- Correction de linting (ESLint)
- Correction CSS (syntaxe, duplications)
- Correction JavaScript (syntaxe, variables)
- Correction d'accessibilité (HTML, ARIA)

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js fixer-agent "Corrige automatiquement tous les problèmes détectés"
node tools/bin/agent-run.js fixer-agent "Corrige les problèmes de linting et CSS"
```

### 🎯 project-coordinator
**Coordinateur technique pour gérer la cohérence globale**

**Tâches principales :**
- Analyser état des projets
- Prioriser les tâches critiques
- Assurer cohérence entre jeux
- Générer roadmaps

**Exemples d'usage :**
```bash
node tools/bin/agent-run.js project-coordinator "Analyse tous les projets et génère un rapport d'état"
node tools/bin/agent-run.js project-coordinator "Crée une roadmap de développement"
```

## 🛠️ Commandes Utiles

### Liste des agents
```bash
node tools/bin/agent-run.js --list
```

### Audit complet multi-agents
```bash
node tools/bin/agent-run.js --audit
```

### Workflow de tests complet
```bash
node tools/bin/test-workflow.js
```

Cette commande exécute automatiquement :
1. **Tests unitaires et E2E** - Vérifie le bon fonctionnement du code
2. **Captures d'écran** - Prend des captures des jeux et pages
3. **Correction automatique** - Corrige les problèmes détectés
4. **Audit final** - Relance les tests pour vérifier les corrections

Le workflow génère un rapport détaillé dans `tools/logs/workflow-report-*.json`

### Mode dry-run (simulation)
```bash
node tools/agent-run.js website-beautifier "Modernise l'interface" --dry-run
```

### Aide
```bash
node tools/agent-run.js --help
```

## 📁 Structure des Fichiers

```
tools/
├── agent-run.js              # CLI principal
├── file-bridge.js            # API d'accès aux fichiers
├── agents/                   # Agents spécialisés
│   ├── babylon-game-finisher.js
│   ├── threejs-game-finisher.js
│   ├── js2d-game-finisher.js
│   ├── website-beautifier.js
│   └── project-coordinator.js
├── logs/                     # Logs d'exécution
│   ├── agent-executions.log
│   └── file-bridge.log
└── README.md                 # Cette documentation
```

## 🔧 Fonctionnalités Avancées

### File Bridge API
L'API `file-bridge.js` fournit des méthodes sécurisées pour :
- Lire/écrire des fichiers
- Lister les fichiers d'un répertoire
- Sauvegarder/restaurer des fichiers
- Scanner les projets de jeux

### Analyse Intelligente
Chaque agent analyse automatiquement les instructions pour :
- Détecter les mots-clés pertinents
- Déterminer les priorités
- Appliquer les optimisations appropriées

### Logging Complet
Toutes les actions sont loggées avec :
- Timestamp précis
- Agent responsable
- Instructions exécutées
- Résultats obtenus

## 🎯 Workflows Recommandés

### 1. Audit Initial
```bash
# Analyser l'état actuel
node tools/agent-run.js project-coordinator "Analyse tous les projets"

# Audit complet multi-agents
node tools/agent-run.js --audit
```

### 2. Optimisation Babylon.js
```bash
# Optimiser les performances
node tools/agent-run.js babylon-game-finisher "Optimise les performances et corrige les collisions"

# Ajouter des effets visuels
node tools/agent-run.js babylon-game-finisher "Ajoute des effets de particules et de post-processing"
```

### 3. Modernisation UI
```bash
# Moderniser l'interface
node tools/agent-run.js website-beautifier "Modernise l'interface avec des animations fluides"

# Améliorer le responsive
node tools/agent-run.js website-beautifier "Optimise le design responsive pour mobile"
```

### 4. Coordination Finale
```bash
# Synchroniser les assets
node tools/agent-run.js project-coordinator "Synchronise les assets entre tous les projets"

# Préparer le déploiement
node tools/agent-run.js project-coordinator "Prépare le déploiement final"
```

## 🔒 Sécurité

- **Sauvegarde automatique** : Tous les fichiers modifiés sont sauvegardés avant modification
- **Mode dry-run** : Testez les modifications sans les appliquer
- **Logs détaillés** : Traçabilité complète de toutes les actions
- **Validation des fichiers** : Vérification de l'existence des fichiers avant modification

## 🚀 Intégration avec MCP

Ce système s'intègre parfaitement avec les agents MCP configurés dans `~/.cursor/mcp.json` :

- **game-finisher** : Pour les optimisations de jeux
- **ui-designer** : Pour les améliorations UI/UX
- **project-optimizer** : Pour la coordination globale

## 💡 Conseils d'Utilisation

1. **Commencez par un audit** : Utilisez `--audit` pour évaluer l'état global
2. **Testez en mode dry-run** : Utilisez `--dry-run` avant d'appliquer des modifications
3. **Consultez les logs** : Vérifiez `tools/logs/` pour le suivi des actions
4. **Combinez les agents** : Utilisez plusieurs agents pour des optimisations complètes
5. **Personnalisez les agents** : Modifiez les agents dans `tools/agents/` selon vos besoins

## 🔄 Mise à Jour

Pour mettre à jour l'écosystème :

```bash
# Mettre à jour les agents
git pull origin main

# Réinstaller les dépendances
npm install

# Tester le système
node tools/agent-run.js --list
```

## 🆘 Dépannage

### Problème : Agent non trouvé
```bash
# Vérifier que l'agent existe
ls tools/agents/

# Vérifier les permissions
chmod +x tools/agents/*.js
```

### Problème : Erreur de fichier
```bash
# Vérifier la structure
ls -la tools/

# Vérifier les logs
cat tools/logs/file-bridge.log
```

### Problème : Modifications non appliquées
```bash
# Vérifier le mode dry-run
node tools/agent-run.js <agent> "<instruction>" --dry-run

# Vérifier les permissions d'écriture
ls -la public/css/
```

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs dans `tools/logs/`
2. Vérifiez la documentation des agents individuels
3. Testez en mode dry-run pour diagnostiquer
4. Consultez les exemples d'usage ci-dessus

---

**🎮 Développez vos jeux avec intelligence !**
