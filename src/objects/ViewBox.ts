import { Sprite } from 'pixi.js';
import TextureGenerator from '../Textures/TexturesGenerator';
import * as PIXI from 'pixi.js';

class ViewBox extends Sprite {
  constructor() {
    super(TextureGenerator.viewBox);
    this.x = 0;
    this.y = 0;
  }

  public animate(left: number, top: number, width: number, height: number): void {
    const { deltaTime } = PIXI.Ticker.shared;
    const animationSpeed = 1.5 / 30;

    this.x += (left - this.x) * animationSpeed * deltaTime;
    this.y += (top - this.y) * animationSpeed * deltaTime;
    this.width += (width - this.width) * animationSpeed * deltaTime;
    this.height += (height - this.height) * animationSpeed * deltaTime;
  }
}

export default ViewBox;
