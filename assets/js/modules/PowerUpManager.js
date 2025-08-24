/**
 * PowerUpManager.js - Enhanced power-up system management module
 */

export class PowerUpManager {
    constructor() {
        this.powerUps = {
            available: ['multiplier', 'timeExtend', 'bomb', 'hint', 'freeze', 'shuffle', 'clearLine'],
            active: [],
            multiplier: { duration: 10000, factor: 2, cost: 100 },
            timeExtend: { duration: 15000, bonus: 30000, cost: 150 },
            bomb: { radius: 2, cost: 200, effect: 'clear_area' },
            hint: { cost: 50, effect: 'show_hint' },
            freeze: { duration: 8000, cost: 120, effect: 'freeze_letters' },
            shuffle: { cost: 80, effect: 'shuffle_grid' },
            clearLine: { cost: 100, effect: 'clear_line' }
        };
        
        this.powerUpQueue = [];
        this.powerUpChance = 0.1; // 10% chance per letter placement
        this.visualEffects = [];
        this.powerUpCooldowns = new Map();
    }

    async init() {
        console.log('⚡ PowerUpManager initialized with enhanced features');
    }

    reset() {
        this.powerUps.active = [];
        this.powerUpQueue = [];
        this.visualEffects = [];
        this.powerUpCooldowns.clear();
    }

    activatePowerUp(type) {
        if (!this.powerUps.available.includes(type)) return false;
        
        // Check cooldown
        const cooldown = this.powerUpCooldowns.get(type);
        if (cooldown && Date.now() < cooldown) {
            return { success: false, reason: 'cooldown' };
        }
        
        const powerUp = this.powerUps[type];
        if (!powerUp) return { success: false, reason: 'not_found' };
        
        // Add to active power-ups
        this.powerUps.active.push({
            type: type,
            startTime: Date.now(),
            duration: powerUp.duration || 0,
            factor: powerUp.factor || 1,
            effect: powerUp.effect
        });
        
        // Set cooldown
        this.powerUpCooldowns.set(type, Date.now() + 30000); // 30 second cooldown
        
        // Add visual effect
        this.addVisualEffect(type, 'activate');
        
        return { success: true, powerUp: this.powerUps.active[this.powerUps.active.length - 1] };
    }

    getActivePowerUps() {
        return this.powerUps.active.filter(powerUp => 
            Date.now() - powerUp.startTime < powerUp.duration
        );
    }

    getPowerUpCost(type) {
        return this.powerUps[type]?.cost || 0;
    }

    canAffordPowerUp(type, currentScore) {
        const cost = this.getPowerUpCost(type);
        return currentScore >= cost;
    }

    getPowerUpCooldown(type) {
        const cooldown = this.powerUpCooldowns.get(type);
        if (!cooldown) return 0;
        
        const remaining = cooldown - Date.now();
        return Math.max(0, remaining);
    }

    generateRandomPowerUp() {
        if (Math.random() < this.powerUpChance) {
            const availableTypes = this.powerUps.available.filter(type => 
                !this.powerUpCooldowns.get(type) || Date.now() > this.powerUpCooldowns.get(type)
            );
            
            if (availableTypes.length > 0) {
                const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                this.powerUpQueue.push({
                    type: randomType,
                    timeCreated: Date.now(),
                    duration: 10000 // 10 seconds to collect
                });
            }
        }
    }

    collectPowerUp(x, y) {
        const powerUp = this.powerUpQueue.find(p => 
            Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1
        );
        
        if (powerUp) {
            this.powerUpQueue = this.powerUpQueue.filter(p => p !== powerUp);
            this.activatePowerUp(powerUp.type);
            this.addVisualEffect(powerUp.type, 'collect');
            return powerUp;
        }
        
        return null;
    }

    addVisualEffect(type, action) {
        this.visualEffects.push({
            type: type,
            action: action,
            startTime: Date.now(),
            duration: 2000,
            x: Math.random() * 800,
            y: Math.random() * 600
        });
    }

    update() {
        // Remove expired power-ups
        this.powerUps.active = this.powerUps.active.filter(powerUp => 
            Date.now() - powerUp.startTime < powerUp.duration
        );
        
        // Remove expired visual effects
        this.visualEffects = this.visualEffects.filter(effect => 
            Date.now() - effect.startTime < effect.duration
        );
        
        // Remove expired power-ups from queue
        this.powerUpQueue = this.powerUpQueue.filter(powerUp => 
            Date.now() - powerUp.timeCreated < powerUp.duration
        );
    }

    render(ctx) {
        this.renderPowerUpQueue(ctx);
        this.renderActivePowerUps(ctx);
        this.renderVisualEffects(ctx);
        this.renderPowerUpMenu(ctx);
    }

