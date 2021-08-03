import { Container } from "pixi.js";
import Cell from "../objects/Cell/index";
import { CellType, Location, RemoveType, RGB, Subtype } from "../objects/types";
import Virus from "../objects/Virus/Virus";
import World from "../render/World";
import { transformMinimapLocation } from "../utils/helpers";

export default class RealPlayersCells extends Container {
  private buffer: Map<number, Cell | Virus>;
  private lastRenderTime: number = 0;

  constructor(private world: World) {
    super();

    this.zIndex = 900;
    this.sortableChildren = true;

    this.buffer = new Map();
  }

  private renderCells(): void {
    this.lastRenderTime = Date.now();
    
    const animationSpeed = this.world.animationSettingsProvider.getAnimationSpeed();
    const fadeSpeed = this.world.animationSettingsProvider.getFadeSpeed();
    const soakSpeed = this.world.animationSettingsProvider.getSoakSpeed();
    
    for (let i = 0; i < this.children.length; i++) {
      const obj = this.children[i] as Cell | Virus;

      obj.animate(animationSpeed, fadeSpeed, soakSpeed);   

      if (obj.isDestroyed) {
        this.removeChild(obj);
      }
    }
  }

  public changeVirusTexture(): void {
    const buffer = [...this.children, this.buffer];

    buffer
      .filter((obj: any) => obj.type === 'VIRUS')
      .forEach((virus) => (virus as Virus).updateTexture());
  }

  public changeCellShadowTexture(): void {
    const buffer = [...this.children, this.buffer];

    buffer
      .filter((obj: any) => obj.type === 'CELL')
      .forEach((cell) => (cell as Cell).changeShadowTexture());
  }

  public add(id: number, location: Location, color: RGB, name: string, type: CellType, subtype: Subtype, skin?: string): void {
    if (!this.world.settings.all.settings.game.minimap.realPlayersCells) {
      return;
    }

    if (subtype === 'FIRST_TAB' || subtype === 'SECOND_TAB') {
      return;
    }

    if (type === 'CELL') {
      const loc = transformMinimapLocation(
        location, 
        this.world.view.firstTab.getShiftedMapOffsets(),
        this.world.settings
      );
      const cell = new Cell(this.world);
      cell.reuse(subtype, loc, color, name, skin, this.world);

      cell.setIsVisible(true);
      cell.setIsMinimapCell(location.r);

      this.buffer.set(id, cell);
      this.addChild(cell);
    } else if (type === 'VIRUS') {
      location = transformMinimapLocation(
        location, 
        this.world.view.firstTab.getShiftedMapOffsets(),
        this.world.settings
      );

      const virus = new Virus(location, subtype, this.world);

      virus.setIsMinimap(location.r);

      this.buffer.set(id, virus);
      this.addChild(virus);
    }
  }
  
  public remove(id: number, removeType: RemoveType): void {
    if (!this.world.settings.all.settings.game.minimap.realPlayersCells) {
      return;
    }

    const removeImmediately = Date.now() - this.lastRenderTime >  100;

    if (this.buffer.has(id)) {
      const obj = this.buffer.get(id);

      if (removeImmediately) {
        this.buffer.delete(id);
        this.removeChild(obj);
        
        if (obj.type === 'CELL') {
          this.world.cachedObjects.addCell(obj as Cell);
        }
      } else {
        obj.remove(removeType);
      }

      this.buffer.delete(id);
    }
  }

  public update(id: number, location: Location): void {
    if (!this.world.settings.all.settings.game.minimap.realPlayersCells) {
      return;
    }

    if (this.buffer.has(id)) {
      const loc = transformMinimapLocation(
        location, 
        this.world.view.firstTab.getShiftedMapOffsets(),
        this.world.settings
      );
      this.buffer.get(id).update(loc);
    }
  }

  public renderTick(): void {
    if (this.world.settings.all.settings.game.minimap.realPlayersCells) {
      this.renderCells();
    } else {
      if (this.children.length) {
        this.reset();
      }
    }
  }

  public reset(): void {
    this.buffer.forEach((obj) => {
      if (obj.type === 'CELL') {
        this.world.cachedObjects.addCell(obj as Cell);
      } else {
        obj.destroy({ children: true })
      }
    });

    this.buffer.clear();

    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
  }
}