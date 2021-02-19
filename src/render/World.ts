import { Container, ParticleContainer } from 'pixi.js';
import WorldMap from '../objects/Map/Map';
import Food from '../objects/Food';
import Cell from '../objects/Cell/index';
import Virus from '../objects/Virus/Virus';
import RemoveAnimation from '../objects/RemoveAnimation';
import PlayerCells from './PlayerCells';
import WorldLoop from './WorldLoop';
import { Location, Subtype, RGB, CellType, RemoveType } from '../objects/types';
import SocketCells from './SocketCells';
import { TabType } from '../tabs/Socket/Socket';
import Controller from '../tabs/Contollers/TabsController';
import View from '../View';
import Ogar from '../Ogar';
import TextureGenerator from '../Textures';
import Hotkeys from '../tabs/Hotkeys';
import Stage from '..';
import GamePerformance from '../GamePerformance';
import Minimap from '../Minimap/MinimapWEBGL'
import GameSettings from '../Settings/Settings';

export default class World {
  public cells: Container;
  public food: Container;
  public map: WorldMap;
  public indexedCells: Map <number, Cell | Virus>;
  public indexedFood: Map <number, Food>;
  public created: boolean;
  public playerCells: PlayerCells;
  public renderer: WorldLoop;
  public lastRenderTime: number = 0;
  public socketCells: SocketCells;
  public view: View;
  public controller: Controller;
  public ogar: Ogar;
  public scene: Stage;
  public textureGenerator: TextureGenerator;
  public hotkeys: Hotkeys;
  public performance: GamePerformance;
  public minimap: Minimap;

  constructor(scene: Stage) {
    this.scene = scene;
    this.textureGenerator = scene.textureGenerator;
    
    this.performance = new GamePerformance();
    this.cells = new Container();
    this.cells.sortableChildren = true;
    
    if (GameSettings.all.settings.game.performance.foodPerformanceMode) {
      this.food = new ParticleContainer(3072);
    } else {
      this.food = new ParticleContainer(4096, {
        vertices: true
      });
    }

    this.ogar = new Ogar(scene.skinsLoader);
    this.indexedCells = new Map();
    this.indexedFood = new Map();
    this.playerCells = new PlayerCells(this.ogar, this.scene.skinsLoader);
    this.socketCells = new SocketCells();
    this.view = new View({ playerCells: this.playerCells, socketCells: this.socketCells }, scene.app.view, this.ogar);
    this.map = new WorldMap(this);
    this.minimap = new Minimap(this);
    this.controller = new Controller(this);

    this.hotkeys = new Hotkeys(this.controller, this.view, this.ogar);
    this.scene.hotkeys = this.hotkeys;

    this.renderer = new WorldLoop(this);
    
/*     this.scene.skinsLoader.load(Settings.tabs.first.skinUrl);
    this.scene.skinsLoader.load(Settings.tabs.second.skinUrl); */
  }

  public add(id: number, location: Location, color: RGB, name: string, type: CellType, subtype: Subtype, skin?: string): void {
    if (type === 'FOOD') {
      if (!this.indexedFood.has(id)) {
        const food = new Food(location, subtype, this);
        this.indexedFood.set(id, food);
        
        if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map') {
          if (subtype === 'SPEC_TABS') {
            this.food.addChild(food);
          }
        } else {
          this.food.addChild(food);
        }

        /* if (Settings.globals.foodViewportInclude) { */
          this.socketCells.add(subtype, food, id);
        /* } */
      } else {
        this.update(id, location, type);
      }

      return;
    }

    if (type === 'CELL') {
      let cell: Cell;

      if (!this.indexedCells.has(id)) {
        cell = new Cell(subtype, location, color, name, skin, this);

        this.indexedCells.set(id, cell);
        this.cells.addChild(cell);
        this.socketCells.add(subtype, cell, id);
        this.minimap.addRealPlayerCell(id, location, color, name, type, subtype, skin);

        this.renderer.checkIsTeam(cell);

        if (skin) {
          this.scene.skinsLoader.loadAgar(skin);
        }
      } else {
        cell = this.indexedCells.get(id) as Cell;
        this.update(id, location, type);
      }

      if (subtype === 'FIRST_TAB' && this.playerCells.firstTabIds.has(id)) {
        this.playerCells.addFirstTabCell(id, cell);

        if (GameSettings.all.settings.game.multibox.enabled && this.view.secondTab.isPlaying && this.controller.currentFocusedTab === 'FIRST_TAB') {
          cell.setIsFoucsedTab(true);
        }
      } else if (subtype === 'SECOND_TAB' && this.playerCells.secondTabIds.has(id)) {
        this.playerCells.addSecondTabCell(id, cell);

        if (this.view.firstTab.isPlaying && this.controller.currentFocusedTab === 'SECOND_TAB') {
          cell.setIsFoucsedTab(true);
        }
      }

      return;
    }

