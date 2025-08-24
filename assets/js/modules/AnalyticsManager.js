/**
 * AnalyticsManager.js - Advanced analytics and monitoring module
 */

export class AnalyticsManager {
    constructor() {
        this.events = [];
        this.metrics = {
            performance: {},
            gameplay: {},
            user: {},
            errors: []
        };
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.isEnabled = true;
        this.batchSize = 10;
        this.flushInterval = 30000; // 30 seconds
        this.flushTimer = null;
    }

    async init() {
        try {
            this.setupPerformanceMonitoring();
            this.setupErrorTracking();
            this.startPeriodicFlush();
            console.log('📊 AnalyticsManager initialized with advanced features');
        } catch (error) {
            console.error('❌ AnalyticsManager initialization failed:', error);
            throw error;
        }
    }

    reset() {
        this.events = [];
        this.metrics = {
            performance: {},
            gameplay: {},
            user: {},
            errors: []
        };
        this.startTime = Date.now();
        // Re-initialize performance metrics so realtime monitor never reads undefined
        this.setupPerformanceMonitoring();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupPerformanceMonitoring() {
        // Ensure performance container
        if (!this.metrics.performance || typeof this.metrics.performance !== 'object') {
            this.metrics.performance = {};
        }
        // Monitor FPS
        this.metrics.performance.fps = {
            current: 0,
            average: 0,
            min: Infinity,
            max: 0,
            samples: []
        };

        // Monitor memory usage
        if (performance.memory) {
            this.metrics.performance.memory = {
                used: 0,
                total: 0,
                limit: 0
            };
        }

        // Monitor load times
        this.metrics.performance.loadTime = performance.now();
    }

    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.trackError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });

        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    startPeriodicFlush() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    // Safe no-op to be called each frame by GameCore
    update() {
        // Placeholder for future real-time aggregation; intentionally left blank
    }

    trackEvent(eventName, data = {}) {
        if (!this.isEnabled) return;

        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.events.push(event);

        // Auto-flush if batch is full
        if (this.events.length >= this.batchSize) {
            this.flush();
        }
    }

    trackGameplayEvent(eventName, data = {}) {
        this.trackEvent(`gameplay_${eventName}`, {
            ...data,
            category: 'gameplay'
        });
    }

    trackPerformanceEvent(eventName, data = {}) {
        this.trackEvent(`performance_${eventName}`, {
            ...data,
            category: 'performance'
        });
    }

    trackUserEvent(eventName, data = {}) {
        this.trackEvent(`user_${eventName}`, {
            ...data,
            category: 'user'
        });
    }

    trackError(errorType, errorData = {}) {
        const error = {
            type: errorType,
            data: errorData,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.metrics.errors.push(error);
        this.trackEvent('error', error);
    }

    updatePerformanceMetrics(fps, memoryUsage = null) {
        // Ensure structure exists (deep guards)
        if (!this.metrics || typeof this.metrics !== 'object') this.metrics = {};
        if (!this.metrics.performance || typeof this.metrics.performance !== 'object') this.metrics.performance = {};
        let fpsMetrics = this.metrics.performance.fps;
        if (!fpsMetrics || typeof fpsMetrics !== 'object' || !Array.isArray(fpsMetrics.samples)) {
            fpsMetrics = {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                samples: []
            };
            this.metrics.performance.fps = fpsMetrics;
        }

        // Update FPS metrics
        fpsMetrics.current = fps;
        fpsMetrics.samples.push(fps);
        
        if (fpsMetrics.samples.length > 60) {
            fpsMetrics.samples.shift();
        }
        
        fpsMetrics.average = fpsMetrics.samples.reduce((a, b) => a + b, 0) / fpsMetrics.samples.length;
        fpsMetrics.min = Math.min(fpsMetrics.min, fps);
        fpsMetrics.max = Math.max(fpsMetrics.max, fps);

        // Update memory metrics
        if (memoryUsage && performance.memory) {
            this.metrics.performance.memory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
    }

    updateGameplayMetrics(stats) {
        this.metrics.gameplay = {
            ...this.metrics.gameplay,
            ...stats,
            lastUpdated: Date.now()
        };
    }

    updateUserMetrics(userData) {
        this.metrics.user = {
            ...this.metrics.user,
            ...userData,
            lastUpdated: Date.now()
        };
    }

    // Game-specific tracking methods
    trackGameStart() {
        this.trackGameplayEvent('game_start', {
            timestamp: Date.now()
        });
    }

    trackGameEnd(reason, finalStats) {
        this.trackGameplayEvent('game_end', {
            reason: reason,
            duration: Date.now() - this.startTime,
            finalStats: finalStats
        });
    }

    trackWordCompleted(word, score, level) {
        this.trackGameplayEvent('word_completed', {
            word: word,
            score: score,
            level: level,
            wordLength: word.length
        });
    }

    trackPowerUpUsed(powerUpType, cost, success) {
        this.trackGameplayEvent('powerup_used', {
            type: powerUpType,
            cost: cost,
            success: success
        });
    }

    trackAchievementUnlocked(achievementName) {
        this.trackGameplayEvent('achievement_unlocked', {
            achievement: achievementName
        });
    }

    trackLevelUp(oldLevel, newLevel) {
        this.trackGameplayEvent('level_up', {
            oldLevel: oldLevel,
            newLevel: newLevel
        });
    }

    trackUserInteraction(interactionType, data = {}) {
        this.trackUserEvent('interaction', {
            type: interactionType,
            ...data
        });
    }

    trackPerformanceIssue(issueType, data = {}) {
        this.trackPerformanceEvent('issue', {
            type: issueType,
            ...data
        });
    }

    // Analytics methods
    getAnalytics() {
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            events: this.events.length,
            metrics: this.metrics,
            errors: this.metrics.errors.length
        };
    }

    getPerformanceReport() {
        const fps = this.metrics.performance.fps || { current: 0, average: 0, min: 0, max: 0 };
        return {
            fps: {
                current: fps.current,
                average: fps.average,
                min: fps.min,
                max: fps.max,
                stability: fps.average > 55 ? 'good' : fps.average > 30 ? 'fair' : 'poor'
            },
            memory: this.metrics.performance.memory,
            loadTime: this.metrics.performance.loadTime
        };
    }

    getGameplayReport() {
        return {
            ...this.metrics.gameplay,
            sessionDuration: Date.now() - this.startTime
        };
    }

    getErrorReport() {
        const errorTypes = {};
        this.metrics.errors.forEach(error => {
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
        });

        return {
            totalErrors: this.metrics.errors.length,
            errorTypes: errorTypes,
            recentErrors: this.metrics.errors.slice(-5)
        };
    }

    // Data export and persistence
    exportData() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: Date.now(),
            events: this.events,
            metrics: this.metrics
        };
    }

    saveToLocalStorage() {
        try {
            const data = this.exportData();
            localStorage.setItem('analytics_data', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ Failed to save analytics to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('analytics_data');
            if (data) {
                const parsed = JSON.parse(data);
                this.events = parsed.events || [];
                this.metrics = parsed.metrics || {};
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load analytics from localStorage:', error);
        }
        return false;
    }

    // Data transmission (for server-side analytics)
    async flush() {
        if (this.events.length === 0) return;

        try {
            const batch = this.events.splice(0, this.batchSize);
            
            // In a real implementation, you would send this to your analytics server
            // For now, we'll just log it and save to localStorage
            console.log('📊 Analytics batch flushed:', batch.length, 'events');
            
            // Save to localStorage as backup
            this.saveToLocalStorage();
            
            // Simulate server transmission
            await this.transmitToServer(batch);
            
        } catch (error) {
            console.error('❌ Failed to flush analytics:', error);
            // Restore events to retry later
            this.events.unshift(...this.events);
        }
    }

    async transmitToServer(batch) {
        // Simulate server transmission
        // In a real implementation, you would use fetch() to send to your analytics endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('📡 Analytics transmitted to server (simulated)');
                resolve();
            }, 100);
        });
    }

    // Real-time monitoring
    startRealTimeMonitoring() {
        // Monitor FPS in real-time
        setInterval(() => {
            const fpsObj = this.metrics?.performance?.fps;
            const fps = fpsObj && typeof fpsObj.current === 'number' ? fpsObj.current : 0;
            if (fps < 30) {
                this.trackPerformanceIssue('low_fps', { fps: fps });
            }
        }, 5000);

        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                
                if (usagePercent > 80) {
                    this.trackPerformanceIssue('high_memory_usage', {
                        usagePercent: usagePercent,
                        used: memory.usedJSHeapSize,
                        limit: memory.jsHeapSizeLimit
                    });
                }
            }, 10000);
        }
    }

    // A/B Testing support
    trackExperiment(experimentName, variant, data = {}) {
        this.trackEvent('experiment', {
            name: experimentName,
            variant: variant,
            ...data
        });
    }

    // User segmentation
    setUserSegment(segment) {
        this.metrics.user.segment = segment;
        this.trackUserEvent('segment_assigned', { segment: segment });
    }

    // Custom dimensions
    setCustomDimension(name, value) {
        this.metrics.user.customDimensions = this.metrics.user.customDimensions || {};
        this.metrics.user.customDimensions[name] = value;
    }

    // Cleanup
    cleanup() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        
        // Final flush
        this.flush();
    }

    // Privacy and GDPR compliance
    anonymizeData() {
        // Remove personally identifiable information
        this.events.forEach(event => {
            delete event.userAgent;
            delete event.ip;
            // Add more fields to anonymize as needed
        });
    }

    // Data retention
    cleanupOldData(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
        const cutoff = Date.now() - maxAge;
        this.events = this.events.filter(event => event.timestamp > cutoff);
        this.metrics.errors = this.metrics.errors.filter(error => error.timestamp > cutoff);
    }
}
