import { Sprite } from "pixi.js";
import * as PIXI from 'pixi.js';
import TexturesGenerator from "../../Textures/TexturesGenerator";
import { getColor, getColorLighten } from "../../utils/helpers";
import { RGB, Subtype, Location, CellType, IMainGameObject, RemoveType } from "../types";
import GameSettings from '../../Settings/Settings';

export default class Ejected extends Sprite implements IMainGameObject {
  public type: CellType = 'EJECTED';
  public subtype: Subtype;
  public culled: boolean = false;
  public isVisible: boolean = true;
  public newLocation: Location;
  public isPlayerCell: boolean = false;
  public isDestroyed: boolean = false;

  private removing: boolean = false;
  private removeType: RemoveType;
  private SIZE: number;

  constructor(/* public location: Location, public color: RGB, public subtype: Subtype */) {
    super(TexturesGenerator.cell);
    // this.reuse(location, color, subtype);
  }

  public reuse(location: Location, color: RGB, subtype: Subtype): void {
    const { colorLighten, oneColoredColor } = GameSettings.all.settings.theming.cells;
    const { oneColored } = GameSettings.all.settings.game.cells;

    this.subtype = subtype;
    this.x = location.x;
    this.y = location.y;
    this.width = this.height = this.SIZE = location.r * 2;
    this.newLocation = location;
    
    if (oneColored) {
      this.tint = getColor(oneColoredColor);
    } else {
      this.tint = getColorLighten(colorLighten, color);
    }

    this.removing = false;
    this.isDestroyed = false;
    this.isPlayerCell = false;
    this.isVisible = true;
    this.renderable = true;
    this.culled = false;
    this.alpha = 1;
  }

  public update(location: Location): void {
    this.newLocation.x = location.x;
    this.newLocation.y = location.y;
    this.newLocation.r = location.r * 2;
  }

  public setIsVisible(value: boolean): void {
    this.isVisible = value;
  }

  private getAnimationSpeed(): number {
    return (GameSettings.all.settings.game.gameplay.animationSpeed / 1000) * PIXI.Ticker.shared.deltaTime;
  }

  private getFadeSpeed(): number {
    const { fadeSpeed } = GameSettings.all.settings.game.cells;

    if (fadeSpeed === 0) {
      return 0;
    }

    return ((250 - fadeSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
  }

  private getSoakSpeed(): number {
    const { soakSpeed } = GameSettings.all.settings.game.cells;

    if (soakSpeed === 0) {
      return 0;
    }

    return ((250 - soakSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
  }

  private animateOutOfView(): void {
    const fadeSpeed = this.getFadeSpeed();

    if (this.alpha <= 0 || fadeSpeed === 0) {
      this.isDestroyed = true;
    } else {
      this.alpha += -fadeSpeed;
    }
  }

  private fullDestroy(): void {
    this.isDestroyed = true;
  }

  private animateEaten(speed: number): void {
    const fadeSpeed = this.getFadeSpeed();
    const soakSpeed = this.getSoakSpeed();

    if (!this.isVisible) {
      this.fullDestroy();
      return;
    }

    if (soakSpeed !== 0) {
      if (this.width > 1) {
        const newSize = -(this.width * soakSpeed);

        this.width += newSize;
        this.height += newSize;

        this.alpha += (this.width / this.SIZE);
      } else {
        this.fullDestroy();
      }
    } else {
      if (fadeSpeed === 0) {
        this.fullDestroy();
        return;
      } 

      if (this.alpha > 0) {
        this.alpha += -fadeSpeed;
      } else {
        this.fullDestroy();
      }
    }
  }

  private animateMove(speed: number): void { 
    const { transparency } = GameSettings.all.settings.theming.cells;

    const fadeSpeed = this.getFadeSpeed();

    const x = (this.newLocation.x - this.x) * speed;
    const y = (this.newLocation.y - this.y) * speed;

    this.x += x;
    this.y += y;

    if (!this.isVisible) {
      if (this.alpha > 0 && fadeSpeed !== 0) {
        this.alpha += -fadeSpeed;
      } else {
        this.alpha = 0;
        this.visible = false;
        this.renderable = false;
      }
    } else {
      this.visible = true;
      this.renderable = true;

      if (this.alpha < transparency && fadeSpeed !== 0) {
        this.alpha += fadeSpeed;
      } else {
        this.alpha = transparency;
      }
    }
  }

  public animate(): void {
    const speed = this.getAnimationSpeed();

    if (this.removing) {
      if (this.removeType === 'REMOVE_CELL_OUT_OF_VIEW') {
        this.animateOutOfView();
      } else if (this.removeType === 'REMOVE_EATEN_CELL') {
        this.animateEaten(speed);
      }
    } else { 
      if (this.culled) {
        this.visible = false;
        this.renderable = false;
        this.x = this.newLocation.x;
        this.y = this.newLocation.y;
      } else {
        this.animateMove(speed);
      }
    }
  }

  public remove(type: RemoveType): void {
    this.removing = true;
    this.removeType = type;
  }
}