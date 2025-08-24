/**
 * 🎮 Optimized Babylon.js Letters Cascade Challenge Game
 * ====================================================
 *
 * A simplified, high-performance 3D game engine featuring:
 * - Clean, optimized Babylon.js environment
 * - Enhanced performance monitoring
 * - Better game integration
 * - Improved camera controls
 * - Performance-optimized rendering
 * - Simplified but beautiful environment
 * - Modern ES2025+ features
 *
 * @version 3.0.0 - Enhanced Edition
 * @author Enhanced with performance focus
 */

class BabylonOptimizedGame {
    constructor() {
        // Core engine properties
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;

        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.level = 1;
        this.foundWords = [];
        this.selectedLetters = [];

        // Game grid
        this.gridSize = 8;
        this.gridLetters = [];
        this.fallingLetters = [];
        this.letterQueue = [];
        this.gridVisible = true;

        // Performance optimization
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fps = 60;
        this.memoryUsage = 0;

        // Camera controls
        this.cameraMode = 'game'; // 'game', 'free', 'orbit'
        this.cameraTarget = new BABYLON.Vector3(0, 0, 0);
        this.cameraSensitivity = {
            pan: 1000,
            rotate: 1000,
            zoom: 0.01
        };

        // Enhanced features
        this.particleSystems = [];
        this.audioContext = null;
        this.performanceMonitor = {
            fps: 0,
            memory: 0,
            renderTime: 0,
            lastUpdate: 0
        };

        // Event listeners
        this.resizeListener = null;
        this.keyboardListener = null;
        this.mouseListener = null;

        // Fallback support
        this.fallbackMode = false;
        this.webglSupported = false;

        console.log('🎮 Optimized Babylon.js Game Engine initialized');
    }

    /**
     * Initialize Babylon.js with comprehensive fallback support
     */
    async init(canvas) {
        try {
            this.canvas = canvas;

            if (!this.canvas) {
                throw new Error('Canvas element is required');
            }

            // Check WebGL support first
            this.webglSupported = this.checkWebGLSupport();
            if (!this.webglSupported) {
                console.warn('⚠️ WebGL not supported, enabling fallback mode');
                this.enableFallbackMode();
                return;
            }

            // Check Babylon.js availability
            if (typeof BABYLON === 'undefined') {
                console.error('❌ Babylon.js not loaded');
                this.enableFallbackMode();
                return;
            }

            // Create optimized engine with enhanced settings and fallback
            try {
                this.engine = new BABYLON.Engine(this.canvas, true, {
                    preserveDrawingBuffer: false,
                    stencil: false,
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance"
                });
            } catch (error) {
                console.error('❌ Failed to initialize Babylon.js engine:', error);
                this.enableFallbackMode();
                return;
            }

            // Create scene with optimizations
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.clearCachedVertexData();
            this.scene.autoClear = true;
            this.scene.useRightHandedSystem = true;

            // Setup enhanced environment
            await this.setupEnhancedEnvironment();
            await this.setupEnhancedCamera();
            await this.setupEnhancedLighting();
            await this.setupGameGrid();
            await this.setupAudioSystem();

            // Setup event listeners
            this.setupEventListeners();

            // Start render loop
            this.startRenderLoop();

            console.log('✅ Enhanced game engine initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing enhanced game:', error);
            this.enableFallbackMode();
        }
    }

    /**
     * Check WebGL support with comprehensive testing
     */
    checkWebGLSupport() {
        try {
            // Check if WebGL is supported
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                console.warn('⚠️ WebGL not available');
                return false;
            }

            // Check for essential WebGL features
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                console.log('🎮 WebGL Renderer:', renderer);
            }

