import { Container, IParticleProperties, ParticleContainer } from 'pixi.js';
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
import Hotkeys from '../tabs/Hotkeys/Hotkeys';
import Stage from '../Stage/Stage';
import Minimap from '../Minimap/MinimapWEBGL'
import Logger from '../utils/Logger';
import PlayerState from '../states/PlayerState';
import SkinsLoader from '../utils/SkinsLoader';
import { getColor } from '../utils/helpers';
import Ejected from '../objects/Ejected';
import CachedObjects from '../utils/CachedObjects';
import Settings from '../Settings/Settings';
import TextureGenerator from '../Textures/TexturesGenerator';
import Master from '../Master';
import Ogar from '../Ogar';
import AnimationSettingsProvider from './Renderer/AnimationSettingsProvider';

export default class World {
  public cells: Container;
  public food: ParticleContainer;
  public ejected: ParticleContainer;
  public map: WorldMap;
  public indexedCells: Map<number, Cell | Virus | Ejected>;
  public indexedFood: Map<number, Food>;
  public indexedEjected: Map<number, Ejected>; 
  public created: boolean;
  public playerCells: PlayerCells;
  public renderer: WorldLoop;
  public lastRenderTime: number = 0;
  public socketCells: SocketCells;
  public view: View;
  public controller: Controller;
  public hotkeys: Hotkeys;
  public minimap: Minimap;
  public skinsLoader: SkinsLoader;
  public settings: Settings;
  public cachedObjects: CachedObjects;
  public textureGenerator: TextureGenerator;
  public master: Master;
  public ogar: Ogar;
  public animationSettingsProvider: AnimationSettingsProvider;

  private logger: Logger;

  constructor(public scene: Stage) {
    this.settings = scene.settings;
    this.master = scene.master;
    this.ogar = scene.ogar;
    this.textureGenerator = scene.textureGenerator;

    this.animationSettingsProvider = new AnimationSettingsProvider(this);
    this.skinsLoader = new SkinsLoader(this);
    this.cachedObjects = new CachedObjects(this);

    this.cells = new Container();
    this.cells.sortableChildren = true;

    const PARTICLE_CONFIG: IParticleProperties = {
      vertices: true,
      position: true,
      rotation: false,
      uvs: false,
      tint: true,
    };

    this.food = new ParticleContainer(3072, PARTICLE_CONFIG, 3072, false);
    this.ejected = new ParticleContainer(768, PARTICLE_CONFIG, 768, false);

    this.indexedCells = new Map();
    this.indexedFood = new Map();
    this.indexedEjected = new Map();
    this.playerCells = new PlayerCells(this.settings, this.ogar);
    this.socketCells = new SocketCells();
    this.view = new View({ playerCells: this.playerCells, socketCells: this.socketCells }, scene.app.view, this.scene.settings, this.ogar);
    this.map = new WorldMap(this);
    this.minimap = new Minimap(this);
    this.controller = new Controller(this);

    this.hotkeys = new Hotkeys(this.controller);
    this.scene.hotkeys = this.hotkeys;

    this.renderer = new WorldLoop(this);
    
    this.cachePlayerSkins();
    
    this.logger = new Logger('World');
  }

  private cachePlayerSkins(): void {
    const { leftProfiles, rightProfiles } = this.settings.all.profiles;

    leftProfiles.forEach((profile) => this.skinsLoader.getCustomSkin(profile.skinUrl, () => {}));
    rightProfiles.forEach((profile) => this.skinsLoader.getCustomSkin(profile.skinUrl, () => {}));
  } 

  private addFood(id: number, location: Location, type: CellType, subtype: Subtype): void {
    if (!this.indexedFood.has(id)) {
      const food = this.cachedObjects.getFood();
      food.reuse(location, subtype);

      this.indexedFood.set(id, food);
      this.food.addChild(food);
      /* this.socketCells.add(subtype, food, id); */
    } else {
      this.update(id, location, type);
    }
  }

  private addEjected(id: number, location: Location, color: RGB, type: CellType, subtype: Subtype): void {
    if (!this.indexedEjected.has(id)) {
      const ejected = this.cachedObjects.getEjected();
      ejected.reuse(location, color, subtype);

      this.indexedEjected.set(id, ejected);
      this.ejected.addChild(ejected);
    } else {
      this.update(id, location, type);
    }
  }

