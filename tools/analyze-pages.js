#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Function to analyze a single HTML file
function analyzeHTMLFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        console.log(`\n📄 Analyzing: ${fileName}`);
        console.log('─'.repeat(50));
        
        // Check for enhanced features
        const hasEnhancedCSS = content.includes('gradientShift');
        const hasParticles = content.includes('class="particles"');
        const hasHeroSection = content.includes('hero-section');
        const hasEnhancedJS = content.includes('Enhanced animations on page load');
        const hasProperFavicon = content.includes('data:image/svg+xml');
        const hasFont900 = content.includes('900&display=swap');
        
        // Check for issues
        const hasDuplicateCSS = (content.match(/<style>/g) || []).length > 1;
        const hasDuplicateContent = content.includes('<div class="content-section">\s*<div class="content-section">');
        const hasOldStyles = content.includes('background: linear-gradient(135deg, var(--primary-600)');
        
        console.log(`✅ Enhanced CSS: ${hasEnhancedCSS ? 'Yes' : '❌ No'}`);
        console.log(`✅ Particles: ${hasParticles ? 'Yes' : '❌ No'}`);
        console.log(`✅ Hero Section: ${hasHeroSection ? 'Yes' : '❌ No'}`);
        console.log(`✅ Enhanced JS: ${hasEnhancedJS ? 'Yes' : '❌ No'}`);
        console.log(`✅ Proper Favicon: ${hasProperFavicon ? 'Yes' : '❌ No'}`);
        console.log(`✅ Font 900: ${hasFont900 ? 'Yes' : '❌ No'}`);
        
        if (hasDuplicateCSS) console.log(`⚠️  Duplicate CSS detected`);
        if (hasDuplicateContent) console.log(`⚠️  Duplicate content structure`);
        if (hasOldStyles) console.log(`⚠️  Old styles still present`);
        
        // Calculate score
        let score = 0;
        if (hasEnhancedCSS) score += 20;
        if (hasParticles) score += 15;
        if (hasHeroSection) score += 20;
        if (hasEnhancedJS) score += 15;
        if (hasProperFavicon) score += 10;
        if (hasFont900) score += 10;
        if (!hasDuplicateCSS) score += 5;
        if (!hasDuplicateContent) score += 5;
        
        console.log(`📊 Score: ${score}/100`);
        
        return {
            fileName,
            score,
            hasEnhancedCSS,
            hasParticles,
            hasHeroSection,
            hasEnhancedJS,
            hasProperFavicon,
            hasFont900,
            hasDuplicateCSS,
            hasDuplicateContent,
            hasOldStyles
        };
        
    } catch (error) {
        console.error(`❌ Error analyzing ${filePath}:`, error.message);
        return null;
    }
}

// Function to generate improvement recommendations
function generateRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.hasEnhancedCSS) {
        recommendations.push('Add enhanced CSS with animated gradients');
    }
    
    if (!analysis.hasParticles) {
        recommendations.push('Add floating particles background');
    }
    
    if (!analysis.hasHeroSection) {
        recommendations.push('Add hero section with animated title');
    }
    
    if (!analysis.hasEnhancedJS) {
        recommendations.push('Add enhanced JavaScript animations');
    }
    
    if (!analysis.hasProperFavicon) {
        recommendations.push('Update favicon to page-specific emoji');
    }
    
    if (!analysis.hasFont900) {
        recommendations.push('Include font weight 900 for enhanced typography');
    }
    
    if (analysis.hasDuplicateCSS) {
        recommendations.push('Remove duplicate CSS blocks');
    }
    
    if (analysis.hasDuplicateContent) {
        recommendations.push('Clean up duplicate content structure');
    }
    
    if (analysis.hasOldStyles) {
        recommendations.push('Remove old conflicting styles');
    }
    
    return recommendations;
}

// Main analysis function
function analyzeAllPages() {
    console.log('🔍 Starting comprehensive page analysis...\n');
    
    const htmlFiles = [
        'index.html',
        'pages/docs/GDD.html',
        'pages/docs/rules.html',
        'pages/docs/sitemap.html',
        'pages/docs/technical-spec.html',
        'pages/docs/docs-index.html',
        'pages/games/moodboard.html',
        'pages/games/classic-2d-game.html',
        'pages/games/threejs-3d-game.html',
        'pages/games/game.html',
        'docs/index.html'
    ];
    
    const analyses = [];
    let totalScore = 0;
    let pageCount = 0;
    
    htmlFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const analysis = analyzeHTMLFile(filePath);
            if (analysis) {
                analyses.push(analysis);
                totalScore += analysis.score;
                pageCount++;
            }
        } else {
            console.log(`⚠️  File not found: ${filePath}`);
        }
    });
    
    // Generate summary
    console.log('\n📊 ANALYSIS SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Total pages analyzed: ${pageCount}`);
    console.log(`Average score: ${Math.round(totalScore / pageCount)}/100`);
    
    // Find pages that need improvement
    const needsImprovement = analyses.filter(a => a.score < 80);
    if (needsImprovement.length > 0) {
        console.log(`\n⚠️  Pages needing improvement (${needsImprovement.length}):`);
        needsImprovement.forEach(page => {
            console.log(`  • ${page.fileName} (${page.score}/100)`);
            const recommendations = generateRecommendations(page);
            recommendations.forEach(rec => console.log(`    - ${rec}`));
        });
    }
    
    // Find best performing pages
    const bestPages = analyses.filter(a => a.score >= 90);
    if (bestPages.length > 0) {
        console.log(`\n🏆 Best performing pages (${bestPages.length}):`);
        bestPages.forEach(page => {
            console.log(`  • ${page.fileName} (${page.score}/100)`);
        });
    }
    
    // Overall recommendations
    console.log('\n💡 OVERALL RECOMMENDATIONS:');
    console.log('═'.repeat(50));
    
    const allRecommendations = new Set();
    analyses.forEach(analysis => {
        const recommendations = generateRecommendations(analysis);
        recommendations.forEach(rec => allRecommendations.add(rec));
    });
    
    if (allRecommendations.size > 0) {
        Array.from(allRecommendations).forEach(rec => {
            console.log(`• ${rec}`);
        });
    } else {
        console.log('✅ All pages are properly uniformized!');
    }
    
    return analyses;
}

// Run the analysis
if (require.main === module) {
    analyzeAllPages();
}

module.exports = { analyzeAllPages, analyzeHTMLFile };
