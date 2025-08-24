/**
 * 🧠 Memory Manager - Letters Cascade Challenge
 * ============================================
 *
 * Advanced memory management system with object pooling
 * - Prevents memory leaks through object pooling
 * - Optimizes performance with reusable objects
 * - Monitors memory usage in real-time
 * - Automatic garbage collection assistance
 * - Cross-browser memory optimization
 *
 * @version 1.0.0 - Performance Optimized Edition
 * @author Enhanced with object pooling
 */

export class MemoryManager {
    constructor() {
        // Object pools
        this.pools = new Map();
        this.poolStats = new Map();
        
        // Memory monitoring
        this.memoryStats = {
            totalAllocated: 0,
            totalFreed: 0,
            currentUsage: 0,
            peakUsage: 0,
            lastGC: 0,
            poolCount: 0
        };
        
        // Performance monitoring
        this.performanceMonitor = {
            fps: 0,
            memoryUsage: 0,
            objectCount: 0,
            lastUpdate: 0
        };
        
        // Settings
        this.settings = {
            enablePooling: true,
            maxPoolSize: 100,
            gcThreshold: 0.8,
            monitoringInterval: 1000
        };
        
        // Monitoring interval
        this.monitoringInterval = null;
        
        console.log('🧠 Memory Manager initialized');
    }

    /**
     * Initialize memory management system
     */
    async init() {
        try {
            console.log('🧠 Initializing memory management system...');
            
            // Create default object pools
            this.createDefaultPools();
            
            // Start memory monitoring
            this.startMemoryMonitoring();
            
            console.log('✅ Memory Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Memory Manager:', error);
        }
    }

    /**
     * Create default object pools for common game objects
     */
    createDefaultPools() {
        // Letter object pool
        this.createPool('letters', () => ({
            char: '',
            x: 0,
            y: 0,
            z: 0,
            velocity: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            mesh: null,
            active: false,
            creationTime: 0
        }));

        // Particle object pool
        this.createPool('particles', () => ({
            x: 0,
            y: 0,
            z: 0,
            velocity: { x: 0, y: 0, z: 0 },
            life: 0,
            maxLife: 0,
            color: { r: 1, g: 1, b: 1 },
            size: 1,
            active: false
        }));

        // UI element pool
        this.createPool('uiElements', () => ({
            type: '',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            text: '',
            visible: false,
            element: null
        }));

        // Event object pool
        this.createPool('events', () => ({
            type: '',
            data: null,
            timestamp: 0,
            processed: false
        }));

        console.log('📦 Default object pools created');
    }

    /**
     * Create an object pool
     */
    createPool(name, factory, maxSize = this.settings.maxPoolSize) {
        const pool = {
            objects: [],
            factory: factory,
            maxSize: maxSize,
            created: 0,
            acquired: 0,
            released: 0
        };

        this.pools.set(name, pool);
        this.poolStats.set(name, {
            created: 0,
            acquired: 0,
            released: 0,
            currentSize: 0
        });

        console.log(`📦 Created object pool: ${name} (max: ${maxSize})`);
    }

    /**
     * Acquire an object from pool
     */
    acquire(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            console.warn(`⚠️ Pool not found: ${poolName}`);
            return null;
        }

        let object;
        if (pool.objects.length > 0) {
            object = pool.objects.pop();
            object.active = true;
            object.creationTime = performance.now();
        } else {
            object = pool.factory();
            object.active = true;
            object.creationTime = performance.now();
            pool.created++;
        }

        pool.acquired++;
        this.updatePoolStats(poolName);
        
