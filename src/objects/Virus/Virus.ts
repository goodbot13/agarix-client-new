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
  public removeType: RemoveType;
  public newLocation: Location = { x: 0, y: 0, r: 0 };
  public newOriginalSize: number;
  public virus: Sprite;
  public isVisible: boolean;
  public type: CellType;

  public shots: VirusShots;
  private sizeOffset: number;
  private isMinimap: boolean;

  constructor(location: Location, subtype: Subtype) {
    super();

    this.type = 'VIRUS';
    this.virus = new Sprite(TextureGenerator.virus);
    this.virus.anchor.set(0.5);
    this.addChild(this.virus);

    this.shots = new VirusShots();
    this.addChild(this.shots);

    const { x, y, r } = location;

    this.subtype = subtype;
    this.removing = false;
    this.removeType = null;
    this.newLocation = location;

    this.sizeOffset = 512 / r / 1.35;

    this.newLocation.r *= this.sizeOffset;
    this.originalSize = r;
    this.newOriginalSize = r;
    this.x = x;
    this.y = y;    
    this.virus.width = this.newLocation.r;
    this.virus.height = this.newLocation.r;
    this.zIndex = this.originalSize;
    this.alpha = 0;
  }

  private getSizes(): void {
    
  }

  public setIsMinimap(size: number): void {
    size *= 2;
    this.isMinimap = true;
    this.virus.width = this.virus.height = size;
    this.shots.visible = false;
  }

  public update(location: Location): void {
    const { x, y, r } = location;

    this.newLocation.x = x;
    this.newLocation.y = y;
    this.newLocation.r = r;

    this.newOriginalSize = r;
    this.sizeOffset = 512 / r / 1.35;
    this.newLocation.r *= this.sizeOffset;

    this.shots.update(r);
  }

  public remove(removeType: RemoveType): void  {
    this.removing = true;
    this.removeType = removeType;
    this.shots.update(0);
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

    let x = (this.newLocation.x - this.x) * speed;
    let y = (this.newLocation.y - this.y) * speed;
    
    
    if (!this.isMinimap) {
      let r = (this.newLocation.r - this.virus.width) * speed;
      this.virus.width += r;
      this.virus.height += r;
    }

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

  public animate(): void  {
    const { deltaTime } = PIXI.Ticker.shared;
    const speed = this.getAnimationSpeed();

    this.virus.rotation += 0.005 * deltaTime;
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
    this.isVisible = false;
  }
}

export default Virus;