// public/js/tests/unit/scoreManager.test.js
// ES module unit tests for ScoreManager

import { ScoreManager } from '../../modules/ScoreManager.js';

export default async function createTests() {
  return [
    {
      name: 'ScoreManager initializes and updates score',
      fn: async () => {
        const sm = new ScoreManager();
        await sm.init();
        const before = sm.getScore ? sm.getScore() : sm.score;
        if (typeof before !== 'number') throw new Error('Score not numeric');
      },
    },
  ];
}
