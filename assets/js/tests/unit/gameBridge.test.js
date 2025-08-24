// public/js/tests/unit/gameBridge.test.js
// Tests for GameLogicBridge wiring and basic events

export default async function createTests() {
  return [
    {
      name: 'GameBridge is available and initialized',
      fn: async () => {
        if (!window.GameBridge) throw new Error('GameBridge not on window');
        const stats = window.GameBridge.getStats?.();
        if (!stats) throw new Error('getStats() not available');
      }
    },
    {
      name: 'GameBridge lifecycle and events do not throw',
      fn: async () => {
        const gb = window.GameBridge;
        gb.startGame();
        gb.placeLetter('A');
        gb.updateFPS(60);
        gb.completeWord('CAT');
        gb.levelUp(2,1);
        gb.endGame('test');
      }
    },
    {
      name: 'GameBridge endGame with performance metrics',
      fn: async () => {
        const gb = window.GameBridge;
        if (!gb) throw new Error('GameBridge not available');
        gb.startGame();
        // Simulate game play and measure performance
        const startTime = performance.now();
        gb.endGame('test');
        const endTime = performance.now();
        if (!((endTime - startTime) < 1000)) throw new Error('endGame took too long');
      }
    }
  ];
}


