// GameLogicBridge.js - shared modular gameplay services for all renderers
// ES module that wires Score/Analytics/Audio to Babylon/Three/2D frontends.

import { AnalyticsManager } from '../modules/AnalyticsManager.js';
import { AudioManager } from '../modules/AudioManager.js';
import { ScoreManager } from '../modules/ScoreManager.js';

class GameLogicBridge {
    constructor() {
        this.analytics = new AnalyticsManager();
        this.audio = new AudioManager();
        this.score = new ScoreManager();
        this.achievements = [];
        this.initialized = false;
        this.lastFpsUpdateAt = 0;
        this.lastReportedWords = new Set();
        this.customSettings = {
            theme: 'dark',  // Default theme
            preferences: {}
        };
    }

    async init() {
        await Promise.all([
            this.analytics.init(),
            this.audio.init(),
            this.score.init()
        ]);
        this.initialized = true;
        return this;
    }

    // Lifecycle
    startGame() {
        if (!this.initialized) return;
        this.score.reset();
        this.analytics.trackGameStart();
        this.audio.playGameplayMusic?.();
    }

    endGame(reason = 'unknown') {
        if (!this.initialized) return;
        const finalStats = {
            score: this.score.getScoreStats?.() || {},
        };
        this.analytics.trackGameEnd(reason, finalStats);
        this.audio.playGameOver?.();
    }

    // Events
    placeLetter(letter = '?') {
        if (!this.initialized) return;
        this.score.placeLetter();
        this.audio.playLetterPlace?.();
        this.analytics.trackUserInteraction('place_letter', { letter });
    }

    completeWord(word) {
        if (!this.initialized || !word) return { points: 0 };
        const result = this.score.completeWord(word);
        this.audio.playWordComplete?.();
        this.analytics.trackWordCompleted(word, result.totalPoints, 0);
        return { points: result.totalPoints };
    }

    levelUp(newLevel, oldLevel = undefined) {
        if (!this.initialized) return;
        this.analytics.trackLevelUp(oldLevel ?? (newLevel - 1), newLevel);
        this.audio.playLevelUp?.();
    }

    // Telemetry
    updateFPS(fps) {
        if (!this.initialized) return;
        const now = performance.now();
        if (now - this.lastFpsUpdateAt > 250) {
            this.analytics.updatePerformanceMetrics(fps);
            this.lastFpsUpdateAt = now;
        }
    }

    // Sync helpers for engines exposing arrays of words
    syncFoundWords(wordsArray) {
        if (!Array.isArray(wordsArray)) return;
        for (const w of wordsArray) {
            if (!this.lastReportedWords.has(w)) {
                const { points } = this.completeWord(w);
                this.lastReportedWords.add(w);
                // Attach points if needed by UI consumers
            }
        }
    }

    // Add achievement system methods
    checkAchievement(achievementId) {
        // Logic to check and unlock achievements
        if (this.meetsAchievementCriteria(achievementId)) {
            this.achievements.push(achievementId);
            this.analytics.trackAchievement(achievementId);
        }
    }
    getAchievements() {
        return this.achievements;
    }

    // Add customization options
    setTheme(themeName) {
        this.customSettings.theme = themeName;
        // Apply theme changes, e.g., update UI
    }
    getTheme() {
        return this.customSettings.theme;
    }
    savePreference(key, value) {
        this.customSettings.preferences[key] = value;
        this.analytics.trackPreferenceChange(key, value);  // Track for analytics
    }

    getStats() {
        return {
            score: this.score.getScoreStats?.(),
            analytics: this.analytics.getAnalytics?.(),
            audio: this.audio.getAudioStats?.()
        };
    }
}

// Expose a ready-to-use instance on window for non-module scripts
const bridge = new GameLogicBridge();
try {
    await bridge.init();
    window.GameBridge = bridge;
} catch (e) {
    // keep page running during tests even if some service fails
    console.warn('GameBridge init warning:', e?.message || e);
    window.GameBridge = bridge; // expose partial bridge for tests
}

export { GameLogicBridge };


