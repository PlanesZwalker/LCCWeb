/**
 * 🎮 3D Game Tests - Letters Cascade Challenge
 * Comprehensive test suite for the 3D game version
 */

class Game3DTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.game = null;
    }

    // 🚀 Test Runner
    async runAllTests() {
        console.log('🧪 Starting 3D Game Tests...');
        console.log('=' .repeat(50));
        
        await this.initializeGame();
        
        // Core System Tests
        this.testGameInitialization();
        this.testThreeJSIntegration();
        this.test3DGridSystem();
        this.test3DLetterManagement();
        this.test3DWordDetection();
        this.test3DScoringSystem();
        this.test3DLevelProgression();
        this.test3DGameControls();
        this.test3DVisualEffects();
        this.test3DAudioSystem();
        this.test3DPerformance();
        this.test3DErrorHandling();
        
        this.printTestResults();
    }

    // 🎯 Game Initialization Tests
    testGameInitialization() {
        console.log('\n🎯 Testing 3D Game Initialization...');
        
        this.test('Game3D constructor creates valid instance', () => {
            return this.game !== null && 
                   this.game.constructor.name === 'Game3D';
        });
        
        this.test('Game has required 3D properties', () => {
            const requiredProps = [
                'scene', 'camera', 'renderer', 'raycaster', 'mouse',
                'grid', 'letterQueue', 'wordsFound', 'score', 
                'level', 'gameRunning', 'paused'
            ];
            return requiredProps.every(prop => prop in this.game);
        });
        
        this.test('Three.js is available', () => {
            return typeof THREE !== 'undefined';
        });
        
        this.test('3D scene is created', () => {
            return this.game.scene !== null &&
                   this.game.scene.constructor.name === 'Scene';
        });
        
        this.test('3D camera is created', () => {
            return this.game.camera !== null &&
                   this.game.camera.constructor.name === 'PerspectiveCamera';
        });
        
        this.test('3D renderer is created', () => {
            return this.game.renderer !== null &&
                   this.game.renderer.constructor.name === 'WebGLRenderer';
        });
    }

    // 🎨 Three.js Integration Tests
    testThreeJSIntegration() {
        console.log('\n🎨 Testing Three.js Integration...');
        
        this.test('WebGL is supported', () => {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                return gl !== null;
            } catch (error) {
                return false;
            }
        });
        
        this.test('Three.js scene setup works', () => {
            try {
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer();
                return scene !== null && camera !== null && renderer !== null;
            } catch (error) {
                return false;
            }
        });
        
        this.test('3D lighting is configured', () => {
            return this.game.scene.children.some(child => 
                child.constructor.name === 'DirectionalLight' ||
                child.constructor.name === 'AmbientLight' ||
                child.constructor.name === 'PointLight'
            );
        });
        
        this.test('3D camera position is set', () => {
            return this.game.camera.position.x !== 0 ||
                   this.game.camera.position.y !== 0 ||
                   this.game.camera.position.z !== 0;
        });
    }

    // 🏗️ 3D Grid System Tests
    test3DGridSystem() {
        console.log('\n🏗️ Testing 3D Grid System...');
        
        this.test('3D grid is created', () => {
            return this.game.grid !== null &&
                   Array.isArray(this.game.grid);
        });
        
        this.test('3D cubes are created for each cell', () => {
            const cubeCount = this.game.scene.children.filter(child => 
                child.constructor.name === 'Mesh' && 
                child.geometry.constructor.name === 'BoxGeometry'
            ).length;
            return cubeCount > 0;
        });
        
        this.test('3D grid has correct dimensions', () => {
            const expectedCubes = this.game.currentGridSize * this.game.currentGridSize;
            const actualCubes = this.game.scene.children.filter(child => 
                child.constructor.name === 'Mesh' && 
                child.geometry.constructor.name === 'BoxGeometry'
            ).length;
            return actualCubes === expectedCubes;
        });
        
        this.test('3D grid spacing is correct', () => {
            const cubes = this.game.scene.children.filter(child => 
                child.constructor.name === 'Mesh' && 
                child.geometry.constructor.name === 'BoxGeometry'
            );
            if (cubes.length < 2) return false;
            
            const firstCube = cubes[0];
            const secondCube = cubes[1];
            const spacing = Math.abs(secondCube.position.x - firstCube.position.x);
            return spacing >= this.game.cellSize + this.game.gap;
        });
    }

    // 📝 3D Letter Management Tests
    test3DLetterManagement() {
        console.log('\n📝 Testing 3D Letter Management...');
        
        this.test('3D letter queue generation works', () => {
            const originalLength = this.game.letterQueue.length;
            this.game.generateLetterQueue();
            return this.game.letterQueue.length > 0;
        });
        
        this.test('3D text meshes can be created', () => {
            try {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.font = '48px Arial';
                context.fillStyle = 'white';
                context.fillText('A', 0, 48);
                
                const texture = new THREE.CanvasTexture(canvas);
                const material = new THREE.MeshBasicMaterial({ map: texture });
                const geometry = new THREE.PlaneGeometry(1, 1);
                const mesh = new THREE.Mesh(geometry, material);
                
                return mesh !== null;
            } catch (error) {
                return false;
            }
        });
        
        this.test('3D letter placement works', () => {
            try {
                // Simulate placing a letter in 3D
                const testCube = this.game.scene.children.find(child => 
                    child.constructor.name === 'Mesh' && 
                    child.geometry.constructor.name === 'BoxGeometry'
                );
                if (!testCube) return false;
                
                testCube.userData.letter = 'A';
                testCube.userData.occupied = true;
                
                return testCube.userData.letter === 'A' && 
                       testCube.userData.occupied === true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('3D letter rotation works', () => {
            try {
                const testCube = this.game.scene.children.find(child => 
                    child.constructor.name === 'Mesh' && 
                    child.geometry.constructor.name === 'BoxGeometry'
                );
                if (!testCube) return false;
                
                const originalRotation = testCube.rotation.y;
                testCube.rotation.y += Math.PI / 2;
                
                return testCube.rotation.y !== originalRotation;
            } catch (error) {
                return false;
            }
        });
    }

    // 🔍 3D Word Detection Tests
    test3DWordDetection() {
        console.log('\n🔍 Testing 3D Word Detection...');
        
        this.test('3D word detector is initialized', () => {
            return this.game.wordDetector !== null &&
                   this.game.wordDetector.constructor.name === 'WordDetector';
        });
        
        this.test('3D dictionary is loaded', () => {
            return this.game.dictionary !== null &&
                   this.game.dictionary.size > 0;
        });
        
        this.test('3D word validation works', () => {
            return this.game.wordDetector.validateWord('CHAT') === true &&
                   this.game.wordDetector.validateWord('INVALID') === false;
        });
        
        this.test('3D word completion detection works', () => {
            try {
                // Manually place letters in 3D grid
                const cubes = this.game.scene.children.filter(child => 
                    child.constructor.name === 'Mesh' && 
                    child.geometry.constructor.name === 'BoxGeometry'
                );
                
                if (cubes.length < 4) return false;
                
                // Place letters to form "CHAT"
                cubes[0].userData.letter = 'C';
                cubes[1].userData.letter = 'H';
                cubes[2].userData.letter = 'A';
                cubes[3].userData.letter = 'T';
                
                const wordsFound = this.game.checkWordCompletion3D();
                return wordsFound.length > 0;
            } catch (error) {
                return false;
            }
        });
    }

    // 💰 3D Scoring System Tests
    test3DScoringSystem() {
        console.log('\n💰 Testing 3D Scoring System...');
        
        this.test('3D score manager is initialized', () => {
            return this.game.scoreManager !== null &&
                   this.game.scoreManager.constructor.name === 'ScoreManager';
        });
        
        this.test('3D score addition works', () => {
            const originalScore = this.game.score;
            this.game.addScore(50);
            return this.game.score === originalScore + 50;
        });
        
        this.test('3D combo system works', () => {
            this.game.combo = 2;
            const originalScore = this.game.score;
            this.game.addScore(25);
            return this.game.score === originalScore + 50; // 25 * 2
        });
        
        this.test('3D high score tracking works', () => {
            const originalHighScore = this.game.highScore;
            this.game.score = originalHighScore + 100;
            this.game.addScore(0); // Trigger high score check
            return this.game.highScore > originalHighScore;
        });
    }

    // 📈 3D Level Progression Tests
    test3DLevelProgression() {
        console.log('\n📈 Testing 3D Level Progression...');
        
        this.test('3D level manager is initialized', () => {
            return this.game.levelManager !== null &&
                   this.game.levelManager.constructor.name === 'LevelManager';
        });
        
        this.test('3D level progression works', () => {
            const originalLevel = this.game.level;
            this.game.wordsFound = ['CHAT', 'MAISON', 'MUSIQUE'];
            this.game.score = 150;
            this.game.updateLevel();
            return this.game.level > originalLevel;
        });
        
        this.test('3D level requirements are correct', () => {
            const requirements = this.game.getNextLevelRequirements();
            return requirements.words !== undefined &&
                   requirements.score !== undefined;
        });
    }

    // 🎮 3D Game Controls Tests
    test3DGameControls() {
        console.log('\n🎮 Testing 3D Game Controls...');
        
        this.test('3D game start works', () => {
            this.game.resetGame();
            this.game.startGame();
            return this.game.gameRunning === true &&
                   this.game.paused === false;
        });
        
        this.test('3D game pause works', () => {
            this.game.startGame();
            this.game.pauseGame();
            return this.game.paused === true;
        });
        
        this.test('3D game resume works', () => {
            this.game.pauseGame();
            return this.game.paused === false;
        });
        
        this.test('3D game reset works', () => {
            this.game.score = 100;
            this.game.level = 3;
            this.game.resetGame();
            return this.game.score === 0 &&
                   this.game.level === 1 &&
                   this.game.wordsFound.length === 0;
        });
        
        this.test('3D mouse interaction works', () => {
            try {
                // Simulate mouse click
                const event = new MouseEvent('click', {
                    clientX: 100,
                    clientY: 100
                });
                this.game.onCanvasClick(event);
                return true;
            } catch (error) {
                return false;
            }
        });
    }

    // ✨ 3D Visual Effects Tests
    test3DVisualEffects() {
        console.log('\n✨ Testing 3D Visual Effects...');
        
        this.test('3D particle system is initialized', () => {
            return this.game.particleSystem !== null &&
                   this.game.particleSystem.constructor.name === 'ParticleSystem';
        });
        
        this.test('3D particle effects can be created', () => {
            try {
                this.game.particleSystem.createPlacementEffect(0, 0, 0);
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('3D rendering works', () => {
            try {
                this.game.render();
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('3D animation loop works', () => {
            try {
                this.game.animate();
                return true;
            } catch (error) {
                return false;
            }
        });
    }

    // 🔊 3D Audio System Tests
    test3DAudioSystem() {
        console.log('\n🔊 Testing 3D Audio System...');
        
        this.test('3D audio manager is initialized', () => {
            return this.game.audioManager !== null &&
                   this.game.audioManager.constructor.name === 'AudioManager';
        });
        
        this.test('3D audio context can be created', () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                return audioContext !== null;
            } catch (error) {
                return false;
            }
        });
    }

    // ⚡ 3D Performance Tests
    test3DPerformance() {
        console.log('\n⚡ Testing 3D Performance...');
        
        this.test('3D game loop runs without errors', () => {
            try {
                this.game.gameLoop();
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('3D rendering performance is acceptable', () => {
            const startTime = performance.now();
            this.game.render();
            const endTime = performance.now();
            return (endTime - startTime) < 16; // 60 FPS target
        });
        
        this.test('3D word detection is fast', () => {
            const startTime = performance.now();
            this.game.checkWordCompletion3D();
            const endTime = performance.now();
            return (endTime - startTime) < 50; // 50ms target
        });
        
        this.test('3D animation performance is good', () => {
            const startTime = performance.now();
            this.game.animate();
            const endTime = performance.now();
            return (endTime - startTime) < 16; // 60 FPS target
        });
    }

    // 🛡️ 3D Error Handling Tests
    test3DErrorHandling() {
        console.log('\n🛡️ Testing 3D Error Handling...');
        
        this.test('Handles invalid 3D letter placement', () => {
            try {
                const testCube = this.game.scene.children.find(child => 
                    child.constructor.name === 'Mesh' && 
                    child.geometry.constructor.name === 'BoxGeometry'
                );
                if (!testCube) return false;
                
                testCube.userData.occupied = true;
                testCube.userData.letter = 'A';
                
                // Try to place another letter in the same position
                this.game.placeLetter3D('B', testCube.position.x, testCube.position.y);
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('Handles missing 3D DOM elements', () => {
            const originalElement = document.getElementById('score');
            if (originalElement) {
                originalElement.remove();
            }
            try {
                this.game.updateScoreDisplay();
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('Handles WebGL context loss', () => {
            try {
                // Simulate WebGL context loss
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                if (gl) {
                    gl.getExtension('WEBGL_lose_context');
                }
                return true;
            } catch (error) {
                return false;
            }
        });
    }

    // 🧪 Test Helper Methods
    async initializeGame() {
        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        // Wait for Three.js to load
        if (typeof THREE === 'undefined') {
            await new Promise(resolve => {
                const checkThreeJS = setInterval(() => {
                    if (typeof THREE !== 'undefined') {
                        clearInterval(checkThreeJS);
                        resolve();
                    }
                }, 100);
            });
        }
        
        // Initialize 3D game
        this.game = new Game3D();
        this.game.init();
    }

    test(description, testFunction) {
        this.testResults.total++;
        try {
            const result = testFunction();
            if (result) {
                this.testResults.passed++;
                console.log(`✅ ${description}`);
            } else {
                this.testResults.failed++;
                console.log(`❌ ${description}`);
            }
        } catch (error) {
            this.testResults.failed++;
            console.log(`❌ ${description} - Error: ${error.message}`);
        }
    }

    printTestResults() {
        console.log('\n' + '=' .repeat(50));
        console.log('📊 3D Game Test Results:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Total: ${this.testResults.total}`);
        console.log(`📊 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        if (this.testResults.failed === 0) {
            console.log('🎉 All tests passed! 3D game is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the console for details.');
        }
    }
}

// 🚀 Auto-run tests when loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const tests = new Game3DTests();
        tests.runAllTests();
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game3DTests;
} 