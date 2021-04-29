import { Container } from 'pixi.js';
import Cell from '../objects/Cell/index';
import { Location } from '../objects/types';
import World from '../render/World';
import GameSettings from '../Settings/Settings';
import { IGhostCell } from '../tabs/Socket/Receiver';
import { getColor, transformMinimapLocation } from '../utils/helpers';

export default class GhostCells extends Container {
  private buffer: Array<Cell>;

  constructor(private world: World) {
    super();

    this.sortableChildren = true;
    this.zIndex = -7;

    this.create();
  }

  private create(): void {
    const { ghostCellsColor } = GameSettings.all.settings.theming.minimap;

    this.buffer = new Array(20).fill({} as Cell).map(() => {
      const cell = new Cell(
        'TOP_ONE_TAB',
        { x: 0, y: 0, r: 0 },
        ghostCellsColor,
        '',
        '',
        this.world,
      );
      cell.setIsMinimapCell();
      cell.cell.tint = getColor(ghostCellsColor);
      cell.shadow.sprite.visible = false;
      cell.shadow.sprite.renderable = false;

      return cell;
    });

    this.addChild(...this.buffer);
  }

  public update(cells: Array<IGhostCell>): void {
    const { ghostCells, realPlayersCells } = GameSettings.all.settings.game.minimap;

    if (!ghostCells) {
      this.visible = false;
      this.renderable = false;
      return;
    } else {
      this.visible = true;
      this.renderable = true;
    }

    let i = 0;

    cells.forEach((cell) => {
      if (
        realPlayersCells &&
        this.world.view.topOneTab.hasInViewBounds(cell.playerX, cell.playerY, cell.totalMass / 2)
      ) {
        return;
      }

      const location = transformMinimapLocation(
        {
          x: cell.playerX,
          y: cell.playerY,
          r: cell.size * 2,
        },
        this.world.view.firstTab.mapOffsets,
      );

      this.buffer[i].visible = true;
      this.buffer[i].renderable = true;
      this.buffer[i].forceAnimateSet(location);

      i++;
    });

    // Make invisible cells that are not used.
    // Case: server has < 20 players
    for (let x = i; x < 20; x++) {
      this.buffer[x].visible = false;
      this.buffer[i].renderable = false;
    }
  }

  public changeCellShadowTexture(): void {
    this.buffer.forEach((cell) => (cell as Cell).changeShadowTexture());
  }

  public updateColor(): void {
    this.buffer.forEach(
      (cell) =>
        (cell.cell.tint = getColor(GameSettings.all.settings.theming.minimap.ghostCellsColor)),
    );
  }

  public reset(): void {
    this.buffer.forEach((cell) => (cell.visible = false));
  }
}
