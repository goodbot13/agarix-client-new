import { Sprite } from "pixi.js";
import TextureGenerator from "../Textures";
import * as PIXI from 'pixi.js';
import GameSettings from "../Settings/Settings";

class ViewBox extends Sprite {
  constructor(textureGenerator: TextureGenerator) {
    super(textureGenerator.viewBox);
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