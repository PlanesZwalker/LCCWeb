/**
 * 🌊 Enhanced Babylon.js Letters Cascade Challenge Game Engine
 * ========================================================
 * 
 * A complete 3D game engine built with Babylon.js featuring:
 * - Advanced fluid simulation and particle systems
 * - PBR (Physically Based Rendering) materials
 * - Enhanced lighting and post-processing effects
 * - Immersive 3D environment with waterfalls and nature
 * - Letter falling mechanics with physics
 * - Word formation and game logic
 * 
 * @version 2.0.0
 * @author Enhanced with Babylon.js
 */

class BabylonEnhancedGame {
    constructor() {
        // Core Babylon.js components
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.fluidRenderer = null;
        
        // Game grid and letters
        this.gridSize = 8;
        this.gridLetters = [];
        this.fallingLetters = [];
        this.letterQueue = [];
        this.gridLayoutMode = '3D';
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.foundWords = [];
        this.selectedLetters = [];
        this.currentLevel = 1;
        this.frameCount = 0;
        
        // Game mechanics
        this.letterFallSpeed = 2;
        this.letterSpawnRate = 2000;
        this.letterDropMs = 3000;
        // Difficulty
        this.difficulty = 'normal';
        this.difficultyMultipliers = { easy: 0.8, normal: 1.0, hard: 1.25, extreme: 1.5 };
        
        // Enhanced features
        this.particleSystems = [];
        this.materialLibrary = {};
        this.lighting = {};
        this.postProcessing = {};
        this.ui = null;
        
        // Performance optimization
        this.lodManager = null;
        this.renderTargets = [];
        
        // Event listener references for proper cleanup
        this.resizeListener = null;
        
        console.log('🌊 Enhanced Babylon.js Game Engine initialized');
    }

    /**
     * Initialize the Babylon.js engine and scene
     */
    async init(canvas) {
        try {
            this.canvas = canvas;
            
            // Verify canvas is properly set up
            if (!this.canvas) {
                throw new Error('Canvas element is null or undefined');
            }
            
            // Create Babylon.js engine with basic settings
            this.engine = new BABYLON.Engine(this.canvas, true);
            
            // Create scene
            this.scene = new BABYLON.Scene(this.engine);
            
            // Verify engine and scene creation
            if (!this.engine || !this.scene) {
                throw new Error('Failed to create Babylon.js engine or scene');
            }
            
            console.log('✅ Babylon.js engine and scene created successfully');
            
            // Initialize shader system for 3D
            if (window.gameShaders) {
                window.gameShaders.init3DShaders(this.scene);
            }
            
            // Setup basic environment first
            await this.setupBasicEnvironment();
            await this.setupBasicCamera();
            await this.setupBasicLighting();
            await this.setupBasicMaterials();
            
            // Setup game grid
            await this.setupGameGrid();
            
            // Create enhanced UI
            this.createEnhancedUI();
            
            // Initialize letter queue
            this.generateLetterQueue();
            
            // Add a simple debug cube to verify rendering is working
            this.createDebugCube();
            
            // Start render loop
            this.engine.runRenderLoop(() => {
                this.scene.render();
                this.updateGame();
            });
            
            // Handle resize
            this.resizeListener = () => {
                if (this.engine && typeof this.engine.resize === 'function') {
                    this.engine.resize();
                }
            };
            window.addEventListener('resize', this.resizeListener);
            
            console.log('🎮 Enhanced Babylon.js game initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Babylon.js game:', error);
            throw error;
        }
    }

    /**
     * Setup basic environment
     */
    async setupBasicEnvironment() {
        try {
            console.log('🌍 Setting up basic environment...');
            
            // Create ground
            const ground = BABYLON.MeshBuilder.CreateGround("ground", {
                width: 20,
                height: 20
            }, this.scene);
            
            // Create ground material with shader
            const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
            groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            groundMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            ground.material = groundMaterial;
            
            // Add physics to ground
            if (this.scene.isPhysicsEnabled()) {
                ground.physicsImpostor = new BABYLON.PhysicsImpostor(
                    ground,
                    BABYLON.PhysicsImpostor.BoxImpostor,
                    { mass: 0, restitution: 0.9 },
                    this.scene
                );
            }
            
            // Create shader background plane
            this.createShaderBackground();
            
            console.log('✅ Basic environment setup completed');
        } catch (error) {
            console.error('❌ Error setting up basic environment:', error);
        }
    }