    if (type === 'VIRUS') {
      if (!this.indexedCells.has(id)) {
        const virus = new Virus(location, subtype, this);
        this.cells.addChild(virus);
        this.indexedCells.set(id, virus);
        this.socketCells.add(subtype, virus, id);
        this.minimap.addRealPlayerCell(id, location, color, name, type, subtype);
      } else {
        this.update(id, location, type);
      }

      return;
    }
  }

  public addPlayer(id: number, subtype: Subtype): void {
    switch (subtype) {
      case 'FIRST_TAB':
        this.playerCells.addFirstTabId(id);
        break;

      case 'SECOND_TAB':
        this.playerCells.addSecondTabId(id);
        break;
    }
  }

  private update(id: number, location: Location, type: CellType): void {
    if (type === 'CELL' || type === 'VIRUS') {
      this.indexedCells.get(id).update(location);
      this.minimap.updateRealPlayerCell(id, location);
    } else {
      this.indexedFood.get(id).update(location);
    }
  }

  private remove(id: number, removeType: RemoveType): void {
    const removeImmediatly = Date.now() - this.lastRenderTime > 100;

    if (this.indexedFood.has(id)) {
      const food = this.indexedFood.get(id);

      if (removeImmediatly || GameSettings.all.settings.game.performance.foodPerformanceMode) {
        this.food.removeChild(food);
        food.destroy();
      } else {
        food.remove();
      }

      /* if (Settings.globals.foodViewportInclude) { */
        this.socketCells.remove(food.subtype, id);
      /* } */

      this.indexedFood.delete(id);
      return;
    }

    if (this.indexedCells.has(id)) {
      const object = this.indexedCells.get(id) as Cell | Virus;

      if (removeImmediatly) {
        this.cells.removeChild(object);
        object.destroy({ children: true });
      } else {
        object.remove(removeType);

        // @ts-ignore
        const size = object.type === 'CELL' ? object.cell.width : object.type === 'VIRUS' ? 512 : 0;

        if (removeType === 'REMOVE_EATEN_CELL') {
          if (GameSettings.all.settings.game.effects.cellRemoveAnimation !== 'Disabled' && size > 100) {
            
            const location: Location = {
              x: object.x,
              y: object.y,
              r: object.width
            }
  
            /* const tint = object instanceof Cell ? object.cell.tint : object instanceof Virus ? object.virus.tint : 0xFFFFFF; */ // @ts-ignore
            const tint = object.type === 'CELL' ? object.cell.tint : object.type === 'VIRUS' ? object.virus.tint : 0xFFFFFF;
            this.cells.addChild(new RemoveAnimation(location, object.subtype, tint, this.textureGenerator));
          }
        }
      }

      this.playerCells.remove(object.subtype, id);
      this.socketCells.remove(object.subtype, id);
      this.indexedCells.delete(id);
      this.minimap.removeRealPlayerCell(id, removeType);
    }
  }

  public removeEaten(id: number): void {
    this.remove(id, 'REMOVE_EATEN_CELL');
  }

  public removeOutOfView(id: number): void {  
    this.remove(id, 'REMOVE_CELL_OUT_OF_VIEW');
  }

  public clear(): void {
    while (this.food.children[0]) {
      this.food.children[0].destroy();
      this.food.removeChild(this.food.children[0]);
    }

    while (this.cells.children[0]) {
      // @ts-ignore
      this.cells.children[0].destroy({ children: true });
      this.cells.removeChild(this.cells.children[0]);
    }

    this.indexedCells.clear();
    this.indexedFood.clear();
    this.socketCells.clear();
    this.playerCells.clear();

    this.minimap.reset();

    this.textureGenerator.cache.clearNames();
  }

  public clearCellsByType(subtype: Subtype): void {
    let cellsEntries = 0;
    let foodEntries = 0;

    if (subtype === 'TOP_ONE_TAB') {
      this.minimap.reset();
    }

    this.indexedCells.forEach((cell, key) => {
      if (cell.subtype === subtype) {
        cell.destroy({ children: true });
        this.cells.removeChild(cell);
        this.indexedCells.delete(key);
        this.socketCells.remove(subtype, key);
        this.playerCells.remove(subtype, key);
        cellsEntries++;
      }
    });

    this.indexedFood.forEach((food, key) => {
      if (food.subtype === subtype) {
        food.destroy();
        this.food.removeChild(food);
        this.indexedFood.delete(key);
        this.socketCells.remove(subtype, key);
        foodEntries++;
      }
    });

    if (cellsEntries || foodEntries) {
      console.info(
        `[World]: [${subtype}] cleanup due to socket disconnect. Buffer size: [food - ${foodEntries}] [cells - ${cellsEntries}].`
      );
    }
  }

  public setMultiboxTabRingsActive(tabType: TabType): void {
    if (tabType === 'FIRST_TAB') {
      if (!this.view.secondTab.isPlaying) {
        this.playerCells.firstTab.forEach((cell) => cell.setIsFoucsedTab(false));
      } else {
        this.playerCells.firstTab.forEach((cell) => cell.setIsFoucsedTab(true));
        this.playerCells.secondTab.forEach((cell) => cell.setIsFoucsedTab(false));
      }
    } else {
      if (!this.view.firstTab.isPlaying) {
        this.playerCells.secondTab.forEach((cell) => cell.setIsFoucsedTab(false));
      } else {
        this.playerCells.firstTab.forEach((cell) => cell.setIsFoucsedTab(false));
        this.playerCells.secondTab.forEach((cell) => cell.setIsFoucsedTab(true));
      }
    }
  }
}