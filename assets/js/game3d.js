// Game3D Class for Letters Cascade Challenge
// Extracted from game.html and adapted for unified game system

class Game3D {
    constructor() {
        console.log('🎮 Initializing Unified 3D Game...');
        
        // Game State
        this.gameRunning = false;
        this.paused = false;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.wordsFound = [];
        this.startTime = null;
        
        // Grid Mode (2D or 3D layout)
        this.gridMode = '2D'; // '2D' or '3D'
        
        // Game Over State
        this.gameOverScreen = {
            visible: false,
            fadeIn: 0,
            showStats: false,
            finalStats: {
                totalScore: 0,
                wordsCompleted: 0,
                lettersPlaced: 0,
                playTime: 0,
                levelReached: 1,
                maxCombo: 1
            }
        };
        
        // Game Over Conditions
        this.gameOverConditions = {
            gridFull: false,
            timeLimit: false,
            noValidMoves: false,
            scoreThreshold: false
        };
        
        // Game Limits
        this.gameLimits = {
            maxGridFill: 0.85,
            timeLimit: 300000,
            minScoreForLevel: 100,
            maxLevel: 10
        };
        
        // 3D Scene Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.mouse = null;
        
        // Game Mechanics
        this.currentGridSize = 8;
        this.cellSize = 1.0;
        this.grid = [];
        this.letters = [];
        this.letterQueue = [];
        this.targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'];
        this.fallingLetter = null;
        this.fallingLetterPosition = { row: 0, col: 0 };
        this.fallSpeed = 1000;
        this.fallTimer = null;
        
        // Letter Movement (only left, right, down)
        this.currentLetterPosition = { row: 0, col: 0 };
        this.letterMovementSpeed = 0.1;
        
        // Balancing System
        this.balancingSystem = {
            letterFrequency: this.calculateLetterFrequency(),
            baseFallSpeed: 1000,
            minFallSpeed: 600,
            maxFallSpeed: 2000,
            speedMultiplier: 1.0,
            optimalGridSize: 10,
            gridSizeAdjustment: 0,
            wordDifficulty: {
                easy: ['CHAT', 'LIVRE', 'TABLE'],
                medium: ['MAISON', 'JARDIN', 'PORTE'],
                hard: ['MUSIQUE', 'FENÊTRE']
            },
            levelBalance: {
                lettersPerLevel: 3,
                speedIncrease: 0.1,
                complexityIncrease: 0.15
            }
        };
        
        // 3D Specific
        this.cubes = [];
        this.textMeshes = [];
        this.lights = [];
        this.particles = [];
        this.fallingLetterMesh = null;
        
        // Systems
        this.dictionary = this.loadDictionary();
        this.wordDetector = new WordDetector3D(this.dictionary);
        this.scoreManager = new ScoreManager3D();
        this.levelManager = new LevelManager3D();
        this.audioManager = new AudioManager3D();
        this.particleSystem = new ParticleSystem3D();
        
        console.log('✅ Game3D constructor completed');
    }
    
    async init() {
        console.log('🚀 Initializing Game3D...');
        
        try {
            // Initialize Three.js
            this.initThreeJS();
            
            // Initialize game grid
            this.createGrid();
            
            // Generate initial letter queue
            this.generateLetterQueue();
            
            // Setup controls
            this.setupControls();
            
            // Add hover effects for better placement visibility
            this.addHoverEffects();
            
            // Start render loop
            this.startRenderLoop();
            
            // Add visual feedback to show the game is ready
            this.addVisualFeedback();
            
            console.log('✅ Game3D initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Game3D:', error);
            throw error;
        }
    }
    
    initThreeJS() {
        console.log('🎨 Initializing Three.js with Periodic Table Style...');
        
        // Create scene with periodic table style
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Deep black background like periodic table
        
        // Create camera with better positioning
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(600, 600);
        this.renderer.setClearColor(0x000000);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Enhanced rendering settings for periodic table style
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x000000, 20, 100);
        
        // Initialize raycaster for mouse interactions
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add to DOM
        const container = document.getElementById('threejsCanvas');
        if (container) {
            container.appendChild(this.renderer.domElement);
            console.log('✅ Canvas successfully attached to threejsCanvas container');
        } else {
            console.error('❌ Canvas element not found! Cannot initialize game.');
            console.error('Looking for element with id="threejsCanvas"');
            console.error('Available elements:', document.querySelectorAll('[id*="canvas"], [id*="Canvas"]'));
            throw new Error('Canvas element not found! Cannot initialize game.');
        }
        
        // Setup lighting
        this.setupLighting();
        
