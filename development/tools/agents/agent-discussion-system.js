/**
 * AgentDiscussionSystem
 * Phased, consensus‑seeking discussion among registered agents.
 * This module is framework‑agnostic and used by prompt-wave-coordinator.
 */

class AgentDiscussionSystem {
  constructor() {
    this.agents = new Map();
    this.discussionHistory = [];
    this.currentDeliberation = null;
    this.consensusThreshold = 0.7; // 70% agreement
  }

  registerAgent(agentId, agent) {
    this.agents.set(agentId, {
      instance: agent,
      expertise: agent.expertise || [],
      reliability: agent.reliability || 1.0,
      lastActivity: Date.now()
    });
  }

  selectRelevantAgents(problemDescription, explicitList = null) {
    if (explicitList && explicitList.length) return explicitList;
    const relevant = [];
    const keywords = this.extractKeywords(problemDescription);
    for (const [agentId, agentData] of this.agents) {
      const match = (agentData.expertise || []).some(skill =>
        keywords.some(k => skill.toLowerCase().includes(k.toLowerCase()))
      );
      if (match || agentId === 'project-coordinator') relevant.push(agentId);
    }
    return relevant.length ? relevant : Array.from(this.agents.keys());
  }

  extractKeywords(text) {
    const m = (text || '').toLowerCase().match(/\b[\w-]{3,}\b/g) || [];
    return Array.from(new Set(m));
  }

  async startDeliberation(problemDescription, relevantAgents = null) {
    const deliberationId = `delib_${Date.now()}`;
    const participants = this.selectRelevantAgents(problemDescription, relevantAgents);
    const deliberation = {
      id: deliberationId,
      problem: problemDescription,
      participants,
      phases: {
        PROPOSAL: { status: 'pending', responses: [] },
        DISCUSSION: { status: 'pending', messages: [] },
        REFINEMENT: { status: 'pending', iterations: [] },
        CONSENSUS: { status: 'pending', votes: [] },
        DECISION: { status: 'pending', final: null }
      },
      startTime: Date.now(),
      currentPhase: 'PROPOSAL'
    };
    this.currentDeliberation = deliberation;
    return await this.executeDeliberation();
  }

  async collectProposals() {
    const { participants, problem } = this.currentDeliberation;
    const proposals = [];
    for (const agentId of participants) {
      const agent = this.agents.get(agentId);
      try {
        const proposal = await this.askAgentForProposal(agent, problem);
        proposals.push({
          agentId,
          proposal,
          confidence: proposal.confidence || 0.5,
          reasoning: proposal.reasoning || '',
          timestamp: Date.now(),
          solution: proposal.solution || proposal.summary || ''
        });
      } catch (_) {}
    }
    this.currentDeliberation.phases.PROPOSAL = { status: 'completed', responses: proposals };
    return proposals;
  }

  async conductDiscussion() {
    const proposals = this.currentDeliberation.phases.PROPOSAL.responses;
    const discussion = [];
    for (const critic of this.currentDeliberation.participants) {
      const criticAgent = this.agents.get(critic);
      for (const proposal of proposals) {
        if (proposal.agentId === critic) continue;
        try {
          const critique = await this.askAgentForCritique(criticAgent, proposal, this.currentDeliberation.problem);
          discussion.push({ from: critic, about: proposal.agentId, type: 'critique', content: critique, timestamp: Date.now() });
        } catch (_) {}
      }
    }
    // responses
    for (const msg of discussion.filter(m => m.type === 'critique')) {
      const originalAgent = this.agents.get(msg.about);
      try {
        const response = await this.askAgentForResponse(originalAgent, msg, this.currentDeliberation.problem);
        discussion.push({ from: msg.about, to: msg.from, type: 'response', content: response, timestamp: Date.now() });
      } catch (_) {}
    }
    this.currentDeliberation.phases.DISCUSSION = { status: 'completed', messages: discussion };
    return discussion;
  }

  async refineProposals() {
    const originals = this.currentDeliberation.phases.PROPOSAL.responses;
    const insights = this.currentDeliberation.phases.DISCUSSION.messages;
    const iterations = [];
    for (const orig of originals) {
      const agent = this.agents.get(orig.agentId);
      const feedback = insights.filter(m => m.about === orig.agentId || m.from === orig.agentId);
      try {
        const refinement = await this.askAgentForRefinement(agent, orig, feedback, this.currentDeliberation.problem);
        iterations.push({ ...orig, refinements: refinement, version: 2, improvedBy: feedback.map(f => f.from) });
      } catch (_) {
        iterations.push(orig);
      }
    }
    this.currentDeliberation.phases.REFINEMENT = { status: 'completed', iterations };
    return iterations;
  }

