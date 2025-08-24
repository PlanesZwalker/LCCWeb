// public/js/tests/unit/letterManager.test.js
// ES module unit tests for LetterManager

import { LetterManager } from '../../modules/LetterManager.js';

export default async function createTests() {
  return [
    {
      name: 'LetterManager initializes grid and first falling letter',
      fn: async () => {
        const lm = new LetterManager();
        await lm.init();
        if (!Array.isArray(lm.grid) || lm.grid.length === 0) throw new Error('Grid not created');
        if (!lm.fallingLetter) throw new Error('No falling letter created');
      },
    },
  ];
}