        console.log('✅ Three.js initialized with Periodic Table Style');
    }
    
    setupLighting() {
        console.log('💡 Setting up enhanced lighting...');
        
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(15, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Additional point lights for periodic table effect
        const pointLight1 = new THREE.PointLight(0x4facfe, 0.8, 20);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x00f2fe, 0.6, 15);
        pointLight2.position.set(-5, 3, 3);
        this.scene.add(pointLight2);
        this.lights.push(pointLight2);
        
        const pointLight3 = new THREE.PointLight(0xff6b6b, 0.4, 12);
        pointLight3.position.set(0, -5, 5);
        this.scene.add(pointLight3);
        this.lights.push(pointLight3);
        
        console.log('✅ Enhanced lighting setup complete');
    }
    
    createGrid() {
        console.log(`📐 Creating ${this.gridMode} grid layout with Enhanced Visibility...`);
        
        this.grid = [];
        
        // Increase cell size for better visibility
        this.cellSize = 1.5; // Increased from 1.0 for better visibility
        
        if (this.gridMode === '2D') {
            // 2D layout: flat L×L grid with enhanced visibility
            for (let row = 0; row < this.currentGridSize; row++) {
                this.grid[row] = [];
                for (let col = 0; col < this.currentGridSize; col++) {
                    // Create larger cell with better proportions
                    const cellGeometry = new THREE.BoxGeometry(this.cellSize * 0.95, this.cellSize * 0.95, this.cellSize * 0.15).toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed();
                    
                    // Create enhanced material with better visibility
                    const cellMaterial = new THREE.MeshPhongMaterial({ 
                        color: 0x2d3748, // Lighter slate for better contrast
                        transparent: true,
                        opacity: 0.9,
                        shininess: 80,
                        specular: 0x4facfe,
                        emissive: 0x1a202c, // Subtle glow for empty cells
                        emissiveIntensity: 0.1
                    });
                    
                    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                    
                    // 2D layout: flat grid with better spacing
                    cell.position.set(
                        (col - this.currentGridSize / 2 + 0.5) * this.cellSize,
                        (row - this.currentGridSize / 2 + 0.5) * this.cellSize,
                        0
                    );
                    
                    // Add subtle rotation for dynamic effect
                    cell.rotation.x = Math.random() * 0.05 - 0.025;
                    cell.rotation.y = Math.random() * 0.05 - 0.025;
                    
                    cell.castShadow = true;
                    cell.receiveShadow = true;
                    
                    cell.userData = {
                        row: row,
                        col: col,
                        depth: 0,
                        occupied: false,
                        letter: null,
                        letterValue: null,
                        originalColor: 0x2d3748,
                        isHovered: false,
                        isEmpty: true
                    };
                    
                    this.scene.add(cell);
                    this.grid[row][col] = cell;
                    
                    // Add visual indicator for empty cell (subtle border)
                    this.addCellBorder(cell, 0x4facfe, 0.3);
                }
            }
        } else {
            // 3D layout: L×L×profondeur volumetric grid with enhanced visibility
            const depth = Math.floor(this.currentGridSize / 2); // Depth based on grid size
            
            for (let row = 0; row < this.currentGridSize; row++) {
                this.grid[row] = [];
                for (let col = 0; col < this.currentGridSize; col++) {
                    this.grid[row][col] = [];
                    
                    for (let d = 0; d < depth; d++) {
                        // Create larger cell with better proportions
                        const cellGeometry = new THREE.BoxGeometry(this.cellSize * 0.95, this.cellSize * 0.95, this.cellSize * 0.95).toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed();
                        
                        // Create enhanced material with better visibility
                        const cellMaterial = new THREE.MeshPhongMaterial({ 
                            color: 0x2d3748, // Lighter slate for better contrast
                            transparent: true,
                            opacity: 0.85 - (d * 0.08), // Better opacity range
                            shininess: 80,
                            specular: 0x4facfe,
                            emissive: 0x1a202c, // Subtle glow for empty cells
                            emissiveIntensity: 0.1 - (d * 0.02)
                        });
                        
                        const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                        
                        // 3D layout: L×L×profondeur grid with better spacing
                        cell.position.set(
                            (col - this.currentGridSize / 2 + 0.5) * this.cellSize,
                            (row - this.currentGridSize / 2 + 0.5) * this.cellSize,
                            (d - depth / 2 + 0.5) * this.cellSize
                        );
                        
                        // Add subtle rotation for dynamic effect
                        cell.rotation.x = Math.random() * 0.05 - 0.025;
                        cell.rotation.y = Math.random() * 0.05 - 0.025;
                        
                        cell.castShadow = true;
                        cell.receiveShadow = true;
                        
                        cell.userData = {
                            row: row,
                            col: col,
                            depth: d,
                            occupied: false,
                            letter: null,
                            letterValue: null,
                            originalColor: 0x2d3748,
                            isHovered: false,
                            isEmpty: true
                        };
                        
                        this.scene.add(cell);
                        this.grid[row][col][d] = cell;
                        
                        // Add visual indicator for empty cell (subtle border)
                        this.addCellBorder(cell, 0x4facfe, 0.3);
                    }
                }
            }
        }
        
        // Add enhanced grid helper for better reference
        const gridHelper = new THREE.GridHelper(this.currentGridSize * this.cellSize, this.currentGridSize, 0x4facfe, 0x2d3748);
        gridHelper.position.y = -0.1;
        gridHelper.material.opacity = 0.4;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Add cell labels for better navigation
        this.addCellLabels();
        
        console.log(`✅ ${this.gridMode} grid created with Enhanced Visibility - ${this.gridMode === '3D' ? 'L×L×' + Math.floor(this.currentGridSize / 2) + ' depth' : 'L×L flat'}`);
    }
    
    // Add visual border to cells for better definition
    addCellBorder(cell, color, opacity) {
        const borderGeometry = new THREE.EdgesGeometry(cell.geometry);
        const borderMaterial = new THREE.LineBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: opacity,
            linewidth: 2
        });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        border.position.copy(cell.position);
        border.rotation.copy(cell.rotation);
        this.scene.add(border);
    }
    
    // Add cell labels for better navigation
    addCellLabels() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add row labels (A, B, C, D, E, F, G, H)
        for (let i = 0; i < this.currentGridSize; i++) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillText(String.fromCharCode(65 + i), canvas.width/2, canvas.height/2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            const geometry = new THREE.PlaneGeometry(0.3, 0.3);
            const label = new THREE.Mesh(geometry, material);
            
            label.position.set(
                -this.currentGridSize * this.cellSize / 2 - 0.5,
                (i - this.currentGridSize / 2 + 0.5) * this.cellSize,
                0
            );
            label.rotation.x = -Math.PI / 2;
            
            this.scene.add(label);
        }
        
        // Add column labels (1, 2, 3, 4, 5, 6, 7, 8)
        for (let i = 0; i < this.currentGridSize; i++) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillText((i + 1).toString(), canvas.width/2, canvas.height/2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            const geometry = new THREE.PlaneGeometry(0.3, 0.3);
            const label = new THREE.Mesh(geometry, material);
            
            label.position.set(
                (i - this.currentGridSize / 2 + 0.5) * this.cellSize,
                -this.currentGridSize * this.cellSize / 2 - 0.5,
                0
            );
            label.rotation.x = -Math.PI / 2;
            
            this.scene.add(label);
        }
    }
    
    generateLetterQueue() {
        console.log('📝 Generating letter queue...');
        
        this.letterQueue = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < 8; i++) {
            const letter = letters[Math.floor(Math.random() * letters.length)];
            this.letterQueue.push(letter);
        }
        
        console.log('✅ Letter queue generated:', this.letterQueue);
    }
    
    setupControls() {
        console.log('🎮 Setting up enhanced controls...');
        
        // Mouse controls for camera
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const deltaMove = {
                    x: event.clientX - previousMousePosition.x,
                    y: event.clientY - previousMousePosition.y
                };
                
                // Rotate camera around the grid
                const distance = this.camera.position.length();
                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= deltaMove.x * 0.01;
                spherical.phi += deltaMove.y * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                
                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);
                
                previousMousePosition = { x: event.clientX, y: event.clientY };
            }
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Click to place letters (only when not dragging)
        this.renderer.domElement.addEventListener('click', (event) => {
            if (!isDragging) {
                this.handleMouseClick(event);
            }
        });
        
        // Mouse wheel for zoom
        this.renderer.domElement.addEventListener('wheel', (event) => {
            const zoomSpeed = 0.1;
            const distance = this.camera.position.length();
            const newDistance = distance + event.deltaY * zoomSpeed;
            
            // Clamp zoom distance
            const clampedDistance = Math.max(5, Math.min(30, newDistance));
            this.camera.position.normalize().multiplyScalar(clampedDistance);
        });
        
        // Keyboard controls for letter movement
        document.addEventListener('keydown', (event) => {
            if (!this.gameRunning || this.paused) return;
            
            switch(event.code) {
                case 'ArrowLeft':
                    this.moveLetter('left');
                    break;
                case 'ArrowRight':
                    this.moveLetter('right');
                    break;
                case 'ArrowDown':
                    this.moveLetter('down');
                    break;
                case 'Enter':
                case 'Space':
                    this.placeCurrentLetter();
                    break;
            }
        });
        
        console.log('✅ Enhanced controls setup complete');
    }
    
    handleMouseClick(event) {
        if (!this.gameRunning || this.paused) return;
        
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Raycasting
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const cell = intersect.object;
            
            if (cell.userData && typeof cell.userData.row === 'number') {
                this.placeLetterAt(cell.userData.row, cell.userData.col);
            }
        }
    }
    
    placeLetterAt(row, col) {
        if (!this.fallingLetter || row < 0 || row >= this.currentGridSize || col < 0 || col >= this.currentGridSize) {
            return;
        }
        
        console.log(`🎯 Placing letter ${this.fallingLetter} at position (${row}, ${col})`);
        
        // Add comprehensive null checks
        if (!this.grid || !Array.isArray(this.grid) || 
            !this.grid[row] || !Array.isArray(this.grid[row]) || 
            !this.grid[row][col]) {
            console.warn(`⚠️ Invalid grid position: (${row}, ${col})`);
            return;
        }
        
        if (this.gridMode === '2D') {
            // 2D mode: simple placement
            const cell = this.grid[row][col];
            if (cell && cell.userData && !cell.userData.occupied) {
                this.createLetter3D(this.fallingLetter, row, col);
                this.addPlacementEffect(row, col);
                this.score += 10;
                
                // Play sound effect
                if (this.audioManager) {
                    this.audioManager.playSound('letterPlace');
                }
                
                // Add score popup
                this.createScorePopup(row, col, 10);
                
                // Clear current falling letter
                this.fallingLetter = null;
                if (this.fallingLetterMesh) {
                    this.scene.remove(this.fallingLetterMesh);
                    this.fallingLetterMesh = null;
                }
                
                // Create next falling letter
                this.createFallingLetter();
            }
        } else {
            // 3D mode: find first available depth layer
            const depthArray = this.grid[row][col];
            if (depthArray && Array.isArray(depthArray)) {
                for (let d = 0; d < depthArray.length; d++) {
                    const cell = depthArray[d];
                    if (cell && cell.userData && !cell.userData.occupied) {
                        this.createLetter3D(this.fallingLetter, row, col, d);
                        this.addPlacementEffect(row, col, d);
                        this.score += 10;
                        
                        // Play sound effect
                        if (this.audioManager) {
                            this.audioManager.playSound('letterPlace');
                        }
                        
                        // Add score popup
                        this.createScorePopup(row, col, 10);
                        
                        // Clear current falling letter
                        this.fallingLetter = null;
                        if (this.fallingLetterMesh) {
                            this.scene.remove(this.fallingLetterMesh);
                            this.fallingLetterMesh = null;
                        }
                        
                        // Create next falling letter
                        this.createFallingLetter();
                        break;
                    }
                }
            }
        }
    }
    
    createScorePopup(row, col, points) {
        // Create floating score text
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw score text
        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${points}`, 64, 32);
        
        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshLambertMaterial({ 
            map: texture,
            transparent: true,
            opacity: 1
        });
        
        // Create plane geometry for score text
        const geometry = new THREE.PlaneGeometry(1, 0.5);
        const scoreMesh = new THREE.Mesh(geometry, material);
        
        // Position above the placed letter with null checks
        if (this.grid && Array.isArray(this.grid) && 
            this.grid[row] && Array.isArray(this.grid[row]) && 
            this.grid[row][col]) {
            
            if (this.gridMode === '2D') {
                const cell = this.grid[row][col];
                if (cell && cell.position) {
                    scoreMesh.position.copy(cell.position);
                    scoreMesh.position.z += 1;
                }
            } else {
                const depthArray = this.grid[row][col];
                if (depthArray && Array.isArray(depthArray) && depthArray[0]) {
                    const cell = depthArray[0];
                    if (cell && cell.position) {
                        scoreMesh.position.copy(cell.position);
                        scoreMesh.position.z += 1;
                    }
                }
            }
        }
        
        this.scene.add(scoreMesh);
        
        // Animate score popup
        let opacity = 1;
        const animate = () => {
            opacity -= 0.02;
            scoreMesh.material.opacity = opacity;
            scoreMesh.position.y += 0.02;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(scoreMesh);
            }
        };
        animate();
    }
    
    moveLetter(direction) {
        if (!this.fallingLetter) return;
        
        const { row, col } = this.currentLetterPosition;
        let newRow = row;
        let newCol = col;
        
        switch(direction) {
            case 'left':
                newCol = Math.max(0, col - 1);
                break;
            case 'right':
                newCol = Math.min(this.currentGridSize - 1, col + 1);
                break;
            case 'down':
                newRow = Math.min(this.currentGridSize - 1, row + 1);
                break;
        }
        
        // Check if the new position is valid
        if (this.gridMode === '2D') {
            // 2D mode: check if cell is occupied
            if (!this.grid[newRow][newCol].userData.occupied) {
                this.currentLetterPosition = { row: newRow, col: newCol };
                this.updateFallingLetterPosition();
            }
        } else {
            // 3D mode: check if any depth layer is available
            const depth = this.grid[newRow][newCol].length;
            let hasSpace = false;
            for (let d = 0; d < depth; d++) {
                if (!this.grid[newRow][newCol][d].userData.occupied) {
                    hasSpace = true;
                    break;
                }
            }
            if (hasSpace) {
                this.currentLetterPosition = { row: newRow, col: newCol };
                this.updateFallingLetterPosition();
            }
        }
    }
    
    placeCurrentLetter() {
        const { row, col } = this.currentLetterPosition;
        this.placeLetterAt(row, col);
    }
    
    updateFallingLetterPosition() {
        // Update the visual position of the falling letter
        if (this.fallingLetterMesh) {
            const { row, col } = this.currentLetterPosition;
            
            // Add comprehensive null checks
            if (this.grid && Array.isArray(this.grid) && 
                this.grid[row] && Array.isArray(this.grid[row]) && 
                this.grid[row][col]) {
                
                if (this.gridMode === '2D') {
                    // 2D mode: simple positioning
                    const cell = this.grid[row][col];
                    if (cell && cell.position) {
                        this.fallingLetterMesh.position.copy(cell.position);
                        this.fallingLetterMesh.position.z += 0.5; // Float above the cell
                    }
                } else {
                    // 3D mode: find the first available depth layer
                    const depthArray = this.grid[row][col];
                    if (depthArray && Array.isArray(depthArray)) {
                        let targetDepth = 0;
                        for (let d = 0; d < depthArray.length; d++) {
                            const cell = depthArray[d];
                            if (cell && cell.userData && !cell.userData.occupied) {
                                targetDepth = d;
                                break;
                            }
                        }
                        
                        const cell = depthArray[targetDepth];
                        if (cell && cell.position) {
                            this.fallingLetterMesh.position.copy(cell.position);
                            this.fallingLetterMesh.position.z += 0.5; // Float above the cell
                        }
                    }
                }
            }
        }
    }
    
    createLetter3D(letter, row, col, depth = 0) {
        console.log('🎯 Creating 3D letter with Periodic Table Style:', letter, 'at', row, col, depth);
        
        // Create letter geometry with periodic table style
        const letterGeometry = new THREE.BoxGeometry(this.cellSize * 0.85, this.cellSize * 0.85, this.cellSize * 0.3).toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed();
        
        // Create material with periodic table colors
        const letterColors = {
            'A': 0xef4444, 'B': 0xf97316, 'C': 0xeab308, 'D': 0x84cc16,
            'E': 0x22c55e, 'F': 0x14b8a6, 'G': 0x06b6d4, 'H': 0x3b82f6,
            'I': 0x6366f1, 'J': 0x8b5cf6, 'K': 0xa855f7, 'L': 0xd946ef,
            'M': 0xec4899, 'N': 0xf43f5e, 'O': 0xef4444, 'P': 0xf97316,
            'Q': 0xeab308, 'R': 0x84cc16, 'S': 0x22c55e, 'T': 0x14b8a6,
            'U': 0x06b6d4, 'V': 0x3b82f6, 'W': 0x6366f1, 'X': 0x8b5cf6,
            'Y': 0xa855f7, 'Z': 0xd946ef
        };
        
        const letterColor = letterColors[letter] || 0x4facfe;
        
        const letterMaterial = new THREE.MeshPhongMaterial({ 
            color: letterColor,
            transparent: true,
            opacity: 0.95,
            shininess: 150,
            specular: 0xffffff,
            emissive: letterColor
        });
        
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        
        // Position the letter with null checks
        if (this.grid && Array.isArray(this.grid) && 
            this.grid[row] && Array.isArray(this.grid[row]) && 
            this.grid[row][col]) {
            
            if (this.gridMode === '2D') {
                const cell = this.grid[row][col];
                if (cell && cell.position) {
                    letterMesh.position.copy(cell.position);
                    letterMesh.position.z += 0.2;
                }
            } else {
                const depthArray = this.grid[row][col];
                if (depthArray && Array.isArray(depthArray) && depthArray[depth]) {
                    const cell = depthArray[depth];
                    if (cell && cell.position) {
                        letterMesh.position.copy(cell.position);
                        letterMesh.position.z += 0.2;
                    }
                }
            }
        }
        
        // Add subtle rotation for dynamic effect
        letterMesh.rotation.x = Math.random() * 0.2 - 0.1;
        letterMesh.rotation.y = Math.random() * 0.2 - 0.1;
        
        letterMesh.castShadow = true;
        letterMesh.receiveShadow = true;
        
        this.scene.add(letterMesh);
        this.cubes.push(letterMesh);
        
        // Create letter text
        this.createLetterText(letter, row, col, letterColor, depth);
        
        // Update grid data with null checks
        if (this.grid && Array.isArray(this.grid) && 
            this.grid[row] && Array.isArray(this.grid[row]) && 
            this.grid[row][col]) {
            
            if (this.gridMode === '2D') {
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
        
        console.log(`✅ Letter ${letter} placed at (${row}, ${col}${this.gridMode === '3D' ? ', ' + depth : ''})`);
    }
    
    createLetterText(letter, row, col, color, depth = 0) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw letter on canvas
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, 32, 32);
        
        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshLambertMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        
        // Create plane geometry for text
        const geometry = new THREE.PlaneGeometry(0.6, 0.6);
        const textMesh = new THREE.Mesh(geometry, material);
        
        // Position text above letter with null checks
        if (this.grid && Array.isArray(this.grid) && 
            this.grid[row] && Array.isArray(this.grid[row]) && 
            this.grid[row][col]) {
            
            if (this.gridMode === '2D') {
                const cell = this.grid[row][col];
                if (cell && cell.position) {
                    textMesh.position.copy(cell.position);
                    textMesh.position.z += 0.4;
                }
            } else {
                const depthArray = this.grid[row][col];
                if (depthArray && Array.isArray(depthArray) && depthArray[depth]) {
                    const cell = depthArray[depth];
                    if (cell && cell.position) {
                        textMesh.position.copy(cell.position);
                        textMesh.position.z += 0.4;
                    }
                }
            }
        }
        
        this.scene.add(textMesh);
        this.textMeshes.push(textMesh);
    }
    
    startRenderLoop() {
        console.log('🎬 Starting enhanced render loop...');
        
        const animate = () => {
            requestAnimationFrame(animate);
            this.render();
            
            // Game loop logic
            if (this.gameRunning && !this.paused) {
                this.updateGame();
            }
        };
        
        animate();
    }
    
    updateGame() {
        // Automatic letter falling
        if (this.fallingLetter && this.fallTimer === null) {
            this.fallTimer = setTimeout(() => {
                this.dropFallingLetter();
                this.fallTimer = null;
            }, this.fallSpeed);
        }
        
        // Check for word completion
        this.checkWordCompletion();
        
        // Check for game over conditions
        this.checkGameOverConditions();
        
        // Update UI
        this.updateUI();
    }
    
    dropFallingLetter() {
        if (!this.fallingLetter) return;
        
        // Move letter down one position
        const { row, col } = this.currentLetterPosition;
        const newRow = row + 1;
        
        if (newRow >= this.currentGridSize) {
            // Letter reached bottom - place it
            this.placeCurrentLetter();
        } else {
            // Check if position below is occupied
            let canMove = false;
            
            // Add comprehensive null checks
            if (this.grid && Array.isArray(this.grid) && 
                this.grid[newRow] && Array.isArray(this.grid[newRow]) && 
                this.grid[newRow][col]) {
                
                if (this.gridMode === '2D') {
                    // 2D mode: direct cell access
                    const cell = this.grid[newRow][col];
                    if (cell && cell.userData) {
                        canMove = !cell.userData.occupied;
                    }
                } else {
                    // 3D mode: depth array access
                    const depthArray = this.grid[newRow][col];
                    if (depthArray && Array.isArray(depthArray)) {
                        for (let d = 0; d < depthArray.length; d++) {
                            const cell = depthArray[d];
                            if (cell && cell.userData && !cell.userData.occupied) {
                                canMove = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            if (canMove) {
                this.currentLetterPosition.row = newRow;
                this.updateFallingLetterPosition();
            } else {
                // Position below is occupied - place current letter
                this.placeCurrentLetter();
            }
        }
    }
    
    checkGameOverConditions() {
        // Check if grid is full
        let occupiedCells = 0;
        let totalCells = 0;
        
        if (this.grid && Array.isArray(this.grid)) {
            this.grid.forEach(row => {
                if (row && Array.isArray(row)) {
                    if (this.gridMode === '2D') {
                        row.forEach(cell => {
                            if (cell && cell.userData) {
                                totalCells++;
                                if (cell.userData.occupied) occupiedCells++;
                            }
                        });
                    } else {
                        // 3D mode: row is an array of depth arrays
                        row.forEach(depthArray => {
                            if (depthArray && Array.isArray(depthArray)) {
                                depthArray.forEach(cell => {
                                    if (cell && cell.userData) {
                                        totalCells++;
                                        if (cell.userData.occupied) occupiedCells++;
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
        
        if (totalCells > 0) {
            const fillPercentage = occupiedCells / totalCells;
            
            if (fillPercentage > this.gameLimits.maxGridFill) {
                this.gameOver = true;
                this.gameOverConditions.gridFull = true;
                this.endGame();
            }
        }
    }
    
    updateUI() {
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // Update level display
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
        
        // Update words found display
        const wordsElement = document.getElementById('wordsFound');
        if (wordsElement) {
            wordsElement.textContent = this.wordsFound.length;
        }
    }
    
    endGame() {
        console.log('🎯 Game Over!');
        this.gameRunning = false;
        this.paused = true;
        
        // Calculate final stats
        const playTime = Date.now() - this.startTime;
        this.gameOverScreen.finalStats = {
            totalScore: this.score,
            wordsCompleted: this.wordsFound.length,
            lettersPlaced: this.cubes.length,
            playTime: playTime,
            levelReached: this.level,
            maxCombo: this.combo
        };
        
        // Show game over screen
        this.showGameOverScreen();
    }
    
    showGameOverScreen() {
        this.gameOverScreen.visible = true;
        this.gameOverScreen.fadeIn = 0;
        
        // Animate fade in
        const fadeIn = () => {
            this.gameOverScreen.fadeIn += 0.02;
            if (this.gameOverScreen.fadeIn < 1) {
                requestAnimationFrame(fadeIn);
            } else {
                this.gameOverScreen.showStats = true;
            }
        };
        fadeIn();
    }
    
    render() {
        // Animate particles
        this.particles.forEach(particle => {
            particle.position.y += 0.01;
            particle.material.opacity -= 0.005;
            
            if (particle.material.opacity <= 0) {
                this.scene.remove(particle);
                this.particles.splice(this.particles.indexOf(particle), 1);
            }
        });
        
        // Animate grid cells with breathing effect
        if (this.grid && Array.isArray(this.grid)) {
            this.grid.forEach(row => {
                if (row && Array.isArray(row)) {
                    if (this.gridMode === '2D') {
                        row.forEach(cell => {
                            if (cell && cell.position && cell.material && cell.material.emissive) {
                                const time = Date.now() * 0.001;
                                const breathing = Math.sin(time + cell.position.x + cell.position.y) * 0.1;
                                cell.material.emissive.setScalar(0.1 + breathing);
                            }
                        });
                    } else {
                        // 3D mode: row is an array of depth arrays
                        row.forEach(depthArray => {
                            if (depthArray && Array.isArray(depthArray)) {
                                depthArray.forEach(cell => {
                                    if (cell && cell.position && cell.material && cell.material.emissive) {
                                        const time = Date.now() * 0.001;
                                        const breathing = Math.sin(time + cell.position.x + cell.position.y) * 0.1;
                                        cell.material.emissive.setScalar(0.1 + breathing);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
        
        // Animate falling letter with enhanced effects
        if (this.fallingLetterMesh && this.fallingLetterMesh.material) {
            const time = Date.now() * 0.002;
            this.fallingLetterMesh.position.y += Math.sin(time) * 0.02;
            this.fallingLetterMesh.rotation.y += 0.01;
            
            // Add pulsing effect (only if material supports it)
            if (this.fallingLetterMesh.material.emissive) {
                const pulse = Math.sin(time * 2) * 0.1 + 0.9;
                this.fallingLetterMesh.material.emissive.setScalar(0.2 * pulse);
            }
            
            // Add subtle color shift (only if material supports it)
            if (this.fallingLetterMesh.material.color) {
                const hueShift = Math.sin(time) * 0.1;
                this.fallingLetterMesh.material.color.offsetHSL(hueShift, 0, 0);
            }
        }
        
        // Animate placed letters with subtle movement
        this.cubes.forEach(cube => {
            const time = Date.now() * 0.001;
            const wobble = Math.sin(time + cube.position.x + cube.position.y) * 0.01;
            cube.rotation.z = wobble;
        });
        
        // Camera movement is now controlled only by user input
        // No automatic camera movement
        
        this.renderer.render(this.scene, this.camera);
    }
    
    startGame() {
        console.log('🎮 Starting 3D game...');
        this.gameRunning = true;
        this.paused = false;
        this.startTime = Date.now();
        this.createFallingLetter();
    }
    
    pauseGame() {
        console.log('⏸️ Pausing 3D game...');
        this.paused = true;
    }
    
    resumeGame() {
        console.log('▶️ Resuming 3D game...');
        this.paused = false;
    }
    
    resetGame() {
        console.log('🔄 Resetting 3D game...');
        
        // Clear existing letters
        this.cubes.forEach(cube => this.scene.remove(cube));
        this.textMeshes.forEach(text => this.scene.remove(text));
        this.cubes = [];
        this.textMeshes = [];
        
        // Clear falling letter
        if (this.fallingLetterMesh) {
            this.scene.remove(this.fallingLetterMesh);
            this.fallingLetterMesh = null;
        }
        
        // Reset game state
        this.gameRunning = false;
        this.paused = false;
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.wordsFound = [];
        this.fallingLetter = null;
        this.currentLetterPosition = { row: 0, col: Math.floor(this.currentGridSize / 2) };
        
        // Reset grid
        this.createGrid();
        this.generateLetterQueue();
        
        // Reset current letter position
        this.currentLetterPosition = { row: 0, col: Math.floor(this.currentGridSize / 2) };
        
        console.log('✅ 3D game reset complete');
    }
    
    switchGridMode(mode) {
        if (this.gridMode === mode) return;
        
        console.log(`🔄 Switching from ${this.gridMode} to ${mode} grid mode...`);
        this.gridMode = mode;
        
        // Clear current grid
        this.grid.forEach(row => {
            row.forEach(cell => {
                if (cell) {
                    this.scene.remove(cell);
                }
            });
        });
        
        // Clear falling letter
        if (this.fallingLetterMesh) {
            this.scene.remove(this.fallingLetterMesh);
            this.fallingLetterMesh = null;
        }
        
        // Recreate grid with new mode
        this.createGrid();
        
        // Reset letter position
        this.currentLetterPosition = { row: 0, col: Math.floor(this.currentGridSize / 2) };
        
        // Recreate falling letter if game is running
        if (this.gameRunning && this.fallingLetter) {
            this.createFallingLetterMesh();
        }
        
        console.log(`✅ Switched to ${mode} grid mode`);
    }
    
    createFallingLetter() {
        if (this.letterQueue.length > 0 && !this.fallingLetter) {
            this.fallingLetter = this.letterQueue.shift();
            this.currentLetterPosition = { row: 0, col: Math.floor(this.currentGridSize / 2) };
            this.createFallingLetterMesh();
            console.log('📝 Created falling letter:', this.fallingLetter);
        }
    }
    
    createFallingLetterMesh() {
        if (!this.fallingLetter) return;
        
        // Remove previous falling letter mesh
        if (this.fallingLetterMesh) {
            this.scene.remove(this.fallingLetterMesh);
        }
        
        // Create letter geometry with periodic table style
        const letterGeometry = new THREE.BoxGeometry(this.cellSize * 0.85, this.cellSize * 0.85, this.cellSize * 0.3).toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed().toNonIndexed();
        
        // Create material with periodic table colors
        const letterColors = {
            'A': 0xef4444, 'B': 0xf97316, 'C': 0xeab308, 'D': 0x84cc16,
            'E': 0x22c55e, 'F': 0x14b8a6, 'G': 0x06b6d4, 'H': 0x3b82f6,
            'I': 0x6366f1, 'J': 0x8b5cf6, 'K': 0xa855f7, 'L': 0xd946ef,
            'M': 0xec4899, 'N': 0xf43f5e, 'O': 0xef4444, 'P': 0xf97316,
            'Q': 0xeab308, 'R': 0x84cc16, 'S': 0x22c55e, 'T': 0x14b8a6,
            'U': 0x06b6d4, 'V': 0x3b82f6, 'W': 0x6366f1, 'X': 0x8b5cf6,
            'Y': 0xa855f7, 'Z': 0xd946ef
        };
        
        const letterColor = letterColors[this.fallingLetter] || 0x4facfe;
        
        const letterMaterial = new THREE.MeshPhongMaterial({ 
            color: letterColor,
            transparent: true,
            opacity: 0.95,
            shininess: 150,
            specular: 0xffffff,
            emissive: letterColor
        });
        
        this.fallingLetterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        
        // Position at current letter position
        const { row, col } = this.currentLetterPosition;
        const cell = this.grid[row][col];
        this.fallingLetterMesh.position.copy(cell.position);
        this.fallingLetterMesh.position.z += 0.5; // Float above the cell
        
        // Add subtle animation
        this.fallingLetterMesh.rotation.x = Math.random() * 0.2 - 0.1;
        this.fallingLetterMesh.rotation.y = Math.random() * 0.2 - 0.1;
        
        this.fallingLetterMesh.castShadow = true;
        this.fallingLetterMesh.receiveShadow = true;
        
        this.scene.add(this.fallingLetterMesh);
    }
    
    addVisualFeedback() {
        // Add periodic table style visual feedback
        if (this.grid && Array.isArray(this.grid)) {
            this.grid.forEach((row, rowIndex) => {
                if (row && Array.isArray(row)) {
                    if (this.gridMode === '2D') {
                        row.forEach((cell, colIndex) => {
                            if (cell && cell.material && cell.material.emissive) {
                                // Add subtle glow effect
                                cell.material.emissive.setScalar(0.1);
                            }
                        });
                    } else {
                        // 3D mode: row is an array of depth arrays
                        row.forEach((depthArray, colIndex) => {
                            if (depthArray && Array.isArray(depthArray)) {
                                depthArray.forEach(cell => {
                                    if (cell && cell.material && cell.material.emissive) {
                                        cell.material.emissive.setScalar(0.1);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
        
        // Create floating particles
        this.createFloatingParticles();
    }
    
    createFloatingParticles() {
        // Create 50 floating particles for ambient effect
        for (let i = 0; i < 50; i++) {
            const geometry = new THREE.SphereGeometry(0.02, 8, 8);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0x4facfe,
                transparent: true,
                opacity: 0.3
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random position around the grid
            particle.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }
    
    addPlacementEffect(row, col, depth = 0) {
        // Create flash effect on placed cell
        if (this.grid && Array.isArray(this.grid) && this.grid[row] && Array.isArray(this.grid[row])) {
            const cell = this.gridMode === '2D' ? this.grid[row][col] : (this.grid[row][col] && Array.isArray(this.grid[row][col]) ? this.grid[row][col][depth] : null);
            
            if (cell && cell.material) {
                // Flash effect
                const originalEmissive = cell.material.emissive.clone();
                cell.material.emissive = new THREE.Color(0xffffff);
                cell.material.emissiveIntensity = 0.8;
                
                setTimeout(() => {
                    if (cell && cell.material) {
                        cell.material.emissive = originalEmissive;
                        cell.material.emissiveIntensity = 0.1;
                    }
                }, 200);
                
                // Create explosion effect
                this.createExplosionEffect(row, col, cell.material.color, depth);
            }
        }
    }
    
    createExplosionEffect(row, col, color, depth = 0) {
        // Create 8 particles for explosion effect
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshLambertMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Position at cell location
            let cell = null;
            if (this.grid && Array.isArray(this.grid) && this.grid[row] && Array.isArray(this.grid[row])) {
                cell = this.gridMode === '2D' ? this.grid[row][col] : (this.grid[row][col] && Array.isArray(this.grid[row][col]) ? this.grid[row][col][depth] : null);
            }
            
            if (cell && cell.position) {
                particle.position.copy(cell.position);
            } else {
                // Fallback position if cell is not available
                particle.position.set(
                    (col - this.currentGridSize / 2 + 0.5) * this.cellSize,
                    (row - this.currentGridSize / 2 + 0.5) * this.cellSize,
                    depth * this.cellSize
                );
            }
            
            // Random velocity
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            
            this.scene.add(particle);
            this.particles.push(particle);
            
            // Animate particle
            const animate = () => {
                particle.position.add(particle.velocity);
                particle.material.opacity -= 0.02;
                
                if (particle.material.opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    this.scene.remove(particle);
                    this.particles.splice(this.particles.indexOf(particle), 1);
                }
            };
            animate();
        }
    }
    
    checkWordCompletion() {
        console.log('🔍 Checking for word completion...');
        
        // Get all placed letters from grid
        const letters = [];
        if (this.grid && Array.isArray(this.grid)) {
            this.grid.forEach(row => {
                if (row && Array.isArray(row)) {
                    if (this.gridMode === '2D') {
                        row.forEach(cell => {
                            if (cell && cell.userData && cell.userData.occupied && cell.userData.letter) {
                                letters.push({
                                    letter: cell.userData.letter,
                                    row: cell.userData.row,
                                    col: cell.userData.col
                                });
                            }
                        });
                    } else {
                        // 3D mode: row is an array of depth arrays
                        row.forEach(depthArray => {
                            if (depthArray && Array.isArray(depthArray)) {
                                depthArray.forEach(cell => {
                                    if (cell && cell.userData && cell.userData.occupied && cell.userData.letter) {
                                        letters.push({
                                            letter: cell.userData.letter,
                                            row: cell.userData.row,
                                            col: cell.userData.col
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
        
        // Check for target words
        this.targetWords.forEach(targetWord => {
            if (this.wordsFound.includes(targetWord)) return; // Already found
            
            // Check if word can be formed with placed letters
            const canFormWord = this.canFormWord(letters, targetWord);
            if (canFormWord) {
                this.wordsFound.push(targetWord);
                this.score += targetWord.length * 50; // Bonus for word completion
                this.combo++;
                
                // Play word completion sound
                if (this.audioManager) {
                    this.audioManager.playSound('wordComplete');
                }
                
                // Create word completion effect
                this.createWordCompletionEffect(targetWord);
                
                console.log(`🎉 Word completed: ${targetWord}! Score: +${targetWord.length * 50}, Combo: ${this.combo}`);
            }
        });
    }
    
    canFormWord(letters, word) {
        const wordLetters = word.split('');
        const availableLetters = letters.map(l => l.letter);
        
        // Check if all letters in the word are available
        for (const letter of wordLetters) {
            const index = availableLetters.indexOf(letter);
            if (index === -1) return false;
            availableLetters.splice(index, 1); // Remove used letter
        }
        
        return true;
    }
    
    createWordCompletionEffect(word) {
        // Create a large celebration effect
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0x4facfe,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random position around the grid
            particle.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            
            // Random velocity
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            
            this.scene.add(particle);
            this.particles.push(particle);
            
            // Animate particle
            const animate = () => {
                particle.position.add(particle.velocity);
                particle.material.opacity -= 0.01;
                
                if (particle.material.opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    this.scene.remove(particle);
                    this.particles.splice(this.particles.indexOf(particle), 1);
                }
            };
            animate();
        }
        
        // Create word completion text
        this.createWordCompletionText(word);
    }
    
    createWordCompletionText(word) {
        // Create canvas for word text
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw word text
        ctx.fillStyle = '#4facfe';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word, 128, 32);
        
        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshLambertMaterial({ 
            map: texture,
            transparent: true,
            opacity: 1
        });
        
        // Create plane geometry for word text
        const geometry = new THREE.PlaneGeometry(3, 0.8);
        const wordMesh = new THREE.Mesh(geometry, material);
        
        // Position in center of screen
        wordMesh.position.set(0, 0, 5);
        
        this.scene.add(wordMesh);
        
        // Animate word completion text
        let opacity = 1;
        let scale = 0.5;
        const animate = () => {
            opacity -= 0.01;
            scale += 0.02;
            wordMesh.material.opacity = opacity;
            wordMesh.scale.set(scale, scale, scale);
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(wordMesh);
            }
        };
        animate();
    }
    
    calculateLetterFrequency() {
        const frequency = {};
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        letters.split('').forEach(letter => {
            frequency[letter] = 1 / 26; // Equal distribution
        });
        
        return frequency;
    }
    
    loadDictionary() {
        // Basic dictionary for word detection
        return new Set(['CHAT', 'MAISON', 'JARDIN', 'PORTE', 'MUSIQUE', 'LIVRE', 'TABLE', 'FENÊTRE']);
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
        if (this.gridMode === '2D') {
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
            const depth = Math.floor(this.currentGridSize / 2);
            for (let row = 0; row < this.currentGridSize; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    for (let d = 0; d < depth; d++) {
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
        if (this.gridMode === '2D') {
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
            const depth = Math.floor(this.currentGridSize / 2);
            for (let row = 0; row < this.currentGridSize; row++) {
                for (let col = 0; col < this.currentGridSize; col++) {
                    for (let d = 0; d < depth; d++) {
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
        
        if (this.gridMode === '2D') {
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
                const depth = Math.floor(this.currentGridSize / 2);
                for (let d = depth - 1; d >= 0; d--) {
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
}

// Supporting classes for 3D game
class WordDetector3D {
    constructor(dictionary) {
        this.dictionary = dictionary;
    }
    
    scanGrid(grid) {
        // Basic word scanning implementation
        return [];
    }
}

class ScoreManager3D {
    constructor() {
        this.score = 0;
    }
    
    updateScore(points) {
        this.score += points;
    }
}

class LevelManager3D {
    constructor() {
        this.level = 1;
    }
    
    getCurrentLevel() {
        return this.level;
    }
}

class AudioManager3D {
    constructor() {
        // Audio management for 3D game
    }
    
    playSound(type) {
        // Play sound effects
        console.log(`🔊 Playing sound: ${type}`);
    }
}

class ParticleSystem3D {
    constructor() {
        this.particles = [];
    }
    
    createEffect(x, y, type) {
        // Create particle effects
        console.log(`✨ Creating ${type} effect at (${x}, ${y})`);
    }
} 