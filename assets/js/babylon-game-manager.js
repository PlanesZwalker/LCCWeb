// Babylon.js Game Manager - Enhanced 3D Game with Fluid Rendering
// Integrates with existing game structure for enhanced visual quality
// Version: 1.0.0 - Babylon.js Integration

class BabylonGameManager {
    constructor() {
        console.log('🎮 Initializing Babylon.js Game Manager...');
        
        // Babylon.js core components
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.canvas = null;
        
        // Game state
        this.isInitialized = false;
        this.gridLayoutMode = '2D';
        
        // Game data
        this.stats = {
            score: 0,
            level: 1,
            combo: 0,
            wordsFound: 0
        };
        
        this.targetWords = ['CHAT', 'MAISON', 'JARDIN', 'PORTE', 'MUSIQUE'];
        this.completedWords = new Set();
        this.letterQueue = [];
        
        // Babylon.js specific components
        this.fluidRenderer = null;
        this.particleSystems = [];
        this.environmentElements = [];
        this.gridContainer = null;
        this.uiContainer = null;
        
        // Ground level coordination
        this.groundLevel = 0;
        this.gridLevel = 2;
    }
    
    async initializeGame() {
        console.log('🎮 Initializing Babylon.js game...');
        
        try {
            // Get the canvas
            this.canvas = document.getElementById('threejsCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Initialize Babylon.js engine
            this.engine = new BABYLON.Engine(this.canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true
            });
            
            // Create scene
            this.scene = new BABYLON.Scene(this.engine);
            
            // Set up scene
            this.setupScene();
            this.setupLighting();
            this.setupCamera();
            this.setupFluidRenderer();
            this.createEnvironment();
            this.createGrid();
            this.createUI();
            
            // Start rendering
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                this.engine.resize();
            });
            
            this.isInitialized = true;
            this.generateLetterQueue();
            this.updateDisplay();
            