        return object;
    }

    /**
     * Release an object back to pool
     */
    release(poolName, object) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            console.warn(`⚠️ Pool not found: ${poolName}`);
            return;
        }

        if (!object) {
            console.warn(`⚠️ Cannot release null object to pool: ${poolName}`);
            return;
        }

        // Reset object properties
        this.resetObject(object, poolName);
        object.active = false;

        // Add back to pool if not at max size
        if (pool.objects.length < pool.maxSize) {
            pool.objects.push(object);
            pool.released++;
        } else {
            // Object will be garbage collected
            console.log(`🗑️ Pool ${poolName} at max size, object will be GC'd`);
        }

        this.updatePoolStats(poolName);
    }

    /**
     * Reset object to initial state
     */
    resetObject(object, poolName) {
        switch (poolName) {
            case 'letters':
                object.char = '';
                object.x = 0;
                object.y = 0;
                object.z = 0;
                object.velocity = { x: 0, y: 0, z: 0 };
                object.rotation = { x: 0, y: 0, z: 0 };
                object.mesh = null;
                break;
                
            case 'particles':
                object.x = 0;
                object.y = 0;
                object.z = 0;
                object.velocity = { x: 0, y: 0, z: 0 };
                object.life = 0;
                object.maxLife = 0;
                object.color = { r: 1, g: 1, b: 1 };
                object.size = 1;
                break;
                
            case 'uiElements':
                object.type = '';
                object.x = 0;
                object.y = 0;
                object.width = 0;
                object.height = 0;
                object.text = '';
                object.visible = false;
                object.element = null;
                break;
                
            case 'events':
                object.type = '';
                object.data = null;
                object.timestamp = 0;
                object.processed = false;
                break;
        }
    }

    /**
     * Update pool statistics
     */
    updatePoolStats(poolName) {
        const pool = this.pools.get(poolName);
        const stats = this.poolStats.get(poolName);
        
        if (pool && stats) {
            stats.created = pool.created;
            stats.acquired = pool.acquired;
            stats.released = pool.released;
            stats.currentSize = pool.objects.length;
        }
    }

    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMemoryStats();
            this.checkMemoryThreshold();
        }, this.settings.monitoringInterval);
        
        console.log('📊 Memory monitoring started');
    }

    /**
     * Update memory statistics
     */
    updateMemoryStats() {
        try {
            // Get memory info if available
            if (performance.memory) {
                this.memoryStats.currentUsage = performance.memory.usedJSHeapSize;
                this.memoryStats.totalAllocated = performance.memory.totalJSHeapSize;
                
                if (this.memoryStats.currentUsage > this.memoryStats.peakUsage) {
                    this.memoryStats.peakUsage = this.memoryStats.currentUsage;
                }
            }

            // Update pool statistics
            this.memoryStats.poolCount = this.pools.size;
            let totalPooled = 0;
            
            this.pools.forEach((pool, name) => {
                totalPooled += pool.objects.length;
            });

            this.performanceMonitor.memoryUsage = this.memoryStats.currentUsage;
            this.performanceMonitor.objectCount = totalPooled;
            this.performanceMonitor.lastUpdate = Date.now();

        } catch (error) {
            console.warn('⚠️ Memory monitoring error:', error);
        }
    }

    /**
     * Check memory threshold and trigger garbage collection if needed
     */
    checkMemoryThreshold() {
        if (performance.memory) {
            const usageRatio = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            
            if (usageRatio > this.settings.gcThreshold) {
                console.warn('⚠️ High memory usage detected, suggesting garbage collection');
                this.suggestGarbageCollection();
            }
        }
    }

    /**
     * Suggest garbage collection (browser-dependent)
     */
    suggestGarbageCollection() {
        try {
            // Try to trigger garbage collection if available
            if (window.gc) {
                window.gc();
                console.log('🗑️ Garbage collection triggered');
            } else {
                // Alternative: clear some pools to free memory
                this.clearOldPools();
            }
            
            this.memoryStats.lastGC = Date.now();
            
        } catch (error) {
            console.warn('⚠️ Garbage collection not available');
        }
    }

    /**
     * Clear old objects from pools
     */
    clearOldPools() {
        const currentTime = performance.now();
        const maxAge = 30000; // 30 seconds
        
        this.pools.forEach((pool, name) => {
            const oldObjects = pool.objects.filter(obj => 
                currentTime - obj.creationTime > maxAge
            );
            
            if (oldObjects.length > 0) {
                pool.objects = pool.objects.filter(obj => 
                    currentTime - obj.creationTime <= maxAge
                );
                console.log(`🗑️ Cleared ${oldObjects.length} old objects from pool: ${name}`);
            }
        });
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        return {
            ...this.memoryStats,
            pools: Object.fromEntries(this.poolStats),
            performance: this.performanceMonitor
        };
    }

    /**
     * Get pool statistics
     */
    getPoolStats(poolName = null) {
        if (poolName) {
            return this.poolStats.get(poolName);
        }
        
        return Object.fromEntries(this.poolStats);
    }

    /**
     * Optimize memory usage
     */
    optimizeMemory() {
        console.log('🔧 Optimizing memory usage...');
        
        // Clear unused pools
        this.clearUnusedPools();
        
        // Suggest garbage collection
        this.suggestGarbageCollection();
        
        // Update statistics
        this.updateMemoryStats();
        
        console.log('✅ Memory optimization completed');
    }

    /**
     * Clear unused pools
     */
    clearUnusedPools() {
        this.pools.forEach((pool, name) => {
            if (pool.acquired === 0 && pool.objects.length > 0) {
                pool.objects.length = 0;
                console.log(`🗑️ Cleared unused pool: ${name}`);
            }
        });
    }

    /**
     * Dispose memory manager
     */
    dispose() {
        try {
            // Stop monitoring
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            
            // Clear all pools
            this.pools.forEach((pool, name) => {
                pool.objects.length = 0;
            });
            
            // Clear maps
            this.pools.clear();
            this.poolStats.clear();
            
            console.log('🧹 Memory Manager disposed successfully');
            
        } catch (error) {
            console.error('❌ Error disposing Memory Manager:', error);
        }
    }
}

// Also provide global access for non-module usage
if (typeof window !== 'undefined') {
    window.MemoryManager = MemoryManager;
}
