// AudioManager.js

export class AudioManager {
  constructor() {
    this.enabled = true;
  }
  play(soundName) {
    if (this.enabled) {
      // Play sound (stub)
    }
  }
  mute() {
    this.enabled = false;
  }
  unmute() {
    this.enabled = true;
  }
}
