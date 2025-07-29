// ========================================
// UTILITIES - Letters Cascade Challenge
// ========================================

// Audio Context for sound effects
let audioContext = null;

// Initialize audio context
function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context initialization failed:', error);
        }
    }
    return audioContext;
}

// Play sound effect
function playSound(type, frequency = 800, duration = 0.2) {
    try {
        initAudio();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'start':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
                break;
            case 'place':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                break;
            case 'complete':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
                break;
            default:
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Audio playback failed:', error);
    }
}

// Create particle effect
function createParticleEffect(x, y, count = 8, color = 'white') {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i / count) * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        
        setTimeout(() => {
            particle.style.transition = 'all 0.5s ease-out';
            particle.style.left = (x + Math.cos(angle) * distance) + 'px';
            particle.style.top = (y + Math.sin(angle) * distance) + 'px';
            particle.style.opacity = '0';
            
            setTimeout(() => particle.remove(), 500);
        }, 10);
    }
}

// Create victory sparkles
function createVictorySparkles(count = 20) {
    const colors = ['#4ecdc4', '#667eea', '#764ba2', '#4ade80', '#fbbf24'];
    const emojis = ['✨', '⭐', '🌟', '💫', '🎉'];
    
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            left: ${Math.random() * window.innerWidth}px;
            top: ${Math.random() * window.innerHeight}px;
            font-size: ${Math.random() * 20 + 10}px;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            pointer-events: none;
            z-index: 1000;
        `;
        sparkle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 2000);
    }
}

// Show modal dialog
function showModal(title, message, buttons = []) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        min-width: 300px;
        max-width: 500px;
        margin: 1rem;
    `;
    
    dialog.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
        <div style="margin-top: 1.5rem;">
            ${buttons.map(btn => `
                <button onclick="${btn.onclick}" 
                        style="margin: 0.5rem; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; 
                               background: ${btn.primary ? '#4ecdc4' : '#667eea'}; color: white; cursor: pointer;">
                    ${btn.text}
                </button>
            `).join('')}
        </div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    return modal;
}

// Hide modal
function hideModal(modal) {
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Local storage utilities
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }
};

// Animation utilities
const Animation = {
    slideIn(element, direction = 'up', duration = 600) {
        element.style.opacity = '0';
        element.style.transform = `translateY(${direction === 'up' ? '30px' : '-30px'})`;
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    },
    
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    },
    
    pulse(element, duration = 1000) {
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }
};

// DOM utilities
const DOM = {
    createElement(tag, className, innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    },
    
    removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    },
    
    toggleClass(element, className) {
        if (element && element.classList) {
            element.classList.toggle(className);
        }
    },
    
    hasClass(element, className) {
        return element && element.classList && element.classList.contains(className);
    }
};

// Validation utilities
const Validation = {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    isEmpty(value) {
        return value === null || value === undefined || value === '';
    }
};

// Format utilities
const Format = {
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// Event utilities
const Events = {
    on(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
    },
    
    off(element, event, handler) {
        element.removeEventListener(event, handler);
    },
    
    once(element, event, handler) {
        const onceHandler = (...args) => {
            handler(...args);
            element.removeEventListener(event, onceHandler);
        };
        element.addEventListener(event, onceHandler);
    }
};

// Export utilities for use in other files
window.Utils = {
    playSound,
    createParticleEffect,
    createVictorySparkles,
    showModal,
    hideModal,
    debounce,
    throttle,
    Storage,
    Animation,
    DOM,
    Validation,
    Format,
    Events
};