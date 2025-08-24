// public/js/tests/integration/gameFlow.test.js
// Integration tests for core gameplay flows using GameCore

import { GameCore } from '../../modules/GameCore.js';

export default async function createTests() {
  return [
    {
      name: 'GameCore initializes on offscreen canvas with managers',
      fn: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 600; canvas.style.display = 'none';
        document.body.appendChild(canvas);

        const game = new GameCore();
        await game.init(canvas);

        const required = ['gameState','letterManager','wordManager','scoreManager','levelManager','uiManager','audioManager','analyticsManager','backgroundManager'];
        for (const key of required) {
          if (!game[key]) throw new Error(`Missing manager: ${key}`);
        }
      },
    },
    {
      name: 'Integration: letter present and score numeric',
      fn: async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 300; canvas.style.display = 'none';
        document.body.appendChild(canvas);

        const game = new GameCore();
        await game.init(canvas);

        if (!game.letterManager.fallingLetter) throw new Error('No falling letter after init');
        const score = game.scoreManager.getScore ? game.scoreManager.getScore() : game.scoreManager.score;
        if (typeof score !== 'number') throw new Error('Score is not numeric');
      },
    },
    // Add performance monitoring to integration tests
    {
      name: 'GameFlow integration with performance metrics',
      fn: async () => {
        const gameFlow = new GameFlow();
        const startTime = performance.now();
        await gameFlow.runFullFlow();  // Assuming this simulates the full flow
        const endTime = performance.now();
        expect(endTime - startTime < 5000).toBeTruthy();  // Expect under 5 seconds for full flow
      },
    },
    // Add accessibility checks to integration tests
    {
      name: 'GameFlow integration with accessibility audit',
      fn: async () => {
        const results = await runAccessibilityAuditOnGameFlow();  // Placeholder for integrated audit
        expect(results.violations.length).toBe(0);  // Ensure no accessibility violations
      },
    },
  ];
}
