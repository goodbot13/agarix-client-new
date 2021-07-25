import * as PIXI from 'pixi.js';
import GameSettings from "../Settings/Settings";
import Globals from "../Globals";
import World from "./World";
import SpawnAnimation from "../objects/SpawnAnimation";
import Cell from "../objects/Cell/index";
import Virus from "../objects/Virus/Virus";
import Food from "../objects/Food";
import CellsRenderer from './Renderer/CellsRenderer';
import FoodRenderer from './Renderer/FoodRenderer';
import RemoveAnimation from "../objects/RemoveAnimation";
import UICommunicationService from "../communication/FrontAPI";
import SkinsLoader from "../utils/SkinsLoader";
import WorldState from "../states/WorldState";
import PlayerState from "../states/PlayerState";
import Ogar from "../Ogar";
import Ejected from '../objects/Ejected';
import CachedObjects from '../utils/CachedObjects';
import { getAnimationSpeed, getFadeSpeed, getFadeSpeedForEjected, getSoakSpeed, getSoakSpeedForEjected } from './Renderer/AnimationDataProvider';

export default class WorldLoop {
  private cellsRenderer: CellsRenderer;
  private foodRenderer: FoodRenderer;
  private stp: boolean = false;
  private ftp: boolean = false;
  private rgbWtfModeHueValue: number = 0;

  constructor(private world: World) {
    this.cellsRenderer = new CellsRenderer(this.world);
    this.foodRenderer = new FoodRenderer(this.world);
  }

  public checkIsTeam(cell: Cell): void {
    if (!Ogar.connected) {
      return;
    }

    Ogar.firstTab.team.forEach((player) => {

      const { nick, color, alive } = player;

      if (!alive) {
        return;
      }

      const sameNick = nick === cell.nick;
      const sameColor = cell.colorHex[0] === color.cell || cell.colorHex[1] === color.cell;
      const sameCustomColor = cell.colorHex[0] === color.custom || cell.colorHex[1] === color.custom;
      const undefinedExtensionColor = color.custom === '#000000' || color.cell === '#000000';

      if (sameNick && (sameColor || sameCustomColor || undefinedExtensionColor)) {
        cell.setIsTeam(true, SkinsLoader.getTextureByUrl(player.skin));
      }

    });
  }

  private renderEjected(): void {
    const animationSpeed = getAnimationSpeed();
    const fadeSpeed = getFadeSpeedForEjected(this.world.ejected.children.length);
    const soakSpeed = getSoakSpeedForEjected(this.world.ejected.children.length);

    for (let i = 0; i < this.world.ejected.children.length; i++) {
      const ejected = this.world.ejected.children[i] as Ejected;
      ejected.animate(animationSpeed, fadeSpeed, soakSpeed);

      if (ejected.isDestroyed) {
        this.world.ejected.removeChild(ejected);
        CachedObjects.addEjected(ejected);

        continue;
      }

      this.cellsRenderer.render(ejected);
    }
  }

  private renderCells(): void {
    // check for isTeam every 1 second. isAlive may be changed only every 2 seconds
    const canCheckForTeam = WorldState.ticks % 60 * PIXI.Ticker.shared.deltaTime === 0;

    const animationSpeed = getAnimationSpeed();
    const fadeSpeed = getFadeSpeed();
    const soakSpeed = getSoakSpeed();

    for (let i = 0; i < this.world.cells.children.length; i++) {
      const object = this.world.cells.children[i] as Cell | Virus | RemoveAnimation;
      object.animate(animationSpeed, fadeSpeed, soakSpeed);

      if (object.isDestroyed) {
        this.world.cells.removeChild(object);
        
        if (object.type === 'CELL') {
          CachedObjects.addCell(object as Cell);
        }
        
        continue;
      }

      if (object.type === 'SPAWN_ANIMATION') {
        continue;
      }

      if (object.type === 'CELL' && canCheckForTeam) {
        this.checkIsTeam(object as Cell);
      }

      this.cellsRenderer.render(object);
    }
  }

  private checkFoodContainerVisibility(): void {
    const { deltaTime } =  PIXI.Ticker.shared;

    if (GameSettings.all.settings.theming.food.enabled) {
      this.world.food.visible = this.world.food.renderable = true;

      if (this.world.food.alpha >= 1) {
        this.world.food.alpha = 1;
      } else {
        this.world.food.alpha += 0.02 * deltaTime;
      }
    } else {
      if (this.world.food.alpha <= 0) {
        this.world.food.alpha = 0;
        this.world.food.visible = this.world.food.renderable = false;
      } else {
        this.world.food.alpha -= 0.033 * deltaTime;
      }
    }
  }

