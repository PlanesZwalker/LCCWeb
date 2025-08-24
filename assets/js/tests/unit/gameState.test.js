// public/js/tests/unit/gameState.test.js
// ES module unit tests for GameState

import { GameState } from '../../modules/GameState.js';

export default async function createTests() {
  return [
    {
      name: 'GameState initializes without errors',
      fn: async () => {
        const gs = new GameState();
        await gs.init();
        if (!gs.config || !gs.stats) throw new Error('Config or stats missing after init');
      },
    },
    {
      name: 'GameState running/paused toggles work',
      fn: async () => {
        const gs = new GameState();
        await gs.init();
        gs.setRunning(true);
        if (!gs.isRunning()) throw new Error('Running not set');
        gs.setPaused(true);
        if (!gs.isPaused()) throw new Error('Paused not set');
        gs.setRunning(false);
        gs.setPaused(false);
        if (gs.isRunning() || gs.isPaused()) throw new Error('Reset failed');
      },
    },
    {
      name: 'GameState level set/get works',
      fn: async () => {
        const gs = new GameState();
        await gs.init();
        gs.setLevel(3);
        if (gs.getLevel() !== 3) throw new Error('Level not set correctly');
      },
    },
  ];
}
