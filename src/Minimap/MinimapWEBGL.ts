import { Container, Graphics } from 'pixi.js';
import { CellType, Location, RemoveType, RGB, Subtype } from '../objects/types';
import World from '../render/World';
import GameSettings from '../Settings/Settings';
import { IGhostCell } from '../tabs/Socket/Receiver';

import GhostCells from './GhostCells';
import RealPlayersCells from './RealCells';
import StaticPlayerCells from './MyStaticCells';
import Viewports from './Viewports';
import TeamPlayers from './TeamPlayers';
import { getColor } from '../utils/helpers';

export default class MinimapWEBGL extends Container {
  
  private graphics: Graphics;

  public ghostCells: GhostCells;
  public realPlayersCells: RealPlayersCells;
  public staticPlayerCells: StaticPlayerCells;
  public viewports: Viewports;
  public teamPlayers: TeamPlayers;
  
  constructor(public world: World) {
    super();

    this.graphics = new Graphics();
    this.graphics.zIndex = -10;
    this.addChild(this.graphics);
    this.updateBackgroundColor();
    this.updatePositionAndSize();

    this.viewports = new Viewports(world);
    this.ghostCells = new GhostCells(world);
    this.realPlayersCells = new RealPlayersCells(world);
    this.teamPlayers = new TeamPlayers(world);
    this.staticPlayerCells = new StaticPlayerCells(world);

    this.addChild(
      this.viewports,
      this.ghostCells,
      this.realPlayersCells,
      this.teamPlayers,
      this.staticPlayerCells,
    );
  }

  private updatePositionAndSize(): void {
    const { size } = GameSettings.all.settings.theming.minimap;
    this.x = this.world.scene.app.view.width - size;
    this.y = this.world.scene.app.view.height - size;
  }

  public updateBackgroundColor(): void {
    const { backgroundColor, size } = GameSettings.all.settings.theming.minimap;

    this.graphics.clear();
    this.graphics.beginFill(getColor(backgroundColor), backgroundColor.alpha);
    this.graphics.drawRect(0, 0, size, size);
  }

  public changeVirusTexture(): void {
    this.realPlayersCells.changeVirusTexture();
  }

  public changeCellShadowTexture(): void {
    this.realPlayersCells.changeCellShadowTexture();
    this.staticPlayerCells.changeCellShadowTexture();
    this.ghostCells.changeCellShadowTexture();
    this.teamPlayers.changeCellShadowTexture();
  }

  public renderFrame(): void {
    this.visible = GameSettings.all.settings.game.minimap.enabled;

    this.updatePositionAndSize();
    this.updateBackgroundColor();

    this.realPlayersCells.renderTick();
    this.staticPlayerCells.renderTick();
    this.teamPlayers.renderTick();
    this.viewports.renderTick();
  }

  public reset(): void {
    this.realPlayersCells.reset();
    this.teamPlayers.reset();
    this.ghostCells.reset();
  }

  public addRealPlayerCell(id: number, location: Location, color: RGB, name: string, type: CellType, subtype: Subtype, skin?: string): void {
    this.realPlayersCells.add(id, location, color, name, type, subtype, skin);
  }

  public updateRealPlayerCell(id: number, location: Location): void {
    this.realPlayersCells.update(id, location);
  }

  public removeRealPlayerCell(id: number, removeType: RemoveType): void {
    this.realPlayersCells.remove(id, removeType);
  }

  public updateGhostCells(cells: Array<IGhostCell>): void {
    this.ghostCells.update(cells);
  }
} 