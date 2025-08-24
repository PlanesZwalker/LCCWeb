# 🤖 RLHF Agent Training System

## Overview

The RLHF (Reinforcement Learning from Human Feedback) system allows you to train and improve your AI agents based on human feedback. This system collects feedback on agent performance, analyzes trends, and generates improved prompts to enhance agent capabilities.

## 🚀 Quick Start

### 1. Access the RLHF Dashboard

Visit the RLHF dashboard to view agent performance and provide feedback:
```
http://localhost:8000/public/rlhf-dashboard.html
```

### 2. Provide Feedback

Use the feedback form to rate agent performance:
- Select an agent from the dropdown
- Describe the task that was performed
- Paste the agent's response
- Rate the performance (1-5 stars)
- Add optional comments

### 3. View Performance Analytics

The dashboard shows:
- Total feedback collected
- Number of active agents
- Average rating across all agents
- Individual agent performance with star ratings

## 🛠️ Command Line Usage

### Collect Feedback

```bash
# Basic feedback collection
node tools/agent-run.js rlhf-agent "collect <agent-name> '<task-description>' '<agent-response>' <rating> '<optional-comment>'"

# Examples:
node tools/agent-run.js rlhf-agent "collect fixer-agent 'Fix CSS issues' 'Fixed 3 validation errors' 4 'Good work'"
node tools/agent-run.js rlhf-agent "collect beautifier-agent 'Format code' 'Applied consistent indentation' 5 'Excellent'"
node tools/agent-run.js rlhf-agent "collect test-runner 'Run tests' 'Tests failed with errors' 2 'Need improvement'"
```

### Analyze Performance

```bash
# Analyze all agents
node tools/agent-run.js rlhf-agent "analyze all"

# Analyze specific agent
node tools/agent-run.js rlhf-agent "analyze fixer-agent"
```

### Generate Improved Prompts

```bash
# Generate improved prompts for an agent
node tools/agent-run.js rlhf-agent "improve fixer-agent"
```

### Generate Training Data

```bash
# Generate training examples from feedback
node tools/agent-run.js rlhf-agent "training"
```

### Create Feedback Interface

```bash
# Create the feedback collection interface
node tools/agent-run.js rlhf-agent "interface"
```

## 📊 Performance Analysis

The RLHF system provides comprehensive performance analysis:

### Rating Categories
- **5 Stars (Excellent)**: Agent performed exceptionally well
- **4 Stars (Good)**: Agent performed well with minor issues
- **3 Stars (Average)**: Agent performed adequately
- **2 Stars (Poor)**: Agent needs significant improvement
- **1 Star (Very Poor)**: Agent failed to meet expectations

### Performance Recommendations

Based on average ratings, the system provides recommendations:

- **🔴 Critical (Rating < 3.0)**: Agent needs significant improvement
- **🟡 Moderate (Rating 3.0-4.0)**: Agent has room for improvement
- **🟢 Good (Rating > 4.0)**: Agent performing well

### Trend Analysis

The system tracks improvement trends by comparing recent ratings to earlier ones, providing insights into whether agents are improving over time.

## 🔄 Training Workflow

### 1. Collect Feedback
- Use the dashboard or command line to collect feedback
- Provide detailed task descriptions and agent responses
- Rate performance honestly and consistently

### 2. Analyze Performance
- Review performance metrics and trends
- Identify areas for improvement
- Understand what works well

### 3. Generate Improvements
- Use the improvement system to generate better prompts
- Review and refine the generated prompts
- Apply improvements to agent configurations

### 4. Monitor Progress
- Track performance over time
- Validate improvements with new feedback
- Iterate and refine continuously

## 📁 File Structure

```
.agents/
├── rlhf/
│   ├── feedback-database.jsonl      # Raw feedback data
│   ├── agent-performance.json       # Performance metrics
│   └── training-data.jsonl          # Generated training examples
├── logs/
│   └── console/                     # Agent execution logs
└── reports/                         # Analysis reports
```

## 🎯 Best Practices

### Providing Effective Feedback

