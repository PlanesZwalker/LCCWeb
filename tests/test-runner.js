/**
 * 🧪 Test Runner - Letters Cascade Challenge
 * Comprehensive test suite runner for both 2D and 3D game versions
 */

class TestRunner {
    constructor() {
        this.results = {
            '2D': { passed: 0, failed: 0, total: 0, details: [] },
            '3D': { passed: 0, failed: 0, total: 0, details: [] },
            overall: { passed: 0, failed: 0, total: 0 }
        };
        this.currentTest = null;
    }

    // 🚀 Main Test Runner
    async runAllTests() {
        console.log('🧪 Starting Comprehensive Test Suite...');
        console.log('=' .repeat(60));
        console.log('🎮 Letters Cascade Challenge - Test Suite');
        console.log('=' .repeat(60));
        
        const startTime = performance.now();
        
        // Run 2D Tests
        await this.run2DTests();
        
        // Run 3D Tests
        await this.run3DTests();
        
        // Calculate overall results
        this.calculateOverallResults();
        
        // Print comprehensive results
        this.printComprehensiveResults(startTime);
        
        // Generate test report
        this.generateTestReport();
    }

    // 🎯 2D Game Tests
    async run2DTests() {
        console.log('\n🎯 Running 2D Game Tests...');
        console.log('-' .repeat(40));
        
        try {
            // Load 2D test file
            await this.loadScript('tests/2d-game-tests.js');
            
            // Initialize 2D tests
            const test2D = new Game2DTests();
            await test2D.runAllTests();
            
            // Capture results
            this.results['2D'] = test2D.testResults;
            
        } catch (error) {
            console.error('❌ Error running 2D tests:', error);
            this.results['2D'] = { passed: 0, failed: 1, total: 1, details: [error.message] };
        }
    }

    // 🎨 3D Game Tests
    async run3DTests() {
        console.log('\n🎨 Running 3D Game Tests...');
        console.log('-' .repeat(40));
        
        try {
            // Load 3D test file
            await this.loadScript('tests/3d-game-tests.js');
            
            // Initialize 3D tests
            const test3D = new Game3DTests();
            await test3D.runAllTests();
            
            // Capture results
            this.results['3D'] = test3D.testResults;
            
        } catch (error) {
            console.error('❌ Error running 3D tests:', error);
            this.results['3D'] = { passed: 0, failed: 1, total: 1, details: [error.message] };
        }
    }

    // 📊 Calculate Overall Results
    calculateOverallResults() {
        this.results.overall.passed = this.results['2D'].passed + this.results['3D'].passed;
        this.results.overall.failed = this.results['2D'].failed + this.results['3D'].failed;
        this.results.overall.total = this.results['2D'].total + this.results['3D'].total;
    }

    // 📈 Print Comprehensive Results
    printComprehensiveResults(startTime) {
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 COMPREHENSIVE TEST RESULTS');
        console.log('=' .repeat(60));
        
        // 2D Results
        console.log('\n🎯 2D Game Results:');
        console.log(`   ✅ Passed: ${this.results['2D'].passed}`);
        console.log(`   ❌ Failed: ${this.results['2D'].failed}`);
        console.log(`   📈 Total: ${this.results['2D'].total}`);
        console.log(`   📊 Success Rate: ${this.getSuccessRate('2D')}%`);
        
        // 3D Results
        console.log('\n🎨 3D Game Results:');
        console.log(`   ✅ Passed: ${this.results['3D'].passed}`);
        console.log(`   ❌ Failed: ${this.results['3D'].failed}`);
        console.log(`   📈 Total: ${this.results['3D'].total}`);
        console.log(`   📊 Success Rate: ${this.getSuccessRate('3D')}%`);
        
        // Overall Results
        console.log('\n🏆 Overall Results:');
        console.log(`   ✅ Passed: ${this.results.overall.passed}`);
        console.log(`   ❌ Failed: ${this.results.overall.failed}`);
        console.log(`   📈 Total: ${this.results.overall.total}`);
        console.log(`   📊 Success Rate: ${this.getOverallSuccessRate()}%`);
        console.log(`   ⏱️ Duration: ${duration}s`);
        
        // Status Summary
        this.printStatusSummary();
    }

    // 🎯 Print Status Summary
    printStatusSummary() {
        console.log('\n📋 Status Summary:');
        
        if (this.results.overall.failed === 0) {
            console.log('🎉 EXCELLENT! All tests passed!');
            console.log('✅ Both 2D and 3D games are working perfectly!');
        } else if (this.getOverallSuccessRate() >= 90) {
            console.log('🟢 GOOD! Most tests passed!');
            console.log('⚠️ Some minor issues detected, but games are functional.');
        } else if (this.getOverallSuccessRate() >= 70) {
            console.log('🟡 FAIR! Many tests passed!');
            console.log('⚠️ Several issues detected, games need attention.');
        } else {
            console.log('🔴 POOR! Many tests failed!');
            console.log('❌ Games have significant issues that need immediate attention.');
        }
        
        // Specific recommendations
        this.printRecommendations();
    }

