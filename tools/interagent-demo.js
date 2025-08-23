#!/usr/bin/env node

const BaseAgent = require('./agents/base-agent');

async function main() {
  const beautifier = new BaseAgent('website-beautifier');
  const coordinator = new BaseAgent('project-coordinator');

  // Ask a design-focused question from beautifier to coordinator
  const requestId = beautifier.askAgentQuestion(
    'project-coordinator',
    'Quels éléments HTML-only harmoniser en priorité pour rules/moodboard/technical-spec ?',
    { channel: 'design', tags: ['html-only', 'uniformisation'] }
  );

  // Coordinator answers back to beautifier with concise guidance
  coordinator.emitInterAgentComment('website-beautifier', {
    type: 'answer',
    severity: 'info',
    message: 'Appliquer footer date-only; vérifier nav + hero; CTAs btn primary/subtle; .glass-panel pour blocs majeurs.',
    channel: 'design',
    replyTo: requestId,
    tags: ['html-only','uniformisation']
  });

  console.log(`✅ Q/A émise avec requestId=${requestId}`);
}

main();


