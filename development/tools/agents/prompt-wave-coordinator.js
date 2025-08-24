#!/usr/bin/env node

/**
 * PromptWaveCoordinator – orchestrates a focused, prompt-driven wave across agents
 * - Emits inter-agent comments with the user prompt as context
 * - Generates an assignments JSON that targets relevant agents/pages
 * - Optionally executes the assignments automatically (small limit)
 */

const BaseAgent = require('./base-agent');
const fileBridge = require('../file-bridge');
const path = require('path');
const { execSync } = require('child_process');
const AgentDiscussionSystem = require('./agent-discussion-system');

class PromptWaveCoordinator extends BaseAgent {
  constructor() {
    super('prompt-wave-coordinator');
    this.discussion = new AgentDiscussionSystem();
  }

  /**
   * Parse instruction to extract optional target URLs or pages
   */
  extractTargetsFromInstruction(instruction) {
    const urls = [];
    const urlRegex = /(https?:\/\/[^\s)]+|\bpublic\/[\w\/\-.]+\.html\b)/gi;
    const matches = instruction.match(urlRegex) || [];
    matches.forEach(m => {
      if (m.startsWith('http')) urls.push(m);
      else urls.push(`http://localhost:8000/${m.replace(/^\/*/, '')}`);
    });
    return urls;
  }

  async discoverCandidatePages() {
    try {
      const htmls = await this.getAssetsByType('html');
      const primary = (htmls || [])
        .map(h => (h.path || '').replace(/\\/g, '/'))
        .filter(p => p.startsWith('public/') && /\.html$/i.test(p))
        .map(p => `http://localhost:8000/${p}`);
      return primary;
    } catch (_) {
      return [];
    }
  }

  buildAssignments(prompt, targetUrls) {
    const assignments = {};
    const add = (agent, url, description, notes = []) => {
      assignments[agent] = assignments[agent] || [];
      assignments[agent].push({ url, description, notes });
    };

    const descBeautify = `Appliquer le template et le style du site – ${prompt}. Harmoniser header/hero/panels, typographie, couleurs, espacements, tableaux, code. Respecter accessibilité.`;
    const descFix = `Corriger automatiquement lint/CSS/JS/a11y après harmonisation – ${prompt}.`;
    const descThree = `Si page liée à Three.js, optimiser rendu/shaders/contrôles pour correspondre au template – ${prompt}.`;
    const descBabylon = `Si page Babylon, optimiser scène/effets et UI autour du canvas pour correspondre au template – ${prompt}.`;
    const desc2D = `Si page 2D, moderniser HUD/contrôles/typographie et responsive – ${prompt}.`;

    targetUrls.slice(0, 8).forEach(url => {
      add('website-beautifier', url, descBeautify, ['appliquer unified-layout.css / enhanced-ui.css si pertinent']);
      add('fixer-agent', url, descFix);
      if (/three/i.test(url)) add('threejs-game-finisher', url, descThree);
      if (/unified-3d|babylon/i.test(url)) add('babylon-game-finisher', url, descBabylon);
      if (/classic-2d|2d|modular/i.test(url)) add('js2d-game-finisher', url, desc2D);
    });
    return assignments;
  }

  async runDeliberation(prompt) {
    // Register available agents with minimal collaborative surface
    const getAgentWrapper = (name, expertise = []) => ({
      expertise,
      reliability: 0.9,
      instance: {
        async generateProposal({ problem }) {
          return { summary: `${name} proposal`, solution: `${name} will apply: ${problem}`, confidence: 0.7 };
        },
        async critique({ proposal }) {
          return { summary: `${name} critique`, suggestions: [`Refine scope for ${proposal.agentId || 'peer'}`] };
        },
        async respondToCritique({ critique }) {
          return { summary: `${name} response`, accepted: true, notes: critique?.suggestions || [] };
        },
        async refineProposal({ originalProposal }) {
          return { summary: `${name} refinement`, changes: [`Improve: ${originalProposal.solution || originalProposal.summary}`] };
        },
        async voteOnProposals({ proposals }) {
          // naive ranking: prefer own or first
          const rankings = proposals.map((p, idx) => ({ proposalId: p.agentId, score: 1 - idx * 0.1 }));
          const preferred = rankings[0]?.proposalId;
          return { preferred, confidence: 0.8, rankings };
        },
        async validateDecision({ decision }) {
          return { approved: true, reason: 'auto-approve' };
        }
      }
    });

    // Register core agents
    this.discussion.registerAgent('website-beautifier', getAgentWrapper('website-beautifier', ['css','design','responsive','ui']));
    this.discussion.registerAgent('fixer-agent', getAgentWrapper('fixer-agent', ['lint','quality','js','accessibility']));
    this.discussion.registerAgent('babylon-game-finisher', getAgentWrapper('babylon-game-finisher', ['babylon','performance','shaders']));
    this.discussion.registerAgent('threejs-game-finisher', getAgentWrapper('threejs-game-finisher', ['threejs','rendering']));
    this.discussion.registerAgent('js2d-game-finisher', getAgentWrapper('js2d-game-finisher', ['2d','hud','controls']));
    this.discussion.registerAgent('project-coordinator', getAgentWrapper('project-coordinator', ['coordination','decision']));

    // Start deliberation
    const result = await this.discussion.startDeliberation(prompt);
    this.log(`🧠 Deliberation result: ${JSON.stringify({ decision: result.decision?.type, support: result.decision?.support }, null, 2)}`, 'info');
    return result;
  }

  emitDiscussion(prompt, targetAgents = []) {
    const agents = targetAgents.length ? targetAgents : [
      'website-beautifier',
      'fixer-agent',
      'threejs-game-finisher',
      'babylon-game-finisher',
      'js2d-game-finisher'
    ];
    agents.forEach(agent => {
      this.emitInterAgentComment(agent, {
        type: 'question',
        severity: 'info',
        message: `Vague de travail coordonnée: ${prompt}. Propose tes changements prioritaires et points de vigilance.`,
        tags: ['wave','prompt','coordination']
      });
    });
  }

  runAssignments(assignPath, limit = 5) {
    try {
      const cmd = `node tools/run-assignments.js ${assignPath} --limit ${limit}`;
      this.log(`▶ Exécution des assignations: ${cmd}`, 'info');
      execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..', '..') });
      this.log('✅ Assignations exécutées', 'success');
    } catch (e) {
      this.log(`⚠️ Échec exécution assignations: ${e.message}`, 'warning');
    }
  }

  async run(instruction) {
    this.log(`🧠 Prompt reçu: ${instruction}`);

    // 1) Build target set
    const explicitTargets = this.extractTargetsFromInstruction(instruction);
    const discovered = await this.discoverCandidatePages();
    const targets = explicitTargets.length ? explicitTargets : discovered.slice(0, 10);
    this.log(`🎯 Cibles: ${targets.length} page(s)`, 'info');

    // 2) Emit discussion thread among agents and run a quick deliberation
    this.emitDiscussion(instruction);
    try { await this.runDeliberation(instruction); } catch (e) { this.log(`⚠️ Deliberation failed: ${e.message}`, 'warning'); }

    // 3) Build and persist assignments
    const assignments = this.buildAssignments(instruction, targets);
    const outDir = path.join('tools', 'logs');
    try { require('fs').mkdirSync(outDir, { recursive: true }); } catch (_) {}
    const outPath = path.join(outDir, `agent-assignments-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
    fileBridge.writeFile(outPath, JSON.stringify({ assignments }, null, 2));
    this.log(`📄 Assignations générées: ${outPath}`, 'success');

    // 4) Optional execution (default true, small batch)
    const auto = (process.env.PROMPT_WAVE_AUTO_RUN || 'true').toLowerCase() !== 'false';
    const limit = parseInt(process.env.PROMPT_WAVE_LIMIT || '5', 10);
    if (auto) {
      this.runAssignments(outPath, isNaN(limit) ? 5 : limit);
    } else {
      this.log(`ℹ️ Pour exécuter: node tools/run-assignments.js ${outPath} --limit 5`, 'info');
    }
  }
}

// CLI
const args = process.argv.slice(2);
const instruction = args.join(' ');
if (!instruction) {
  console.error('❌ Instruction requise');
  process.exit(1);
}

const agent = new PromptWaveCoordinator();
agent.run(instruction);

module.exports = PromptWaveCoordinator;


