#!/usr/bin/env node

const express = require('express');
const router = express.Router();
const RLHFAgent = require('../agents/rlhf-agent');
const path = require('path');
const fs = require('fs');

// Initialize RLHF agent
const rlhfAgent = new RLHFAgent();

// POST /api/rlhf/feedback - Collect feedback
router.post('/feedback', async (req, res) => {
  try {
    const { agentName, task, response, userRating, userComment } = req.body;

    // Validate input
    if (!agentName || !task || !response || !userRating) {
      return res.status(400).json({
        error: 'Missing required fields: agentName, task, response, userRating'
      });
    }

    if (userRating < 1 || userRating > 5) {
      return res.status(400).json({
        error: 'userRating must be between 1 and 5'
      });
    }

    // Collect feedback
    const feedback = await rlhfAgent.collectFeedback(
      agentName,
      task,
      response,
      userRating,
      userComment || ''
    );

    if (feedback) {
      res.json({
        success: true,
        message: 'Feedback collected successfully',
        feedback
      });
    } else {
      res.status(500).json({
        error: 'Failed to collect feedback'
      });
    }
  } catch (error) {
    console.error('RLHF feedback error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/rlhf/performance/:agentName - Get agent performance
router.get('/performance/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    const analysis = await rlhfAgent.analyzeAgentPerformance(agentName);
    
    if (analysis.error) {
      return res.status(404).json(analysis);
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('RLHF performance error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/rlhf/performance - Get all agents performance
router.get('/performance', async (req, res) => {
  try {
    const performancePath = path.join('.agents', 'rlhf', 'agent-performance.json');
    
    if (!fs.existsSync(performancePath)) {
      return res.json({});
    }
    
    const performance = JSON.parse(fs.readFileSync(performancePath, 'utf8'));
    res.json(performance);
  } catch (error) {
    console.error('RLHF performance error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/rlhf/improve/:agentName - Generate improved prompts
router.post('/improve/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    const improved = await rlhfAgent.generateImprovedPrompts(agentName);
    
    if (improved.error) {
      return res.status(404).json(improved);
    }
    
    res.json(improved);
  } catch (error) {
    console.error('RLHF improve error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/rlhf/training-data - Get training data
router.get('/training-data', async (req, res) => {
  try {
    const trainingData = await rlhfAgent.generateTrainingData();
    res.json({
      success: true,
      count: trainingData.length,
      data: trainingData
    });
  } catch (error) {
    console.error('RLHF training data error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/rlhf/feedback - Get feedback history
router.get('/feedback', async (req, res) => {
  try {
    const feedbackPath = path.join('.agents', 'rlhf', 'feedback-database.jsonl');
    
    if (!fs.existsSync(feedbackPath)) {
      return res.json([]);
    }
    
    const feedbackLines = fs.readFileSync(feedbackPath, 'utf8').trim().split('\n');
    const feedback = feedbackLines
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .reverse(); // Most recent first
    
    res.json(feedback);
  } catch (error) {
    console.error('RLHF feedback history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/rlhf/stats - Get RLHF statistics
router.get('/stats', async (req, res) => {
  try {
    const feedbackPath = path.join('.agents', 'rlhf', 'feedback-database.jsonl');
    const performancePath = path.join('.agents', 'rlhf', 'agent-performance.json');
    
    let totalFeedback = 0;
    let totalAgents = 0;
    let averageRating = 0;
    
    if (fs.existsSync(feedbackPath)) {
      const feedbackLines = fs.readFileSync(feedbackPath, 'utf8').trim().split('\n');
      totalFeedback = feedbackLines.filter(line => line.trim()).length;
    }
    
    if (fs.existsSync(performancePath)) {
      const performance = JSON.parse(fs.readFileSync(performancePath, 'utf8'));
      totalAgents = Object.keys(performance).length;
      
      const allRatings = Object.values(performance)
        .flatMap(agent => agent.ratings || []);
      
      if (allRatings.length > 0) {
        averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
      }
    }
    
    res.json({
      totalFeedback,
      totalAgents,
      averageRating: averageRating.toFixed(2),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('RLHF stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
