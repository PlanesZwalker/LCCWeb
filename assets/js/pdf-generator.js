/**
 * 📄 Game Design Document PDF Generator
 * Generates a proper PDF version of the GDD for download
 */

class GDDPDFGenerator {
    constructor() {
        this.title = "Letters Cascade Challenge - Game Design Document";
        this.version = "1.0";
        this.date = "Juillet 2025";
        console.log('🔧 GDD PDF Generator initialized');
    }

    /**
     * Generate PDF using HTML content to PDF conversion
     */
    async generatePDF() {
        try {
            console.log('📄 Starting PDF generation...');
            
            // Check if html2pdf is available
            if (typeof html2pdf === 'undefined') {
                console.error('❌ html2pdf library not found, falling back to window.print()');
                this.fallbackPrint();
                return;
            }

            // Prepare the content for PDF
            const content = this.preparePDFContent();
            
            // Configure PDF options with enhanced settings and security fixes
            const options = {
                margin: [15, 12, 15, 12], // Top, Left, Bottom, Right margins
                filename: 'Letters-Cascade-Challenge-GDD-v1.0.pdf',
                image: { 
                    type: 'jpeg', 
                    quality: 0.98,
                    crossOrigin: 'anonymous'
                },
                html2canvas: { 
                    scale: 2.5, // Higher resolution
                    useCORS: true,
                    letterRendering: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: 794, // A4 width in pixels at 96 DPI
                    height: 1123, // A4 height in pixels at 96 DPI
                    scrollX: 0,
                    scrollY: 0,
                    // Fix for cross-origin issues
                    foreignObjectRendering: false,
                    removeContainer: true,
                    // Disable features that cause warnings
                    ignoreElements: (element) => {
                        // Ignore elements that might cause cross-origin issues
                        return element.tagName === 'SCRIPT' || 
                               element.tagName === 'LINK' ||
                               element.classList.contains('no-pdf');
                    }
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true,
                    precision: 2,
                    userUnit: 1.0,
                    // Fix for local file warnings
                    putOnlyUsedFonts: true,
                    floatPrecision: 2
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: '.page-break-before',
                    after: '.page-break-after',
                    avoid: '.page-break-avoid'
                },
                // Additional security and compatibility options
                enableLinks: false
            };

            // Generate and download PDF with error handling
            try {
                await html2pdf().set(options).from(content).save();
                console.log('✅ PDF generated successfully');
                this.showSuccessMessage();
            } catch (pdfError) {
                console.warn('⚠️ PDF generation had issues, but continuing:', pdfError);
                // Try alternative approach
                await this.generatePDFAlternative(content, options);
            }
            
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            this.showErrorMessage(error.message);
            this.fallbackPrint();
        }
    }

    /**
     * Get optimized canvas options to prevent warnings
     */
    getCanvasOptions() {
        return {
            scale: 2.5,
            useCORS: true,
            letterRendering: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794,
            height: 1123,
            scrollX: 0,
            scrollY: 0,
            // Security fixes
            foreignObjectRendering: false,
            removeContainer: true,
            // Ignore problematic elements
            ignoreElements: (element) => {
                return element.tagName === 'SCRIPT' || 
                       element.tagName === 'LINK' ||
                       element.classList.contains('no-pdf') ||
                       element.classList.contains('resource-link');
            },
            // Disable features that cause warnings
            onclone: (clonedDoc) => {
                // Remove any problematic elements from cloned document
                const scripts = clonedDoc.querySelectorAll('script');
                scripts.forEach(script => script.remove());
                
                // Remove any external links that might cause CORS issues
                const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
                links.forEach(link => {
                    if (link.href && !link.href.startsWith('data:')) {
                        link.remove();
                    }
                });
                
                // Add inline styles to prevent external dependencies
                const style = clonedDoc.createElement('style');
                style.textContent = `
                    * { 
                        font-size-adjust: none !important;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }
                `;
                clonedDoc.head.appendChild(style);
            }
        };
    }