    renderPowerUpQueue(ctx) {
        this.powerUpQueue.forEach((powerUp, index) => {
            const x = 20 + (index * 60);
            const y = ctx.canvas.height - 80;
            
            // Background
            ctx.fillStyle = this.getPowerUpColor(powerUp.type);
            ctx.fillRect(x, y, 50, 50);
            
            // Icon
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.getPowerUpIcon(powerUp.type), x + 25, y + 30);
            
            // Timer
            const timeLeft = Math.max(0, (powerUp.timeCreated + powerUp.duration - Date.now()) / 1000);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`${timeLeft.toFixed(1)}s`, x + 25, y + 45);
        });
    }

    renderActivePowerUps(ctx) {
        const activePowerUps = this.getActivePowerUps();
        if (activePowerUps.length === 0) return;
        
        const startX = ctx.canvas.width - 200;
        const startY = 150;
        const lineHeight = 25;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(startX - 10, startY - 10, 210, activePowerUps.length * lineHeight + 20);
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        activePowerUps.forEach((powerUp, index) => {
            const y = startY + index * lineHeight;
            const timeLeft = Math.max(0, (powerUp.startTime + powerUp.duration - Date.now()) / 1000);
            
            ctx.fillStyle = this.getPowerUpColor(powerUp.type);
            ctx.fillText(`${this.getPowerUpIcon(powerUp.type)} ${powerUp.type}`, startX, y);
            
            ctx.fillStyle = 'white';
            ctx.fillText(`${timeLeft.toFixed(1)}s`, startX + 120, y);
        });
    }

    renderVisualEffects(ctx) {
        this.visualEffects.forEach(effect => {
            const progress = (Date.now() - effect.startTime) / effect.duration;
            const alpha = 1 - progress;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Draw effect based on type
            switch (effect.type) {
                case 'multiplier':
                    this.drawMultiplierEffect(ctx, effect.x, effect.y, progress);
                    break;
                case 'bomb':
                    this.drawBombEffect(ctx, effect.x, effect.y, progress);
                    break;
                case 'freeze':
                    this.drawFreezeEffect(ctx, effect.x, effect.y, progress);
                    break;
                default:
                    this.drawGenericEffect(ctx, effect.x, effect.y, progress);
            }
            
            ctx.restore();
        });
    }

    renderPowerUpMenu(ctx) {
        const startX = ctx.canvas.width - 200;
        const startY = 300;
        const lineHeight = 30;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(startX - 10, startY - 10, 210, this.powerUps.available.length * lineHeight + 20);
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        this.powerUps.available.forEach((type, index) => {
            const y = startY + index * lineHeight;
            const cost = this.getPowerUpCost(type);
            const cooldown = this.getPowerUpCooldown(type);
            
            // Icon and name
            ctx.fillStyle = this.getPowerUpColor(type);
            ctx.fillText(`${this.getPowerUpIcon(type)} ${type}`, startX, y);
            
            // Cost
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`${cost} pts`, startX + 100, y);
            
            // Cooldown indicator
            if (cooldown > 0) {
                ctx.fillStyle = '#FF6B6B';
                ctx.fillText(`${(cooldown / 1000).toFixed(1)}s`, startX + 150, y);
            }
        });
    }

    getPowerUpColor(type) {
        const colors = {
            'multiplier': '#FFD700',
            'timeExtend': '#4ECDC4',
            'bomb': '#FF6B6B',
            'hint': '#45B7D1',
            'freeze': '#96CEB4',
            'shuffle': '#F8C471',
            'clearLine': '#BB8FCE'
        };
        return colors[type] || '#FFFFFF';
    }

    getPowerUpIcon(type) {
        const icons = {
            'multiplier': '⚡',
            'timeExtend': '⏰',
            'bomb': '💣',
            'hint': '💡',
            'freeze': '❄️',
            'shuffle': '🔄',
            'clearLine': '🗑️'
        };
        return icons[type] || '?';
    }

    drawMultiplierEffect(ctx, x, y, progress) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', x, y - progress * 50);
    }

    drawBombEffect(ctx, x, y, progress) {
        const radius = 20 + progress * 30;
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawFreezeEffect(ctx, x, y, progress) {
        ctx.fillStyle = '#96CEB4';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❄️', x, y);
    }

    drawGenericEffect(ctx, x, y, progress) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✨', x, y - progress * 30);
    }

    getPowerUpEffect(type) {
        return this.powerUps[type]?.effect || 'none';
    }

    getPowerUpStats() {
        return {
            activeCount: this.getActivePowerUps().length,
            queueCount: this.powerUpQueue.length,
            availableTypes: this.powerUps.available,
            cooldowns: Object.fromEntries(this.powerUpCooldowns)
        };
    }
}
