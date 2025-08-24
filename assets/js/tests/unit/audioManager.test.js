// public/js/tests/unit/audioManager.test.js
// ES module unit tests for AudioManager

import { AudioManager } from '../../modules/AudioManager.js';

export default async function createTests() {
  return [
    {
      name: 'AudioManager constructs and initializes (with fallback if needed)',
      fn: async () => {
        const am = new AudioManager();
        try {
          await am.init();
        } catch (e) {
          // Some browsers block audio init until user gesture. Consider init issues non-fatal here.
        }
        if (typeof am.setMusicVolume !== 'function') throw new Error('API missing');
      },
    },
    {
      name: 'AudioManager volume and mute toggles do not throw',
      fn: async () => {
        const am = new AudioManager();
        try { await am.init(); } catch {}
        am.setSoundVolume(0.7);
        am.setMusicVolume(0.4);
        am.mute();
        am.unmute();
        am.toggleMute();
      },
    },
    {
      name: 'AudioManager alias sounds play without throwing',
      fn: async () => {
        const am = new AudioManager();
        try { await am.init(); } catch {}
        // These are mapped to existing/fallback sounds via aliases/synth
        am.playSound('button_click', { volume: 0.1 });
        am.playSound('background-music', { volume: 0.0 });
      }
    },
    // Add security and performance tests
    {
      name: 'AudioManager security check for asset loading',
      fn: () => {
        const audioManager = new AudioManager();
        let threw = false;
        try {
          audioManager.loadAsset('malicious-path');
        } catch (e) {
          threw = true;
        }
        if (!threw) throw new Error('Expected security error when loading invalid path');
      },
    },
    // Add performance test for audio playback
    {
      name: 'AudioManager performance on playback',
      fn: () => {
        const audioManager = new AudioManager();
        const startTime = performance.now();
        try { audioManager.playSound('test'); } catch {}
        const endTime = performance.now();
        if (!((endTime - startTime) < 500)) throw new Error('Playback took too long');
      },
    },
  ];
}