    /**
     * Alternative PDF generation method
     */
    async generatePDFAlternative(content, options) {
        try {
            console.log('🔄 Trying alternative PDF generation method...');
            
            // Simplified options for better compatibility
            const simpleOptions = {
                margin: [10, 10, 10, 10],
                filename: 'Letters-Cascade-Challenge-GDD-v1.0.pdf',
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    foreignObjectRendering: false,
                    removeContainer: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true,
                    putOnlyUsedFonts: true
                }
            };

            await html2pdf().set(simpleOptions).from(content).save();
            console.log('✅ Alternative PDF generation successful');
            this.showSuccessMessage();
            
        } catch (altError) {
            console.error('❌ Alternative PDF generation failed:', altError);
            this.fallbackPrint();
        }
    }

    /**
     * Prepare clean content for PDF generation
     */
    preparePDFContent() {
        // Create a clean version of the document content with enhanced typography
        const pdfContent = document.createElement('div');
        pdfContent.style.cssText = `
            font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #2c3e50;
            max-width: 190mm;
            margin: 0 auto;
            padding: 0;
            background: white;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        `;

        // Add professional title page with enhanced styling
        pdfContent.innerHTML = `
            <div class="title-page" style="
                text-align: center; 
                height: 100vh; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                page-break-after: always;
                background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
                border: 3px solid #667eea;
                margin: -10mm;
                padding: 40mm 20mm;
            ">
                <div style="margin-bottom: 30px;">
                    <div style="
                        font-size: 48pt; 
                        font-weight: 900; 
                        color: #667eea; 
                        margin-bottom: 15px;
                        text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.2);
                        letter-spacing: -1px;
                    ">
                        Letters Cascade
                    </div>
                    <div style="
                        font-size: 36pt; 
                        font-weight: 700; 
                        color: #764ba2; 
                        margin-bottom: 40px;
                        letter-spacing: 2px;
                    ">
                        CHALLENGE
                    </div>
                </div>
                
                <div style="
                    font-size: 24pt; 
                    font-weight: 600; 
                    color: #34495e; 
                    margin-bottom: 50px;
                    border-top: 2px solid #667eea;
                    border-bottom: 2px solid #667eea;
                    padding: 20px 0;
                ">
                    Game Design Document
                </div>
                
                <div style="
                    background: white; 
                    padding: 30px; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
                    margin: 30px 0;
                ">
                    <div style="font-size: 18pt; color: #667eea; font-weight: 700; margin-bottom: 10px;">
                        Version ${this.version}
                    </div>
                    <div style="font-size: 14pt; color: #7f8c8d; margin-bottom: 20px;">
                        ${this.date}
                    </div>
                    <div style="font-size: 12pt; color: #2c3e50; line-height: 1.6;">
                        Document de conception professionnel<br>
                        <strong>Jeu de puzzle innovant avec lettres tombantes</strong>
                    </div>
                </div>
                
                <div style="
                    position: absolute; 
                    bottom: 30mm; 
                    left: 50%; 
                    transform: translateX(-50%);
                    font-size: 10pt; 
                    color: #95a5a6;
                ">
                    © 2025 Letters Cascade Challenge - Tous droits réservés
                </div>
            </div>
        `;

        // Extract content from the current page - look for GDD specific content
        const mainContent = document.querySelector('.main-content') || 
                           document.querySelector('.page-layout') || 
                           document.querySelector('.unified-page-layout') ||
                           document.body;
        
        if (mainContent) {
            console.log('📄 Found main content, extracting GDD sections...');
            
            // Look for GDD-specific content sections
            const gddSections = [
                '.glass-panel',
                '.glass-card',
                '.concept-showcase',
                '.feature-card',
                '.tech-card',
                '.feature-item',
                '.info-panel',
                '.game-info',
                '.tutorial-section',
                '.visual-development-grid',
                '.table-container'
            ];
            
            let contentFound = false;
            
            // First, try to find GDD-specific sections
            gddSections.forEach(selector => {
                const elements = mainContent.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`📄 Found ${elements.length} elements with selector: ${selector}`);
                    contentFound = true;
                    elements.forEach((element, index) => {
                        // Skip the PDF download section itself
                        if (element.closest('.pdf-download-section')) {
                            console.log('📄 Skipping PDF download section');
                            return;
                        }
                        
                        const cleanElement = this.cleanPanelForPDF(element);
                        if (cleanElement) {
                            pdfContent.appendChild(cleanElement);
                        }
                    });
                }
            });
            
            // If no GDD sections found, try to extract general content
            if (!contentFound) {
                console.log('📄 No GDD sections found, extracting general content...');
                const generalContent = this.extractGeneralContent(mainContent);
                if (generalContent) {
                    pdfContent.appendChild(generalContent);
                    contentFound = true;
                }
            }
            
            // If still no content, try to extract all meaningful content
            if (!contentFound) {
                console.log('📄 Extracting all meaningful content...');
                const allContent = this.extractAllContent(mainContent);
                if (allContent) {
                    pdfContent.appendChild(allContent);
                    contentFound = true;
                }
            }
            
            if (!contentFound) {
                console.log('📄 No content found, using basic PDF content');
                return this.createBasicPDFContent();
            }
        } else {
            console.log('📄 No main content found, using basic PDF content');
            return this.createBasicPDFContent();
        }

        return pdfContent;
    }

    /**
     * Extract all meaningful content from the page
     */
    extractAllContent(container) {
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
            font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #2c3e50;
            background: white;
        `;

        // Clone the container and clean it
        const clonedContainer = container.cloneNode(true);
        
        // Remove unwanted elements
        const elementsToRemove = clonedContainer.querySelectorAll(`
            .nav-sidebar, 
            .pdf-download-section, 
            .action-buttons, 
            .resource-links,
            .unified-nav-header,
            .unified-nav-container,
            .breadcrumb,
            script,
            .no-pdf
        `);
        
        elementsToRemove.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        // Clean up the content
        this.cleanElementStyles(clonedContainer);
        this.convertIconsToText(clonedContainer);
        
        // Add page breaks for major sections
        const headings = clonedContainer.querySelectorAll('h1, h2');
        headings.forEach((heading, index) => {
            if (index > 0) {
                heading.style.pageBreakBefore = 'always';
            }
        });

        contentDiv.appendChild(clonedContainer);
        return contentDiv;
    }

    /**
     * Create a basic PDF with game information when no content is found
     */
    createBasicPDFContent() {
        const pdfContent = document.createElement('div');
        pdfContent.style.cssText = `
            font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #2c3e50;
            max-width: 190mm;
            margin: 0 auto;
            padding: 0;
            background: white;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        `;

        pdfContent.innerHTML = `
            <div class="title-page" style="
                text-align: center; 
                height: 100vh; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                page-break-after: always;
                background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
                border: 3px solid #667eea;
                margin: -10mm;
                padding: 40mm 20mm;
            ">
                <div style="margin-bottom: 30px;">
                    <div style="
                        font-size: 48pt; 
                        font-weight: 900; 
                        color: #667eea; 
                        margin-bottom: 15px;
                        text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.2);
                        letter-spacing: -1px;
                    ">
                        Letters Cascade
                    </div>
                    <div style="
                        font-size: 36pt; 
                        font-weight: 700; 
                        color: #764ba2; 
                        margin-bottom: 40px;
                        letter-spacing: 2px;
                    ">
                        CHALLENGE
                    </div>
                </div>
                
                <div style="
                    font-size: 24pt; 
                    font-weight: 600; 
                    color: #34495e; 
                    margin-bottom: 50px;
                    border-top: 2px solid #667eea;
                    border-bottom: 2px solid #667eea;
                    padding: 20px 0;
                ">
                    Game Design Document
                </div>
                
                <div style="
                    background: white; 
                    padding: 30px; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
                    margin: 30px 0;
                ">
                    <div style="font-size: 18pt; color: #667eea; font-weight: 700; margin-bottom: 10px;">
                        Version ${this.version}
                    </div>
                    <div style="font-size: 14pt; color: #7f8c8d; margin-bottom: 20px;">
                        ${this.date}
                    </div>
                    <div style="font-size: 12pt; color: #2c3e50; line-height: 1.6;">
                        Document de conception professionnel<br>
                        <strong>Jeu de puzzle innovant avec lettres tombantes</strong>
                    </div>
                </div>
                
                <div style="
                    position: absolute; 
                    bottom: 30mm; 
                    left: 50%; 
                    transform: translateX(-50%);
                    font-size: 10pt; 
                    color: #95a5a6;
                ">
                    © 2025 Letters Cascade Challenge - Tous droits réservés
                </div>
            </div>
            
            <div style="
                margin-bottom: 25px;
                padding: 20px 25px;
                border-left: 4px solid #667eea;
                border-top: 1px solid #e9ecef;
                border-right: 1px solid #e9ecef;
                border-bottom: 1px solid #e9ecef;
                border-radius: 0 8px 8px 0;
                background: #ffffff;
                page-break-inside: avoid;
                position: relative;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
            ">
                <h2 style="color: #667eea; font-size: 18pt; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                    🎮 Description du Jeu
                </h2>
                <div style="color: #2c3e50; font-size: 11pt; line-height: 1.6;">
                    <p><strong>Letters Cascade Challenge</strong> est un jeu de puzzle innovant qui combine des éléments de mots croisés avec une mécanique de lettres tombantes en 3D.</p>
                    
                    <h3 style="color: #34495e; font-size: 16pt; margin: 20px 0 10px 0;">🎯 Objectif du Jeu</h3>
                    <p>Formez des mots en plaçant stratégiquement les lettres qui tombent. Les mots de 3 lettres minimum rapportent des points !</p>
                    
                    <h3 style="color: #34495e; font-size: 16pt; margin: 20px 0 10px 0;">🎮 Contrôles</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>Flèches</strong> : Déplacer la lettre active</li>
                        <li><strong>Espace</strong> : Placer la lettre</li>
                        <li><strong>P</strong> : Pause</li>
                        <li><strong>R</strong> : Recommencer</li>
                        <li><strong>H</strong> : Masquer/Afficher l'interface</li>
                        <li><strong>F</strong> : Mode plein écran</li>
                    </ul>
                    
                    <h3 style="color: #34495e; font-size: 16pt; margin: 20px 0 10px 0;">💡 Formation des Mots</h3>
                    <p>Les mots peuvent être formés horizontalement, verticalement ou en diagonale. Plus le mot est long, plus vous gagnez de points !</p>
                    
                    <h3 style="color: #34495e; font-size: 16pt; margin: 20px 0 10px 0;">🌟 Système de Score</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Points de base par lettre</li>
                        <li>Bonus de longueur de mot</li>
                        <li>Multiplicateur de combo</li>
                        <li>Bonus de niveau</li>
                    </ul>
                    
                    <h3 style="color: #34495e; font-size: 16pt; margin: 20px 0 10px 0;">🎨 Modes de Jeu</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>Débutant</strong> : Grille simple en 2D</li>
                        <li><strong>Intermédiaire</strong> : Grille 3D modérée</li>
                        <li><strong>Expert</strong> : Grille 3D complexe</li>
                    </ul>
                </div>
            </div>
            
            <div style="
                margin-bottom: 25px;
                padding: 20px 25px;
                border-left: 4px solid #667eea;
                border-top: 1px solid #e9ecef;
                border-right: 1px solid #e9ecef;
                border-bottom: 1px solid #e9ecef;
                border-radius: 0 8px 8px 0;
                background: #ffffff;
                page-break-inside: avoid;
                position: relative;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
            ">
                <h2 style="color: #667eea; font-size: 18pt; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                    🛠️ Technologies Utilisées
                </h2>
                <div style="color: #2c3e50; font-size: 11pt; line-height: 1.6;">
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>Three.js</strong> : Rendu 3D avancé</li>
                        <li><strong>WebGL</strong> : Accélération graphique</li>
                        <li><strong>HTML5 Canvas</strong> : Interface utilisateur</li>
                        <li><strong>JavaScript ES6+</strong> : Logique de jeu</li>
                        <li><strong>CSS3</strong> : Styles et animations</li>
                        <li><strong>Webpack</strong> : Bundling et optimisation</li>
                    </ul>
                </div>
            </div>
        `;

        return pdfContent;
    }

    /**
     * Extract general content when specific sections are not found
     */
    extractGeneralContent(container) {
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
            margin-bottom: 25px;
            padding: 20px 25px;
            border-left: 4px solid #667eea;
            border-top: 1px solid #e9ecef;
            border-right: 1px solid #e9ecef;
            border-bottom: 1px solid #e9ecef;
            border-radius: 0 8px 8px 0;
            background: #ffffff;
            page-break-inside: avoid;
            position: relative;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
        `;

        // Extract text content from the container
        const textContent = container.textContent || container.innerText;
        if (textContent && textContent.trim().length > 0) {
            const title = document.querySelector('title')?.textContent || 'Letters Cascade Challenge';
            const h1 = document.querySelector('h1')?.textContent || '';
            const h2 = document.querySelector('h2')?.textContent || '';
            
            contentDiv.innerHTML = `
                <h2 style="color: #667eea; font-size: 18pt; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                    ${title}
                </h2>
                ${h1 ? `<h3 style="color: #34495e; font-size: 16pt; margin-bottom: 10px;">${h1}</h3>` : ''}
                ${h2 ? `<h4 style="color: #34495e; font-size: 14pt; margin-bottom: 10px;">${h2}</h4>` : ''}
                <div style="color: #2c3e50; font-size: 11pt; line-height: 1.6;">
                    ${textContent.substring(0, 2000)}${textContent.length > 2000 ? '...' : ''}
                </div>
            `;
            
            return contentDiv;
        }
        
        return null;
    }

    /**
     * Clean panel content for PDF
     */
    cleanPanelForPDF(panel) {
        const cleanPanel = document.createElement('div');
        cleanPanel.style.cssText = `
            margin-bottom: 25px;
            padding: 20px 25px;
            border-left: 4px solid #667eea;
            border-top: 1px solid #e9ecef;
            border-right: 1px solid #e9ecef;
            border-bottom: 1px solid #e9ecef;
            border-radius: 0 8px 8px 0;
            background: #ffffff;
            page-break-inside: avoid;
            position: relative;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
        `;

        // Copy content while cleaning styles
        const content = panel.cloneNode(true);
        
        // Remove problematic elements that cause PDF issues
        const elementsToRemove = content.querySelectorAll(`
            .resource-link, .action-btn, .pdf-download-section, 
            .nav-links, .resource-links, .ui-toggle, .controls,
            button, .control-btn, .tutorial-toggle-btn,
            #threejsCanvas, canvas, .game-area,
            .header, .header-content, .loading-screen,
            .grid-layout-selection-screen, .selection-modal
        `);
        elementsToRemove.forEach(el => el.remove());

        // Remove script tags and external resources
        const scripts = content.querySelectorAll('script, link[rel="stylesheet"]');
        scripts.forEach(el => el.remove());

        // Convert icons to text equivalents for better PDF compatibility
        this.convertIconsToText(content);

        // Clean styles
        this.cleanElementStyles(content);
        
        // Add a title if the panel has meaningful content
        const textContent = content.textContent || content.innerText;
        if (textContent && textContent.trim().length > 0) {
            // Try to find a heading or create one from the content
            const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
            if (!heading) {
                const titleDiv = document.createElement('h3');
                titleDiv.style.cssText = `
                    color: #667eea; 
                    font-size: 14pt; 
                    margin-bottom: 10px; 
                    border-bottom: 1px solid #667eea; 
                    padding-bottom: 5px;
                `;
                titleDiv.textContent = textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '');
                cleanPanel.appendChild(titleDiv);
            }
        }
        
        cleanPanel.appendChild(content);
        return cleanPanel;
    }

    /**
     * Convert Font Awesome icons to text equivalents for PDF
     */
    convertIconsToText(element) {
        const iconMap = {
            'fa-gamepad': '🎮',
            'fa-cube': '🧊',
            'fa-bullseye': '🎯',
            'fa-users': '👥',
            'fa-arrow-down': '⬇️',
            'fa-spell-check': '✓',
            'fa-trophy': '🏆',
            'fa-cogs': '⚙️',
            'fa-mobile-alt': '📱',
            'fa-layer-group': '📚',
            'fa-star': '⭐',
            'fa-home': '🏠',
            'fa-file-alt': '📄',
            'fa-book': '📖',
            'fa-palette': '🎨',
            'fa-sitemap': '🗺️',
            'fa-image': '🖼️',
            'fa-images': '🖼️',
            'fa-info-circle': 'ℹ️',
            'fa-check-circle': '✅',
            'fa-download': '⬇️',
            'fa-print': '🖨️',
            'fa-file-pdf': '📄',
            'fas': ''
        };

        // Find all icon elements
        const icons = element.querySelectorAll('i[class*="fa"]');
        icons.forEach(icon => {
            let replacement = '';
            
            // Check each class for icon mapping
            icon.classList.forEach(cls => {
                if (iconMap[cls]) {
                    replacement = iconMap[cls];
                }
            });
            
            // If no specific icon found, use a generic symbol
            if (!replacement && icon.classList.contains('fas')) {
                replacement = '•';
            }
            
            // Replace icon with text
            if (replacement) {
                const textNode = document.createTextNode(replacement + ' ');
                icon.parentNode.replaceChild(textNode, icon);
            }
        });
    }

    /**
     * Clean element styles for PDF with enhanced typography
     */
    cleanElementStyles(element) {
        // Reset styles to be PDF-friendly
        element.style.cssText = '';
        
        // Apply enhanced PDF styles based on element type
        switch (element.tagName) {
            case 'H1':
                element.style.cssText = `
                    color: #667eea; 
                    font-size: 24pt; 
                    font-weight: 800; 
                    margin: 25px 0 20px 0; 
                    text-align: center;
                    border-bottom: 3px solid #667eea; 
                    padding-bottom: 10px;
                    page-break-after: avoid;
                    letter-spacing: -0.5px;
                    font-size-adjust: none;
                `;
                break;
                
            case 'H2':
                element.style.cssText = `
                    color: #667eea; 
                    font-size: 16pt; 
                    font-weight: 700; 
                    margin: 25px 0 15px 0; 
                    border-bottom: 2px solid #667eea; 
                    padding-bottom: 8px;
                    page-break-after: avoid;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                `;
                break;
                
            case 'H3':
                element.style.cssText = `
                    color: #764ba2; 
                    font-size: 13pt; 
                    font-weight: 650; 
                    margin: 18px 0 12px 0;
                    page-break-after: avoid;
                    border-left: 3px solid #764ba2;
                    padding-left: 12px;
                `;
                break;
                
            case 'H4':
                element.style.cssText = `
                    color: #34495e; 
                    font-size: 12pt; 
                    font-weight: 600; 
                    margin: 15px 0 10px 0;
                    page-break-after: avoid;
                `;
                break;
                
            case 'P':
                element.style.cssText = `
                    margin: 8px 0 12px 0; 
                    line-height: 1.7;
                    color: #2c3e50;
                    text-align: justify;
                    orphans: 2;
                    widows: 2;
                `;
                break;
                
            case 'UL':
                element.style.cssText = `
                    margin: 12px 0 12px 15px; 
                    padding-left: 15px;
                    list-style-type: disc;
                `;
                break;
                
            case 'OL':
                element.style.cssText = `
                    margin: 12px 0 12px 15px; 
                    padding-left: 15px;
                    list-style-type: decimal;
                `;
                break;
                
            case 'LI':
                element.style.cssText = `
                    margin: 6px 0; 
                    line-height: 1.6;
                    color: #2c3e50;
                    page-break-inside: avoid;
                `;
                break;
                
            case 'TABLE':
                element.style.cssText = `
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                    page-break-inside: avoid;
                    font-size: 10pt;
                    background: white;
                    border: 2px solid #667eea;
                `;
                break;
                
            case 'THEAD':
                element.style.cssText = `
                    background: #667eea;
                    color: white;
                `;
                break;
                
            case 'TH':
                element.style.cssText = `
                    background: #667eea; 
                    color: white; 
                    padding: 12px 10px; 
                    border: 1px solid #5a6fd8; 
                    text-align: left;
                    font-weight: 700;
                    font-size: 10pt;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                `;
                break;
                
            case 'TD':
                element.style.cssText = `
                    padding: 10px; 
                    border: 1px solid #dee2e6; 
                    color: #2c3e50;
                    vertical-align: top;
                    line-height: 1.5;
                `;
                break;
                
            case 'TBODY':
                element.style.cssText = `
                    background: #ffffff;
                `;
                // Add zebra striping to table rows
                const rows = element.querySelectorAll('tr');
                rows.forEach((row, index) => {
                    if (index % 2 === 1) {
                        row.style.background = '#f8f9fa';
                    }
                });
                break;
                
            case 'STRONG':
            case 'B':
                element.style.cssText = `
                    font-weight: 700; 
                    color: #2c3e50;
                `;
                break;
                
            case 'EM':
            case 'I':
                element.style.cssText = `
                    font-style: italic; 
                    color: #34495e;
                `;
                break;
                
            case 'BLOCKQUOTE':
                element.style.cssText = `
                    margin: 15px 0; 
                    padding: 15px 20px; 
                    border-left: 4px solid #764ba2; 
                    background: #f8f9fa;
                    font-style: italic;
                    color: #495057;
                `;
                break;
                
            case 'CODE':
                element.style.cssText = `
                    background: #f1f3f4; 
                    padding: 2px 6px; 
                    border-radius: 3px; 
                    font-family: 'Courier New', monospace;
                    font-size: 9pt;
                    color: #e91e63;
                `;
                break;
                
            case 'PRE':
                element.style.cssText = `
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 5px; 
                    font-family: 'Courier New', monospace;
                    font-size: 9pt;
                    overflow-x: auto;
                    border: 1px solid #dee2e6;
                    page-break-inside: avoid;
                `;
                break;
        }

        // Recursively clean child elements
        Array.from(element.children).forEach(child => {
            this.cleanElementStyles(child);
        });
    }

    /**
     * Fallback to browser print dialog
     */
    fallbackPrint() {
        console.log('📄 Using fallback print method...');
        
        // Create printable version
        const printWindow = window.open('', '_blank');
        const printContent = this.preparePrintContent();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.title}</title>
                <style>
                    /* Enhanced Print Styles */
                    @page {
                        margin: 20mm 15mm;
                        size: A4;
                        @top-center {
                            content: "Letters Cascade Challenge - Game Design Document";
                            font-size: 9pt;
                            color: #667eea;
                        }
                        @bottom-right {
                            content: "Page " counter(page);
                            font-size: 9pt;
                            color: #7f8c8d;
                        }
                    }
                    
                    body { 
                        font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
                        line-height: 1.7; 
                        margin: 0; 
                        color: #2c3e50;
                        font-size: 11pt;
                        -webkit-font-smoothing: antialiased;
                        font-size-adjust: none;
                    }
                    
                    h1 { 
                        color: #667eea; 
                        text-align: center; 
                        font-size: 20pt; 
                        font-weight: 800;
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 10px;
                        margin: 25px 0 20px 0;
                        page-break-after: avoid;
                    }
                    
                    h2 { 
                        color: #667eea; 
                        border-bottom: 2px solid #667eea; 
                        padding-bottom: 8px; 
                        font-size: 16pt;
                        font-weight: 700;
                        margin: 25px 0 15px 0;
                        page-break-after: avoid;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    h3 { 
                        color: #764ba2; 
                        font-size: 13pt;
                        font-weight: 650;
                        margin: 18px 0 12px 0;
                        border-left: 3px solid #764ba2;
                        padding-left: 12px;
                        page-break-after: avoid;
                    }
                    
                    p {
                        margin: 8px 0 12px 0;
                        text-align: justify;
                        orphans: 2;
                        widows: 2;
                    }
                    
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0;
                        page-break-inside: avoid;
                        border: 2px solid #667eea;
                        font-size: 10pt;
                    }
                    
                    th { 
                        background: #667eea; 
                        color: white; 
                        padding: 12px 10px;
                        border: 1px solid #5a6fd8;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    td { 
                        padding: 10px; 
                        border: 1px solid #dee2e6;
                        vertical-align: top;
                        line-height: 1.5;
                    }
                    
                    tbody tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    
                    ul, ol {
                        margin: 12px 0 12px 15px;
                        padding-left: 15px;
                    }
                    
                    li {
                        margin: 6px 0;
                        line-height: 1.6;
                        page-break-inside: avoid;
                    }
                    
                    strong {
                        font-weight: 700;
                        color: #2c3e50;
                    }
                    
                    .no-print { display: none; }
                    
                    .page-break-before { page-break-before: always; }
                    .page-break-after { page-break-after: always; }
                    .page-break-avoid { page-break-inside: avoid; }
                    
                    @media print {
                        .no-print { display: none !important; }
                        body { margin: 0; }
                        a { color: #2c3e50; text-decoration: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    /**
     * Prepare content for printing
     */
    preparePrintContent() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return '<p>Contenu non trouvé</p>';

        let content = `
            <h1>🎮 Letters Cascade Challenge</h1>
            <h2>Game Design Document</h2>
            <p><strong>Version ${this.version} | ${this.date}</strong></p>
            <hr>
        `;

        const glassPanels = mainContent.querySelectorAll('.glass-card');
        glassPanels.forEach(panel => {
            const textContent = panel.textContent || panel.innerText;
            const cleanContent = textContent
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/📚|🎮|📋|🌟|⚡|🔧|🎯|📈|📊|🎨|👥|📅|🏗️|💼|🔄|🌐|📱|🖥️|⌨️|🎪|🎭|🎨|🎪/g, '');
            
            if (cleanContent.length > 50) {
                content += `<div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd;">${cleanContent}</div>`;
            }
        });

        return content;
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        this.showNotification('✅ PDF généré avec succès !', 'success');
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.showNotification(`❌ Erreur lors de la génération du PDF: ${message}`, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Initialize PDF generation button
     */
    initializePDFButton() {
        const pdfButton = document.querySelector('.pdf-download-btn');
        if (pdfButton) {
            pdfButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Show loading state
                const originalText = pdfButton.innerHTML;
                pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération en cours...';
                pdfButton.disabled = true;
                
                // Generate PDF with local file handling
                this.generatePDFWithLocalHandling().finally(() => {
                    // Reset button state
                    setTimeout(() => {
                        pdfButton.innerHTML = originalText;
                        pdfButton.disabled = false;
                    }, 2000);
                });
            });
            console.log('🔧 PDF download button initialized');
        }
    }

    /**
     * Generate PDF with local file handling
     */
    async generatePDFWithLocalHandling() {
        try {
            // Check if we're running from a local file
            const isLocalFile = window.location.protocol === 'file:';
            
            if (isLocalFile) {
                console.log('📁 Detected local file access, using fallback method');
                this.showNotification('📁 Mode local détecté - Utilisation de l\'impression navigateur', 'info');
                this.fallbackPrint();
                return;
            }
            
            // Check if html2pdf is available
            if (typeof html2pdf === 'undefined') {
                console.log('📄 html2pdf not available, using fallback');
                this.showNotification('📄 Bibliothèque PDF non disponible - Utilisation de l\'impression', 'info');
                this.fallbackPrint();
                return;
            }
            
            // Normal PDF generation for web server
            await this.generatePDF();
            
        } catch (error) {
            console.error('❌ Error in PDF generation with local handling:', error);
            this.showNotification('❌ Erreur de génération PDF - Utilisation de l\'impression', 'error');
            this.fallbackPrint();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initializing GDD PDF Generator...');
    
    const pdfGenerator = new GDDPDFGenerator();
    pdfGenerator.initializePDFButton();
    
    // Make generator globally available
    window.gddPDFGenerator = pdfGenerator;
    
    console.log('✅ GDD PDF Generator ready');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GDDPDFGenerator };
}