/**
 * UIManager.js - Enhanced UI management and visual effects module
 */

export class UIManager {
    constructor() {
        this.uiElements = new Map();
        this.animations = [];
        this.particles = [];
        this.notifications = [];
        this.theme = 'dark';
        this.colors = this.getThemeColors();
        this.fonts = {
            primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            secondary: 'Arial, sans-serif',
            display: 'Orbitron, monospace'
        };
    }

    async init() {
        try {
            await this.loadFonts();
            this.setupUIElements();
            console.log('🎨 UIManager initialized with enhanced features');
        } catch (error) {
            console.error('❌ UIManager initialization failed:', error);
            throw error;
        }
    }

    reset() {
        this.animations = [];
        this.particles = [];
        this.notifications = [];
    }

    async loadFonts() {
        // Load Google Fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    setupUIElements() {
        // Define UI element templates
        this.uiElements.set('button', {
            primary: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            },
            secondary: {
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px 24px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }
        });

        this.uiElements.set('panel', {
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
        });

        this.uiElements.set('card', {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(5px)'
        });
    }

    getThemeColors() {
        const themes = {
            dark: {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#FFD700',
                success: '#4ECDC4',
                warning: '#FF6B6B',
                info: '#45B7D1',
                background: '#1a1a2e',
                surface: '#16213e',
                text: '#ffffff',
                textSecondary: '#b8b8b8'
            },
            light: {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#FFD700',
                success: '#4ECDC4',
                warning: '#FF6B6B',
                info: '#45B7D1',
                background: '#f8f9fa',
                surface: '#ffffff',
                text: '#2c3e50',
                textSecondary: '#7f8c8d'
            }
        };
        return themes[this.theme];
    }

    setTheme(theme) {
        this.theme = theme;
        this.colors = this.getThemeColors();
    }

    addAnimation(animation) {
        this.animations.push(animation);
    }

    addParticle(x, y, type = 'sparkle') {
        this.particles.push({
            x: x,
            y: y,
            type: type,
            life: 1.0,
            velocity: {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4
            },
            size: Math.random() * 4 + 2,
            color: this.getParticleColor(type)
        });
    }

    addNotification(message, type = 'info', duration = 3000) {
        this.notifications.push({
            message: message,
            type: type,
            startTime: Date.now(),
            duration: duration,
            y: this.notifications.length * 60
        });
    }

    getParticleColor(type) {
        const colors = {
            sparkle: '#FFD700',
            success: '#4ECDC4',
            warning: '#FF6B6B',
            info: '#45B7D1',
            powerup: '#BB8FCE'
        };
        return colors[type] || '#FFFFFF';
    }

    update() {
        // Update animations
        this.animations = this.animations.filter(animation => {
            animation.update();
            return !animation.isFinished();
        });

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.life -= 0.02;
            return particle.life > 0;
        });

        // Update notifications
        this.notifications = this.notifications.filter(notification => {
            const elapsed = Date.now() - notification.startTime;
            return elapsed < notification.duration;
        });
    }

    render(ctx) {
        this.renderParticles(ctx);
        this.renderNotifications(ctx);
        this.renderAnimations(ctx);
    }

    renderParticles(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            
            switch (particle.type) {
                case 'sparkle':
                    this.drawSparkle(ctx, particle.x, particle.y, particle.size);
                    break;
                case 'success':
                    this.drawCircle(ctx, particle.x, particle.y, particle.size);
                    break;
                case 'warning':
                    this.drawStar(ctx, particle.x, particle.y, particle.size);
                    break;
                default:
                    this.drawCircle(ctx, particle.x, particle.y, particle.size);
            }
            
            ctx.restore();
        });
    }

    renderNotifications(ctx) {
        this.notifications.forEach((notification, index) => {
            const elapsed = Date.now() - notification.startTime;
            const progress = elapsed / notification.duration;
            const alpha = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1;
            
            const y = 20 + index * 60;
            const width = 300;
            const height = 50;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Background
            ctx.fillStyle = this.getNotificationColor(notification.type);
            ctx.fillRect(ctx.canvas.width - width - 20, y, width, height);
            
            // Border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(ctx.canvas.width - width - 20, y, width, height);
            
            // Text
            ctx.fillStyle = 'white';
            ctx.font = '14px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(notification.message, ctx.canvas.width - width - 10, y + 30);
            
            ctx.restore();
        });
    }

    renderAnimations(ctx) {
        this.animations.forEach(animation => {
            animation.render(ctx);
        });
    }

    getNotificationColor(type) {
        const colors = {
            success: 'rgba(78, 205, 196, 0.9)',
            warning: 'rgba(255, 107, 107, 0.9)',
            info: 'rgba(69, 183, 209, 0.9)',
            error: 'rgba(231, 76, 60, 0.9)'
        };
        return colors[type] || 'rgba(0, 0, 0, 0.9)';
    }

    drawSparkle(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const radius = i % 2 === 0 ? size : size / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    drawCircle(ctx, x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    createButton(text, x, y, width, height, style = 'primary', onClick = null) {
        return {
            text: text,
            x: x,
            y: y,
            width: width,
            height: height,
            style: style,
            onClick: onClick,
            hover: false,
            pressed: false
        };
    }

    renderButton(ctx, button) {
        const style = this.uiElements.get('button')[button.style];
        
        // Background
        if (button.hover) {
            ctx.fillStyle = this.adjustColor(style.background, 1.1);
        } else {
            ctx.fillStyle = style.background;
        }
        
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Border
        if (style.border) {
            ctx.strokeStyle = style.border;
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
        }
        
        // Text
        ctx.fillStyle = style.color;
        ctx.font = `${style.fontWeight} ${style.fontSize} ${this.fonts.primary}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }

    adjustColor(color, factor) {
        // Simple color adjustment for hover effects
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = Math.min(255, Math.floor(parseInt(hex.slice(0, 2), 16) * factor));
            const g = Math.min(255, Math.floor(parseInt(hex.slice(2, 4), 16) * factor));
            const b = Math.min(255, Math.floor(parseInt(hex.slice(4, 6), 16) * factor));
            return `rgb(${r}, ${g}, ${b})`;
        }
        return color;
    }

    renderPanel(ctx, x, y, width, height, title = '') {
        const style = this.uiElements.get('panel');
        
        // Background
        ctx.fillStyle = style.background;
        ctx.fillRect(x, y, width, height);
        
        // Border
        ctx.strokeStyle = style.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Title
        if (title) {
            ctx.fillStyle = this.colors.text;
            ctx.font = `600 16px ${this.fonts.primary}`;
            ctx.textAlign = 'left';
            ctx.fillText(title, x + 10, y + 25);
        }
    }

    renderCard(ctx, x, y, width, height) {
        const style = this.uiElements.get('card');
        
        // Background
        ctx.fillStyle = style.background;
        ctx.fillRect(x, y, width, height);
        
        // Border
        ctx.strokeStyle = style.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }

    // Animation classes
    createFadeInAnimation(element, duration = 1000) {
        return new FadeInAnimation(element, duration);
    }

    createSlideAnimation(element, fromX, fromY, toX, toY, duration = 1000) {
        return new SlideAnimation(element, fromX, fromY, toX, toY, duration);
    }

    createPulseAnimation(element, duration = 2000) {
        return new PulseAnimation(element, duration);
    }
}

// Animation Classes
class FadeInAnimation {
    constructor(element, duration) {
        this.element = element;
        this.duration = duration;
        this.startTime = Date.now();
        this.finished = false;
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        if (progress >= 1) {
            this.finished = true;
        }
    }

    render(ctx) {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        ctx.save();
        ctx.globalAlpha = progress;
        // Render element with fade effect
        ctx.restore();
    }

    isFinished() {
        return this.finished;
    }
}

class SlideAnimation {
    constructor(element, fromX, fromY, toX, toY, duration) {
        this.element = element;
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.duration = duration;
        this.startTime = Date.now();
        this.finished = false;
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        if (progress >= 1) {
            this.finished = true;
        }
    }

    render(ctx) {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const currentX = this.fromX + (this.toX - this.fromX) * progress;
        const currentY = this.fromY + (this.toY - this.fromY) * progress;
        
        ctx.save();
        ctx.translate(currentX, currentY);
        // Render element at current position
        ctx.restore();
    }

    isFinished() {
        return this.finished;
    }
}

class PulseAnimation {
    constructor(element, duration) {
        this.element = element;
        this.duration = duration;
        this.startTime = Date.now();
        this.finished = false;
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        if (progress >= 1) {
            this.finished = true;
        }
    }

    render(ctx) {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
        
        ctx.save();
        ctx.scale(scale, scale);
        // Render element with pulse effect
        ctx.restore();
    }

    isFinished() {
        return this.finished;
    }
}
