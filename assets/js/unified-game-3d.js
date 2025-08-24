// Unified 3D Game Manager - Always Three.js with Grid Layout Modes
// Mode 2D : Grille plane (layout 2D) dans environnement 3D
// Mode 3D : Grille volumétrique (layout 3D) dans environnement 3D

class Unified3DGameManager {
    constructor() {
        console.log('🎮 Initializing Unified 3D Game Manager...');
        
        // Always use 3D rendering
        this.game3D = null;
        this.isInitialized = false;
        
        // Grid layout mode (not rendering mode!)
        this.gridLayoutMode = '2D'; // '2D' = flat grid, '3D' = volumetric grid
        
        this.stats = {
            score: 0,
            level: 1,
            combo: 0,
            wordsFound: 0
        };
        
        this.targetWords = ['CHAT', 'MAISON', 'JARDIN', 'PORTE', 'MUSIQUE'];
        this.completedWords = new Set();
    }
    
    async initializeGame() {
        console.log('🎮 Initializing 3D game with grid layout selection...');
        
        try {
            // Always initialize the enhanced 3D game
            this.game3D = new Enhanced3DGame();
            
            await this.game3D.init();
            
            // Set up for grid layout modes after initialization
            this.game3D.enableGridLayoutModes();
            
            this.isInitialized = true;
            this.updateDisplay();
            this.generateLetterQueue();
            
            // Initialize 3D UI after game is ready
            this.initialize3DUI();
            
            console.log('✅ Unified 3D game initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize 3D game:', error);
            alert('Erreur lors de l\'initialisation du jeu 3D. Veuillez réessayer.');
        }
    }
    
    initialize3DUI() {
        if (!this.game3D || !this.game3D.create3DUIContainer) return;
        
        // Create 3D UI container
        this.game3D.create3DUIContainer();
        
        // Initial update of 3D UI
        this.update3DUI();
        
        console.log('🎨 3D UI initialized');
    }
    
    switchGridLayoutMode(mode) {
        if (!this.isInitialized || !this.game3D) {
            console.warn('⚠️ Game not initialized, cannot switch grid layout');
            return;
        }
        
        console.log(`🔄 Switching grid layout from ${this.gridLayoutMode} to ${mode}...`);
        
        if (mode === this.gridLayoutMode) {
            console.log('Already in this grid layout mode');
            return;
        }
        
        this.gridLayoutMode = mode;
        
        // Clear existing 3D UI before switching
        if (this.game3D.clear3DUI) {
            this.game3D.clear3DUI();
        }
        
        // Update the 3D game's grid layout
        this.game3D.switchGridLayout(mode);
        
        // Reinitialize 3D UI for new layout
        this.initialize3DUI();
        
        // Update UI
        this.updateGridLayoutSwitcher();
        this.updateDisplay();
        
        console.log(`✅ Switched to ${mode} grid layout`);
    }
    
    updateGridLayoutSwitcher() {
        // Update grid layout switcher buttons
        document.querySelectorAll('.grid-layout-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.grid-layout-btn[data-mode="${this.gridLayoutMode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update mode display text
        const modeDisplay = document.getElementById('currentGridMode');
        if (modeDisplay) {
            const modeText = this.gridLayoutMode === '2D' ? 
                'Grille Plane (2D Layout)' : 
                'Grille Volumétrique (3D Layout)';
            modeDisplay.textContent = modeText;
        }
    }
    
    startGame() {
        if (!this.isInitialized || !this.game3D) return;
        
        console.log(`🎮 Starting game in ${this.gridLayoutMode} grid layout mode`);
        this.game3D.startGame();
    }
    
    pauseGame() {
        if (this.game3D) {
            this.game3D.pauseGame();
        }
    }
    
    resetGame() {
        if (!this.isInitialized || !this.game3D) return;
        
        this.game3D.resetGame();
        
        // Reset unified stats
        this.stats = {
            score: 0,
            level: 1,
            combo: 0,
            wordsFound: 0
        };
        
        this.updateDisplay();
    }
    
    syncStatsFromGame() {
        if (this.game3D) {
            this.stats.score = this.game3D.score || 0;
            this.stats.level = this.game3D.level || 1;
            this.stats.wordsFound = this.game3D.wordsFound ? this.game3D.wordsFound.length : 0;
            this.stats.combo = this.game3D.combo || 0;
        }
    }
    
    updateDisplay() {
        // Sync stats from the 3D game
        this.syncStatsFromGame();
        
        // Update stats display
        const scoreEl = document.getElementById('score');
        const levelEl = document.getElementById('level');
        const comboEl = document.getElementById('combo');
        const wordsFoundEl = document.getElementById('wordsFound');
        
        if (scoreEl) scoreEl.textContent = this.stats.score;
        if (levelEl) levelEl.textContent = this.stats.level;
        if (comboEl) comboEl.textContent = this.stats.combo;
        if (wordsFoundEl) wordsFoundEl.textContent = this.stats.wordsFound;
        
        // Update target words
        this.updateTargetWords();
        
        // Update 3D UI elements in the game view
        this.update3DUI();
        
        // Update grid layout mode display
        this.updateGridLayoutSwitcher();
    }
    
    update3DUI() {
        if (!this.game3D || !this.game3D.update3DUI) return;
        
        // Get current letter queue from DOM
        const letterQueueContainer = document.getElementById('letterQueue');
        const letterQueue = [];
        if (letterQueueContainer) {
            const letterTiles = letterQueueContainer.querySelectorAll('.letter-tile');
            letterTiles.forEach(tile => {
                letterQueue.push(tile.textContent);
            });
        }
        
        // If no letters in DOM, generate some for demonstration
        if (letterQueue.length === 0) {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let i = 0; i < 8; i++) {
                letterQueue.push(letters[Math.floor(Math.random() * letters.length)]);
            }
        }
        
        // Get current target words
        const targetWords = this.targetWords.filter(word => !this.completedWords.has(word));
        
        // Update immersive 3D UI in the game with stats
        this.game3D.update3DUI(letterQueue, targetWords, this.stats);
        
        console.log('🎨 Updated immersive 3D UI with all gameplay information');
    }
    
