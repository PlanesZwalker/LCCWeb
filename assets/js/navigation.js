// Unified Navigation System
class UnifiedNavigation {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showBreadcrumbOnMobile: true,
            showDropdownOnMobile: true,
            ...options
        };
        
        this.pageHierarchy = {
            'index.html': { title: 'Accueil', icon: 'fa-home', parent: null },
            'unified-3d-game.html': { title: 'Babylon 3D', icon: 'fa-cube', parent: 'index.html' },
            'threejs-3d-game.html': { title: 'Three.js 3D', icon: 'fa-cube', parent: 'index.html' },
            'classic-2d-game-enhanced.html': { title: '2D Classique (Enhanced)', icon: 'fa-square', parent: 'index.html' },
            'docs/index.html': { title: 'Documentation', icon: 'fa-file-alt', parent: 'index.html' },
            'rules.html': { title: 'Règles', icon: 'fa-book', parent: 'index.html' },
            'moodboard.html': { title: 'Moodboard', icon: 'fa-palette', parent: 'index.html' },
            'technical-spec.html': { title: 'Spécifications', icon: 'fa-code', parent: 'index.html' },
            'sitemap.html': { title: 'Plan du Site', icon: 'fa-sitemap', parent: 'index.html' }
        };
        
        this.navigationItems = [
            { href: 'index.html', title: 'Accueil', icon: 'fa-home' },
            { href: 'unified-3d-game.html', title: 'Babylon 3D', icon: 'fa-cube' },
            { href: 'threejs-3d-game.html', title: 'Three.js 3D', icon: 'fa-cube' },
            { href: 'classic-2d-game-enhanced.html', title: '2D Enhanced', icon: 'fa-square' },
            { href: 'docs/index.html', title: 'Documentation', icon: 'fa-file-alt' },
            { href: 'rules.html', title: 'Règles', icon: 'fa-book' },
            { href: 'moodboard.html', title: 'Moodboard', icon: 'fa-palette' },
            { href: 'technical-spec.html', title: 'Spécifications', icon: 'fa-code' },
            { href: 'sitemap.html', title: 'Plan du Site', icon: 'fa-sitemap' }
        ];
        
        this.init();
    }
    
    init() {
        this.createNavigationHTML();
        this.setupEventListeners();
        this.updateActiveState();
        this.setupResponsiveBehavior();
    }
    
    createNavigationHTML() {
        this.container.innerHTML = `
            <!-- Desktop Navigation -->
            <nav class="nav-bar" aria-label="Main navigation">
                <div class="nav-links">
                    ${this.navigationItems.map(item => `
                        <a href="${item.href}" class="nav-link" data-page="${item.href}">
                            <i class="fas ${item.icon}"></i>
                            <span>${item.title}</span>
                        </a>
                    `).join('')}
                </div>
            </nav>
            
            <!-- Mobile Navigation -->
            <nav class="mobile-nav" aria-label="Mobile navigation">
                <div class="mobile-nav-content">
                    <div class="mobile-nav-breadcrumb">
                        <!-- Breadcrumb will be dynamically generated -->
                    </div>
                    <div class="mobile-nav-menu">
                        <button class="mobile-nav-toggle" aria-label="Toggle navigation menu">
                            <i class="fas fa-bars"></i>
                        </button>
                        <div class="mobile-nav-dropdown">
                            ${this.navigationItems.map(item => `
                                <a href="${item.href}" class="mobile-nav-dropdown-item" data-page="${item.href}">
                                    <i class="fas ${item.icon}"></i>
                                    <span>${item.title}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </nav>
        `;
        
        this.desktopNav = this.container.querySelector('.nav-bar');
        this.mobileNav = this.container.querySelector('.mobile-nav');
        this.mobileBreadcrumb = this.container.querySelector('.mobile-nav-breadcrumb');
        this.mobileDropdown = this.container.querySelector('.mobile-nav-dropdown');
        this.mobileToggle = this.container.querySelector('.mobile-nav-toggle');
    }
    
    updateBreadcrumb() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentPageInfo = this.pageHierarchy[currentPage] || { 
            title: 'Page', 
            icon: 'fa-file', 
            parent: null 
        };
        
        // Clear existing breadcrumb
        this.mobileBreadcrumb.innerHTML = '';
        
        // Add home link
        this.mobileBreadcrumb.appendChild(this.createBreadcrumbItem('index.html', 'Accueil', 'fa-home', false));
        
        // Add separator if not home page
        if (currentPage !== 'index.html') {
            this.mobileBreadcrumb.appendChild(this.createBreadcrumbSeparator());
            
            // Add parent page if exists
            if (currentPageInfo.parent && this.pageHierarchy[currentPageInfo.parent]) {
                const parentInfo = this.pageHierarchy[currentPageInfo.parent];
                this.mobileBreadcrumb.appendChild(
                    this.createBreadcrumbItem(currentPageInfo.parent, parentInfo.title, parentInfo.icon, false)
                );
                this.mobileBreadcrumb.appendChild(this.createBreadcrumbSeparator());
            }
            
            // Add current page
            this.mobileBreadcrumb.appendChild(
                this.createBreadcrumbItem(currentPage, currentPageInfo.title, currentPageInfo.icon, true)
            );
        }
    }
    
    createBreadcrumbItem(href, title, icon, isCurrent) {
        const div = document.createElement('div');
        div.className = `mobile-nav-item ${isCurrent ? 'mobile-nav-current' : 'mobile-nav-link'}`;
        
        if (!isCurrent) {
            div.setAttribute('href', href);
        }
        
        div.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${title}</span>
        `;
        
        if (!isCurrent) {
            div.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = href;
            });
        }
        
        return div;
    }
    
    createBreadcrumbSeparator() {
        const div = document.createElement('div');
        div.className = 'mobile-nav-separator';
        div.innerHTML = '<i class="fas fa-chevron-right"></i>';
        return div;
    }
    
    setupEventListeners() {
        // Mobile dropdown toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                this.toggleMobileDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.mobileNav.contains(e.target)) {
                this.closeMobileDropdown();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupResponsiveBehavior();
        });
        
        // Handle navigation link clicks
        const navLinks = this.container.querySelectorAll('.nav-link, .mobile-nav-dropdown-item');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== window.location.pathname.split('/').pop()) {
                    // Add loading state
                    link.style.pointerEvents = 'none';
                    link.innerHTML += ' <i class="fas fa-spinner fa-spin"></i>';
                    
                    // Navigate after a short delay to show loading state
                    setTimeout(() => {
                        window.location.href = href;
                    }, 100);
                }
            });
        });
    }
    
    toggleMobileDropdown() {
        if (this.mobileDropdown) {
            this.mobileDropdown.classList.toggle('show');
            
            // Update toggle button icon
            const toggleIcon = this.mobileToggle.querySelector('i');
            if (this.mobileDropdown.classList.contains('show')) {
                toggleIcon.className = 'fas fa-times';
                this.mobileToggle.setAttribute('aria-label', 'Close navigation menu');
            } else {
                toggleIcon.className = 'fas fa-bars';
                this.mobileToggle.setAttribute('aria-label', 'Open navigation menu');
            }
        }
    }
    
    closeMobileDropdown() {
        if (this.mobileDropdown) {
            this.mobileDropdown.classList.remove('show');
            const toggleIcon = this.mobileToggle.querySelector('i');
            toggleIcon.className = 'fas fa-bars';
            this.mobileToggle.setAttribute('aria-label', 'Open navigation menu');
        }
    }
    
    updateActiveState() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Update desktop navigation
        const desktopLinks = this.container.querySelectorAll('.nav-link');
        desktopLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update mobile dropdown
        const mobileLinks = this.container.querySelectorAll('.mobile-nav-dropdown-item');
        mobileLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update breadcrumb
        this.updateBreadcrumb();
    }
    
    setupResponsiveBehavior() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile: show mobile nav, hide desktop nav
            if (this.mobileNav) this.mobileNav.style.display = 'block';
            if (this.desktopNav) this.desktopNav.style.display = 'none';
        } else {
            // Desktop: show desktop nav, hide mobile nav
            if (this.desktopNav) this.desktopNav.style.display = 'block';
            if (this.mobileNav) this.mobileNav.style.display = 'none';
            
            // Close mobile dropdown on desktop
            this.closeMobileDropdown();
        }
    }
    
    // Method to add custom page to hierarchy
    addPage(pageName, pageInfo) {
        this.pageHierarchy[pageName] = pageInfo;
        this.updateBreadcrumb();
    }
    
    // Method to add custom navigation item
    addNavigationItem(item) {
        this.navigationItems.push(item);
        this.createNavigationHTML();
        this.setupEventListeners();
        this.updateActiveState();
    }
    
    // Method to refresh navigation
    refresh() {
        this.updateActiveState();
        this.setupResponsiveBehavior();
    }
}

// Auto-initialize navigation if container exists
document.addEventListener('DOMContentLoaded', function() {
    const navContainer = document.querySelector('.navigation-container');
    if (navContainer) {
        window.unifiedNavigation = new UnifiedNavigation(navContainer);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedNavigation;
} 