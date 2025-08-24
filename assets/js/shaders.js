/**
 * 🌊 Advanced Shader System for Letters Cascade Challenge
 * ====================================================
 * 
 * Provides sophisticated shader implementations for both 2D and 3D environments
 * featuring animated water effects, particle systems, and dynamic lighting
 * 
 * @version 1.0.0
 * @author Enhanced Shader System
 */

class GameShaders {
    constructor() {
        this.shaders = {};
        this.uniforms = {};
        this.animationTime = 0;
        this.frameCount = 0;
        
        console.log('🎨 Game Shaders System initialized');
    }

    /**
     * Initialize shader system for 2D canvas
     */
    init2DShaders(canvas) {
        try {
            console.log('🎨 Initializing 2D shaders...');
            
            // Create 2D shader context
            this.ctx2D = canvas.getContext('2d');
            this.canvas2D = canvas;
            
            // Initialize 2D shader effects
            this.initWaterShader2D();
            this.initParticleShader2D();
            this.initBackgroundShader2D();
            
            console.log('✅ 2D shaders initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing 2D shaders:', error);
        }
    }

    /**
     * Initialize shader system for 3D Babylon.js
     */
    init3DShaders(scene) {
        try {
            console.log('🎨 Initializing 3D shaders...');
            
            this.scene = scene;
            
            // Initialize 3D shader materials
            this.initWaterShader3D();
            this.initParticleShader3D();
            this.initEnvironmentShader3D();
            this.initLetterShader3D();
            
            console.log('✅ 3D shaders initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing 3D shaders:', error);
        }
    }

