/**
 * Core interfaces for the Letters Cascade Challenge game
 * Defines the contract for all major game components
 */

/**
 * Game Engine Interface
 * Defines the contract for the main game engine
 */
export class IGameEngine {
  constructor() {
    if (this.constructor === IGameEngine) {
      throw new Error('IGameEngine is an abstract class');
    }
  }

  /**
   * Initialize the game engine
   */
  init() {
    throw new Error('init() must be implemented');
  }

  /**
   * Start the game
   */
  startGame() {
    throw new Error('startGame() must be implemented');
  }

  /**
   * Pause the game
   */
  pauseGame() {
    throw new Error('pauseGame() must be implemented');
  }

  /**
   * Reset the game
   */
  resetGame() {
    throw new Error('resetGame() must be implemented');
  }

  /**
   * Update game state
   */
  update(deltaTime) {
    throw new Error('update() must be implemented');
  }

  /**
   * Get current game state
   */
  getState() {
    throw new Error('getState() must be implemented');
  }
}

/**
 * Renderer Interface
 * Defines the contract for rendering systems
 */
export class IRenderer {
  constructor() {
    if (this.constructor === IRenderer) {
      throw new Error('IRenderer is an abstract class');
    }
  }

  /**
   * Initialize the renderer
   */
  init() {
    throw new Error('init() must be implemented');
  }

  /**
   * Render the current game state
   */
  render(gameState) {
    throw new Error('render() must be implemented');
  }

  /**
   * Resize the renderer
   */
  resize(width, height) {
    throw new Error('resize() must be implemented');
  }

  /**
   * Clean up resources
   */
  dispose() {
    throw new Error('dispose() must be implemented');
  }
}

/**
 * UI Component Interface
 * Defines the contract for UI components
 */
export class IUIComponent {
  constructor() {
    if (this.constructor === IUIComponent) {
      throw new Error('IUIComponent is an abstract class');
    }
  }

  /**
   * Initialize the component
   */
  init() {
    throw new Error('init() must be implemented');
  }

  /**
   * Update the component
   */
  update(data) {
    throw new Error('update() must be implemented');
  }

  /**
   * Render the component
   */
  render() {
    throw new Error('render() must be implemented');
  }

  /**
   * Clean up the component
   */
  dispose() {
    throw new Error('dispose() must be implemented');
  }
}

/**
 * State Manager Interface
 * Defines the contract for state management
 */
export class IStateManager {
  constructor() {
    if (this.constructor === IStateManager) {
      throw new Error('IStateManager is an abstract class');
    }
  }

  /**
   * Get current state
   */
  getState() {
    throw new Error('getState() must be implemented');
  }

  /**
   * Update state
   */
  setState(newState) {
    throw new Error('setState() must be implemented');
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    throw new Error('subscribe() must be implemented');
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(callback) {
    throw new Error('unsubscribe() must be implemented');
  }
}

/**
 * Event Manager Interface
 * Defines the contract for event management
 */
export class IEventManager {
  constructor() {
    if (this.constructor === IEventManager) {
      throw new Error('IEventManager is an abstract class');
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    throw new Error('on() must be implemented');
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    throw new Error('off() must be implemented');
  }

  /**
   * Emit event
   */
  emit(event, data) {
    throw new Error('emit() must be implemented');
  }
}

/**
 * Audio Manager Interface
 * Defines the contract for audio management
 */
export class IAudioManager {
  constructor() {
    if (this.constructor === IAudioManager) {
      throw new Error('IAudioManager is an abstract class');
    }
  }

  /**
   * Initialize audio system
   */
  init() {
    throw new Error('init() must be implemented');
  }

  /**
   * Play sound
   */
  play(soundName) {
    throw new Error('play() must be implemented');
  }

  /**
   * Stop sound
   */
  stop(soundName) {
    throw new Error('stop() must be implemented');
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    throw new Error('setVolume() must be implemented');
  }
}
