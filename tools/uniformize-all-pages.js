#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Enhanced CSS template that will be applied to all pages
const enhancedCSS = `
        /* Enhanced Background with Animated Gradients */
        body {
            background: linear-gradient(-45deg, #0f172a, #1e293b, #334155, #475569, #64748b);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            position: relative;
            overflow-x: hidden;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Floating Particles Background */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }
        
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }
        
        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 20%; animation-delay: 1s; }
        .particle:nth-child(3) { left: 30%; animation-delay: 2s; }
        .particle:nth-child(4) { left: 40%; animation-delay: 3s; }
        .particle:nth-child(5) { left: 50%; animation-delay: 4s; }
        .particle:nth-child(6) { left: 60%; animation-delay: 5s; }
        .particle:nth-child(7) { left: 70%; animation-delay: 0s; }
        .particle:nth-child(8) { left: 80%; animation-delay: 1s; }
        .particle:nth-child(9) { left: 90%; animation-delay: 2s; }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
            50% { transform: translateY(-100px) rotate(180deg); opacity: 1; }
        }
        
        /* Enhanced Hero Section */
        .hero-section {
            text-align: center;
            padding: var(--spacing-4xl) 0;
            margin-bottom: var(--spacing-3xl);
            position: relative;
        }
        
        .hero-section::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }
        
        .hero-title {
            font-size: 4.5rem;
            font-weight: 900;
            background: linear-gradient(135deg, #60a5fa, #a855f7, #f59e0b, #10b981);
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: var(--spacing-lg);
            line-height: 1.1;
            animation: titleGradient 8s ease infinite;
            text-shadow: 0 0 30px rgba(96, 165, 250, 0.3);
            position: relative;
            z-index: 2;
        }
        
        @keyframes titleGradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .hero-subtitle {
            font-size: 1.4rem;
            color: var(--neutral-200);
            margin-bottom: var(--spacing-xl);
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.7;
            font-weight: 400;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 2;
        }
        
        /* Enhanced Navigation */
        .unified-nav-header {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(30px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .unified-nav-brand {
            color: var(--primary-300);
            text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
        }
        
        .unified-nav-link {
            color: var(--neutral-200);
            font-weight: 600;
        }
        
        .unified-nav-link:hover {
            color: var(--primary-300);
            background: rgba(96, 165, 250, 0.15);
            text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
        }
        
        /* Enhanced Footer */
        .glass-panel {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        /* Enhanced Content Sections */
        .content-section {
            background: rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: var(--radius-2xl);
            padding: var(--spacing-2xl);
            margin-bottom: var(--spacing-xl);
            position: relative;
            z-index: 2;
        }
        
        .content-section:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--primary-400);
            transform: translateY(-2px);
            transition: all var(--transition-normal);
        }
        
        /* Enhanced Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-lg);
            border-radius: var(--radius-md);
            font-weight: 600;
            text-decoration: none;
            transition: all var(--transition-normal);
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
            position: relative;
            overflow: hidden;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .btn:hover::before {
            left: 100%;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
            color: white;
            box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: var(--neutral-200);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            border-color: var(--primary-400);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .hero-title {
                font-size: 3rem;
            }
            
            .hero-subtitle {
                font-size: 1.2rem;
            }
            
            .content-section {
                padding: var(--spacing-xl);
            }
        }
        
        @media (max-width: 480px) {
            .hero-title {
                font-size: 2.5rem;
            }
        }
`;

// Enhanced JavaScript template
const enhancedJS = `
        // Enhanced animations on page load
        document.addEventListener('DOMContentLoaded', function() {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const contentSections = document.querySelectorAll('.content-section');
            
            // Animate hero elements
            if (heroTitle) {
                heroTitle.style.opacity = '0';
                heroTitle.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    heroTitle.style.transition = 'all 1s ease';
                    heroTitle.style.opacity = '1';
                    heroTitle.style.transform = 'translateY(0)';
                }, 200);
            }
            
            if (heroSubtitle) {
                heroSubtitle.style.opacity = '0';
                heroSubtitle.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    heroSubtitle.style.transition = 'all 1s ease';
                    heroSubtitle.style.opacity = '1';
                    heroSubtitle.style.transform = 'translateY(0)';
                }, 400);
            }
            
            // Animate content sections with stagger
            contentSections.forEach((section, index) => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    section.style.transition = 'all 0.6s ease';
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, 600 + index * 100);
            });
            
            // Add parallax effect to particles
            window.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;
                const particles = document.querySelectorAll('.particle');
                
                particles.forEach((particle, index) => {
                    const speed = 0.5 + (index * 0.1);
                    particle.style.transform = \`translateY(\${scrolled * speed}px)\`;
                });
            });
        });
`;

// Function to add particles HTML
function addParticlesHTML() {
    return `
    <!-- Floating Particles -->
    <div class="particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
    </div>
`;
}

