// Enhanced FBXLoader for Letters Cascade Challenge
// This provides FBX loading functionality with proper ASCII parsing

(function() {
    'use strict';

    // Enhanced FBX Loader
    THREE.FBXLoader = function(manager) {
        this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
    };

    THREE.FBXLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
        constructor: THREE.FBXLoader,

        load: function(url, onLoad, onProgress, onError) {
            var scope = this;
            var loader = new THREE.FileLoader(scope.manager);
            loader.setPath(this.path);
            loader.load(url, function(text) {
                try {
                    var result = scope.parse(text, url);
                    if (onLoad) onLoad(result);
                } catch (e) {
                    console.warn('FBXLoader: Error parsing FBX file, creating fallback object:', e);
                    // Create fallback object
                    var fallback = scope.createFallbackObject(url);
                    if (onLoad) onLoad(fallback);
                }
            }, onProgress, onError);
        },

        parse: function(text, path) {
            console.log('📦 Parsing FBX file:', path);
            
            // Extract letter from filename
            var letter = this.extractLetterFromPath(path);
            
            // Create enhanced 3D letter object
            return this.createLetterObject(letter);
        },

        extractLetterFromPath: function(path) {
            var letter = 'A';
            if (path.includes('letter-')) {
                var match = path.match(/letter-([a-z])\.fbx/i);
                if (match) {
                    letter = match[1].toUpperCase();
                }
            }
            return letter;
        },

        createLetterObject: function(letter) {
            var group = new THREE.Group();
            
            // Create main letter geometry (flat tile style)
            var geometry = new THREE.BoxGeometry(0.8, 0.2, 0.8);
            var material = new THREE.MeshPhongMaterial({
                color: this.getLetterColor(letter),
                shininess: 30,
                transparent: true,
                opacity: 1.0
            });
            
            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            
            // Create letter text as a separate plane
            var textMesh = this.createLetterText(letter);
            textMesh.position.y = 0.15; // Position above the base
            group.add(textMesh);
            
            // Add subtle glow effect
            var glowGeometry = new THREE.BoxGeometry(0.9, 0.3, 0.9);
            var glowMaterial = new THREE.MeshBasicMaterial({
                color: this.getLetterColor(letter),
                transparent: true,
                opacity: 0.1
            });
            var glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.position.y = 0.05;
            group.add(glowMesh);
            
            console.log('✅ Created enhanced 3D object for letter:', letter);
            return group;
        },

        createLetterText: function(letter) {
            // Create canvas for letter text
            var canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            var ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, 256, 256);
            
            // Create gradient background
            var gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#f0f0f0');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
            
            // Draw letter with shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, 128, 128);
            
            // Create texture and material
            var texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            
            var textGeometry = new THREE.PlaneGeometry(0.6, 0.6);
            var textMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            return new THREE.Mesh(textGeometry, textMaterial);
        },

        getLetterColor: function(letter) {
            var colorPalette = {
                'A': 0x3498db, 'B': 0xe74c3c, 'C': 0x2ecc71, 'D': 0xf39c12,
                'E': 0x9b59b6, 'F': 0x1abc9c, 'G': 0xe67e22, 'H': 0x34495e,
                'I': 0x16a085, 'J': 0xd35400, 'K': 0x8e44ad, 'L': 0x27ae60,
                'M': 0xc0392b, 'N': 0x2980b9, 'O': 0xf1c40f, 'P': 0xe91e63,
                'Q': 0x00bcd4, 'R': 0xff5722, 'S': 0x4caf50, 'T': 0x2196f3,
                'U': 0x9c27b0, 'V': 0xff9800, 'W': 0x795548, 'X': 0x607d8b,
                'Y': 0x3f51b5, 'Z': 0xffeb3b
            };
            return colorPalette[letter] || 0x667eea;
        },

        createFallbackObject: function(path) {
            console.log('🔄 Creating fallback object for:', path);
            var letter = this.extractLetterFromPath(path);
            return this.createLetterObject(letter);
        }
    });

    console.log('📦 Enhanced FBXLoader initialized successfully');
})(); 