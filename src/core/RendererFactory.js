// RendererFactory.js

import { Renderer2D } from './Renderer2D.js';
import { Renderer3D } from './Renderer3D.js';

export class RendererFactory {
  static createRenderer(mode, target) {
    if (mode === '2d') {
      return new Renderer2D(target);
    } else if (mode === '3d') {
      return new Renderer3D(target);
    } else {
      throw new Error(`Unknown renderer mode: ${mode}`);
    }
  }
}

export { Renderer2D, Renderer3D };
