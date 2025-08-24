/**
 * 🔊 Enhanced Audio Manager - Letters Cascade Challenge
 * ===================================================
 *
 * Cross-browser audio system with comprehensive fallback support
 * - Web Audio API with fallback to HTML5 Audio
 * - Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
 * - 3D spatial audio support for Babylon.js
 * - Performance-optimized audio loading
 * - Memory management for audio resources
 *
 * @version 2.0.0 - Cross-Browser Enhanced Edition
 *
 */

export class AudioManager {
    constructor() {
        // Audio context and state
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.isInitialized = false;
        this.isSupported = false;
        this.muted = false;
        
        // Audio resources
        this.sounds = new Map();
        this.music = new Map();
        this.audioBuffers = new Map();
        
        // Active sources
        this.currentMusicSource = null;
        this.currentMusicHtml5 = null;
        
        // Performance monitoring
        this.audioStats = {
            loadedSounds: 0,
            activeSounds: 0,
            memoryUsage: 0,
            lastUpdate: 0
        };
        
        // Settings
        this.settings = {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.6,
            spatialAudio: true,
            enable3D: true
        };
        
        // Fallback support
        this.fallbackMode = false;
        this.html5Audio = new Map();
        
        // Synth fallback when assets are missing
        this.syntheticSounds = new Map(); // name -> { freq, duration }
        
        // Alias map for legacy or alternate sound names used by callers/tests
        this.soundAliases = new Map([
            ['button_click', 'letter-drop'],
            ['button-click', 'letter-drop'],
            ['click', 'letter-drop'],
            ['confirm', 'word-found'],
            ['combo', 'power-up'],
        ]);
        
        console.log('🔊 Enhanced Audio Manager initialized');
    }

    /**
     * Initialize audio system with comprehensive fallback support
     */
    async init() {
        try {
            console.log('🔊 Initializing enhanced audio system...');
            
            // Check Web Audio API support
            this.isSupported = this.checkWebAudioSupport();
            
            if (this.isSupported) {
                await this.initializeWebAudio();
            } else {
                console.warn('⚠️ Web Audio API not supported, using HTML5 fallback');
                this.enableFallbackMode();
            }
            
            // Load default audio resources
            await this.loadDefaultAudio();
            
            this.isInitialized = true;
            console.log('✅ Enhanced audio system initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing audio system:', error);
            this.enableFallbackMode();
        }
    }

