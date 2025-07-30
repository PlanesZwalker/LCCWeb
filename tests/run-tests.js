/**
 * 🧪 Simple Test Runner - Letters Cascade Challenge
 * Run this script to execute all tests and identify issues
 */

class SimpleTestRunner {
    constructor() {
        this.results = {
            '2D': { passed: 0, failed: 0, total: 0, issues: [] },
            '3D': { passed: 0, failed: 0, total: 0, issues: [] },
            overall: { passed: 0, failed: 0, total: 0 }
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Simple Test Runner...');
        console.log('=' .repeat(60));
        
        // Test 2D Game
        await this.test2DGame();
        
        // Test 3D Game
        await this.test3DGame();
        
        // Calculate overall results
        this.calculateOverallResults();
        
        // Print results
        this.printResults();
        
        // Generate recommendations
        this.generateRecommendations();
    }

    async test2DGame() {
        console.log('\n🎯 Testing 2D Game...');
        
        const tests = [
            {
                name: 'Canvas Initialization',
                test: () => this.testCanvasInitialization()
            },
            {
                name: 'Game Object Creation',
                test: () => this.testGameObjectCreation()
            },
            {
                name: 'Grid System',
                test: () => this.testGridSystem()
            },
            {
                name: 'Letter Placement',
                test: () => this.testLetterPlacement()
            },
            {
                name: 'Word Detection',
                test: () => this.testWordDetection()
            },
            {
                name: 'Scoring System',
                test: () => this.testScoringSystem()
            },
            {
                name: 'Game Controls',
                test: () => this.testGameControls()
            },
            {
                name: 'Rendering System',
                test: () => this.testRenderingSystem()
            }
        ];

        for (const test of tests) {
            await this.runTest('2D', test.name, test.test);
        }
    }

    async test3DGame() {
        console.log('\n🎨 Testing 3D Game...');
        
        const tests = [
            {
                name: 'Three.js Availability',
                test: () => this.testThreeJSAvailability()
            },
            {
                name: 'WebGL Support',
                test: () => this.testWebGLSupport()
            },
            {
                name: '3D Scene Creation',
                test: () => this.test3DSceneCreation()
            },
            {
                name: '3D Game Object',
                test: () => this.test3DGameObject()
            },
            {
                name: '3D Rendering',
                test: () => this.test3DRendering()
            }
        ];

        for (const test of tests) {
            await this.runTest('3D', test.name, test.test);
        }
    }

    async runTest(version, testName, testFunction) {
        console.log(`  🧪 Running: ${testName}`);
        
        try {
            const result = await testFunction();
            if (result) {
                this.results[version].passed++;
                console.log(`    ✅ ${testName} - PASSED`);
            } else {
                this.results[version].failed++;
                this.results[version].issues.push(`${testName}: Test failed`);
                console.log(`    ❌ ${testName} - FAILED`);
            }
        } catch (error) {
            this.results[version].failed++;
            this.results[version].issues.push(`${testName}: ${error.message}`);
            console.log(`    ❌ ${testName} - ERROR: ${error.message}`);
        }
        
        this.results[version].total++;
    }

    // 2D Game Tests
    testCanvasInitialization() {
        const canvas = document.getElementById('gameCanvas');
        return canvas !== null && canvas.getContext('2d') !== null;
    }

    testGameObjectCreation() {
        try {
            const game = new LettersCascadeGame();
            return game !== null && game.constructor.name === 'LettersCascadeGame';
        } catch (error) {
            return false;
        }
    }

    testGridSystem() {
        try {
            const game = new LettersCascadeGame();
            game.init();
            return game.grid !== null && 
                   game.grid.length === game.currentGridSize &&
                   game.grid[0].length === game.currentGridSize;
        } catch (error) {
            return false;
        }
    }

    testLetterPlacement() {
        try {
            const game = new LettersCascadeGame();
            game.init();
            game.createFallingLetter();
            return game.fallingLetter !== null && 
                   game.fallingLetter.letter !== undefined;
        } catch (error) {
            return false;
        }
    }

    testWordDetection() {
        try {
            const game = new LettersCascadeGame();
            game.init();
            return game.wordDetector !== null && 
                   game.dictionary !== null &&
                   game.dictionary.size > 0;
        } catch (error) {
            return false;
        }
    }

    testScoringSystem() {
        try {
            const game = new LettersCascadeGame();
            game.init();
            const originalScore = game.score;
            game.addScore(50);
            return game.score === originalScore + 50;
        } catch (error) {
            return false;
        }
    }

    testGameControls() {
        try {
            const game = new LettersCascadeGame();
            game.init();
            game.startGame();
            return game.gameRunning === true;
        } catch (error) {
            return false;
        }
    }

    testRenderingSystem() {
        try {
            const game = new LettersCascadeGame();
            game.init();
            game.render();
            return true;
        } catch (error) {
            return false;
        }
    }

    // 3D Game Tests
    testThreeJSAvailability() {
        return typeof THREE !== 'undefined';
    }

    testWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return gl !== null;
        } catch (error) {
            return false;
        }
    }

    test3DSceneCreation() {
        try {
            if (typeof THREE === 'undefined') return false;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            return scene !== null && camera !== null && renderer !== null;
        } catch (error) {
            return false;
        }
    }

    test3DGameObject() {
        try {
            if (typeof Game3D === 'undefined') return false;
            const game = new Game3D();
            return game !== null;
        } catch (error) {
            return false;
        }
    }

    test3DRendering() {
        try {
            if (typeof THREE === 'undefined') return false;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.render(scene, camera);
            return true;
        } catch (error) {
            return false;
        }
    }

    calculateOverallResults() {
        this.results.overall.passed = this.results['2D'].passed + this.results['3D'].passed;
        this.results.overall.failed = this.results['2D'].failed + this.results['3D'].failed;
        this.results.overall.total = this.results['2D'].total + this.results['3D'].total;
    }

    printResults() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('=' .repeat(60));
        
        console.log('\n🎯 2D Game Results:');
        console.log(`   ✅ Passed: ${this.results['2D'].passed}`);
        console.log(`   ❌ Failed: ${this.results['2D'].failed}`);
        console.log(`   📈 Total: ${this.results['2D'].total}`);
        console.log(`   📊 Success Rate: ${this.getSuccessRate('2D')}%`);
        
        if (this.results['2D'].issues.length > 0) {
            console.log('   🚨 Issues:');
            this.results['2D'].issues.forEach(issue => console.log(`      - ${issue}`));
        }
        
        console.log('\n🎨 3D Game Results:');
        console.log(`   ✅ Passed: ${this.results['3D'].passed}`);
        console.log(`   ❌ Failed: ${this.results['3D'].failed}`);
        console.log(`   📈 Total: ${this.results['3D'].total}`);
        console.log(`   📊 Success Rate: ${this.getSuccessRate('3D')}%`);
        
        if (this.results['3D'].issues.length > 0) {
            console.log('   🚨 Issues:');
            this.results['3D'].issues.forEach(issue => console.log(`      - ${issue}`));
        }
        
        console.log('\n🏆 Overall Results:');
        console.log(`   ✅ Passed: ${this.results.overall.passed}`);
        console.log(`   ❌ Failed: ${this.results.overall.failed}`);
        console.log(`   📈 Total: ${this.results.overall.total}`);
        console.log(`   📊 Success Rate: ${this.getOverallSuccessRate()}%`);
    }

    getSuccessRate(version) {
        if (this.results[version].total === 0) return 0;
        return ((this.results[version].passed / this.results[version].total) * 100).toFixed(1);
    }

    getOverallSuccessRate() {
        if (this.results.overall.total === 0) return 0;
        return ((this.results.overall.passed / this.results.overall.total) * 100).toFixed(1);
    }

    generateRecommendations() {
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (this.results.overall.failed === 0) {
            console.log('🎉 EXCELLENT! All tests passed!');
            console.log('✅ Both 2D and 3D games are working correctly.');
            console.log('🚀 Ready for production deployment.');
        } else {
            console.log('⚠️ Some tests failed. Here are the recommendations:');
            
            if (this.results['2D'].failed > 0) {
                console.log('\n🎯 2D Game Issues:');
                console.log('   - Check canvas initialization');
                console.log('   - Verify game object creation');
                console.log('   - Test letter placement mechanics');
                console.log('   - Validate word detection system');
                console.log('   - Check scoring calculations');
                console.log('   - Test game controls');
                console.log('   - Verify rendering system');
            }
            
            if (this.results['3D'].failed > 0) {
                console.log('\n🎨 3D Game Issues:');
                console.log('   - Ensure Three.js is loaded');
                console.log('   - Check WebGL support');
                console.log('   - Verify 3D scene creation');
                console.log('   - Test 3D game object initialization');
                console.log('   - Check 3D rendering capabilities');
            }
            
            console.log('\n🔧 Next Steps:');
            console.log('   1. Fix the identified issues');
            console.log('   2. Re-run the tests');
            console.log('   3. Check browser console for detailed error messages');
            console.log('   4. Verify all dependencies are loaded correctly');
        }
    }
}

// Auto-run when loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        const runner = new SimpleTestRunner();
        await runner.runAllTests();
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleTestRunner;
} 