/**
 * Game State Management
 * Centralized state management for the Letters Cascade Challenge game
 */

export class GameState {
  constructor() {
    this.state = {
      // Game Status
      gameRunning: false,
      paused: false,
      gameOver: false,

      // Game Progress
      level: 1,
      score: 0,
      combo: 0,
      maxCombo: 0,

      // Game Elements
      letters: [],
      letterQueue: [],
      wordsFound: [],
      targetWords: [],
      fallingLetter: null,

      // Statistics
      lettersPlaced: 0,
      wordsCompleted: 0,
      totalScore: 0,
      playTime: 0,
      startTime: null,

      // Game Configuration
      gridSize: 10,
      fallSpeed: 1000,
      mode: '2D', // '2D' or '3D'

      // UI State
      ui: {
        showPauseMenu: false,
        showGameOver: false,
        showLevelUp: false,
        currentScreen: 'game', // 'game', 'menu', 'pause', 'gameOver'
      },
    };

    this.listeners = [];
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state
   */
  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };

    // Add to history for undo/redo
    this.addToHistory(oldState);

    // Notify listeners
    this.notifyListeners(this.state, oldState);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(newState, oldState) {
    this.listeners.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  /**
   * Add state to history
   */
  addToHistory(state) {
    // Remove any future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(JSON.parse(JSON.stringify(state)));
    this.historyIndex++;

    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Undo last state change
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const previousState = this.history[this.historyIndex];
      this.state = { ...previousState };
      this.notifyListeners(this.state, null);
      return true;
    }
    return false;
  }

  /**
   * Redo last undone state change
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const nextState = this.history[this.historyIndex];
      this.state = { ...nextState };
      this.notifyListeners(this.state, null);
      return true;
    }
    return false;
  }

  /**
   * Reset game state
   */
  reset() {
    const initialState = {
      gameRunning: false,
      paused: false,
      gameOver: false,
      level: 1,
      score: 0,
      combo: 0,
      maxCombo: 0,
      letters: [],
      letterQueue: [],
      wordsFound: [],
      targetWords: [],
      fallingLetter: null,
      lettersPlaced: 0,
      wordsCompleted: 0,
      totalScore: 0,
      playTime: 0,
      startTime: null,
      ui: {
        showPauseMenu: false,
        showGameOver: false,
        showLevelUp: false,
        currentScreen: 'game',
      },
    };

    this.setState(initialState);
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Get specific state property
   */
  get(property) {
    return this.state[property];
  }

  /**
   * Set specific state property
   */
  set(property, value) {
    this.setState({ [property]: value });
  }

  /**
   * Update score
   */
  updateScore(points) {
    const newScore = this.state.score + points;
    this.setState({
      score: newScore,
      totalScore: this.state.totalScore + points,
    });
  }

  /**
   * Update combo
   */
  updateCombo(comboPoints) {
    const newCombo = this.state.combo + comboPoints;
    const maxCombo = Math.max(this.state.maxCombo, newCombo);
    this.setState({
      combo: newCombo,
      maxCombo,
    });
  }

  /**
   * Add word to found words
   */
  addWord(word) {
    const wordsFound = [...this.state.wordsFound, word];
    const wordsCompleted = this.state.wordsCompleted + 1;
    this.setState({
      wordsFound,
      wordsCompleted,
    });
  }

  /**
   * Add letter to queue
   */
  addLetterToQueue(letter) {
    const letterQueue = [...this.state.letterQueue, letter];
    this.setState({ letterQueue });
  }

  /**
   * Remove letter from queue
   */
  removeLetterFromQueue() {
    if (this.state.letterQueue.length > 0) {
      const letterQueue = this.state.letterQueue.slice(1);
      this.setState({ letterQueue });
    }
  }

  /**
   * Place letter on grid
   */
  placeLetter(letter, x, y) {
    const letters = [...this.state.letters, { letter, x, y }];
    const lettersPlaced = this.state.lettersPlaced + 1;
    this.setState({
      letters,
      lettersPlaced,
    });
  }

  /**
   * Set falling letter
   */
  setFallingLetter(letter) {
    this.setState({ fallingLetter: letter });
  }

  /**
   * Start game
   */
  startGame() {
    this.setState({
      gameRunning: true,
      paused: false,
      gameOver: false,
      startTime: Date.now(),
      ui: {
        ...this.state.ui,
        currentScreen: 'game',
      },
    });
  }

  /**
   * Pause game
   */
  pauseGame() {
    this.setState({
      paused: !this.state.paused,
      ui: {
        ...this.state.ui,
        showPauseMenu: !this.state.paused,
      },
    });
  }

  /**
   * End game
   */
  endGame() {
    this.setState({
      gameRunning: false,
      gameOver: true,
      ui: {
        ...this.state.ui,
        showGameOver: true,
        currentScreen: 'gameOver',
      },
    });
  }

  /**
   * Level up
   */
  levelUp() {
    const newLevel = this.state.level + 1;
    this.setState({
      level: newLevel,
      ui: {
        ...this.state.ui,
        showLevelUp: true,
      },
    });
  }

  /**
   * Get game statistics
   */
  getStats() {
    return {
      score: this.state.score,
      level: this.state.level,
      combo: this.state.combo,
      maxCombo: this.state.maxCombo,
      wordsFound: this.state.wordsFound.length,
      lettersPlaced: this.state.lettersPlaced,
      playTime: this.state.playTime,
    };
  }

  /**
   * Export state for saving
   */
  export() {
    return JSON.stringify({
      state: this.state,
      timestamp: Date.now(),
    });
  }

  /**
   * Import state from saved data
   */
  import(savedData) {
    try {
      const data = JSON.parse(savedData);
      this.setState(data.state);
      return true;
    } catch (error) {
      console.error('Error importing state:', error);
      return false;
    }
  }
}
