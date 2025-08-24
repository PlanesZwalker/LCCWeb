/**
 * LevelManager.js - Level progression and difficulty management module
 */

export class LevelManager {
    constructor() {
        this.level = 1;
        this.fallSpeed = 40000; // 40 seconds per drop
        this.levelFallSpeedMap = {
            1: 40000, 2: 35000, 3: 30000, 4: 25000, 5: 20000,
            6: 18000, 7: 16000, 8: 14000, 9: 12000, 10: 10000
        };

        // Difficulty tuning (applied as multiplier to fall speed)
        // Higher multiplier = slower fall (easier). Lower = faster (harder)
        this.difficulty = 'normal';
        this.difficultyMultipliers = {
            easy: 1.3,
            normal: 1.0,
            hard: 0.75,
            extreme: 0.55
        };
    }

    async init() {
        console.log('📈 LevelManager initialized');
    }

    reset() {
        this.level = 1;
        this.fallSpeed = this.levelFallSpeedMap[1];
    }

    updateLevel(wordsCompleted) {
        const newLevel = Math.floor(wordsCompleted / 5) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.fallSpeed = this.levelFallSpeedMap[this.level] || 10000;
            return true; // Level up occurred
        }
        return false;
    }

    getLevel() { return this.level; }
    getFallSpeed() {
        const mult = this.difficultyMultipliers[this.difficulty] ?? 1.0;
        const effective = Math.max(250, Math.floor(this.fallSpeed * mult));
        return effective;
    }

    /**
     * Set game difficulty and compute new effective fall speed
     * @param {('easy'|'normal'|'hard'|'extreme')} difficulty
     */
    setDifficulty(difficulty) {
        if (this.difficultyMultipliers[difficulty] !== undefined) {
            this.difficulty = difficulty;
        }
    }

    update() {
        // Update level-related logic
    }

    render(ctx) {
        // Render level UI elements
    }
}
