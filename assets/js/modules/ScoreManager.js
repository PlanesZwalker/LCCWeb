/**
 * ScoreManager.js - Enhanced score tracking and management module
 */

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.wordsCompleted = 0;
        this.lettersPlaced = 0;
        this.scoreMultiplier = 1;
        this.multiplierDuration = 0;
        this.multiplierStartTime = 0;
        this.scoreHistory = [];
        this.bonusPoints = 0;
        this.streak = 0;
        this.maxStreak = 0;
    }

    async init() {
        try {
            this.highScore = this.loadHighScore();
            console.log('🏆 ScoreManager initialized with enhanced features');
        } catch (error) {
            console.error('❌ ScoreManager initialization failed:', error);
            throw error;
        }
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.wordsCompleted = 0;
        this.lettersPlaced = 0;
        this.scoreMultiplier = 1;
        this.multiplierDuration = 0;
        this.multiplierStartTime = 0;
        this.scoreHistory = [];
        this.bonusPoints = 0;
        this.streak = 0;
        this.maxStreak = 0;
    }

    addScore(points) {
        const multipliedPoints = Math.round(points * this.scoreMultiplier);
        this.score += multipliedPoints;
        
        // Add to score history
        this.scoreHistory.push({
            points: multipliedPoints,
            basePoints: points,
            multiplier: this.scoreMultiplier,
            timestamp: Date.now()
        });
        
        // Keep only last 100 entries
        if (this.scoreHistory.length > 100) {
            this.scoreHistory.shift();
        }
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        return multipliedPoints;
    }

    addCombo() {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
    }

    resetCombo() {
        this.combo = 0;
        this.streak = 0;
    }

    completeWord(word) {
        this.wordsCompleted++;
        
        // Calculate base points based on word length and difficulty
        const basePoints = this.calculateWordPoints(word);
        const comboBonus = this.calculateComboBonus();
        const streakBonus = this.calculateStreakBonus();
        const difficultyBonus = this.calculateDifficultyBonus(word);
        
        const totalPoints = basePoints + comboBonus + streakBonus + difficultyBonus;
        
        this.addScore(totalPoints);
        this.addCombo();
        
        // Add bonus points for special achievements
        this.addBonusPoints(word);
        
        return {
            totalPoints,
            basePoints,
            comboBonus,
            streakBonus,
            difficultyBonus,
            multiplier: this.scoreMultiplier
        };
    }

    calculateWordPoints(word) {
        // Base points: 10 per letter, minimum 30
        const basePoints = Math.max(word.length * 10, 30);
        
        // Bonus for longer words
        if (word.length >= 6) {
            return basePoints * 1.5;
        } else if (word.length >= 4) {
            return basePoints * 1.2;
        }
        
        return basePoints;
    }

    calculateComboBonus() {
        if (this.combo <= 1) return 0;
        
        // Exponential combo bonus
        return Math.pow(2, this.combo - 1) * 10;
    }

    calculateStreakBonus() {
        if (this.streak <= 1) return 0;
        
        // Linear streak bonus
        return this.streak * 5;
    }

    calculateDifficultyBonus(word) {
        // Bonus for words with rare letters
        const rareLetters = ['Q', 'W', 'X', 'Y', 'Z', 'K', 'J'];
        const rareLetterCount = word.split('').filter(letter => 
            rareLetters.includes(letter)
        ).length;
        
        return rareLetterCount * 15;
    }

    addBonusPoints(word) {
        let bonus = 0;
        
        // Bonus for completing target words
        if (['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'].includes(word)) {
            bonus += 100;
        }
        
        // Bonus for perfect words (all vowels or all consonants)
        if (this.isPerfectWord(word)) {
            bonus += 50;
        }
        
        // Bonus for palindrome words
        if (this.isPalindrome(word)) {
            bonus += 75;
        }
        
        if (bonus > 0) {
            this.bonusPoints += bonus;
            this.addScore(bonus);
        }
    }

    isPerfectWord(word) {
        const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
        const allVowels = word.split('').every(letter => vowels.includes(letter));
        const allConsonants = word.split('').every(letter => !vowels.includes(letter));
        return allVowels || allConsonants;
    }

    isPalindrome(word) {
        return word === word.split('').reverse().join('');
    }

    placeLetter() {
        this.lettersPlaced++;
        this.addScore(1);
    }

    activateMultiplier(factor, duration) {
        this.scoreMultiplier = factor;
        this.multiplierDuration = duration;
        this.multiplierStartTime = Date.now();
    }

    updateMultiplier() {
        if (this.multiplierDuration > 0) {
            const elapsed = Date.now() - this.multiplierStartTime;
            if (elapsed >= this.multiplierDuration) {
                this.scoreMultiplier = 1;
                this.multiplierDuration = 0;
            }
        }
    }

    getScore() { return this.score; }
    getHighScore() { return this.highScore; }
    getCombo() { return this.combo; }
    getMaxCombo() { return this.maxCombo; }
    getWordsCompleted() { return this.wordsCompleted; }
    getLettersPlaced() { return this.lettersPlaced; }
    getMultiplier() { return this.scoreMultiplier; }
    getStreak() { return this.streak; }
    getMaxStreak() { return this.maxStreak; }
    getBonusPoints() { return this.bonusPoints; }

    saveHighScore() {
        try {
            localStorage.setItem('lettersCascadeHighScore', this.highScore.toString());
        } catch (error) {
            console.error('❌ Error saving high score:', error);
        }
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem('lettersCascadeHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.error('❌ Error loading high score:', error);
            return 0;
        }
    }

    getScoreStats() {
        return {
            currentScore: this.score,
            highScore: this.highScore,
            combo: this.combo,
            maxCombo: this.maxCombo,
            wordsCompleted: this.wordsCompleted,
            lettersPlaced: this.lettersPlaced,
            multiplier: this.scoreMultiplier,
            streak: this.streak,
            maxStreak: this.maxStreak,
            bonusPoints: this.bonusPoints,
            averagePointsPerWord: this.wordsCompleted > 0 ? this.score / this.wordsCompleted : 0
        };
    }

    update() {
        this.updateMultiplier();
    }

    render(ctx) {
        this.renderScoreDisplay(ctx);
        this.renderMultiplierIndicator(ctx);
        this.renderComboIndicator(ctx);
    }

    renderScoreDisplay(ctx) {
        const startX = 20;
        const startY = 20;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(startX - 10, startY - 10, 200, 120);
        
        // Score
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, startX, startY);
        
        // High Score
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '16px Arial';
        ctx.fillText(`High: ${this.highScore}`, startX, startY + 30);
        
        // Words Completed
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText(`Words: ${this.wordsCompleted}`, startX, startY + 50);
        
        // Letters Placed
        ctx.fillStyle = '#45B7D1';
        ctx.fillText(`Letters: ${this.lettersPlaced}`, startX, startY + 70);
        
        // Multiplier
        if (this.scoreMultiplier > 1) {
            ctx.fillStyle = '#FF6B6B';
            ctx.fillText(`x${this.scoreMultiplier}`, startX, startY + 90);
        }
    }

    renderMultiplierIndicator(ctx) {
        if (this.scoreMultiplier > 1) {
            const centerX = ctx.canvas.width / 2;
            const centerY = 50;
            
            ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
            ctx.fillRect(centerX - 50, centerY - 20, 100, 40);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`x${this.scoreMultiplier}`, centerX, centerY + 5);
            
            // Progress bar for multiplier duration
            if (this.multiplierDuration > 0) {
                const elapsed = Date.now() - this.multiplierStartTime;
                const progress = Math.max(0, 1 - (elapsed / this.multiplierDuration));
                
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(centerX - 45, centerY + 10, 90 * progress, 5);
            }
        }
    }

    renderComboIndicator(ctx) {
        if (this.combo > 1) {
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height - 100;
            
            ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.fillRect(centerX - 60, centerY - 20, 120, 40);
            
            ctx.fillStyle = 'black';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`COMBO x${this.combo}`, centerX, centerY + 5);
        }
    }
}