  private addCell(id: number, location: Location, color: RGB, name: string, type: CellType, subtype: Subtype, skin: string): void {
    let cell: Cell;

    if (!this.indexedCells.has(id)) {

      // idk black cell fix
      if (color.red === undefined && color.green === undefined && color.blue === undefined) {
        return;
      }

      cell = this.cachedObjects.getCell();
      cell.reuse(subtype, location, color, name, skin, this);

      this.indexedCells.set(id, cell);
      this.cells.addChild(cell);
      this.socketCells.add(subtype, cell, id);
      this.minimap.addRealPlayerCell(id, location, color, name, type, subtype, skin);

      this.renderer.checkIsTeam(cell);

    } else {
      cell = this.indexedCells.get(id) as Cell;
      this.update(id, location, type);
    }

    if (subtype === 'FIRST_TAB' && this.playerCells.firstTabIds.has(id)) {
      this.playerCells.addFirstTabCell(id, cell);

      if (this.settings.all.settings.game.multibox.enabled && PlayerState.second.playing && this.controller.currentFocusedTab === 'FIRST_TAB') {
        cell.setIsFoucsedTab(true);
      }
    } else if (subtype === 'SECOND_TAB' && this.playerCells.secondTabIds.has(id)) {
      this.playerCells.addSecondTabCell(id, cell);

      if (PlayerState.first.playing && this.controller.currentFocusedTab === 'SECOND_TAB') {
        cell.setIsFoucsedTab(true);
      }
    }
  }

  private addVirus(id: number, location: Location, color: RGB, name: string, type: CellType, subtype: Subtype): void {
    if (!this.indexedCells.has(id)) {
      const virus = new Virus(location, subtype, this);
      this.cells.addChild(virus);
      this.indexedCells.set(id, virus);
      this.socketCells.add(subtype, virus, id);
      this.minimap.addRealPlayerCell(id, location, color, name, type, subtype);
    } else {
      this.update(id, location, type);
    }
  }

