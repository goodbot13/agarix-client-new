import { Container } from "pixi.js";
import Cell from "../objects/Cell/index";
import { Location } from "../objects/types";
import SpawnAnimation from "../objects/SpawnAnimation";
import World from "../render/World";
import GameSettings from "../Settings/Settings";
import { getColor, transformMinimapLocation } from "../utils/helpers";
import PlayerState from "../states/PlayerState";
import { getAnimationSpeed, getFadeSpeed, getSoakSpeed } from "../render/Renderer/AnimationDataProvider";

export default class StaticPlayerCells extends Container {
  private firstTab: Cell;
  private secondTab: Cell;

  constructor(private world: World) {
    super();

    this.zIndex = 1000;
    this.sortableChildren = true;

    this.create();
  }

  private create(): void {
    const { playerColor } = GameSettings.all.settings.theming.minimap;

    this.firstTab = new Cell(/* 'FIRST_TAB', { x: 0, y: 0, r: 0 }, playerColor, '', '', this.world */);
    this.firstTab.setIsMinimapCell();
    this.firstTab.cell.tint = getColor(playerColor);
    this.addChild(this.firstTab);

    this.secondTab = new Cell(/* 'SECOND_TAB', { x: 0, y: 0, r: 0 }, playerColor, '', '', this.world */); 
    this.secondTab.setIsMinimapCell();
    this.secondTab.cell.tint = getColor(playerColor);
    this.addChild(this.secondTab);
  }

  private animateFirstTab(): void {
    const { firstTab } = this.world.view;
    const { playerSize } = GameSettings.all.settings.theming.minimap;
    const { playerPosition } = GameSettings.all.settings.game.minimap;

    if (PlayerState.first.playing && playerPosition) {
      const { x, y } = transformMinimapLocation({ 
          x: firstTab.viewport.x, 
          y: firstTab.viewport.y, 
          r: 0 
        },
        this.world.view.firstTab.mapOffsets
      );

      if (!this.firstTab.visible && GameSettings.all.settings.game.effects.spawnAnimation !== 'Disabled') {
        const animation = new SpawnAnimation({ x, y, r: 0 }, this.firstTab.cell.tint);
        animation.setIsMinimap();
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
    const { playerPosition } = GameSettings.all.settings.game.minimap;

    if (PlayerState.second.playing && playerPosition) {
      const { x, y } = transformMinimapLocation({ 
          x: secondTab.viewport.x, 
          y: secondTab.viewport.y, 
          r: 0 
        },
        this.world.view.secondTab.mapOffsets
      );

      if (!this.secondTab.visible && GameSettings.all.settings.game.effects.spawnAnimation !== 'Disabled') {
        const animation = new SpawnAnimation({ x, y, r: 0 }, this.secondTab.cell.tint);
        animation.setIsMinimap();
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
    const animationSpeed = getAnimationSpeed();
    const fadeSpeed = getFadeSpeed();
    const soakSpeed = getSoakSpeed();

    this.children.forEach((child: Cell) => {
      if (child.type === 'SPAWN_ANIMATION') {
        child.animate(animationSpeed, fadeSpeed, soakSpeed);

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

    this.firstTab.cell.tint = getColor(playerColor);
    this.secondTab.cell.tint = getColor(playerColor);
  }

  public changeCellShadowTexture(): void {
    this.firstTab.changeShadowTexture();
    this.secondTab.changeShadowTexture();
  }
}