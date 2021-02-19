import GameSettings from "../Settings/Settings";
import View from "../View";
import Globals from "../Globals";
import Controller from "../tabs/Contollers/TabsController";
import Ogar from "../Ogar";
import World from "./World";
import { Container } from "pixi.js";
import Map from "../objects/Map/Map";
import SpawnAnimation from "../objects/SpawnAnimation";
import Cell from "../objects/Cell/index";
import Virus from "../objects/Virus/Virus";
import Food from "../objects/Food";
import CellsRenderer from './Renderer/CellsRenderer';
import FoodRenderer from './Renderer/FoodRenderer';
import Minimap from "../Minimap/MinimapWEBGL";
import * as PIXI from 'pixi.js';
import RemoveAnimation from "../objects/RemoveAnimation";
import UICommunicationService from "../communication/FrontAPI";
import SkinsLoader from "../utils/SkinsLoader";

export default class WorldLoop {
  private world: World;
  private cells: Container;
  private food: Container;
  private map: Map;
  private view: View;
  private controller: Controller;
  private ogar: Ogar;
  private cellsRenderer: CellsRenderer;
  private foodRenderer: FoodRenderer;
  private minimap: Minimap;
  private stp: boolean = false;
  private ftp: boolean = false;
  private rgbWtfModeHueValue: number = 0;
  private skinsLoader: SkinsLoader;

  constructor(world: World) {
    this.world = world;
    this.cells = world.cells;
    this.food = world.food;
    this.map = world.map;
    this.view = world.view;
    this.controller = world.controller;
    this.ogar = world.ogar;
    this.minimap = world.minimap;
    this.skinsLoader = world.scene.skinsLoader;
    this.cellsRenderer = new CellsRenderer(this.world);
    this.foodRenderer = new FoodRenderer(this.world);
  }

  public checkIsTeam(cell: Cell): void {
    if (!this.ogar.connected) {
      return;
    }

    this.ogar.firstTab.team.forEach((player) => {

      const { nick, color, alive } = player;

      if (!alive) {
        return;
      }

      const sameNick = nick === cell.nick;
      const sameColor = cell.colorHex[0] === color.cell || cell.colorHex[1] === color.cell;
      const sameCustomColor = cell.colorHex[0] === color.custom || cell.colorHex[1] === color.custom;
      const undefinedExtensionColor = color.custom === '#000000' || color.cell === '#000000';

      if (sameNick && (sameColor || sameCustomColor || undefinedExtensionColor)) {
        cell.setIsTeam(true, this.skinsLoader.getTextureByUrl(player.skin));
      }

    });
  }

  private renderCells(): void {
    // check for isTeam every 1 second. isAlive may be changed only every 2 seconds
    const canCheckForTeam = Globals.ticks % 60 * PIXI.Ticker.shared.deltaTime === 0;

    for (let i = 0; i < this.cells.children.length; i++) {
      const object = this.cells.children[i] as Cell | Virus | RemoveAnimation;
      object.animate();

      if (object.isDestroyed) {
        this.cells.removeChild(object);
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

    if (/* Settings.food.enabled */true) {
      this.food.visible = true;

      if (this.food.alpha >= 1) {
        this.food.alpha = 1;
      } else {
        this.food.alpha += 0.02 * deltaTime;
      }
    } else {
      if (this.food.alpha <= 0) {
        this.food.alpha = 0;
        this.food.visible = false;
      } else {
        this.food.alpha -= 0.033 * deltaTime;
      }
    }
  }

  private renderFood(): void {
    if (GameSettings.all.settings.game.performance.foodPerformanceMode) {
      return;
    }
    
    for (let i = 0; i < this.food.children.length; i++) {
      const food = this.food.children[i] as Food;
      food.animate();

      if (food.isDestroyed) {
        this.food.removeChild(food);
        continue;
      }

      this.foodRenderer.render(food as Food);
    }
  }

  private checkIsPlaying(): void {
    if (this.world.playerCells.firstTab.size === 0) {
      this.controller.firstTabSocket && (this.controller.firstTabSocket.playerSpawned = false);
      this.view.firstTab.isPlaying = false;
      this.ogar.connected && (this.ogar.firstTab.player.alive = false);

      if (this.ftp !== false) {
        this.ftp = false;
        
        if (!this.world.view.secondTab.isPlaying) {
          UICommunicationService.setIsPlayerPlaying(false);
        }

        if (GameSettings.all.settings.game.multibox.enabled && this.view.secondTab.isPlaying) {
          this.controller.setSecondTabActive();
        }
      }
    } else {
      this.view.firstTab.isPlaying = true;
      this.ogar.connected && (this.ogar.firstTab.player.alive = true);

      if (this.ftp !== true) {
        this.ftp = true;

        UICommunicationService.setIsPlayerPlaying(true);

        if (GameSettings.all.settings.game.effects.spawnAnimation) {
          const first: Cell = this.world.playerCells.firstTab.entries().next().value[1];
          this.world.cells.addChild(new SpawnAnimation(first.newLocation, this.world.textureGenerator, first.cell.tint));
        }
      }
    }

    if (GameSettings.all.settings.game.multibox.enabled && this.controller.secondTabSocket) {
      if (this.world.playerCells.secondTab.size === 0) {
        this.controller.secondTabSocket.playerSpawned = false;
        this.view.secondTab.isPlaying = false;
        this.ogar.connected && (this.ogar.secondTab.player.alive = false);

        if (this.stp !== false) {
          this.stp = false;
          
          if (!this.world.view.firstTab.isPlaying) {
            UICommunicationService.setIsPlayerPlaying(false);
          }

          if (this.view.firstTab.isPlaying) {
            this.controller.setFirstTabActive();
          }
        }
      } else {
        this.view.secondTab.isPlaying = true;
        this.ogar.connected && (this.ogar.secondTab.player.alive = true);

        if (this.stp !== true) {
          this.stp = true;

          UICommunicationService.setIsPlayerPlaying(true);

          if (GameSettings.all.settings.game.effects.spawnAnimation) {
            const first: Cell = this.world.playerCells.secondTab.entries().next().value[1];
            this.world.cells.addChild(new SpawnAnimation(first.newLocation, this.world.textureGenerator, first.cell.tint));
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

  public renderFrame(): void {
    this.checkFoodContainerVisibility();
    this.checkIsPlaying();
    this.map.renderTick();
    this.renderCells();
    this.minimap.renderFrame();
    this.renderFood();
    this.checkWtfRgbMode();

    this.world.lastRenderTime = Date.now();
  }
}