1. **Be Specific**: Describe exactly what the agent was asked to do
2. **Include Context**: Provide the agent's complete response
3. **Rate Consistently**: Use the same rating criteria across similar tasks
4. **Add Comments**: Explain why you gave a particular rating
5. **Be Constructive**: Provide actionable feedback for improvement

### Training Strategy

1. **Start Small**: Begin with a few agents and tasks
2. **Collect Diverse Feedback**: Get feedback on different types of tasks
3. **Monitor Trends**: Watch for improvement patterns
4. **Iterate Gradually**: Make small improvements and test them
5. **Validate Changes**: Ensure improvements actually help

### Quality Assurance

1. **Regular Reviews**: Periodically review agent performance
2. **Cross-Validation**: Test improvements with multiple users
3. **Documentation**: Keep track of what changes were made and why
4. **Backup Data**: Maintain backups of training data and configurations

## 🔧 API Endpoints

The RLHF system provides REST API endpoints:

### Feedback Collection
```
POST /api/rlhf/feedback
{
  "agentName": "fixer-agent",
  "task": "Fix CSS issues",
  "response": "Fixed 3 validation errors",
  "userRating": 4,
  "userComment": "Good work"
}
```

### Performance Analysis
```
GET /api/rlhf/performance/:agentName
GET /api/rlhf/performance
```

### Training Data
```
GET /api/rlhf/training-data
GET /api/rlhf/feedback
GET /api/rlhf/stats
```

### Improvement Generation
```
POST /api/rlhf/improve/:agentName
```

## 📈 Metrics and Analytics

### Key Performance Indicators

- **Average Rating**: Overall performance score
- **Total Feedback**: Number of feedback entries
- **Improvement Trend**: Performance change over time
- **Agent Coverage**: Number of agents with feedback

### Success Metrics

- **Rating Improvement**: Increase in average ratings over time
- **Feedback Volume**: Consistent feedback collection
- **Agent Diversity**: Multiple agents receiving feedback
- **User Satisfaction**: Positive feedback trends

## 🚨 Troubleshooting

### Common Issues

1. **No Feedback Data**: Start by collecting some initial feedback
2. **Low Ratings**: Review agent responses and identify improvement areas
3. **Inconsistent Ratings**: Establish clear rating criteria
4. **API Errors**: Check server status and endpoint availability

### Debugging Commands

```bash
# Check if RLHF directories exist
ls -la .agents/rlhf/

# View feedback data
cat .agents/rlhf/feedback-database.jsonl

# View performance data
cat .agents/rlhf/agent-performance.json

# Check agent logs
tail -f .agents/logs/console/latest.log
```

## 🔮 Future Enhancements

### Planned Features

1. **Automated Feedback Collection**: Integration with agent execution
2. **Advanced Analytics**: Machine learning-based performance prediction
3. **A/B Testing**: Compare different agent configurations
4. **Collaborative Training**: Multi-user feedback aggregation
5. **Real-time Monitoring**: Live performance tracking

### Integration Opportunities

1. **CI/CD Pipeline**: Automated performance testing
2. **Monitoring Tools**: Integration with existing monitoring systems
3. **Reporting**: Automated performance reports
4. **Alerting**: Performance degradation notifications

## 📚 Additional Resources

- [Agent Development Guide](./tools/agents/README.md)
- [API Documentation](./tools/api/README.md)
- [Performance Best Practices](./PERFORMANCE-GUIDE.md)
- [Training Examples](./TRAINING-EXAMPLES.md)

## 🤝 Contributing

To contribute to the RLHF system:

1. **Collect Feedback**: Use the system and provide honest feedback
2. **Report Issues**: Document any problems or inconsistencies
3. **Suggest Improvements**: Propose new features or enhancements
4. **Share Best Practices**: Contribute to the documentation

## 📞 Support

For questions or issues with the RLHF system:

1. Check the troubleshooting section above
2. Review the agent logs for error messages
3. Test with simple examples to isolate issues
4. Document the problem with specific details

---

**Remember**: The RLHF system is designed to continuously improve your agents. The more quality feedback you provide, the better your agents will become! 🚀
