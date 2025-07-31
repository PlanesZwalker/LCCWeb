// ScoreManager.js

export class ScoreManager {
  constructor() {
    this.score = 0;
  }
  addPoints(points) {
    this.score += points;
  }
  reset() {
    this.score = 0;
  }
  getScore() {
    return this.score;
  }
}
