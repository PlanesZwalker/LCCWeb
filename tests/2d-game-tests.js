/**
 * 🎮 2D Game Tests - Letters Cascade Challenge
 * Comprehensive test suite for the 2D prototype version
 */

class Game2DTests {
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
        console.log('🧪 Starting 2D Game Tests...');
        console.log('=' .repeat(50));
        
        await this.initializeGame();
        
        // Core System Tests
        this.testGameInitialization();
        this.testGridSystem();
        this.testLetterManagement();
        this.testWordDetection();
        this.testScoringSystem();
        this.testLevelProgression();
        this.testGameControls();
        this.testVisualEffects();
        this.testAudioSystem();
        this.testPerformance();
        this.testErrorHandling();
        
        this.printTestResults();
    }

    // 🎯 Game Initialization Tests
    testGameInitialization() {
        console.log('\n🎯 Testing Game Initialization...');
        
        this.test('Game constructor creates valid instance', () => {
            return this.game !== null && 
                   this.game.constructor.name === 'LettersCascadeGame';
        });
        
        this.test('Game has required properties', () => {
            const requiredProps = [
                'grid', 'letterQueue', 'wordsFound', 'score', 
                'level', 'gameRunning', 'paused'
            ];
            return requiredProps.every(prop => prop in this.game);
        });
        
        this.test('Canvas is properly initialized', () => {
            const canvas = document.getElementById('gameCanvas');
            return canvas !== null && 
                   canvas.getContext('2d') !== null;
        });
        
        this.test('Grid is created with correct size', () => {
            return this.game.grid.length === this.game.currentGridSize &&
                   this.game.grid[0].length === this.game.currentGridSize;
        });
        
        this.test('Letter queue is generated', () => {
            return this.game.letterQueue.length > 0;
        });
    }

    // 🏗️ Grid System Tests
    testGridSystem() {
        console.log('\n🏗️ Testing Grid System...');
        
        this.test('Grid cells are properly initialized', () => {
            for (let row = 0; row < this.game.currentGridSize; row++) {
                for (let col = 0; col < this.game.currentGridSize; col++) {
                    if (this.game.grid[row][col] !== null && 
                        this.game.grid[row][col] !== undefined) {
                        return false;
                    }
                }
            }
            return true;
        });
        
        this.test('Grid boundaries are respected', () => {
            const size = this.game.currentGridSize;
            return this.game.checkCollision(-1, 0) === true &&
                   this.game.checkCollision(size, 0) === true &&
                   this.game.checkCollision(0, -1) === true &&
                   this.game.checkCollision(0, size) === true;
        });
        
        this.test('Valid positions are accessible', () => {
            return this.game.checkCollision(0, 0) === false &&
                   this.game.checkCollision(5, 5) === false;
        });
    }

    // 📝 Letter Management Tests
    testLetterManagement() {
        console.log('\n📝 Testing Letter Management...');
        
        this.test('Letter queue generation works', () => {
            const originalLength = this.game.letterQueue.length;
            this.game.generateLetterQueue();
            return this.game.letterQueue.length > 0;
        });
        
        this.test('Falling letter creation works', () => {
            this.game.createFallingLetter();
            return this.game.fallingLetter !== null &&
                   this.game.fallingLetter.letter !== undefined;
        });
        
        this.test('Letter placement works', () => {
            this.game.createFallingLetter();
            const originalGrid = JSON.parse(JSON.stringify(this.game.grid));
            this.game.fallingLetter.x = 0;
            this.game.fallingLetter.y = 0;
            this.game.placeLetter();
            return this.game.grid[0][0] !== null;
        });
        
        this.test('Letter rotation works', () => {
            this.game.createFallingLetter();
            const originalRotation = this.game.fallingLetter.rotation;
            this.game.rotateFallingLetter();
            return this.game.fallingLetter.rotation !== originalRotation;
        });
        
        this.test('Letter movement works', () => {
            this.game.createFallingLetter();
            const originalX = this.game.fallingLetter.x;
            this.game.moveFallingLetter('right');
            return this.game.fallingLetter.x !== originalX;
        });
    }

    // 🔍 Word Detection Tests
    testWordDetection() {
        console.log('\n🔍 Testing Word Detection...');
        
        this.test('Word detector is initialized', () => {
            return this.game.wordDetector !== null &&
                   this.game.wordDetector.constructor.name === 'WordDetector';
        });
        
        this.test('Dictionary is loaded', () => {
            return this.game.dictionary !== null &&
                   this.game.dictionary.size > 0;
        });
        
        this.test('Word validation works', () => {
            return this.game.wordDetector.validateWord('CHAT') === true &&
                   this.game.wordDetector.validateWord('INVALID') === false;
        });
        
        this.test('Word completion detection works', () => {
            // Manually place letters to form a word
            this.game.grid[0][0] = 'C';
            this.game.grid[0][1] = 'H';
            this.game.grid[0][2] = 'A';
            this.game.grid[0][3] = 'T';
            
            const wordsFound = this.game.checkWordCompletion();
            return wordsFound.length > 0;
        });
    }

    // 💰 Scoring System Tests
    testScoringSystem() {
        console.log('\n💰 Testing Scoring System...');
        
        this.test('Score manager is initialized', () => {
            return this.game.scoreManager !== null &&
                   this.game.scoreManager.constructor.name === 'ScoreManager';
        });
        
        this.test('Score addition works', () => {
            const originalScore = this.game.score;
            this.game.addScore(50);
            return this.game.score === originalScore + 50;
        });
        
        this.test('Combo system works', () => {
            this.game.combo = 2;
            const originalScore = this.game.score;
            this.game.addScore(25);
            return this.game.score === originalScore + 50; // 25 * 2
        });
        
        this.test('High score tracking works', () => {
            const originalHighScore = this.game.highScore;
            this.game.score = originalHighScore + 100;
            this.game.addScore(0); // Trigger high score check
            return this.game.highScore > originalHighScore;
        });
    }

    // 📈 Level Progression Tests
    testLevelProgression() {
        console.log('\n📈 Testing Level Progression...');
        
        this.test('Level manager is initialized', () => {
            return this.game.levelManager !== null &&
                   this.game.levelManager.constructor.name === 'LevelManager';
        });
        
        this.test('Level progression works', () => {
            const originalLevel = this.game.level;
            this.game.wordsFound = ['CHAT', 'MAISON', 'MUSIQUE'];
            this.game.score = 150;
            this.game.updateLevel();
            return this.game.level > originalLevel;
        });
        
        this.test('Level requirements are correct', () => {
            const requirements = this.game.getNextLevelRequirements();
            return requirements.words !== undefined &&
                   requirements.score !== undefined;
        });
    }

    // 🎮 Game Controls Tests
    testGameControls() {
        console.log('\n🎮 Testing Game Controls...');
        
        this.test('Game start works', () => {
            this.game.resetGame();
            this.game.startGame();
            return this.game.gameRunning === true &&
                   this.game.paused === false;
        });
        
        this.test('Game pause works', () => {
            this.game.startGame();
            this.game.pauseGame();
            return this.game.paused === true;
        });
        
        this.test('Game resume works', () => {
            this.game.pauseGame();
            return this.game.paused === false;
        });
        
        this.test('Game reset works', () => {
            this.game.score = 100;
            this.game.level = 3;
            this.game.resetGame();
            return this.game.score === 0 &&
                   this.game.level === 1 &&
                   this.game.wordsFound.length === 0;
        });
        
        this.test('Keyboard controls work', () => {
            this.game.createFallingLetter();
            const originalX = this.game.fallingLetter.x;
            this.game.handleEnhancedKeyPress('ArrowRight');
            return this.game.fallingLetter.x !== originalX;
        });
    }

    // ✨ Visual Effects Tests
    testVisualEffects() {
        console.log('\n✨ Testing Visual Effects...');
        
        this.test('Particle system is initialized', () => {
            return this.game.particleSystem !== null &&
                   this.game.particleSystem.constructor.name === 'ParticleSystem';
        });
        
        this.test('Particle effects can be created', () => {
            try {
                this.game.particleSystem.createPlacementEffect(0, 0);
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('Canvas rendering works', () => {
            try {
                this.game.render();
                return true;
            } catch (error) {
                return false;
            }
        });
    }

    // 🔊 Audio System Tests
    testAudioSystem() {
        console.log('\n🔊 Testing Audio System...');
        
        this.test('Audio manager is initialized', () => {
            return this.game.audioManager !== null &&
                   this.game.audioManager.constructor.name === 'AudioManager';
        });
        
        this.test('Audio context can be created', () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                return audioContext !== null;
            } catch (error) {
                return false;
            }
        });
    }

    // ⚡ Performance Tests
    testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        this.test('Game loop runs without errors', () => {
            try {
                this.game.gameLoop();
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('Rendering performance is acceptable', () => {
            const startTime = performance.now();
            this.game.render();
            const endTime = performance.now();
            return (endTime - startTime) < 16; // 60 FPS target
        });
        
        this.test('Word detection is fast', () => {
            const startTime = performance.now();
            this.game.checkWordCompletion();
            const endTime = performance.now();
            return (endTime - startTime) < 50; // 50ms target
        });
    }

    // 🛡️ Error Handling Tests
    testErrorHandling() {
        console.log('\n🛡️ Testing Error Handling...');
        
        this.test('Handles invalid letter placement', () => {
            try {
                this.game.grid[0][0] = 'A'; // Place letter
                this.game.fallingLetter = { x: 0, y: 0, letter: 'B' };
                this.game.placeLetter(); // Should handle collision
                return true;
            } catch (error) {
                return false;
            }
        });
        
        this.test('Handles missing DOM elements', () => {
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
    }

    // 🧪 Test Helper Methods
    async initializeGame() {
        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        // Initialize game
        this.game = new LettersCascadeGame();
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
        console.log('📊 2D Game Test Results:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Total: ${this.testResults.total}`);
        console.log(`📊 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        if (this.testResults.failed === 0) {
            console.log('🎉 All tests passed! 2D game is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the console for details.');
        }
    }
}

// 🚀 Auto-run tests when loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const tests = new Game2DTests();
        tests.runAllTests();
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2DTests;
} 