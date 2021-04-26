import { Container, Sprite } from "pixi.js";
import GameSettings from "../../Settings/Settings";
import { Location, Subtype, RemoveType, CellType, IMainGameObject } from "../types";
import VirusShots from "./VirusShots";
import * as PIXI from 'pixi.js';
import PlayerState from "../../states/PlayerState";
import TextureGenerator from '../../Textures/TexturesGenerator';

class Virus extends Container implements IMainGameObject {
  public readonly subtype: Subtype;
  public originalSize: number;
  public isPlayerCell: boolean = false;
  public isDestroyed: boolean = false;
  public removing: boolean = false;
  public removeType: RemoveType = null;
  public newLocation: Location = { x: 0, y: 0, r: 0 };
  public newOriginalSize: number;
  public virusSprite: Sprite;
  public isVisible: boolean;
  public type: CellType;

  public shots: VirusShots;
  private isMinimap: boolean;
  private location: Location;

  constructor(location: Location, subtype: Subtype) {
    super();

    this.type = 'VIRUS';
    this.subtype = subtype;
    this.location = location;
    this.newLocation = location;

    this.virusSprite = new Sprite(TextureGenerator.virus);
    this.virusSprite.anchor.set(0.5);
    this.addChild(this.virusSprite);

    this.shots = new VirusShots(location.r);
    this.addChild(this.shots);

    const { x, y, r } = location;

    this.originalSize = r;
    this.newOriginalSize = r;

    this.setSize(r);
    this.x = x;
    this.y = y;    

    this.zIndex = this.originalSize;
    this.alpha = 0;
  }

  private getGlowDistance(): number {
    const { glow, glowDistance } = GameSettings.all.settings.theming.viruses;

    if (!glow) {
      return 0;
    }

    return glowDistance; 
  }

  private setSize(radius: number): void {
    const size = radius * 2 + this.getGlowDistance();
    this.width = this.height = size;
  }

  public updateTexture(): void {
    this.virusSprite.texture = TextureGenerator.virus;
    this.setSize(this.location.r);
  }

  public setIsMinimap(size: number): void {
    size *= 2.2;
    this.isMinimap = true;
    this.width = this.height = size;
    this.shots.visible = false;
    this.shots.renderable = false;
  }

  public update(location: Location): void {
    this.shots.update(location.r);
    this.newLocation = location;
  }

  public remove(removeType: RemoveType): void  {
    this.removing = true;
    this.removeType = removeType;
  }

  private animateOutOfView(speed: number) {
    if (GameSettings.all.settings.game.multibox.enabled && PlayerState.first.playing && PlayerState.second.playing) {
      this.destroy({ children: true });
      this.isDestroyed = true;
    } else if (this.alpha <= 0) {
      this.destroy({ children: true });
      this.isDestroyed = true;
    } else {
      this.alpha -= speed;
    }
  }

  private animateEaten(speed: number): void  {
    if (this.width > 1) {
      const step = this.newLocation.r * speed;

      this.width -= step;
      this.height -= step;
      this.zIndex = this.originalSize;
    } else {
      this.destroy({ children: true });
      this.isDestroyed = true;
    }
  }

  private getAnimationSpeed(): number {
    return (GameSettings.all.settings.game.gameplay.animationSpeed / 1000) * PIXI.Ticker.shared.deltaTime;
  }
  
  private animateMove(speed: number): void {
    const instantAnimation = GameSettings.all.settings.game.multibox.enabled && 
                             PlayerState.first.playing && 
                             PlayerState.second.playing && 
                             GameSettings.all.settings.game.gameplay.spectatorMode !== 'Full map';

    const glowOffset = this.isMinimap ? 4 : this.getGlowDistance();

    let x = (this.newLocation.x - this.x) * speed;
    let y = (this.newLocation.y - this.y) * speed;
    let r = ((this.newLocation.r * 2 + glowOffset) - this.width) * speed;

    this.width += r;
    this.height += r;
    this.x += x;
    this.y += y;
    this.zIndex = this.originalSize;

    if (instantAnimation) {
      this.alpha = 1;
    } else if (this.alpha < 1) {
      this.alpha += speed;
    } else {
      this.alpha = 1;
    }

    this.shots.animate();
  }

  public animate(): void {
    const speed = this.getAnimationSpeed();

    this.originalSize += (this.newOriginalSize - this.originalSize) * speed;

    if (this.removing) {
      if (this.removeType === 'REMOVE_CELL_OUT_OF_VIEW') {
        this.animateOutOfView(speed);
      } else if (this.removeType === 'REMOVE_EATEN_CELL') {
        this.animateEaten(speed);
      }
    } else {
      this.animateMove(speed);
    }
  }

  public setIsVisible(value: boolean): void {
    this.visible = value;
    this.renderable = value;
    this.isVisible = false;
  }
}

export default Virus;