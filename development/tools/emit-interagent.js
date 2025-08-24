#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function emit(entry) {
  const out = path.join('.agents', 'reports', 'interagent-comments.jsonl');
  const dir = path.dirname(out);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(out, JSON.stringify(entry) + '\n', 'utf8');
}

const now = new Date().toISOString();

const question = `Harmonisation des styles: choisir entre 1) extraire un base-theme.css depuis index.html et l'injecter sur toutes les pages (ordre de liens cohérent), ou 2) assainir agressivement les CSS existants (accolades/sélecteurs) pour permettre la beautification. Préconisez une stratégie (risque, effort, réversibilité) et la liste des fichiers impactés.`;

emit({
  timestamp: now,
  sourceAgent: 'orchestrator',
  targetAgent: 'website-beautifier',
  severity: 'info',
  url: 'site-wide',
  message: question,
  suggestion: 'Proposer plan sans modification; produire checklist d’inclusion <link> et variables :root.',
  tags: ['advice','css','theme','uniformity'],
  threadId: 'css-harmonize-001'
});

emit({
  timestamp: now,
  sourceAgent: 'orchestrator',
  targetAgent: 'fixer-agent',
  severity: 'info',
  url: 'public/css/*',
  message: question,
  suggestion: 'Évaluer capacité d’assainissement automatique sûre (balance braces, selectors) sans risque de régression.',
  tags: ['advice','lint','autofix'],
  threadId: 'css-harmonize-001'
});

console.log('Inter-agent questions emitted.');