    /**
     * Check Web Audio API support with comprehensive testing
     */
    checkWebAudioSupport() {
        try {
            // Check for Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn('⚠️ Web Audio API not available');
                return false;
            }
            
            // Test audio context creation
            const testContext = new AudioContext();
            if (!testContext) {
                console.warn('⚠️ Audio context creation failed');
                return false;
            }
            
            // Check for essential features
            if (!testContext.createGain || !testContext.createOscillator) {
                console.warn('⚠️ Essential Web Audio features missing');
                return false;
            }
            
            // Test oscillator creation
            const oscillator = testContext.createOscillator();
            const gainNode = testContext.createGain();
            if (!oscillator || !gainNode) {
                console.warn('⚠️ Audio node creation failed');
                return false;
            }
            
            // Clean up test context
            testContext.close();
            
            console.log('✅ Web Audio API fully supported');
            return true;
            
        } catch (error) {
            console.error('❌ Web Audio API support check failed:', error);
            return false;
        }
    }

    /**
     * Initialize Web Audio API
     */
    async initializeWebAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.settings.masterVolume;
        
        // Music gain separated from SFX via master
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = this.settings.musicVolume;
        this.musicGain.connect(this.masterGain);
        
        this.masterGain.connect(this.audioContext.destination);
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        console.log('🎵 Web Audio API initialized successfully');
    }

    /** Enable fallback mode using HTML5 Audio */
    enableFallbackMode() {
        this.fallbackMode = true;
        console.log('🔄 Enabling HTML5 Audio fallback mode');
        this.createFallbackAudio();
    }

    /** Create fallback HTML5 audio elements */
    createFallbackAudio() {
        const fallbackSounds = {
            'letter-drop': { src: 'sounds/letter-drop.mp3', volume: 0.6 },
            'word-found': { src: 'sounds/word-found.mp3', volume: 0.8 },
            'power-up': { src: 'sounds/power-up.mp3', volume: 0.7 },
            'background-music': { src: 'music/background.mp3', volume: 0.5, loop: true }
        };
        
        for (const [name, config] of Object.entries(fallbackSounds)) {
            const audio = new Audio();
            audio.src = config.src;
            audio.volume = config.volume;
            audio.loop = config.loop || false;
            audio.preload = 'auto';
            this.html5Audio.set(name, audio);
        }
        
        console.log('📱 HTML5 Audio fallback created');
    }

    /** Load default audio resources */
    async loadDefaultAudio() {
        const defaultSounds = [
            { name: 'letter-drop', url: 'sounds/letter-drop.mp3' },
            { name: 'word-found', url: 'sounds/word-found.mp3' },
            { name: 'power-up', url: 'sounds/power-up.mp3' },
            { name: 'background-music', url: 'music/background.mp3' }
        ];
        
        for (const sound of defaultSounds) {
            try {
                await this.loadAudio(sound.name, sound.url);
            } catch (error) {
                console.warn(`⚠️ Failed to load audio: ${sound.name}`, error);
                // Register a synthesized tone for missing SFX (skip music)
                if (sound.name !== 'background-music') {
                    this.registerSynthSound(sound.name);
                }
            }
        }
    }

    /** Load audio file with cross-browser support */
    async loadAudio(name, url) {
        const resolvedName = this.resolveSoundName(name);
        if (this.fallbackMode) {
            const audio = this.html5Audio.get(resolvedName);
            if (audio) {
                this.sounds.set(resolvedName, audio);
                console.log(`✅ Loaded fallback audio: ${resolvedName}`);
            }
            this.audioStats.loadedSounds++;
            return;
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} for ${url}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(resolvedName, audioBuffer);
            this.audioStats.loadedSounds++;
            console.log(`✅ Loaded Web Audio: ${resolvedName}`);
        } catch (err) {
            console.warn(`⚠️ Web Audio load failed for ${resolvedName} (${url})`, err);
            // Fallback to synthesized tone for SFX
            if (resolvedName !== 'background-music') {
                this.registerSynthSound(resolvedName);
            }
        }
    }

    /** Play SFX sound */
    playSound(name, options = {}) {
        try {
            if (this.muted) return;
            const resolvedName = this.resolveSoundName(name);
            const opts = typeof options === 'number' ? { volume: options } : (options || {});
            if (this.fallbackMode) return this.playFallbackSound(resolvedName, opts);
            this.playWebAudioSound(resolvedName, opts);
        } catch (error) {
            console.error(`❌ Failed to play sound: ${name}`, error);
        }
    }

    /** Play sound using Web Audio API */
    playWebAudioSound(name, options = {}) {
        if (!this.audioContext || !this.audioBuffers.has(name)) {
            // Try synthesized tone if registered
            if (this.syntheticSounds.has(name)) {
                this.playSynthesized(name, options);
                return;
            }
            console.warn(`⚠️ Audio not available: ${name}`);
            return;
        }
        
        const audioBuffer = this.audioBuffers.get(name);
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        gainNode.gain.value = options.volume ?? this.settings.sfxVolume;
        
        if (this.settings.spatialAudio && options.position) {
            this.applySpatialAudio(source, options.position);
        }
        
        source.start(0);
        this.audioStats.activeSounds++;
        source.onended = () => { this.audioStats.activeSounds--; };
    }

    /** Play sound using HTML5 Audio fallback */
    playFallbackSound(name, options = {}) {
        const opts = typeof options === 'number' ? { volume: options } : (options || {});
        const audio = this.html5Audio.get(name);
        if (!audio) {
            // If Web Audio is actually supported, synthesize
            if (this.isSupported) {
                this.playSynthesized(name, opts);
                return;
            }
            console.warn(`⚠️ Fallback audio not available: ${name}`);
            return;
        }
        const node = audio.cloneNode();
        node.volume = opts.volume ?? this.settings.sfxVolume;
        if (!this.muted) node.play().catch(() => {});
        this.audioStats.activeSounds++;
        node.onended = () => { this.audioStats.activeSounds--; };
    }

    /** Simple 3D spatial audio */
    applySpatialAudio(source, position) {
        if (!this.settings.enable3D || !this.audioContext) return;
        try {
            const panner = this.audioContext.createPanner();
            panner.positionX?.setValueAtTime(position.x || 0, this.audioContext.currentTime);
            panner.positionY?.setValueAtTime(position.y || 0, this.audioContext.currentTime);
            panner.positionZ?.setValueAtTime(position.z || 0, this.audioContext.currentTime);
            source.disconnect();
            source.connect(panner);
            panner.connect(this.masterGain);
        } catch {
            // no-op
        }
    }

    // Backward-compatible API expected by tests and GameCore

    setSoundVolume(volume) { // alias for backward compatibility
        this.setSFXVolume(volume);
    }

    setSFXVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 SFX volume set to: ${this.settings.sfxVolume}`);
    }

    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) this.musicGain.gain.value = this.settings.musicVolume;
        if (this.currentMusicHtml5) this.currentMusicHtml5.volume = this.settings.musicVolume;
        console.log(`🎵 Music volume set to: ${this.settings.musicVolume}`);
    }

    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.settings.masterVolume;
        this.html5Audio.forEach(a => { a.volume = this.settings.masterVolume; });
        console.log(`🔊 Master volume set to: ${this.settings.masterVolume}`);
    }

    mute() {
        this.muted = true;
        if (this.masterGain) this.masterGain.gain.value = 0;
        if (this.currentMusicHtml5) this.currentMusicHtml5.pause();
    }

    unmute() {
        this.muted = false;
        if (this.masterGain) this.masterGain.gain.value = this.settings.masterVolume;
        if (this.currentMusicHtml5 && this.currentMusicHtml5.paused) this.currentMusicHtml5.play().catch(() => {});
    }

    toggleMute() {
        if (this.muted) this.unmute(); else this.mute();
        return this.muted;
    }

    // Backward-compatibility SFX helpers expected by other modules
    playLetterPlace(volume = 0.8) { this.playSound('letter-drop', { volume }); }
    playWordComplete(volume = 0.8) { this.playSound('word-found', { volume }); }
    playCombo(volume = 0.8) { this.playSound('power-up', { volume }); }
    playPowerUp(volume = 0.8) { this.playSound('power-up', { volume }); }
    playAchievement(volume = 0.8) { this.playSound('word-found', { volume }); }
    playGameOver(volume = 0.8) { this.playSound('letter-drop', { volume }); }
    playLevelUp(volume = 0.8) { this.playSound('power-up', { volume }); }
    playButtonClick(volume = 0.3) { this.playSound('letter-drop', { volume }); }
    playNotification(volume = 0.3) { this.playSound('word-found', { volume }); }
    playError(volume = 0.3) { this.playSound('letter-drop', { volume }); }

    playMusic(trackName = 'background-music', fadeIn = false) {
        if (this.muted) return;
        // Stop existing
        this.stopMusic(false);
        
        if (this.fallbackMode) {
            const audio = this.html5Audio.get(trackName) || this.html5Audio.get('background-music');
            if (!audio) return;
            audio.volume = this.settings.musicVolume;
            audio.loop = true;
            audio.currentTime = 0;
            audio.play().catch(() => {});
            this.currentMusicHtml5 = audio;
            return;
        }
        
        if (!this.audioBuffers.has(trackName)) trackName = 'background-music';
        const buffer = this.audioBuffers.get(trackName);
        if (!buffer) return;
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(this.musicGain);
        source.start(0);
        this.currentMusicSource = source;
    }

    playGameplayMusic() {
        this.playMusic('background-music', true);
    }

    stopMusic() {
        if (this.currentMusicSource) {
            try { this.currentMusicSource.stop(0); } catch {}
            this.currentMusicSource.disconnect();
            this.currentMusicSource = null;
        }
        if (this.currentMusicHtml5) {
            try { this.currentMusicHtml5.pause(); } catch {}
            this.currentMusicHtml5 = null;
        }
    }

    /** Get audio statistics */
    getAudioStats() {
        this.audioStats.memoryUsage = this.audioBuffers.size * 0.1; // rough estimate
        this.audioStats.lastUpdate = Date.now();
        return {
            ...this.audioStats,
            isSupported: this.isSupported,
            fallbackMode: this.fallbackMode,
            masterVolume: this.settings.masterVolume,
            sfxVolume: this.settings.sfxVolume,
            musicVolume: this.settings.musicVolume,
            muted: this.muted
        };
    }

    /** Resolve legacy/alias names to canonical names */
    resolveSoundName(name) {
        return this.soundAliases.get(name) || name;
    }

    /** Register a synthesized tone for a missing SFX */
    registerSynthSound(name, freq) {
        const frequency = freq ?? this.getDefaultFrequency(name);
        const duration = this.getDefaultDuration(name);
        this.syntheticSounds.set(name, { freq: frequency, duration });
        console.log(`🎛️ Registered synthesized sound for: ${name} (${frequency}Hz, ${duration}ms)`);
    }

    /** Play a short synthesized tone using Web Audio */
    playSynthesized(name, options = {}) {
        if (!this.audioContext) return;
        const cfg = this.syntheticSounds.get(name) || { freq: this.getDefaultFrequency(name), duration: this.getDefaultDuration(name) };
        try {
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            oscillator.type = name === 'power-up' ? 'sawtooth' : 'sine';
            oscillator.frequency.setValueAtTime(cfg.freq, this.audioContext.currentTime);
            
            const volume = options.volume ?? this.settings.sfxVolume;
            const now = this.audioContext.currentTime;
            const durSec = Math.max(0.03, (cfg.duration || 90) / 1000);
            
            // Envelope to avoid clicks
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(volume, now + 0.01);
            gain.gain.linearRampToValueAtTime(0.0001, now + durSec);
            
            oscillator.connect(gain);
            gain.connect(this.masterGain || this.audioContext.destination);
            oscillator.start(now);
            oscillator.stop(now + durSec + 0.01);
        } catch {}
    }

    getDefaultFrequency(name) {
        switch (name) {
            case 'letter-drop':
                return 440;
            case 'word-found':
                return 660;
            case 'power-up':
                return 880;
            case 'button_click':
            case 'button-click':
                return 500;
            default:
                return 520;
        }
    }

    getDefaultDuration(name) {
        switch (name) {
            case 'letter-drop':
                return 80;
            case 'word-found':
                return 180;
            case 'power-up':
                return 160;
            default:
                return 90;
        }
    }

    /** Clean up audio resources */
    dispose() {
        try {
            this.stopMusic();
            this.html5Audio.forEach(audio => { audio.pause(); audio.currentTime = 0; });
            if (this.audioContext && this.audioContext.state !== 'closed') this.audioContext.close();
            this.sounds.clear();
            this.music.clear();
            this.audioBuffers.clear();
            this.html5Audio.clear();
            console.log('🧹 Audio Manager disposed successfully');
        } catch (error) {
            console.error('❌ Error disposing Audio Manager:', error);
        }
    }
}

// Also provide global access for non-module usage
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
