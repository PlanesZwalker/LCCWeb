# API Reference

This reference lists the main modules and their public methods for the 2D game and shared systems.

## GameCore
- `init(canvas: HTMLCanvasElement): Promise<void>`
- `startGame(): void`, `pauseGame(): void`, `resumeGame(): void`, `resetGame(): void`
- `startGameLoop(): void`, `stopGameLoop(): void`
- `startFallTimer(): void`, `stopFallTimer(): void`
- `update(deltaTime: number): void`, `render(): void`
- `endGame(reason: string): void`, `getGameStats(): object`

## GameState
- `init(): Promise<void>`, `reset(): void`
- Running/pausing: `isRunning()`, `setRunning(v)`, `isPaused()`, `setPaused(v)`
- Progress: `getLevel()`, `setLevel(n)`, `addScore(points)`, `updatePlayTime()`
- Limits: `isTimeLimitReached()`, `isScoreThresholdReached()`, `getRemainingTime()`
- Config: `getConfig()`, `setConfig(patch)`, `saveConfiguration()`, `loadConfiguration()`
- Persistence: `saveHighScore()`, `loadHighScore()`
- Serialization: `toJSON()`, `fromJSON(json)`

## LetterManager
- `init(): Promise<void>`, `reset(): void`
- Grid: `createGrid()`, `getGrid()`, `isGridFull()`, `noValidMoves()`
- Falling letter: `createFallingLetter()`, `moveFallingLetter(dir)`, `rotateFallingLetter()`, `dropFallingLetter()`, `updateFallingLetter()`
- Queue: `generateLetterQueue()`, `getLetterQueue()`
- Rendering: `render(ctx)`, `update()`, `updateCanvasSize(w,h)`

## WordManager
- `init(): Promise<void>`, `reset(): void`
- Detection: `checkWordCompletion(grid): string[]`, `completeWord(word): boolean`
- Progress: `getWordProgress()`
- Clues: `generateWordClues()`, `getActiveClues()`, `addActiveClue(word)`, `removeActiveClue(word)`
- Rendering: `render(ctx)`

## ScoreManager
- `init(): Promise<void>`, `reset(): void`
- Scoring: `completeWord(word): { totalPoints, basePoints, comboBonus, streakBonus, difficultyBonus, multiplier }`
- State: `addScore(points)`, `addCombo()`, `resetCombo()`, `activateMultiplier(factor,duration)`
- Getters: `getScoreStats()`, `getScore()`, `getCombo()`, `getMultiplier()`
- Rendering: `render(ctx)`

## LevelManager
- `init(): Promise<void>`, `reset(): void`
- `updateLevel(wordsCompleted: number): boolean`
- `getLevel(): number`, `getFallSpeed(): number`

## UIManager
- `init(): Promise<void>`, `reset(): void`
- Effects: `addParticle(x,y,type)`, `addNotification(message,type?,duration?)`
- Theme: `setTheme(theme)`
- Rendering: `render(ctx)`

## AudioManager
- `init(): Promise<void>`
- Playback: `playSound(name, options?)`, `playMusic(name?, fadeIn?)`, `playGameplayMusic()`, `stopMusic()`
- Volume: `setSoundVolume(v)`, `setSFXVolume(v)`, `setMusicVolume(v)`, `setMasterVolume(v)`
- Mute: `mute()`, `unmute()`, `toggleMute(): boolean`
- Stats: `getAudioStats()`, `dispose()`

## AnalyticsManager
- `init(): Promise<void>`, `reset(): void`, `update()`
- Tracking: `trackGameStart()`, `trackGameEnd(reason, finalStats)`, `trackWordCompleted(word,score,level)`
- Performance: `updatePerformanceMetrics(fps)`, `getPerformanceReport()`
- Reports: `getAnalytics()`, `getGameplayReport()`, `getErrorReport()`

## BackgroundManager
- `init(): Promise<void>`, `reset(): void`
- `update(deltaTime)`, `render(ctx, w, h)`
- Parallax: `setParallaxEnabled(bool)`, `setParallaxSpeed(num)`

## PowerUpManager
- `init(): Promise<void>`, `reset(): void`
- Use: `activatePowerUp(type)`, `getActivePowerUps()`, `getPowerUpStats()`
- UI: `render(ctx)`

## AchievementManager
- `init(): Promise<void>`, `reset(): void`, `checkAchievements(stats): Achievement[]`

## TutorialManager
- `init(): Promise<void>`, `reset(): void`
- Flow: `start()`, `next()`, `isActive()`, `getCurrentStep()`

## MemoryManager
- `init(): Promise<void>`, `dispose(): void`
- Pools: `createPool(name, factory, maxSize?)`, `acquire(poolName)`, `release(poolName, obj)`
- Monitoring: `getMemoryStats()`, `getPoolStats(name?)`, `optimizeMemory()`
