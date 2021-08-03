import { Container, Sprite } from "pixi.js";
import { CellType, Location } from "./types";
import * as PIXI from 'pixi.js';
import World from "../render/World";

class SpawnAnimation extends Container {
  public isDestroyed: boolean;
  public type: CellType;
  public culled: boolean = false;

  private r: number;
  private spriteBuffer: Array<Sprite> = [];
  private deltaStepMultiplier: number = 0.00425;

  constructor(location: Location, private world: World, tint?: number) {
    super();

    const { spawnAnimation } = world.settings.all.settings.game.effects;

    switch (spawnAnimation) {
      case 'Default':
        this.spriteBuffer.push(new Sprite(this.world.textureGenerator.removeEffect));
        break;

      case '2CL':
        this.spriteBuffer.push(new Sprite(this.world.textureGenerator.removeAnimationHSLO3D));
        break;

      case 'Acimazis':
        this.world.textureGenerator.removeAnimationsAcim.forEach((texture) => this.spriteBuffer.push(new Sprite(texture)));
        break;

      case 'Yue':
        this.world.textureGenerator.removeAnimationYue.forEach((texture) => this.spriteBuffer.push(new Sprite(texture)));
        break;
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
    this.r = 3500;
  }

  private getStep(): number {
    const { deltaTime } = PIXI.Ticker.shared;
    return this.r * this.deltaStepMultiplier * deltaTime;
  }

  public setIsMinimap(): void {
    this.r = 88;
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
        sprite.rotation += 0.007 * deltaTime;
      } else {
        sprite.rotation -= 0.007 * deltaTime;
      }
    });
  }
}

export default SpawnAnimation;