    updateTargetWords() {
        const targetWordsContainer = document.getElementById('targetWords');
        if (!targetWordsContainer) return;
        
        targetWordsContainer.innerHTML = '';
        
        this.targetWords.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = `word-item ${this.completedWords.has(word) ? 'completed' : ''}`;
            
            const icon = document.createElement('i');
            icon.className = this.completedWords.has(word) ? 'fas fa-check-circle' : 'fas fa-circle';
            
            const span = document.createElement('span');
            span.textContent = word;
            
            wordItem.appendChild(icon);
            wordItem.appendChild(span);
            targetWordsContainer.appendChild(wordItem);
        });
    }
    
    generateLetterQueue() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const queueContainer = document.getElementById('letterQueue');
        if (!queueContainer) return;
        
        queueContainer.innerHTML = '';
        
        // Generate 8 random letters
        for (let i = 0; i < 8; i++) {
            const letter = letters[Math.floor(Math.random() * letters.length)];
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter;
            queueContainer.appendChild(tile);
        }
        
        // Update 3D UI with new letter queue
        this.update3DUI();
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    // Event handlers for grid layout switching
    onGridLayoutSwitch(mode) {
        this.switchGridLayoutMode(mode);
    }
    
    // Handle 3D UI interactions
    handle3DUIInteraction(action) {
        console.log(`🎮 3D UI interaction: ${action}`);
        
        switch(action) {
            case 'start':
                this.startGame();
                break;
            case 'pause':
                this.pauseGame();
                break;
            case 'reset':
                this.resetGame();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'front':
            case 'isometric':
            case 'top':
            case 'side':
                if (this.game3D && this.game3D.setCameraMode) {
                    this.game3D.setCameraMode(action);
                }
                break;
            default:
                console.log(`Unknown 3D UI action: ${action}`);
        }
    }
}

// Global functions for button clicks
function switchGridLayout(mode) {
    if (window.unifiedGameManager) {
        window.unifiedGameManager.switchGridLayoutMode(mode);
    }
}

function startGame() {
    if (window.unifiedGameManager) {
        window.unifiedGameManager.startGame();
    }
}

function pauseGame() {
    if (window.unifiedGameManager) {
        window.unifiedGameManager.pauseGame();
    }
}

function resetGame() {
    if (window.unifiedGameManager) {
        window.unifiedGameManager.resetGame();
    }
}

function toggleFullscreen() {
    if (window.unifiedGameManager) {
        window.unifiedGameManager.toggleFullscreen();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Loading Unified 3D Game...');
    
    // Initialize unified 3D game manager
    window.unifiedGameManager = new Unified3DGameManager();
    
    // Show grid layout selection screen
    const gridSelectionScreen = document.getElementById('gridLayoutSelectionScreen');
    if (gridSelectionScreen) {
        gridSelectionScreen.classList.remove('hidden');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Unified3DGameManager };
}