import { Container, Sprite } from "pixi.js";
import GameSettings from "../Settings/Settings";
import { CellType, Location, Subtype } from "./types";
import TextureGenerator from "../Textures/TexturesGenerator";
import * as PIXI from 'pixi.js';

class RemoveAnimation extends Container {
  public readonly subtype: Subtype;
  public isDestroyed: boolean;
  public isVisible: boolean;
  public type: CellType;
  public culled: boolean = false;

  private r: number;
  private spriteBuffer: Array<Sprite> = [];

  constructor(location: Location, subtype: Subtype, tint: number) {
    super();
    this.type = 'REMOVE_ANIMATION';

    const { x, y, r } = location;
    const { cellRemoveAnimation } = GameSettings.all.settings.game.effects;

    switch (cellRemoveAnimation) {
      case 'Default':
        this.spriteBuffer.push(new Sprite(TextureGenerator.removeEffect));
        break;

      case '2CL':
        this.spriteBuffer.push(new Sprite(TextureGenerator.removeAnimationHSLO3D));
        break;

      case 'Acimazis':
        TextureGenerator.removeAnimationsAcim.forEach((texture) => this.spriteBuffer.push(new Sprite(texture)));
        break;

      case 'Yue':
        TextureGenerator.removeAnimationYue.forEach((texture) => this.spriteBuffer.push(new Sprite(texture)));
        break;
    }

    this.spriteBuffer.forEach((sprite) => {
      sprite.anchor.set(0.5);
      sprite.tint = tint;
      sprite.width = sprite.height = 0;
    });

    this.addChild(...this.spriteBuffer);  

    this.x = x; 
    this.y = y;
    this.zIndex = 0;
    this.subtype = subtype;
    this.r = r * 1.1;
  }

  private getStep(): number {
    const { deltaTime } = PIXI.Ticker.shared;
    return this.r * 0.0078 * deltaTime;
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
      sprite.width += step;
      sprite.height += step;
      sprite.alpha = alpha;

      if (i % 2 === 0) {
        sprite.rotation += 0.0075 * deltaTime;
      } else {
        sprite.rotation -= 0.0075 * deltaTime;
      }
    });
  }

  public setIsVisible(value: boolean): void {
    this.visible = value;
  }
}

export default RemoveAnimation;