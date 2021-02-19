import { Container } from "pixi.js";
import Globals from "../Globals";
import Cell from "../objects/Cell/index";
import { Location } from "../objects/types";
import SpawnAnimation from "../objects/SpawnAnimation";
import World from "../render/World";
import GameSettings from "../Settings/Settings";

export default class StaticPlayerCells extends Container {
  private firstTab: Cell;
  private secondTab: Cell;

  constructor(private world: World) {
    super();

    this.zIndex = 1000;
    this.sortableChildren = true;

    this.create();
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

  private create(): void {
    const { playerColor } = GameSettings.all.settings.theming.minimap;

    this.firstTab = new Cell('FIRST_TAB', { x: 0, y: 0, r: 0 }, playerColor, '', '', this.world);
    this.firstTab.setIsMinimapCell(true);
    this.firstTab.cell.tint = Globals.getColor(playerColor);
    this.addChild(this.firstTab);

    this.secondTab = new Cell('SECOND_TAB', { x: 0, y: 0, r: 0 }, playerColor, '', '', this.world); 
    this.secondTab.setIsMinimapCell(true);
    this.secondTab.cell.tint = Globals.getColor(playerColor);
    this.addChild(this.secondTab);
  }

  private animateFirstTab(): void {
    const { firstTab } = this.world.view;
    const { playerSize } = GameSettings.all.settings.theming.minimap;

    if (firstTab.isPlaying) {
      const { x, y } = this.transformLocation({ x: firstTab.viewport.x, y: firstTab.viewport.y, r: 0 });

      if (!this.firstTab.visible && GameSettings.all.settings.game.effects.spawnAnimation) {
        const animation = new SpawnAnimation({ x, y, r: 0 }, this.world.textureGenerator, this.firstTab.cell.tint);
        animation.setIsMinimap(true);
        this.addChild(animation);
      }

      this.firstTab.visible = true;
      this.firstTab.forceAnimateSet({ x, y, r: playerSize });

      /* if (Settings.minimap.drawRealPlayers) {
        if (
          firstTab.playerBox.mass > 300 && 
          topOneTab.hasInViewBounds(firstTab.viewport.x, firstTab.viewport.y, firstTab.playerBox.mass / 2)
        ) {
          this.playerCell.alpha = 0;
        } else {
          this.playerCell.alpha = 1;
        }
      } else {
        this.playerCell.alpha = 1;
      } */

    } else {
      this.firstTab.visible = false;
    }
  }

  private animateSecondTab(): void {
    const { secondTab } = this.world.view;
    const { playerSize } = GameSettings.all.settings.theming.minimap;

    if (this.world.view.secondTab.isPlaying) {
      const shift = secondTab.getShiftedViewport();
      const { x, y } = this.transformLocation({ x: shift.x, y: shift.y, r: 0 });

      if (!this.secondTab.visible && GameSettings.all.settings.game.effects.spawnAnimation) {
        const animation = new SpawnAnimation({ x, y, r: 0 }, this.world.textureGenerator, this.secondTab.cell.tint);
        animation.setIsMinimap(true);
        this.addChild(animation);
      }

      this.secondTab.visible = true;
      this.secondTab.forceAnimateSet({ x, y, r: playerSize });

      /* if (Settings.minimap.drawRealPlayers) {
        if (
          firstTab.playerBox.mass > 300 && 
          topOneTab.hasInViewBounds(secondTab.viewport.x, secondTab.viewport.y, secondTab.playerBox.mass / 2)
        ) {
          this.secondPlayerCell.alpha = 0;
        } else {
          this.secondPlayerCell.alpha = 1;
        }
      } else {
        this.secondPlayerCell.alpha = 1;
      } */

    } else {
      this.secondTab.visible = false;
    }
  }

  private animateSpawnAnimation(): void {
    this.children.forEach((child: Cell) => {
      if (child.type === 'SPAWN_ANIMATION') {
        child.animate();

        if (child.isDestroyed) {
          this.removeChild(child);
        }
      }
    });
  }

  public renderTick(): void {
    this.animateFirstTab();
    this.animateSecondTab();
    this.animateSpawnAnimation();
  }

  public updateColors(): void {
    const { playerColor } = GameSettings.all.settings.theming.minimap;

    this.firstTab.cell.tint = Globals.getColor(playerColor);
    this.secondTab.cell.tint = Globals.getColor(playerColor);
  }

  public changeCellShadowTexture(): void {
    this.firstTab.changeShadowTexture();
    this.secondTab.changeShadowTexture();
  }
}