  async seekConsensus() {
    const refined = this.currentDeliberation.phases.REFINEMENT.iterations;
    const votes = [];
    for (const voter of this.currentDeliberation.participants) {
      const voterAgent = this.agents.get(voter);
      try {
        const votingResults = await this.askAgentToVote(voterAgent, refined, this.currentDeliberation.problem);
        votes.push({ voterId: voter, votes: votingResults, timestamp: Date.now() });
      } catch (_) {}
    }
    const analysis = this.analyzeConsensus(votes, refined);
    this.currentDeliberation.phases.CONSENSUS = { status: 'completed', votes, analysis };
    return analysis;
  }

  async makeDecision() {
    const consensus = this.currentDeliberation.phases.CONSENSUS.analysis;
    let finalDecision;
    if (consensus.hasConsensus) {
      finalDecision = { type: 'consensus', solution: consensus.consensusSolution, support: consensus.supportLevel, reasoning: 'Consensus atteint' };
    } else {
      finalDecision = { type: 'best_rated', solution: consensus.topSolution, support: consensus.topSupport, reasoning: 'Meilleur score retenu' };
    }
    if (this.agents.has('project-coordinator')) {
      const coordinator = this.agents.get('project-coordinator');
      try {
        const validation = await this.askCoordinatorValidation(coordinator, finalDecision, this.currentDeliberation);
        finalDecision.approved = !!validation.approved;
        if (!finalDecision.approved) finalDecision.coordinatorOverride = validation.reason || 'refused';
      } catch (_) { finalDecision.approved = true; }
    }
    this.currentDeliberation.phases.DECISION = { status: 'completed', final: finalDecision };
    this.currentDeliberation.endTime = Date.now();
    this.discussionHistory.push(this.currentDeliberation);
    return finalDecision;
  }

  analyzeConsensus(votes, proposals) {
    const scoreMap = new Map();
    for (const proposal of proposals) {
      let total = 0; let count = 0;
      for (const vote of votes) {
        const found = (vote.votes.rankings || []).find(r => r.proposalId === proposal.agentId);
        if (found) { total += found.score; count++; }
      }
      scoreMap.set(proposal.agentId, { proposal, averageScore: count ? total / count : 0, voteCount: count });
    }
    let topSolution = null; let max = -1;
    for (const [, data] of scoreMap) {
      if (data.averageScore > max) { max = data.averageScore; topSolution = data.proposal; }
    }
    const hasConsensus = max >= this.consensusThreshold;
    return { hasConsensus, consensusSolution: hasConsensus ? topSolution : null, supportLevel: max, topSolution, topSupport: max, allScores: Object.fromEntries(scoreMap) };
  }

  async askAgentForProposal(agent, problem) {
    return await agent.instance.generateProposal({ problem, context: 'collaborative_decision', requestType: 'initial_proposal' });
  }
  async askAgentForCritique(agent, proposal, originalProblem) {
    return await agent.instance.critique({ proposal, originalProblem, context: 'peer_review' });
  }
  async askAgentForResponse(agent, critique, originalProblem) {
    return await agent.instance.respondToCritique({ critique, originalProblem, context: 'defense' });
  }
  async askAgentForRefinement(agent, originalProposal, feedback, problem) {
    return await agent.instance.refineProposal({ originalProposal, feedback, problem, context: 'collaborative_improvement' });
  }
  async askAgentToVote(agent, proposals, problem) {
    return await agent.instance.voteOnProposals({ proposals, problem, context: 'consensus_seeking' });
  }
  async askCoordinatorValidation(coordinator, decision, deliberationContext) {
    return await coordinator.instance.validateDecision({ decision, deliberationContext, context: 'final_approval' });
  }

  async executeDeliberation() {
    const proposals = await this.collectProposals();
    const discussion = await this.conductDiscussion();
    const refinements = await this.refineProposals();
    const consensus = await this.seekConsensus();
    const decision = await this.makeDecision();
    return {
      deliberationId: this.currentDeliberation.id,
      decision,
      process: { proposals, discussion, refinements, consensus },
      participants: this.currentDeliberation.participants,
      duration: this.currentDeliberation.endTime - this.currentDeliberation.startTime
    };
  }

  getDeliberationInsights() {
    if (this.discussionHistory.length === 0) return { totalDeliberations: 0 };
    const avgDur = this.discussionHistory.reduce((acc, d) => acc + (d.endTime - d.startTime), 0) / this.discussionHistory.length;
    const consensusRate = this.discussionHistory.filter(d => d.phases.CONSENSUS.analysis?.hasConsensus).length / this.discussionHistory.length;
    return { totalDeliberations: this.discussionHistory.length, averageDuration: avgDur, consensusRate };
  }
}

module.exports = AgentDiscussionSystem;