    /**
     * 2D Water Shader - Animated flowing water effect
     */
    initWaterShader2D() {
        this.waterShader2D = {
            // Water flow animation
            flowSpeed: 0.02,
            flowDirection: { x: 1, y: 0.5 },
            waveAmplitude: 3,
            waveFrequency: 0.1,
            
            // Water colors
            waterColor1: { r: 0.2, g: 0.4, b: 0.8, a: 0.7 },
            waterColor2: { r: 0.1, g: 0.3, b: 0.6, a: 0.5 },
            
            // Render water effect
            render: (ctx, x, y, width, height, time) => {
                const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
                
                // Animate water flow
                const flowOffset = time * this.waterShader2D.flowSpeed;
                const waveOffset = Math.sin(time * this.waterShader2D.waveFrequency) * this.waterShader2D.waveAmplitude;
                
                // Create flowing water pattern
                for (let i = 0; i < 5; i++) {
                    const offset = (i * 0.2 + flowOffset) % 1;
                    const alpha = 0.3 - (i * 0.05);
                    
                    gradient.addColorStop(offset, `rgba(32, 128, 255, ${alpha})`);
                    gradient.addColorStop(offset + 0.1, `rgba(64, 160, 255, ${alpha})`);
                    gradient.addColorStop(offset + 0.2, `rgba(32, 128, 255, ${alpha})`);
                }
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, width, height);
                
                // Add wave ripples
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + 0.2 * Math.sin(time * 0.5)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                
                for (let i = 0; i < width; i += 20) {
                    const waveY = y + height/2 + Math.sin((i + waveOffset) * 0.1) * 5;
                    if (i === 0) {
                        ctx.moveTo(x + i, waveY);
                    } else {
                        ctx.lineTo(x + i, waveY);
                    }
                }
                ctx.stroke();
            }
        };
    }

    /**
     * 2D Particle Shader - Animated particle effects
     */
    initParticleShader2D() {
        this.particleShader2D = {
            particles: [],
            maxParticles: 100,
            
            // Create new particle
            createParticle: (x, y, type = 'water') => {
                const particle = {
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * -3 - 1,
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.03,
                    size: 2 + Math.random() * 3,
                    type: type,
                    color: type === 'water' ? 
                        `rgba(64, 160, 255, ${0.8})` : 
                        `rgba(255, 255, 255, ${0.9})`
                };
                
                this.particleShader2D.particles.push(particle);
                
                // Limit particle count
                if (this.particleShader2D.particles.length > this.particleShader2D.maxParticles) {
                    this.particleShader2D.particles.shift();
                }
            },
            
            // Update and render particles
            update: (ctx, time) => {
                const particles = this.particleShader2D.particles;
                
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    
                    // Update particle
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= p.decay;
                    p.vy += 0.1; // Gravity
                    
                    // Remove dead particles
                    if (p.life <= 0 || p.y > ctx.canvas.height) {
                        particles.splice(i, 1);
                        continue;
                    }
                    
                    // Render particle
                    ctx.save();
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add glow effect
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = p.size * 2;
                    ctx.fill();
                    ctx.restore();
                }
            }
        };
    }

    /**
     * 2D Background Shader - Animated background effects
     */
    initBackgroundShader2D() {
        this.backgroundShader2D = {
            // Animated gradient background
            render: (ctx, width, height, time) => {
                const gradient = ctx.createRadialGradient(
                    width/2, height/2, 0,
                    width/2, height/2, Math.max(width, height)
                );
                
                // Animate colors
                const hue1 = (time * 0.1) % 360;
                const hue2 = (hue1 + 60) % 360;
                const hue3 = (hue2 + 60) % 360;
                
                gradient.addColorStop(0, `hsl(${hue1}, 70%, 20%)`);
                gradient.addColorStop(0.5, `hsl(${hue2}, 70%, 15%)`);
                gradient.addColorStop(1, `hsl(${hue3}, 70%, 10%)`);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // Add animated stars/particles
                for (let i = 0; i < 50; i++) {
                    const x = (Math.sin(time * 0.1 + i) * 0.5 + 0.5) * width;
                    const y = (Math.cos(time * 0.15 + i * 0.5) * 0.5 + 0.5) * height;
                    const alpha = 0.3 + 0.2 * Math.sin(time * 0.5 + i);
                    
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };
    }

    /**
     * 3D Water Shader - Advanced water material for Babylon.js
     */
    initWaterShader3D() {
        try {
            // Create custom water shader material
            const waterShader = new BABYLON.ShaderMaterial("waterShader", this.scene, {
                vertex: "water",
                fragment: "water",
            }, {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "resolution"],
                samplers: ["textureSampler"],
                defines: []
            });

            // Water vertex shader
            BABYLON.Effect.ShadersStore["waterVertexShader"] = `
                precision highp float;
                
                // Attributes
                    attribute vec3 position;
                    attribute vec2 uv;
                attribute vec3 normal;
                
                // Uniforms
                uniform mat4 world;
                uniform mat4 worldView;
                uniform mat4 worldViewProjection;
                uniform float time;
                
                // Varying
                varying vec2 vUV;
                    varying vec3 vPosition;
                varying vec3 vNormal;
                varying float vWave;
                    
                    void main() {
                    vec4 worldPos = world * vec4(position, 1.0);
                    
                    // Animate water surface
                    float wave1 = sin(position.x * 0.1 + time * 0.5) * 0.1;
                    float wave2 = sin(position.z * 0.15 + time * 0.3) * 0.08;
                    float wave3 = sin(position.x * 0.05 + position.z * 0.05 + time * 0.2) * 0.05;
                    
                    vec3 animatedPosition = position + normal * (wave1 + wave2 + wave3);
                    
                    vUV = uv;
                    vPosition = animatedPosition;
                    vNormal = normal;
                    vWave = wave1 + wave2 + wave3;
                    
                    gl_Position = worldViewProjection * vec4(animatedPosition, 1.0);
                }
            `;

            // Water fragment shader
            BABYLON.Effect.ShadersStore["waterFragmentShader"] = `
                    precision highp float;
                
                // Varying
                varying vec2 vUV;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying float vWave;
                
                // Uniforms
                    uniform float time;
                    uniform vec2 resolution;
                
                void main() {
                    // Base water color
                    vec3 waterColor = vec3(0.1, 0.3, 0.6);
                    
                    // Add wave patterns
                    float wavePattern = sin(vUV.x * 10.0 + time * 0.5) * 0.5 + 0.5;
                    wavePattern *= sin(vUV.y * 8.0 + time * 0.3) * 0.5 + 0.5;
                    
                    // Add ripples
                    float ripple = sin(length(vUV - vec2(0.5)) * 20.0 - time * 2.0) * 0.5 + 0.5;
                    
                    // Combine effects
                    vec3 finalColor = waterColor + vec3(0.1, 0.2, 0.3) * wavePattern;
                    finalColor += vec3(0.05, 0.1, 0.15) * ripple;
                    
                    // Add transparency based on depth
                    float alpha = 0.7 + 0.2 * wavePattern;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `;

            this.waterShader3D = waterShader;
            console.log('✅ 3D water shader created');
            
        } catch (error) {
            console.error('❌ Error creating 3D water shader:', error);
        }
    }

    /**
     * 3D Particle Shader - Advanced particle system
     */
    initParticleShader3D() {
        try {
            // Create particle shader material
            const particleShader = new BABYLON.ShaderMaterial("particleShader", this.scene, {
                vertex: "particle",
                fragment: "particle",
            }, {
                attributes: ["position", "color", "size"],
                uniforms: ["worldView", "projection", "time"],
                defines: []
            });

            // Particle vertex shader
            BABYLON.Effect.ShadersStore["particleVertexShader"] = `
                precision highp float;
                
                attribute vec3 position;
                attribute vec3 color;
                attribute float size;
                
                uniform mat4 worldView;
                uniform mat4 projection;
                uniform float time;
                
                varying vec3 vColor;
                varying float vAlpha;
                    
                    void main() {
                    // Animate particle position
                    vec3 animatedPos = position;
                    animatedPos.y += sin(time * 2.0 + position.x) * 0.1;
                    animatedPos.x += cos(time * 1.5 + position.z) * 0.05;
                    
                    vec4 worldViewPos = worldView * vec4(animatedPos, 1.0);
                    gl_Position = projection * worldViewPos;
                    
                    // Billboard effect
                    gl_PointSize = size * (300.0 / -worldViewPos.z);
                    
                    vColor = color;
                    vAlpha = 0.8 + 0.2 * sin(time * 3.0 + position.x + position.z);
                }
            `;

            // Particle fragment shader
            BABYLON.Effect.ShadersStore["particleFragmentShader"] = `
                precision highp float;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    // Create circular particle
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) {
                        discard;
                    }
                    
                    // Add glow effect
                    float glow = 1.0 - dist * 2.0;
                    glow = pow(glow, 2.0);
                    
                    gl_FragColor = vec4(vColor, vAlpha * glow);
                }
            `;

            this.particleShader3D = particleShader;
            console.log('✅ 3D particle shader created');
            
        } catch (error) {
            console.error('❌ Error creating 3D particle shader:', error);
        }
    }

    /**
     * 3D Environment Shader - Dynamic environment effects
     */
    initEnvironmentShader3D() {
        try {
            // Create environment shader material
            const envShader = new BABYLON.ShaderMaterial("environmentShader", this.scene, {
                vertex: "environment",
                fragment: "environment",
            }, {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "time", "lightPosition"],
                defines: []
            });

            // Environment vertex shader
            BABYLON.Effect.ShadersStore["environmentVertexShader"] = `
                precision highp float;
                
                attribute vec3 position;
                attribute vec2 uv;
                attribute vec3 normal;
                
                uniform mat4 world;
                uniform mat4 worldView;
                uniform mat4 worldViewProjection;
                uniform float time;
                
                varying vec2 vUV;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                void main() {
                    vec4 worldPos = world * vec4(position, 1.0);
                    
                    // Add subtle movement to environment
                    vec3 animatedPosition = position;
                    animatedPosition.y += sin(time * 0.1 + position.x * 0.1) * 0.02;
                    
                    vUV = uv;
                    vPosition = animatedPosition;
                    vNormal = normal;
                    vWorldPosition = worldPos.xyz;
                    
                    gl_Position = worldViewProjection * vec4(animatedPosition, 1.0);
                }
            `;

            // Environment fragment shader
            BABYLON.Effect.ShadersStore["environmentFragmentShader"] = `
                precision highp float;
                
                varying vec2 vUV;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                uniform float time;
                uniform vec3 lightPosition;
                
                void main() {
                    // Base environment color
                    vec3 baseColor = vec3(0.2, 0.3, 0.1);
                    
                    // Add time-based color variation
                    vec3 timeColor = vec3(
                        sin(time * 0.1) * 0.1,
                        cos(time * 0.15) * 0.1,
                        sin(time * 0.2) * 0.05
                    );
                    
                    // Add noise pattern
                    float noise = sin(vUV.x * 50.0 + time) * sin(vUV.y * 50.0 + time * 0.5);
                    noise = noise * 0.5 + 0.5;
                    
                    // Combine effects
                    vec3 finalColor = baseColor + timeColor + noise * 0.1;
                    
                    // Add lighting
                    vec3 lightDir = normalize(lightPosition - vWorldPosition);
                    float diffuse = max(dot(vNormal, lightDir), 0.0);
                    finalColor += diffuse * 0.3;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;

            this.environmentShader3D = envShader;
            console.log('✅ 3D environment shader created');
            
        } catch (error) {
            console.error('❌ Error creating 3D environment shader:', error);
        }
    }

    /**
     * 3D Letter Shader - Animated letter materials
     */
    initLetterShader3D() {
        try {
            // Create letter shader material
            const letterShader = new BABYLON.ShaderMaterial("letterShader", this.scene, {
                vertex: "letter",
                fragment: "letter",
        }, {
            attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "time", "letterColor"],
                defines: []
            });

            // Letter vertex shader
            BABYLON.Effect.ShadersStore["letterVertexShader"] = `
                precision highp float;
                
                attribute vec3 position;
                attribute vec2 uv;
                attribute vec3 normal;
                
                uniform mat4 world;
                uniform mat4 worldView;
                uniform mat4 worldViewProjection;
                uniform float time;
                
                varying vec2 vUV;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                void main() {
                    vec4 worldPos = world * vec4(position, 1.0);
                    
                    // Add subtle letter animation
                    vec3 animatedPosition = position;
                    animatedPosition.y += sin(time * 2.0 + position.x * 10.0) * 0.01;
                    
                    vUV = uv;
                    vPosition = animatedPosition;
                    vNormal = normal;
                    vWorldPosition = worldPos.xyz;
                    
                    gl_Position = worldViewProjection * vec4(animatedPosition, 1.0);
                }
            `;

            // Letter fragment shader
            BABYLON.Effect.ShadersStore["letterFragmentShader"] = `
                precision highp float;
                
                varying vec2 vUV;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                uniform float time;
                uniform vec3 letterColor;
                
                void main() {
                    // Base letter color
                    vec3 baseColor = letterColor;
                    
                    // Add pulsing glow effect
                    float pulse = sin(time * 3.0) * 0.5 + 0.5;
                    vec3 glowColor = letterColor * (0.5 + pulse * 0.5);
                    
                    // Add edge glow
                    float edge = 1.0 - max(abs(vUV.x - 0.5), abs(vUV.y - 0.5)) * 2.0;
                    edge = max(edge, 0.0);
                    edge = pow(edge, 2.0);
                    
                    // Combine effects
                    vec3 finalColor = mix(baseColor, glowColor, edge * 0.7);
                    
                    // Add sparkle effect
                    float sparkle = sin(vUV.x * 100.0 + time * 5.0) * sin(vUV.y * 100.0 + time * 3.0);
                    sparkle = max(sparkle, 0.0);
                    sparkle = pow(sparkle, 3.0);
                    finalColor += sparkle * 0.3;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;

            this.letterShader3D = letterShader;
            console.log('✅ 3D letter shader created');
            
        } catch (error) {
            console.error('❌ Error creating 3D letter shader:', error);
        }
    }

    /**
     * Update shader animations
     */
    update(time) {
        this.animationTime = time;
        this.frameCount++;
        
        // Update 2D shaders
        if (this.ctx2D) {
            // Update particle system
            if (this.particleShader2D) {
                this.particleShader2D.update(this.ctx2D, time);
            }
        }
        
        // Update 3D shaders
        if (this.scene) {
            // Update shader uniforms
            if (this.waterShader3D) {
                this.waterShader3D.setFloat("time", time);
            }
            if (this.particleShader3D) {
                this.particleShader3D.setFloat("time", time);
            }
            if (this.environmentShader3D) {
                this.environmentShader3D.setFloat("time", time);
            }
            if (this.letterShader3D) {
                this.letterShader3D.setFloat("time", time);
            }
        }
    }

    /**
     * Create water particles at specific position
     */
    createWaterParticles(x, y, count = 10) {
        if (this.particleShader2D) {
            for (let i = 0; i < count; i++) {
                this.particleShader2D.createParticle(x, y, 'water');
            }
        }
    }

    /**
     * Create celebration particles
     */
    createCelebrationParticles(x, y, count = 20) {
        if (this.particleShader2D) {
            for (let i = 0; i < count; i++) {
                this.particleShader2D.createParticle(x, y, 'celebration');
            }
        }
    }

    /**
     * Get 3D water material
     */
    getWaterMaterial3D() {
        return this.waterShader3D;
    }

    /**
     * Get 3D particle material
     */
    getParticleMaterial3D() {
        return this.particleShader3D;
    }

    /**
     * Get 3D environment material
     */
    getEnvironmentMaterial3D() {
        return this.environmentShader3D;
    }

    /**
     * Get 3D letter material with color
     */
    getLetterMaterial3D(color = new BABYLON.Color3(1, 1, 1)) {
        if (this.letterShader3D) {
            this.letterShader3D.setVector3("letterColor", color);
            return this.letterShader3D;
        }
        return null;
    }

    /**
     * Create Babylon.js material for canvas shader
     */
    createBabylonJSMaterial(type = 'water', options = {}) {
        try {
            if (!this.scene) {
                console.warn('⚠️ Scene not initialized for Babylon.js material creation');
                return null;
            }

            switch (type) {
                case 'water':
                    return this.getWaterMaterial3D() || this.createFallbackWaterMaterial();
                case 'particle':
                    return this.getParticleMaterial3D() || this.createFallbackParticleMaterial();
                case 'environment':
                    return this.getEnvironmentMaterial3D() || this.createFallbackEnvironmentMaterial();
                case 'letter':
                    return this.getLetterMaterial3D(options.color) || this.createFallbackLetterMaterial(options.color);
                default:
                    console.warn(`⚠️ Unknown material type: ${type}`);
                    return this.createFallbackMaterial();
            }
        } catch (error) {
            console.error('❌ Error creating Babylon.js material:', error);
            return this.createFallbackMaterial();
        }
    }

    /**
     * Create fallback materials for when shaders are not available
     */
    createFallbackWaterMaterial() {
        if (!this.scene) return null;
        
        const material = new BABYLON.StandardMaterial("fallbackWater", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
        material.alpha = 0.7;
        material.backFaceCulling = false;
        return material;
    }

    createFallbackParticleMaterial() {
        if (!this.scene) return null;
        
        const material = new BABYLON.StandardMaterial("fallbackParticle", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        material.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        return material;
    }

    createFallbackEnvironmentMaterial() {
        if (!this.scene) return null;
        
        const material = new BABYLON.StandardMaterial("fallbackEnvironment", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.3);
        return material;
    }

    createFallbackLetterMaterial(color = new BABYLON.Color3(1, 1, 1)) {
        if (!this.scene) return null;
        
        const material = new BABYLON.StandardMaterial("fallbackLetter", this.scene);
        material.diffuseColor = color;
        material.emissiveColor = color.scale(0.3);
        return material;
    }

    createFallbackMaterial() {
        if (!this.scene) return null;
        
        const material = new BABYLON.StandardMaterial("fallback", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        return material;
    }

    /**
     * Create canvas shader for 2D rendering
     */
    createCanvasShader(type = 'background', options = {}) {
        try {
            if (!this.canvas2D) {
                console.warn('⚠️ Canvas not initialized for 2D shader creation');
                return null;
            }

            switch (type) {
                case 'background':
                    return this.backgroundShader2D || this.createFallbackBackgroundShader();
                case 'water':
                    return this.waterShader2D || this.createFallbackWaterShader();
                case 'particle':
                    return this.particleShader2D || this.createFallbackParticleShader();
                default:
                    console.warn(`⚠️ Unknown shader type: ${type}`);
                    return this.createFallbackBackgroundShader();
            }
        } catch (error) {
            console.error('❌ Error creating canvas shader:', error);
            return this.createFallbackBackgroundShader();
        }
    }

    /**
     * Create fallback shaders for 2D rendering
     */
    createFallbackBackgroundShader() {
        return {
            render: (ctx, width, height, time) => {
                const gradient = ctx.createRadialGradient(
                    width/2, height/2, 0,
                    width/2, height/2, Math.max(width, height)
                );
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
        };
    }

    createFallbackWaterShader() {
        return {
            render: (ctx, x, y, width, height, time) => {
                const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
                gradient.addColorStop(0, 'rgba(32, 128, 255, 0.7)');
                gradient.addColorStop(1, 'rgba(64, 160, 255, 0.5)');
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, width, height);
            }
        };
    }

    createFallbackParticleShader() {
        return {
            particles: [],
            createParticle: (x, y, type) => {
                // Simple particle creation
                return { x, y, type, life: 1.0 };
            },
            update: (ctx, time) => {
                // Simple particle update
            }
        };
    }
        
    /**
     * Dispose of shader resources
     */
    dispose() {
        // Dispose 3D shaders
        if (this.waterShader3D) {
            this.waterShader3D.dispose();
        }
        if (this.particleShader3D) {
            this.particleShader3D.dispose();
        }
        if (this.environmentShader3D) {
            this.environmentShader3D.dispose();
        }
        if (this.letterShader3D) {
            this.letterShader3D.dispose();
        }
        
        console.log('🎨 Shader system disposed');
    }
}

// Create global shader instance
window.gameShaders = new GameShaders(); 