            console.log('✅ Babylon.js game initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Babylon.js game:', error);
            alert('Erreur lors de l\'initialisation du jeu Babylon.js. Veuillez réessayer.');
        }
    }
    
    setupScene() {
        // Set scene background
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.4, 1);
        
        // Enable shadows
        this.scene.shadowsEnabled = true;
        
        // Add fog for depth
        this.scene.fog = new BABYLON.FogExp2('#87CEEB', 0.02);
        
        // Enable physics
        this.scene.enablePhysics();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.groundColor = new BABYLON.Color3(0.2, 0.3, 0.4);
        
        // Directional light (sun)
        const sunLight = new BABYLON.DirectionalLight(
            'sunLight',
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        sunLight.intensity = 0.8;
        sunLight.position = new BABYLON.Vector3(20, 40, 20);
        
        // Enable shadows
        sunLight.shadowMinZ = 1;
        sunLight.shadowMaxZ = 50;
        sunLight.shadowOrthoScale = 0.1;
        sunLight.shadowGenerator = new BABYLON.ShadowGenerator(1024, sunLight);
    }
    
    setupCamera() {
        // Create camera
        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            0,
            Math.PI / 3,
            20,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        
        // Set camera limits
        this.camera.lowerRadiusLimit = 5;
        this.camera.upperRadiusLimit = 50;
        this.camera.lowerAlphaLimit = -Math.PI / 2;
        this.camera.upperAlphaLimit = Math.PI / 2;
        
        // Attach camera to canvas
        this.camera.attachControl(this.canvas, true);
        
        // Set initial position
        this.camera.setPosition(new BABYLON.Vector3(0, 15, 20));
        this.camera.setTarget(BABYLON.Vector3.Zero());
    }
    
    setupFluidRenderer() {
        // Initialize fluid renderer for enhanced water effects
        this.fluidRenderer = new BABYLON.FluidRenderer(this.scene);
        
        // Configure fluid renderer
        this.fluidRenderer.setSize(512, 512);
        this.fluidRenderer.enableBlurDepthPrePass = true;
        this.fluidRenderer.useDiffuse = true;
        this.fluidRenderer.useDiffuseRgb = true;
        this.fluidRenderer.useNormals = true;
        this.fluidRenderer.useMotionBlur = true;
        this.fluidRenderer.useRefraction = true;
        this.fluidRenderer.useReflection = true;
        this.fluidRenderer.useSpecular = true;
        this.fluidRenderer.useThickness = true;
        this.fluidRenderer.useVelocity = true;
        
        console.log('🌊 Fluid renderer initialized');
    }
    
    createEnvironment() {
        // Create ground plane
        const ground = BABYLON.MeshBuilder.CreateGround(
            'ground',
            { width: 50, height: 50 },
            this.scene
        );
        ground.position.y = this.groundLevel - 0.01;
        
        const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.1);
        groundMaterial.alpha = 0.3;
        ground.material = groundMaterial;
        
        // Create trees
        this.createTrees();
        
        // Create rocks
        this.createRocks();
        
        // Create water environment with fluid rendering
        this.createWaterEnvironment();
        
        // Create atmospheric particles
        this.createAtmosphericParticles();
    }
    
    createTrees() {
        const treePositions = [
            { x: -18, z: -8, size: 1.2 },
            { x: 18, z: -8, size: 1.1 },
            { x: -15, z: 10, size: 1.0 },
            { x: 15, z: 10, size: 1.0 },
            { x: -10, z: -15, size: 1.3 },
            { x: 10, z: -15, size: 1.3 },
            { x: -5, z: 15, size: 0.9 },
            { x: 5, z: 15, size: 0.9 }
        ];
        
        treePositions.forEach((pos, index) => {
            this.createTree(pos.x, pos.z, pos.size);
        });
    }
    
    createTree(x, z, size = 1.0) {
        const tree = new BABYLON.TransformNode('tree', this.scene);
        tree.position = new BABYLON.Vector3(x, this.groundLevel, z);
        
        // Tree trunk with fluid interaction
        const trunkHeight = 4.5 * size;
        const trunkRadius = 0.35 * size;
        const trunk = BABYLON.MeshBuilder.CreateCylinder(
            'trunk',
            { height: trunkHeight, diameter: trunkRadius * 2 },
            this.scene
        );
        trunk.position.y = trunkHeight / 2;
        
        const trunkMaterial = new BABYLON.StandardMaterial('trunkMaterial', this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.55, 0.27, 0.07);
        trunkMaterial.shininess = 30;
        trunkMaterial.alpha = 0.9;
        trunk.material = trunkMaterial;
        trunk.parent = tree;
        
        // Add fluid renderer to trunk for water interaction
        this.fluidRenderer.addFluid(trunk);
        
        // Tree foliage with enhanced fluid effects
        const foliagePositions = [
            { y: trunkHeight + 0.5, scale: 1.8 * size, color: new BABYLON.Color3(0.13, 0.55, 0.13) },
            { y: trunkHeight + 1.5, scale: 1.5 * size, color: new BABYLON.Color3(0.20, 0.80, 0.20) },
            { y: trunkHeight + 2.2, scale: 1.3 * size, color: new BABYLON.Color3(0.56, 0.93, 0.56) },
            { y: trunkHeight + 2.8, scale: 1.0 * size, color: new BABYLON.Color3(0.49, 0.99, 0.00) },
            { y: trunkHeight + 3.2, scale: 0.8 * size, color: new BABYLON.Color3(0.13, 0.55, 0.13) }
        ];
        
        foliagePositions.forEach((pos, index) => {
            const foliage = BABYLON.MeshBuilder.CreateSphere(
                'foliage',
                { diameter: 2.4 * size },
                this.scene
            );
            foliage.position.y = pos.y;
            foliage.scaling = new BABYLON.Vector3(pos.scale, pos.scale, pos.scale);
            
            const foliageMaterial = new BABYLON.StandardMaterial('foliageMaterial', this.scene);
            foliageMaterial.diffuseColor = pos.color;
            foliageMaterial.alpha = 0.95;
            foliageMaterial.shininess = 20;
            foliage.material = foliageMaterial;
            foliage.parent = tree;
            
            // Add fluid renderer to foliage for water droplet effects
            this.fluidRenderer.addFluid(foliage);
        });
        
        // Create water droplet particles for tree
        this.createTreeWaterDroplets(tree, size);
        
        this.environmentElements.push(tree);
    }
    
    createRocks() {
        const rockPositions = [
            { x: -6, z: -4, size: 0.8 },
            { x: 6, z: -4, size: 0.8 },
            { x: -4, z: 6, size: 0.6 },
            { x: 4, z: 6, size: 0.6 },
            { x: -12, z: -2, size: 1.0 },
            { x: 12, z: -2, size: 1.0 }
        ];
        
        rockPositions.forEach((pos, index) => {
            this.createRock(pos.x, pos.z, pos.size);
        });
    }
    
    createRock(x, z, size = 1.0) {
        const rock = BABYLON.MeshBuilder.CreateIcoSphere(
            'rock',
            { radius: 1.0 * size, subdivisions: 1 },
            this.scene
        );
        rock.position = new BABYLON.Vector3(x, this.groundLevel + (size * 0.5), z);
        rock.rotation = new BABYLON.Vector3(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        const rockMaterial = new BABYLON.StandardMaterial('rockMaterial', this.scene);
        rockMaterial.diffuseColor = new BABYLON.Color3(0.41, 0.41, 0.41);
        rockMaterial.alpha = 0.9;
        rockMaterial.shininess = 40;
        rock.material = rockMaterial;
        
        // Add fluid renderer to rock for water interaction
        this.fluidRenderer.addFluid(rock);
        
        // Create water splash particles for rock
        this.createRockWaterSplash(rock, size);
        
        this.environmentElements.push(rock);
    }
    
    createWaterEnvironment() {
        // Create water pool with fluid rendering
        const poolRadius = 4;
        const poolDepth = 1;
        
        const pool = BABYLON.MeshBuilder.CreateCylinder(
            'pool',
            { height: poolDepth, diameter: poolRadius * 2 },
            this.scene
        );
        pool.position = new BABYLON.Vector3(0, (this.groundLevel - 9.5), -8);
        
        const poolMaterial = new BABYLON.StandardMaterial('poolMaterial', this.scene);
        poolMaterial.diffuseColor = new BABYLON.Color3(0.01, 0.47, 0.74);
        poolMaterial.alpha = 0.7;
        poolMaterial.shininess = 80;
        pool.material = poolMaterial;
        
        // Add fluid renderer to pool
        this.fluidRenderer.addFluid(pool);
        
        // Create river with fluid rendering
        this.createRiver();
        
        // Create waterfall with particle system
        this.createWaterfall();
    }
    
    createRiver() {
        const riverLength = 25;
        const riverWidth = 8;
        const groundLevel = this.groundLevel;
        
        // River bed
        const river = BABYLON.MeshBuilder.CreateBox(
            'river',
            { width: riverWidth, height: 0.5, depth: riverLength },
            this.scene
        );
        river.position = new BABYLON.Vector3(0, groundLevel - 10.5, -15);
        
        const riverMaterial = new BABYLON.StandardMaterial('riverMaterial', this.scene);
        riverMaterial.diffuseColor = new BABYLON.Color3(0.01, 0.34, 0.61);
        riverMaterial.alpha = 0.8;
        river.material = riverMaterial;
        
        // River surface with fluid rendering
        const surface = BABYLON.MeshBuilder.CreatePlane(
            'riverSurface',
            { width: riverWidth, height: riverLength },
            this.scene
        );
        surface.position = new BABYLON.Vector3(0, groundLevel - 10.3, -15);
        surface.rotation.x = -Math.PI / 2;
        
        const surfaceMaterial = new BABYLON.StandardMaterial('surfaceMaterial', this.scene);
        surfaceMaterial.diffuseColor = new BABYLON.Color3(0.01, 0.61, 0.90);
        surfaceMaterial.alpha = 0.7;
        surfaceMaterial.shininess = 120;
        surface.material = surfaceMaterial;
        
        // Add fluid renderer to river
        this.fluidRenderer.addFluid(surface);
        
        // Create river particles
        this.createRiverParticles();
    }
    
    createRiverParticles() {
        const particleSystem = new BABYLON.ParticleSystem('riverParticles', 120, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        particleSystem.emitter = new BABYLON.Vector3(0, this.groundLevel - 10.2, -10);
        particleSystem.minEmitBox = new BABYLON.Vector3(-4, 0, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(4, 0, 0);
        
        particleSystem.color1 = new BABYLON.Color4(0.31, 0.76, 0.97, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.31, 0.76, 0.97, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.31, 0.76, 0.97, 0.0);
        
        particleSystem.minSize = 0.03;
        particleSystem.maxSize = 0.03;
        
        particleSystem.minLifeTime = 2.0;
        particleSystem.maxLifeTime = 3.0;
        
        particleSystem.emitRate = 40;
        
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        particleSystem.gravity = new BABYLON.Vector3(0, 0, -0.03);
        
        particleSystem.direction1 = new BABYLON.Vector3(0, 0, -1);
        particleSystem.direction2 = new BABYLON.Vector3(0, 0, -1);
        
        particleSystem.minEmitPower = 0.03;
        particleSystem.maxEmitPower = 0.05;
        particleSystem.updateSpeed = 0.016;
        
        particleSystem.start();
        this.particleSystems.push(particleSystem);
    }
    
    createWaterfall() {
        const waterfallWidth = 20;
        const waterfallHeight = 50;
        
        const waterfall = BABYLON.MeshBuilder.CreatePlane(
            'waterfall',
            { width: waterfallWidth, height: waterfallHeight },
            this.scene
        );
        waterfall.position = new BABYLON.Vector3(0, waterfallHeight / 2, -10);
        
        const waterfallMaterial = new BABYLON.StandardMaterial('waterfallMaterial', this.scene);
        waterfallMaterial.diffuseColor = new BABYLON.Color3(0.16, 0.71, 0.96);
        waterfallMaterial.alpha = 0.9;
        waterfallMaterial.shininess = 200;
        waterfall.material = waterfallMaterial;
        
        // Add fluid renderer to waterfall
        this.fluidRenderer.addFluid(waterfall);
        
        // Create waterfall particles
        this.createWaterfallParticles();
    }
    
    createWaterfallParticles() {
        const particleSystem = new BABYLON.ParticleSystem('waterfallParticles', 300, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        particleSystem.emitter = new BABYLON.Vector3(0, 25, -10);
        particleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 0);
        
        particleSystem.color1 = new BABYLON.Color4(0.31, 0.76, 0.97, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.31, 0.76, 0.97, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.31, 0.76, 0.97, 0.0);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.1;
        
        particleSystem.minLifeTime = 1.0;
        particleSystem.maxLifeTime = 2.0;
        
        particleSystem.emitRate = 150;
        
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        particleSystem.gravity = new BABYLON.Vector3(0, -0.025, 0);
        
        particleSystem.direction1 = new BABYLON.Vector3(-0.1, -1, 0);
        particleSystem.direction2 = new BABYLON.Vector3(0.1, -1, 0);
        
        particleSystem.minEmitPower = 0.025;
        particleSystem.maxEmitPower = 0.05;
        particleSystem.updateSpeed = 0.016;
        
        particleSystem.start();
        this.particleSystems.push(particleSystem);
    }
    
    createAtmosphericParticles() {
        // Create falling leaves
        const leafSystem = new BABYLON.ParticleSystem('leafParticles', 50, this.scene);
        
        leafSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        leafSystem.emitter = new BABYLON.Vector3(0, 15, 0);
        leafSystem.minEmitBox = new BABYLON.Vector3(-20, 0, -20);
        leafSystem.maxEmitBox = new BABYLON.Vector3(20, 0, 20);
        
        leafSystem.color1 = new BABYLON.Color4(0.8, 0.6, 0.2, 1.0);
        leafSystem.color2 = new BABYLON.Color4(0.6, 0.4, 0.1, 1.0);
        leafSystem.colorDead = new BABYLON.Color4(0.8, 0.6, 0.2, 0.0);
        
        leafSystem.minSize = 0.1;
        leafSystem.maxSize = 0.2;
        
        leafSystem.minLifeTime = 5.0;
        leafSystem.maxLifeTime = 8.0;
        
        leafSystem.emitRate = 10;
        
        leafSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        leafSystem.gravity = new BABYLON.Vector3(0, -0.02, 0);
        
        leafSystem.direction1 = new BABYLON.Vector3(-0.1, -1, -0.1);
        leafSystem.direction2 = new BABYLON.Vector3(0.1, -1, 0.1);
        
        leafSystem.minEmitPower = 0.01;
        leafSystem.maxEmitPower = 0.02;
        leafSystem.updateSpeed = 0.016;
        
        leafSystem.start();
        this.particleSystems.push(leafSystem);
    }
    
    createTreeWaterDroplets(tree, size) {
        // Create water droplet particles for trees
        const dropletSystem = new BABYLON.ParticleSystem('treeDroplets', 30, this.scene);
        
        dropletSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // Position emitter at tree foliage level
        dropletSystem.emitter = new BABYLON.Vector3(
            tree.position.x,
            tree.position.y + 4.5 * size + 2,
            tree.position.z
        );
        dropletSystem.minEmitBox = new BABYLON.Vector3(-1 * size, 0, -1 * size);
        dropletSystem.maxEmitBox = new BABYLON.Vector3(1 * size, 0, 1 * size);
        
        dropletSystem.color1 = new BABYLON.Color4(0.31, 0.76, 0.97, 0.8);
        dropletSystem.color2 = new BABYLON.Color4(0.31, 0.76, 0.97, 0.6);
        dropletSystem.colorDead = new BABYLON.Color4(0.31, 0.76, 0.97, 0.0);
        
        dropletSystem.minSize = 0.02;
        dropletSystem.maxSize = 0.04;
        
        dropletSystem.minLifeTime = 2.0;
        dropletSystem.maxLifeTime = 3.5;
        
        dropletSystem.emitRate = 8;
        
        dropletSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        dropletSystem.gravity = new BABYLON.Vector3(0, -0.015, 0);
        
        dropletSystem.direction1 = new BABYLON.Vector3(-0.05, -1, -0.05);
        dropletSystem.direction2 = new BABYLON.Vector3(0.05, -1, 0.05);
        
        dropletSystem.minEmitPower = 0.01;
        dropletSystem.maxEmitPower = 0.02;
        dropletSystem.updateSpeed = 0.016;
        
        dropletSystem.start();
        this.particleSystems.push(dropletSystem);
    }
    
    createRockWaterSplash(rock, size) {
        // Create water splash particles for rocks
        const splashSystem = new BABYLON.ParticleSystem('rockSplash', 20, this.scene);
        
        splashSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // Position emitter at rock position
        splashSystem.emitter = new BABYLON.Vector3(
            rock.position.x,
            rock.position.y + size * 0.5,
            rock.position.z
        );
        splashSystem.minEmitBox = new BABYLON.Vector3(-0.5 * size, 0, -0.5 * size);
        splashSystem.maxEmitBox = new BABYLON.Vector3(0.5 * size, 0, 0.5 * size);
        
        splashSystem.color1 = new BABYLON.Color4(0.31, 0.76, 0.97, 0.9);
        splashSystem.color2 = new BABYLON.Color4(0.31, 0.76, 0.97, 0.7);
        splashSystem.colorDead = new BABYLON.Color4(0.31, 0.76, 0.97, 0.0);
        
        splashSystem.minSize = 0.03;
        splashSystem.maxSize = 0.06;
        
        splashSystem.minLifeTime = 1.5;
        splashSystem.maxLifeTime = 2.5;
        
        splashSystem.emitRate = 5;
        
        splashSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        splashSystem.gravity = new BABYLON.Vector3(0, -0.02, 0);
        
        splashSystem.direction1 = new BABYLON.Vector3(-0.1, 0.5, -0.1);
        splashSystem.direction2 = new BABYLON.Vector3(0.1, 0.5, 0.1);
        
        splashSystem.minEmitPower = 0.02;
        splashSystem.maxEmitPower = 0.04;
        splashSystem.updateSpeed = 0.016;
        
        splashSystem.start();
        this.particleSystems.push(splashSystem);
    }
    
    createGrid() {
        this.gridContainer = new BABYLON.TransformNode('gridContainer', this.scene);
        
        if (this.gridLayoutMode === '2D') {
            this.create2DGrid();
        } else {
            this.create3DGrid();
        }
    }
    
    create2DGrid() {
        const gridSize = 8;
        const cellSize = 1.5;
        const totalSize = gridSize * cellSize;
        
        // Create grid plane
        const gridPlane = BABYLON.MeshBuilder.CreatePlane(
            'gridPlane',
            { width: totalSize, height: totalSize },
            this.scene
        );
        gridPlane.position = new BABYLON.Vector3(-totalSize / 2, this.gridLevel, -8);
        gridPlane.rotation.x = -Math.PI / 2;
        
        const gridMaterial = new BABYLON.StandardMaterial('gridMaterial', this.scene);
        gridMaterial.diffuseColor = new BABYLON.Color3(0.18, 0.22, 0.29);
        gridMaterial.alpha = 0.6;
        gridMaterial.emissiveColor = new BABYLON.Color3(0.10, 0.13, 0.18);
        gridMaterial.emissiveIntensity = 0.1;
        gridPlane.material = gridMaterial;
        
        gridPlane.parent = this.gridContainer;
        
        // Create grid lines
        this.createGridLines2D();
    }
    
    create3DGrid() {
        const gridSize = 8;
        const cellSize = 1.5;
        const gridDepth = 3;
        
        // Create multiple layers
        for (let depth = 0; depth < gridDepth; depth++) {
            const gridPlane = BABYLON.MeshBuilder.CreatePlane(
                'gridPlane',
                { width: gridSize * cellSize, height: gridSize * cellSize },
                this.scene
            );
            gridPlane.position = new BABYLON.Vector3(
                -(gridSize * cellSize) / 2,
                this.gridLevel + depth * cellSize * 0.5,
                -8 + depth * cellSize * 0.3
            );
            gridPlane.rotation.x = -Math.PI / 2;
            
            const gridMaterial = new BABYLON.StandardMaterial('gridMaterial', this.scene);
            gridMaterial.diffuseColor = new BABYLON.Color3(0.18, 0.22, 0.29);
            gridMaterial.alpha = 0.6 - (depth * 0.1);
            gridMaterial.emissiveColor = new BABYLON.Color3(0.10, 0.13, 0.18);
            gridMaterial.emissiveIntensity = 0.1 - (depth * 0.02);
            gridPlane.material = gridMaterial;
            
            gridPlane.parent = this.gridContainer;
        }
        
        // Create grid lines
        this.createGridLines3D();
    }
    
    createGridLines2D() {
        const gridSize = 8;
        const cellSize = 1.5;
        const totalSize = gridSize * cellSize;
        
        // Create grid lines
        for (let i = 0; i <= gridSize; i++) {
            // Vertical lines
            const vLine = BABYLON.MeshBuilder.CreateLines(
                'vLine',
                {
                    points: [
                        new BABYLON.Vector3(-totalSize / 2 + i * cellSize, this.gridLevel + 0.02, -8 - totalSize / 2),
                        new BABYLON.Vector3(-totalSize / 2 + i * cellSize, this.gridLevel + 0.02, -8 + totalSize / 2)
                    ]
                },
                this.scene
            );
            vLine.color = new BABYLON.Color3(1, 1, 1);
            vLine.parent = this.gridContainer;
            
            // Horizontal lines
            const hLine = BABYLON.MeshBuilder.CreateLines(
                'hLine',
                {
                    points: [
                        new BABYLON.Vector3(-totalSize / 2 - totalSize / 2, this.gridLevel + 0.02, -8 + i * cellSize),
                        new BABYLON.Vector3(-totalSize / 2 + totalSize / 2, this.gridLevel + 0.02, -8 + i * cellSize)
                    ]
                },
                this.scene
            );
            hLine.color = new BABYLON.Color3(1, 1, 1);
            hLine.parent = this.gridContainer;
        }
    }
    
    createGridLines3D() {
        const gridSize = 8;
        const cellSize = 1.5;
        const gridDepth = 3;
        
        for (let depth = 0; depth < gridDepth; depth++) {
            for (let i = 0; i <= gridSize; i++) {
                // Vertical lines
                const vLine = BABYLON.MeshBuilder.CreateLines(
                    'vLine3D',
                    {
                        points: [
                            new BABYLON.Vector3(-(gridSize * cellSize) / 2 + i * cellSize, this.gridLevel + depth * cellSize * 0.5, -8 + depth * cellSize * 0.3 - (gridSize * cellSize) / 2),
                            new BABYLON.Vector3(-(gridSize * cellSize) / 2 + i * cellSize, this.gridLevel + depth * cellSize * 0.5, -8 + depth * cellSize * 0.3 + (gridSize * cellSize) / 2)
                        ]
                    },
                    this.scene
                );
                vLine.color = new BABYLON.Color3(1, 1, 1);
                vLine.parent = this.gridContainer;
                
                // Horizontal lines
                const hLine = BABYLON.MeshBuilder.CreateLines(
                    'hLine3D',
                    {
                        points: [
                            new BABYLON.Vector3(-(gridSize * cellSize) / 2 - (gridSize * cellSize) / 2, this.gridLevel + depth * cellSize * 0.5, -8 + depth * cellSize * 0.3 + i * cellSize),
                            new BABYLON.Vector3(-(gridSize * cellSize) / 2 + (gridSize * cellSize) / 2, this.gridLevel + depth * cellSize * 0.5, -8 + depth * cellSize * 0.3 + i * cellSize)
                        ]
                    },
                    this.scene
                );
                hLine.color = new BABYLON.Color3(1, 1, 1);
                hLine.parent = this.gridContainer;
            }
        }
    }
    
    createUI() {
        this.uiContainer = new BABYLON.TransformNode('uiContainer', this.scene);
        
        // Create 3D UI elements
        this.create3DLetterQueue();
        this.create3DWordList();
        this.create3DStats();
        this.create3DControls();
    }
    
    create3DLetterQueue() {
        // Create letter queue display
        const queuePanel = BABYLON.MeshBuilder.CreatePlane(
            'queuePanel',
            { width: 8, height: 4 },
            this.scene
        );
        queuePanel.position = new BABYLON.Vector3(12, 8, 0);
        queuePanel.rotation.y = -Math.PI / 6;
        
        const panelMaterial = new BABYLON.StandardMaterial('queuePanelMaterial', this.scene);
        panelMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        panelMaterial.alpha = 0.8;
        queuePanel.material = panelMaterial;
        
        queuePanel.parent = this.uiContainer;
    }
    
    create3DWordList() {
        // Create word list display
        const wordPanel = BABYLON.MeshBuilder.CreatePlane(
            'wordPanel',
            { width: 8, height: 6 },
            this.scene
        );
        wordPanel.position = new BABYLON.Vector3(-12, 8, 0);
        wordPanel.rotation.y = Math.PI / 6;
        
        const panelMaterial = new BABYLON.StandardMaterial('wordPanelMaterial', this.scene);
        panelMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.1);
        panelMaterial.alpha = 0.8;
        wordPanel.material = panelMaterial;
        
        wordPanel.parent = this.uiContainer;
    }
    
    create3DStats() {
        // Create stats display
        const statsPanel = BABYLON.MeshBuilder.CreatePlane(
            'statsPanel',
            { width: 10, height: 3 },
            this.scene
        );
        statsPanel.position = new BABYLON.Vector3(0, -8, 0);
        
        const panelMaterial = new BABYLON.StandardMaterial('statsPanelMaterial', this.scene);
        panelMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.1, 0.1);
        panelMaterial.alpha = 0.8;
        statsPanel.material = panelMaterial;
        
        statsPanel.parent = this.uiContainer;
    }
    
    create3DControls() {
        // Create game controls
        const controlsPanel = BABYLON.MeshBuilder.CreatePlane(
            'controlsPanel',
            { width: 6, height: 2 },
            this.scene
        );
        controlsPanel.position = new BABYLON.Vector3(8, -8, 0);
        
        const panelMaterial = new BABYLON.StandardMaterial('controlsPanelMaterial', this.scene);
        panelMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        panelMaterial.alpha = 0.8;
        controlsPanel.material = panelMaterial;
        
        controlsPanel.parent = this.uiContainer;
    }
    
    // Game management methods
    switchGridLayoutMode(mode) {
        if (!this.isInitialized) {
            console.warn('⚠️ Game not initialized, cannot switch grid layout');
            return;
        }
        
        console.log(`🔄 Switching grid layout from ${this.gridLayoutMode} to ${mode}...`);
        
        if (mode === this.gridLayoutMode) {
            console.log('Already in this grid layout mode');
            return;
        }
        
        this.gridLayoutMode = mode;
        
        // Clear existing grid
        if (this.gridContainer) {
            this.gridContainer.dispose();
        }
        
        // Create new grid
        this.createGrid();
        
        console.log(`✅ Switched to ${mode} grid layout`);
    }
    
    generateLetterQueue() {
        this.letterQueue = [];
        for (let i = 0; i < 7; i++) {
            this.letterQueue.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
        }
    }
    
    updateDisplay() {
        // Update game display
        console.log('📊 Game stats updated');
    }
    
    // Cleanup method
    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
        
        this.particleSystems.forEach(system => {
            system.dispose();
        });
        
        this.environmentElements.forEach(element => {
            element.dispose();
        });
        
        console.log('🧹 Babylon.js game disposed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BabylonGameManager };
} 