// Enhanced Game3D Class with Grid Layout Modes
// Always uses Three.js rendering with 2D/3D grid layouts
// Version: 1.3.0 - Enhanced 3D UI with animations and better styling

// Make Enhanced3DGame an alias for Game3D with enhanced features
class Enhanced3DGame extends Game3D {
    constructor() {
        super();
        
        // Grid Layout Configuration
        this.gridLayoutMode = '2D'; // '2D' = flat plane, '3D' = volumetric
        this.gridLayoutEnabled = false;
        
        // 3D Grid specific properties
        this.gridDepth = 3; // Depth for 3D grid mode
        this.maxGridDepth = 5; // Maximum depth for 3D mode
        
        // Grid visual containers
        this.gridContainer = null;
        this.gridPlanes = []; // For 2D mode - multiple planes
        this.gridCubes = []; // For 3D mode - cubic arrangement
        this.textMeshes = []; // For letter text meshes
        
        // FBX Models for letters
        this.fbxModels = {}; // Cache for loaded FBX models
        this.fbxLoader = null; // FBX loader instance
        this.modelsLoaded = false; // Track if all models are loaded
        
        // Falling letter system
        this.fallingLetterSystemActive = false;
        this.fallingLetter = null;
        this.fallingLetterMesh = null;
        
        // 3D UI Elements
        this.letterQueueMeshes = []; // 3D letter queue display
        this.wordListMeshes = []; // 3D word list display
        this.uiContainer = null; // Container for 3D UI elements
        
        // Camera configurations for different modes - Optimized for maximum space
        this.cameraConfigs = {
            '2D': {
                position: { x: 0, y: 4, z: 8 },
                lookAt: { x: 0, y: 0, z: 0 },
                fov: 70
            },
            '3D': {
                position: { x: 8, y: 8, z: 8 },
                lookAt: { x: 0, y: 0, z: 0 },
                fov: 85
            }
        };
        
        // Enhanced camera controls
        this.cameraControls = {
            enabled: true,
            rotationSpeed: 0.005, // Reduced for more precise rotation
            zoomSpeed: 0.05, // Reduced for more precise zoom
            panSpeed: 0.2, // Reduced for more precise panning
            minDistance: 3,
            maxDistance: 50,
            isDragging: false,
            previousMousePosition: { x: 0, y: 0 },
            cameraModes: {
                'top': { position: { x: 0, y: 12, z: 0 }, lookAt: { x: 0, y: 0, z: 0 }, fov: 70 },
                'front': { position: { x: 0, y: 0, z: 12 }, lookAt: { x: 0, y: 0, z: 0 }, fov: 70 },
                'side': { position: { x: 12, y: 0, z: 0 }, lookAt: { x: 0, y: 0, z: 0 }, fov: 70 },
                'isometric': { position: { x: 10, y: 10, z: 10 }, lookAt: { x: 0, y: 0, z: 0 }, fov: 85 },
                'close': { position: { x: 0, y: 3, z: 5 }, lookAt: { x: 0, y: 0, z: 0 }, fov: 90 },
                'far': { position: { x: 0, y: 10, z: 18 }, lookAt: { x: 0, y: 0, z: 0 }, fov: 55 }
            }
        };
        
        console.log('🎮 Enhanced3DGame initialized with grid layout support and 3D UI elements');
        
        // Initialize FBX loader
        this.initFBXLoader();
    }
    
    initFBXLoader() {
        console.log('📦 Initializing FBX loader...');
        
        // Create FBX loader
        this.fbxLoader = new THREE.FBXLoader();
        
        // Load all letter models
        this.loadAllFBXModels();
    }
    
