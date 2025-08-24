/**
 * test-modular-system.js - Test script for modular game system
 * This script tests the integration of all game modules
 */

import { GameCore } from './modules/GameCore.js';
import { GameState } from './modules/GameState.js';
import { LetterManager } from './modules/LetterManager.js';
import { WordManager } from './modules/WordManager.js';
import { ScoreManager } from './modules/ScoreManager.js';
import { LevelManager } from './modules/LevelManager.js';
import { PowerUpManager } from './modules/PowerUpManager.js';
import { AchievementManager } from './modules/AchievementManager.js';
import { TutorialManager } from './modules/TutorialManager.js';
import { UIManager } from './modules/UIManager.js';
import { AudioManager } from './modules/AudioManager.js';
import { AnalyticsManager } from './modules/AnalyticsManager.js';
import { BackgroundManager } from './modules/BackgroundManager.js';

class ModularSystemTest {
    constructor() {
        this.testResults = [];
        this.currentTest = 0;
        this.totalTests = 0;
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Modular System Tests...');
        
        this.totalTests = 8;
        this.currentTest = 0;

        try {
            await this.testModuleImports();
            await this.testGameCoreInitialization();
            await this.testManagerInitialization();
            await this.testGameStateManagement();
            await this.testAudioSystem();
            await this.testUISystem();
            await this.testAnalyticsSystem();
            await this.testBackgroundSystem();

            this.printTestResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    /**
     * Test module imports
     */
    async testModuleImports() {
        this.currentTest++;
        console.log(`\n📦 Test ${this.currentTest}: Module Imports`);

        try {
            // Test that all modules can be imported
            const modules = {
                GameCore,
                GameState,
                LetterManager,
                WordManager,
                ScoreManager,
                LevelManager,
                PowerUpManager,
                AchievementManager,
                TutorialManager,
                UIManager,
                AudioManager,
                AnalyticsManager,
                BackgroundManager
            };

            let success = true;
            for (const [name, module] of Object.entries(modules)) {
                if (!module) {
                    console.error(`❌ Failed to import ${name}`);
                    success = false;
                }
            }

            if (success) {
                console.log('✅ All modules imported successfully');
                this.testResults.push({ test: 'Module Imports', status: 'PASS' });
            } else {
                this.testResults.push({ test: 'Module Imports', status: 'FAIL' });
            }
        } catch (error) {
            console.error('❌ Module import test failed:', error);
            this.testResults.push({ test: 'Module Imports', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Test GameCore initialization
     */
    async testGameCoreInitialization() {
        this.currentTest++;
        console.log(`\n🎮 Test ${this.currentTest}: GameCore Initialization`);

        try {
            const gameCore = new GameCore();
            
            // Test that all managers are initialized
            const managers = [
                'gameState',
                'letterManager',
                'wordManager',
                'scoreManager',
                'levelManager',
                'powerUpManager',
                'achievementManager',
                'tutorialManager',
                'uiManager',
                'audioManager',
                'analyticsManager',
                'backgroundManager'
            ];

            let success = true;
            for (const managerName of managers) {
                if (!gameCore[managerName]) {
                    console.error(`❌ Manager ${managerName} not initialized`);
                    success = false;
                }
            }

            if (success) {
                console.log('✅ GameCore initialized with all managers');
                this.testResults.push({ test: 'GameCore Initialization', status: 'PASS' });
            } else {
                this.testResults.push({ test: 'GameCore Initialization', status: 'FAIL' });
            }
        } catch (error) {
            console.error('❌ GameCore initialization test failed:', error);
            this.testResults.push({ test: 'GameCore Initialization', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Test individual manager initialization
     */
    async testManagerInitialization() {
        this.currentTest++;
        console.log(`\n🔧 Test ${this.currentTest}: Manager Initialization`);

        try {
            const managers = [
                { name: 'GameState', class: GameState },
                { name: 'LetterManager', class: LetterManager },
                { name: 'WordManager', class: WordManager },
                { name: 'ScoreManager', class: ScoreManager },
                { name: 'LevelManager', class: LevelManager },
                { name: 'PowerUpManager', class: PowerUpManager },
                { name: 'AchievementManager', class: AchievementManager },
                { name: 'TutorialManager', class: TutorialManager },
                { name: 'UIManager', class: UIManager },
                { name: 'AudioManager', class: AudioManager },
                { name: 'AnalyticsManager', class: AnalyticsManager },
                { name: 'BackgroundManager', class: BackgroundManager }
            ];

            let success = true;
            for (const manager of managers) {
                try {
                    const instance = new manager.class();
                    console.log(`✅ ${manager.name} initialized`);
                } catch (error) {
                    console.error(`❌ ${manager.name} initialization failed:`, error);
                    success = false;
                }
            }

            if (success) {
                console.log('✅ All managers initialized successfully');
                this.testResults.push({ test: 'Manager Initialization', status: 'PASS' });
            } else {
                this.testResults.push({ test: 'Manager Initialization', status: 'FAIL' });
            }
        } catch (error) {
            console.error('❌ Manager initialization test failed:', error);
            this.testResults.push({ test: 'Manager Initialization', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Test game state management
     */
    async testGameStateManagement() {
        this.currentTest++;
        console.log(`\n🎯 Test ${this.currentTest}: Game State Management`);

        try {
            const gameState = new GameState();
            await gameState.init();

            // Test state transitions
            gameState.setRunning(true);
            if (!gameState.isRunning()) {
                throw new Error('Game state not set to running');
            }

            gameState.setPaused(true);
            if (!gameState.isPaused()) {
                throw new Error('Game state not set to paused');
            }

            gameState.setLevel(5);
            if (gameState.getLevel() !== 5) {
                throw new Error('Level not set correctly');
            }

            console.log('✅ Game state management working correctly');
            this.testResults.push({ test: 'Game State Management', status: 'PASS' });
        } catch (error) {
            console.error('❌ Game state management test failed:', error);
            this.testResults.push({ test: 'Game State Management', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Test audio system
     */
    async testAudioSystem() {
        this.currentTest++;
        console.log(`\n🎵 Test ${this.currentTest}: Audio System`);

        try {
            const audioManager = new AudioManager();
            await audioManager.init();

            // Test audio methods (without actually playing)
            audioManager.setMusicVolume(0.5);
            audioManager.setSoundVolume(0.7);
            audioManager.mute();
            audioManager.unmute();

            console.log('✅ Audio system initialized successfully');
            this.testResults.push({ test: 'Audio System', status: 'PASS' });
        } catch (error) {
            console.error('❌ Audio system test failed:', error);
            this.testResults.push({ test: 'Audio System', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Test UI system
     */
    async testUISystem() {
        this.currentTest++;
        console.log(`\n🎨 Test ${this.currentTest}: UI System`);

        try {
            const uiManager = new UIManager();
            await uiManager.init();

            // Test UI methods
            uiManager.addParticle(100, 100, 'sparkle');
            uiManager.addNotification('Test notification', 'info');
            uiManager.setTheme('dark');

            console.log('✅ UI system initialized successfully');
            this.testResults.push({ test: 'UI System', status: 'PASS' });
        } catch (error) {
            console.error('❌ UI system test failed:', error);
            this.testResults.push({ test: 'UI System', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Test analytics system
     */
    async testAnalyticsSystem() {
        this.currentTest++;
        console.log(`\n📊 Test ${this.currentTest}: Analytics System`);

        try {
            const analyticsManager = new AnalyticsManager();
            await analyticsManager.init();

            // Test analytics methods
            analyticsManager.trackEvent('test_event', { test: true });
            analyticsManager.trackGameStart();
            analyticsManager.updatePerformanceMetrics(60);

            const analytics = analyticsManager.getAnalytics();
            if (!analytics.sessionId) {
                throw new Error('Analytics session not created');
            }

            console.log('✅ Analytics system working correctly');
            this.testResults.push({ test: 'Analytics System', status: 'PASS' });
        } catch (error) {
            console.error('❌ Analytics system test failed:', error);
            this.testResults.push({ test: 'Analytics System', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Test background system
     */
    async testBackgroundSystem() {
        this.currentTest++;
        console.log(`\n🖼️ Test ${this.currentTest}: Background System`);

        try {
            const backgroundManager = new BackgroundManager();
            await backgroundManager.init();

            // Test background methods
            backgroundManager.setParallaxEnabled(true);
            backgroundManager.setParallaxSpeed(0.5);

            const metrics = backgroundManager.getPerformanceMetrics();
            if (typeof metrics.isLoaded !== 'boolean') {
                throw new Error('Background metrics not working');
            }

            console.log('✅ Background system initialized successfully');
            this.testResults.push({ test: 'Background System', status: 'PASS' });
        } catch (error) {
            console.error('❌ Background system test failed:', error);
            this.testResults.push({ test: 'Background System', status: 'FAIL', error: error.message });
        }
    }

    /**
     * Print test results
     */
    printTestResults() {
        console.log('\n📋 TEST RESULTS SUMMARY');
        console.log('========================');

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;

        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / this.totalTests) * 100).toFixed(1)}%`);

        console.log('\nDetailed Results:');
        this.testResults.forEach((result, index) => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${index + 1}. ${result.test}: ${result.status}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });

        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Modular system is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the errors above.');
        }
    }
}

// Export for use in other files
export { ModularSystemTest };

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const tester = new ModularSystemTest();
        tester.runAllTests();
    });
}
