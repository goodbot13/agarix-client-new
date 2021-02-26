import { Container, Sprite } from "pixi.js";
import GameSettings from "../Settings/Settings";
import TextureGenerator from "../Textures/TexturesGenerator";
import { CellType, Location } from "./types";
import * as PIXI from 'pixi.js';

class SpawnAnimation extends Container {
  public isDestroyed: boolean;
  public type: CellType;
  private r: number;
  private spriteBuffer: Array<Sprite> = [];
  private deltaStepMultiplier: number = 0.00425;

  constructor(location: Location, tint?: number) {
    super();

    const { spawnAnimation } = GameSettings.all.settings.game.effects;

    if (spawnAnimation === 'Default') {
      this.spriteBuffer.push(new Sprite(TextureGenerator.removeEffect));
    } else if (spawnAnimation === 'Acimazis') {
      for (let i = 0; i < TextureGenerator.removeAnimationsAcim.length; i++) {
        this.spriteBuffer.push(new Sprite(TextureGenerator.removeAnimationsAcim[i]));
      }
    } else if (spawnAnimation === '2CL') {
      this.spriteBuffer.push(new Sprite(TextureGenerator.removeAnimationHSLO3D));
    } else if (spawnAnimation === 'Yue') {
      for (let i = 0; i < TextureGenerator.removeAnimationYue.length; i++) {
        this.spriteBuffer.push(new Sprite(TextureGenerator.removeAnimationYue[i]));
      }
    }

    this.spriteBuffer.forEach((sprite) => {
      sprite.anchor.set(0.5);
      sprite.tint = tint ? tint : 0xFFFFFF;
      sprite.width = 0;
      sprite.height = 0;
      sprite.alpha = 0;
    });

    this.addChild(...this.spriteBuffer);
    
    this.type = 'SPAWN_ANIMATION';
    this.zIndex = 0;
    this.x = location.x; 
    this.y = location.y;
    this.r = 3300;
  }

  private getStep(): number {
    const { deltaTime } = PIXI.Ticker.shared;
    return this.r * this.deltaStepMultiplier * deltaTime;
  }

  public setIsMinimap(value: boolean): void {
    this.r = 85;
  }

  public animate(): void {
    if (this.spriteBuffer[0].width >= this.r) {
      this.destroy({ children: true });
      this.isDestroyed = true;
      return;
    }

    const { deltaTime } = PIXI.Ticker.shared;

    const step = this.getStep();
    const alpha = (this.r - this.spriteBuffer[0].width) / this.r;

    this.spriteBuffer.forEach((sprite, i) => {
      sprite.alpha = alpha;
      sprite.width += step;
      sprite.height += step;

      if (i % 2 === 0) {
        sprite.rotation += 0.0075 * deltaTime;
      } else {
        sprite.rotation -= 0.0075 * deltaTime;
      }
    });
  }
}

export default SpawnAnimation;