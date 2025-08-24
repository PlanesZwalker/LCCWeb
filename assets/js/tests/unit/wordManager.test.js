// public/js/tests/unit/wordManager.test.js
// ES module unit tests for WordManager

import { WordManager } from '../../modules/WordManager.js';

export default async function createTests() {
  return [
    {
      name: 'WordManager initializes',
      fn: async () => {
        const wm = new WordManager();
        await wm.init();
      },
    },
    // Add performance test for word processing
    {
      name: 'WordManager performance on word list processing',
      fn: () => {
        const wordManager = new WordManager();
        const startTime = performance.now();
        wordManager.processWordList(['test', 'words', 'list']);
        const endTime = performance.now();
        if (!((endTime - startTime) < 300)) throw new Error('Processing took too long');
      },
    },
    // Add accessibility test for word list navigation
    {
      name: 'WordManager ensures accessible word lists',
      fn: () => {
        const wordManager = new WordManager();
        const wordList = wordManager.getWordList();
        if (!wordList || wordList.length === 0) throw new Error('Word list should not be empty');
      },
    },
  ];
}