  public add(id: number, location: Location, color: RGB, name: string, type: CellType, subtype: Subtype, skin?: string): void {
    switch (type) {
      case 'FOOD':
        this.addFood(id, location, type, subtype);
        break;

      case 'EJECTED':
        this.addEjected(id, location, color, type, subtype);
        break;

      case 'CELL':
        this.addCell(id, location, color, name, type, subtype, skin);
        break;

      case 'VIRUS':
        this.addVirus(id, location, color, name, type, subtype,)
        break;
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
    if (type === 'FOOD') {
      this.indexedFood.get(id).update(location);
    } else {
      if (type === 'CELL' || type === 'VIRUS') {
        this.indexedCells.get(id).update(location);
        this.minimap.updateRealPlayerCell(id, location);
      } else {
        this.indexedEjected.get(id).update(location);
      }
    }
  }

  private addRemoveAnimation(object: Cell | Virus): void {
    const matchSize = object.type === 'CELL' 
      ? (object as Cell).cell.width > 150 
      : object.type === 'VIRUS' ? (object as Virus).virusSprite.width : false;

    const removeAnimation = this.settings.all.settings.game.effects.cellRemoveAnimation !== 'Disabled';

    if (removeAnimation && matchSize) {
      const location: Location = {
        x: object.x,
        y: object.y,
        r: object.width
      }

      let tint = 0xFFFFFF;

      if (object.type == 'CELL') {
        tint = (object as Cell).cell.tint;
      } else if (object.type === 'VIRUS') {
        tint = getColor(this.settings.all.settings.theming.viruses.color);
      }

      this.cells.addChild(new RemoveAnimation(location, object.subtype, this, tint));
    }
  }

  private remove(id: number, removeType: RemoveType, eaterId?: number): void {
    const removeImmediatly = Date.now() - this.lastRenderTime > 100;

    if (this.indexedFood.has(id)) {
      const food = this.indexedFood.get(id);

      if (removeImmediatly || this.settings.all.settings.game.performance.foodPerformanceMode) {
        this.food.removeChild(food);
        this.cachedObjects.addFood(food);
      } else {
        food.remove();
      }

      this.indexedFood.delete(id);

      return;
    }

    if (this.indexedEjected.has(id)) {
      const object = this.indexedEjected.get(id) as Ejected;

      if (removeImmediatly) {
        this.ejected.removeChild(object);
        this.cachedObjects.addEjected(object);
      } else {
        const eatenBy = this.indexedCells.get(eaterId) as Cell;

        if (eatenBy) {
          object.remove(removeType, eatenBy);
        } else {
          object.remove('REMOVE_CELL_OUT_OF_VIEW');
        }
      }

      this.indexedEjected.delete(id);
      this.playerCells.remove(object.subtype, id);
      this.socketCells.remove(object.subtype, id);

      return;
    }

    if (this.indexedCells.has(id)) {
      const object = this.indexedCells.get(id) as Cell | Virus;

      if (removeImmediatly) {
        this.cells.removeChild(object);
        
        if (object.type === 'CELL') {
          this.cachedObjects.addCell(object as Cell);
        }
      } else {
        const eatenBy = this.indexedCells.get(eaterId) as Cell;

        if (eatenBy) {
          object.remove(removeType, eatenBy);
        } else {
          object.remove('REMOVE_CELL_OUT_OF_VIEW');
        }

        if (removeType === 'REMOVE_EATEN_CELL') {
          this.addRemoveAnimation(object);
        }
      }

      this.playerCells.remove(object.subtype, id);
      this.socketCells.remove(object.subtype, id);
      this.indexedCells.delete(id);
      this.minimap.removeRealPlayerCell(id, removeType);
    }
  }

  public removeEaten(id: number, eaterId: number): void {
    this.remove(id, 'REMOVE_EATEN_CELL', eaterId);
  }

  public removeOutOfView(id: number): void {  
    this.remove(id, 'REMOVE_CELL_OUT_OF_VIEW');
  }

  public clear(): void {
    while (this.food.children[0]) {
      this.cachedObjects.addFood(this.food.children[0] as Food);
      this.food.removeChild(this.food.children[0]);
    }

    while (this.cells.children[0]) {
      if ((this.cells.children[0] as Cell).type === 'CELL') {
        this.cachedObjects.addCell(this.cells.children[0] as Cell);
      }

      this.cells.removeChild(this.cells.children[0]);
    }

    while (this.ejected.children[0]) {
      this.cachedObjects.addEjected(this.ejected.children[0] as Ejected);
      this.ejected.removeChild(this.ejected.children[0]);
    }

    this.indexedCells.clear();
    this.indexedEjected.clear();
    this.indexedFood.clear();
    this.socketCells.clear();
    this.playerCells.clear();

    this.minimap.reset();

    this.textureGenerator.cellNicksGenerator.clear();
  }

  public clearCellsByType(subtype: Subtype): void {
    let cellsEntries = 0;
    let foodEntries = 0;
    let ejectedEntries = 0;

    if (subtype === 'TOP_ONE_TAB') {
      this.minimap.reset();
    }

    this.indexedCells.forEach((cell, key) => {
      if (cell.subtype === subtype) {
        
        if (cell.type === 'CELL') {
          this.cachedObjects.addCell(cell as Cell);
        }

        this.cells.removeChild(cell);
        this.indexedCells.delete(key);
        this.socketCells.remove(subtype, key);
        this.playerCells.remove(subtype, key);

        cellsEntries++;
      }
    });

    this.indexedEjected.forEach((ejected, key) => {
      if (ejected.subtype === subtype) {
        this.cachedObjects.addEjected(ejected);

        this.ejected.removeChild(ejected);
        this.indexedEjected.delete(key);
        this.socketCells.remove(subtype, key);
        this.playerCells.remove(subtype, key);

        ejectedEntries++;
      }
    });

    this.indexedFood.forEach((food, key) => {
      if (food.subtype === subtype) {
        this.cachedObjects.addFood(food);

        this.food.removeChild(food);
        this.indexedFood.delete(key);
        this.socketCells.remove(subtype, key);

        foodEntries++;
      }
    });

    if (cellsEntries || foodEntries) {
      this.logger.info(
        `[${subtype}] disconnected. Food: ${foodEntries}, cells: ${cellsEntries}, ejected - ${ejectedEntries}`
      );
    }
  }

  public setMultiboxTabRingsActive(tabType: TabType): void {
    if (tabType === 'FIRST_TAB') {
      if (!PlayerState.second.playing) {
        this.playerCells.firstTab.forEach((cell) => cell.setIsFoucsedTab(false));
      } else {
        this.playerCells.firstTab.forEach((cell) => cell.setIsFoucsedTab(true));
        this.playerCells.secondTab.forEach((cell) => cell.setIsFoucsedTab(false));
      }
    } else {
      if (!PlayerState.first.playing) {
        this.playerCells.secondTab.forEach((cell) => cell.setIsFoucsedTab(false));
      } else {
        this.playerCells.firstTab.forEach((cell) => cell.setIsFoucsedTab(false));
        this.playerCells.secondTab.forEach((cell) => cell.setIsFoucsedTab(true));
      }
    }
  }
}