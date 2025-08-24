// Breadcrumb Navigation Component
class BreadcrumbNavigation {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showOnMobile: true,
            showOnDesktop: false,
            ...options
        };
        
        this.pageHierarchy = {
            'index.html': { title: 'Accueil', icon: 'fa-home', parent: null },
            'game.html': { title: 'Jeu', icon: 'fa-gamepad', parent: 'index.html' },
            'game-manager.html': { title: 'Game Manager', icon: 'fa-cogs', parent: 'index.html' },
            'GDD.html': { title: 'Documentation', icon: 'fa-file-alt', parent: 'index.html' },
            'rules.html': { title: 'Règles', icon: 'fa-book', parent: 'index.html' },
            'moodboard.html': { title: 'Moodboard', icon: 'fa-palette', parent: 'index.html' },
            'unified-3d-game.html': { title: 'Maquette 3D', icon: 'fa-cube', parent: 'game.html' },
            'classic-2d-game.html': { title: 'Jeu 2D', icon: 'fa-gamepad', parent: 'game.html' },
            'threejs-3d-game.html': { title: 'Three.js 3D', icon: 'fa-cube', parent: 'game.html' }
        };
        
        this.init();
    }
    
    init() {
        this.createBreadcrumbHTML();
        this.updateBreadcrumb();
        this.setupResponsiveBehavior();
    }
    
    createBreadcrumbHTML() {
        this.container.innerHTML = `
            <nav class="breadcrumb" aria-label="Breadcrumb navigation">
                <ol class="breadcrumb-list">
                    <!-- Breadcrumb items will be dynamically generated -->
                </ol>
            </nav>
        `;
        
        this.breadcrumbList = this.container.querySelector('.breadcrumb-list');
    }
    
    updateBreadcrumb() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentPageInfo = this.pageHierarchy[currentPage] || { 
            title: 'Page', 
            icon: 'fa-file', 
            parent: null 
        };
        
        // Clear existing breadcrumb
        this.breadcrumbList.innerHTML = '';
        
        // Add home link
        this.breadcrumbList.appendChild(this.createBreadcrumbItem('index.html', 'Accueil', 'fa-home', false));
        
        // Add separator if not home page
        if (currentPage !== 'index.html') {
            this.breadcrumbList.appendChild(this.createBreadcrumbSeparator());
            
            // Add parent page if exists
            if (currentPageInfo.parent && this.pageHierarchy[currentPageInfo.parent]) {
                const parentInfo = this.pageHierarchy[currentPageInfo.parent];
                this.breadcrumbList.appendChild(
                    this.createBreadcrumbItem(currentPageInfo.parent, parentInfo.title, parentInfo.icon, false)
                );
                this.breadcrumbList.appendChild(this.createBreadcrumbSeparator());
            }
            
            // Add current page
            this.breadcrumbList.appendChild(
                this.createBreadcrumbItem(currentPage, currentPageInfo.title, currentPageInfo.icon, true)
            );
        }
    }
    
    createBreadcrumbItem(href, title, icon, isCurrent) {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        
        if (isCurrent) {
            li.innerHTML = `
                <span class="breadcrumb-current">
                    <i class="fas ${icon}"></i>
                    <span>${title}</span>
                </span>
            `;
        } else {
            li.innerHTML = `
                <a href="${href}" class="breadcrumb-link">
                    <i class="fas ${icon}"></i>
                    <span>${title}</span>
                </a>
            `;
        }
        
        return li;
    }
    
    createBreadcrumbSeparator() {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        li.innerHTML = `
            <span class="breadcrumb-separator">
                <i class="fas fa-chevron-right"></i>
            </span>
        `;
        return li;
    }
    
    setupResponsiveBehavior() {
        const breadcrumb = this.container.querySelector('.breadcrumb');
        const navBar = document.querySelector('.nav-bar');
        
        if (!breadcrumb || !navBar) return;
        
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleResize = (e) => {
            if (e.matches) {
                // Mobile: show breadcrumb, hide nav
                breadcrumb.style.display = 'block';
                navBar.style.display = 'none';
            } else {
                // Desktop: hide breadcrumb, show nav
                breadcrumb.style.display = 'none';
                navBar.style.display = 'block';
            }
        };
        
        // Initial check
        handleResize(mediaQuery);
        
        // Listen for changes
        mediaQuery.addListener(handleResize);
    }
    
    // Method to add custom page to hierarchy
    addPage(pageName, pageInfo) {
        this.pageHierarchy[pageName] = pageInfo;
    }
    
    // Method to refresh breadcrumb
    refresh() {
        this.updateBreadcrumb();
    }
}

// Auto-initialize breadcrumb if container exists
document.addEventListener('DOMContentLoaded', function() {
    const breadcrumbContainer = document.querySelector('.breadcrumb-container');
    if (breadcrumbContainer) {
        window.breadcrumbNav = new BreadcrumbNavigation(breadcrumbContainer);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BreadcrumbNavigation;
} 