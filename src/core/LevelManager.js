// LevelManager.js

export class LevelManager {
  constructor() {
    this.level = 1;
  }
  nextLevel() {
    this.level += 1;
  }
  reset() {
    this.level = 1;
  }
  getLevel() {
    return this.level;
  }
}
