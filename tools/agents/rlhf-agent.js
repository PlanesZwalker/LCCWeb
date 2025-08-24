#!/usr/bin/env node

const BaseAgent = require('./base-agent');
const path = require('path');
const fs = require('fs');

class RLHFAgent extends BaseAgent {
  constructor() {
    super('rlhf-agent');
    this.feedbackDatabase = path.join('.agents', 'rlhf', 'feedback-database.jsonl');
    this.agentPerformancePath = path.join('.agents', 'rlhf', 'agent-performance.json');
    this.trainingDataPath = path.join('.agents', 'rlhf', 'training-data.jsonl');
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      path.dirname(this.feedbackDatabase),
      path.dirname(this.agentPerformancePath),
      path.dirname(this.trainingDataPath)
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Collect human feedback on agent performance
  async collectFeedback(agentName, task, response, userRating, userComment = '') {
    const feedback = {
      timestamp: new Date().toISOString(),
      agentName,
      task,
      response,
      userRating, // 1-5 scale
      userComment,
      sessionId: this.generateSessionId()
    };

    try {
      fs.appendFileSync(this.feedbackDatabase, JSON.stringify(feedback) + '\n', 'utf8');
      this.log(`📝 Feedback collected for ${agentName}: ${userRating}/5`, 'success');
      
      // Update agent performance metrics
      await this.updateAgentPerformance(agentName, userRating);
      
      return feedback;
    } catch (error) {
      this.log(`Error saving feedback: ${error.message}`, 'error');
      return null;
    }
  }

  // Update agent performance tracking
  async updateAgentPerformance(agentName, rating) {
    let performance = {};
    
    try {
      if (fs.existsSync(this.agentPerformancePath)) {
        performance = JSON.parse(fs.readFileSync(this.agentPerformancePath, 'utf8'));
      }
    } catch (error) {
      this.log(`Error reading performance data: ${error.message}`, 'warning');
    }

    if (!performance[agentName]) {
      performance[agentName] = {
        totalRatings: 0,
        averageRating: 0,
        ratings: [],
        improvementTrend: [],
        lastUpdated: new Date().toISOString()
      };
    }

    const agent = performance[agentName];
    agent.ratings.push(rating);
    agent.totalRatings++;
    agent.averageRating = agent.ratings.reduce((a, b) => a + b, 0) / agent.totalRatings;
    agent.lastUpdated = new Date().toISOString();

    // Calculate improvement trend (last 10 ratings)
    const recentRatings = agent.ratings.slice(-10);
    if (recentRatings.length >= 5) {
      const firstHalf = recentRatings.slice(0, Math.floor(recentRatings.length / 2));
      const secondHalf = recentRatings.slice(Math.floor(recentRatings.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      agent.improvementTrend.push(secondAvg - firstAvg);
    }

    try {
      fs.writeFileSync(this.agentPerformancePath, JSON.stringify(performance, null, 2), 'utf8');
      this.log(`📊 Performance updated for ${agentName}: ${agent.averageRating.toFixed(2)}/5`, 'info');
    } catch (error) {
      this.log(`Error saving performance data: ${error.message}`, 'error');
    }
  }

  // Generate training data from feedback
  async generateTrainingData() {
    try {
      if (!fs.existsSync(this.feedbackDatabase)) {
        this.log('No feedback database found', 'warning');
        return [];
      }

      const feedbackLines = fs.readFileSync(this.feedbackDatabase, 'utf8').trim().split('\n');
      const trainingData = [];

      for (const line of feedbackLines) {
        try {
          const feedback = JSON.parse(line);
          
          // Create training examples based on rating
          if (feedback.userRating >= 4) {
            // Positive example - what to do
            trainingData.push({
              type: 'positive',
              agentName: feedback.agentName,
              task: feedback.task,
              response: feedback.response,
              rating: feedback.userRating,
              comment: feedback.userComment,
              timestamp: feedback.timestamp
            });
          } else if (feedback.userRating <= 2) {
            // Negative example - what to avoid
            trainingData.push({
              type: 'negative',
              agentName: feedback.agentName,
              task: feedback.task,
              response: feedback.response,
              rating: feedback.userRating,
              comment: feedback.userComment,
              timestamp: feedback.timestamp
            });
          }
        } catch (error) {
          this.log(`Error parsing feedback line: ${error.message}`, 'warning');
        }
      }

      // Save training data
      fs.writeFileSync(this.trainingDataPath, trainingData.map(d => JSON.stringify(d)).join('\n'), 'utf8');
      this.log(`📚 Generated ${trainingData.length} training examples`, 'success');
      
      return trainingData;
    } catch (error) {
      this.log(`Error generating training data: ${error.message}`, 'error');
      return [];
    }
  }

  // Analyze agent performance and generate improvement suggestions
  async analyzeAgentPerformance(agentName) {
    try {
      if (!fs.existsSync(this.agentPerformancePath)) {
        return { error: 'No performance data available' };
      }

      const performance = JSON.parse(fs.readFileSync(this.agentPerformancePath, 'utf8'));
      const agent = performance[agentName];

      if (!agent) {
        return { error: `No data for agent: ${agentName}` };
      }

      const analysis = {
        agentName,
        totalRatings: agent.totalRatings,
        averageRating: agent.averageRating,
        recentTrend: agent.improvementTrend.slice(-5),
        recommendations: []
      };

      // Generate recommendations based on performance
      if (agent.averageRating < 3.0) {
        analysis.recommendations.push('🔴 Critical: Agent needs significant improvement');
        analysis.recommendations.push('💡 Consider retraining with more positive examples');
        analysis.recommendations.push('🎯 Focus on understanding user intent better');
      } else if (agent.averageRating < 4.0) {
        analysis.recommendations.push('🟡 Moderate: Agent has room for improvement');
        analysis.recommendations.push('📈 Review recent feedback for specific issues');
        analysis.recommendations.push('🔄 Consider fine-tuning response patterns');
      } else {
        analysis.recommendations.push('🟢 Good: Agent performing well');
        analysis.recommendations.push('🚀 Continue current approach');
        analysis.recommendations.push('📊 Monitor for consistency');
      }

      // Trend analysis
      const recentTrend = agent.improvementTrend.slice(-3);
      if (recentTrend.length > 0) {
        const avgTrend = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;
        if (avgTrend > 0.2) {
          analysis.recommendations.push('📈 Positive trend detected - keep current approach');
        } else if (avgTrend < -0.2) {
          analysis.recommendations.push('📉 Declining performance - investigate recent changes');
        }
      }

      return analysis;
    } catch (error) {
      this.log(`Error analyzing performance: ${error.message}`, 'error');
      return { error: error.message };
    }
  }

  // Generate improved prompts based on feedback
  async generateImprovedPrompts(agentName) {
    try {
      const trainingData = await this.generateTrainingData();
      const agentFeedback = trainingData.filter(d => d.agentName === agentName);

      if (agentFeedback.length === 0) {
        return { error: `No feedback data for agent: ${agentName}` };
      }

      const positiveExamples = agentFeedback.filter(d => d.type === 'positive');
      const negativeExamples = agentFeedback.filter(d => d.type === 'negative');

      const systemPrompt = await this.ollamaChat({
        system: `You are an expert at analyzing agent performance and generating improved system prompts. 
        Analyze the feedback data and create an improved system prompt that incorporates lessons learned.`,
        user: `Generate an improved system prompt for agent "${agentName}" based on this feedback:

        POSITIVE EXAMPLES (${positiveExamples.length}):
        ${positiveExamples.map(ex => `Task: ${ex.task}\nResponse: ${ex.response}\nRating: ${ex.rating}/5\nComment: ${ex.comment}`).join('\n\n')}

        NEGATIVE EXAMPLES (${negativeExamples.length}):
        ${negativeExamples.map(ex => `Task: ${ex.task}\nResponse: ${ex.response}\nRating: ${ex.rating}/5\nComment: ${ex.comment}`).join('\n\n')}

        Create an improved system prompt that:
        1. Incorporates successful patterns from positive examples
        2. Addresses issues identified in negative examples
        3. Provides clear guidance for better performance
        4. Maintains the agent's core purpose and capabilities`,
        purpose: 'reasoning'
      });

      return {
        agentName,
        improvedPrompt: systemPrompt,
        analysis: {
          positiveExamples: positiveExamples.length,
          negativeExamples: negativeExamples.length,
          totalFeedback: agentFeedback.length
        }
      };
    } catch (error) {
      this.log(`Error generating improved prompts: ${error.message}`, 'error');
      return { error: error.message };
    }
  }

  // Create a feedback collection interface
  async createFeedbackInterface() {
    const feedbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Feedback Collection</title>
    <link rel="stylesheet" href="../css/unified-colors.css">
    <style>
        .feedback-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: var(--glass-bg-primary);
            border-radius: var(--radius-xl);
            backdrop-filter: blur(20px);
        }
        .rating-stars {
            display: flex;
            gap: 0.5rem;
            margin: 1rem 0;
        }
        .star {
            font-size: 2rem;
            cursor: pointer;
            color: var(--text-muted);
            transition: color 0.2s ease;
        }
        .star.active {
            color: #ffd700;
        }
        .feedback-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .feedback-form textarea {
            min-height: 100px;
            padding: 1rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--glass-border-primary);
            background: var(--glass-bg-secondary);
            color: var(--text-primary);
        }
        .performance-display {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--glass-bg-secondary);
            border-radius: var(--radius-lg);
        }
    </style>
</head>
<body>
    <div class="feedback-container">
        <h1>🤖 Agent Feedback Collection</h1>
        
        <div class="feedback-form">
            <label for="agentSelect">Select Agent:</label>
            <select id="agentSelect" class="btn btn-secondary">
                <option value="">Choose an agent...</option>
            </select>

            <label for="taskInput">Task Description:</label>
            <input type="text" id="taskInput" placeholder="Describe the task that was performed..." class="prompt-input">

            <label for="responseInput">Agent Response:</label>
            <textarea id="responseInput" placeholder="Paste the agent's response here..."></textarea>

            <label>Rating:</label>
            <div class="rating-stars" id="ratingStars">
                <span class="star" data-rating="1">⭐</span>
                <span class="star" data-rating="2">⭐</span>
                <span class="star" data-rating="3">⭐</span>
                <span class="star" data-rating="4">⭐</span>
                <span class="star" data-rating="5">⭐</span>
            </div>

            <label for="commentInput">Additional Comments:</label>
            <textarea id="commentInput" placeholder="Any additional feedback or suggestions..."></textarea>

            <button id="submitFeedback" class="btn btn-primary">Submit Feedback</button>
        </div>

        <div class="performance-display" id="performanceDisplay" style="display: none;">
            <h3>Agent Performance</h3>
            <div id="performanceData"></div>
        </div>
    </div>

    <script>
        let selectedRating = 0;

        // Load available agents
        async function loadAgents() {
            try {
                const response = await fetch('/api/agents/list');
                const agents = await response.json();
                const select = document.getElementById('agentSelect');
                agents.forEach(agent => {
                    const option = document.createElement('option');
                    option.value = agent;
                    option.textContent = agent;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading agents:', error);
            }
        }

        // Star rating functionality
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                selectedRating = rating;
                
                document.querySelectorAll('.star').forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });

        // Submit feedback
        document.getElementById('submitFeedback').addEventListener('click', async () => {
            const agentName = document.getElementById('agentSelect').value;
            const task = document.getElementById('taskInput').value;
            const response = document.getElementById('responseInput').value;
            const comment = document.getElementById('commentInput').value;

            if (!agentName || !task || !response || selectedRating === 0) {
                alert('Please fill in all required fields and select a rating');
                return;
            }

            try {
                const feedbackData = {
                    agentName,
                    task,
                    response,
                    userRating: selectedRating,
                    userComment: comment
                };

                const result = await fetch('/api/rlhf/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feedbackData)
                });

                if (result.ok) {
                    alert('Feedback submitted successfully!');
                    document.querySelector('.feedback-form').reset();
                    selectedRating = 0;
                    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
                } else {
                    alert('Error submitting feedback');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error submitting feedback');
            }
        });

        // Load agents on page load
        loadAgents();
    </script>
</body>
</html>`;

    const feedbackPath = path.join('public', 'agent-feedback.html');
    fs.writeFileSync(feedbackPath, feedbackHtml, 'utf8');
    this.log(`📝 Feedback interface created: ${feedbackPath}`, 'success');
    return feedbackPath;
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Main RLHF workflow
  async run(instruction) {
    this.log(`🧠 RLHF Agent starting: ${instruction}`);

    const parts = instruction.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'collect':
        if (parts.length < 5) {
          this.log('Usage: collect <agent> <task> <response> <rating> [comment]', 'error');
          return;
        }
        
        // Parse the instruction more carefully
        const instruction = parts.slice(1).join(' ');
        const matches = instruction.match(/^([^\s]+)\s+'([^']+)'\s+'([^']+)'\s+(\d+)\s*(?:'([^']+)')?$/);
        
        if (!matches) {
          this.log('Invalid format. Use: collect <agent> \'<task>\' \'<response>\' <rating> [\'<comment>\']', 'error');
          return;
        }
        
        const agentName = matches[1];
        const task = matches[2];
        const response = matches[3];
        const rating = parseInt(matches[4]);
        const comment = matches[5] || '';
        
        await this.collectFeedback(agentName, task, response, rating, comment);
        break;

      case 'analyze':
        const targetAgent = parts[1] || 'all';
        if (targetAgent === 'all') {
          // Analyze all agents
          const performance = JSON.parse(fs.readFileSync(this.agentPerformancePath, 'utf8'));
          for (const agentName of Object.keys(performance)) {
            const analysis = await this.analyzeAgentPerformance(agentName);
            this.log(`📊 Analysis for ${agentName}:`, 'info');
            console.log(JSON.stringify(analysis, null, 2));
          }
        } else {
          const analysis = await this.analyzeAgentPerformance(targetAgent);
          this.log(`📊 Analysis for ${targetAgent}:`, 'info');
          console.log(JSON.stringify(analysis, null, 2));
        }
        break;

      case 'improve':
        const agentToImprove = parts[1];
        if (!agentToImprove) {
          this.log('Usage: improve <agent-name>', 'error');
          return;
        }
        const improved = await this.generateImprovedPrompts(agentToImprove);
        this.log(`🚀 Improved prompts for ${agentToImprove}:`, 'success');
        console.log(JSON.stringify(improved, null, 2));
        break;

      case 'interface':
        const interfacePath = await this.createFeedbackInterface();
        this.log(`🌐 Feedback interface available at: http://localhost:8000/public/agent-feedback.html`, 'success');
        break;

      case 'training':
        const trainingData = await this.generateTrainingData();
        this.log(`📚 Generated ${trainingData.length} training examples`, 'success');
        break;

      default:
        this.log(`Unknown command: ${command}`, 'error');
        this.log('Available commands: collect, analyze, improve, interface, training', 'info');
    }
  }
}

// CLI
if (require.main === module) {
  const agent = new RLHFAgent();
  const instruction = process.argv.slice(2).join(' ');
  agent.run(instruction).catch(console.error);
}

module.exports = RLHFAgent;
