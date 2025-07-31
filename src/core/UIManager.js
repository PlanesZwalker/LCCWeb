// UIManager.js

export class UIManager {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.components = {};
  }
  registerComponent(name, component) {
    this.components[name] = component;
  }
  getComponent(name) {
    return this.components[name];
  }
  renderAll(gameState) {
    // Render all registered UI components
  }
}
