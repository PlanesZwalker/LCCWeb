/**
 * BackgroundManager.js - Background image and visual effects management
 */

export class BackgroundManager {
    constructor() {
        this.backgroundImage = null;
        this.isLoaded = false;
        this.loadingPromise = null;
        this.backgroundPath = 'images/Cascade Letters - 02 - Decor concept 01.png';
        this.parallaxEnabled = true;
        this.parallaxOffset = 0;
        this.parallaxSpeed = 0.5;
    }

    async init() {
        try {
            await this.loadBackgroundImage();
            console.log('🎨 BackgroundManager initialized successfully');
        } catch (error) {
            console.error('❌ BackgroundManager initialization failed:', error);
            throw error;
        }
    }

    reset() {
        this.parallaxOffset = 0;
    }

    /**
     * Load background image
     */
    async loadBackgroundImage() {
        return new Promise((resolve, reject) => {
            this.backgroundImage = new Image();
            this.backgroundImage.onload = () => {
                this.isLoaded = true;
                console.log('✅ Background image loaded successfully');
                resolve();
            };
            this.backgroundImage.onerror = () => {
                console.warn('⚠️ Failed to load background image, using fallback');
                this.isLoaded = false;
                resolve(); // Don't reject, use fallback
            };
            this.backgroundImage.src = this.backgroundPath;
        });
    }

    /**
     * Update background effects
     */
    update(deltaTime) {
        if (this.parallaxEnabled) {
            this.parallaxOffset += this.parallaxSpeed * deltaTime * 0.001;
        }
    }

    /**
     * Render background
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (this.isLoaded && this.backgroundImage) {
            this.renderBackgroundImage(ctx, canvasWidth, canvasHeight);
        } else {
            this.renderFallbackBackground(ctx, canvasWidth, canvasHeight);
        }
    }

    /**
     * Render background image with parallax effect
     */
    renderBackgroundImage(ctx, canvasWidth, canvasHeight) {
        const img = this.backgroundImage;
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            drawHeight = canvasHeight;
            drawWidth = drawHeight * imgAspectRatio;
            offsetX = (canvasWidth - drawWidth) / 2 + this.parallaxOffset;
            offsetY = 0;
        } else {
            // Image is taller than canvas
            drawWidth = canvasWidth;
            drawHeight = drawWidth / imgAspectRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2 + this.parallaxOffset;
        }

        // Create a clipping mask for the game area
        ctx.save();
        
        // Draw the background image
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        // Add a subtle overlay for better text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.restore();
    }

    /**
     * Render fallback gradient background
     */
    renderFallbackBackground(ctx, canvasWidth, canvasHeight) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    /**
     * Set parallax effect
     */
    setParallaxEnabled(enabled) {
        this.parallaxEnabled = enabled;
    }

    /**
     * Set parallax speed
     */
    setParallaxSpeed(speed) {
        this.parallaxSpeed = speed;
    }

    /**
     * Get background loading status
     */
    isBackgroundLoaded() {
        return this.isLoaded;
    }

    /**
     * Get background image dimensions
     */
    getBackgroundDimensions() {
        if (this.isLoaded && this.backgroundImage) {
            return {
                width: this.backgroundImage.width,
                height: this.backgroundImage.height
            };
        }
        return null;
    }

    /**
     * Create background animation effect
     */
    createBackgroundAnimation(ctx, canvasWidth, canvasHeight) {
        if (!this.isLoaded) return;

        // Add subtle breathing effect
        const time = Date.now() * 0.001;
        const breathing = Math.sin(time * 0.5) * 0.1 + 1;
        
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.scale(breathing, breathing);
        this.renderBackgroundImage(ctx, canvasWidth, canvasHeight);
        ctx.restore();
    }

    /**
     * Add background particles effect
     */
    addBackgroundParticles(ctx, canvasWidth, canvasHeight) {
        const time = Date.now() * 0.001;
        const particleCount = 20;

        ctx.save();
        ctx.globalAlpha = 0.3;

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.sin(time + i) * canvasWidth * 0.5) + canvasWidth * 0.5;
            const y = (Math.cos(time * 0.5 + i) * canvasHeight * 0.5) + canvasHeight * 0.5;
            const size = Math.sin(time + i) * 2 + 3;

            ctx.fillStyle = `hsl(${200 + i * 10}, 70%, 60%)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Get background performance metrics
     */
    getPerformanceMetrics() {
        return {
            isLoaded: this.isLoaded,
            imageSize: this.backgroundImage ? {
                width: this.backgroundImage.width,
                height: this.backgroundImage.height
            } : null,
            parallaxEnabled: this.parallaxEnabled,
            parallaxSpeed: this.parallaxSpeed
        };
    }
}
