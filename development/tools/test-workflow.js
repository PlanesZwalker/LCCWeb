#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class TestWorkflow {
  constructor() {
    this.results = [];
    this.errors = [];
    this.fixes = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    };
    console.log(`[${timestamp}] ${emoji[level]} TestWorkflow: ${message}`);
  }

  async runTests() {
    this.log('🧪 Démarrage du workflow de tests complet...', 'info');
    
    const steps = [
      {
        name: 'Tests unitaires et E2E',
        agent: 'test-runner',
        instruction: 'Exécute tous les tests disponibles',
        critical: true
      },
      {
        name: 'Captures d\'écran',
        agent: 'screenshot-agent',
        instruction: 'Prend des captures d\'écran de tous les jeux et pages',
        critical: false
      },
      {
        name: 'Correction automatique',
        agent: 'fixer-agent',
        instruction: 'Corrige automatiquement tous les problèmes détectés',
        critical: true
      },
      {
        name: 'Audit final',
        agent: 'test-runner',
        instruction: 'Relance les tests pour vérifier les corrections',
        critical: true
      }
    ];

    for (const step of steps) {
      this.log(`\n📋 Étape: ${step.name}`, 'info');
      this.log(`🤖 Agent: ${step.agent}`, 'info');
      this.log(`💡 Instruction: ${step.instruction}`, 'info');
      
      try {
        const startTime = Date.now();
        
        execSync(`node tools/agent-run.js ${step.agent} "${step.instruction}"`, {
          stdio: 'inherit',
          cwd: process.cwd(),
          timeout: 300000 // 5 minutes par étape
        });
        
        const duration = Date.now() - startTime;
        this.results.push({
          step: step.name,
          agent: step.agent,
          success: true,
          duration: duration,
          timestamp: new Date().toISOString()
        });
        
        this.log(`✅ ${step.name} terminé avec succès (${duration}ms)`, 'success');
        
      } catch (error) {
        this.log(`❌ Erreur lors de ${step.name}: ${error.message}`, 'error');
        
        this.results.push({
          step: step.name,
          agent: step.agent,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        this.errors.push({
          step: step.name,
          error: error.message,
          critical: step.critical
        });
        
        if (step.critical) {
          this.log(`🚨 Étape critique échouée, arrêt du workflow`, 'error');
          break;
        }
      }
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `tools/logs/workflow-report-${timestamp}.json`;
    
    const successfulSteps = this.results.filter(r => r.success);
    const failedSteps = this.results.filter(r => !r.success);
    const criticalErrors = this.errors.filter(e => e.critical);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSteps: this.results.length,
        successfulSteps: successfulSteps.length,
        failedSteps: failedSteps.length,
        criticalErrors: criticalErrors.length,
        successRate: (successfulSteps.length / this.results.length * 100).toFixed(1)
      },
      results: this.results,
      errors: this.errors,
      recommendations: this.generateRecommendations()
    };
    
    // Sauvegarder le rapport
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Rapport sauvegardé: ${reportPath}`, 'success');
    
    // Afficher le résumé
    this.log('\n📊 Résumé du workflow:', 'info');
    this.log(`  ✅ Étapes réussies: ${successfulSteps.length}/${this.results.length}`, 'info');
    this.log(`  ❌ Étapes échouées: ${failedSteps.length}/${this.results.length}`, 'info');
    this.log(`  🚨 Erreurs critiques: ${criticalErrors.length}`, 'info');
    this.log(`  📈 Taux de succès: ${report.summary.successRate}%`, 'info');
    
    if (criticalErrors.length > 0) {
      this.log('\n🚨 Erreurs critiques détectées:', 'error');
      criticalErrors.forEach((error, index) => {
        this.log(`  ${index + 1}. ${error.step}: ${error.error}`, 'error');
      });
    }
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    const failedSteps = this.results.filter(r => !r.success);
    
    for (const step of failedSteps) {
      switch (step.agent) {
        case 'test-runner':
          recommendations.push({
            type: 'test',
            priority: 'high',
            action: 'Vérifier la configuration des tests et les dépendances',
            details: `Échec des tests dans l'étape: ${step.step}`
          });
          break;
          
        case 'screenshot-agent':
          recommendations.push({
            type: 'visual',
            priority: 'medium',
            action: 'Vérifier que le serveur local est démarré sur le port 3000',
            details: `Impossible de prendre des captures d'écran`
          });
          break;
          
        case 'fixer-agent':
          recommendations.push({
            type: 'code',
            priority: 'high',
            action: 'Corriger manuellement les problèmes de code détectés',
            details: `Échec de la correction automatique`
          });
          break;
      }
    }
    
    return recommendations;
  }

  async run() {
    this.log('🚀 Démarrage du workflow de tests complet', 'info');
    
    // Vérifier que le serveur est démarré
    try {
      this.log('🔍 Vérification du serveur local...', 'info');
      execSync('curl -s http://localhost:3000 > /dev/null', { 
        stdio: 'pipe',
        timeout: 10000 
      });
      this.log('✅ Serveur local détecté', 'success');
    } catch (error) {
      this.log('⚠️ Serveur local non détecté, certaines étapes pourraient échouer', 'warning');
    }
    
    // Exécuter le workflow
    await this.runTests();
    
    // Générer le rapport
    const report = this.generateReport();
    
    // Déterminer le statut de sortie
    const criticalErrors = this.errors.filter(e => e.critical);
    if (criticalErrors.length > 0) {
      this.log('❌ Workflow terminé avec des erreurs critiques', 'error');
      process.exit(1);
    } else {
      this.log('✅ Workflow terminé avec succès', 'success');
    }
  }
}

// Exécution du workflow
const workflow = new TestWorkflow();
workflow.run().catch(error => {
  console.error('❌ Erreur fatale du workflow:', error.message);
  process.exit(1);
});
