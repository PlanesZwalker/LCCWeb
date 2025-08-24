#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration for different page types
const pageConfigs = {
    'index.html': {
        title: 'Accueil',
        description: 'Letters Cascade Challenge - Jeu de lettres poétique avec versions 2D et 3D',
        cssPath: 'assets/css/',
        homePath: './',
        gamesPath: './pages/games/',
        docsPath: './pages/docs/',
        rulesPath: './pages/docs/rules.html'
    },
    'pages/games/index.html': {
        title: 'Centre de Jeux',
        description: 'Choisissez votre mode de jeu préféré',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: './',
        docsPath: '../docs/',
        rulesPath: '../docs/rules.html'
    },
    'pages/games/classic-2d-game.html': {
        title: 'Jeu 2D Classique',
        description: 'Version 2D traditionnelle du Letters Cascade Challenge',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: './',
        docsPath: '../docs/',
        rulesPath: '../docs/rules.html'
    },
    'pages/games/threejs-3d-game.html': {
        title: 'Jeu 3D Three.js',
        description: 'Version 3D immersive avec Three.js',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: './',
        docsPath: '../docs/',
        rulesPath: '../docs/rules.html'
    },
    'pages/docs/GDD.html': {
        title: 'Document de Conception',
        description: 'Game Design Document du Letters Cascade Challenge',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: '../games/',
        docsPath: './',
        rulesPath: './rules.html'
    },
    'pages/docs/rules.html': {
        title: 'Règles du Jeu',
        description: 'Règles et instructions du Letters Cascade Challenge',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: '../games/',
        docsPath: './',
        rulesPath: './'
    },
    'pages/docs/sitemap.html': {
        title: 'Plan du Site',
        description: 'Plan du site Letters Cascade Challenge',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: '../games/',
        docsPath: './',
        rulesPath: './rules.html'
    },
    'pages/docs/technical-spec.html': {
        title: 'Spécifications Techniques',
        description: 'Spécifications techniques du Letters Cascade Challenge',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: '../games/',
        docsPath: './',
        rulesPath: './rules.html'
    },
    'pages/games/agents-discussion.html': {
        title: 'Plateforme Agents IA',
        description: 'Plateforme de discussion avec agents IA',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: './',
        docsPath: '../docs/',
        rulesPath: '../docs/rules.html'
    },
    'pages/games/moodboard.html': {
        title: 'Moodboard',
        description: 'Références visuelles et inspiration',
        cssPath: '../../assets/css/',
        homePath: '../../',
        gamesPath: './',
        docsPath: '../docs/',
        rulesPath: '../docs/rules.html'
    }
};

// Read the base template
function readBaseTemplate() {
    const templatePath = path.join(__dirname, '../assets/templates/base-template.html');
    return fs.readFileSync(templatePath, 'utf8');
}

// Extract content from existing HTML file
function extractContent(htmlContent) {
    // Remove existing head content and body tags, keep only the main content
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) return '';
    
    let bodyContent = bodyMatch[1];
    
    // Remove navigation elements if they exist
    bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
    bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
    bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    
    // Remove script tags (we'll add them back as page-specific JS)
    bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    return bodyContent.trim();
}

// Extract page-specific CSS from existing HTML
function extractPageCSS(htmlContent) {
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (!styleMatch) return '';
    
    return `<style>${styleMatch[1]}</style>`;
}

// Extract page-specific JavaScript from existing HTML
function extractPageJS(htmlContent) {
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (!scriptMatches) return '';
    
    return scriptMatches.map(script => {
        // Skip navigation scripts
        if (script.includes('navToggle') || script.includes('navigation')) {
            return '';
        }
        return script;
    }).join('\n');
}

// Apply template to HTML file
function applyTemplate(filePath) {
    const config = pageConfigs[filePath];
    if (!config) {
        console.log(`⚠️  No configuration found for ${filePath}, skipping...`);
        return;
    }
    
    console.log(`🔄 Processing ${filePath}...`);
    
    // Read existing file
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File not found: ${fullPath}`);
        return;
    }
    
    const existingContent = fs.readFileSync(fullPath, 'utf8');
    
    // Extract content
    const pageContent = extractContent(existingContent);
    const pageCSS = extractPageCSS(existingContent);
    const pageJS = extractPageJS(existingContent);
    
    // Read base template
    let template = readBaseTemplate();
    
    // Replace template variables
    template = template.replace(/{{PAGE_TITLE}}/g, config.title);
    template = template.replace(/{{PAGE_DESCRIPTION}}/g, config.description);
    template = template.replace(/{{CSS_PATH}}/g, config.cssPath);
    template = template.replace(/{{HOME_PATH}}/g, config.homePath);
    template = template.replace(/{{GAMES_PATH}}/g, config.gamesPath);
    template = template.replace(/{{DOCS_PATH}}/g, config.docsPath);
    template = template.replace(/{{RULES_PATH}}/g, config.rulesPath);
    template = template.replace(/{{PAGE_CSS}}/g, pageCSS);
    template = template.replace(/{{PAGE_JS}}/g, pageJS);
    template = template.replace(/{{PAGE_CONTENT}}/g, pageContent);
    
    // Write back to file
    fs.writeFileSync(fullPath, template);
    console.log(`✅ Updated ${filePath}`);
}

// Main function
function main() {
    console.log('🎨 Starting template uniformization...\n');
    
    // Process each configured file
    Object.keys(pageConfigs).forEach(filePath => {
        try {
            applyTemplate(filePath);
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    });
    
    console.log('\n✨ Template uniformization completed!');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { applyTemplate, pageConfigs };