// Function to update a single HTML file
function updateHTMLFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Update font weights to include 900
        content = content.replace(
            /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@[^"]*"/g,
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"'
        );
        
        // Replace old CSS with enhanced CSS
        const oldCSSPattern = /<style>\s*\/\* Base page styles \*\/[\s\S]*?<\/style>/;
        if (oldCSSPattern.test(content)) {
            content = content.replace(oldCSSPattern, `<style>${enhancedCSS}</style>`);
        } else {
            // If no old CSS found, add enhanced CSS after the last link tag
            const lastLinkIndex = content.lastIndexOf('</link>');
            if (lastLinkIndex !== -1) {
                content = content.slice(0, lastLinkIndex + 7) + `\n    <style>${enhancedCSS}</style>` + content.slice(lastLinkIndex + 7);
            }
        }
        
        // Add particles HTML after body tag
        if (!content.includes('class="particles"')) {
            content = content.replace('<body>', '<body>\n    ' + addParticlesHTML());
        }
        
        // Add enhanced JavaScript before closing body tag
        if (!content.includes('Enhanced animations on page load')) {
            const bodyCloseIndex = content.lastIndexOf('</body>');
            if (bodyCloseIndex !== -1) {
                content = content.slice(0, bodyCloseIndex) + `\n    <script>${enhancedJS}</script>` + content.slice(bodyCloseIndex);
            }
        }
        
        // Update favicon to be more specific to the page
        const pageName = path.basename(filePath, '.html');
        const faviconEmojis = {
            'index': '🏠',
            'GDD': '📋',
            'rules': '📖',
            'sitemap': '🗺️',
            'technical-spec': '⚙️',
            'moodboard': '🎨',
            'classic-2d-game': '📱',
            'threejs-3d-game': '🌐',
            'agents-discussion': '🤖'
        };
        
        const emoji = faviconEmojis[pageName] || '🎮';
        content = content.replace(
            /<link rel="icon" href="data:image\/svg\+xml,[^"]*">/g,
            `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>">`
        );
        
        // Add hero section if it doesn't exist
        if (!content.includes('hero-section')) {
            const mainContentIndex = content.indexOf('<main class="main-content">');
            if (mainContentIndex !== -1) {
                const containerIndex = content.indexOf('<div class="container">', mainContentIndex);
                if (containerIndex !== -1) {
                    const heroSection = `
            <!-- Hero Section -->
            <section class="hero-section">
                <h1 class="hero-title">${getPageTitle(pageName)}</h1>
                <p class="hero-subtitle">${getPageDescription(pageName)}</p>
            </section>
            
            `;
                    content = content.slice(0, containerIndex + 23) + heroSection + content.slice(containerIndex + 23);
                }
            }
        }
        
        // Wrap existing content in content-section divs
        content = wrapContentInSections(content);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Function to get page title
function getPageTitle(pageName) {
    const titles = {
        'index': '🏠 Accueil',
        'GDD': '📋 Document de Conception',
        'rules': '📖 Règles du Jeu',
        'sitemap': '🗺️ Plan du Site',
        'technical-spec': '⚙️ Spécifications Techniques',
        'moodboard': '🎨 Moodboard & Références',
        'classic-2d-game': '📱 Jeu 2D Classique',
        'threejs-3d-game': '🌐 Jeu 3D Immersif',
        'agents-discussion': '🤖 Agents IA'
    };
    return titles[pageName] || '🎮 Letters Cascade Challenge';
}

// Function to get page description
function getPageDescription(pageName) {
    const descriptions = {
        'index': 'Bienvenue dans l\'univers du Letters Cascade Challenge',
        'GDD': 'Documentation complète de la conception du jeu',
        'rules': 'Découvrez les règles et mécaniques du jeu',
        'sitemap': 'Navigation complète du site web',
        'technical-spec': 'Spécifications techniques détaillées',
        'moodboard': 'Inspiration visuelle et références créatives',
        'classic-2d-game': 'Version 2D traditionnelle du jeu',
        'threejs-3d-game': 'Expérience 3D immersive avancée',
        'agents-discussion': 'Plateforme de collaboration avec agents IA'
    };
    return descriptions[pageName] || 'Découvrez notre univers de jeu';
}

// Function to wrap content in sections
function wrapContentInSections(content) {
    // Find the main content area
    const mainStart = content.indexOf('<main class="main-content">');
    if (mainStart === -1) return content;
    
    const containerStart = content.indexOf('<div class="container">', mainStart);
    if (containerStart === -1) return content;
    
    // Find the end of the container
    let containerEnd = content.indexOf('</div>', containerStart);
    let depth = 1;
    let i = containerStart + 23;
    
    while (depth > 0 && i < content.length) {
        if (content.slice(i, i + 6) === '<div ') depth++;
        if (content.slice(i, i + 7) === '</div>') depth--;
        i++;
    }
    containerEnd = i;
    
    const beforeContainer = content.slice(0, containerStart + 23);
    const containerContent = content.slice(containerStart + 23, containerEnd);
    const afterContainer = content.slice(containerEnd);
    
    // Split content by sections and wrap them
    const sections = containerContent.split(/(?=<section|<!--)/);
    const wrappedSections = sections.map(section => {
        if (section.trim() && !section.includes('hero-section')) {
            return `<div class="content-section">${section}</div>`;
        }
        return section;
    }).join('');
    
    return beforeContainer + wrappedSections + afterContainer;
}

// Main function to process all HTML files
function processAllHTMLFiles() {
    console.log('🎨 Starting comprehensive page uniformization...\n');
    
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
    
    htmlFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            updateHTMLFile(filePath);
        } else {
            console.log(`⚠️  File not found: ${filePath}`);
        }
    });
    
    console.log('\n✨ Comprehensive page uniformization completed!');
    console.log('🎯 All pages now use the unified enhanced design system.');
}

// Run the script
if (require.main === module) {
    processAllHTMLFiles();
}

module.exports = { processAllHTMLFiles, updateHTMLFile };
