#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// === CONFIGURATION ===
const AGENTS_PATH = path.resolve(__dirname, 'agents');
const LOGS_PATH = path.resolve(__dirname, 'logs');

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_PATH)) {
    fs.mkdirSync(LOGS_PATH, { recursive: true });
  }
}

function logExecution(agentName, instruction, success, error = null) {
  ensureLogsDir();
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    agent: agentName,
    instruction,
    success,
    error: error?.message || null
  };
  
  const logFile = path.join(LOGS_PATH, 'agent-executions.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

function printHelp() {
  console.log(`
🎮 Agent Runner - Système d'agents intelligents pour le développement de jeux

Usage:
  node tools/agent-run.js <agent-name> "<instruction>"
  node tools/agent-run.js --list
  node tools/agent-run.js --audit

Agents disponibles:
  babylon-game-finisher    - Expert Babylon.js pour finaliser le jeu 3D
  threejs-game-finisher    - Expert Three.js pour finaliser le jeu 3D alternatif
  js2d-game-finisher       - Expert JS modules pour finaliser le jeu 2D
  website-beautifier       - Designer UI/UX pour embellir le site web
  project-coordinator      - Coordinateur technique pour gérer la cohérence globale

Examples:
  node tools/agent-run.js babylon-game-finisher "Optimise scene.js et corrige les bugs de collision"
  node tools/agent-run.js website-beautifier "Audit responsive design et modernise l'interface"
  node tools/agent-run.js project-coordinator "Analyse tous les projets et propose une roadmap"
  node tools/agent-run.js --audit

Options:
  --list                   Liste tous les agents disponibles
  --audit                  Lance un audit complet multi-agents
  --dry-run               Simule l'exécution sans modifier les fichiers
`);
}

function listAgents() {
  console.log('\n📋 Agents disponibles:\n');
  
  const agents = [
    {
      name: 'babylon-game-finisher',
      description: 'Expert Babylon.js pour finaliser le jeu 3D',
      tasks: ['Optimiser performances 3D', 'Ajouter effets visuels', 'Corriger bugs de collision']
    },
    {
      name: 'threejs-game-finisher', 
      description: 'Expert Three.js pour finaliser le jeu 3D alternatif',
      tasks: ['Optimiser rendu', 'Implémenter shaders', 'Profiling des performances']
    },
    {
      name: 'js2d-game-finisher',
      description: 'Expert JS modules pour finaliser le jeu 2D',
      tasks: ['Optimiser architecture modulaire', 'Ajouter animations fluides', 'Adapter pour mobile']
    },
    {
      name: 'website-beautifier',
      description: 'Designer UI/UX pour embellir le site web',
      tasks: ['Redesign interface moderne', 'Design responsive mobile', 'Animations CSS avancées']
    },
    {
      name: 'project-coordinator',
      description: 'Coordinateur technique pour gérer la cohérence globale',
      tasks: ['Analyser état des projets', 'Prioriser les tâches critiques', 'Assurer cohérence entre jeux']
    },
    {
      name: 'prompt-wave-coordinator',
      description: 'Orchestrateur de vague pilotée par un prompt (coordination multi‑agents)',
      tasks: ['Émettre discussion inter‑agents', 'Générer assignations ciblées', 'Exécuter un petit lot automatiquement']
    },
    {
      name: 'test-runner',
      description: 'Exécuteur de tests automatisés',
      tasks: ['Tests unitaires', 'Tests E2E', 'Tests de performance', 'Tests d\'accessibilité']
    },
    {
      name: 'screenshot-agent',
      description: 'Agent de capture d\'écran pour analyse visuelle',
      tasks: ['Captures d\'écran des jeux', 'Captures responsive', 'Analyse d\'erreurs visuelles']
    },
    {
      name: 'fixer-agent',
      description: 'Agent de correction automatique des problèmes',
      tasks: ['Correction de linting', 'Correction CSS', 'Correction JavaScript', 'Correction d\'accessibilité']
    },
    {
      name: 'pdf-generator',
      description: 'Agent de génération PDF avec Puppeteer',
      tasks: ['Génération PDF GDD', 'Génération PDF haute qualité', 'Génération PDF batch', 'Génération PDF personnalisée']
    }
  ];

  agents.forEach(agent => {
    console.log(`🤖 ${agent.name}`);
    console.log(`   ${agent.description}`);
    console.log(`   Tâches: ${agent.tasks.join(', ')}`);
    console.log('');
  });
}

function runAudit() {
  console.log('🔍 Lancement d\'un audit complet multi-agents...\n');
  
  const auditSteps = [
    { agent: 'project-coordinator', instruction: 'Analyse tous les projets et génère un rapport d\'état' },
    { agent: 'test-runner', instruction: 'Exécute tous les tests disponibles' },
    { agent: 'screenshot-agent', instruction: 'Prend des captures d\'écran de tous les jeux et pages' },
    { agent: 'babylon-game-finisher', instruction: 'Audit technique de la version Babylon.js' },
    { agent: 'threejs-game-finisher', instruction: 'Audit technique de la version Three.js' },
    { agent: 'js2d-game-finisher', instruction: 'Audit technique de la version 2D' },
    { agent: 'website-beautifier', instruction: 'Audit UX/UI du site web' },
          { agent: 'fixer-agent', instruction: 'Corrige automatiquement tous les problèmes détectés' },
      { agent: 'pdf-generator', instruction: 'Génère un PDF haute qualité du GDD' }
  ];

  for (const step of auditSteps) {
    console.log(`\n📊 ${step.agent}: ${step.instruction}`);
    try {
      execSync(`node ${__filename} ${step.agent} "${step.instruction}"`, { 
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
      });
    } catch (error) {
      console.error(`❌ Erreur lors de l'audit avec ${step.agent}`);
    }
  }
  
  console.log('\n✅ Audit complet terminé. Consultez les logs pour plus de détails.');
}

function main() {
  const args = process.argv.slice(2);
  
  // Gestion des options spéciales
  if (args.includes('--list')) {
    listAgents();
    return;
  }
  
  if (args.includes('--audit')) {
    runAudit();
    return;
  }
  
  if (args.includes('--help') || args.length === 0) {
    printHelp();
    return;
  }

  const [agentName, ...rest] = args;
  const instruction = rest.join(' ').trim();
  const isDryRun = args.includes('--dry-run');

  if (!agentName || !instruction) {
    console.error('❌ Agent et instruction requis');
    printHelp();
    process.exit(1);
  }

  const agentFile = path.join(AGENTS_PATH, `${agentName}.js`);
  if (!fs.existsSync(agentFile)) {
    console.error(`❌ Agent "${agentName}" introuvable dans ${AGENTS_PATH}`);
    console.log('\nAgents disponibles:');
    listAgents();
    process.exit(1);
  }

  console.log(`🚀 Exécution de l'agent: ${agentName}`);
  console.log(`💡 Instruction: "${instruction}"`);
  if (isDryRun) {
    console.log(`🔍 Mode dry-run activé (aucune modification)`);
  }
  console.log('');

  try {
    // Préparation de l'environnement pour l'agent
    process.env.AGENT_NAME = agentName;
    process.env.INSTRUCTION = instruction;
    process.env.DRY_RUN = isDryRun ? 'true' : 'false';
    process.env.PROJECT_ROOT = path.resolve(__dirname, '..');

    // Appel de l'agent avec instruction comme argument
    execSync(`node ${agentFile} "${instruction}"`, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env }
    });
    
    logExecution(agentName, instruction, true);
    console.log('\n✅ Agent exécuté avec succès');
    
  } catch (error) {
    logExecution(agentName, instruction, false, error);
    console.error(`\n❌ Erreur lors de l'exécution de l'agent: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, listAgents, runAudit };