    loadAllFBXModels() {
        console.log('🔄 Loading FBX models for all letters...');
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        let loadedCount = 0;
        const totalModels = letters.length;
        
        letters.forEach(letter => {
            const modelPath = `assets/models/letter-${letter.toLowerCase()}.fbx`;
            
            this.fbxLoader.load(
                modelPath,
                (object) => {
                    // Success callback
                    this.fbxModels[letter] = object;
                    loadedCount++;
                    console.log(`✅ Loaded FBX model for letter: ${letter}`);
                    
                    if (loadedCount === totalModels) {
                        this.modelsLoaded = true;
                        console.log('🎉 All FBX models loaded successfully!');
                    }
                },
                (progress) => {
                    // Progress callback
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`📊 Loading ${letter}: ${percent}%`);
                },
                (error) => {
                    // Error callback
                    console.error(`❌ Failed to load FBX model for letter ${letter}:`, error);
                    loadedCount++;
                    
                    if (loadedCount === totalModels) {
                        this.modelsLoaded = true;
                        console.log('⚠️ Some FBX models failed to load, falling back to text rendering');
                    }
                }
            );
        });
    }
    
    enableGridLayoutModes() {
        console.log('🔧 Enabling grid layout modes...');
        
        // Ensure scene exists before proceeding
        if (!this.scene) {
            console.error('❌ Scene not found! Cannot enable grid layout modes. Make sure init() was called first.');
            throw new Error('Scene not initialized. Call init() before enableGridLayoutModes().');
        }
        
        this.gridLayoutEnabled = true;
        
        // Create grid container for better organization
        this.gridContainer = new THREE.Group();
        this.scene.add(this.gridContainer);
        
        // Create immersive nature environment
        this.createNatureEnvironment();
        
        // Enhanced renderer settings for nature environment
        if (this.renderer) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.setClearColor(0x87CEEB, 0.1); // Sky blue background
            this.renderer.antialias = true;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
        }
        
        // Set initial camera position for 2D mode
        this.setCameraForGridMode('2D');
        
        // Setup enhanced lighting for nature environment
        this.updateLightingForMode();
        
        // Create initial grid
        this.createGridForMode('2D');
        
        // Add hover effects for better placement visibility
        this.addHoverEffects();
        
        console.log('✅ Grid layout modes enabled with nature environment and enhanced visibility');
    }

    /**
     * Create immersive nature environment with water cascade
     */
    createNatureEnvironment() {
        console.log('🌿 Creating immersive nature environment with water cascade...');
        
        // Create sky dome with gradient
        const skyGeometry = new THREE.SphereGeometry(150, 32, 32);
        const skyMaterial = new THREE.MeshLambertMaterial({
            color: 0x87CEEB, // Sky blue
            transparent: true,
            opacity: 0.8,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        
        // Create ground plane with grass texture
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22, // Forest green
            transparent: true,
            opacity: 0.9
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -10;
        this.scene.add(ground);
        
        // Create water cascade
        this.createWaterCascade();
        
        // Create surrounding trees and rocks
        this.createNatureElements();
        
        // Create atmospheric particles (water droplets, leaves)
        this.createAtmosphericParticles();
        
        // Store environment elements for animation
        this.environmentElements = {
            sky: sky,
            ground: ground,
            cascade: this.waterCascade,
            trees: this.trees || [],
            rocks: this.rocks || [],
            particles: this.atmosphericParticles || []
        };
    }
    
    /**
     * Create animated water cascade
     */
    createWaterCascade() {
        console.log('💧 Creating enhanced animated water cascade...');
        
        // Create cascade container
        this.waterCascade = new THREE.Group();
        this.scene.add(this.waterCascade);
        
        // Create main waterfall structure
        this.createMainWaterfall();
        
        // Create secondary streams
        this.createSecondaryStreams();
        
        // Create water pool and river
        this.createWaterPool();
        
        // Create foam and mist effects
        this.createFoamAndMist();
        
        // Create water splash particles
        this.createWaterSplashes();
        
        // Create water surface ripples
        this.createWaterRipples();
    }
    
    createMainWaterfall() {
        // Main waterfall - much larger and more dramatic
        const waterfallWidth = 20; // Much wider for bigger river
        const waterfallHeight = 50; // Much taller for dramatic effect
        
        // Create main waterfall sheet with better visual effects
        const waterfallGeometry = new THREE.PlaneGeometry(waterfallWidth, waterfallHeight);
        const waterfallMaterial = new THREE.MeshPhongMaterial({
            color: 0x29B6F6, // Brighter blue
            transparent: true,
            opacity: 0.9, // More visible
            shininess: 200, // More reflective
            side: THREE.DoubleSide
        });
        
        const waterfall = new THREE.Mesh(waterfallGeometry, waterfallMaterial);
        waterfall.position.set(0, waterfallHeight / 2, -10); // Moved back for bigger river
        this.waterCascade.add(waterfall);
        
        // Add more flowing water particles with better effects
        const particleCount = 300; // More particles for bigger waterfall
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 12, 12); // Larger particles
            const particleMaterial = new THREE.MeshPhongMaterial({
                color: 0x4FC3F7, // Brighter blue
                transparent: true,
                opacity: 0.95, // More visible
                shininess: 150
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * waterfallWidth * 0.9, // Wider distribution
                waterfallHeight - Math.random() * waterfallHeight,
                -10 + (Math.random() - 0.5) * 0.8
            );
            
            particle.userData = {
                originalY: particle.position.y,
                speed: 0.06 + Math.random() * 0.08, // Faster movement
                offset: Math.random() * Math.PI * 2,
                swing: Math.random() * 0.3, // More swing
                pulse: Math.random() * Math.PI * 2
            };
            
            this.waterCascade.add(particle);
        }
    }
    
    createSecondaryStreams() {
        // Create larger streams on the sides
        const streamCount = 3;
        const streamWidth = 2.5;
        const streamHeight = 20;
        
        for (let i = 0; i < streamCount; i++) {
            const streamGeometry = new THREE.CylinderGeometry(0.15, 0.15, streamHeight, 8);
            const streamMaterial = new THREE.MeshPhongMaterial({
                color: 0x29B6F6,
                transparent: true,
                opacity: 0.7,
                shininess: 120
            });
            
            const stream = new THREE.Mesh(streamGeometry, streamMaterial);
            stream.position.set(
                (i - 1) * streamWidth * 2.5,
                streamHeight / 2,
                -8.5
            );
            
            // Add water droplets to secondary streams
            const dropletCount = 15;
            for (let j = 0; j < dropletCount; j++) {
                const dropletGeometry = new THREE.SphereGeometry(0.04, 4, 4);
                const dropletMaterial = new THREE.MeshPhongMaterial({
                    color: 0x81D4FA,
                    transparent: true,
                    opacity: 0.8
                });
                
                const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
                droplet.position.set(
                    stream.position.x + (Math.random() - 0.5) * 0.3,
                    stream.position.y - j * 0.7,
                    stream.position.z + (Math.random() - 0.5) * 0.2
                );
                
                droplet.userData = {
                    originalY: droplet.position.y,
                    speed: 0.025 + Math.random() * 0.025,
                    offset: Math.random() * Math.PI * 2
                };
                
                this.waterCascade.add(droplet);
            }
            
            this.waterCascade.add(stream);
        }
    }
    
    createWaterPool() {
        // Create a more realistic water pool with depth, coordinated with ground level
        const poolRadius = 4;
        const poolDepth = 1;
        
        // Main pool - positioned relative to ground level
        const poolGeometry = new THREE.CylinderGeometry(poolRadius, poolRadius, poolDepth, 32);
        const poolMaterial = new THREE.MeshPhongMaterial({
            color: 0x0277BD,
            transparent: true,
            opacity: 0.7,
            shininess: 80
        });
        
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.position.set(0, (this.groundLevel || 0) - 9.5, -8); // Coordinate with ground level
        this.waterCascade.add(pool);
        
        // Create river flow from pool
        this.createRiverFlow();
    }
    
    createRiverFlow() {
        // Create a much bigger flowing river from the pool, coordinated with ground level
        const riverLength = 25; // Much longer river
        const riverWidth = 8; // Much wider river
        const groundLevel = this.groundLevel || 0;
        
        // River bed - much larger, positioned relative to ground level
        const riverGeometry = new THREE.BoxGeometry(riverWidth, 0.5, riverLength).toNonIndexed();
        const riverMaterial = new THREE.MeshPhongMaterial({
            color: 0x01579B,
            transparent: true,
            opacity: 0.8
        });
        
        const river = new THREE.Mesh(riverGeometry, riverMaterial);
        river.position.set(0, groundLevel - 10.5, -15); // Coordinate with ground level
        this.waterCascade.add(river);
        
        // River surface with flowing water - much larger
        const surfaceGeometry = new THREE.PlaneGeometry(riverWidth, riverLength);
        const surfaceMaterial = new THREE.MeshPhongMaterial({
            color: 0x039BE5,
            transparent: true,
            opacity: 0.7,
            shininess: 120
        });
        
        const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        surface.position.set(0, groundLevel - 10.3, -15); // Coordinate with ground level
        surface.rotation.x = -Math.PI / 2;
        this.waterCascade.add(surface);
        
        // Add many more flowing water particles in the river
        const riverParticleCount = 120; // Much more particles
        for (let i = 0; i < riverParticleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.03, 4, 4); // Larger particles
            const particleMaterial = new THREE.MeshPhongMaterial({
                color: 0x4FC3F7,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * riverWidth * 0.9,
                groundLevel - 10.2, // Coordinate with ground level
                -10 - Math.random() * riverLength
            );
            
            particle.userData = {
                originalZ: particle.position.z,
                speed: 0.03 + Math.random() * 0.02, // Faster flow
                offset: Math.random() * Math.PI * 2
            };
            
            this.waterCascade.add(particle);
        }
        
        // Add river banks for more realism, coordinated with ground level
        const bankGeometry = new THREE.BoxGeometry(riverWidth + 2, 0.8, riverLength).toNonIndexed();
        const bankMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513, // Brown color for river banks
            transparent: true,
            opacity: 0.9
        });
        
        const leftBank = new THREE.Mesh(bankGeometry, bankMaterial);
        leftBank.position.set(-riverWidth/2 - 1, groundLevel - 10.8, -15); // Coordinate with ground level
        this.waterCascade.add(leftBank);
        
        const rightBank = new THREE.Mesh(bankGeometry, bankMaterial);
        rightBank.position.set(riverWidth/2 + 1, groundLevel - 10.8, -15); // Coordinate with ground level
        this.waterCascade.add(rightBank);
    }
    
    createFoamAndMist() {
        // Create foam at the base of the waterfall, coordinated with ground level
        const groundLevel = this.groundLevel || 0;
        const foamCount = 25;
        for (let i = 0; i < foamCount; i++) {
            const foamGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 4, 4);
            const foamMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.4
            });
            
            const foam = new THREE.Mesh(foamGeometry, foamMaterial);
            foam.position.set(
                (Math.random() - 0.5) * 6,
                groundLevel - 9 + Math.random() * 1.5, // Coordinate with ground level
                -8 + (Math.random() - 0.5) * 2
            );
            
            foam.userData = {
                originalPosition: foam.position.clone(),
                life: 0,
                maxLife: 50 + Math.random() * 100,
                riseSpeed: 0.01 + Math.random() * 0.02
            };
            
            this.waterCascade.add(foam);
        }
        
        // Create mist particles, coordinated with ground level
        const mistCount = 30;
        for (let i = 0; i < mistCount; i++) {
            const mistGeometry = new THREE.SphereGeometry(0.03, 4, 4);
            const mistMaterial = new THREE.MeshPhongMaterial({
                color: 0xE3F2FD,
                transparent: true,
                opacity: 0.3
            });
            
            const mist = new THREE.Mesh(mistGeometry, mistMaterial);
            mist.position.set(
                (Math.random() - 0.5) * 8,
                groundLevel - 8 + Math.random() * 3, // Coordinate with ground level
                -8 + (Math.random() - 0.5) * 3
            );
            
            mist.userData = {
                originalPosition: mist.position.clone(),
                driftSpeed: 0.005 + Math.random() * 0.01,
                riseSpeed: 0.003 + Math.random() * 0.005,
                life: 0,
                maxLife: 200 + Math.random() * 300
            };
            
            this.waterCascade.add(mist);
        }
    }
    
    createWaterRipples() {
        // Create ripple effects on the water surface, coordinated with ground level
        const groundLevel = this.groundLevel || 0;
        const rippleCount = 8;
        for (let i = 0; i < rippleCount; i++) {
            const rippleGeometry = new THREE.RingGeometry(0.1, 0.5, 8);
            const rippleMaterial = new THREE.MeshPhongMaterial({
                color: 0x4FC3F7,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            
            const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
            ripple.position.set(
                (Math.random() - 0.5) * 6,
                groundLevel - 9.4, // Coordinate with ground level
                -8 + (Math.random() - 0.5) * 2
            );
            ripple.rotation.x = -Math.PI / 2;
            
            ripple.userData = {
                originalScale: ripple.scale.clone(),
                expansionSpeed: 0.02 + Math.random() * 0.01,
                life: 0,
                maxLife: 100 + Math.random() * 50
            };
            
            this.waterCascade.add(ripple);
        }
    }
    
    /**
     * Create water splash particles
     */
    createWaterSplashes() {
        const splashCount = 30;
        const splashGeometry = new THREE.SphereGeometry(0.02, 4, 4);
        const splashMaterial = new THREE.MeshPhongMaterial({
            color: 0x81D4FA,
            transparent: true,
            opacity: 0.9
        });
        
        for (let i = 0; i < splashCount; i++) {
            const splash = new THREE.Mesh(splashGeometry, splashMaterial);
            splash.position.set(
                (Math.random() - 0.5) * 6,
                -9 + Math.random() * 2,
                -8 + (Math.random() - 0.5) * 2
            );
            
            splash.userData = {
                originalPosition: splash.position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.05,
                    (Math.random() - 0.5) * 0.1
                ),
                life: 0,
                maxLife: 100 + Math.random() * 50
            };
            
            this.waterCascade.add(splash);
        }
    }
    
    /**
     * Create nature elements (trees, rocks)
     */
    createNatureElements() {
        console.log('🌳 Creating nature elements with improved floor coordination...');
        
        this.trees = [];
        this.rocks = [];
        
        // Create a coordinated ground level system
        this.groundLevel = 0; // Define ground level for all elements
        this.gridLevel = 2; // Grid is elevated above ground
        
        // Create trees around the scene with better coordination
        const treePositions = [
            // Strategic positions around the game area for better visual balance
            { x: -18, z: -8, size: 1.2 },   // Back left - larger tree
            { x: 18, z: -8, size: 1.1 },    // Back right - medium tree
            { x: -15, z: 10, size: 1.0 },   // Front left - smaller tree
            { x: 15, z: 10, size: 1.0 },    // Front right - smaller tree
            { x: -10, z: -15, size: 1.3 },  // Far left - larger tree
            { x: 10, z: -15, size: 1.3 },   // Far right - larger tree
            { x: -5, z: 15, size: 0.9 },    // Near left - small tree
            { x: 5, z: 15, size: 0.9 }      // Near right - small tree
        ];
        
        treePositions.forEach((pos, index) => {
            const tree = this.createTree(pos.x, pos.z, pos.size);
            this.trees.push(tree);
        });
        
        // Create rocks with better floor coordination
        const rockPositions = [
            { x: -6, z: -4, size: 0.8 },
            { x: 6, z: -4, size: 0.8 },
            { x: -4, z: 6, size: 0.6 },
            { x: 4, z: 6, size: 0.6 },
            { x: -12, z: -2, size: 1.0 },
            { x: 12, z: -2, size: 1.0 }
        ];
        
        rockPositions.forEach((pos, index) => {
            const rock = this.createRock(pos.x, pos.z, pos.size);
            this.rocks.push(rock);
        });
        
        // Create ground plane for better coordination
        this.createGroundPlane();
    }
    
    /**
     * Create a ground plane for better scene coordination
     */
    createGroundPlane() {
        // Create a large ground plane that coordinates all elements
        const groundSize = 50;
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x2d5016, // Dark green for natural ground
            transparent: true,
            opacity: 0.3, // Subtle ground plane
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, this.groundLevel - 0.01, 0); // Just below ground level
        ground.receiveShadow = true;
        
        this.scene.add(ground);
        this.groundPlane = ground;
    }
    
    /**
     * Create a single tree with improved floor coordination
     */
    createTree(x, z, size = 1.0) {
        const tree = new THREE.Group();
        
        // Tree trunk with better geometry and floor snapping
        const trunkHeight = 4.5 * size;
        const trunkRadius = 0.35 * size;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 12);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            roughness: 0.8
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = this.groundLevel + trunkHeight / 2; // Snap to ground level
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);
        
        // Tree foliage with better distribution and colors, scaled by size
        const foliagePositions = [
            { x: 0, y: trunkHeight + 0.5, z: 0, scale: 1.8 * size, color: 0x228B22 },
            { x: 0.6 * size, y: trunkHeight + 1.5, z: 0.4 * size, scale: 1.5 * size, color: 0x32CD32 },
            { x: -0.4 * size, y: trunkHeight + 2.2, z: -0.3 * size, scale: 1.3 * size, color: 0x90EE90 },
            { x: 0.3 * size, y: trunkHeight + 2.8, z: 0.2 * size, scale: 1.0 * size, color: 0x7CFC00 },
            { x: -0.2 * size, y: trunkHeight + 3.2, z: -0.1 * size, scale: 0.8 * size, color: 0x228B22 }
        ];
        
        foliagePositions.forEach(pos => {
            const foliageGeometry = new THREE.SphereGeometry(1.2 * size, 12, 10);
            const foliageMaterial = new THREE.MeshLambertMaterial({ 
                color: pos.color,
                transparent: true,
                opacity: 0.95
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(pos.x, pos.y, pos.z);
            foliage.scale.setScalar(pos.scale);
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            tree.add(foliage);
        });
        
        // Position tree at ground level
        tree.position.set(x, this.groundLevel, z);
        this.scene.add(tree);
        
        return tree;
    }
    
    /**
     * Create a single rock with improved floor coordination
     */
    createRock(x, z, size = 1.0) {
        // Create more realistic rock with better geometry and floor snapping
        const rockGeometry = new THREE.DodecahedronGeometry(1.0 * size + Math.random() * 0.6 * size, 1);
        const rockMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x696969,
            transparent: true,
            opacity: 0.9,
            roughness: 0.9
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, this.groundLevel + (size * 0.5), z); // Snap to ground level
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        this.scene.add(rock);
        return rock;
    }
    
    /**
     * Create atmospheric particles (water droplets, leaves)
     */
    createAtmosphericParticles() {
        console.log('🍃 Creating enhanced atmospheric particles...');
        
        this.atmosphericParticles = [];
        
        // Water droplets in air with better visibility
        const dropletCount = 60; // More droplets
        for (let i = 0; i < dropletCount; i++) {
            const dropletGeometry = new THREE.SphereGeometry(0.04, 8, 8); // Larger, more detailed
            const dropletMaterial = new THREE.MeshPhongMaterial({
                color: 0x4FC3F7, // Brighter blue
                transparent: true,
                opacity: 0.8, // More visible
                shininess: 100
            });
            
            const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
            droplet.position.set(
                (Math.random() - 0.5) * 50, // Wider distribution
                Math.random() * 25, // Higher range
                (Math.random() - 0.5) * 50
            );
            
            droplet.userData = {
                originalPosition: droplet.position.clone(),
                speed: 0.015 + Math.random() * 0.025, // Faster movement
                offset: Math.random() * Math.PI * 2,
                pulse: Math.random() * Math.PI * 2
            };
            
            this.scene.add(droplet);
            this.atmosphericParticles.push(droplet);
        }
        
        // Falling leaves with better visibility
        const leafCount = 30; // More leaves
        for (let i = 0; i < leafCount; i++) {
            const leafGeometry = new THREE.PlaneGeometry(0.4, 0.3); // Larger leaves
            const leafMaterial = new THREE.MeshLambertMaterial({
                color: 0x8BC34A,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                (Math.random() - 0.5) * 30,
                15 + Math.random() * 10,
                (Math.random() - 0.5) * 30
            );
            
            leaf.userData = {
                originalPosition: leaf.position.clone(),
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                fallSpeed: 0.01 + Math.random() * 0.02,
                swingOffset: Math.random() * Math.PI * 2
            };
            
            this.scene.add(leaf);
            this.atmosphericParticles.push(leaf);
        }
    }
    
    switchGridLayout(mode) {
        if (!this.gridLayoutEnabled) {
            console.warn('⚠️ Grid layout modes not enabled');
            return;
        }
        
        console.log(`🔄 Switching grid layout from ${this.gridLayoutMode} to ${mode}`);
        
        if (mode === this.gridLayoutMode) {
            console.log('Already in this grid layout mode');
            return;
        }
        
        // Clear current grid
        this.clearCurrentGrid();
        
        // Update mode
        this.gridLayoutMode = mode;
        
        // Recreate grid with new layout
        this.createGridForMode(mode);
        
        // Update camera
        this.setCameraForGridMode(mode);
        
        // Update lighting for mode
        this.updateLightingForMode(mode);
        
        console.log(`✅ Grid layout switched to ${mode}`);
    }
    
    clearCurrentGrid() {
        console.log('🧹 Clearing current grid...');
        
        // Clear grid planes
        this.gridPlanes.forEach(plane => {
            this.gridContainer.remove(plane);
        });
        this.gridPlanes = [];
        
        // Clear grid cubes
        this.gridCubes.forEach(cube => {
            this.gridContainer.remove(cube);
        });
        this.gridCubes = [];
        
        // Clear any existing letters
        this.cubes.forEach(cube => {
            this.gridContainer.remove(cube);
        });
        this.cubes = [];
        
        this.textMeshes.forEach(text => {
            this.gridContainer.remove(text);
        });
        this.textMeshes = [];
    }
    
    createGridForMode(mode) {
        console.log(`🏗️ Creating grid for ${mode} mode...`);
        
        if (mode === '2D') {
            this.create2DGrid();
        } else if (mode === '3D') {
            this.create3DGrid();
        }
    }
    
    create2DGrid() {
        console.log('🔲 Creating 2D grid (flat plane layout) with Enhanced Visibility...');
        
        // Increase cell size for better visibility
        this.cellSize = 1.5; // Increased from 1.0 for better visibility
        
        // Create a word game board style grid with better visibility
        const gridGeometry = new THREE.PlaneGeometry(
            this.currentGridSize * this.cellSize,
            this.currentGridSize * this.cellSize
        );
        
        // Create a more prominent grid material with better visibility
        const gridMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d3748, // Lighter slate for better contrast
            transparent: true,
            opacity: 0.95, // Higher opacity for better visibility
            side: THREE.DoubleSide,
            emissive: 0x1a202c, // Subtle glow for better visibility
            emissiveIntensity: 0.1
        });
        
        const gridPlane = new THREE.Mesh(gridGeometry, gridMaterial);
        gridPlane.rotation.x = -Math.PI / 2;
        
        // Position grid to align with waterfall and river
        // Y-axis aligns along waterfall (height), X-axis extends into river
        const gridSize = this.currentGridSize * this.cellSize;
        gridPlane.position.set(
            -gridSize / 2, // Center X-axis
            2, // Y-axis aligns with waterfall height, raised for better visibility
            -8 // Position in front of waterfall, extending into river area
        );
        gridPlane.receiveShadow = true;
        
        this.gridContainer.add(gridPlane);
        this.gridPlanes.push(gridPlane);
        
        // Create enhanced grid lines for better word game feel
        this.createGridLines2D();
        
        // Add coordinate labels for X,Y system
        this.createCoordinateLabels2D();
        
        // Add cell indicators for better placement visibility
        this.addCellIndicators2D();
        
        console.log('✅ 2D grid created successfully with Enhanced Visibility');
    }

    create3DGrid() {
        console.log('🧊 Creating 3D grid (volumetric layout) with Enhanced Visibility...');
        
        // Increase cell size for better visibility
        this.cellSize = 1.5; // Increased from 1.0 for better visibility
        
        // Ensure ground level is defined for coordination
        if (!this.groundLevel) {
            this.groundLevel = 0;
        }
        const gridLevel = this.groundLevel + 2; // Grid elevated above ground level
        
        // Create multiple layers for 3D word game board with better visibility
        for (let depth = 0; depth < this.gridDepth; depth++) {
            const gridGeometry = new THREE.PlaneGeometry(
                this.currentGridSize * this.cellSize,
                this.currentGridSize * this.cellSize
            );
            
            // Create layered grid material with better depth variation
            const gridMaterial = new THREE.MeshPhongMaterial({
                color: 0x2d3748, // Lighter slate for better contrast
                transparent: true,
                opacity: 0.6 - (depth * 0.1), // Better opacity range
                side: THREE.DoubleSide,
                emissive: 0x1a202c, // Subtle glow for better visibility
                emissiveIntensity: 0.1 - (depth * 0.02)
            });
            
            const gridPlane = new THREE.Mesh(gridGeometry, gridMaterial);
            gridPlane.rotation.x = -Math.PI / 2;
            
            // Position grid to align with waterfall and river, coordinated with ground level
            // Y-axis aligns along waterfall (height), X-axis extends into river
            const gridSize = this.currentGridSize * this.cellSize;
            gridPlane.position.set(
                -gridSize / 2, // Center X-axis
                gridLevel + depth * this.cellSize * 0.5, // Y-axis aligns with ground level + elevation
                -8 + depth * this.cellSize * 0.3 // Z-axis extends into river area with depth
            );
            gridPlane.receiveShadow = true;
            
            this.gridContainer.add(gridPlane);
            this.gridPlanes.push(gridPlane);
        }
        
        // Create enhanced 3D grid lines
        this.createGridLines3D();
        
        // Add coordinate labels for X,Y,Z system
        this.createCoordinateLabels3D();
        
        // Add cell indicators for better placement visibility
        this.addCellIndicators3D();
        
        console.log('✅ 3D grid created successfully with Enhanced Visibility and Ground Coordination');
    }
    
    createGridLines2D() {
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const totalSize = gridSize * cellSize;
        
        // Ensure ground level is defined for coordination
        if (!this.groundLevel) {
            this.groundLevel = 0;
        }
        const gridLevel = this.groundLevel + 2; // Grid elevated above ground level
        
        // Enhanced line material for better visibility
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 1.0, // Full opacity for maximum visibility
            linewidth: 3 // Thicker lines
        });
        
        // Position offset to match grid positioning, coordinated with ground level
        const gridOffset = {
            x: -totalSize / 2,
            y: gridLevel + 0.02, // Raised to match new grid position, coordinated with ground level
            z: -8 // Moved back to match new grid position
        };
        
        // Vertical lines with enhanced visibility
        for (let i = 0; i <= gridSize; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(gridOffset.x + i * cellSize, gridOffset.y, gridOffset.z - totalSize/2),
                new THREE.Vector3(gridOffset.x + i * cellSize, gridOffset.y, gridOffset.z + totalSize/2)
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            this.gridContainer.add(line);
        }
        
        // Horizontal lines with enhanced visibility
        for (let i = 0; i <= gridSize; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(gridOffset.x - totalSize/2, gridOffset.y, gridOffset.z + i * cellSize),
                new THREE.Vector3(gridOffset.x + totalSize/2, gridOffset.y, gridOffset.z + i * cellSize)
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            this.gridContainer.add(line);
        }
        
        // Add thicker border lines for better definition
        const borderMaterial = new THREE.LineBasicMaterial({ 
            color: 0x3498db, // Blue border
            transparent: true,
            opacity: 1.0,
            linewidth: 4 // Even thicker border
        });
        
        // Border lines
        const borderGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(gridOffset.x - totalSize/2, gridOffset.y + 0.01, gridOffset.z - totalSize/2),
            new THREE.Vector3(gridOffset.x + totalSize/2, gridOffset.y + 0.01, gridOffset.z - totalSize/2),
            new THREE.Vector3(gridOffset.x + totalSize/2, gridOffset.y + 0.01, gridOffset.z + totalSize/2),
            new THREE.Vector3(gridOffset.x - totalSize/2, gridOffset.y + 0.01, gridOffset.z + totalSize/2),
            new THREE.Vector3(gridOffset.x - totalSize/2, gridOffset.y + 0.01, gridOffset.z - totalSize/2)
        ]);
        const borderLine = new THREE.Line(borderGeometry, borderMaterial);
        this.gridContainer.add(borderLine);
    }
    
    createGridLines3D() {
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const depth = this.gridDepth;
        const totalSize = gridSize * cellSize;
        
        // Enhanced line material for better 3D visibility
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        // Position offset to match grid positioning
        const gridOffset = {
            x: -totalSize / 2,
            y: 2.02, // Raised to match new grid position
            z: -8 // Moved back to match new grid position
        };
        
        // Create enhanced lines for each depth level
        for (let z = 0; z < depth; z++) {
            const yPos = z * cellSize * 0.5;
            const zOffset = z * cellSize * 0.3;
            
            // Vertical lines for this level with better visibility
            for (let i = 0; i <= gridSize; i++) {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(gridOffset.x + i * cellSize, yPos + gridOffset.y, gridOffset.z + zOffset - totalSize/2),
                    new THREE.Vector3(gridOffset.x + i * cellSize, yPos + gridOffset.y, gridOffset.z + zOffset + totalSize/2)
                ]);
                const line = new THREE.Line(geometry, lineMaterial);
                this.gridContainer.add(line);
            }
            
            // Horizontal lines for this level with better visibility
            for (let i = 0; i <= gridSize; i++) {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(gridOffset.x - totalSize/2, yPos + gridOffset.y, gridOffset.z + zOffset + i * cellSize),
                    new THREE.Vector3(gridOffset.x + totalSize/2, yPos + gridOffset.y, gridOffset.z + zOffset + i * cellSize)
                ]);
                const line = new THREE.Line(geometry, lineMaterial);
                this.gridContainer.add(line);
            }
        }
        
        // Enhanced vertical connection lines between levels
        if (depth > 1) {
            const connectionMaterial = new THREE.LineBasicMaterial({ 
                color: 0x3498db, // Blue for depth connections
                transparent: true,
                opacity: 0.9,
                linewidth: 2
            });
            
            for (let x = 0; x <= gridSize; x++) {
                for (let z = 0; z <= gridSize; z++) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(gridOffset.x + x * cellSize, gridOffset.y, gridOffset.z + z * cellSize),
                        new THREE.Vector3(gridOffset.x + x * cellSize, (depth-1) * cellSize * 0.5 + gridOffset.y, gridOffset.z + z * cellSize)
                    ]);
                    const line = new THREE.Line(geometry, connectionMaterial);
                    this.gridContainer.add(line);
                }
            }
        }
        
        // Add 3D border lines for better definition
        const borderMaterial = new THREE.LineBasicMaterial({ 
            color: 0xe74c3c, // Red border for 3D
            transparent: true,
            opacity: 1.0,
            linewidth: 3
        });
        
        // 3D border lines
        for (let z = 0; z < depth; z++) {
            const yPos = z * cellSize * 0.5;
            const zOffset = z * cellSize * 0.3;
            const borderGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(gridOffset.x - totalSize/2, yPos + gridOffset.y + 0.01, gridOffset.z + zOffset - totalSize/2),
                new THREE.Vector3(gridOffset.x + totalSize/2, yPos + gridOffset.y + 0.01, gridOffset.z + zOffset - totalSize/2),
                new THREE.Vector3(gridOffset.x + totalSize/2, yPos + gridOffset.y + 0.01, gridOffset.z + zOffset + totalSize/2),
                new THREE.Vector3(gridOffset.x - totalSize/2, yPos + gridOffset.y + 0.01, gridOffset.z + zOffset + totalSize/2),
                new THREE.Vector3(gridOffset.x - totalSize/2, yPos + gridOffset.y + 0.01, gridOffset.z + zOffset - totalSize/2)
            ]);
            const borderLine = new THREE.Line(borderGeometry, borderMaterial);
            this.gridContainer.add(borderLine);
        }
    }
    
    // Add cell indicators for 2D grid to show where letters can be placed
    addCellIndicators2D() {
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const totalSize = gridSize * cellSize;
        
        // Create indicator material
        const indicatorMaterial = new THREE.MeshLambertMaterial({
            color: 0x4facfe,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        // Position offset to match grid positioning
        const gridOffset = {
            x: -totalSize / 2,
            y: 2.05, // Raised to match new grid position
            z: -8 // Moved back to match new grid position
        };
        
        // Add indicators for each cell
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const indicatorGeometry = new THREE.PlaneGeometry(cellSize * 0.8, cellSize * 0.8);
                const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                
                indicator.position.set(
                    gridOffset.x + col * cellSize + cellSize / 2,
                    gridOffset.y,
                    gridOffset.z + row * cellSize + cellSize / 2
                );
                indicator.rotation.x = -Math.PI / 2;
                
                this.gridContainer.add(indicator);
            }
        }
    }
    
    // Add cell indicators for 3D grid to show where letters can be placed
    addCellIndicators3D() {
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const depth = this.gridDepth;
        const totalSize = gridSize * cellSize;
        
        // Create indicator material
        const indicatorMaterial = new THREE.MeshLambertMaterial({
            color: 0x4facfe,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        // Position offset to match grid positioning
        const gridOffset = {
            x: -totalSize / 2,
            y: 0.05,
            z: -6
        };
        
        // Add indicators for each cell at each depth level
        for (let d = 0; d < depth; d++) {
            const yPos = d * cellSize * 0.5;
            const zOffset = d * cellSize * 0.3;
            
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const indicatorGeometry = new THREE.PlaneGeometry(cellSize * 0.7, cellSize * 0.7);
                    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                    
                    indicator.position.set(
                        gridOffset.x + col * cellSize + cellSize / 2,
                        yPos + gridOffset.y,
                        gridOffset.z + zOffset + row * cellSize + cellSize / 2
                    );
                    indicator.rotation.x = -Math.PI / 2;
                    
                    this.gridContainer.add(indicator);
                }
            }
        }
    }
    
    /**
     * Create coordinate labels for 2D grid (X,Y system)
     */
    createCoordinateLabels2D() {
        const gridSize = this.currentGridSize;
        const cellSize = this.cellSize;
        const totalSize = gridSize * cellSize;
        
        // Position offset to match grid positioning
        const gridOffset = {
            x: -totalSize / 2,
            y: 0.05,
            z: -6
        };
        
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        
        // Style for coordinate labels
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add X-axis labels (0, 1, 2, 3, 4)
        for (let i = 0; i <= gridSize; i++) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillText(i.toString(), canvas.width/2, canvas.height/2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            const geometry = new THREE.PlaneGeometry(0.5, 0.5);
            const label = new THREE.Mesh(geometry, material);
            
            label.position.set(
                gridOffset.x + i * cellSize,
                gridOffset.y,
                gridOffset.z - totalSize/2 - 1
            );
            label.rotation.x = -Math.PI / 2;
            
            this.gridContainer.add(label);
        }
        
        // Add Y-axis labels (0, 1, 2, 3, 4)
        for (let i = 0; i <= gridSize; i++) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillText(i.toString(), canvas.width/2, canvas.height/2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            const geometry = new THREE.PlaneGeometry(0.5, 0.5);
            const label = new THREE.Mesh(geometry, material);
            
            label.position.set(
                gridOffset.x - totalSize/2 - 1,
                gridOffset.y,
                gridOffset.z + i * cellSize
            );
            label.rotation.x = -Math.PI / 2;
            label.rotation.z = Math.PI / 2;
            
            this.gridContainer.add(label);
        }
        
        // Add axis titles
        this.createAxisTitle('X', gridOffset.x + totalSize/2, gridOffset.y, gridOffset.z - totalSize/2 - 2);
        this.createAxisTitle('Y', gridOffset.x - totalSize/2 - 2, gridOffset.y, gridOffset.z + totalSize/2);
    }
    
    /**
     * Create coordinate labels for 3D grid (X,Y,Z system)
     */
    createCoordinateLabels3D() {
        // Create coordinate labels for 3D grid
        const labelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4facfe, 
            transparent: true, 
            opacity: 0.8 
        });
        
        // X-axis labels (columns)
        for (let col = 0; col < this.gridSize; col++) {
            for (let depth = 0; depth < this.gridDepth; depth++) {
                const label = this.createAxisTitle(`${col}`, col - this.gridSize/2, -0.5, depth - this.gridDepth/2);
                if (label) this.scene.add(label);
            }
        }
        
        // Y-axis labels (rows)
        for (let row = 0; row < this.gridSize; row++) {
            for (let depth = 0; depth < this.gridDepth; depth++) {
                const label = this.createAxisTitle(`${row}`, -0.5, row - this.gridSize/2, depth - this.gridDepth/2);
                if (label) this.scene.add(label);
            }
        }
        
        // Z-axis labels (depth)
        for (let depth = 0; depth < this.gridDepth; depth++) {
            const label = this.createAxisTitle(`D${depth}`, -0.5, -0.5, depth - this.gridDepth/2);
            if (label) this.scene.add(label);
        }
    }
    
    /**
     * Helper method to create axis titles
     */
    createAxisTitle(title, x, y, z) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = '#3498db';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(title, canvas.width/2, canvas.height/2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const geometry = new THREE.PlaneGeometry(1, 0.5);
        const titleMesh = new THREE.Mesh(geometry, material);
        
        titleMesh.position.set(x, y, z);
        titleMesh.rotation.x = -Math.PI / 2;
        
        this.gridContainer.add(titleMesh);
    }
    
    setCameraForGridMode(mode) {
        // Ensure camera exists before proceeding
        if (!this.camera) {
            console.error('❌ Camera not found! Cannot set camera for grid mode.');
            return;
        }
        console.log(`📷 Setting camera for ${mode} mode...`);
        
        const config = this.cameraConfigs[mode];
        if (!config) return;
        
        // Direct camera positioning (no animation)
        const targetPosition = config.position;
        const targetLookAt = config.lookAt;
        
        // Immediate positioning without animation
        this.camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
        this.camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);
        
        // Update FOV if needed
        if (this.camera.fov !== config.fov) {
            this.camera.fov = config.fov;
            this.camera.updateProjectionMatrix();
        }
    }
    
    /**
     * Enhanced lighting setup inspired by Three.js CSS3D Sprites
     */
    updateLightingForMode() {
        // Clear existing lights
        this.scene.children.forEach(child => {
            if (child.isLight) {
                this.scene.remove(child);
            }
        });
        
        // Enhanced ambient lighting for nature environment
        const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.8); // Brighter sky blue ambient
        this.scene.add(ambientLight);
        
        // Main directional light (sun) with better shadows
        const mainLight = new THREE.DirectionalLight(0xFFD700, 2.0); // Brighter golden sunlight
        mainLight.position.set(15, 25, 15);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 4096; // Higher resolution shadows
        mainLight.shadow.mapSize.height = 4096;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -25;
        mainLight.shadow.camera.right = 25;
        mainLight.shadow.camera.top = 25;
        mainLight.shadow.camera.bottom = -25;
        mainLight.shadow.bias = -0.0001; // Reduce shadow acne
        mainLight.shadow.normalBias = 0.02; // Better shadow quality
        this.scene.add(mainLight);
        
        // Secondary directional light for fill lighting
        const fillLight = new THREE.DirectionalLight(0xFFFFFF, 1.0); // White fill light
        fillLight.position.set(-15, 20, -15);
        fillLight.castShadow = true;
        fillLight.shadow.mapSize.width = 2048;
        fillLight.shadow.mapSize.height = 2048;
        fillLight.shadow.camera.near = 0.5;
        fillLight.shadow.camera.far = 50;
        fillLight.shadow.camera.left = -20;
        fillLight.shadow.camera.right = 20;
        fillLight.shadow.camera.top = 20;
        fillLight.shadow.camera.bottom = -20;
        fillLight.shadow.bias = -0.0001;
        fillLight.shadow.normalBias = 0.02;
        this.scene.add(fillLight);
        
        // Enhanced cascade light for water effects
        const cascadeLight = new THREE.PointLight(0x4FC3F7, 1.5, 25); // Brighter light blue for water
        cascadeLight.position.set(0, -5, -8);
        this.scene.add(cascadeLight);
        
        // Add underwater light for pool effects
        const underwaterLight = new THREE.PointLight(0x039BE5, 1.0, 10); // Brighter deep blue for underwater
        underwaterLight.position.set(0, -9, -8);
        this.scene.add(underwaterLight);
        
        // Add river flow light
        const riverLight = new THREE.PointLight(0x29B6F6, 0.8, 15); // Brighter medium blue for river
        riverLight.position.set(0, -9.5, -12);
        this.scene.add(riverLight);
        
        // Warm point light for letters
        const letterLight = new THREE.PointLight(0xFFFFFF, 1.5, 15); // Brighter white light for letters
        letterLight.position.set(0, 8, 0);
        this.scene.add(letterLight);
        
        // Add mist light for atmospheric effects
        const mistLight = new THREE.PointLight(0xE3F2FD, 0.6, 18); // Brighter very light blue for mist
        mistLight.position.set(0, -6, -8);
        this.scene.add(mistLight);
        
        console.log('💡 Enhanced lighting setup with better shadows and quality');
    }

    // Override letter placement to handle 3D coordinates
    placeLetter3D(x, y, z, letter) {
        if (this.gridLayoutMode === '2D') {
            // Use original 2D placement (z is ignored)
            return this.placeLetterAt(x, y, letter);
        } else {
            // Handle 3D placement
            return this.placeLetterAt3D(x, y, z, letter);
        }
    }
    
    placeLetterAt3D(x, y, z, letter) {
        const gridSize = this.currentGridSize;
        
        // Validate 3D coordinates
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || z < 0 || z >= this.gridDepth) {
            console.warn('Invalid 3D coordinates:', { x, y, z });
            return false;
        }
        
        // Check if position is empty
        if (this.grid[z] && this.grid[z][y] && this.grid[z][y][x] !== null) {
            console.warn('Position already occupied:', { x, y, z });
            return false;
        }
        
        // Create 3D letter cube
        const letterCube = this.createLetter3D(letter, x, y, z);
        
        // Update grid data
        if (!this.grid[z]) this.grid[z] = [];
        if (!this.grid[z][y]) this.grid[z][y] = [];
        this.grid[z][y][x] = { letter, placed: true, mesh: letterCube };
        
        console.log(`✅ Letter ${letter} placed at 3D position (${x}, ${y}, ${z})`);
        return true;
    }
    
    /**
     * Create enhanced letter with modern visual style
     */
    createLetter3D(letter, row, col, depth = 0) {
        let letterMesh;
        
        // Modern color palette with better contrast for word games
        const colorPalette = {
            'A': 0x3498db, 'B': 0xe74c3c, 'C': 0x2ecc71, 'D': 0xf39c12,
            'E': 0x9b59b6, 'F': 0x1abc9c, 'G': 0xe67e22, 'H': 0x34495e,
            'I': 0x16a085, 'J': 0xd35400, 'K': 0x8e44ad, 'L': 0x27ae60,
            'M': 0xc0392b, 'N': 0x2980b9, 'O': 0xf1c40f, 'P': 0xe91e63,
            'Q': 0x00bcd4, 'R': 0xff5722, 'S': 0x4caf50, 'T': 0x2196f3,
            'U': 0x9c27b0, 'V': 0xff9800, 'W': 0x795548, 'X': 0x607d8b,
            'Y': 0x3f51b5, 'Z': 0xffeb3b
        };

        const baseColor = colorPalette[letter] || 0x667eea;
        
        // Try to use FBX model first, fallback to text geometry
        if (this.fbxModels && this.fbxModels[letter]) {
            // Use the loaded FBX model
            letterMesh = this.fbxModels[letter].clone();
            letterMesh.scale.set(0.5, 0.5, 0.5); // Scale down the FBX model
            letterMesh.castShadow = true;
            letterMesh.receiveShadow = true;
            
            // Apply material to all meshes in the FBX model
            letterMesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({
                        color: baseColor,
                        shininess: 50,
                        transparent: true,
                        opacity: 0.95
                    });
                }
            });
            
            console.log(`📦 Using FBX model for letter: ${letter}`);
        } else {
            // Fallback to text geometry if FBX not available
            const geometry = new THREE.BoxGeometry(this.cellSize * 0.9, this.cellSize * 0.15, this.cellSize * 0.9).toNonIndexed();
            const material = new THREE.MeshPhongMaterial({
                color: baseColor,
                shininess: 50,
                transparent: true,
                opacity: 0.95
            });
            
            letterMesh = new THREE.Mesh(geometry, material);
            letterMesh.castShadow = true;
            letterMesh.receiveShadow = true;
            
            // Create prominent letter text for visibility
            this.createLetterText(letter, row * this.cellSize, col * this.cellSize, depth * this.cellSize);
            
            console.log(`📝 Using text geometry for letter: ${letter}`);
        }
        
        console.log(`📝 Created word game letter: ${letter}`);
        
        // Position the letter with new grid positioning
        const totalSize = this.currentGridSize * this.cellSize;
        const gridOffset = {
            x: -totalSize / 2,
            y: 0.1,
            z: -6
        };
        
        if (this.gridLayoutMode === '2D') {
            // Position for 2D grid mode
            letterMesh.position.set(
                gridOffset.x + col * this.cellSize,
                gridOffset.y,
                gridOffset.z + row * this.cellSize
            );
        } else {
            // Position for 3D grid mode with depth
            const zOffset = depth * this.cellSize * 0.3;
            letterMesh.position.set(
                gridOffset.x + col * this.cellSize,
                gridOffset.y + depth * this.cellSize * 0.5,
                gridOffset.z + zOffset + row * this.cellSize
            );
        }

        // Add to scene and track
        if (this.gridContainer) {
            this.gridContainer.add(letterMesh);
        }
        if (!this.cubes) this.cubes = [];
        this.cubes.push(letterMesh);

        // Update grid data with null checks
        if (this.grid && Array.isArray(this.grid) &&
            this.grid[row] && Array.isArray(this.grid[row]) &&
            this.grid[row][col]) {

            if (this.gridLayoutMode === '2D') {
                const cell = this.grid[row][col];
                if (cell && cell.userData) {
                    cell.userData.occupied = true;
                    cell.userData.letter = letter;
                    cell.userData.letterValue = letter.charCodeAt(0) - 64;
                }
            } else {
                const depthArray = this.grid[row][col];
                if (depthArray && Array.isArray(depthArray) && depthArray[depth]) {
                    const cell = depthArray[depth];
                    if (cell && cell.userData) {
                        cell.userData.occupied = true;
                        cell.userData.letter = letter;
                        cell.userData.letterValue = letter.charCodeAt(0) - 64;
                    }
                }
            }
        }

        return letterMesh;
    }

    /**
     * Add glow effect for letters (word game style)
     */
    addLetterGlow(letterMesh, color) {
        // Create a subtle glow effect around the letter
        const glowGeometry = new THREE.BoxGeometry(this.cellSize * 1.1, this.cellSize * 0.15, this.cellSize * 1.1).toNonIndexed();
        const glowMaterial = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(letterMesh.position);
        glowMesh.position.y -= 0.02;
        
        this.gridContainer.add(glowMesh);
        letterMesh.userData.glowMesh = glowMesh;
    }

    /**
     * Add particle effects around letters (inspired by CSS3D Sprites)
     */
    addLetterParticles(letterMesh, color) {
        const particleCount = 8;
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position particles around the letter
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.6;
            particle.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
            
            // Add to letter mesh as child
            letterMesh.add(particle);
            
            // Store particle reference for animation
            if (!letterMesh.userData.particles) {
                letterMesh.userData.particles = [];
            }
            letterMesh.userData.particles.push({
                mesh: particle,
                originalPosition: particle.position.clone(),
                angle: angle,
                speed: 0.02 + Math.random() * 0.03
            });
        }
    }

    // Enable automatic letter generation and falling
    startLetterFalling() {
        console.log('🎮 Starting automatic letter generation...');
        
        // Start the game loop if not already running
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.paused = false;
        }
        
        // Activate the falling letter system
        this.fallingLetterSystemActive = true;
        
        // Initialize current letter position for keyboard controls
        this.currentLetterPosition = { row: 0, col: 0 };
        
        // Generate first letter immediately
        setTimeout(() => {
            this.generateRandomFallingLetter();
        }, 1000);
        
        console.log('✅ Falling letter system activated');
    }

    // Method to manually place a letter (for testing)
    placeTestLetter(letter, row, col) {
        console.log(`🧪 Placing test letter: ${letter} at (${row}, ${col})`);
        this.createLetter3D(letter, row, col);
    }
    
    /**
     * Enhanced falling letter with modern visual effects
     */
    generateRandomFallingLetter() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        
        // Modern color palette with better contrast for word games
        const colorPalette = {
            'A': 0x3498db, 'B': 0xe74c3c, 'C': 0x2ecc71, 'D': 0xf39c12,
            'E': 0x9b59b6, 'F': 0x1abc9c, 'G': 0xe67e22, 'H': 0x34495e,
            'I': 0x16a085, 'J': 0xd35400, 'K': 0x8e44ad, 'L': 0x27ae60,
            'M': 0xc0392b, 'N': 0x2980b9, 'O': 0xf1c40f, 'P': 0xe91e63,
            'Q': 0x00bcd4, 'R': 0xff5722, 'S': 0x4caf50, 'T': 0x2196f3,
            'U': 0x9c27b0, 'V': 0xff9800, 'W': 0x795548, 'X': 0x607d8b,
            'Y': 0x3f51b5, 'Z': 0xffeb3b
        };
        
        const baseColor = colorPalette[randomLetter] || 0x667eea;
        
        // Create a flat tile with prominent letter text for word game clarity
        const geometry = new THREE.BoxGeometry(this.cellSize * 0.9, this.cellSize * 0.15, this.cellSize * 0.9).toNonIndexed();
        
        // Create material with better visibility for word games
        const material = new THREE.MeshPhongMaterial({
            color: baseColor,
            shininess: 50,
            transparent: true,
            opacity: 0.95
        });

        this.fallingLetterMesh = new THREE.Mesh(geometry, material);
        this.fallingLetterMesh.castShadow = true;
        this.fallingLetterMesh.receiveShadow = true;
        
        console.log(`📝 Created word game falling letter: ${randomLetter}`);

        // Position falling letter at the top of the grid with new positioning
        const totalSize = this.currentGridSize * this.cellSize;
        const gridOffset = {
            x: -totalSize / 2,
            y: 0.1,
            z: -6
        };
        
        if (this.gridLayoutMode === '2D') {
            this.fallingLetterMesh.position.set(
                gridOffset.x + this.currentLetterPosition.col * this.cellSize,
                gridOffset.y + totalSize / 2 + 2,
                gridOffset.z + this.currentLetterPosition.row * this.cellSize
            );
        } else {
            // For 3D mode, position at the top layer
            const zOffset = 0; // Start at front layer
            this.fallingLetterMesh.position.set(
                gridOffset.x + this.currentLetterPosition.col * this.cellSize,
                gridOffset.y + (this.gridDepth - 1) * this.cellSize * 0.5 + 2,
                gridOffset.z + zOffset + this.currentLetterPosition.row * this.cellSize
            );
        }

        // Enhanced visual properties for falling letter
        this.fallingLetterMesh.userData.isFalling = true;
        this.fallingLetterMesh.userData.pulsePhase = 0;
        this.fallingLetterMesh.userData.originalColor = baseColor;

        // Create prominent text for falling letter immediately
        this.createFallingLetterText(randomLetter, baseColor);

        if (this.gridContainer) {
            this.gridContainer.add(this.fallingLetterMesh);
        }
        this.fallingLetter = randomLetter;
        
        // Update current letter position to match the falling letter
        this.currentLetterPosition = { row: 0, col: 0 };
        this.updateFallingLetterPosition();
        
        console.log(`🎯 Generated falling letter: ${randomLetter}`);
    }

    /**
     * Add glow effect for falling letters
     */
    addFallingLetterGlow(letterMesh, color) {
        // Create a more prominent glow effect for falling letters
        const glowGeometry = new THREE.BoxGeometry(this.cellSize * 1.2, this.cellSize * 0.2, this.cellSize * 1.2).toNonIndexed();
        const glowMaterial = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(letterMesh.position);
        glowMesh.position.y -= 0.05;
        
        this.gridContainer.add(glowMesh);
        letterMesh.userData.glowMesh = glowMesh;
    }

    /**
     * Add particle trail effect for falling letters
     */
    addFallingLetterParticles(letterMesh, color) {
        const trailParticles = [];
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.015, 6, 6);
            const particleMaterial = new THREE.MeshLambertMaterial({
                color: color,
                transparent: true,
                opacity: 0.4
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            trailParticles.push({
                mesh: particle,
                originalPosition: particle.position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01
                ),
                life: 1.0
            });
            
            letterMesh.add(particle);
        }
        
        letterMesh.userData.trailParticles = trailParticles;
    }

    /**
     * Create enhanced text for falling letter
     */
    createFallingLetterText(letter, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, 256, 256);

        // Draw letter with enhanced styling for word games
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 120px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add strong text shadow for better readability
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(letter, 128, 128);
        
        // Add thick border/outline for better contrast
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText(letter, 128, 128);

        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        // Create material for better visibility
        const material = new THREE.MeshLambertMaterial({ 
            map: texture,
            transparent: true,
            opacity: 1
        });
        
        // Create plane geometry for text visibility
        const geometry = new THREE.PlaneGeometry(this.cellSize * 0.6, this.cellSize * 0.6);
        
        // Create text mesh on top of the falling letter
        const textMesh = new THREE.Mesh(geometry, material);
        
        // Position text prominently on top of the falling letter tile
        if (this.fallingLetterMesh) {
            textMesh.position.copy(this.fallingLetterMesh.position);
            textMesh.position.y += this.cellSize * 0.3;
        }
        textMesh.rotation.x = -Math.PI / 2; // Face upward
        
        textMesh.userData = { letter, isText: true, isFalling: true };
        
        // Add to scene and tracking with null checks
        if (this.gridContainer) {
            this.gridContainer.add(textMesh);
        }
        if (this.fallingLetterMesh) {
            this.fallingLetterMesh.userData.textMesh = textMesh;
        }
        
        console.log(`✅ Enhanced text mesh created for falling letter: ${letter}`);
    }

    // Override updateGame to handle enhanced 3D letter falling
    updateGame() {
        super.updateGame();
        
        // Start falling letter system if not already running
        if (!this.fallingLetterSystemActive && this.gameRunning && !this.paused) {
            this.fallingLetterSystemActive = true;
            console.log('🎮 Starting falling letter system...');
        }
        
        // Generate new falling letter if none exists and system is active
        if (!this.fallingLetter && this.fallingLetterSystemActive && this.gameRunning && !this.paused) {
            setTimeout(() => {
                this.generateRandomFallingLetter();
            }, 2000); // 2 second delay between letters for better pacing
        }
        
        // Update falling letter position if it exists
        if (this.fallingLetter && this.fallingLetterMesh && this.gameRunning && !this.paused) {
            this.updateFallingLetterPosition();
        }
        
        // Update visual effects for falling letters
        this.updateFallingLetterEffects();
    }
    
    // Update falling letter position with enhanced movement
    updateFallingLetterPosition() {
        if (!this.fallingLetter) return;
        
        // If we have a currentLetterPosition, position the falling letter accordingly
        if (this.currentLetterPosition && this.fallingLetterMesh) {
            const { row, col } = this.currentLetterPosition;
            
            // Calculate position based on new grid positioning
            const totalSize = this.currentGridSize * this.cellSize;
            const gridOffset = {
                x: -totalSize / 2,
                y: 0.1,
                z: -6
            };
            
            if (this.gridLayoutMode === '2D') {
                // Position for 2D grid mode
                this.fallingLetterMesh.position.set(
                    gridOffset.x + col * this.cellSize,
                    gridOffset.y + totalSize / 2 + 2,
                    gridOffset.z + row * this.cellSize
                );
            } else {
                // Position for 3D grid mode
                const zOffset = 0; // Start at front layer
                this.fallingLetterMesh.position.set(
                    gridOffset.x + col * this.cellSize,
                    gridOffset.y + (this.gridDepth - 1) * this.cellSize * 0.5 + 2,
                    gridOffset.z + zOffset + row * this.cellSize
                );
            }
        } else {
            // Fallback to automatic falling movement
            const fallSpeed = 0.03; // Slower fall for better visibility
            this.fallingLetterMesh.position.y -= fallSpeed;
            
            // Add subtle horizontal movement for more dynamic effect
            const time = Date.now() * 0.001;
            const wobble = Math.sin(time * 2) * 0.02;
            this.fallingLetterMesh.position.x += wobble;
        }
        
        // Rotate the falling letter slightly
        this.fallingLetterMesh.rotation.y += 0.02;
        
        // Check if letter reached bottom with new grid positioning
        const totalSize = this.currentGridSize * this.cellSize;
        const gridOffset = {
            x: -totalSize / 2,
            y: 0.1,
            z: -6
        };
        
        if (this.fallingLetterMesh.position.y < gridOffset.y - totalSize / 2) {
            // Remove falling letter
            this.gridContainer.remove(this.fallingLetterMesh);
            this.fallingLetter = null;
        }
    }
    
    // Update visual effects for falling letters
    updateFallingLetterEffects() {
        if (!this.fallingLetterMesh || !this.fallingLetterMesh.userData.isFalling) return;
        
        const time = Date.now() * 0.003;
        const pulse = Math.sin(time + this.fallingLetterMesh.userData.pulsePhase) * 0.2 + 0.8;
        
        // Update material effects with proper null checks
        if (this.fallingLetterMesh.material) {
            this.fallingLetterMesh.material.opacity = 0.8 + pulse * 0.2;
            
            // Only set emissiveIntensity if the material supports it (MeshPhongMaterial)
            if (this.fallingLetterMesh.material.emissive) {
                this.fallingLetterMesh.material.emissive.setScalar(0.3 * pulse);
            }
        }
        
        // Update text meshes for the falling letter
        if (this.fallingLetterMesh.userData.textMesh) {
            const textMesh = this.fallingLetterMesh.userData.textMesh;
            if (textMesh.material) {
                textMesh.material.opacity = 0.9 + pulse * 0.1;
                
                // Only set emissiveIntensity if the material supports it
                if (textMesh.material.emissive) {
                    textMesh.material.emissive.setScalar(0.2 * pulse);
                }
            }
        }
    }
    
    // Create enhanced text mesh for letters on cubes
    createLetterText(letter, x, y, z) {
        console.log(`🔤 Creating enhanced text for letter: ${letter} at position (${x}, ${y}, ${z})`);
        
        // Create larger canvas for better text quality
        const canvas = document.createElement('canvas');
        canvas.width = 512; // Increased for better quality
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas with transparent background for better integration
        ctx.clearRect(0, 0, 512, 512);
        
        // Draw letter with enhanced styling for word games
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 240px Arial, sans-serif'; // Larger font for better visibility
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add very strong text shadow for better readability
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        ctx.fillText(letter, 256, 256);
        
        // Add thick border/outline for better contrast
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 12; // Thicker outline
        ctx.strokeText(letter, 256, 256);
        
        // Create texture and material with better properties
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        // Create material for better visibility
        const material = new THREE.MeshLambertMaterial({ 
            map: texture,
            transparent: true,
            opacity: 1
        });
        
        // Create larger plane geometry for text visibility
        const geometry = new THREE.PlaneGeometry(this.cellSize * 0.8, this.cellSize * 0.8);
        
        // Create text mesh on top of the letter tile
        const textMesh = new THREE.Mesh(geometry, material);
        
        // Calculate new position based on grid offset
        const totalSize = this.currentGridSize * this.cellSize;
        const gridOffset = {
            x: -totalSize / 2,
            y: 0.1,
            z: -6
        };
        
        // Position text prominently on top of the letter tile with new grid positioning
        if (this.gridLayoutMode === '2D') {
            textMesh.position.set(
                gridOffset.x + x,
                gridOffset.y + this.cellSize * 0.4, // Raised higher for better visibility
                gridOffset.z + z
            );
        } else {
            // For 3D mode, calculate depth offset
            const depth = Math.floor(y / this.cellSize);
            const zOffset = depth * this.cellSize * 0.3;
            textMesh.position.set(
                gridOffset.x + x,
                gridOffset.y + depth * this.cellSize * 0.5 + this.cellSize * 0.4, // Raised higher
                gridOffset.z + zOffset + z
            );
        }
        
        textMesh.rotation.x = -Math.PI / 2; // Face upward
        
        textMesh.userData = { letter, isText: true };
        
        // Add to scene and tracking with null checks
        if (this.gridContainer) {
            this.gridContainer.add(textMesh);
        }
        if (!this.textMeshes) this.textMeshes = [];
        this.textMeshes.push(textMesh);
        
        console.log(`✅ Enhanced text mesh created for letter: ${letter}`);
    }
    
    // Enhanced camera controls setup
    setupEnhancedCameraControls() {
        console.log('📷 Setting up enhanced camera controls...');
        
        if (!this.renderer || !this.camera) {
            console.error('❌ Renderer or camera not available for controls');
            return;
        }
        
        const canvas = this.renderer.domElement;
        
        // Set initial cursor style
        canvas.style.cursor = 'grab';
        
        // Mouse controls for rotation and zoom
        canvas.addEventListener('mousedown', (event) => {
            if (!this.cameraControls.enabled) return;
            
            this.cameraControls.isDragging = true;
            this.cameraControls.previousMousePosition = { x: event.clientX, y: event.clientY };
            canvas.style.cursor = 'grabbing';
            
            // Prevent default behavior for better control
            event.preventDefault();
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!this.cameraControls.enabled || !this.cameraControls.isDragging) return;
            
            const deltaMove = {
                x: event.clientX - this.cameraControls.previousMousePosition.x,
                y: event.clientY - this.cameraControls.previousMousePosition.y
            };
            
            // More precise camera rotation with smoother movement
            const distance = this.camera.position.length();
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            
            // Apply rotation with higher precision
            spherical.theta -= deltaMove.x * this.cameraControls.rotationSpeed;
            spherical.phi += deltaMove.y * this.cameraControls.rotationSpeed;
            
            // Clamp phi to prevent camera flipping
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            // Smooth camera positioning
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 0, 0);
            
            this.cameraControls.previousMousePosition = { x: event.clientX, y: event.clientY };
        });
        
        canvas.addEventListener('mouseup', () => {
            this.cameraControls.isDragging = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.cameraControls.isDragging = false;
            canvas.style.cursor = 'grab';
        });
        
        // Mouse wheel for zoom
        canvas.addEventListener('wheel', (event) => {
            if (!this.cameraControls.enabled) return;
            
            // Prevent default scrolling behavior
            event.preventDefault();
            
            const distance = this.camera.position.length();
            const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9; // More precise zoom factor
            const newDistance = distance * zoomFactor;
            
            // Clamp zoom distance with more precise bounds
            const clampedDistance = Math.max(this.cameraControls.minDistance, 
                                           Math.min(this.cameraControls.maxDistance, newDistance));
            
            // Smooth zoom transition
            this.camera.position.normalize().multiplyScalar(clampedDistance);
        });
        
        // Keyboard controls for camera
        document.addEventListener('keydown', (event) => {
            if (!this.cameraControls.enabled) return;
            
            switch(event.code) {
                case 'KeyT':
                    this.setCameraMode('top');
                    break;
                case 'KeyF':
                    this.setCameraMode('front');
                    break;
                case 'KeyS':
                    this.setCameraMode('side');
                    break;
                case 'KeyI':
                    this.setCameraMode('isometric');
                    break;
                case 'KeyC':
                    this.setCameraMode('close');
                    break;
                case 'KeyV':
                    this.setCameraMode('far');
                    break;
                case 'KeyR':
                    this.resetCamera();
                    break;
                case 'KeyH':
                    this.toggleCameraControls();
                    break;
            }
        });
        
        console.log('✅ Enhanced camera controls setup complete');
    }
    
    // Set camera to predefined mode
    setCameraMode(mode) {
        console.log(`📷 Setting camera to ${mode} mode`);
        
        const config = this.cameraControls.cameraModes[mode];
        if (!config) {
            console.warn(`⚠️ Unknown camera mode: ${mode}`);
            return;
        }
        
        // Direct camera positioning (no animation)
        this.camera.position.set(config.position.x, config.position.y, config.position.z);
        this.camera.lookAt(config.lookAt.x, config.lookAt.y, config.lookAt.z);
        
        // Update FOV
        if (this.camera.fov !== config.fov) {
            this.camera.fov = config.fov;
            this.camera.updateProjectionMatrix();
        }
    }
    
    // Reset camera to default position
    resetCamera() {
        console.log('🔄 Resetting camera to default position');
        this.setCameraForGridMode(this.gridLayoutMode);
    }
    
    // Toggle camera controls on/off
    toggleCameraControls() {
        this.cameraControls.enabled = !this.cameraControls.enabled;
        console.log(`📷 Camera controls ${this.cameraControls.enabled ? 'enabled' : 'disabled'}`);
        
        const canvas = this.renderer.domElement;
        canvas.style.cursor = this.cameraControls.enabled ? 'grab' : 'default';
    }
    
    // Override the render method with enhanced visual effects
    render() {
        super.render();
        
        // Enhanced visual effects for better gaming experience
        this.updateVisualEffects();
        
        // No TWEEN updates needed since we removed camera animations
    }
    
    /**
     * Enhanced visual effects update
     */
    updateVisualEffects() {
        const time = Date.now() * 0.001;
        
        // Update nature environment animations
        this.updateNatureEnvironment();
        
        // Animate background particles if they exist
        if (this.backgroundElements && this.backgroundElements.particles) {
            this.backgroundElements.particles.forEach(particle => {
                particle.position.y += particle.speed * 0.01;
                particle.rotation.z += 0.01;
                particle.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
                
                // Reset particle position if it goes too high
                if (particle.position.y > 50) {
                    particle.position.y = -50;
                }
            });
        }

        // Enhanced effects for placed letters
        if (this.cubes) {
            this.cubes.forEach(letterMesh => {
                if (letterMesh && letterMesh.userData && letterMesh.material) {
                    // Wobble effect
                    const wobbleIntensity = 0.02;
                    const wobbleSpeed = 3;
                    letterMesh.rotation.z = Math.sin(time * wobbleSpeed) * wobbleIntensity;
                    
                    // Pulsing effect (only if material supports it)
                    if (letterMesh.material.emissive) {
                        const pulseIntensity = 0.1;
                        const pulseSpeed = 2;
                        letterMesh.material.emissive.setScalar(
                            Math.sin(time * pulseSpeed) * pulseIntensity
                        );
                    }
                    
                    // Animate particle effects
                    if (letterMesh.userData.particles) {
                        letterMesh.userData.particles.forEach(particle => {
                            if (particle.mesh && particle.originalPosition) {
                                particle.mesh.position.x = particle.originalPosition.x + 
                                    Math.sin(time * particle.speed) * 0.1;
                                particle.mesh.position.y = particle.originalPosition.y + 
                                    Math.cos(time * particle.speed) * 0.1;
                                particle.mesh.rotation.z += 0.02;
                            }
                        });
                    }
                }
            });
        }

        // Enhanced effects for text meshes
        if (this.textMeshes) {
            this.textMeshes.forEach(textMesh => {
                if (textMesh && textMesh.material) {
                    // Subtle floating effect
                    textMesh.position.y += Math.sin(time * 1.5) * 0.005;
                    
                    // Opacity pulsing
                    textMesh.material.opacity = 0.8 + Math.sin(time * 2) * 0.2;
                }
            });
        }

        // Enhanced falling letter effects
        if (this.fallingLetterMesh && this.fallingLetterMesh.userData && this.fallingLetterMesh.userData.isFalling) {
            // Trail particle animation
            if (this.fallingLetterMesh.userData.trailParticles) {
                this.fallingLetterMesh.userData.trailParticles.forEach(particle => {
                    if (particle.mesh && particle.mesh.material) {
                        particle.life -= 0.02;
                        particle.mesh.material.opacity = particle.life;
                        
                        if (particle.life > 0 && particle.velocity) {
                            particle.mesh.position.add(particle.velocity);
                            particle.mesh.rotation.z += 0.05;
                        }
                    }
                });
            }
            
            // Pulsing effect for falling letter (only if material supports it)
            if (this.fallingLetterMesh.material && this.fallingLetterMesh.material.emissive) {
                const pulseIntensity = 0.3;
                const pulseSpeed = 4;
                this.fallingLetterMesh.material.emissive.setScalar(
                    Math.sin(time * pulseSpeed) * pulseIntensity
                );
            }
            
            // Opacity pulsing for falling letter
            if (this.fallingLetterMesh.material) {
                const pulseSpeed = 4;
                this.fallingLetterMesh.material.opacity = 0.7 + Math.sin(time * pulseSpeed) * 0.3;
            }
            
            // Text mesh effects
            if (this.fallingLetterMesh.userData.textMesh) {
                const textMesh = this.fallingLetterMesh.userData.textMesh;
                if (textMesh && textMesh.material) {
                    textMesh.position.y += Math.sin(time * 3) * 0.01;
                    textMesh.material.opacity = 0.8 + Math.sin(time * 4) * 0.2;
                }
            }
        }
        
        // Update 3D UI animations
        this.update3DUIAnimations();
    }
    
    /**
     * Update nature environment animations
     */
    updateNatureEnvironment() {
        if (!this.environmentElements) return;
        
        const time = Date.now() * 0.001;
        const groundLevel = this.groundLevel || 0;
        
        // Enhanced water cascade animations
        if (this.waterCascade) {
            this.waterCascade.children.forEach(child => {
                // Animate main waterfall particles
                if (child.userData.originalY !== undefined && child.userData.swing !== undefined) {
                    // Animate falling droplets with swing effect
                    child.position.y -= child.userData.speed;
                    child.position.x += Math.sin(time + child.userData.offset) * child.userData.swing;
                    child.position.z += Math.cos(time + child.userData.offset) * 0.01;
                    
                    // Reset droplet when it reaches the bottom, coordinated with ground level
                    if (child.position.y < groundLevel - 9) {
                        child.position.y = child.userData.originalY;
                    }
                }
                
                // Animate secondary stream droplets
                if (child.userData.originalY !== undefined && child.userData.swing === undefined) {
                    child.position.y -= child.userData.speed;
                    child.position.x += Math.sin(time + child.userData.offset) * 0.01;
                    
                    // Reset droplet when it reaches the bottom, coordinated with ground level
                    if (child.position.y < groundLevel - 9) {
                        child.position.y = child.userData.originalY;
                    }
                }
                
                // Animate river flow particles
                if (child.userData.originalZ !== undefined) {
                    child.position.z -= child.userData.speed;
                    
                    // Reset when too far downstream
                    if (child.position.z < -16) {
                        child.position.z = child.userData.originalZ;
                    }
                }
                
                // Animate splash particles
                if (child.userData.velocity) {
                    child.position.add(child.userData.velocity);
                    child.userData.life++;
                    
                    // Remove old splash particles
                    if (child.userData.life > child.userData.maxLife) {
                        child.position.copy(child.userData.originalPosition);
                        child.userData.life = 0;
                    }
                }
                
                // Animate foam particles, coordinated with ground level
                if (child.userData.riseSpeed) {
                    child.position.y += child.userData.riseSpeed;
                    child.userData.life++;
                    
                    // Reset foam when it rises too high or expires, coordinated with ground level
                    if (child.position.y > groundLevel - 7 || child.userData.life > child.userData.maxLife) {
                        child.position.copy(child.userData.originalPosition);
                        child.userData.life = 0;
                    }
                }
                
                // Animate mist particles, coordinated with ground level
                if (child.userData.driftSpeed) {
                    child.position.x += child.userData.driftSpeed;
                    child.position.y += child.userData.riseSpeed;
                    child.userData.life++;
                    
                    // Reset mist when it drifts too far or expires, coordinated with ground level
                    if (Math.abs(child.position.x) > 10 || child.position.y > groundLevel - 5 || child.userData.life > child.userData.maxLife) {
                        child.position.copy(child.userData.originalPosition);
                        child.userData.life = 0;
                    }
                }
                
                // Animate water ripples
                if (child.userData.expansionSpeed) {
                    child.scale.x += child.userData.expansionSpeed;
                    child.scale.z += child.userData.expansionSpeed;
                    child.userData.life++;
                    
                    // Fade out and reset ripple
                    if (child.material) {
                        child.material.opacity = 0.3 * (1 - child.userData.life / child.userData.maxLife);
                    }
                    
                    if (child.userData.life > child.userData.maxLife) {
                        child.scale.copy(child.userData.originalScale);
                        child.userData.life = 0;
                        if (child.material) {
                            child.material.opacity = 0.3;
                        }
                    }
                }
            });
        }
        
        // Animate trees with subtle movement
        if (this.trees) {
            this.trees.forEach((tree, index) => {
                // Add subtle swaying motion to trees
                const swayAmount = 0.02;
                const swaySpeed = 0.5 + index * 0.1;
                tree.rotation.z = Math.sin(time * swaySpeed) * swayAmount;
                
                // Add subtle scaling animation
                const scaleAmount = 1.0 + Math.sin(time * 2 + index) * 0.01;
                tree.scale.setScalar(scaleAmount);
            });
        }
        
        // Animate atmospheric particles
        if (this.atmosphericParticles) {
            this.atmosphericParticles.forEach(particle => {
                // Animate falling leaves
                if (particle.userData.fallSpeed) {
                    particle.position.y -= particle.userData.fallSpeed;
                    particle.rotation.z += 0.02;
                    
                    // Reset leaf when it reaches ground level
                    if (particle.position.y < groundLevel) {
                        particle.position.y = 15;
                        particle.position.x = (Math.random() - 0.5) * 20;
                        particle.position.z = (Math.random() - 0.5) * 20;
                    }
                }
                
                // Animate floating water droplets
                if (particle.userData.floatSpeed) {
                    particle.position.y += Math.sin(time + particle.userData.offset) * 0.01;
                    particle.position.x += Math.cos(time + particle.userData.offset) * 0.005;
                    
                    // Keep droplets within bounds
                    if (Math.abs(particle.position.x) > 15) {
                        particle.position.x *= 0.9;
                    }
                    if (Math.abs(particle.position.z) > 15) {
                        particle.position.z *= 0.9;
                    }
                }
            });
        }
    }
    
    // Debug method to show current grid mode
    getGridLayoutInfo() {
        return {
            mode: this.gridLayoutMode,
            enabled: this.gridLayoutEnabled,
            gridSize: this.currentGridSize,
            gridDepth: this.gridDepth,
            totalCells: this.gridLayoutMode === '2D' ? 
                this.currentGridSize * this.currentGridSize :
                this.currentGridSize * this.currentGridSize * this.gridDepth
        };
    }

    // Add hover effects and visual feedback for better placement visibility
    addHoverEffects() {
        // Add mouse move event listener for hover effects
        document.addEventListener('mousemove', (event) => {
            this.handleMouseHover(event);
        });
        
        // Add mouse enter/leave events for cell highlighting
        document.addEventListener('mouseenter', (event) => {
            this.handleMouseEnter(event);
        });
        
        document.addEventListener('mouseleave', (event) => {
            this.handleMouseLeave(event);
        });
    }
    
    handleMouseHover(event) {
        if (!this.raycaster || !this.mouse) return;
        
        // Update mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast to find hovered cell
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        let hoveredCell = null;
        let minDistance = Infinity;
        
        // Check all cells in the grid
        if (this.gridLayoutMode === '2D') {
            for (let row = 0; row < this.currentGridSize; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    const cell = this.grid[row][col];
                    if (cell && !cell.userData.occupied) {
                        const intersects = this.raycaster.intersectObject(cell);
                        if (intersects.length > 0 && intersects[0].distance < minDistance) {
                            minDistance = intersects[0].distance;
                            hoveredCell = cell;
                        }
                    }
                }
            }
        } else {
            // 3D mode
            for (let row = 0; row < this.currentGridSize; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    for (let d = 0; d < this.gridDepth; d++) {
                        const cell = this.grid[row][col][d];
                        if (cell && !cell.userData.occupied) {
                            const intersects = this.raycaster.intersectObject(cell);
                            if (intersects.length > 0 && intersects[0].distance < minDistance) {
                                minDistance = intersects[0].distance;
                                hoveredCell = cell;
                            }
                        }
                    }
                }
            }
        }
        
        // Update hover state
        this.updateCellHover(hoveredCell);
    }
    
    updateCellHover(hoveredCell) {
        // Reset all cells to normal state
        this.resetAllCellHighlights();
        
        // Highlight hovered cell
        if (hoveredCell && !hoveredCell.userData.occupied) {
            this.highlightCell(hoveredCell, 0x4facfe, 0.6);
            hoveredCell.userData.isHovered = true;
        }
    }
    
    resetAllCellHighlights() {
        if (this.gridLayoutMode === '2D') {
            for (let row = 0; row < this.currentGridSize; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    const cell = this.grid[row][col];
                    if (cell && !cell.userData.occupied) {
                        this.resetCellHighlight(cell);
                        cell.userData.isHovered = false;
                    }
                }
            }
        } else {
            // 3D mode
            for (let row = 0; row < this.currentGridSize; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    for (let d = 0; d < this.gridDepth; d++) {
                        const cell = this.grid[row][col][d];
                        if (cell && !cell.userData.occupied) {
                            this.resetCellHighlight(cell);
                            cell.userData.isHovered = false;
                        }
                    }
                }
            }
        }
    }
    
    highlightCell(cell, color, intensity) {
        if (cell && cell.material) {
            cell.material.emissive.setHex(color);
            cell.material.emissiveIntensity = intensity;
            cell.material.needsUpdate = true;
        }
    }
    
    resetCellHighlight(cell) {
        if (cell && cell.material) {
            cell.material.emissive.setHex(0x1a202c);
            cell.material.emissiveIntensity = 0.1;
            cell.material.needsUpdate = true;
        }
    }
    
    // Highlight valid placement cells when a letter is falling
    highlightValidPlacementCells() {
        if (!this.fallingLetter) return;
        
        const validCells = this.getValidPlacementCells();
        
        validCells.forEach(cell => {
            this.highlightCell(cell, 0x00ff00, 0.4); // Green highlight for valid cells
        });
    }
    
    getValidPlacementCells() {
        const validCells = [];
        
        if (this.gridLayoutMode === '2D') {
            for (let row = 0; row < this.currentGridSize; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    const cell = this.grid[row][col];
                    if (cell && !cell.userData.occupied) {
                        validCells.push(cell);
                    }
                }
            }
        } else {
            // 3D mode - find topmost empty cell in each column
            for (let col = 0; col < this.currentGridSize; col++) {
                for (let d = this.gridDepth - 1; d >= 0; d--) {
                    const cell = this.grid[this.fallingLetterPosition.row][col][d];
                    if (cell && !cell.userData.occupied) {
                        validCells.push(cell);
                        break; // Only highlight topmost empty cell
                    }
                }
            }
        }
        
        return validCells;
    }
    
    handleMouseEnter(event) {
        // Add cursor style for better UX
        document.body.style.cursor = 'pointer';
    }
    
    handleMouseLeave(event) {
        // Reset cursor and clear hover effects
        document.body.style.cursor = 'default';
        this.resetAllCellHighlights();
    }

    // 3D UI Elements Creation Methods
    create3DUIContainer() {
        // Create a container for all 3D UI elements
        this.uiContainer = new THREE.Group();
        this.uiContainer.name = 'UI_Container';
        this.scene.add(this.uiContainer);
        
        // Create additional containers for different UI sections
        this.controlsContainer = new THREE.Group();
        this.controlsContainer.name = 'Controls_Container';
        this.uiContainer.add(this.controlsContainer);
        
        this.cameraControlsContainer = new THREE.Group();
        this.cameraControlsContainer.name = 'Camera_Controls_Container';
        this.uiContainer.add(this.cameraControlsContainer);
        
        console.log('🎨 Created enhanced 3D UI container with multiple sections');
    }
    
    create3DLetterQueue(letters) {
        // Clear existing letter queue meshes
        this.letterQueueMeshes.forEach(mesh => {
            if (mesh.parent) mesh.parent.remove(mesh);
        });
        this.letterQueueMeshes = [];
        
        if (!this.uiContainer) {
            this.create3DUIContainer();
        }
        
        // Position for letter queue (top right of the game area, floating above)
        const startX = 10;
        const startY = 10;
        const startZ = -5;
        const spacing = 1.8; // Increased spacing for better visibility
        
        // Create enhanced background panel for letter queue
        const panelGeometry = new THREE.PlaneGeometry(15, 3.5);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0a0a1a, 
            transparent: true, 
            opacity: 0.95 
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(startX + 7.5, startY, startZ);
        panel.rotation.x = -Math.PI / 8; // Gentler tilt for better visibility
        this.uiContainer.add(panel);
        
        // Add enhanced panel border/glow
        const borderGeometry = new THREE.PlaneGeometry(15.4, 3.7);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4facfe, 
            transparent: true, 
            opacity: 0.6 
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(startX + 7.5, startY, startZ - 0.01);
        border.rotation.x = -Math.PI / 8;
        this.uiContainer.add(border);
        
        // Add enhanced title for letter queue (using simple geometry instead of TextGeometry)
        const titleGeometry = new THREE.BoxGeometry(8, 0.5, 0.1).toNonIndexed();
        const titleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4facfe,
            emissive: 0x1a4fac,
            emissiveIntensity: 0.3
        });
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(startX + 7.5, startY + 1.8, startZ);
        titleMesh.rotation.x = -Math.PI / 8;
        this.uiContainer.add(titleMesh);
        
        letters.forEach((letter, index) => {
            const x = startX + (index * spacing);
            const y = startY;
            const z = startZ;
            
            // Create enhanced 3D letter mesh
            const letterMesh = this.create3DLetterMesh(letter, x, y, z);
            if (letterMesh) {
                // Add enhanced rotation animation
                letterMesh.userData.originalRotation = letterMesh.rotation.y;
                letterMesh.userData.animationSpeed = 0.03 + (index * 0.008);
                
                this.letterQueueMeshes.push(letterMesh);
                this.uiContainer.add(letterMesh);
            }
        });
        
        console.log(`🎯 Created enhanced 3D letter queue with ${letters.length} letters`);
    }
    
    create3DLetterMesh(letter, x, y, z) {
        // Try to use FBX model first
        if (this.fbxModels[letter]) {
            const model = this.fbxModels[letter].clone();
            model.position.set(x, y, z);
            model.scale.set(0.8, 0.8, 0.8); // Larger for better visibility
            model.rotation.y = Math.PI / 4; // Rotate for better view
            
            // Add enhanced glow effect
            this.addLetterGlow(model, 0x4facfe, 1.5);
            
            // Add enhanced particle effect
            this.addLetterParticles(model, 0x4facfe);
            
            return model;
        }
        
        // Fallback to enhanced text geometry (using simple geometry instead of TextGeometry)
        const textGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.3).toNonIndexed();
        
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4facfe,
            shininess: 100,
            emissive: 0x1a4fac,
            emissiveIntensity: 0.4
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, z);
        
        // Center the text
        const textWidth = 0.8;
        textMesh.position.x -= textWidth / 2;
        
        // Add enhanced glow effect
        this.addLetterGlow(textMesh, 0x4facfe, 1.2);
        
        // Add enhanced particle effect
        this.addLetterParticles(textMesh, 0x4facfe);
        
        return textMesh;
    }
    
    create3DWordList(words) {
        // Clear existing word list meshes
        this.wordListMeshes.forEach(mesh => {
            if (mesh.parent) mesh.parent.remove(mesh);
        });
        this.wordListMeshes = [];
        
        if (!this.uiContainer) {
            this.create3DUIContainer();
        }
        
        // Position for word list (top left of the game area, floating above)
        const startX = -12;
        const startY = 10;
        const startZ = -5;
        const spacing = 1.2; // Increased spacing for better fit
        
        // Create enhanced background panel for word list
        const panelGeometry = new THREE.PlaneGeometry(10, 5);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0a0a1a, 
            transparent: true, 
            opacity: 0.95 
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(startX + 5, startY, startZ);
        panel.rotation.x = -Math.PI / 8; // Gentler tilt for better visibility
        this.uiContainer.add(panel);
        
        // Add enhanced panel border/glow
        const borderGeometry = new THREE.PlaneGeometry(10.2, 5.2);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00f2fe, 
            transparent: true, 
            opacity: 0.6 
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(startX + 5, startY, startZ - 0.01);
        border.rotation.x = -Math.PI / 8;
        this.uiContainer.add(border);
        
        // Add enhanced title for word list (using simple geometry instead of TextGeometry)
        const titleGeometry = new THREE.BoxGeometry(6, 0.5, 0.1).toNonIndexed();
        const titleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00f2fe,
            emissive: 0x1a00f2,
            emissiveIntensity: 0.3
        });
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(startX + 5, startY + 2.2, startZ);
        titleMesh.rotation.x = -Math.PI / 8;
        this.uiContainer.add(titleMesh);
        
        words.forEach((word, index) => {
            const x = startX + 1;
            const y = startY + 1.5 - (index * spacing);
            const z = startZ;
            
            // Create enhanced 3D word text
            const wordMesh = this.create3DWordMesh(word, x, y, z);
            if (wordMesh) {
                // Add enhanced floating animation
                wordMesh.userData.originalY = y;
                wordMesh.userData.animationSpeed = 0.015 + (index * 0.003);
                
                this.wordListMeshes.push(wordMesh);
                this.uiContainer.add(wordMesh);
            }
        });
        
        console.log(`📝 Created enhanced 3D word list with ${words.length} words`);
    }
    
    create3DWordMesh(word, x, y, z) {
        // Create enhanced text geometry for the word (using simple geometry instead of TextGeometry)
        const textGeometry = new THREE.BoxGeometry(word.length * 0.6, 0.8, 0.1).toNonIndexed();
        
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            shininess: 80,
            emissive: 0x333333,
            emissiveIntensity: 0.3
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, z);
        
        // Center the text
        const textWidth = word.length * 0.6;
        textMesh.position.x -= textWidth / 2;
        
        // Add enhanced glow effect
        this.addLetterGlow(textMesh, 0x00f2fe, 1.0);
        
        return textMesh;
    }
    
    create3DStatsDisplay(stats) {
        if (!this.uiContainer) {
            this.create3DUIContainer();
        }
        
        // Position for stats display (bottom center of the game area)
        const startX = 0;
        const startY = -8;
        const startZ = -5;
        const spacing = 3.0; // Increased spacing for better fit
        
        // Create enhanced background panel for stats
        const panelGeometry = new THREE.PlaneGeometry(18, 4);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0a0a1a, 
            transparent: true, 
            opacity: 0.95 
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(startX, startY, startZ);
        panel.rotation.x = Math.PI / 8; // Gentler tilt for better visibility
        this.uiContainer.add(panel);
        
        // Add enhanced panel border/glow
        const borderGeometry = new THREE.PlaneGeometry(18.2, 4.2);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff6b6b, 
            transparent: true, 
            opacity: 0.6 
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(startX, startY, startZ - 0.01);
        border.rotation.x = Math.PI / 8;
        this.uiContainer.add(border);
        
        // Add enhanced title for stats (using simple geometry instead of TextGeometry)
        const titleGeometry = new THREE.BoxGeometry(8, 0.5, 0.1).toNonIndexed();
        const titleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6b6b,
            emissive: 0x4a1a1a,
            emissiveIntensity: 0.3
        });
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(startX - 4, startY + 2, startZ);
        titleMesh.rotation.x = Math.PI / 8;
        this.uiContainer.add(titleMesh);
        
        // Create enhanced stats text
        const statsText = [
            `Score: ${stats.score || 0}`,
            `Niveau: ${stats.level || 1}`,
            `Combo: ${stats.combo || 0}`,
            `Mots: ${stats.wordsFound || 0}`
        ];
        
        statsText.forEach((text, index) => {
            const x = startX - 7 + (index * spacing);
            const y = startY;
            const z = startZ;
            
            const statMesh = this.create3DStatMesh(text, x, y, z);
            if (statMesh) {
                // Add enhanced pulsing animation for stats
                statMesh.userData.originalScale = statMesh.scale.clone();
                statMesh.userData.pulseSpeed = 0.06 + (index * 0.015);
                
                this.uiContainer.add(statMesh);
            }
        });
        
        console.log('📊 Created enhanced 3D stats display');
    }
    
    create3DStatMesh(text, x, y, z) {
        // Create enhanced text geometry for the stat (using simple geometry instead of TextGeometry)
        const textGeometry = new THREE.BoxGeometry(text.length * 0.4, 0.6, 0.1).toNonIndexed();
        
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00f2fe,
            shininess: 50,
            emissive: 0x004040,
            emissiveIntensity: 0.4
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, z);
        
        // Center the text
        const textWidth = text.length * 0.4;
        textMesh.position.x -= textWidth / 2;
        
        // Add enhanced glow effect
        this.addLetterGlow(textMesh, 0x00f2fe, 0.8);
        
        return textMesh;
    }
    
    // NEW: Create 3D Game Controls
    create3DGameControls() {
        if (!this.uiContainer) {
            this.create3DUIContainer();
        }
        
        // Position for game controls (bottom right of the game area)
        const startX = 8;
        const startY = -8;
        const startZ = -5;
        const buttonSpacing = 2.5;
        
        // Create enhanced background panel for controls
        const panelGeometry = new THREE.PlaneGeometry(12, 6);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0a0a1a, 
            transparent: true, 
            opacity: 0.95 
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(startX + 6, startY, startZ);
        panel.rotation.x = Math.PI / 8;
        this.uiContainer.add(panel);
        
        // Add enhanced panel border/glow
        const borderGeometry = new THREE.PlaneGeometry(12.2, 6.2);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4caf50, 
            transparent: true, 
            opacity: 0.6 
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(startX + 6, startY, startZ - 0.01);
        border.rotation.x = Math.PI / 8;
        this.uiContainer.add(border);
        
        // Add enhanced title for controls (using simple geometry instead of TextGeometry)
        const titleGeometry = new THREE.BoxGeometry(6, 0.5, 0.1).toNonIndexed();
        const titleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4caf50,
            emissive: 0x1a4c1a,
            emissiveIntensity: 0.3
        });
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(startX + 6, startY + 2.5, startZ);
        titleMesh.rotation.x = Math.PI / 8;
        this.uiContainer.add(titleMesh);
        
        // Create control buttons
        const controls = [
            { text: 'Start', action: 'start', color: 0x4caf50 },
            { text: 'Pause', action: 'pause', color: 0xff9800 },
            { text: 'Reset', action: 'reset', color: 0xf44336 },
            { text: 'Full', action: 'fullscreen', color: 0x9c27b0 }
        ];
        
        controls.forEach((control, index) => {
            const x = startX + 1 + (index % 2) * buttonSpacing;
            const y = startY + 1 - Math.floor(index / 2) * buttonSpacing;
            const z = startZ;
            
            this.create3DControlButton(control.text, control.action, control.color, x, y, z);
        });
        
        console.log('🎮 Created enhanced 3D game controls');
    }
    
    create3DControlButton(text, action, color, x, y, z) {
        // Create button background
        const buttonGeometry = new THREE.PlaneGeometry(2, 1);
        const buttonMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: true, 
            opacity: 0.8 
        });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(x, y, z);
        button.rotation.x = Math.PI / 8;
        button.userData.action = action;
        button.userData.originalColor = color;
        this.uiContainer.add(button);
        
        // Create button text (using simple geometry instead of TextGeometry)
        const textGeometry = new THREE.BoxGeometry(text.length * 0.2, 0.3, 0.05).toNonIndexed();
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            emissive: 0x333333,
            emissiveIntensity: 0.2
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, z + 0.01);
        textMesh.rotation.x = Math.PI / 8;
        
        // Center the text
        const textWidth = text.length * 0.2;
        textMesh.position.x -= textWidth / 2;
        
        this.uiContainer.add(textMesh);
        
        // Add hover effect
        button.userData.textMesh = textMesh;
        button.userData.originalScale = button.scale.clone();
    }
    
    // NEW: Create 3D Camera Controls
    create3DCameraControls() {
        if (!this.uiContainer) {
            this.create3DUIContainer();
        }
        
        // Position for camera controls (bottom left of the game area)
        const startX = -12;
        const startY = -8;
        const startZ = -5;
        const buttonSpacing = 2.5;
        
        // Create enhanced background panel for camera controls
        const panelGeometry = new THREE.PlaneGeometry(10, 6);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0a0a1a, 
            transparent: true, 
            opacity: 0.95 
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(startX + 5, startY, startZ);
        panel.rotation.x = Math.PI / 8;
        this.uiContainer.add(panel);
        
        // Add enhanced panel border/glow
        const borderGeometry = new THREE.PlaneGeometry(10.2, 6.2);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff9800, 
            transparent: true, 
            opacity: 0.6 
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(startX + 5, startY, startZ - 0.01);
        border.rotation.x = Math.PI / 8;
        this.uiContainer.add(border);
        
        // Add enhanced title for camera controls (using simple geometry instead of TextGeometry)
        const titleGeometry = new THREE.BoxGeometry(4, 0.5, 0.1).toNonIndexed();
        const titleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff9800,
            emissive: 0x4a1a00,
            emissiveIntensity: 0.3
        });
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(startX + 5, startY + 2.5, startZ);
        titleMesh.rotation.x = Math.PI / 8;
        this.uiContainer.add(titleMesh);
        
        // Create camera control buttons
        const cameraControls = [
            { text: 'F', action: 'front', color: 0xff9800 },
            { text: 'I', action: 'isometric', color: 0xff9800 },
            { text: 'T', action: 'top', color: 0xff9800 },
            { text: 'S', action: 'side', color: 0xff9800 }
        ];
        
        cameraControls.forEach((control, index) => {
            const x = startX + 1 + (index % 2) * buttonSpacing;
            const y = startY + 1 - Math.floor(index / 2) * buttonSpacing;
            const z = startZ;
            
            this.create3DControlButton(control.text, control.action, control.color, x, y, z);
        });
        
        console.log('📷 Created enhanced 3D camera controls');
    }
    
    update3DUI(letterQueue, targetWords, stats) {
        // Update 3D letter queue
        if (letterQueue && letterQueue.length > 0) {
            this.create3DLetterQueue(letterQueue);
        }
        
        // Update 3D word list
        if (targetWords && targetWords.length > 0) {
            this.create3DWordList(targetWords);
        }
        
        // Update 3D stats display
        if (stats) {
            this.create3DStatsDisplay(stats);
        }
        
        // Create 3D game controls
        this.create3DGameControls();
        
        // Create 3D camera controls
        this.create3DCameraControls();
    }
    
    clear3DUI() {
        // Clear all 3D UI elements
        if (this.uiContainer) {
            this.scene.remove(this.uiContainer);
            this.uiContainer = null;
        }
        
        this.letterQueueMeshes = [];
        this.wordListMeshes = [];
        
        console.log('🧹 Cleared 3D UI elements');
    }
    
    update3DUIAnimations() {
        // Animate letter queue meshes with enhanced effects
        this.letterQueueMeshes.forEach((mesh, index) => {
            if (mesh.userData.animationSpeed) {
                mesh.rotation.y += mesh.userData.animationSpeed;
                
                // Add subtle floating effect
                const time = Date.now() * 0.001;
                mesh.position.y += Math.sin(time * 2 + index) * 0.001;
            }
        });
        
        // Animate word list meshes with enhanced effects
        this.wordListMeshes.forEach((mesh, index) => {
            if (mesh.userData.originalY !== undefined && mesh.userData.animationSpeed) {
                const time = Date.now() * 0.001;
                mesh.position.y = mesh.userData.originalY + Math.sin(time * mesh.userData.animationSpeed) * 0.15;
                
                // Add subtle rotation
                mesh.rotation.y = Math.sin(time * 0.5 + index) * 0.1;
            }
        });
        
        // Animate stats meshes with enhanced pulsing effect
        if (this.uiContainer) {
            this.uiContainer.children.forEach(child => {
                if (child.userData.pulseSpeed) {
                    const time = Date.now() * 0.001;
                    const pulse = 1 + Math.sin(time * child.userData.pulseSpeed) * 0.15;
                    child.scale.setScalar(pulse);
                }
            });
        }
        
        // Animate control buttons with subtle effects
        if (this.uiContainer) {
            this.uiContainer.children.forEach(child => {
                if (child.userData.action) {
                    const time = Date.now() * 0.001;
                    const hover = 1 + Math.sin(time * 3) * 0.02;
                    child.scale.setScalar(hover);
                }
            });
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Enhanced3DGame };
}