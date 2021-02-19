import { Sprite } from 'pixi.js';
import GameSettings from '../Settings/Settings';
import { Subtype, Location, CellType } from './types';
import World from '../render/World';
import * as PIXI from 'pixi.js';

class Food extends Sprite {
  public readonly subtype: Subtype;
  public originalSize: number;
  public sizeOffset: number;
  public removing: boolean = false;
  public isDestroyed: boolean = false;
  public type: CellType;
  private world: World;
  private SIZE: number = 512;
  private SPEED: number = 0.0225;
  private realAlpha: number = 0;

  constructor(location: Location, subtype: Subtype, world: World) {
    super(world.textureGenerator.food);
    this.world = world;
    this.type = 'FOOD';

    const { x, y, r } = location;
    const { foodPerformanceMode } = GameSettings.all.settings.game.performance;

    this.anchor.set(0.5);
    this.originalSize = r * 2;
    this.subtype = subtype;
    this.x = x;
    this.y = y;
    this.width = foodPerformanceMode ? 512 : 0;
    this.height = foodPerformanceMode ? 512 : 0;
    this.alpha = foodPerformanceMode ? 1 : 0;
  }

  private getStep(): number {
    return this.SIZE * this.SPEED *  PIXI.Ticker.shared.deltaTime;
  }

  public hide(): void {
    this.alpha = 0;
    this.visible = false;
  }

  public show(fast?: boolean): void {
    this.visible = true;
    
    if (fast) {
      this.alpha = 1;
      this.realAlpha = 1;
      this.width = this.SIZE;
      this.height = this.SIZE;
    } else {
      this.alpha = this.realAlpha;
    }
  }

  public animate(): void {
    const dependency = this.world.view.firstTab.isPlaying && 
                       this.world.view.secondTab.isPlaying && 
                       GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map';

    const instantAnimation = GameSettings.all.settings.game.performance.foodPerformanceMode || dependency;

    if (this.removing) {

      // instantly remove & destroy 
      if (instantAnimation) {
        this.destroy();
        this.isDestroyed = true;
        return;
      }

      if (this.width <= 40) {

        // food is ready to be removed & destroyed
        this.destroy();
        this.isDestroyed = true;

      } else {

        // slowly decrease scale & alpha 
        const step = this.getStep();

        this.width -= step;
        this.height -= step;
        this.realAlpha = this.width / this.SIZE;
      }

    } else {

      // instantly set alpha & scale 
      if (instantAnimation) {
        this.realAlpha = 1;
        this.width = this.height = this.SIZE;
        return;
      }

      if (this.width >= this.SIZE) {

        // set capped values - food is fully animated
        this.realAlpha = 1;
        this.width = this.height = this.SIZE;

      } else {

        // need to animate scale & opacity
        const step = this.getStep();

        this.width += step;
        this.height += step;
        this.realAlpha = this.width / this.SIZE;
      }
    }
  }

  public update(location: Location): void { }

  public remove(): void {
    this.removing = true;
  }
}

export default Food;