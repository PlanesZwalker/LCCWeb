#!/bin/bash

echo "🚀 Installation de l'écosystème d'agents intelligents..."

# Configuration
TOOLS_DIR="tools"
AGENTS_DIR="tools/agents"
LOGS_DIR="tools/logs"
PROJECTS=("babylon-game" "threejs-game" "js2d-game" "website")
COMMANDS=("agent-run.js" "file-bridge.js")

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log coloré
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

log "📁 Création des répertoires nécessaires..."

# Créer les répertoires s'ils n'existent pas
mkdir -p "$TOOLS_DIR"
mkdir -p "$AGENTS_DIR"
mkdir -p "$LOGS_DIR"

# Créer les projets s'ils n'existent pas
for project in "${PROJECTS[@]}"; do
    if [ ! -d "$project" ]; then
        mkdir -p "$project"
        log "📁 Projet '$project' créé."
    else
        log "📁 Projet '$project' existe déjà."
    fi
done

log "🔧 Configuration des permissions d'exécution..."

# Donner les permissions d'exécution aux scripts
for file in "${COMMANDS[@]}"; do
    if [ -f "$TOOLS_DIR/$file" ]; then
        chmod +x "$TOOLS_DIR/$file"
        log "✅ Permissions exécution: $file"
    else
        warn "⚠️ Fichier non trouvé: $file"
    fi
done

# Donner les permissions aux agents
for agent_file in "$AGENTS_DIR"/*.js; do
    if [ -f "$agent_file" ]; then
        chmod +x "$agent_file"
        log "✅ Permissions exécution: $(basename "$agent_file")"
    fi
done

log "📦 Installation des dépendances..."

# Vérifier si npm est disponible
if command -v npm &> /dev/null; then
    # Installer les dépendances si package.json existe
    if [ -f "package.json" ]; then
        npm install
        log "✅ Dépendances npm installées."
    else
        warn "⚠️ package.json non trouvé, création d'un nouveau..."
        echo '{
  "name": "game-development-agents",
  "version": "1.0.0",
  "description": "Système d\'agents intelligents pour le développement de jeux",
  "scripts": {
    "agent:list": "node tools/agent-run.js --list",
    "agent:audit": "node tools/agent-run.js --audit",
    "agent:run": "node tools/agent-run.js",
    "test": "echo \"Tests à implémenter\"",
    "test:e2e": "echo \"Tests E2E à implémenter\"",
    "lint": "echo \"Linting à implémenter\""
  },
  "dependencies": {},
  "devDependencies": {}
}' > package.json
        log "✅ Nouveau package.json créé."
    fi
else
    error "❌ npm non trouvé. Veuillez installer Node.js et npm."
    exit 1
fi

log "🔗 Création des alias de commandes..."

# Créer des alias pour faciliter l'usage
create_alias() {
    local alias_name="$1"
    local command="$2"
    local alias_file="$HOME/.bashrc"
    
    # Ajouter l'alias au .bashrc
    if ! grep -q "alias $alias_name=" "$alias_file" 2>/dev/null; then
        echo "alias $alias_name='$command'" >> "$alias_file"
        log "✅ Alias créé: $alias_name"
    else
        log "ℹ️ Alias $alias_name existe déjà."
    fi
}

# Créer les alias utiles
PROJECT_ROOT=$(pwd)
create_alias "agent-run" "node $PROJECT_ROOT/tools/agent-run.js"
create_alias "agent-list" "node $PROJECT_ROOT/tools/agent-run.js --list"
create_alias "agent-audit" "node $PROJECT_ROOT/tools/agent-run.js --audit"

log "📋 Vérification de l'installation..."

# Vérifier que tous les composants sont en place
missing_files=()

# Vérifier les fichiers principaux
for file in "${COMMANDS[@]}"; do
    if [ ! -f "$TOOLS_DIR/$file" ]; then
        missing_files+=("$TOOLS_DIR/$file")
    fi
done

# Vérifier les agents
agent_files=("$AGENTS_DIR/babylon-game-finisher.js" "$AGENTS_DIR/website-beautifier.js" "$AGENTS_DIR/project-coordinator.js")
for agent_file in "${agent_files[@]}"; do
    if [ ! -f "$agent_file" ]; then
        missing_files+=("$agent_file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    log "✅ Tous les fichiers requis sont présents."
else
    warn "⚠️ Fichiers manquants:"
    for file in "${missing_files[@]}"; do
        warn "   - $file"
    done
fi

log "🧪 Test de fonctionnement..."

# Tester le système d'agents
if node "$TOOLS_DIR/agent-run.js" --list &> /dev/null; then
    log "✅ Système d'agents fonctionnel."
else
    error "❌ Erreur lors du test du système d'agents."
fi

echo ""
echo "🎉 Installation terminée avec succès!"
echo ""
echo "📖 UTILISATION:"
echo "==============="
echo "• Liste des agents:    agent-list"
echo "• Audit complet:       agent-audit"
echo "• Exécuter un agent:   agent-run <nom-agent> \"<instruction>\""
echo ""
echo "🔧 EXEMPLES:"
echo "============"
echo "• agent-run babylon-game-finisher \"Optimise les performances\""
echo "• agent-run website-beautifier \"Modernise l'interface\""
echo "• agent-run project-coordinator \"Analyse tous les projets\""
echo ""
echo "📁 STRUCTURE:"
echo "============="
echo "• tools/agents/     - Agents spécialisés"
echo "• tools/logs/       - Logs d'exécution"
echo "• babylon-game/     - Projet Babylon.js"
echo "• threejs-game/     - Projet Three.js"
echo "• js2d-game/        - Projet 2D"
echo "• website/          - Site web"
echo ""
echo "💡 Pour activer les alias, redémarrez votre terminal ou exécutez:"
echo "   source ~/.bashrc"
echo ""
