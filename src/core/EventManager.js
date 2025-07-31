/**
 * Event Manager
 * Centralized event management system for the Letters Cascade Challenge game
 */

export class EventManager {
  constructor() {
    this.events = {};
    this.onceEvents = {};
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Add one-time event listener
   */
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };

    if (!this.onceEvents[event]) {
      this.onceEvents[event] = [];
    }
    this.onceEvents[event].push(onceCallback);

    return () => {
      this.off(event, onceCallback);
    };
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    }

    if (this.onceEvents[event]) {
      const index = this.onceEvents[event].indexOf(callback);
      if (index > -1) {
        this.onceEvents[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  emit(event, data = null) {
    // Emit regular events
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Emit once events
    if (this.onceEvents[event]) {
      this.onceEvents[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in once event listener for ${event}:`, error);
        }
      });
      // Clear once events after emission
      this.onceEvents[event] = [];
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
      delete this.onceEvents[event];
    } else {
      this.events = {};
      this.onceEvents = {};
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    const regularCount = this.events[event] ? this.events[event].length : 0;
    const onceCount = this.onceEvents[event] ? this.onceEvents[event].length : 0;
    return regularCount + onceCount;
  }

  /**
   * Get all registered events
   */
  getEventNames() {
    const regularEvents = Object.keys(this.events);
    const onceEvents = Object.keys(this.onceEvents);
    return [...new Set([...regularEvents, ...onceEvents])];
  }

  /**
   * Game-specific event helpers
   */

  // Game lifecycle events
  onGameStart(callback) {
    return this.on('game:start', callback);
  }

  onGamePause(callback) {
    return this.on('game:pause', callback);
  }

  onGameResume(callback) {
    return this.on('game:resume', callback);
  }

  onGameEnd(callback) {
    return this.on('game:end', callback);
  }

  onGameReset(callback) {
    return this.on('game:reset', callback);
  }

  // Letter events
  onLetterPlaced(callback) {
    return this.on('letter:placed', callback);
  }

  onLetterFalling(callback) {
    return this.on('letter:falling', callback);
  }

  onLetterRotated(callback) {
    return this.on('letter:rotated', callback);
  }

  // Word events
  onWordFound(callback) {
    return this.on('word:found', callback);
  }

  onWordCompleted(callback) {
    return this.on('word:completed', callback);
  }

  // Score events
  onScoreUpdate(callback) {
    return this.on('score:update', callback);
  }

  onComboUpdate(callback) {
    return this.on('combo:update', callback);
  }

  // Level events
  onLevelUp(callback) {
    return this.on('level:up', callback);
  }

  onLevelStart(callback) {
    return this.on('level:start', callback);
  }

  // UI events
  onUIShow(callback) {
    return this.on('ui:show', callback);
  }

  onUIHide(callback) {
    return this.on('ui:hide', callback);
  }

  onUIRefresh(callback) {
    return this.on('ui:refresh', callback);
  }

  // Audio events
  onAudioPlay(callback) {
    return this.on('audio:play', callback);
  }

  onAudioStop(callback) {
    return this.on('audio:stop', callback);
  }

  // Error events
  onError(callback) {
    return this.on('error', callback);
  }

  // Performance events
  onPerformanceUpdate(callback) {
    return this.on('performance:update', callback);
  }

  /**
   * Emit game-specific events
   */

  emitGameStart() {
    this.emit('game:start');
  }

  emitGamePause() {
    this.emit('game:pause');
  }

  emitGameResume() {
    this.emit('game:resume');
  }

  emitGameEnd() {
    this.emit('game:end');
  }

  emitGameReset() {
    this.emit('game:reset');
  }

  emitLetterPlaced(letter, x, y) {
    this.emit('letter:placed', { letter, x, y });
  }

  emitLetterFalling(letter) {
    this.emit('letter:falling', { letter });
  }

  emitLetterRotated(letter, rotation) {
    this.emit('letter:rotated', { letter, rotation });
  }

  emitWordFound(word) {
    this.emit('word:found', { word });
  }

  emitWordCompleted(word, score) {
    this.emit('word:completed', { word, score });
  }

  emitScoreUpdate(score, points) {
    this.emit('score:update', { score, points });
  }

  emitComboUpdate(combo) {
    this.emit('combo:update', { combo });
  }

  emitLevelUp(level) {
    this.emit('level:up', { level });
  }

  emitLevelStart(level) {
    this.emit('level:start', { level });
  }

  emitUIShow(screen) {
    this.emit('ui:show', { screen });
  }

  emitUIHide(screen) {
    this.emit('ui:hide', { screen });
  }

  emitUIRefresh() {
    this.emit('ui:refresh');
  }

  emitAudioPlay(sound) {
    this.emit('audio:play', { sound });
  }

  emitAudioStop(sound) {
    this.emit('audio:stop', { sound });
  }

  emitError(error) {
    this.emit('error', { error });
  }

  emitPerformanceUpdate(metrics) {
    this.emit('performance:update', { metrics });
  }

  /**
   * Debug helpers
   */

  debug() {
    console.log('EventManager Debug Info:');
    console.log('Registered Events:', this.getEventNames());
    console.log('Event Listeners:');

    Object.keys(this.events).forEach(event => {
      console.log(`  ${event}: ${this.events[event].length} listeners`);
    });

    Object.keys(this.onceEvents).forEach(event => {
      console.log(`  ${event} (once): ${this.onceEvents[event].length} listeners`);
    });
  }
}