  private renderFood(): void {
    for (let i = 0; i < this.world.food.children.length; i++) {
      const food = this.world.food.children[i] as Food;
      food.animate();

      if (food.isDestroyed) {
        this.world.food.removeChild(food);
        CachedObjects.addFood(food);

        continue;
      }

      this.foodRenderer.render(food as Food);
    }
  }

  private checkIsPlaying(): void {
    if (this.world.playerCells.firstTab.size === 0) {
      this.world.controller.firstTabSocket && (this.world.controller.firstTabSocket.playerSpawned = false);
      PlayerState.first.playing = false;
      Ogar.connected && (Ogar.firstTab.death());

      if (this.ftp !== false) {
        this.ftp = false;
        
        if (!PlayerState.second.playing) {
          UICommunicationService.setIsPlayerPlaying(false);
        }

        if (GameSettings.all.settings.game.multibox.enabled && PlayerState.second.playing) {
          this.world.controller.setSecondTabActive();
        }
      }
    } else {
      PlayerState.first.playing = true;
      Ogar.connected && (Ogar.firstTab.spawn());

      if (this.ftp !== true) {
        this.ftp = true;

        UICommunicationService.setIsPlayerPlaying(true);

        if (GameSettings.all.settings.game.effects.spawnAnimation !== 'Disabled') {
          const first: Cell = this.world.playerCells.firstTab.entries().next().value[1];
          this.world.cells.addChild(new SpawnAnimation(first.newLocation, first.cell.tint));
        }
      }
    }

    if (GameSettings.all.settings.game.multibox.enabled && this.world.controller.secondTabSocket) {
      if (this.world.playerCells.secondTab.size === 0) {
        this.world.controller.secondTabSocket.playerSpawned = false;
        PlayerState.second.playing = false;
        Ogar.connected && (Ogar.secondTab.death());

        if (this.stp !== false) {
          this.stp = false;
          
          if (!PlayerState.first.playing) {
            UICommunicationService.setIsPlayerPlaying(false);
          }

          if (PlayerState.first.playing) {
            this.world.controller.setFirstTabActive();
          }
        }
      } else {
        PlayerState.second.playing = true;
        Ogar.connected && (Ogar.secondTab.spawn());

        if (this.stp !== true) {
          this.stp = true;

          UICommunicationService.setIsPlayerPlaying(true);

          if (GameSettings.all.settings.game.effects.spawnAnimation !== 'Disabled') {
            const first: Cell = this.world.playerCells.secondTab.entries().next().value[1];
            this.world.cells.addChild(new SpawnAnimation(first.newLocation, first.cell.tint));
          }
        }
      }
    }
  }

  private checkWtfRgbMode(): void {
    if (GameSettings.all.settings.game.effects.wtfRgbMode) {
      this.world.scene.app.stage.filters = [this.world.scene.colorFilter];
      this.rgbWtfModeHueValue += 1 * PIXI.Ticker.shared.deltaTime;
      this.world.scene.colorFilter.hue(this.rgbWtfModeHueValue, false);
    } else {
      if (Globals.gameBlured || Globals.gameBluring) {
        return;
      }

      if (this.world.scene.app.stage.filters && this.world.scene.app.stage.filters.length) {
        this.world.scene.app.stage.filters = [];
      }
    }
  }

  private sort(): void {
    if (this.world.view.firstTab.sortRequired) {
      this.world.view.firstTab.calcBounds();
      this.world.view.firstTab.sortRequired = false;
    }

    if (this.world.view.secondTab.sortRequired) {
      this.world.view.secondTab.calcBounds();
      this.world.view.secondTab.sortRequired = false;
    }

    if (this.world.view.topOneTab.sortRequired) {
      this.world.view.topOneTab.calcBounds();
      this.world.view.topOneTab.sortRequired = false;
    }
  }

  public renderFrame(): void {
    this.sort();
    this.checkFoodContainerVisibility();
    this.checkIsPlaying();
    this.world.map.renderTick();
    this.renderCells();
    this.renderEjected();
    this.world.minimap.renderFrame();
    this.renderFood();
    this.checkWtfRgbMode();

    this.world.lastRenderTime = Date.now();
  }
}