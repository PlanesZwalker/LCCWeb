#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function usage() {
  console.log('Usage: node tools/bin/run-assignments.js <assignments.json> [--limit N] [--dry]');
}

function runAgent(agent, instruction, dry) {
  const cmd = `node tools/agent-run.js ${agent} "${instruction.replace(/"/g, '\\"')}"${dry ? ' --dry-run' : ''}`;
  console.log(`\n▶ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) { usage(); process.exit(1); }
  const file = args[0];
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 5;
  const dry = args.includes('--dry');

  const content = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(content);
  const assignments = data.assignments || {};

  const agentOrder = [
    'fixer-agent',
    'website-beautifier',
    'threejs-game-finisher',
    'babylon-game-finisher',
    'js2d-game-finisher'
  ];

  for (const agent of agentOrder) {
    const items = (assignments[agent] || []).slice(0, limit);
    if (items.length === 0) continue;

    for (const it of items) {
      const url = it.url || '';
      const log = it.log || '';
      const desc = it.description ? ` Contexte: ${it.description}.` : '';
      const hints = Array.isArray(it.notes) && it.notes.length ? ` Indices: ${it.notes.join('; ')}.` : '';
      let instruction = '';

      if (agent === 'website-beautifier') {
        instruction = `Améliore la cohérence visuelle (thème sombre, typo, espacements, boutons, navbar) et corrige les chemins d'assets si besoin pour ${url}.${desc}${hints} Réfère-toi au log: ${log}`;
      } else if (agent === 'threejs-game-finisher') {
        instruction = `Optimise le rendu Three.js (performances, shaders, profiling), améliore VFX et corrige erreurs sur ${url}.${desc}${hints} Analyse le log: ${log}`;
      } else if (agent === 'babylon-game-finisher') {
        instruction = `Optimise la scène Babylon.js (performances, collisions, particules, eau), améliore visuels sur ${url}.${desc}${hints} Consulte le log: ${log}`;
      } else if (agent === 'js2d-game-finisher') {
        instruction = `Améliore l'architecture modulaire 2D, animations, input clavier/tactile et performances sur ${url}.${desc}${hints} Vérifie le log: ${log}`;
      } else if (agent === 'fixer-agent') {
        instruction = `Corrige automatiquement les problèmes détectés par les logs (lint, CSS, JS, accessibilité) pour ${url}.${desc}${hints} Log: ${log}`;
      } else {
        continue;
      }

      try {
        runAgent(agent, instruction, dry);
      } catch (e) {
        console.error(`Agent ${agent} a échoué pour ${url}: ${e.message}`);
      }
    }
  }

  console.log('\n✅ Assignments processing complete.');
}

main();