    createShaderBackground() {
        try {
            // Create a large plane for the shader background
            const backgroundPlane = BABYLON.MeshBuilder.CreatePlane("shaderBackground", {
                width: 50,
                height: 50
            }, this.scene);
            
            // Position it behind everything
            backgroundPlane.position.z = -10;
            
            // Create shader material if available
            if (window.gameShaders) {
                const shaderMaterial = window.gameShaders.createBabylonJSMaterial('babylon3D', this.scene);
                if (shaderMaterial) {
                    // Set up uniforms (guard against non-ShaderMaterial returns)
                    if (typeof shaderMaterial.setFloat === 'function') {
                        try { shaderMaterial.setFloat("time", 0); } catch(_) {}
                    }
                    if (typeof shaderMaterial.setVector2 === 'function') {
                        try { shaderMaterial.setVector2("resolution", new BABYLON.Vector2(800, 600)); } catch(_) {}
                    }
                    // Animate the shader if supported
                    if (typeof shaderMaterial.setFloat === 'function') {
                        this.scene.registerBeforeRender(() => {
                            const time = Date.now() * 0.001;
                            try { shaderMaterial.setFloat("time", time); } catch(_) {}
                        });
                    }
                    backgroundPlane.material = shaderMaterial;
                    console.log('✅ Shader background created');
                    return;
                }
            }
            
            // Fallback to standard material
            const fallbackMaterial = new BABYLON.StandardMaterial("backgroundMaterial", this.scene);
            fallbackMaterial.diffuseColor = new BABYLON.Color3(0.05, 0.02, 0.1);
            fallbackMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0.2);
            backgroundPlane.material = fallbackMaterial;
            
            console.log('✅ Fallback background created');
        } catch (error) {
            console.error('❌ Error creating shader background:', error);
        }
    }

    /**
     * Setup basic camera
     */
    async setupBasicCamera() {
        try {
            console.log('📷 Setting up basic camera...');
            
            // Create a simple arc rotate camera with better positioning
            this.camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 4, 15, BABYLON.Vector3.Zero(), this.scene);
            this.camera.attachControl(this.canvas, true);
            this.camera.lowerRadiusLimit = 5;
            this.camera.upperRadiusLimit = 30;
            this.camera.wheelDeltaPercentage = 0.01;
            
            // Set initial camera position
            this.camera.setPosition(new BABYLON.Vector3(10, 10, 10));
            this.camera.setTarget(BABYLON.Vector3.Zero());
            
            console.log('✅ Basic camera setup complete');
        } catch (error) {
            console.error('❌ Error setting up basic camera:', error);
        }
    }

    /**
     * Setup basic lighting
     */
    async setupBasicLighting() {
        try {
            console.log('💡 Setting up basic lighting...');
            
            // Create a simple hemispheric light
            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
            light.intensity = 1.0;
            
            // Add a directional light for better illumination
            const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(0, -1, 0), this.scene);
            directionalLight.intensity = 0.8;
            
            console.log('✅ Basic lighting setup complete');
        } catch (error) {
            console.error('❌ Error setting up basic lighting:', error);
        }
    }

    /**
     * Create a debug cube to verify rendering
     */
    createDebugCube() {
        try {
            console.log('🔍 Creating debug cube...');
            
            // Create a simple red cube to verify rendering
            const debugCube = BABYLON.MeshBuilder.CreateBox("debugCube", { size: 2 }, this.scene);
            debugCube.position = new BABYLON.Vector3(0, 3, 0);
            
            // Create a bright red material
            const debugMaterial = new BABYLON.StandardMaterial("debugMaterial", this.scene);
            debugMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
            debugMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
            debugCube.material = debugMaterial;
            
            console.log('✅ Debug cube created at position (0, 3, 0)');
        } catch (error) {
            console.error('❌ Error creating debug cube:', error);
        }
    }

    /**
     * Setup basic materials
     */
    async setupBasicMaterials() {
        try {
            console.log('🎨 Setting up basic materials...');
            
            // Create basic letter material with better visibility
            this.letterMaterial = new BABYLON.StandardMaterial("letterMaterial", this.scene);
            this.letterMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            this.letterMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            this.letterMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            this.letterMaterial.specularPower = 50;
            
            console.log('✅ Basic materials setup complete');
        } catch (error) {
            console.error('❌ Error setting up basic materials:', error);
        }
    }

    /**
     * Setup physics engine with error handling
     */
    async setupPhysics() {
        try {
            // Enhanced Cannon.js availability check with multiple fallbacks
            let cannonAvailable = false;
            
            // Check multiple possible Cannon.js references
            if (typeof CANNON !== 'undefined') {
                cannonAvailable = true;
                console.log('✅ CANNON found in global scope');
            } else if (typeof window.CANNON !== 'undefined') {
                window.CANNON = window.CANNON;
                cannonAvailable = true;
                console.log('✅ CANNON found in window scope');
            } else if (typeof window.cannon !== 'undefined') {
                window.CANNON = window.cannon;
                cannonAvailable = true;
                console.log('✅ Cannon.js found as window.cannon');
            } else if (window.CANNON_LOADED) {
                // Try to use the local fallback
                if (typeof window.loadLocalCannonFallback === 'function') {
                    window.loadLocalCannonFallback();
                    cannonAvailable = true;
                    console.log('✅ Using local Cannon.js fallback');
                }
            }
            
            if (cannonAvailable && typeof CANNON !== 'undefined') {
                try {
                    // Check if Cannon.js has the required components
                    if (typeof CANNON.NaiveBroadphase === 'function' && typeof CANNON.World === 'function') {
                        // Enable physics with Cannon.js
                        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
                        console.log('✅ Physics enabled with Cannon.js');
                    } else {
                        console.warn('⚠️ Cannon.js missing required components, using basic physics');
                        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0));
                    }
                } catch (cannonError) {
                    console.warn('⚠️ Cannon.js plugin failed, falling back to basic physics:', cannonError);
                    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0));
                }
            } else {
                console.warn('⚠️ Cannon.js not available, using Babylon.js built-in physics');
                // Use Babylon.js built-in physics as fallback
                this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0));
            }
        } catch (error) {
            console.warn('⚠️ Physics initialization failed, continuing without physics:', error);
            // Game can still run without physics, just without realistic falling
        }
    }

    /**
     * Setup the 3D environment with bright, colorful concept art style
     */
    async setupEnvironment() {
        try {
            console.log('🎨 Setting up immersive 3D environment with river, waterfall, trees, and rocks...');
            
            // Create a beautiful skybox
            const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
            const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.8, 1.0);
            skyboxMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.4, 0.6);
            skybox.material = skyboxMaterial;
            
            // Create terrain with elevation
            await this.createTerrain();
            
            // Create river system
            await this.createRiverSystem();
            
            // Create waterfall
            await this.createWaterfall();
            
            // Create nature elements (trees, rocks)
            await this.createNatureElements();
            
            // Add atmospheric fog for depth
            this.scene.fogColor = new BABYLON.Color3(0.7, 0.8, 0.9);
            this.scene.fogDensity = 0.001;
            
            // Create atmospheric particles
            await this.createBrightAtmosphericParticles();
            
            // Create water particle effects
            this.createWaterParticles();
            
            console.log('✅ Immersive 3D environment setup complete');
        } catch (error) {
            console.error('❌ Error setting up environment:', error);
        }
    }

    /**
     * Create terrain with elevation and natural features
     */
    async createTerrain() {
        try {
            // Create a larger ground with elevation
            const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this.scene);
            
            // Create terrain material with grass texture
            const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
            groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.3); // Green grass
            groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.2, 0.1);
            groundMaterial.specularPower = 50;
            ground.material = groundMaterial;
            
            // Add some elevation variations
            const terrain = BABYLON.MeshBuilder.CreateGround("terrain", { width: 80, height: 80, subdivisions: 20 }, this.scene);
            terrain.position.y = -0.5;
            
            // Create elevation material
            const terrainMaterial = new BABYLON.StandardMaterial("terrainMaterial", this.scene);
            terrainMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.7, 0.4);
            terrain.material = terrainMaterial;
            
        } catch (error) {
            console.error('❌ Error creating terrain:', error);
        }
    }

    /**
     * Create a majestic flowing river system where letters swim
     */
    async createRiverSystem() {
        try {
            // Create a much larger river bed for letters to swim in
            const riverBed = BABYLON.MeshBuilder.CreateGround("riverBed", { width: 20, height: 80 }, this.scene);
            riverBed.position.y = -0.3;
            riverBed.position.z = -30; // Position river further back
            riverBed.rotation.y = Math.PI / 6; // Gentle angle for natural flow
            
            // Create enhanced river water material with flowing effect
            let riverMaterial;
            if (window.gameShaders && window.gameShaders.getWaterMaterial3D()) {
                riverMaterial = window.gameShaders.getWaterMaterial3D();
                // Set shader uniforms if supported
                if (riverMaterial && typeof riverMaterial.setFloat === 'function') {
                    try { riverMaterial.setFloat("time", 0); } catch(_) {}
                }
                if (riverMaterial && typeof riverMaterial.setVector2 === 'function') {
                    try { riverMaterial.setVector2("resolution", new BABYLON.Vector2(800, 600)); } catch(_) {}
                }
            } else {
                // Fallback to standard material
                riverMaterial = new BABYLON.StandardMaterial("riverMaterial", this.scene);
                riverMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.7); // Deeper blue
                riverMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.15, 0.3);
                riverMaterial.alpha = 0.85;
                riverMaterial.specularColor = new BABYLON.Color3(0.9, 0.95, 1.0);
                riverMaterial.specularPower = 150;
                riverMaterial.reflectionTexture = new BABYLON.CubeTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", this.scene);
                riverMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
                riverMaterial.reflectionFresnelParameters.leftWeight = 0.1;
                riverMaterial.reflectionFresnelParameters.rightWeight = 0.8;
            }
            riverBed.material = riverMaterial;
            
            // Create wider river banks
            const leftBank = BABYLON.MeshBuilder.CreateGround("leftBank", { width: 4, height: 80 }, this.scene);
            leftBank.position.y = -0.2;
            leftBank.position.x = -8;
            leftBank.position.z = -30;
            leftBank.rotation.y = Math.PI / 6;
            
            const rightBank = BABYLON.MeshBuilder.CreateGround("rightBank", { width: 4, height: 80 }, this.scene);
            rightBank.position.y = -0.2;
            rightBank.position.x = 8;
            rightBank.position.z = -30;
            rightBank.rotation.y = Math.PI / 6;
            
            const bankMaterial = new BABYLON.StandardMaterial("bankMaterial", this.scene);
            bankMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.6, 0.4); // Warmer sandy color
            bankMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            bankMaterial.specularPower = 30;
            leftBank.material = bankMaterial;
            rightBank.material = bankMaterial;
            
            // Create river flow particles to show water movement
            const riverFlowParticles = new BABYLON.ParticleSystem("riverFlowParticles", 500, this.scene);
            riverFlowParticles.particleTexture = new BABYLON.Texture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
            riverFlowParticles.emitter = new BABYLON.Vector3(0, 0.5, -30);
            riverFlowParticles.minEmitBox = new BABYLON.Vector3(-8, 0, -40);
            riverFlowParticles.maxEmitBox = new BABYLON.Vector3(8, 0, -20);
            riverFlowParticles.color1 = new BABYLON.Color4(0.3, 0.5, 0.8, 0.6);
            riverFlowParticles.color2 = new BABYLON.Color4(0.1, 0.3, 0.6, 0.4);
            riverFlowParticles.colorDead = new BABYLON.Color4(0.1, 0.2, 0.4, 0.0);
            riverFlowParticles.minSize = 0.05;
            riverFlowParticles.maxSize = 0.15;
            riverFlowParticles.minLifeTime = 2.0;
            riverFlowParticles.maxLifeTime = 4.0;
            riverFlowParticles.emitRate = 100;
            riverFlowParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            riverFlowParticles.gravity = new BABYLON.Vector3(0, 0, 0);
            riverFlowParticles.direction1 = new BABYLON.Vector3(-0.5, 0, 1);
            riverFlowParticles.direction2 = new BABYLON.Vector3(0.5, 0, 1);
            riverFlowParticles.minEmitPower = 0.5;
            riverFlowParticles.maxEmitPower = 1.5;
            riverFlowParticles.updateSpeed = 0.01;
            riverFlowParticles.start();
            
            console.log('🌊 Majestic river system created for letter swimming');
            
        } catch (error) {
            console.error('❌ Error creating river system:', error);
        }
    }

    /**
     * Create a majestic waterfall
     */
    async createWaterfall() {
        try {
            // Create waterfall structure
            const waterfall = BABYLON.MeshBuilder.CreateBox("waterfall", { width: 6, height: 15, depth: 1 }, this.scene);
            waterfall.position = new BABYLON.Vector3(0, 7.5, -20);
            
            // Create waterfall material
            const waterfallMaterial = new BABYLON.StandardMaterial("waterfallMaterial", this.scene);
            waterfallMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1.0);
            waterfallMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
            waterfallMaterial.alpha = 0.9;
            waterfallMaterial.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            waterfallMaterial.specularPower = 200;
            waterfall.material = waterfallMaterial;
            
            // Create waterfall particles
            const waterfallParticles = new BABYLON.ParticleSystem("waterfallParticles", 2000, this.scene);
            waterfallParticles.particleTexture = new BABYLON.Texture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
            waterfallParticles.emitter = new BABYLON.Vector3(0, 15, -20);
            waterfallParticles.minEmitBox = new BABYLON.Vector3(-3, 0, 0);
            waterfallParticles.maxEmitBox = new BABYLON.Vector3(3, 0, 0);
            waterfallParticles.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
            waterfallParticles.color2 = new BABYLON.Color4(0.2, 0.4, 0.8, 1.0);
            waterfallParticles.colorDead = new BABYLON.Color4(0.1, 0.2, 0.4, 0.0);
            waterfallParticles.minSize = 0.1;
            waterfallParticles.maxSize = 0.3;
            waterfallParticles.minLifeTime = 0.3;
            waterfallParticles.maxLifeTime = 0.8;
            waterfallParticles.emitRate = 1000;
            waterfallParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            waterfallParticles.gravity = new BABYLON.Vector3(0, -9.81, 0);
            waterfallParticles.direction1 = new BABYLON.Vector3(-0.1, -1, 0);
            waterfallParticles.direction2 = new BABYLON.Vector3(0.1, -1, 0);
            waterfallParticles.minAngularSpeed = 0;
            waterfallParticles.maxAngularSpeed = Math.PI;
            waterfallParticles.minEmitPower = 1;
            waterfallParticles.maxEmitPower = 3;
            waterfallParticles.updateSpeed = 0.005;
            waterfallParticles.start();
            
        } catch (error) {
            console.error('❌ Error creating waterfall:', error);
        }
    }

    /**
     * Setup bright, colorful lighting system
     */
    async setupLighting() {
        try {
            console.log('💡 Setting up bright, colorful lighting...');
            
            // Bright hemispheric light for overall illumination
            const hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), this.scene);
            hemisphericLight.intensity = 0.8;
            hemisphericLight.diffuse = new BABYLON.Color3(0.9, 0.95, 1.0);
            hemisphericLight.specular = new BABYLON.Color3(0.8, 0.9, 1.0);
            hemisphericLight.groundColor = new BABYLON.Color3(0.7, 0.8, 0.9);
            
            // Bright directional light for main illumination
            const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(0, -1, 0), this.scene);
            directionalLight.intensity = 1.2;
            directionalLight.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
            directionalLight.specular = new BABYLON.Color3(0.9, 0.95, 1.0);
            
            // Setup bright shadows
            const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
            shadowGenerator.bias = 0.00001;
            shadowGenerator.setDarkness(0.3);
            shadowGenerator.blurKernel = 32;
            this.shadowGenerator = shadowGenerator;
            
            // Bright accent lights for colorful effects
            const accentLight1 = new BABYLON.PointLight("accentLight1", new BABYLON.Vector3(-10, 8, -5), this.scene);
            accentLight1.intensity = 0.8;
            accentLight1.diffuse = new BABYLON.Color3(1.0, 0.8, 0.6);
            accentLight1.range = 40;
            
            const accentLight2 = new BABYLON.PointLight("accentLight2", new BABYLON.Vector3(10, 6, 8), this.scene);
            accentLight2.intensity = 0.6;
            accentLight2.diffuse = new BABYLON.Color3(0.6, 0.8, 1.0);
            accentLight2.range = 35;
            
            // Bright rim light for letter highlighting
            const rimLight = new BABYLON.DirectionalLight("rimLight", new BABYLON.Vector3(1, 0, 1), this.scene);
            rimLight.intensity = 0.4;
            rimLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.8);
            rimLight.specular = new BABYLON.Color3(0.8, 0.9, 1.0);
            
            // Bright spotlight for focused illumination
            const spotlight = new BABYLON.SpotLight("spotlight", new BABYLON.Vector3(0, 15, 0), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 2, this.scene);
            spotlight.intensity = 0.8;
            spotlight.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
            spotlight.range = 50;
            
            console.log('✅ Bright, colorful lighting setup complete');
        } catch (error) {
            console.error('❌ Error setting up bright lighting:', error);
        }
    }

    /**
     * Setup bright, colorful materials
     */
    async setupMaterials() {
        try {
            console.log('🎨 Setting up bright, colorful materials...');
            
            // Create letter material with glow effect - using StandardMaterial instead of PBR
            this.letterMaterial = new BABYLON.StandardMaterial("letterMaterial", this.scene);
            this.letterMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            this.letterMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.9, 1.0);
            this.letterMaterial.specularColor = new BABYLON.Color3(0.8, 0.9, 1.0);
            this.letterMaterial.specularPower = 100;
            
            // Create grid material
            this.gridMaterial = new BABYLON.StandardMaterial("gridMaterial", this.scene);
            this.gridMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.8, 0.9);
            this.gridMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.9, 1.0);
            this.gridMaterial.alpha = 0.6;
            
            // Create water material
            this.waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
            this.waterMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
            this.waterMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
            this.waterMaterial.alpha = 0.7;
            
            // Create rock material
            this.rockMaterial = new BABYLON.StandardMaterial("rockMaterial", this.scene);
            this.rockMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            this.rockMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            this.rockMaterial.specularPower = 50;
            
            // Create structure material
            this.structureMaterial = new BABYLON.StandardMaterial("structureMaterial", this.scene);
            this.structureMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
            this.structureMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            console.log('✅ Bright, colorful materials setup complete');
        } catch (error) {
            console.error('❌ Error setting up bright materials:', error);
        }
    }

    /**
     * Setup bright, colorful post-processing effects
     */
    async setupPostProcessing() {
        try {
            console.log('✨ Setting up bright, colorful post-processing...');
            
            // Create simple glow layer instead of complex bloom
            const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
            glowLayer.intensity = 0.8;
            glowLayer.blurKernelSize = 32;
            
            // Add simple vignette effect
            const vignette = new BABYLON.VignettePostProcess("vignette", 1.0, this.camera);
            vignette.power = 0.3;
            
            console.log('✅ Bright, colorful post-processing setup complete');
        } catch (error) {
            console.error('❌ Error setting up bright post-processing:', error);
        }
    }

    /**
     * Create bright, colorful atmospheric particles
     */
    async createBrightAtmosphericParticles() {
        try {
            console.log('✨ Creating bright, colorful atmospheric particles...');
            
            // Create simple particle system without external textures
            const atmosphericParticles = new BABYLON.ParticleSystem("atmospheric", 50, this.scene);
            
            // Use simple particle properties without external textures
            atmosphericParticles.minSize = 0.1;
            atmosphericParticles.maxSize = 0.2;
            atmosphericParticles.minLifeTime = 2.0;
            atmosphericParticles.maxLifeTime = 4.0;
            
            // Bright, colorful colors
            atmosphericParticles.color1 = new BABYLON.Color4(1.0, 0.9, 0.8, 1.0);
            atmosphericParticles.color2 = new BABYLON.Color4(0.8, 0.9, 1.0, 1.0);
            atmosphericParticles.colorDead = new BABYLON.Color4(0.9, 0.95, 1.0, 0.0);
            
            // Emission area
            atmosphericParticles.createSphericEmitter(10);
            atmosphericParticles.minEmitPower = 0.1;
            atmosphericParticles.maxEmitPower = 0.3;
            
            // Start the particle system
            atmosphericParticles.start();
            
            console.log('✅ Bright, colorful atmospheric particles created');
        } catch (error) {
            console.error('❌ Error creating bright atmospheric particles:', error);
        }
    }

    /**
     * Setup advanced camera system with smooth controls
     */
    async setupCamera() {
        try {
            // Create arc rotate camera for 3D exploration
            this.camera = new BABYLON.ArcRotateCamera("camera", 
                Math.PI / 4, Math.PI / 3, 25, 
                new BABYLON.Vector3(0, 2, 0), this.scene);
            
            // Enhanced camera settings
            this.camera.lowerBetaLimit = 0.1;
            this.camera.upperBetaLimit = Math.PI / 2.2;
            this.camera.lowerRadiusLimit = 10;
            this.camera.upperRadiusLimit = 50;
            this.camera.wheelPrecision = 50;
            this.camera.pinchPrecision = 50;
            
            // Smooth camera controls
            this.camera.panningSensibility = 1000;
            this.camera.angularSensibilityX = 1000;
            this.camera.angularSensibilityY = 1000;
            
            // Attach controls to canvas with error handling
            if (this.camera && this.canvas && typeof this.camera.attachControls === 'function') {
                try {
                    this.camera.attachControls(this.canvas, true);
                    console.log('✅ Camera controls attached successfully');
                } catch (attachError) {
                    console.warn('⚠️ Camera controls attachment failed:', attachError);
                }
            } else {
                console.warn('⚠️ Camera controls not available - using fallback');
                // Create a basic camera as fallback
                if (!this.camera) {
                    this.camera = new BABYLON.FreeCamera("fallbackCamera", 
                        new BABYLON.Vector3(0, 5, -10), this.scene);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                }
            }
            
            // Camera animations
            if (this.camera && typeof this.camera.setTarget === 'function') {
                this.camera.setTarget(BABYLON.Vector3.Zero());
            }
            
            console.log('📷 Camera setup completed successfully');
        } catch (error) {
            console.error('❌ Camera setup failed:', error);
            // Create a basic camera as fallback
            this.camera = new BABYLON.FreeCamera("fallbackCamera", 
                new BABYLON.Vector3(0, 5, -10), this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());
        }
    }

    /**
     * Setup advanced particle systems
     */
    async setupParticles() {
        try {
            // Waterfall particles
            const waterfallParticles = new BABYLON.ParticleSystem("waterfallParticles", 300, this.scene);
            try {
                waterfallParticles.particleTexture = new BABYLON.Texture("textures/water_drop.png", this.scene);
            } catch (textureError) {
                console.warn('⚠️ Water drop texture not found, using default particle');
            }
            waterfallParticles.emitter = new BABYLON.Vector3(0, 10, -10);
            waterfallParticles.minEmitBox = new BABYLON.Vector3(-1, 0, 0);
            waterfallParticles.maxEmitBox = new BABYLON.Vector3(1, 0, 0);
            waterfallParticles.color1 = new BABYLON.Color4(1, 1, 1, 1.0);
            waterfallParticles.color2 = new BABYLON.Color4(0.8, 0.9, 1, 1.0);
            waterfallParticles.colorDead = new BABYLON.Color4(0, 0, 1, 0.0);
            waterfallParticles.minSize = 0.1;
            waterfallParticles.maxSize = 0.3;
            waterfallParticles.minLifeTime = 1.0;
            waterfallParticles.maxLifeTime = 2.0;
            waterfallParticles.emitRate = 150;
            waterfallParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            waterfallParticles.gravity = new BABYLON.Vector3(0, -9.81, 0);
            waterfallParticles.direction1 = new BABYLON.Vector3(-1, -5, -1);
            waterfallParticles.direction2 = new BABYLON.Vector3(1, -5, 1);
            waterfallParticles.minAngularSpeed = 0;
            waterfallParticles.maxAngularSpeed = Math.PI;
            waterfallParticles.minEmitPower = 5;
            waterfallParticles.maxEmitPower = 8;
            waterfallParticles.updateSpeed = 0.02;
            waterfallParticles.start();

            // River flow particles
            const riverParticles = new BABYLON.ParticleSystem("riverParticles", 120, this.scene);
            try {
                riverParticles.particleTexture = new BABYLON.Texture("textures/water_particle.png", this.scene);
            } catch (textureError) {
                console.warn('⚠️ Water particle texture not found, using default particle');
            }
            riverParticles.emitter = new BABYLON.Vector3(-5, 0.5, 0);
            riverParticles.minEmitBox = new BABYLON.Vector3(0, 0, -2);
            riverParticles.maxEmitBox = new BABYLON.Vector3(0, 0, 2);
            riverParticles.color1 = new BABYLON.Color4(0.5, 0.8, 1, 0.8);
            riverParticles.color2 = new BABYLON.Color4(0.3, 0.6, 0.9, 0.6);
            riverParticles.colorDead = new BABYLON.Color4(0, 0, 0.5, 0.0);
            riverParticles.minSize = 0.05;
            riverParticles.maxSize = 0.15;
            riverParticles.minLifeTime = 3.0;
            riverParticles.maxLifeTime = 5.0;
            riverParticles.emitRate = 60;
            riverParticles.gravity = new BABYLON.Vector3(0, -1, 0);
            riverParticles.direction1 = new BABYLON.Vector3(3, 0, -0.5);
            riverParticles.direction2 = new BABYLON.Vector3(5, 0, 0.5);
            riverParticles.start();

            // Atmospheric particles (floating leaves)
            const atmosphericParticles = new BABYLON.ParticleSystem("atmosphericParticles", 50, this.scene);
            try {
                atmosphericParticles.particleTexture = new BABYLON.Texture("textures/leaf.png", this.scene);
            } catch (textureError) {
                console.warn('⚠️ Leaf texture not found, using default particle');
            }
            atmosphericParticles.emitter = new BABYLON.Vector3(0, 15, 0);
            atmosphericParticles.minEmitBox = new BABYLON.Vector3(-20, 0, -20);
            atmosphericParticles.maxEmitBox = new BABYLON.Vector3(20, 0, 20);
            atmosphericParticles.color1 = new BABYLON.Color4(0.3, 0.8, 0.3, 1.0);
            atmosphericParticles.color2 = new BABYLON.Color4(0.8, 0.6, 0.2, 1.0);
            atmosphericParticles.colorDead = new BABYLON.Color4(0.5, 0.3, 0.1, 0.0);
            atmosphericParticles.minSize = 0.2;
            atmosphericParticles.maxSize = 0.4;
            atmosphericParticles.minLifeTime = 10.0;
            atmosphericParticles.maxLifeTime = 15.0;
            atmosphericParticles.emitRate = 5;
            atmosphericParticles.gravity = new BABYLON.Vector3(0, -0.5, 0);
            atmosphericParticles.direction1 = new BABYLON.Vector3(-1, -1, -1);
            atmosphericParticles.direction2 = new BABYLON.Vector3(1, -1, 1);
            atmosphericParticles.minAngularSpeed = -Math.PI / 4;
            atmosphericParticles.maxAngularSpeed = Math.PI / 4;
            atmosphericParticles.start();

            // Store particle systems
            this.particleSystems.push(waterfallParticles, riverParticles, atmosphericParticles);
            console.log('✅ Particle systems initialized');
            
        } catch (error) {
            console.warn('⚠️ Particle systems initialization failed:', error);
            // Continue without particles
        }
    }

    /**
     * Setup advanced fluid renderer for realistic water effects
     */
    async setupFluidRenderer() {
        try {
            // Check if FluidRenderer is available
            if (typeof BABYLON.FluidRenderer === 'undefined') {
                console.warn('⚠️ Fluid renderer not available, using fallback water effects');
                await this.setupFallbackWaterEffects();
                return;
            }
            
            // Create fluid renderer
            this.fluidRenderer = new BABYLON.FluidRenderer(this.scene);
            
            // Enhanced fluid settings
            this.fluidRenderer.enableDiffuseRendering = true;
            this.fluidRenderer.enableThicknessRendering = true;
            this.fluidRenderer.enableReflectionRendering = true;
            this.fluidRenderer.enableRefractionRendering = true;
            this.fluidRenderer.enableMotionBlur = true;
            
            // Fluid material properties
            this.fluidRenderer.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
            this.fluidRenderer.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            this.fluidRenderer.reflectionStrength = 0.8;
            this.fluidRenderer.refractionStrength = 0.6;
            this.fluidRenderer.density = 1.2;
            this.fluidRenderer.viscosity = 0.8;
            
            console.log('✅ Fluid renderer initialized');
            
        } catch (error) {
            console.warn('⚠️ Fluid renderer not available, using fallback water effects');
            await this.setupFallbackWaterEffects();
        }
    }

    /**
     * Setup fallback water effects if fluid renderer is not available
     */
    async setupFallbackWaterEffects() {
        // Create animated water plane
        const waterPlane = BABYLON.MeshBuilder.CreateGround("water", {width: 20, height: 20}, this.scene);
        waterPlane.position.y = 0.1;
        waterPlane.material = this.materialLibrary.water;
        
        // Animate water with waves
        this.scene.registerBeforeRender(() => {
            if (waterPlane.material && waterPlane.material.baseTexture) {
                waterPlane.material.baseTexture.uOffset += 0.002;
                waterPlane.material.baseTexture.vOffset += 0.001;
            }
        });
    }

    /**
     * Create waterfall system with enhanced visual effects
     */
    async createWaterfallSystem() {
        // Waterfall rocks
        const waterfallRock = BABYLON.MeshBuilder.CreateBox("waterfallRock", {width: 4, height: 8, depth: 2}, this.scene);
        waterfallRock.position = new BABYLON.Vector3(0, 4, -12);
        
        const rockMaterial = new BABYLON.PBRMaterial("rockMaterial", this.scene);
        rockMaterial.baseColor = new BABYLON.Color3(0.4, 0.4, 0.5);
        rockMaterial.metallicFactor = 0.1;
        rockMaterial.roughnessFactor = 0.9;
        waterfallRock.material = rockMaterial;
        
        // Add rock to shadow casters safely
        if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
            this.lighting.shadowGenerator.getShadowMap().renderList.push(waterfallRock);
        }

        // Water pool at bottom
        const waterPool = BABYLON.MeshBuilder.CreateCylinder("waterPool", {height: 0.2, diameter: 6}, this.scene);
        waterPool.position = new BABYLON.Vector3(0, 0.1, -8);
        try {
            if (this.materialLibrary && this.materialLibrary.water) {
                waterPool.material = this.materialLibrary.water;
            } else {
                // Use a basic water material as fallback
                const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
                waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.8);
                waterMaterial.alpha = 0.8;
                waterPool.material = waterMaterial;
            }
        } catch (error) {
            console.warn('⚠️ Could not apply water material:', error);
            // Use a basic water material as fallback
            const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
            waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.8);
            waterMaterial.alpha = 0.8;
            waterPool.material = waterMaterial;
        }
    }

    /**
     * Create nature elements for immersive environment
     */
    async createNatureElements() {
        try {
            console.log('🌳 Creating nature elements...');
            
            // Create trees in a more natural pattern
            const treePositions = [
                { x: -15, z: -15 }, { x: 15, z: -15 }, { x: -15, z: 15 }, { x: 15, z: 15 },
                { x: -25, z: -5 }, { x: 25, z: -5 }, { x: -25, z: 5 }, { x: 25, z: 5 },
                { x: -5, z: -25 }, { x: 5, z: -25 }, { x: -5, z: 25 }, { x: 5, z: 25 },
                { x: -20, z: 0 }, { x: 20, z: 0 }, { x: 0, z: -20 }, { x: 0, z: 20 }
            ];
            
            for (const pos of treePositions) {
                await this.createTree(pos.x, 0, pos.z);
            }

            // Create rocks in natural clusters
            const rockClusters = [
                { center: { x: -10, z: -10 }, count: 3 },
                { center: { x: 10, z: -10 }, count: 2 },
                { center: { x: -10, z: 10 }, count: 4 },
                { center: { x: 10, z: 10 }, count: 3 },
                { center: { x: 0, z: -30 }, count: 2 },
                { center: { x: 0, z: 30 }, count: 2 },
                { center: { x: -30, z: 0 }, count: 3 },
                { center: { x: 30, z: 0 }, count: 2 }
            ];
            
            for (const cluster of rockClusters) {
                for (let i = 0; i < cluster.count; i++) {
                    const x = cluster.center.x + (Math.random() - 0.5) * 8;
                    const z = cluster.center.z + (Math.random() - 0.5) * 8;
                    const scale = 0.3 + Math.random() * 1.2;
                    
                    await this.createRock(x, 0, z, scale);
                }
            }
            
            console.log('✅ Nature elements created');
        } catch (error) {
            console.error('❌ Error creating nature elements:', error);
        }
    }

    /**
     * Create a simple tree
     */
    async createTree(x, y, z) {
        try {
            // Create tree trunk with more realistic proportions
            const trunk = BABYLON.MeshBuilder.CreateCylinder("treeTrunk", {
                height: 4 + Math.random() * 2,
                diameter: 0.4 + Math.random() * 0.2
            }, this.scene);
            trunk.position = new BABYLON.Vector3(x, y + 2, z);
            
            // Create trunk material with bark texture
            const trunkMaterial = new BABYLON.StandardMaterial("trunkMaterial", this.scene);
            trunkMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
            trunkMaterial.specularColor = new BABYLON.Color3(0.1, 0.05, 0.05);
            trunkMaterial.specularPower = 30;
            trunk.material = trunkMaterial;
            
            // Create tree foliage with multiple layers
            const foliageLayers = 3;
            for (let i = 0; i < foliageLayers; i++) {
                const leaves = BABYLON.MeshBuilder.CreateSphere("treeLeaves", {
                    diameter: 3 - i * 0.5
                }, this.scene);
                leaves.position = new BABYLON.Vector3(
                    x + (Math.random() - 0.5) * 0.5,
                    y + 4 + i * 1.5,
                    z + (Math.random() - 0.5) * 0.5
                );
                
                const leavesMaterial = new BABYLON.StandardMaterial("leavesMaterial", this.scene);
                leavesMaterial.diffuseColor = new BABYLON.Color3(
                    0.1 + Math.random() * 0.2,
                    0.5 + Math.random() * 0.3,
                    0.1 + Math.random() * 0.2
                );
                leavesMaterial.specularColor = new BABYLON.Color3(0.1, 0.2, 0.1);
                leavesMaterial.specularPower = 50;
                leaves.material = leavesMaterial;
                
                // Add to shadow casters safely
                if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
                    this.lighting.shadowGenerator.getShadowMap().renderList.push(leaves);
                }
            }
            
            // Add to shadow casters safely
            if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
                this.lighting.shadowGenerator.getShadowMap().renderList.push(trunk);
            }
            
        } catch (error) {
            console.error('❌ Error creating tree:', error);
        }
    }

    /**
     * Create a rock
     */
    async createRock(x, y, z, scale) {
        try {
            // Create rock with more irregular shape
            const rock = BABYLON.MeshBuilder.CreateSphere("rock", {
                diameter: scale,
                segments: 8 + Math.floor(Math.random() * 4)
            }, this.scene);
            rock.position = new BABYLON.Vector3(x, y + scale/2, z);
            
            // Add random scaling for irregular shape
            rock.scaling.x = 0.8 + Math.random() * 0.4;
            rock.scaling.y = 0.5 + Math.random() * 0.3; // Flatten the rock
            rock.scaling.z = 0.8 + Math.random() * 0.4;
            
            // Add random rotation
            rock.rotation.x = Math.random() * Math.PI;
            rock.rotation.y = Math.random() * Math.PI;
            rock.rotation.z = Math.random() * Math.PI;
            
            // Create rock material with natural colors
            const rockMaterial = new BABYLON.StandardMaterial("rockMaterial", this.scene);
            const rockColor = Math.random();
            if (rockColor < 0.3) {
                rockMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4); // Gray
            } else if (rockColor < 0.6) {
                rockMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.4, 0.3); // Brown
            } else {
                rockMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4); // Blue-gray
            }
            
            rockMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            rockMaterial.specularPower = 20;
            rock.material = rockMaterial;
            
            // Add physics safely
            try {
                if (this.scene.getPhysicsEngine()) {
                    rock.physicsImpostor = new BABYLON.PhysicsImpostor(rock, BABYLON.PhysicsImpostor.SphereImpostor, 
                        { mass: 0, restitution: 0.3 }, this.scene);
                }
            } catch (error) {
                console.warn('⚠️ Could not add physics to rock:', error);
            }
            
            // Add to shadow casters safely
            if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
                this.lighting.shadowGenerator.getShadowMap().renderList.push(rock);
            }
            
        } catch (error) {
            console.error('❌ Error creating rock:', error);
        }
    }

    /**
     * Setup the game grid for letter placement
     */
    async setupGameGrid() {
        try {
            console.log('📐 Setting up game grid...');
            
            // Initialize grid array
            this.gridLetters = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
            
            // Create visual grid
            this.createVisualGrid();
            
            // Setup letter pool
            this.setupLetterPool();
            
            console.log('✅ Game grid setup complete');
        } catch (error) {
            console.error('❌ Error setting up game grid:', error);
        }
    }

    /**
     * Create visual grid representation
     */
    createVisualGrid() {
        try {
            console.log('📐 Creating visual grid...');
            
            // Create a simple grid material
            const gridMaterial = new BABYLON.StandardMaterial("gridMaterial", this.scene);
            gridMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            gridMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            // Grid container
            const gridContainer = new BABYLON.TransformNode("gridContainer", this.scene);
            gridContainer.position = new BABYLON.Vector3(0, 0, 0);
            
            // Create grid lines
            for (let i = 0; i <= this.gridSize; i++) {
                // Horizontal lines
                const hLine = BABYLON.MeshBuilder.CreateBox("hLine" + i, {width: this.gridSize, height: 0.02, depth: 0.02}, this.scene);
                hLine.position = new BABYLON.Vector3(0, 0, i - this.gridSize/2);
                hLine.parent = gridContainer;
                hLine.material = gridMaterial;
                
                // Vertical lines
                const vLine = BABYLON.MeshBuilder.CreateBox("vLine" + i, {width: 0.02, height: 0.02, depth: this.gridSize}, this.scene);
                vLine.position = new BABYLON.Vector3(i - this.gridSize/2, 0, 0);
                vLine.parent = gridContainer;
                vLine.material = gridMaterial;
            }
            
            this.gridContainer = gridContainer;
            console.log('✅ Visual grid created');
        } catch (error) {
            console.error('❌ Error creating visual grid:', error);
        }
    }

    /**
     * Setup letter pool and generation
     */
    setupLetterPool() {
        // Common French letters with appropriate frequency
        this.letterPool = 'AEIOULNRSTMCDPBFGHVJQXYKZW';
        this.letterFrequency = {
            'A': 15, 'E': 17, 'I': 8, 'O': 5, 'U': 6,
            'L': 5, 'N': 7, 'R': 6, 'S': 7, 'T': 7,
            'M': 3, 'C': 3, 'D': 4, 'P': 3, 'B': 1,
            'F': 1, 'G': 1, 'H': 1, 'V': 2, 'J': 0.5,
            'Q': 1, 'X': 0.5, 'Y': 0.5, 'K': 0.2, 'Z': 0.2, 'W': 0.2
        };
        
        // Generate initial letter queue
        this.generateLetterQueue();
    }

    /**
     * Generate letter queue based on frequency
     */
    generateLetterQueue() {
        this.letterQueue = [];
        
        // Generate 50 letters based on frequency
        for (let i = 0; i < 50; i++) {
            const letter = this.getRandomLetter();
            this.letterQueue.push(letter);
        }
        
        console.log('📝 Letter queue generated:', this.letterQueue.slice(0, 10).join(''));
    }

    setDifficulty(level) {
        const allowed = ['easy','normal','hard','extreme'];
        if (!allowed.includes(level)) return;
        this.difficulty = level;
        const m = this.difficultyMultipliers[level] || 1.0;
        this.letterDropMs = Math.max(800, Math.floor(3000 / m));
        this.letterFallSpeed = 2 * m;
        if (this.gameRunning) {
            try { this.stopLetterFalling(); } catch(_) {}
            try { this.startLetterFalling(); } catch(_) {}
        }
        console.log(`🎚️ Difficulty set to ${level} (x${m})`);
    }

    /**
     * Get random letter based on frequency
     */
    getRandomLetter() {
        const letters = Object.keys(this.letterFrequency);
        const weights = Object.values(this.letterFrequency);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < letters.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return letters[i];
            }
        }
        
        return 'A'; // Fallback
    }

    /**
     * Create a 3D letter mesh
     */
    createLetterMesh(letter, position) {
        try {
            let letterMesh;
            
            // Create letter-specific geometry based on the letter
            switch(letter.toUpperCase()) {
                case 'A':
                    letterMesh = this.createLetterA();
                    break;
                case 'B':
                    letterMesh = this.createLetterB();
                    break;
                case 'C':
                    letterMesh = this.createLetterC();
                    break;
                case 'D':
                    letterMesh = this.createLetterD();
                    break;
                case 'E':
                    letterMesh = this.createLetterE();
                    break;
                case 'F':
                    letterMesh = this.createLetterF();
                    break;
                case 'G':
                    letterMesh = this.createLetterG();
                    break;
                case 'H':
                    letterMesh = this.createLetterH();
                    break;
                case 'I':
                    letterMesh = this.createLetterI();
                    break;
                case 'J':
                    letterMesh = this.createLetterJ();
                    break;
                case 'K':
                    letterMesh = this.createLetterK();
                    break;
                case 'L':
                    letterMesh = this.createLetterL();
                    break;
                case 'M':
                    letterMesh = this.createLetterM();
                    break;
                case 'N':
                    letterMesh = this.createLetterN();
                    break;
                case 'O':
                    letterMesh = this.createLetterO();
                    break;
                case 'P':
                    letterMesh = this.createLetterP();
                    break;
                case 'Q':
                    letterMesh = this.createLetterQ();
                    break;
                case 'R':
                    letterMesh = this.createLetterR();
                    break;
                case 'S':
                    letterMesh = this.createLetterS();
                    break;
                case 'T':
                    letterMesh = this.createLetterT();
                    break;
                case 'U':
                    letterMesh = this.createLetterU();
                    break;
                case 'V':
                    letterMesh = this.createLetterV();
                    break;
                case 'W':
                    letterMesh = this.createLetterW();
                    break;
                case 'X':
                    letterMesh = this.createLetterX();
                    break;
                case 'Y':
                    letterMesh = this.createLetterY();
                    break;
                case 'Z':
                    letterMesh = this.createLetterZ();
                    break;
                default:
                    // Fallback to a simple box for unknown letters
                    letterMesh = BABYLON.MeshBuilder.CreateBox("letter_" + letter, { 
                        width: 0.8, 
                        height: 0.8, 
                        depth: 0.2 
                    }, this.scene);
            }
            
            // Position the letter
            letterMesh.position = new BABYLON.Vector3(position.x, position.y, position.z);
            
            // Create enhanced letter material with unique colors and effects
            letterMesh.material = this.createEnhancedLetterMaterial(letter);
            
            // Add physics if available and properly initialized
            if (this.scene.isPhysicsEnabled() && this.scene.getPhysicsEngine()) {
                try {
                    // Create physics impostor with proper error handling
                    const physicsImpostor = new BABYLON.PhysicsImpostor(
                        letterMesh, 
                        BABYLON.PhysicsImpostor.BoxImpostor, 
                        { mass: 1, restitution: 0.3 }, 
                        this.scene
                    );
                    
                    // Only assign if creation was successful
                    if (physicsImpostor) {
                        letterMesh.physicsImpostor = physicsImpostor;
                    }
                } catch (physicsError) {
                    console.warn('⚠️ Could not add physics to letter:', physicsError);
                    // Continue without physics
                }
            } else {
                console.log('ℹ️ Physics not available for letter mesh');
            }
            
            return letterMesh;
        } catch (error) {
            console.error('❌ Error creating letter mesh:', error);
            return null;
        }
    }

    // Letter shape creation methods
    createLetterA() {
        const letterGroup = new BABYLON.Mesh("letterA", this.scene);
        
        // Create the main triangle shape
        const triangle = BABYLON.MeshBuilder.CreateCylinder("triangle", {
            height: 1.2,
            diameter: 0.8,
            tessellation: 3
        }, this.scene);
        triangle.rotation.z = Math.PI;
        triangle.position.y = 0.2;
        
        // Create the horizontal bar
        const bar = BABYLON.MeshBuilder.CreateBox("bar", {
            width: 0.8,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bar.position.y = 0.1;
        
        // Combine meshes
        triangle.parent = letterGroup;
        bar.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterB() {
        const letterGroup = new BABYLON.Mesh("letterB", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the top curve
        const topCurve = BABYLON.MeshBuilder.CreateCylinder("topCurve", {
            height: 0.15,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        topCurve.rotation.z = Math.PI / 2;
        topCurve.position.set(0.1, 0.3, 0);
        
        // Create the bottom curve
        const bottomCurve = BABYLON.MeshBuilder.CreateCylinder("bottomCurve", {
            height: 0.15,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        bottomCurve.rotation.z = Math.PI / 2;
        bottomCurve.position.set(0.1, -0.3, 0);
        
        // Combine meshes
        vertical.parent = letterGroup;
        topCurve.parent = letterGroup;
        bottomCurve.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterC() {
        const letterGroup = new BABYLON.Mesh("letterC", this.scene);
        
        // Create a curved shape using a cylinder with a hole
        const outerCylinder = BABYLON.MeshBuilder.CreateCylinder("outerC", {
            height: 0.2,
            diameter: 1.0,
            tessellation: 16
        }, this.scene);
        
        const innerCylinder = BABYLON.MeshBuilder.CreateCylinder("innerC", {
            height: 0.25,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        
        // Cut out the inner cylinder
        const csg = BABYLON.CSG.FromMesh(outerCylinder);
        const innerCSG = BABYLON.CSG.FromMesh(innerCylinder);
        const result = csg.subtract(innerCSG);
        
        const cMesh = result.toMesh("letterC", this.letterMaterial, this.scene);
        
        // Remove the original cylinders
        outerCylinder.dispose();
        innerCylinder.dispose();
        
        // Cut off part of the C shape
        const cutter = BABYLON.MeshBuilder.CreateBox("cutter", {
            width: 0.6,
            height: 1.2,
            depth: 0.3
        }, this.scene);
        cutter.position.x = 0.3;
        
        const finalCSG = BABYLON.CSG.FromMesh(cMesh);
        const cutterCSG = BABYLON.CSG.FromMesh(cutter);
        const finalResult = finalCSG.subtract(cutterCSG);
        
        const finalMesh = finalResult.toMesh("finalC", this.letterMaterial, this.scene);
        
        // Clean up
        cMesh.dispose();
        cutter.dispose();
        
        return finalMesh;
    }

    createLetterD() {
        const letterGroup = new BABYLON.Mesh("letterD", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the curved part
        const curve = BABYLON.MeshBuilder.CreateCylinder("curve", {
            height: 0.15,
            diameter: 1.2,
            tessellation: 16
        }, this.scene);
        curve.rotation.z = Math.PI / 2;
        curve.position.set(0.3, 0, 0);
        
        // Combine meshes
        vertical.parent = letterGroup;
        curve.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterE() {
        const letterGroup = new BABYLON.Mesh("letterE", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the three horizontal bars
        const topBar = BABYLON.MeshBuilder.CreateBox("topBar", {
            width: 0.6,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        topBar.position.set(0, 0.4, 0);
        
        const middleBar = BABYLON.MeshBuilder.CreateBox("middleBar", {
            width: 0.4,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        middleBar.position.set(0.1, 0, 0);
        
        const bottomBar = BABYLON.MeshBuilder.CreateBox("bottomBar", {
            width: 0.6,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bottomBar.position.set(0, -0.4, 0);
        
        // Combine meshes
        vertical.parent = letterGroup;
        topBar.parent = letterGroup;
        middleBar.parent = letterGroup;
        bottomBar.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterF() {
        const letterGroup = new BABYLON.Mesh("letterF", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the two horizontal bars
        const topBar = BABYLON.MeshBuilder.CreateBox("topBar", {
            width: 0.6,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        topBar.position.set(0, 0.4, 0);
        
        const middleBar = BABYLON.MeshBuilder.CreateBox("middleBar", {
            width: 0.4,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        middleBar.position.set(0.1, 0, 0);
        
        // Combine meshes
        vertical.parent = letterGroup;
        topBar.parent = letterGroup;
        middleBar.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterG() {
        const letterGroup = new BABYLON.Mesh("letterG", this.scene);
        
        // Create the main curved part (similar to C but with a bar)
        const outerCylinder = BABYLON.MeshBuilder.CreateCylinder("outerG", {
            height: 0.2,
            diameter: 1.0,
            tessellation: 16
        }, this.scene);
        
        const innerCylinder = BABYLON.MeshBuilder.CreateCylinder("innerG", {
            height: 0.25,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        
        // Cut out the inner cylinder
        const csg = BABYLON.CSG.FromMesh(outerCylinder);
        const innerCSG = BABYLON.CSG.FromMesh(innerCylinder);
        const result = csg.subtract(innerCSG);
        
        const gMesh = result.toMesh("letterG", this.letterMaterial, this.scene);
        
        // Remove the original cylinders
        outerCylinder.dispose();
        innerCylinder.dispose();
        
        // Cut off part of the G shape
        const cutter = BABYLON.MeshBuilder.CreateBox("cutter", {
            width: 0.6,
            height: 1.2,
            depth: 0.3
        }, this.scene);
        cutter.position.x = 0.3;
        
        const finalCSG = BABYLON.CSG.FromMesh(gMesh);
        const cutterCSG = BABYLON.CSG.FromMesh(cutter);
        const finalResult = finalCSG.subtract(cutterCSG);
        
        const finalMesh = finalResult.toMesh("finalG", this.letterMaterial, this.scene);
        
        // Add the horizontal bar at the bottom
        const bar = BABYLON.MeshBuilder.CreateBox("gBar", {
            width: 0.3,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bar.position.set(0.15, -0.3, 0);
        
        // Combine meshes
        bar.parent = finalMesh;
        
        // Clean up
        gMesh.dispose();
        cutter.dispose();
        
        return finalMesh;
    }

    createLetterH() {
        const letterGroup = new BABYLON.Mesh("letterH", this.scene);
        
        // Create the two vertical lines
        const leftVertical = BABYLON.MeshBuilder.CreateBox("leftVertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        leftVertical.position.x = -0.3;
        
        const rightVertical = BABYLON.MeshBuilder.CreateBox("rightVertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        rightVertical.position.x = 0.3;
        
        // Create the horizontal bar
        const bar = BABYLON.MeshBuilder.CreateBox("bar", {
            width: 0.6,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bar.position.y = 0;
        
        // Combine meshes
        leftVertical.parent = letterGroup;
        rightVertical.parent = letterGroup;
        bar.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterI() {
        const letterGroup = new BABYLON.Mesh("letterI", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.0,
            depth: 0.2
        }, this.scene);
        
        // Create the top and bottom bars
        const topBar = BABYLON.MeshBuilder.CreateBox("topBar", {
            width: 0.4,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        topBar.position.y = 0.5;
        
        const bottomBar = BABYLON.MeshBuilder.CreateBox("bottomBar", {
            width: 0.4,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bottomBar.position.y = -0.5;
        
        // Combine meshes
        vertical.parent = letterGroup;
        topBar.parent = letterGroup;
        bottomBar.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterJ() {
        const letterGroup = new BABYLON.Mesh("letterJ", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 0.8,
            depth: 0.2
        }, this.scene);
        vertical.position.x = 0.2;
        
        // Create the curved bottom
        const curve = BABYLON.MeshBuilder.CreateCylinder("curve", {
            height: 0.15,
            diameter: 0.8,
            tessellation: 16
        }, this.scene);
        curve.rotation.z = Math.PI / 2;
        curve.position.set(0.2, -0.4, 0);
        
        // Create the top bar
        const topBar = BABYLON.MeshBuilder.CreateBox("topBar", {
            width: 0.4,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        topBar.position.y = 0.5;
        
        // Combine meshes
        vertical.parent = letterGroup;
        curve.parent = letterGroup;
        topBar.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterK() {
        const letterGroup = new BABYLON.Mesh("letterK", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the diagonal lines
        const topDiagonal = BABYLON.MeshBuilder.CreateBox("topDiagonal", {
            width: 0.15,
            height: 0.6,
            depth: 0.2
        }, this.scene);
        topDiagonal.position.set(0.1, 0.2, 0);
        topDiagonal.rotation.z = -Math.PI / 4;
        
        const bottomDiagonal = BABYLON.MeshBuilder.CreateBox("bottomDiagonal", {
            width: 0.15,
            height: 0.6,
            depth: 0.2
        }, this.scene);
        bottomDiagonal.position.set(0.1, -0.2, 0);
        bottomDiagonal.rotation.z = Math.PI / 4;
        
        // Combine meshes
        vertical.parent = letterGroup;
        topDiagonal.parent = letterGroup;
        bottomDiagonal.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterL() {
        const letterGroup = new BABYLON.Mesh("letterL", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the horizontal bar at the bottom
        const bar = BABYLON.MeshBuilder.CreateBox("bar", {
            width: 0.6,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bar.position.set(0, -0.5, 0);
        
        // Combine meshes
        vertical.parent = letterGroup;
        bar.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterM() {
        const letterGroup = new BABYLON.Mesh("letterM", this.scene);
        
        // Create the four vertical lines
        const leftVertical = BABYLON.MeshBuilder.CreateBox("leftVertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        leftVertical.position.x = -0.4;
        
        const rightVertical = BABYLON.MeshBuilder.CreateBox("rightVertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        rightVertical.position.x = 0.4;
        
        // Create the diagonal lines
        const leftDiagonal = BABYLON.MeshBuilder.CreateBox("leftDiagonal", {
            width: 0.15,
            height: 0.8,
            depth: 0.2
        }, this.scene);
        leftDiagonal.position.set(-0.2, 0.2, 0);
        leftDiagonal.rotation.z = Math.PI / 6;
        
        const rightDiagonal = BABYLON.MeshBuilder.CreateBox("rightDiagonal", {
            width: 0.15,
            height: 0.8,
            depth: 0.2
        }, this.scene);
        rightDiagonal.position.set(0.2, 0.2, 0);
        rightDiagonal.rotation.z = -Math.PI / 6;
        
        // Combine meshes
        leftVertical.parent = letterGroup;
        rightVertical.parent = letterGroup;
        leftDiagonal.parent = letterGroup;
        rightDiagonal.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterN() {
        const letterGroup = new BABYLON.Mesh("letterN", this.scene);
        
        // Create the two vertical lines
        const leftVertical = BABYLON.MeshBuilder.CreateBox("leftVertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        leftVertical.position.x = -0.3;
        
        const rightVertical = BABYLON.MeshBuilder.CreateBox("rightVertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        rightVertical.position.x = 0.3;
        
        // Create the diagonal line
        const diagonal = BABYLON.MeshBuilder.CreateBox("diagonal", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        diagonal.rotation.z = -Math.PI / 6;
        
        // Combine meshes
        leftVertical.parent = letterGroup;
        rightVertical.parent = letterGroup;
        diagonal.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterO() {
        // Create a cylinder for the O shape
        const letterO = BABYLON.MeshBuilder.CreateCylinder("letterO", {
            height: 0.2,
            diameter: 1.0,
            tessellation: 16
        }, this.scene);
        
        // Create inner hole
        const innerCylinder = BABYLON.MeshBuilder.CreateCylinder("innerO", {
            height: 0.25,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        
        // Cut out the inner cylinder
        const csg = BABYLON.CSG.FromMesh(letterO);
        const innerCSG = BABYLON.CSG.FromMesh(innerCylinder);
        const result = csg.subtract(innerCSG);
        
        const oMesh = result.toMesh("finalO", this.letterMaterial, this.scene);
        
        // Clean up
        letterO.dispose();
        innerCylinder.dispose();
        
        return oMesh;
    }

    createLetterP() {
        const letterGroup = new BABYLON.Mesh("letterP", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the curved part
        const curve = BABYLON.MeshBuilder.CreateCylinder("curve", {
            height: 0.15,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        curve.rotation.z = Math.PI / 2;
        curve.position.set(0.1, 0.3, 0);
        
        // Combine meshes
        vertical.parent = letterGroup;
        curve.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterQ() {
        const letterGroup = new BABYLON.Mesh("letterQ", this.scene);
        
        // Create the main O shape
        const outerCylinder = BABYLON.MeshBuilder.CreateCylinder("outerQ", {
            height: 0.2,
            diameter: 1.0,
            tessellation: 16
        }, this.scene);
        
        const innerCylinder = BABYLON.MeshBuilder.CreateCylinder("innerQ", {
            height: 0.25,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        
        // Cut out the inner cylinder
        const csg = BABYLON.CSG.FromMesh(outerCylinder);
        const innerCSG = BABYLON.CSG.FromMesh(innerCylinder);
        const result = csg.subtract(innerCSG);
        
        const qMesh = result.toMesh("letterQ", this.letterMaterial, this.scene);
        
        // Add the tail
        const tail = BABYLON.MeshBuilder.CreateBox("tail", {
            width: 0.15,
            height: 0.4,
            depth: 0.2
        }, this.scene);
        tail.position.set(0.4, -0.2, 0);
        tail.rotation.z = Math.PI / 4;
        
        // Combine meshes
        tail.parent = qMesh;
        
        // Clean up
        outerCylinder.dispose();
        innerCylinder.dispose();
        
        return qMesh;
    }

    createLetterR() {
        const letterGroup = new BABYLON.Mesh("letterR", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        vertical.position.x = -0.3;
        
        // Create the curved part
        const curve = BABYLON.MeshBuilder.CreateCylinder("curve", {
            height: 0.15,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        curve.rotation.z = Math.PI / 2;
        curve.position.set(0.1, 0.3, 0);
        
        // Create the diagonal tail
        const tail = BABYLON.MeshBuilder.CreateBox("tail", {
            width: 0.15,
            height: 0.4,
            depth: 0.2
        }, this.scene);
        tail.position.set(0.1, -0.2, 0);
        tail.rotation.z = Math.PI / 4;
        
        // Combine meshes
        vertical.parent = letterGroup;
        curve.parent = letterGroup;
        tail.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterS() {
        const letterGroup = new BABYLON.Mesh("letterS", this.scene);
        
        // Create the S shape using curved segments
        const topCurve = BABYLON.MeshBuilder.CreateCylinder("topCurve", {
            height: 0.15,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        topCurve.rotation.z = Math.PI / 2;
        topCurve.position.set(0.1, 0.3, 0);
        
        const bottomCurve = BABYLON.MeshBuilder.CreateCylinder("bottomCurve", {
            height: 0.15,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        bottomCurve.rotation.z = -Math.PI / 2;
        bottomCurve.position.set(-0.1, -0.3, 0);
        
        // Combine meshes
        topCurve.parent = letterGroup;
        bottomCurve.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterT() {
        const letterGroup = new BABYLON.Mesh("letterT", this.scene);
        
        // Create the horizontal bar
        const bar = BABYLON.MeshBuilder.CreateBox("bar", {
            width: 0.8,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bar.position.y = 0.4;
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 0.8,
            depth: 0.2
        }, this.scene);
        vertical.position.y = 0;
        
        // Combine meshes
        bar.parent = letterGroup;
        vertical.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterU() {
        const letterGroup = new BABYLON.Mesh("letterU", this.scene);
        
        // Create the two vertical lines
        const leftVertical = BABYLON.MeshBuilder.CreateBox("leftVertical", {
            width: 0.15,
            height: 0.8,
            depth: 0.2
        }, this.scene);
        leftVertical.position.set(-0.3, 0.2, 0);
        
        const rightVertical = BABYLON.MeshBuilder.CreateBox("rightVertical", {
            width: 0.15,
            height: 0.8,
            depth: 0.2
        }, this.scene);
        rightVertical.position.set(0.3, 0.2, 0);
        
        // Create the curved bottom
        const curve = BABYLON.MeshBuilder.CreateCylinder("curve", {
            height: 0.15,
            diameter: 0.6,
            tessellation: 16
        }, this.scene);
        curve.rotation.z = Math.PI / 2;
        curve.position.y = -0.3;
        
        // Combine meshes
        leftVertical.parent = letterGroup;
        rightVertical.parent = letterGroup;
        curve.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterV() {
        const letterGroup = new BABYLON.Mesh("letterV", this.scene);
        
        // Create the two diagonal lines
        const leftDiagonal = BABYLON.MeshBuilder.CreateBox("leftDiagonal", {
            width: 0.15,
            height: 1.0,
            depth: 0.2
        }, this.scene);
        leftDiagonal.position.set(-0.2, 0.1, 0);
        leftDiagonal.rotation.z = Math.PI / 6;
        
        const rightDiagonal = BABYLON.MeshBuilder.CreateBox("rightDiagonal", {
            width: 0.15,
            height: 1.0,
            depth: 0.2
        }, this.scene);
        rightDiagonal.position.set(0.2, 0.1, 0);
        rightDiagonal.rotation.z = -Math.PI / 6;
        
        // Combine meshes
        leftDiagonal.parent = letterGroup;
        rightDiagonal.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterW() {
        const letterGroup = new BABYLON.Mesh("letterW", this.scene);
        
        // Create the four diagonal lines
        const leftDiagonal = BABYLON.MeshBuilder.CreateBox("leftDiagonal", {
            width: 0.15,
            height: 1.0,
            depth: 0.2
        }, this.scene);
        leftDiagonal.position.set(-0.4, 0.1, 0);
        leftDiagonal.rotation.z = Math.PI / 6;
        
        const rightDiagonal = BABYLON.MeshBuilder.CreateBox("rightDiagonal", {
            width: 0.15,
            height: 1.0,
            depth: 0.2
        }, this.scene);
        rightDiagonal.position.set(0.4, 0.1, 0);
        rightDiagonal.rotation.z = -Math.PI / 6;
        
        const middleLeftDiagonal = BABYLON.MeshBuilder.CreateBox("middleLeftDiagonal", {
            width: 0.15,
            height: 1.0,
            depth: 0.2
        }, this.scene);
        middleLeftDiagonal.position.set(-0.1, 0.1, 0);
        middleLeftDiagonal.rotation.z = -Math.PI / 6;
        
        const middleRightDiagonal = BABYLON.MeshBuilder.CreateBox("middleRightDiagonal", {
            width: 0.15,
            height: 1.0,
            depth: 0.2
        }, this.scene);
        middleRightDiagonal.position.set(0.1, 0.1, 0);
        middleRightDiagonal.rotation.z = Math.PI / 6;
        
        // Combine meshes
        leftDiagonal.parent = letterGroup;
        rightDiagonal.parent = letterGroup;
        middleLeftDiagonal.parent = letterGroup;
        middleRightDiagonal.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterX() {
        const letterGroup = new BABYLON.Mesh("letterX", this.scene);
        
        // Create the two diagonal lines
        const leftDiagonal = BABYLON.MeshBuilder.CreateBox("leftDiagonal", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        leftDiagonal.rotation.z = Math.PI / 4;
        
        const rightDiagonal = BABYLON.MeshBuilder.CreateBox("rightDiagonal", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        rightDiagonal.rotation.z = -Math.PI / 4;
        
        // Combine meshes
        leftDiagonal.parent = letterGroup;
        rightDiagonal.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterY() {
        const letterGroup = new BABYLON.Mesh("letterY", this.scene);
        
        // Create the vertical line
        const vertical = BABYLON.MeshBuilder.CreateBox("vertical", {
            width: 0.15,
            height: 0.6,
            depth: 0.2
        }, this.scene);
        vertical.position.y = -0.1;
        
        // Create the two diagonal lines
        const leftDiagonal = BABYLON.MeshBuilder.CreateBox("leftDiagonal", {
            width: 0.15,
            height: 0.6,
            depth: 0.2
        }, this.scene);
        leftDiagonal.position.set(-0.2, 0.2, 0);
        leftDiagonal.rotation.z = Math.PI / 6;
        
        const rightDiagonal = BABYLON.MeshBuilder.CreateBox("rightDiagonal", {
            width: 0.15,
            height: 0.6,
            depth: 0.2
        }, this.scene);
        rightDiagonal.position.set(0.2, 0.2, 0);
        rightDiagonal.rotation.z = -Math.PI / 6;
        
        // Combine meshes
        vertical.parent = letterGroup;
        leftDiagonal.parent = letterGroup;
        rightDiagonal.parent = letterGroup;
        
        return letterGroup;
    }

    createLetterZ() {
        const letterGroup = new BABYLON.Mesh("letterZ", this.scene);
        
        // Create the horizontal bars
        const topBar = BABYLON.MeshBuilder.CreateBox("topBar", {
            width: 0.8,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        topBar.position.y = 0.4;
        
        const bottomBar = BABYLON.MeshBuilder.CreateBox("bottomBar", {
            width: 0.8,
            height: 0.15,
            depth: 0.2
        }, this.scene);
        bottomBar.position.y = -0.4;
        
        // Create the diagonal line
        const diagonal = BABYLON.MeshBuilder.CreateBox("diagonal", {
            width: 0.15,
            height: 1.2,
            depth: 0.2
        }, this.scene);
        diagonal.rotation.z = -Math.PI / 4;
        
        // Combine meshes
        topBar.parent = letterGroup;
        bottomBar.parent = letterGroup;
        diagonal.parent = letterGroup;
        
        return letterGroup;
    }
    
    createEnhancedLetterMaterial(letter) {
        const letterColor = this.getLetterColor(letter);
        const babylonColor = new BABYLON.Color3(
            letterColor.r / 255, 
            letterColor.g / 255, 
            letterColor.b / 255
        );
        
        // Use shader material if available
        if (window.gameShaders && window.gameShaders.getLetterMaterial3D) {
            const shaderMaterial = window.gameShaders.getLetterMaterial3D(babylonColor);
            if (shaderMaterial) {
                return shaderMaterial;
            }
        }
        
        // Fallback to standard material
        const material = new BABYLON.StandardMaterial(`letterMaterial_${letter}`, this.scene);
        
        // Set base colors
        material.diffuseColor = babylonColor;
        
        // Add emissive glow
        material.emissiveColor = new BABYLON.Color3(
            letterColor.r / 255 * 0.3, 
            letterColor.g / 255 * 0.3, 
            letterColor.b / 255 * 0.3
        );
        
        // Add specular highlights
        material.specularColor = new BABYLON.Color3(1, 1, 1);
        material.specularPower = 50;
        
        // Add metallic properties
        material.metallic = 0.3;
        material.roughness = 0.2;
        
        // Add transparency for glass-like effect
        material.alpha = 0.9;
        
        // Add fresnel effect for edge glow
        material.useFresnel = true;
        material.fresnelParameters = new BABYLON.FresnelParameters();
        material.fresnelParameters.leftColor = new BABYLON.Color3(1, 1, 1);
        material.fresnelParameters.rightColor = babylonColor;
        material.fresnelParameters.power = 2;
        
        return material;
    }
    
    getLetterColor(letter) {
        // Define unique colors for each letter (matching 2D version)
        const colorMap = {
            'A': { r: 255, g: 99, b: 132 },   // Pink
            'B': { r: 99, g: 102, b: 241 },   // Indigo
            'C': { r: 34, g: 197, b: 94 },    // Green
            'D': { r: 245, g: 158, b: 11 },   // Amber
            'E': { r: 239, g: 68, b: 68 },    // Red
            'F': { r: 168, g: 85, b: 247 },   // Purple
            'G': { r: 6, g: 182, b: 212 },    // Cyan
            'H': { r: 251, g: 146, b: 60 },   // Orange
            'I': { r: 236, g: 72, b: 153 },   // Pink
            'J': { r: 59, g: 130, b: 246 },   // Blue
            'K': { r: 16, g: 185, b: 129 },   // Emerald
            'L': { r: 245, g: 101, b: 101 },  // Red
            'M': { r: 139, g: 92, b: 246 },   // Violet
            'N': { r: 14, g: 165, b: 233 },   // Sky
            'O': { r: 34, g: 197, b: 94 },    // Green
            'P': { r: 251, g: 146, b: 60 },   // Orange
            'Q': { r: 168, g: 85, b: 247 },   // Purple
            'R': { r: 239, g: 68, b: 68 },    // Red
            'S': { r: 6, g: 182, b: 212 },    // Cyan
            'T': { r: 99, g: 102, b: 241 },   // Indigo
            'U': { r: 16, g: 185, b: 129 },   // Emerald
            'V': { r: 245, g: 158, b: 11 },   // Amber
            'W': { r: 236, g: 72, b: 153 },   // Pink
            'X': { r: 59, g: 130, b: 246 },   // Blue
            'Y': { r: 139, g: 92, b: 246 },   // Violet
            'Z': { r: 14, g: 165, b: 233 }    // Sky
        };
        
        return colorMap[letter.toUpperCase()] || { r: 156, g: 163, b: 175 }; // Gray default
    }

    /**
     * Add letter texture to mesh
     */
    addLetterTexture(mesh, letter) {
        try {
            // Create dynamic texture for the letter
            const dynamicTexture = new BABYLON.DynamicTexture("letterTexture_" + letter, {width: 512, height: 512}, this.scene);
            dynamicTexture.hasAlpha = true;
            
            // Draw letter on texture
            const context = dynamicTexture.getContext();
            context.font = "bold 400px Arial";
            context.fillStyle = "white";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(letter, 256, 256);
            dynamicTexture.update();
            
            // Apply texture to material
            if (mesh.material) {
                mesh.material.baseTexture = dynamicTexture;
            }
        } catch (error) {
            console.warn('⚠️ Could not create letter texture:', error);
            // Continue without texture
        }
    }

    /**
     * Handle letter click events
     */
    onLetterClick(mesh, letter) {
        console.log(`🎯 Letter clicked: ${letter}`);
        
        // Add selection effect
        this.addSelectionEffect(mesh);
        
        // Add to selected letters
        this.selectedLetters.push({mesh, letter});
        
        // Check for word formation
        this.checkWordFormation();
    }

    /**
     * Add visual selection effect to letter
     */
    addSelectionEffect(mesh) {
        // Store original material
        if (!mesh.originalMaterial) {
            mesh.originalMaterial = mesh.material;
        }
        
        // Apply selection material for dramatic feedback
        if (this.materialLibrary && this.materialLibrary.selection) {
            mesh.material = this.materialLibrary.selection;
        }
        
        // Create dramatic glow effect
        if (this.postProcessing && this.postProcessing.glow) {
            this.postProcessing.glow.addIncludedOnlyMesh(mesh);
        }
        
        // Dramatic scale animation
        BABYLON.Animation.CreateAndStartAnimation("letterSelect", mesh, "scaling", 30, 10,
            new BABYLON.Vector3(1, 1, 1), new BABYLON.Vector3(1.15, 1.15, 1.15), // Larger scale for dramatic effect
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        
        // Add dramatic rotation for dynamic feedback
        BABYLON.Animation.CreateAndStartAnimation("letterRotate", mesh, "rotation.y", 30, 10,
            mesh.rotation.y, mesh.rotation.y + 0.3, // Larger rotation for dramatic effect
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    }

    /**
     * Check if selected letters form a valid word
     */
    checkWordFormation() {
        if (this.selectedLetters.length < 3) return;
        
        const word = this.selectedLetters.map(item => item.letter).join('');
        
        // Simple French word validation (you can expand this)
        const validWords = ['CHAT', 'CHIEN', 'MAISON', 'ARBRE', 'EAU', 'FEU', 'AIR', 'TERRE'];
        
        if (validWords.includes(word)) {
            this.onWordFound(word);
        }
    }

    /**
     * Handle valid word found
     */
    onWordFound(word) {
        try {
            console.log(`🎉 Word found: ${word}`);
            
            // Add word to found words list
            if (!this.foundWords.includes(word)) {
                this.foundWords.push(word);
            }
            
            // Calculate score based on word length
            const wordScore = this.calculateWordScore(word);
            this.score += wordScore;
            
            // Remove selected letters
            this.selectedLetters.forEach(item => {
                item.mesh.dispose();
            });
            
            // Clear selection
            this.selectedLetters = [];
            
            // Create celebration effect
            this.createEnhancedCelebrationEffect(word, wordScore);
            
            // Update UI
            this.updateGameUI();
            
            // Also update the HTML game stats
            if (typeof updateGameStats === 'function') {
                updateGameStats();
            }
            if (typeof updateWordList === 'function') {
                updateWordList();
            }
            
            // Check for level up
            this.checkLevelUp();
            
            console.log(`🎉 Word found: "${word}" - ${wordScore} points! Total score: ${this.score}`);
            
        } catch (error) {
            console.error('❌ Error processing word found:', error);
        }
    }

    /**
     * Create professional celebration effect
     */
    createCelebrationEffect() {
        // Create dramatic particle system
        const celebrationParticles = new BABYLON.ParticleSystem("celebration", 50, this.scene);
        
        // Dramatic particle properties
        celebrationParticles.emitter = new BABYLON.Vector3(0, 2, 0);
        celebrationParticles.minEmitBox = new BABYLON.Vector3(-2, 0, -2);
        celebrationParticles.maxEmitBox = new BABYLON.Vector3(2, 0, 2);
        
        // Dramatic colors for atmospheric effect
        celebrationParticles.color1 = new BABYLON.Color4(0.4, 0.8, 1.0, 1.0); // Bright blue
        celebrationParticles.color2 = new BABYLON.Color4(1.0, 0.6, 0.2, 1.0); // Orange
        celebrationParticles.colorDead = new BABYLON.Color4(0.2, 0.4, 0.8, 0.0);
        
        // Dramatic particle behavior
        celebrationParticles.minSize = 0.1;
        celebrationParticles.maxSize = 0.3;
        celebrationParticles.minLifeTime = 2.0;
        celebrationParticles.maxLifeTime = 3.5;
        celebrationParticles.emitRate = 80; // Increased for dramatic effect
        celebrationParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        celebrationParticles.gravity = new BABYLON.Vector3(0, -1, 0);
        celebrationParticles.direction1 = new BABYLON.Vector3(-2, 4, -2);
        celebrationParticles.direction2 = new BABYLON.Vector3(2, 4, 2);
        
        // Start the dramatic celebration
        celebrationParticles.start();
        
        // Create professional light flash effect
        const flashLight = new BABYLON.PointLight("celebrationLight", 
            new BABYLON.Vector3(0, 3, 0), this.scene);
        flashLight.intensity = 0;
        flashLight.diffuse = new BABYLON.Color3(0.2, 0.6, 1.0);
        flashLight.range = 10;
        
        // Animate the light flash
        BABYLON.Animation.CreateAndStartAnimation("flashLight", flashLight, "intensity", 30, 30,
            0, 2, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        
        // Stop celebration after 2 seconds
        setTimeout(() => {
            celebrationParticles.stop();
            flashLight.dispose();
            setTimeout(() => celebrationParticles.dispose(), 3000);
        }, 2000);
    }

    /**
     * Start letter falling system
     */
    startLetterFalling() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        console.log('🎯 Letter falling system started');
        
        // Drop letters at intervals (use difficulty-based timing)
        const intervalMs = this.letterDropMs || 3000;
        this.letterDropInterval = setInterval(() => {
            this.dropRandomLetter();
        }, intervalMs);
    }

    /**
     * Stop letter falling system
     */
    stopLetterFalling() {
        this.gameRunning = false;
        
        if (this.letterDropInterval) {
            clearInterval(this.letterDropInterval);
            this.letterDropInterval = null;
        }
        
        console.log('⏹️ Letter falling system stopped');
    }

    /**
     * Drop a random letter from the queue
     */
    dropRandomLetter() {
        if (this.letterQueue.length === 0) {
            this.generateLetterQueue();
        }
        
        const letter = this.letterQueue.shift();
        const x = (Math.random() - 0.5) * this.gridSize;
        const z = (Math.random() - 0.5) * this.gridSize + 5;
        
        const letterMesh = this.createLetterMesh(letter, {x, y: 5, z});
        this.fallingLetters.push(letterMesh);
        
        console.log(`📝 Dropped letter: ${letter} at (${x.toFixed(1)}, ${z.toFixed(1)})`);
    }

    /**
     * Place test letter for demonstration
     */
    placeTestLetter(letter, gridX, gridZ) {
        try {
            const worldX = gridX - this.gridSize/2;
            const worldZ = gridZ - this.gridSize/2;
            
            console.log(`🧪 Creating test letter: ${letter} at world position (${worldX}, 2, ${worldZ})`);
            
            const letterMesh = this.createLetterMesh(letter, {x: worldX, y: 2, z: worldZ});
            
            if (letterMesh) {
                // Ensure the letter is visible
                letterMesh.position.y = 2;
                letterMesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5); // Make letters bigger
                
                // Remove physics for placed letters safely
                try {
                    if (letterMesh.physicsImpostor) {
                        letterMesh.physicsImpostor.dispose();
                        letterMesh.physicsImpostor = null;
                    }
                } catch (error) {
                    console.warn('⚠️ Could not dispose physics impostor:', error);
                }
                
                console.log(`✅ Successfully placed test letter: ${letter} at grid (${gridX}, ${gridZ})`);
            } else {
                console.error(`❌ Failed to create letter mesh for: ${letter}`);
            }
        } catch (error) {
            console.error(`❌ Error placing test letter ${letter}:`, error);
        }
    }

    /**
     * Enable grid layout modes
     */
    enableGridLayoutModes() {
        console.log('📐 Grid layout modes enabled');
    }

    /**
     * Switch grid layout mode
     */
    switchGridLayout(mode) {
        this.gridLayoutMode = mode;
        console.log(`📐 Switched to ${mode} grid layout`);
    }

    /**
     * Create 3D UI container
     */
    create3DUIContainer() {
        // This method is now replaced by createEnhancedUI()
        // Keeping for backward compatibility but it's deprecated
        console.log('⚠️ create3DUIContainer is deprecated, use createEnhancedUI instead');
        this.createEnhancedUI();
    }

    /**
     * Update game UI
     */
    updateGameUI() {
        if (this.ui) {
            try {
                this.ui.scoreText.text = `Score: ${this.score.toLocaleString()}`;
                this.ui.levelText.text = `Niveau: ${this.calculateLevel()}`;
                this.ui.wordsText.text = `Mots trouvés: ${this.foundWords.length}`;
                this.ui.comboText.text = `Combo: x${this.calculateCombo()}`;
                
                // Update status based on game state
                if (this.gameRunning) {
                    this.ui.statusText.text = "En jeu";
                    this.ui.statusText.color = "#10b981";
                } else {
                    this.ui.statusText.text = "En pause";
                    this.ui.statusText.color = "#f59e0b";
                }
                
            } catch (error) {
                console.warn('⚠️ Error updating game UI:', error);
            }
        }
    }

    /**
     * Update game logic each frame
     */
    updateGame() {
        // Update shader animations
        const time = Date.now() * 0.001;
        if (window.gameShaders) {
            window.gameShaders.update(time);
        }
        
        // Clean up fallen letters that are too low
        this.fallingLetters = this.fallingLetters.filter(letter => {
            if (letter.position.y < -5) {
                letter.dispose();
                return false;
            }
            return true;
        });
        
        // Update particle systems
        this.particleSystems.forEach(system => {
            if (system.isStarted()) {
                // Particle systems update automatically
            }
        });
        
        // Update letter animations
        this.fallingLetters.forEach(letter => {
            if (letter && letter.mesh) {
                letter.mesh.rotation.y += 0.01;
            }
        });
        
        // Update UI periodically
        this.frameCount++;
        if (this.frameCount % 60 === 0) { // Update every 60 frames (about once per second)
            this.updateGameUI();
        }
    }

    /**
     * Dispose of the game engine and clean up resources
     */
    dispose() {
        try {
            console.log('🧹 Disposing Enhanced Babylon.js game...');
            
            // Stop letter falling system
            this.stopLetterFalling();
            
            // Remove resize event listener
            if (this.resizeListener) {
                window.removeEventListener('resize', this.resizeListener);
                console.log('✅ Resize event listener removed');
            }
            
            // Dispose of scene and engine
            if (this.scene) {
                try {
                    // Dispose of all meshes with physics impostors first
                    this.scene.meshes.forEach(mesh => {
                        if (mesh.physicsImpostor) {
                            try {
                                mesh.physicsImpostor.dispose();
                            } catch (physicsError) {
                                console.warn('⚠️ Error disposing physics impostor:', physicsError);
                            }
                        }
                    });
                    
                    this.scene.dispose();
                    console.log('✅ Scene disposed');
                } catch (sceneError) {
                    console.warn('⚠️ Error disposing scene:', sceneError);
                }
            }
            
            if (this.engine) {
                try {
                    this.engine.dispose();
                    console.log('✅ Engine disposed');
                } catch (engineError) {
                    console.warn('⚠️ Error disposing engine:', engineError);
                }
            }
            
            console.log('🧹 Enhanced Babylon.js game disposed safely');
        } catch (error) {
            console.error('❌ Error during disposal:', error);
        }
    }

    /**
     * Detect if running on mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    /**
     * Add mobile-specific letter movement methods
     */
    moveLetter(direction) {
        console.log(`📱 Mobile letter movement: ${direction}`);
        // Implement letter movement logic here
        // This would be called from touch gestures
    }

    /**
     * Accelerate letter fall for mobile
     */
    accelerateFall() {
        console.log('📱 Mobile accelerate fall');
        // Implement accelerated fall logic here
    }

    /**
     * Rotate letter for mobile
     */
    rotateLetter() {
        console.log('📱 Mobile rotate letter');
        // Implement letter rotation logic here
    }

    /**
     * Start letter falling animation
     */
    startLetterFalling() {
        console.log('🎮 Starting letter falling animation');
        this.gameRunning = true;
        this.paused = false;
        // Implement letter falling logic here
    }

    /**
     * Place test letter on grid
     */
    placeTestLetter(letter, gridX, gridZ) {
        console.log(`🧪 Placing test letter: ${letter} at (${gridX}, ${gridZ})`);
        // Convert grid coordinates to world coordinates
        const worldX = gridX - this.gridSize/2 + 0.5;
        const worldZ = gridZ - this.gridSize/2 + 0.5;
        
        try {
            const letterMesh = this.createLetterMesh(letter, {x: worldX, y: 1.5, z: worldZ});
            if (letterMesh) {
                letterMesh.position.y = 1.5; // Place on grid
                
                // Remove physics for placed letters safely
                if (letterMesh.physicsImpostor) {
                    letterMesh.physicsImpostor.dispose();
                    letterMesh.physicsImpostor = null;
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not place test letter:', error);
        }
    }

    /**
     * Set camera mode
     */
    setCameraMode(mode) {
        console.log(`📷 Setting camera mode: ${mode}`);
        if (this.camera) {
            switch(mode) {
                case 'front':
                    this.camera.position = new BABYLON.Vector3(0, 0, 20);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'back':
                    this.camera.position = new BABYLON.Vector3(0, 0, -20);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'left':
                    this.camera.position = new BABYLON.Vector3(-20, 0, 0);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'right':
                    this.camera.position = new BABYLON.Vector3(20, 0, 0);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'top':
                    this.camera.position = new BABYLON.Vector3(0, 20, 0);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'bottom':
                    this.camera.position = new BABYLON.Vector3(0, -20, 0);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'isometric':
                    this.camera.position = new BABYLON.Vector3(15, 15, 15);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'side':
                    this.camera.position = new BABYLON.Vector3(20, 5, 0);
                    this.camera.setTarget(BABYLON.Vector3.Zero());
                    break;
                case 'fixed':
                    // Keep current position
                    break;
                case 'free':
                    // Enable free camera controls
                    if (this.camera.attachControl) {
                        this.camera.attachControl(this.canvas, true);
                    }
                    break;
                default:
                    console.log(`📷 Camera mode '${mode}' not implemented, using default`);
                    this.resetCamera();
            }
        }
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        console.log('📷 Resetting camera to default position');
        if (this.camera) {
            this.camera.position = new BABYLON.Vector3(0, 15, 20);
            this.camera.setTarget(BABYLON.Vector3.Zero());
        }
    }

    /**
     * Toggle camera controls
     */
    toggleCameraControls() {
        console.log('📷 Toggling camera controls');
        if (this.camera && this.camera.attachControl) {
            if (this.camera.inputs.attached) {
                this.camera.detachControl();
                console.log('📷 Camera controls disabled');
            } else {
                this.camera.attachControl(this.canvas, true);
                console.log('📷 Camera controls enabled');
            }
        }
    }

    /**
     * Enable grid layout modes
     */
    enableGridLayoutModes() {
        console.log('🔧 Enabling grid layout modes');
        // This method exists for compatibility
    }

    /**
     * Switch grid layout
     */
    switchGridLayout(mode) {
        console.log(`🔧 Switching to grid layout: ${mode}`);
        // Implement grid layout switching logic
        switch(mode) {
            case 'beginner':
                this.gridSize = 6;
                break;
            case 'intermediate':
                this.gridSize = 8;
                break;
            case 'expert':
                this.gridSize = 10;
                break;
            default:
                this.gridSize = 6;
        }
    }

    /**
     * Create 3D UI Container (optional method)
     */
    create3DUIContainer() {
        console.log('🎨 Creating 3D UI container');
        // Optional method for 3D UI elements
        // This method exists for compatibility with UI system
    }

    /**
     * Create dark atmospheric elements matching the reference image style
     */
    async createDarkAtmosphericElements() {
        // Create dark atmospheric structures around the scene
        await this.createDarkStructures();
        await this.createAtmosphericParticles();
        await this.createDarkWaterEffects();
    }

    /**
     * Create dark atmospheric structures
     */
    async createDarkStructures() {
        // Dark pillars around the scene
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 18 + Math.random() * 8;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            await this.createDarkPillar(x, 0, z);
        }

        // Dark walls and barriers
        for (let i = 0; i < 4; i++) {
            const x = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;
            const scale = 2 + Math.random() * 3;
            
            await this.createDarkWall(x, 0, z, scale);
        }

        // Central dark structure
        await this.createCentralDarkStructure();
    }

    /**
     * Create a dark atmospheric pillar
     */
    async createDarkPillar(x, y, z) {
        // Pillar base
        const pillar = BABYLON.MeshBuilder.CreateCylinder("darkPillar", {height: 8, diameter: 1.5}, this.scene);
        pillar.position = new BABYLON.Vector3(x, y + 4, z);
        
        // Use dark structure material
        if (this.materialLibrary && this.materialLibrary.darkStructure) {
            pillar.material = this.materialLibrary.darkStructure;
        } else {
            const pillarMaterial = new BABYLON.PBRMaterial("pillarMaterial", this.scene);
            pillarMaterial.baseColor = new BABYLON.Color3(0.15, 0.15, 0.2);
            pillarMaterial.metallicFactor = 0.4;
            pillarMaterial.roughnessFactor = 0.7;
            pillar.material = pillarMaterial;
        }
        
        // Add to shadow casters safely
        if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
            this.lighting.shadowGenerator.getShadowMap().renderList.push(pillar);
        }
    }

    /**
     * Create a dark atmospheric wall
     */
    async createDarkWall(x, y, z, scale) {
        const wall = BABYLON.MeshBuilder.CreateBox("darkWall", {width: scale, height: 6, depth: 0.5}, this.scene);
        wall.position = new BABYLON.Vector3(x, y + 3, z);
        
        // Use dark rock material
        if (this.materialLibrary && this.materialLibrary.darkRock) {
            wall.material = this.materialLibrary.darkRock;
        } else {
            const wallMaterial = new BABYLON.PBRMaterial("wallMaterial", this.scene);
            wallMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.15);
            wallMaterial.metallicFactor = 0.2;
            wallMaterial.roughnessFactor = 0.9;
            wall.material = wallMaterial;
        }
        
        // Add to shadow casters safely
        if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
            this.lighting.shadowGenerator.getShadowMap().renderList.push(wall);
        }
    }

    /**
     * Create central dark structure
     */
    async createCentralDarkStructure() {
        // Central platform
        const platform = BABYLON.MeshBuilder.CreateCylinder("centralPlatform", {height: 0.5, diameter: 12}, this.scene);
        platform.position = new BABYLON.Vector3(0, 0.25, 0);
        
        if (this.materialLibrary && this.materialLibrary.darkStructure) {
            platform.material = this.materialLibrary.darkStructure;
        } else {
            const platformMaterial = new BABYLON.PBRMaterial("platformMaterial", this.scene);
            platformMaterial.baseColor = new BABYLON.Color3(0.15, 0.15, 0.2);
            platformMaterial.metallicFactor = 0.4;
            platformMaterial.roughnessFactor = 0.7;
            platform.material = platformMaterial;
        }
        
        // Central pillar
        const centralPillar = BABYLON.MeshBuilder.CreateCylinder("centralPillar", {height: 15, diameter: 2}, this.scene);
        centralPillar.position = new BABYLON.Vector3(0, 7.5, 0);
        
        if (this.materialLibrary && this.materialLibrary.darkRock) {
            centralPillar.material = this.materialLibrary.darkRock;
        } else {
            const pillarMaterial = new BABYLON.PBRMaterial("centralPillarMaterial", this.scene);
            pillarMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.15);
            pillarMaterial.metallicFactor = 0.2;
            pillarMaterial.roughnessFactor = 0.9;
            centralPillar.material = pillarMaterial;
        }
        
        // Add to shadow casters safely
        if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
            this.lighting.shadowGenerator.getShadowMap().renderList.push(platform, centralPillar);
        }
    }

    /**
     * Create atmospheric particles for dark environment
     */
    async createAtmosphericParticles() {
        // Create atmospheric dust particles
        const particleSystem = new BABYLON.ParticleSystem("atmosphericDust", 200, this.scene);
        
        // Particle texture (using a simple sphere)
        particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", this.scene);
        
        // Emitter
        particleSystem.emitter = new BABYLON.Vector3(0, 10, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-20, 0, -20);
        particleSystem.maxEmitBox = new BABYLON.Vector3(20, 0, 20);
        
        // Particle properties
        particleSystem.color1 = new BABYLON.Color4(0.1, 0.1, 0.2, 0.3);
        particleSystem.color2 = new BABYLON.Color4(0.05, 0.05, 0.1, 0.2);
        particleSystem.colorDead = new BABYLON.Color4(0.02, 0.02, 0.05, 0);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        
        particleSystem.minLifeTime = 3;
        particleSystem.maxLifeTime = 6;
        
        particleSystem.emitRate = 10;
        
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        particleSystem.gravity = new BABYLON.Vector3(0, -0.1, 0);
        
        particleSystem.direction1 = new BABYLON.Vector3(-0.1, -0.1, -0.1);
        particleSystem.direction2 = new BABYLON.Vector3(0.1, -0.1, 0.1);
        
        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.3;
        particleSystem.updateSpeed = 0.01;
        
        particleSystem.start();
        
        this.particleSystems.push(particleSystem);
    }

    /**
     * Create dark water effects
     */
    async createDarkWaterEffects() {
        // Dark water pool at the center
        const darkWaterPool = BABYLON.MeshBuilder.CreateCylinder("darkWaterPool", {height: 0.1, diameter: 8}, this.scene);
        darkWaterPool.position = new BABYLON.Vector3(0, 0.05, 0);
        
        if (this.materialLibrary && this.materialLibrary.water) {
            darkWaterPool.material = this.materialLibrary.water;
        } else {
            const darkWaterMaterial = new BABYLON.PBRMaterial("darkWaterMaterial", this.scene);
            darkWaterMaterial.baseColor = new BABYLON.Color3(0.05, 0.1, 0.2);
            darkWaterMaterial.metallicFactor = 0.1;
            darkWaterMaterial.roughnessFactor = 0.2;
            darkWaterMaterial.alpha = 0.6;
            darkWaterMaterial.alphaMode = BABYLON.Engine.ALPHA_BLEND;
            darkWaterPool.material = darkWaterMaterial;
        }
    }

    /**
     * Create professional environment elements inspired by data visualization
     */
    async createProfessionalElements() {
        // Create clean architectural elements
        await this.createCleanStructures();
        
        // Create subtle atmospheric particles
        await this.createSubtleParticles();
        
        // Create professional water effects
        await this.createProfessionalWaterEffects();
    }

    /**
     * Create clean, modern architectural structures
     */
    async createCleanStructures() {
        // Create clean pillars
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x = Math.cos(angle) * 15;
            const z = Math.sin(angle) * 15;
            await this.createCleanPillar(x, 2, z);
        }
        
        // Create clean walls
        await this.createCleanWall(-12, 1, 0, new BABYLON.Vector3(1, 2, 8));
        await this.createCleanWall(12, 1, 0, new BABYLON.Vector3(1, 2, 8));
        await this.createCleanWall(0, 1, -12, new BABYLON.Vector3(8, 2, 1));
        await this.createCleanWall(0, 1, 12, new BABYLON.Vector3(8, 2, 1));
        
        // Create central platform
        await this.createCentralPlatform();
    }

    /**
     * Create a clean, modern pillar
     */
    async createCleanPillar(x, y, z) {
        const pillar = BABYLON.MeshBuilder.CreateCylinder("pillar", {
            height: 4,
            diameter: 0.8
        }, this.scene);
        pillar.position = new BABYLON.Vector3(x, y, z);
        
        if (this.materialLibrary && this.materialLibrary.darkStructure) {
            pillar.material = this.materialLibrary.darkStructure;
        }
        
        // Add to shadow casters
        if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
            this.lighting.shadowGenerator.getShadowMap().renderList.push(pillar);
        }
    }

    /**
     * Create a clean, modern wall
     */
    async createCleanWall(x, y, z, scale) {
        const wall = BABYLON.MeshBuilder.CreateBox("wall", {
            width: scale.x,
            height: scale.y,
            depth: scale.z
        }, this.scene);
        wall.position = new BABYLON.Vector3(x, y, z);
        
        if (this.materialLibrary && this.materialLibrary.darkRock) {
            wall.material = this.materialLibrary.darkRock;
        }
        
        // Add to shadow casters
        if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
            this.lighting.shadowGenerator.getShadowMap().renderList.push(wall);
        }
    }

    /**
     * Create central platform for game focus
     */
    async createCentralPlatform() {
        const platform = BABYLON.MeshBuilder.CreateCylinder("platform", {
            height: 0.2,
            diameter: 12
        }, this.scene);
        platform.position = new BABYLON.Vector3(0, 0.1, 0);
        
        const platformMaterial = new BABYLON.PBRMaterial("platformMaterial", this.scene);
        platformMaterial.baseColor = new BABYLON.Color3(0.25, 0.25, 0.3);
        platformMaterial.metallicFactor = 0.2;
        platformMaterial.roughnessFactor = 0.7;
        platformMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.08);
        platform.material = platformMaterial;
        
        // Add to shadow casters
        if (this.lighting && this.lighting.shadowGenerator && this.lighting.shadowGenerator.getShadowMap()) {
            this.lighting.shadowGenerator.getShadowMap().renderList.push(platform);
        }
    }

    /**
     * Create subtle atmospheric particles
     */
    async createSubtleParticles() {
        const particleSystem = new BABYLON.ParticleSystem("atmosphericParticles", 100, this.scene);
        
        // Subtle particle properties
        particleSystem.emitter = new BABYLON.Vector3(0, 8, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-20, 0, -20);
        particleSystem.maxEmitBox = new BABYLON.Vector3(20, 0, 20);
        
        // Clean particle colors
        particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.9, 0.3);
        particleSystem.color2 = new BABYLON.Color4(0.6, 0.7, 0.8, 0.2);
        particleSystem.colorDead = new BABYLON.Color4(0.4, 0.5, 0.6, 0.0);
        
        // Subtle particle behavior
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        particleSystem.minLifeTime = 3;
        particleSystem.maxLifeTime = 6;
        particleSystem.emitRate = 10; // Reduced for subtlety
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        particleSystem.gravity = new BABYLON.Vector3(0, -0.1, 0);
        
        particleSystem.start();
        this.particleSystems.push(particleSystem);
    }

    /**
     * Create professional water effects
     */
    async createProfessionalWaterEffects() {
        // Create clean water pool
        const waterPool = BABYLON.MeshBuilder.CreateCylinder("waterPool", {
            height: 0.1,
            diameter: 8
        }, this.scene);
        waterPool.position = new BABYLON.Vector3(0, 0.05, 0);
        
        if (this.materialLibrary && this.materialLibrary.water) {
            waterPool.material = this.materialLibrary.water;
        }
    }

    /**
     * Create water particles
     */
    createWaterParticles() {
        try {
            console.log('💧 Creating water particles...');
            
            // Create water particle system without external textures
            const waterParticles = new BABYLON.ParticleSystem("water", 100, this.scene);
            
            // Use simple particle properties without external textures
            waterParticles.minSize = 0.05;
            waterParticles.maxSize = 0.1;
            waterParticles.minLifeTime = 1.0;
            waterParticles.maxLifeTime = 2.0;
            
            // Water colors
            waterParticles.color1 = new BABYLON.Color4(0.2, 0.4, 0.8, 0.8);
            waterParticles.color2 = new BABYLON.Color4(0.1, 0.3, 0.6, 0.6);
            waterParticles.colorDead = new BABYLON.Color4(0.1, 0.2, 0.4, 0.0);
            
            // Emission from waterfall area
            waterParticles.createSphericEmitter(5);
            waterParticles.minEmitPower = 0.2;
            waterParticles.maxEmitPower = 0.5;
            
            // Gravity effect
            waterParticles.gravity = new BABYLON.Vector3(0, -9.81, 0);
            
            // Start the particle system
            waterParticles.start();
            
            console.log('✅ Water particles created');
        } catch (error) {
            console.error('❌ Error creating water particles:', error);
        }
    }

    /**
     * Create enhanced UI with comprehensive game information
     */
    createEnhancedUI() {
        try {
            // Instead of creating Babylon.js GUI, we'll use the HTML UI
            // The HTML UI is already created in the HTML file
            console.log('🎨 Using HTML UI instead of Babylon.js GUI');
            
            // Store reference to HTML UI elements
            this.ui = {
                scoreElement: document.getElementById('currentScore'),
                levelElement: document.getElementById('currentLevel'),
                wordsFoundElement: document.getElementById('wordsFound'),
                comboElement: document.getElementById('comboMultiplier'),
                wordListElement: document.getElementById('wordList'),
                nextLettersElement: document.getElementById('nextLetters')
            };
            
            // Initialize UI with default values
            this.updateGameUI();
            
            console.log('✅ HTML UI initialized successfully');
            
        } catch (error) {
            console.error('❌ Error creating enhanced UI:', error);
        }
    }

    /**
     * Calculate current level based on score
     */
    calculateLevel() {
        if (this.score >= 12500) return 4;
        if (this.score >= 6250) return 3;
        if (this.score >= 3125) return 2;
        return 1;
    }

    /**
     * Calculate combo multiplier based on recent words
     */
    calculateCombo() {
        // Simple combo calculation based on recent words found
        const recentWords = this.foundWords.slice(-3);
        if (recentWords.length >= 3) {
            return Math.min(3, recentWords.length);
        }
        return 1;
    }

    /**
     * Update game UI with current game state
     */
    updateGameUI() {
        if (this.ui) {
            try {
                // Update score and level
                if (this.ui.scoreElement) {
                    this.ui.scoreElement.textContent = this.score.toLocaleString();
                }
                if (this.ui.levelElement) {
                    this.ui.levelElement.textContent = `Niveau ${this.calculateLevel()}`;
                }
                if (this.ui.wordsFoundElement) {
                    this.ui.wordsFoundElement.textContent = `${this.foundWords.length} mots`;
                }
                if (this.ui.comboElement) {
                    this.ui.comboElement.textContent = `Combo: x${this.calculateCombo()}`;
                }
                
                // Update words list
                this.updateWordsList();
                
                // Update next letters
                this.updateNextLetters();
                
            } catch (error) {
                console.warn('⚠️ Error updating game UI:', error);
            }
        }
    }

    updateWordsList() {
        if (this.ui && this.ui.wordListElement) {
            if (this.foundWords.length === 0) {
                this.ui.wordListElement.innerHTML = '<div style="text-align: center; color: #9ca3af; font-style: italic; padding: 20px;">Aucun mot trouvé encore...</div>';
            } else {
                this.ui.wordListElement.innerHTML = this.foundWords.map(word => 
                    `<div class="word-item">
                        <span>${word}</span>
                        <span class="word-score">${this.calculateWordScore(word)} pts</span>
                    </div>`
                ).join('');
            }
        }
    }

    updateNextLetters() {
        if (this.ui && this.ui.nextLettersElement) {
            if (this.letterQueue && this.letterQueue.length > 0) {
                const nextLetters = this.letterQueue.slice(0, 5); // Show next 5 letters
                this.ui.nextLettersElement.innerHTML = nextLetters.map(letter => 
                    `<div class="next-letter-item">${letter}</div>`
                ).join('');
            } else {
                this.ui.nextLettersElement.innerHTML = '<div style="text-align: center; color: #9ca3af; font-style: italic; padding: 20px;">Chargement...</div>';
            }
        }
    }

    generateLetterQueue() {
        // Generate a queue of random letters
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.letterQueue = [];
        
        for (let i = 0; i < 20; i++) { // Generate 20 letters
            const randomIndex = Math.floor(Math.random() * letters.length);
            this.letterQueue.push(letters[randomIndex]);
        }
        
        console.log('📝 Letter queue generated:', this.letterQueue.slice(0, 5));
        
        // Update the next letters display
        this.updateNextLetters();
    }

    getNextLetter() {
        if (this.letterQueue.length > 0) {
            const letter = this.letterQueue.shift();
            
            // Refill queue if getting low
            if (this.letterQueue.length < 10) {
                this.generateLetterQueue();
            }
            
            // Update display
            this.updateNextLetters();
            
            return letter;
        }
        return 'A'; // Fallback
    }

    /**
     * Enhanced word found celebration (duplicate - removed)
     */
    // This method is now handled by the main onWordFound method above

    /**
     * Calculate score for a word
     */
    calculateWordScore(word) {
        const length = word.length;
        let baseScore = 0;
        
        if (length >= 6) baseScore = 1250;
        else if (length === 5) baseScore = 625;
        else if (length === 4) baseScore = 312;
        else baseScore = 125;
        
        // Apply combo multiplier
        const combo = this.calculateCombo();
        return baseScore * combo;
    }

    /**
     * Create enhanced celebration effect
     */
    createEnhancedCelebrationEffect(word, score) {
        try {
            // Create particle system for celebration
            const particleSystem = new BABYLON.ParticleSystem("celebration", 200, this.scene);
            
            // Particle texture
            particleSystem.particleTexture = new BABYLON.Texture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjY0NjdGNjgyNTRCMTFFQ0E1NURGRTY1N0RCMzMyMkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjY0NjdGNjk5NTRCMTFFQ0E1NURGRTY1N0RCMzMyMkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCNjQ2N0Y2NjU1NEIxMUVDQTU1REZFNjU3REIzMzIyQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCNjQ2N0Y2NzU1NEIxMUVDQTU1REZFNjU3REIzMzIyQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAEAAAAALAAAAAAgACAAAAIxhI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6zvf+DwwKh8Si8YhMKicAADs=");
            
            // Emitter
            particleSystem.emitter = new BABYLON.Vector3(0, 5, 0);
            particleSystem.minEmitBox = new BABYLON.Vector3(-2, 0, -2);
            particleSystem.maxEmitBox = new BABYLON.Vector3(2, 0, 2);
            
            // Colors
            particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
            particleSystem.color2 = new BABYLON.Color4(1, 1, 0, 1);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
            
            // Size
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.5;
            
            // Life
            particleSystem.minLifeTime = 0.3;
            particleSystem.maxLifeTime = 1.5;
            
            // Emission rate
            particleSystem.emitRate = 50;
            
            // Blend mode
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            
            // Gravity
            particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
            
            // Direction
            particleSystem.direction1 = new BABYLON.Vector3(-2, 8, -2);
            particleSystem.direction2 = new BABYLON.Vector3(2, 8, 2);
            
            // Angular speed
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = Math.PI;
            
            // Power
            particleSystem.minEmitPower = 1;
            particleSystem.maxEmitPower = 3;
            particleSystem.updateSpeed = 0.005;
            
            // Start the particle system
            particleSystem.start();
            
            // Stop after 2 seconds
            setTimeout(() => {
                particleSystem.stop();
                setTimeout(() => {
                    particleSystem.dispose();
                }, 1000);
            }, 2000);
            
            // Add to particle systems list
            this.particleSystems.push(particleSystem);
            
        } catch (error) {
            console.warn('⚠️ Error creating celebration effect:', error);
        }
    }

    /**
     * Check for level up
     */
    checkLevelUp() {
        const newLevel = this.calculateLevel();
        if (newLevel > this.currentLevel) {
            this.currentLevel = newLevel;
            this.onLevelUp(newLevel);
        }
    }

    /**
     * Handle level up
     */
    onLevelUp(level) {
        console.log(`🎊 Level up! Now at level ${level}`);
        
        // Create level up effect
        this.createLevelUpEffect();
        
        // Update game difficulty
        this.updateGameDifficulty(level);
    }

    /**
     * Create level up effect
     */
    createLevelUpEffect() {
        try {
            // Create a bright flash effect
            const flashMaterial = new BABYLON.StandardMaterial("flash", this.scene);
            flashMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
            flashMaterial.alpha = 0.8;
            
            const flashPlane = BABYLON.MeshBuilder.CreatePlane("flash", { width: 20, height: 20 }, this.scene);
            flashPlane.material = flashMaterial;
            flashPlane.position = new BABYLON.Vector3(0, 5, 0);
            flashPlane.rotation.x = Math.PI / 2;
            
            // Animate the flash
            const flashAnimation = new BABYLON.Animation("flashAnimation", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            
            const keyFrames = [];
            keyFrames.push({ frame: 0, value: 0.8 });
            keyFrames.push({ frame: 15, value: 0.2 });
            keyFrames.push({ frame: 30, value: 0 });
            
            flashAnimation.setKeys(keyFrames);
            flashPlane.animations.push(flashAnimation);
            
            this.scene.beginAnimation(flashPlane, 0, 30, false, 1.0, () => {
                flashPlane.dispose();
            });
            
        } catch (error) {
            console.warn('⚠️ Error creating level up effect:', error);
        }
    }

    /**
     * Update game difficulty based on level
     */
    updateGameDifficulty(level) {
        // Adjust letter falling speed
        this.letterFallSpeed = Math.min(2 + (level * 0.5), 5);
        
        // Adjust letter spawn rate
        this.letterSpawnRate = Math.max(2000 - (level * 200), 500);
        
        console.log(`⚡ Difficulty updated for level ${level}: Speed=${this.letterFallSpeed}, Spawn=${this.letterSpawnRate}ms`);
    }

    /**
     * Update game logic each frame (duplicate - removed)
     */
    // This method is now handled by the main updateGame method above
}

/**
 * Enhanced Babylon.js Game Manager
 * Manages the overall game state and interactions
 */
class BabylonGameManager {
    constructor() {
        this.game3D = null;
        this.isInitialized = false;
        this.gridLayoutMode = '3D';
        
        console.log('🎮 Babylon Game Manager created');
    }

    /**
     * Initialize the game
     */
    async initializeGame() {
        try {
            const canvas = document.getElementById('babylonCanvas');
            if (!canvas) {
                throw new Error('Canvas not found');
            }
            
            this.game3D = new BabylonEnhancedGame();
            await this.game3D.init(canvas);
            
            this.isInitialized = true;
            
            console.log('✅ Babylon Game Manager initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Babylon Game Manager:', error);
            throw error;
        }
    }

    /**
     * Switch grid layout mode
     */
    switchGridLayoutMode(mode) {
        if (this.game3D) {
            this.game3D.switchGridLayout(mode);
            this.gridLayoutMode = mode;
        }
    }

    /**
     * Update display
     */
    updateDisplay() {
        if (this.game3D) {
            this.game3D.updateGameUI();
        }
    }

    /**
     * Generate letter queue
     */
    generateLetterQueue() {
        if (this.game3D) {
            this.game3D.generateLetterQueue();
        }
    }

    /**
     * Update 3D UI
     */
    update3DUI() {
        if (this.game3D) {
            this.game3D.updateGameUI();
        }
    }

    /**
     * Dispose resources
     */
    dispose() {
        if (this.game3D) {
            this.game3D.dispose();
        }
        this.isInitialized = false;
        
        console.log('🧹 Babylon Game Manager disposed');
    }
}

// Global functions for compatibility
window.BabylonEnhancedGame = BabylonEnhancedGame;
window.BabylonGameManager = BabylonGameManager;

console.log('🌊 Enhanced Babylon.js Game Engine loaded successfully');