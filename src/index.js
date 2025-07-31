/**
 * Letters Cascade Challenge - Main Entry Point
 * Refactored version with modular architecture
 */

import { EventManager } from './core/EventManager.js';

/**
 * Main Website Application
 */
class LettersCascadeChallenge {
  constructor() {
    this.eventManager = new EventManager();
    this.isInitialized = false;

    console.log('🎮 Letters Cascade Challenge - Website Version');
  }

  /**
   * Initialize the website application
   */
  init() {
    try {
      console.log('🚀 Initializing Letters Cascade Challenge...');

      // Initialize UI components for the website
      this.initializeUI();

      // Set up event listeners for the website
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ Letters Cascade Challenge initialized successfully');

      // Emit ready event
      this.eventManager.emit('app:ready');
    } catch (error) {
      console.error('❌ Failed to initialize Letters Cascade Challenge:', error);
      this.eventManager.emit('app:error', { error });
      throw error;
    }
  }

  /**
   * Initialize UI components for the website
   */
  initializeUI() {
    console.log('🎨 Initializing UI components...');

    // Initialize website-specific UI components
    // (No game engine needed for the main website)

    console.log('✅ UI components initialized');
  }

  /**
   * Set up event listeners for the website
   */
  setupEventListeners() {
    console.log('🎧 Setting up event listeners...');

    // Listen for app ready event
    this.eventManager.on('app:ready', () => {
      console.log('🎉 App is ready!');
      this.showMainMenu();
    });

    // Listen for app error event
    this.eventManager.on('app:error', (data) => {
      console.error('❌ App error:', data.error);
      this.showErrorScreen(data.error);
    });

    console.log('✅ Event listeners set up');
  }

  /**
   * Show the main menu/website
   */
  showMainMenu() {
    console.log('📋 Showing main menu');
    // The main website content is already displayed
  }

  /**
   * Show error screen
   */
  showErrorScreen(error) {
    console.error('❌ Error screen:', error);
    // Handle website errors
  }

  /**
   * Get application state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      mode: 'website',
    };
  }

  /**
   * Clean up resources
   */
  dispose() {
    console.log('🧹 Disposing Letters Cascade Challenge...');

    if (this.eventManager) {
      this.eventManager.removeAllListeners();
    }

    this.isInitialized = false;
    console.log('✅ Letters Cascade Challenge disposed');
  }
}

// Create global instance
window.gameApp = new LettersCascadeChallenge();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async() => {
  try {
    await window.gameApp.init();
    console.log('🎮 Letters Cascade Challenge is ready!');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
  }
});

// Export for module usage
export { LettersCascadeChallenge };
