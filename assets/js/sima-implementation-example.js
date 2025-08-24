/**
 * SIMA-Adapted Implementation Example
 * Shows how to implement the SIMA principles in your existing game
 */

class SIMAImplementation {
    constructor(scene) {
        this.scene = scene;
        this.designer = new EnvironmentDesigner();
        this.analysis = this.designer.analyzeConceptArt();
        this.environment = this.designer.generateEnvironment(this.analysis);
    }

    /**
     * Apply SIMA-inspired environment to your game
     */
    applySIMAEnvironment() {
        console.log('🎨 Applying SIMA-adapted environment...');
        
        // 1. Setup optimized lighting
        this.setupOptimizedLighting();
        
        // 2. Create materials based on concept analysis
        this.createConceptBasedMaterials();
        
        // 3. Add atmospheric particles (limited count)
        this.addAtmosphericParticles();
        
        // 4. Apply post-processing effects
        this.applyPostProcessing();
        
        console.log('✅ SIMA environment applied successfully!');
    }

    /**
     * Setup lighting optimized for performance
     */
    setupOptimizedLighting() {
        // Ambient light for base illumination
        const ambientLight = new BABYLON.HemisphericLight(
            "ambient", 
            new BABYLON.Vector3(0, 1, 0), 
            this.scene
        );
        ambientLight.intensity = 0.3;
        ambientLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.2);
        ambientLight.specular = new BABYLON.Color3(0.1, 0.1, 0.2);

        // Directional light for dramatic effect
        const directionalLight = new BABYLON.DirectionalLight(
            "directional",
            new BABYLON.Vector3(0.5, -1, 0.3),
            this.scene
        );
        directionalLight.intensity = 0.8;
        directionalLight.diffuse = new BABYLON.Color3(1, 1, 1);
        directionalLight.specular = new BABYLON.Color3(0.8, 0.8, 1);

        // Point light for accent (optional, based on performance)
        if (!this.isMobileDevice()) {
            const pointLight = new BABYLON.PointLight(
                "accent",
                new BABYLON.Vector3(0, 5, 0),
                this.scene
            );
            pointLight.intensity = 0.6;
            pointLight.diffuse = new BABYLON.Color3(0.9, 0.3, 0.3);
        }

        console.log('💡 Optimized lighting setup complete');
    }

    /**
     * Create materials based on concept art analysis
     */
    createConceptBasedMaterials() {
        // Letter material with glow effect
        const letterMaterial = new BABYLON.PBRMaterial("letterMaterial", this.scene);
        letterMaterial.baseColor = new BABYLON.Color3(1, 1, 1); // White letters
        letterMaterial.emissiveColor = new BABYLON.Color3(0.9, 0.3, 0.3); // Red glow
        letterMaterial.emissiveIntensity = 0.3;
        letterMaterial.metallicFactor = 0.2;
        letterMaterial.roughnessFactor = 0.1;
        letterMaterial.clearCoat = new BABYLON.PBRClearCoatConfiguration();
        letterMaterial.clearCoat.intensity = 0.8;
        letterMaterial.clearCoat.roughness = 0.1;

        // Background material
        const backgroundMaterial = new BABYLON.PBRMaterial("backgroundMaterial", this.scene);
        backgroundMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.2); // Dark blue
        backgroundMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);
        backgroundMaterial.emissiveIntensity = 0.1;

        // Store materials for use
        this.materials = {
            letter: letterMaterial,
            background: backgroundMaterial
        };

        console.log('🎨 Concept-based materials created');
    }

    /**
     * Add atmospheric particles (performance optimized)
     */
    addAtmosphericParticles() {
        const particleCount = this.isMobileDevice() ? 25 : 50;
        
        const atmosphericParticles = new BABYLON.ParticleSystem("atmospheric", particleCount, this.scene);
        
        // Use simple texture
        atmosphericParticles.particleTexture = new BABYLON.Texture("flare.png", this.scene);
        
        // Particle properties
        atmosphericParticles.minSize = 0.1;
        atmosphericParticles.maxSize = 0.2;
        atmosphericParticles.minLifeTime = 2.0;
        atmosphericParticles.maxLifeTime = 4.0;
        
        // Colors from concept analysis
        atmosphericParticles.color1 = new BABYLON.Color4(0.9, 0.3, 0.3, 1.0); // Red glow
        atmosphericParticles.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0); // White
        atmosphericParticles.colorDead = new BABYLON.Color4(0.1, 0.1, 0.2, 0.0); // Fade to dark
        
        // Emission area
        atmosphericParticles.createSphericEmitter(10);
        atmosphericParticles.minEmitPower = 0.1;
        atmosphericParticles.maxEmitPower = 0.3;
        
        // Start the particle system
        atmosphericParticles.start();
        
        console.log(`✨ Atmospheric particles added (${particleCount} particles)`);
    }

    /**
     * Apply post-processing effects (limited for performance)
     */
    applyPostProcessing() {
        const postProcessingLevel = this.isMobileDevice() ? 1 : 3;
        
        if (postProcessingLevel >= 1) {
            // Bloom effect for glow
            const bloomEffect = new BABYLON.BloomEffect("bloom", this.scene, 0.6, 0.8, 64);
            this.scene.imageProcessingConfiguration.addEffect(bloomEffect);
        }
        
        if (postProcessingLevel >= 2) {
            // Glow layer for additional glow
            const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
            glowLayer.intensity = 0.8;
            glowLayer.blurKernelSize = 64;
        }
        
        if (postProcessingLevel >= 3) {
            // Chromatic aberration for atmospheric effect
            const chromaticAberration = new BABYLON.ChromaticAberrationPostProcess("chromatic", 1.0, this.scene.activeCamera);
            chromaticAberration.radialIntensity = 0.2;
        }
        
        console.log(`🎭 Post-processing applied (level ${postProcessingLevel})`);
    }

    /**
     * Detect mobile device for optimization
     */
    isMobileDevice() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Get performance optimization tips
     */
    getOptimizationTips() {
        return {
            lighting: "Use limited light sources, prefer ambient lighting",
            particles: "Keep particle count low (50-100 max)",
            materials: "Use simple PBR materials, avoid complex shaders",
            geometry: "Use instanced meshes for repeated elements",
            postProcessing: "Limit to 2-3 effects maximum",
            mobile: "Disable shadows, reduce particle count by 50%"
        };
    }

    /**
     * Apply to existing game objects
     */
    applyToGameObjects(gameObjects) {
        if (gameObjects.letters) {
            gameObjects.letters.forEach(letter => {
                letter.material = this.materials.letter;
            });
        }
        
        if (gameObjects.background) {
            gameObjects.background.material = this.materials.background;
        }
        
        console.log('🎮 SIMA environment applied to game objects');
    }
}

// Export for use in other files
window.SIMAImplementation = SIMAImplementation; 