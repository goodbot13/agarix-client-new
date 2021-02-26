import { Sprite } from "pixi.js";
import TextureGenerator from "../../Textures/TexturesGenerator";
import * as PIXI from 'pixi.js';

export default class VirusShots extends Sprite {
  private mass: number;
  private SPEED: number = 0.045;

  constructor() {
    super(TextureGenerator.virusShots);

    this.mass = 100;
    this.anchor.set(0.5);
    this.width = this.height = 100;
    this.alpha = 0.9;
  }

  public update(mass: number): void {
    this.mass = mass + (mass - 100) * 2;
  } 

  public animate() {
    const size = (this.mass - this.width) * this.SPEED * PIXI.Ticker.shared.deltaTime;
    this.width += size;
    this.height += size;
  }
}