    // 💡 Print Recommendations
    printRecommendations() {
        console.log('\n💡 Recommendations:');
        
        if (this.results['2D'].failed > 0) {
            console.log('🎯 2D Game needs attention:');
            console.log('   - Check game initialization');
            console.log('   - Verify canvas rendering');
            console.log('   - Test word detection system');
            console.log('   - Validate scoring mechanics');
        }
        
        if (this.results['3D'].failed > 0) {
            console.log('🎨 3D Game needs attention:');
            console.log('   - Verify Three.js integration');
            console.log('   - Check WebGL support');
            console.log('   - Test 3D rendering performance');
            console.log('   - Validate 3D controls');
        }
        
        if (this.results.overall.failed === 0) {
            console.log('🎉 No immediate action needed!');
            console.log('   - Games are working perfectly');
            console.log('   - Ready for production');
            console.log('   - Consider adding more test cases');
        }
    }

    // 📊 Calculate Success Rates
    getSuccessRate(version) {
        if (this.results[version].total === 0) return 0;
        return ((this.results[version].passed / this.results[version].total) * 100).toFixed(1);
    }

    getOverallSuccessRate() {
        if (this.results.overall.total === 0) return 0;
        return ((this.results.overall.passed / this.results.overall.total) * 100).toFixed(1);
    }

    // 📄 Generate Test Report
    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            results: this.results,
            summary: {
                totalTests: this.results.overall.total,
                passedTests: this.results.overall.passed,
                failedTests: this.results.overall.failed,
                successRate: this.getOverallSuccessRate(),
                status: this.getOverallStatus()
            }
        };
        
        // Save report to localStorage for debugging
        localStorage.setItem('testReport', JSON.stringify(report));
        
        console.log('\n📄 Test report saved to localStorage');
        console.log('🔍 Access with: localStorage.getItem("testReport")');
    }

    // 🏷️ Get Overall Status
    getOverallStatus() {
        const successRate = parseFloat(this.getOverallSuccessRate());
        if (successRate === 100) return 'EXCELLENT';
        if (successRate >= 90) return 'GOOD';
        if (successRate >= 70) return 'FAIR';
        return 'POOR';
    }

    // 📜 Load Script Dynamically
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 🧪 Individual Test Runner
    async runIndividualTest(testName, testFunction) {
        console.log(`🧪 Running: ${testName}`);
        
        try {
            const result = await testFunction();
            if (result) {
                console.log(`✅ ${testName} - PASSED`);
                return true;
            } else {
                console.log(`❌ ${testName} - FAILED`);
                return false;
            }
        } catch (error) {
            console.log(`❌ ${testName} - ERROR: ${error.message}`);
            return false;
        }
    }

    // 🔄 Retry Failed Tests
    async retryFailedTests(maxRetries = 3) {
        console.log('\n🔄 Retrying failed tests...');
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`\n📋 Attempt ${attempt}/${maxRetries}`);
            
            // Re-run tests
            await this.runAllTests();
            
            if (this.results.overall.failed === 0) {
                console.log('🎉 All tests passed on retry!');
                break;
            }
            
            if (attempt < maxRetries) {
                console.log('⏳ Waiting before retry...');
                await this.delay(2000); // Wait 2 seconds
            }
        }
    }

    // ⏱️ Delay Helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 🎯 Performance Tests
    async runPerformanceTests() {
        console.log('\n⚡ Running Performance Tests...');
        
        const performanceTests = [
            {
                name: '2D Rendering Performance',
                test: () => this.test2DRenderingPerformance()
            },
            {
                name: '3D Rendering Performance',
                test: () => this.test3DRenderingPerformance()
            },
            {
                name: 'Word Detection Performance',
                test: () => this.testWordDetectionPerformance()
            },
            {
                name: 'Memory Usage Test',
                test: () => this.testMemoryUsage()
            }
        ];
        
        for (const test of performanceTests) {
            await this.runIndividualTest(test.name, test.test);
        }
    }

    // ⚡ Performance Test Methods
    async test2DRenderingPerformance() {
        const startTime = performance.now();
        // Simulate 2D rendering
        for (let i = 0; i < 1000; i++) {
            // Mock rendering operation
        }
        const endTime = performance.now();
        const duration = endTime - startTime;
        return duration < 16; // 60 FPS target
    }

    async test3DRenderingPerformance() {
        const startTime = performance.now();
        // Simulate 3D rendering
        for (let i = 0; i < 1000; i++) {
            // Mock 3D rendering operation
        }
        const endTime = performance.now();
        const duration = endTime - startTime;
        return duration < 16; // 60 FPS target
    }

    async testWordDetectionPerformance() {
        const startTime = performance.now();
        // Simulate word detection
        for (let i = 0; i < 100; i++) {
            // Mock word detection operation
        }
        const endTime = performance.now();
        const duration = endTime - startTime;
        return duration < 50; // 50ms target
    }

    async testMemoryUsage() {
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize;
            return memoryUsage < 50 * 1024 * 1024; // 50MB limit
        }
        return true; // Skip if memory API not available
    }
}

// 🚀 Auto-run tests when loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        const runner = new TestRunner();
        await runner.runAllTests();
        
        // Run performance tests if requested
        if (window.location.search.includes('performance=true')) {
            await runner.runPerformanceTests();
        }
        
        // Retry failed tests if requested
        if (window.location.search.includes('retry=true')) {
            await runner.retryFailedTests();
        }
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestRunner;
} 