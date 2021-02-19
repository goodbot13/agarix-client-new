import { Container, Sprite } from "pixi.js";
import GameSettings from "../../Settings/Settings";
import { Location, Subtype, RemoveType, CellType, IMainGameObject } from "../types";
import VirusShots from "./VirusShots";
import World from "../../render/World";
import * as PIXI from 'pixi.js';

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

  private shots: VirusShots;
  private world: World;
  private sizeOffset: number;
  private SPEED: number = 0.065;

  constructor(location: Location, subtype: Subtype, world: World) {
    super();

    this.world = world;

    this.type = 'VIRUS';
    this.virus = new Sprite(world.textureGenerator.virus);
    this.virus.anchor.set(0.5);
    this.addChild(this.virus);

    this.shots = new VirusShots(world.textureGenerator);
    this.addChild(this.shots);

    const { x, y, r } = location;

    this.subtype = subtype;
    this.removing = false;
    this.removeType = null;
    this.newLocation.x = x;
    this.newLocation.y = y;
    this.newLocation.r = r;

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

  public setIsMinimap(value: boolean, size: number): void {
    size *= 2;
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

  private animateOutOfView() {
    if (GameSettings.all.settings.game.multibox.enabled && this.world.view.firstTab.isPlaying && this.world.view.secondTab.isPlaying) {
      this.destroy({ children: true });
      this.isDestroyed = true;
    } else if (this.alpha <= 0) {
      this.destroy({ children: true });
      this.isDestroyed = true;
    } else {
      this.alpha -= (this.SPEED * PIXI.Ticker.shared.deltaTime);
    }
  }

  private animateEaten(): void  {
    if (this.width > 1) {
      const step = this.newLocation.r * this.SPEED * PIXI.Ticker.shared.deltaTime;

      this.width -= step;
      this.height -= step;
      this.zIndex = this.originalSize;
    } else {
      this.destroy({ children: true });
      this.isDestroyed = true;
    }
  }

  private getAnimationSpeed(): number {
    return 0.11 + 0.002 * GameSettings.all.settings.game.gameplay.animationSpeed * PIXI.Ticker.shared.deltaTime;
  }
  
  private animateMove(): void  {
    const { deltaTime } = PIXI.Ticker.shared;
    const instantAnimation = GameSettings.all.settings.game.multibox.enabled && 
                             this.world.view.firstTab.isPlaying && 
                             this.world.view.secondTab.isPlaying && 
                             GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map';

    let x = (this.newLocation.x - this.x) * this.getAnimationSpeed();
    let y = (this.newLocation.y - this.y) * this.getAnimationSpeed();
    
    this.x += x;
    this.y += y;
    this.zIndex = this.originalSize;

    if (instantAnimation) {
      this.alpha = 1;
    } else if (this.alpha < 1) {
      this.alpha += (this.SPEED * deltaTime);
    } else {
      this.alpha = 1;
    }

    this.shots.animate();
  }

  public animate(): void  {
    const { deltaTime } = PIXI.Ticker.shared;

    this.virus.rotation += 0.005 * deltaTime;
    this.originalSize += (this.newOriginalSize - this.originalSize) * this.getAnimationSpeed();

    if (this.removing) {
      if (this.removeType === 'REMOVE_CELL_OUT_OF_VIEW') {
        this.animateOutOfView();
      } else if (this.removeType === 'REMOVE_EATEN_CELL') {
        this.animateEaten();
      }
    } else {
      this.animateMove();
    }
  }

  public setIsVisible(value: boolean): void {
    this.visible = value;
    this.isVisible = false;
  }
}

export default Virus;