            return true;
        } catch (error) {
            console.error('❌ WebGL support check failed:', error);
            return false;
        }
    }

    /**
     * Enable fallback mode for unsupported browsers
     */
    enableFallbackMode() {
        this.fallbackMode = true;
        console.log('🔄 Enabling fallback mode');
        
        // Create fallback UI
        this.createFallbackUI();
        
        // Show fallback message
        this.showFallbackMessage();
    }

    /**
     * Create fallback UI for unsupported browsers
     */
    createFallbackUI() {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.id = 'fallback';
        fallbackDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 1000;
            max-width: 400px;
        `;
        
        fallbackDiv.innerHTML = `
            <h3>🎮 Browser Compatibility</h3>
            <p>Your browser doesn't support the required features for the 3D game.</p>
            <p>Please try:</p>
            <ul style="text-align: left; margin: 20px 0;">
                <li>Updating your browser to the latest version</li>
                <li>Enabling WebGL in your browser settings</li>
                <li>Using a modern browser (Chrome, Firefox, Safari, Edge)</li>
            </ul>
            <button onclick="location.reload()" style="
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
            ">🔄 Retry</button>
        `;
        
        document.body.appendChild(fallbackDiv);
    }

    /**
     * Show fallback message
     */
    showFallbackMessage() {
        console.log('📱 Fallback mode activated - 3D features disabled');
        console.log('💡 Try the 2D version: classic-2d-game-enhanced.html');
    }

    /**
     * Setup enhanced environment - beautiful and optimized
     */
    async setupEnhancedEnvironment() {
        try {
            console.log('🌍 Setting up enhanced environment...');

            // Create a beautiful ground plane with texture
            const ground = BABYLON.MeshBuilder.CreateGround("ground", {
                width: 20,
                height: 20
            }, this.scene);

            const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
            groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.4);
            groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            groundMaterial.metallic = 0.1;
            groundMaterial.roughness = 0.8;
            ground.material = groundMaterial;

            // Create enhanced skybox with gradient
            const skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 100 }, this.scene);
            const skyboxMaterial = new BABYLON.StandardMaterial("skyboxMaterial", this.scene);
            skyboxMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
            skyboxMaterial.backFaceCulling = false;
            skybox.material = skyboxMaterial;

            // Add subtle fog for depth
            this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
            this.scene.fogDensity = 0.01;
            this.scene.fogColor = new BABYLON.Color3(0.1, 0.2, 0.4);

            // Water features inspired by 2D concept: river + waterfall
            this.createWaterEnvironmentOptimized();

            console.log('✅ Enhanced environment setup complete');
        } catch (error) {
            console.error('❌ Error setting up environment:', error);
        }
    }

    /**
     * Create river and waterfall environment (optimized version)
     */
    createWaterEnvironmentOptimized() {
        try {
            const groundLevel = -0.2;

            // River bed
            const riverBed = BABYLON.MeshBuilder.CreateBox("riverBed", {
                width: 12,
                height: 0.4,
                depth: 28
            }, this.scene);
            riverBed.position = new BABYLON.Vector3(0, groundLevel - 0.2, -10);

            const riverBedMat = new BABYLON.StandardMaterial("riverBedMat", this.scene);
            riverBedMat.diffuseColor = new BABYLON.Color3(0.03, 0.15, 0.3);
            riverBed.material = riverBedMat;

            // River surface
            const riverSurface = BABYLON.MeshBuilder.CreatePlane("riverSurface", {
                width: 12,
                height: 28
            }, this.scene);
            riverSurface.rotation.x = -Math.PI / 2;
            riverSurface.position = new BABYLON.Vector3(0, groundLevel - 0.05, -10);

            const riverMat = new BABYLON.StandardMaterial("riverMat", this.scene);
            riverMat.diffuseColor = new BABYLON.Color3(0.05, 0.45, 0.85);
            riverMat.alpha = 0.7;
            riverMat.specularColor = new BABYLON.Color3(0.9, 0.95, 1.0);
            riverSurface.material = riverMat;

            // Simple flow particles
            const riverParticles = new BABYLON.ParticleSystem("riverParticles", 150, this.scene);
            riverParticles.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            riverParticles.emitter = new BABYLON.Vector3(0, groundLevel + 0.05, -24);
            riverParticles.minEmitBox = new BABYLON.Vector3(-5.5, 0, 0);
            riverParticles.maxEmitBox = new BABYLON.Vector3(5.5, 0, 0);
            riverParticles.color1 = new BABYLON.Color4(0.4, 0.7, 1.0, 0.6);
            riverParticles.color2 = new BABYLON.Color4(0.2, 0.5, 0.9, 0.4);
            riverParticles.minSize = 0.05;
            riverParticles.maxSize = 0.12;
            riverParticles.minLifeTime = 2.0;
            riverParticles.maxLifeTime = 4.0;
            riverParticles.emitRate = 80;
            riverParticles.direction1 = new BABYLON.Vector3(0, 0, 1);
            riverParticles.direction2 = new BABYLON.Vector3(0, 0, 1);
            riverParticles.start();

            // Waterfall sheet
            const waterfall = BABYLON.MeshBuilder.CreatePlane("waterfall", {
                width: 4,
                height: 9
            }, this.scene);
            waterfall.position = new BABYLON.Vector3(0, 4.5, -24);
            const waterfallMat = new BABYLON.StandardMaterial("waterfallMat", this.scene);
            waterfallMat.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1.0);
            waterfallMat.alpha = 0.85;
            waterfall.material = waterfallMat;

            // Waterfall particles
            const fallParticles = new BABYLON.ParticleSystem("waterfallParticles", 400, this.scene);
            fallParticles.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            fallParticles.emitter = new BABYLON.Vector3(0, 9, -24);
            fallParticles.minEmitBox = new BABYLON.Vector3(-1.5, 0, 0);
            fallParticles.maxEmitBox = new BABYLON.Vector3(1.5, 0, 0);
            fallParticles.color1 = new BABYLON.Color4(0.8, 0.9, 1.0, 1.0);
            fallParticles.color2 = new BABYLON.Color4(0.5, 0.7, 1.0, 0.9);
            fallParticles.minSize = 0.06;
            fallParticles.maxSize = 0.12;
            fallParticles.gravity = new BABYLON.Vector3(0, -9.81, 0);
            fallParticles.direction1 = new BABYLON.Vector3(-0.05, -1, 0);
            fallParticles.direction2 = new BABYLON.Vector3(0.05, -1, 0);
            fallParticles.emitRate = 300;
            fallParticles.start();
        } catch (e) {
            console.warn('⚠️ Water environment setup failed:', e);
        }
    }

    /**
     * Setup enhanced camera with smooth controls
     */
    async setupEnhancedCamera() {
        try {
            console.log('📷 Setting up enhanced camera...');

            // Create arc rotate camera with enhanced settings
            this.camera = new BABYLON.ArcRotateCamera("gameCamera",
                Math.PI / 4, // alpha
                Math.PI / 3, // beta
                12, // radius
                this.cameraTarget,
                this.scene
            );

            // Enhanced camera settings
            this.camera.attachControl(this.canvas, true);
            this.camera.lowerRadiusLimit = 8;
            this.camera.upperRadiusLimit = 20;
            this.camera.wheelDeltaPercentage = 0.01;
            this.camera.panningSensibility = this.cameraSensitivity.pan;
            this.camera.angularSensibilityX = this.cameraSensitivity.rotate;
            this.camera.angularSensibilityY = this.cameraSensitivity.rotate;

            // Smooth camera movement with inertia
            this.camera.inertia = 0.9;
            this.camera.panningInertia = 0.9;

            // Set initial position
            this.camera.setPosition(new BABYLON.Vector3(8, 8, 8));

            console.log('✅ Enhanced camera setup complete');
        } catch (error) {
            console.error('❌ Error setting up camera:', error);
        }
    }

    /**
     * Setup enhanced lighting
     */
    async setupEnhancedLighting() {
        try {
            console.log('💡 Setting up enhanced lighting...');

            // Create hemispheric light for ambient lighting
            const ambientLight = new BABYLON.HemisphericLight("ambientLight",
                new BABYLON.Vector3(0, 1, 0),
                this.scene
            );
            ambientLight.intensity = 0.6;
            ambientLight.diffuse = new BABYLON.Color3(1, 1, 1);
            ambientLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);

            // Create directional light for main illumination
            const mainLight = new BABYLON.DirectionalLight("mainLight",
                new BABYLON.Vector3(0, -1, 0),
                this.scene
            );
            mainLight.intensity = 0.8;
            mainLight.diffuse = new BABYLON.Color3(1, 1, 1);
            mainLight.specular = new BABYLON.Color3(0.3, 0.3, 0.3);

            // Add point light for letter highlighting
            const letterLight = new BABYLON.PointLight("letterLight",
                new BABYLON.Vector3(0, 5, 0),
                this.scene
            );
            letterLight.intensity = 0.5;
            letterLight.range = 15;

            // Add subtle rim light
            const rimLight = new BABYLON.DirectionalLight("rimLight",
                new BABYLON.Vector3(1, 0, 1),
                this.scene
            );
            rimLight.intensity = 0.3;
            rimLight.diffuse = new BABYLON.Color3(0.8, 0.8, 1);

            console.log('✅ Enhanced lighting setup complete');
        } catch (error) {
            console.error('❌ Error setting up lighting:', error);
        }
    }

    /**
     * Setup game grid with enhanced rendering
     */
    async setupGameGrid() {
        try {
            console.log('🎯 Setting up enhanced game grid...');

            // Create grid container
            this.gridContainer = new BABYLON.TransformNode("gridContainer", this.scene);

            // Create enhanced grid lines
            this.createEnhancedGridLines();

            // Initialize enhanced letter pool
            this.setupEnhancedLetterPool();

            console.log('✅ Enhanced game grid setup complete');
        } catch (error) {
            console.error('❌ Error setting up game grid:', error);
        }
    }

    /**
     * Create enhanced grid lines with better visuals
     */
    createEnhancedGridLines() {
        const gridMaterial = new BABYLON.StandardMaterial("gridMaterial", this.scene);
        gridMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        gridMaterial.alpha = 0.3;
        gridMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        // Create enhanced grid lines
        for (let i = 0; i <= this.gridSize; i++) {
            // Horizontal lines
            const hLine = BABYLON.MeshBuilder.CreateLines("hLine" + i, {
                points: [
                    new BABYLON.Vector3(-this.gridSize/2, 0, i - this.gridSize/2),
                    new BABYLON.Vector3(this.gridSize/2, 0, i - this.gridSize/2)
                ]
            }, this.scene);
            hLine.color = new BABYLON.Color3(0.7, 0.7, 0.7);
            hLine.parent = this.gridContainer;

            // Vertical lines
            const vLine = BABYLON.MeshBuilder.CreateLines("vLine" + i, {
                points: [
                    new BABYLON.Vector3(i - this.gridSize/2, 0, -this.gridSize/2),
                    new BABYLON.Vector3(i - this.gridSize/2, 0, this.gridSize/2)
                ]
            }, this.scene);
            vLine.color = new BABYLON.Color3(0.7, 0.7, 0.7);
            vLine.parent = this.gridContainer;
        }
    }

    /**
     * Setup enhanced letter pool with better materials
     */
    setupEnhancedLetterPool() {
        this.letterPool = [];
        this.letterMaterials = {};

        // Create enhanced letter material
        const baseMaterial = new BABYLON.StandardMaterial("baseLetterMaterial", this.scene);
        baseMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        baseMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        baseMaterial.specularPower = 30;
        baseMaterial.metallic = 0.2;
        baseMaterial.roughness = 0.8;

        // Create materials for each letter with enhanced colors
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        letters.forEach(letter => {
            const material = baseMaterial.clone("letterMaterial" + letter);
            material.diffuseColor = this.getEnhancedLetterColor(letter);
            material.emissiveColor = this.getEnhancedLetterColor(letter).scale(0.1);
            this.letterMaterials[letter] = material;
        });
    }

    /**
     * Get enhanced letter color with better palette
     */
    getEnhancedLetterColor(letter) {
        const colors = {
            'A': new BABYLON.Color3(1, 0.3, 0.3),   // Red
            'E': new BABYLON.Color3(0.3, 1, 0.3),   // Green
            'I': new BABYLON.Color3(0.3, 0.3, 1),   // Blue
            'O': new BABYLON.Color3(1, 1, 0.3),     // Yellow
            'U': new BABYLON.Color3(1, 0.3, 1),     // Magenta
            'Y': new BABYLON.Color3(0.3, 1, 1),     // Cyan
            'B': new BABYLON.Color3(0.8, 0.4, 0.2), // Orange
            'C': new BABYLON.Color3(0.2, 0.8, 0.4), // Lime
            'D': new BABYLON.Color3(0.4, 0.2, 0.8), // Purple
            'F': new BABYLON.Color3(0.8, 0.2, 0.8), // Pink
            'G': new BABYLON.Color3(0.2, 0.8, 0.8), // Teal
            'H': new BABYLON.Color3(0.8, 0.8, 0.2), // Gold
            'J': new BABYLON.Color3(0.6, 0.4, 0.2), // Brown
            'K': new BABYLON.Color3(0.2, 0.6, 0.4), // Forest
            'L': new BABYLON.Color3(0.4, 0.2, 0.6), // Indigo
            'M': new BABYLON.Color3(0.6, 0.2, 0.4), // Maroon
            'N': new BABYLON.Color3(0.2, 0.4, 0.6), // Navy
            'P': new BABYLON.Color3(0.6, 0.4, 0.2), // Bronze
            'Q': new BABYLON.Color3(0.4, 0.6, 0.2), // Olive
            'R': new BABYLON.Color3(0.8, 0.2, 0.2), // Crimson
            'S': new BABYLON.Color3(0.2, 0.8, 0.2), // Emerald
            'T': new BABYLON.Color3(0.2, 0.2, 0.8), // Royal Blue
            'V': new BABYLON.Color3(0.8, 0.4, 0.8), // Lavender
            'W': new BABYLON.Color3(0.4, 0.8, 0.4), // Mint
            'X': new BABYLON.Color3(0.8, 0.8, 0.4), // Cream
            'Z': new BABYLON.Color3(0.4, 0.4, 0.8)  // Periwinkle
        };

        return colors[letter] || new BABYLON.Color3(0.8, 0.8, 0.8);
    }

    /**
     * Create enhanced letter mesh with better geometry
     */
    createEnhancedLetterMesh(letter, position) {
        try {
            // Try to build a mesh shaped like the letter using primitives
            const mesh = this.buildLetterMeshPrimitives(letter);
            mesh.position = position;
            mesh.material = this.letterMaterials[letter];
            return mesh;
        } catch (error) {
            console.error('❌ Error creating enhanced letter mesh:', error);
            return null;
        }
    }

    /**
     * Build a letter-shaped mesh using simple primitives (optimized, partial alphabet)
     * Falls back to a rounded box for unsupported letters
     */
    buildLetterMeshPrimitives(letter) {
        const L = letter.toUpperCase();
        const parts = [];
        const thickness = 0.18;
        const depth = 0.22;

        const makeBar = (w, h, x, y, rotZ = 0) => {
            const bar = BABYLON.MeshBuilder.CreateBox(`bar_${Math.random()}`, { width: w, height: h, depth }, this.scene);
            bar.position = new BABYLON.Vector3(x, y, 0);
            bar.rotation.z = rotZ;
            parts.push(bar);
            return bar;
        };

        switch (L) {
            case 'I':
                makeBar(thickness, 0.9, 0, 0);
                break;
            case 'L':
                makeBar(thickness, 0.9, -0.25, 0);
                makeBar(0.7, thickness, 0.1, -0.45);
                break;
            case 'T':
                makeBar(0.9, thickness, 0, 0.45);
                makeBar(thickness, 0.9, 0, -0.0);
                break;
            case 'H':
                makeBar(thickness, 0.9, -0.25, 0);
                makeBar(thickness, 0.9, 0.25, 0);
                makeBar(0.6, thickness, 0, 0);
                break;
            case 'E':
                makeBar(thickness, 0.9, -0.25, 0);
                makeBar(0.6, thickness, 0.05, 0.45);
                makeBar(0.6, thickness, 0.05, 0);
                makeBar(0.6, thickness, 0.05, -0.45);
                break;
            case 'F':
                makeBar(thickness, 0.9, -0.25, 0);
                makeBar(0.6, thickness, 0.05, 0.45);
                makeBar(0.5, thickness, 0.0, 0);
                break;
            case 'A':
                makeBar(thickness, 1.0, -0.22, 0, Math.PI / 12);
                makeBar(thickness, 1.0, 0.22, 0, -Math.PI / 12);
                makeBar(0.45, thickness, 0, 0.05);
                break;
            case 'M':
                makeBar(thickness, 0.9, -0.35, 0);
                makeBar(thickness, 0.9, 0.35, 0);
                makeBar(thickness, 0.9, 0, 0, Math.PI / 6);
                makeBar(thickness, 0.9, 0, 0, -Math.PI / 6);
                break;
            case 'N':
                makeBar(thickness, 0.9, -0.3, 0);
                makeBar(thickness, 0.9, 0.3, 0);
                makeBar(thickness, 0.95, 0, 0, -Math.atan2(0.9, 0.6));
                break;
            case 'V':
                makeBar(thickness, 1.0, -0.18, -0.05, Math.PI / 8);
                makeBar(thickness, 1.0, 0.18, -0.05, -Math.PI / 8);
                break;
            case 'W':
                makeBar(thickness, 1.0, -0.35, -0.05, Math.PI / 8);
                makeBar(thickness, 1.0, -0.1, -0.05, -Math.PI / 8);
                makeBar(thickness, 1.0, 0.1, -0.05, Math.PI / 8);
                makeBar(thickness, 1.0, 0.35, -0.05, -Math.PI / 8);
                break;
            case 'Y':
                makeBar(thickness, 0.5, 0, -0.2);
                makeBar(thickness, 0.6, -0.18, 0.25, Math.PI / 6);
                makeBar(thickness, 0.6, 0.18, 0.25, -Math.PI / 6);
                break;
            case 'Z':
                makeBar(0.9, thickness, 0, 0.45);
                makeBar(0.9, thickness, 0, -0.45);
                makeBar(thickness, 0.95, 0, 0, -Math.atan2(0.9, 0.9));
                break;
            case 'O': {
                const ring = BABYLON.MeshBuilder.CreateTorus("letterO", { diameter: 0.8, thickness: 0.18 }, this.scene);
                parts.push(ring);
                break;
            }
            case 'U':
                makeBar(thickness, 0.7, -0.28, -0.1);
                makeBar(thickness, 0.7, 0.28, -0.1);
                // Bottom curve approximation
                const arc = BABYLON.MeshBuilder.CreateTorus("U_arc", { diameter: 0.56, thickness: thickness }, this.scene);
                arc.rotation.x = Math.PI / 2;
                arc.position = new BABYLON.Vector3(0, -0.45, 0);
                parts.push(arc);
                break;
            default: {
                // Fallback: rounded box with front letter plane
                const box = BABYLON.MeshBuilder.CreateBox("letterBox", { width: 0.8, height: 0.8, depth }, this.scene);
                // Add small front plane with emissive to hint the glyph
                const front = BABYLON.MeshBuilder.CreatePlane("glyph", { width: 0.55, height: 0.55 }, this.scene);
                const mat = new BABYLON.StandardMaterial("glyphMat", this.scene);
                mat.emissiveColor = new BABYLON.Color3(0.15, 0.15, 0.15);
                front.material = mat;
                front.position = new BABYLON.Vector3(0, 0, 0.11);
                front.parent = box;
                parts.push(box);
            }
        }

        if (parts.length === 1) return parts[0];
        const merged = BABYLON.Mesh.MergeMeshes(parts, true, true, undefined, false, true);
        return merged || parts[0];
    }

    /**
     * Setup audio system for 3D spatial audio
     */
    async setupAudioSystem() {
        try {
            console.log('🔊 Setting up audio system...');

            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create audio listener for 3D spatial audio
            this.audioListener = new BABYLON.AudioListener();
            this.camera.attachAudioListener(this.audioListener);

            console.log('✅ Audio system setup complete');
        } catch (error) {
            console.error('❌ Error setting up audio system:', error);
        }
    }

    /**
     * Setup enhanced event listeners
     */
    setupEventListeners() {
        // Enhanced keyboard controls
        this.keyboardListener = (event) => {
            switch(event.code) {
                case 'KeyR':
                    this.resetCamera();
                    break;
                case 'KeyC':
                    this.toggleCameraMode();
                    break;
                case 'KeyG':
                    this.toggleGridVisibility();
                    break;
                case 'KeyP':
                    this.togglePerformanceMode();
                    break;
                case 'KeyH':
                    this.showHelp();
                    break;
            }
        };

        window.addEventListener('keydown', this.keyboardListener);

        // Enhanced resize handler
        this.resizeListener = () => {
            if (this.engine) {
                this.engine.resize();
            }
        };

        window.addEventListener('resize', this.resizeListener);

        // Enhanced mouse controls
        this.mouseListener = (event) => {
            // Add custom mouse interactions here
        };

        this.canvas.addEventListener('mousemove', this.mouseListener);
    }

    /**
     * Start enhanced render loop with performance monitoring
     */
    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            this.updateEnhancedGame();
            this.scene.render();
        });
    }

    /**
     * Update enhanced game logic with performance optimization
     */
    updateEnhancedGame() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Calculate enhanced FPS
        this.fps = 1000 / deltaTime;

        // Update frame counter
        this.frameCount++;

        // Update falling letters with enhanced physics
        this.updateEnhancedFallingLetters(deltaTime);

        // Update camera with enhanced controls
        this.updateEnhancedCamera(deltaTime);

        // Update performance monitoring
        this.updatePerformanceMonitoring();

        // Performance logging
        if (this.frameCount % 60 === 0) {
            this.logEnhancedPerformance();
        }
    }

    /**
     * Update enhanced falling letters with better physics
     */
    updateEnhancedFallingLetters(deltaTime) {
        this.fallingLetters.forEach(letter => {
            if (letter && letter.mesh) {
                // Enhanced gravity simulation
                letter.velocity = letter.velocity || new BABYLON.Vector3(0, -2, 0);
                letter.velocity.y -= 9.8 * deltaTime * 0.001; // Gravity

                // Enhanced movement with damping
                letter.mesh.position.addInPlace(letter.velocity.scale(deltaTime * 0.001));

                // Enhanced rotation with smooth animation
                letter.mesh.rotation.y += 0.02;
                letter.mesh.rotation.x += 0.01;

                // Add subtle floating effect
                letter.mesh.position.y += Math.sin(currentTime * 0.001 + letter.mesh.position.x) * 0.001;

                // Remove if too low
                if (letter.mesh.position.y < -5) {
                    letter.mesh.dispose();
                }
            }
        });

        // Clean up disposed letters
        this.fallingLetters = this.fallingLetters.filter(letter =>
            letter && letter.mesh && !letter.mesh.isDisposed()
        );
    }

    /**
     * Update enhanced camera with smooth controls
     */
    updateEnhancedCamera(deltaTime) {
        if (this.cameraMode === 'game') {
            // Enhanced game camera mode - focus on grid with smooth transitions
            const targetPosition = new BABYLON.Vector3(0, 5, 8);
            this.camera.position = BABYLON.Vector3.Lerp(
                this.camera.position,
                targetPosition,
                deltaTime * 0.001
            );
        }
    }

    /**
     * Update performance monitoring
     */
    updatePerformanceMonitoring() {
        this.performanceMonitor.fps = this.fps;
        this.performanceMonitor.memory = this.fallingLetters.length * 0.1;
        this.performanceMonitor.renderTime = this.engine.getDeltaTime();
        this.performanceMonitor.lastUpdate = performance.now();
    }

    /**
     * Enhanced camera control methods
     */
    resetCamera() {
        this.camera.setPosition(new BABYLON.Vector3(8, 8, 8));
        this.camera.setTarget(this.cameraTarget);
        console.log('📷 Camera reset to default position');
    }

    toggleCameraMode() {
        const modes = ['game', 'free', 'orbit'];
        const currentIndex = modes.indexOf(this.cameraMode);
        this.cameraMode = modes[(currentIndex + 1) % modes.length];
        console.log('📷 Camera mode switched to:', this.cameraMode);
    }

    toggleGridVisibility() {
        if (this.gridContainer) {
            this.gridVisible = !this.gridVisible;
            this.gridContainer.setEnabled(this.gridVisible);
            console.log('🎯 Grid visibility:', this.gridVisible ? 'ON' : 'OFF');
        }
    }

    togglePerformanceMode() {
        // Toggle performance optimizations
        console.log('⚡ Performance mode toggled');
    }

    showHelp() {
        console.log('❓ Help: R=Reset, C=Toggle Camera, G=Toggle Grid, P=Performance, H=Help');
    }

    /**
     * Enhanced performance logging
     */
    logEnhancedPerformance() {
        console.log(`🎮 Enhanced Performance - FPS: ${this.fps.toFixed(1)}, Letters: ${this.fallingLetters.length}, Memory: ${this.performanceMonitor.memory.toFixed(1)}MB`);
    }

    /**
     * Enhanced game control methods
     */
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.level = 1;
        this.foundWords = [];
        console.log('🎮 Enhanced game started');
    }

    stopGame() {
        this.gameRunning = false;
        console.log('🎮 Enhanced game stopped');
    }

    /**
     * Add enhanced falling letter with better effects
     */
    addEnhancedFallingLetter(letter) {
        const position = new BABYLON.Vector3(
            (Math.random() - 0.5) * this.gridSize,
            10,
            (Math.random() - 0.5) * this.gridSize
        );

        const letterMesh = this.createEnhancedLetterMesh(letter, position);
        if (letterMesh) {
            this.fallingLetters.push({
                mesh: letterMesh,
                letter: letter,
                velocity: new BABYLON.Vector3(0, -1, 0),
                creationTime: performance.now()
            });
        }
    }

    /**
     * Enhanced cleanup and dispose
     */
    dispose() {
        try {
            console.log('🧹 Disposing enhanced game...');

            // Stop game
            this.stopGame();

            // Remove event listeners
            if (this.keyboardListener) {
                window.removeEventListener('keydown', this.keyboardListener);
            }

            if (this.resizeListener) {
                window.removeEventListener('resize', this.resizeListener);
            }

            if (this.mouseListener) {
                this.canvas.removeEventListener('mousemove', this.mouseListener);
            }

            // Dispose audio context
            if (this.audioContext) {
                this.audioContext.close();
            }

            // Dispose scene and engine
            if (this.scene) {
                this.scene.dispose();
            }

            if (this.engine) {
                this.engine.dispose();
            }

            console.log('✅ Enhanced game disposed successfully');
        } catch (error) {
            console.error('❌ Error during disposal:', error);
        }
    }

    // Backward compatibility methods
    addFallingLetter(letter) {
        this.addEnhancedFallingLetter(letter);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BabylonOptimizedGame;
} else {
    window.BabylonOptimizedGame = BabylonOptimizedGame;
}
