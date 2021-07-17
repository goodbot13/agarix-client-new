import * as PIXI from 'pixi.js';
import { Container, ParticleContainer } from "pixi.js";
import GameSettings from "../Settings/Settings";
import Globals from "../Globals";
import Controller from "../tabs/Contollers/TabsController";
import World from "./World";
import Map from "../objects/Map/Map";
import SpawnAnimation from "../objects/SpawnAnimation";
import Cell from "../objects/Cell/index";
import Virus from "../objects/Virus/Virus";
import Food from "../objects/Food";
import CellsRenderer from './Renderer/CellsRenderer';
import FoodRenderer from './Renderer/FoodRenderer';
import Minimap from "../Minimap/MinimapWEBGL";
import RemoveAnimation from "../objects/RemoveAnimation";
import UICommunicationService from "../communication/FrontAPI";
import SkinsLoader from "../utils/SkinsLoader";
import WorldState from "../states/WorldState";
import PlayerState from "../states/PlayerState";
import Ogar from "../Ogar";
import Ejected from '../objects/Ejected';
import CachedObjects from '../utils/CachedObjects';

export default class WorldLoop {
  private world: World;
  private cells: Container;
  private food: ParticleContainer;
  private ejected: ParticleContainer;
  private map: Map;
  private controller: Controller;
  private cellsRenderer: CellsRenderer;
  private foodRenderer: FoodRenderer;
  private minimap: Minimap;
  private stp: boolean = false;
  private ftp: boolean = false;
  private rgbWtfModeHueValue: number = 0;

  constructor(world: World) {
    this.world = world;
    this.cells = world.cells;
    this.food = world.food;
    this.ejected = world.ejected;
    this.map = world.map;
    this.controller = world.controller;
    this.minimap = world.minimap;
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
    for (let i = 0; i < this.ejected.children.length; i++) {
      const ejected = this.ejected.children[i] as Ejected;
      ejected.animate();

      if (ejected.isDestroyed) {
        this.ejected.removeChild(ejected);
        CachedObjects.addEjected(ejected);

        continue;
      }

      this.cellsRenderer.render(ejected);
    }
  }

  private renderCells(): void {
    // check for isTeam every 1 second. isAlive may be changed only every 2 seconds
    const canCheckForTeam = WorldState.ticks % 60 * PIXI.Ticker.shared.deltaTime === 0;

    for (let i = 0; i < this.cells.children.length; i++) {
      const object = this.cells.children[i] as Cell | Virus | RemoveAnimation;
      object.animate();

      if (object.isDestroyed) {
        this.cells.removeChild(object);
        
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
      this.food.visible = this.food.renderable = true;

      if (this.food.alpha >= 1) {
        this.food.alpha = 1;
      } else {
        this.food.alpha += 0.02 * deltaTime;
      }
    } else {
      if (this.food.alpha <= 0) {
        this.food.alpha = 0;
        this.food.visible = this.food.renderable = false;
      } else {
        this.food.alpha -= 0.033 * deltaTime;
      }
    }
  }

  private renderFood(): void {
    for (let i = 0; i < this.food.children.length; i++) {
      const food = this.food.children[i] as Food;
      food.animate();

      if (food.isDestroyed) {
        this.food.removeChild(food);
        CachedObjects.addFood(food);

        continue;
      }

      this.foodRenderer.render(food as Food);
    }
  }

  private checkIsPlaying(): void {
    if (this.world.playerCells.firstTab.size === 0) {
      this.controller.firstTabSocket && (this.controller.firstTabSocket.playerSpawned = false);
      PlayerState.first.playing = false;
      Ogar.connected && (Ogar.firstTab.death());

      if (this.ftp !== false) {
        this.ftp = false;
        
        if (!PlayerState.second.playing) {
          UICommunicationService.setIsPlayerPlaying(false);
        }

        if (GameSettings.all.settings.game.multibox.enabled && PlayerState.second.playing) {
          this.controller.setSecondTabActive();
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

    if (GameSettings.all.settings.game.multibox.enabled && this.controller.secondTabSocket) {
      if (this.world.playerCells.secondTab.size === 0) {
        this.controller.secondTabSocket.playerSpawned = false;
        PlayerState.second.playing = false;
        Ogar.connected && (Ogar.secondTab.death());

        if (this.stp !== false) {
          this.stp = false;
          
          if (!PlayerState.first.playing) {
            UICommunicationService.setIsPlayerPlaying(false);
          }

          if (PlayerState.first.playing) {
            this.controller.setFirstTabActive();
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
    this.map.renderTick();
    this.renderCells();
    this.renderEjected();
    this.minimap.renderFrame();
    this.renderFood();
    this.checkWtfRgbMode();

    this.world.lastRenderTime = Date.now();
  }
}