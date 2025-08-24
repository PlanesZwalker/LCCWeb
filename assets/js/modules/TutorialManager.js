/**
 * TutorialManager.js - Tutorial system management module
 */

export class TutorialManager {
    constructor() {
        this.tutorial = {
            active: false,
            step: 0,
            steps: [
                { message: 'Welcome! Use arrow keys to move the falling letter', action: 'highlight_controls' },
                { message: 'Place letters to form words', action: 'highlight_grid' },
                { message: 'Complete words to score points!', action: 'highlight_words' }
            ]
        };
    }

    async init() {
        console.log('📚 TutorialManager initialized');
    }

    reset() {
        this.tutorial.active = false;
        this.tutorial.step = 0;
    }

    start() {
        this.tutorial.active = true;
        this.tutorial.step = 0;
    }

    next() {
        if (this.tutorial.step < this.tutorial.steps.length - 1) {
            this.tutorial.step++;
        } else {
            this.tutorial.active = false;
        }
    }

    getCurrentStep() {
        return this.tutorial.steps[this.tutorial.step];
    }

    isActive() {
        return this.tutorial.active;
    }

    update() {
        // Update tutorial logic
    }

    render(ctx) {
        if (this.tutorial.active) {
            const step = this.getCurrentStep();
            // Render tutorial overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(step.message, ctx.canvas.width / 2, ctx.canvas.height / 2);
        }
    }
}
