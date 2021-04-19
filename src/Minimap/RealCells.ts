import { Container } from "pixi.js";
import Cell from "../objects/Cell/index";
import { CellType, Location, RemoveType, RGB, Subtype } from "../objects/types";
import Virus from "../objects/Virus/Virus";
import World from "../render/World";
import GameSettings from "../Settings/Settings";
import TextureGenerator from '../Textures/TexturesGenerator';

export default class RealPlayersCells extends Container {
  private buffer: Map<number, Cell | Virus>;
  private lastRenderTime: number = 0;

  constructor(private world: World) {
    super();

    this.zIndex = 900;
    this.sortableChildren = true;

    this.buffer = new Map();
  }

  private transformLocation(location: Location, shift?: boolean): Location {
    const { size } = GameSettings.all.settings.theming.minimap;
    const { minX, minY } = this.world.view.firstTab.mapOffsets;

    const offsetX = !shift ? minX : -7071;
    const offsetY = !shift ? minY : -7071;

    return {
      x: (location.x - offsetX)  / 14142 * size,
      y: (location.y - offsetY) / 14142 * size,
      r: location.r / 14142 * size
    }
  }

  private renderCells(): void {
    this.lastRenderTime = Date.now();

    for (let i = 0; i < this.children.length; i++) {
      const obj = this.children[i] as Cell | Virus;

      obj.animate();   

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
    if (!GameSettings.all.settings.game.minimap.realPlayersCells) {
      return;
    }

    if (subtype === 'TOP_ONE_TAB') {

      if (type === 'CELL') {

        const cell = new Cell(subtype, this.transformLocation(location), color, name, skin, this.world);

        cell.setIsVisible(true);
        cell.setIsMinimapCell();

        this.buffer.set(id, cell);
        this.addChild(cell);

      } else if (type === 'VIRUS') {

        location = this.transformLocation(location);

        const virus = new Virus(location, subtype);

        virus.setIsMinimap(location.r);

        this.buffer.set(id, virus);
        this.addChild(virus);

      }
    }
  }
  
  public remove(id: number, removeType: RemoveType): void {
    if (!GameSettings.all.settings.game.minimap.realPlayersCells) {
      return;
    }

    const removeImmediately = Date.now() - this.lastRenderTime >  100;

    if (this.buffer.has(id)) {
      const obj = this.buffer.get(id);

      if (removeImmediately) {
        this.buffer.delete(id);
        this.removeChild(obj);
        obj.destroy({ children: true });
      } else {
        obj.remove(removeType);
      }

      this.buffer.delete(id);
    }
  }

  public update(id: number, location: Location): void {
    if (!GameSettings.all.settings.game.minimap.realPlayersCells) {
      return;
    }

    if (this.buffer.has(id)) {
      this.buffer.get(id).update(this.transformLocation(location));
    }
  }

  public renderTick(): void {
    if (GameSettings.all.settings.game.minimap.realPlayersCells) {
      this.renderCells();
    } else {
      if (this.children.length) {
        this.reset();
      }
    }
  }

  public reset(): void {
    this.buffer.forEach((obj) => obj.destroy({ children: true }));
    this.buffer.clear();

    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
  }
}