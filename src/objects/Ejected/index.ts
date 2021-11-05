import { Sprite } from "pixi.js";
import { getColor, getColorLighten } from "../../utils/helpers";
import { RGB, Subtype, Location, CellType, IMainGameObject, RemoveType, Vector } from "../types";
import Cell from "../Cell";
import World from "../../render/World";

export default class Ejected extends Sprite implements IMainGameObject {
  public type: CellType = 'EJECTED';
  public subtype: Subtype;
  public culled: boolean = false;
  public isVisible: boolean = true;
  public newLocation: Location;
  public isPlayerCell: boolean = false;
  public isDestroyed: boolean = false;

  private eatenBy: Vector = { x: 0, y: 0 };
  private removing: boolean = false;
  private removeType: RemoveType;
  private SIZE: number;

  constructor(private world: World, location: Location, color: RGB, subtype: Subtype) {
    super(world.textureGenerator.cell);
    this.anchor.set(0.5);

    const { colorLighten, oneColoredColor } = this.world.settings.all.settings.theming.cells;
    const { oneColored } = this.world.settings.all.settings.game.cells;

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
    this.eatenBy = { x: 0, y: 0 };
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

  private animateOutOfView(fadeSpeed: number): void {
    this.alpha += -fadeSpeed;

    if (this.alpha <= 0 || fadeSpeed === 0) {
      this.isDestroyed = true;
      this.alpha = 0;
    } 
  }
  
  private animateEaten(fadeSpeed: number, soakSpeed: number, animationSpeed: number): void {
    if (!this.isVisible) {
      this.isDestroyed = true;
      return;
    }

    if (soakSpeed !== 0) {
      const newSize = -(this.width * soakSpeed);

      this.width += newSize;
      this.height += newSize;

      if (this.world.settings.all.settings.game.cells.soakToEaten) {
        const x = (this.eatenBy.x - this.x) * (animationSpeed / 5);
        const y = (this.eatenBy.y - this.y) * (animationSpeed / 5);

        this.x += x;
        this.y += y;
      }

      this.alpha += (this.width / this.SIZE);

      if (this.width <= 5) {
        this.isDestroyed = true;
      }
    } else {
      if (fadeSpeed === 0) {
        this.isDestroyed = true;
        return;
      } 

      this.alpha += -fadeSpeed;

      if (this.alpha <= 0) {
        this.isDestroyed = true;
      }
    }
  }

  private animateMove(animationSpeed: number, fadeSpeed: number): void { 
    const { transparency } = this.world.settings.all.settings.theming.cells;

    const x = (this.newLocation.x - this.x) * animationSpeed;
    const y = (this.newLocation.y - this.y) * animationSpeed;

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

  public animate(animationSpeed: number, fadeSpeed: number, soakSpeed: number): void {
    if (this.removing) {
      if (this.removeType === 'REMOVE_CELL_OUT_OF_VIEW') {
        this.animateOutOfView(fadeSpeed);
      } else if (this.removeType === 'REMOVE_EATEN_CELL') {
        this.animateEaten(fadeSpeed, soakSpeed, animationSpeed);
      }
    } else { 
      if (this.culled) {
        this.visible = false;
        this.renderable = false;
        this.x = this.newLocation.x;
        this.y = this.newLocation.y;
      } else {
        this.animateMove(animationSpeed, fadeSpeed);
      }
    }
  }

  public remove(type: RemoveType, eatenBy?: Cell): void {
    this.removing = true;
    this.removeType = type;
    
    if (eatenBy) {
      this.eatenBy.x = eatenBy.x;
      this.eatenBy.y = eatenBy.y;
    }
  }
}