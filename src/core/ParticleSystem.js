// ParticleSystem.js

export class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
  }
  spawnParticle(options) {
    // Add a new particle (stub)
    this.particles.push(options);
  }
  update(deltaTime) {
    // Update all particles (stub)
  }
  render() {
    // Render all particles (stub)
  }
  clear() {
    this.particles = [];
  }
}
