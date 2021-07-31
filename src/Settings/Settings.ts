import { IState, RingsType, VirusMassType } from "./Storage/initState"
import Storage from "./Storage/Storage";
import Stage from '../Stage/Stage';
import Food from "../objects/Food";
import Virus from "../objects/Virus/Virus";
import Cell from "../objects/Cell";
import SettingsState from "../states/SettingsState";

export default class Settings {
  public all: IState;

  constructor(public stage: Stage) {
    const storage = new Storage(); 
    this.all = storage.init();

    this.transformProfilesState();
  }

  private transformProfilesState(): void {
    const { profiles } = this.all;

    profiles.leftProfileNick = profiles.leftProfiles[profiles.leftSelectedIndex].nick;
    profiles.leftProfileSkinUrl = profiles.leftProfiles[profiles.leftSelectedIndex].skinUrl;
    profiles.tag = profiles.leftProfiles[profiles.leftSelectedIndex].tag;

    profiles.rightProfileNick = profiles.rightProfiles[profiles.rightSelectedIndex].nick;
    profiles.rightProfileSkinUrl = profiles.rightProfiles[profiles.rightSelectedIndex].skinUrl;
  }




  

  updateThemingCells(type: TThemingCells): void {
    switch (type) {
      case 'Shadow':
        this.stage.textureGenerator.generateCellShadow();
        
        this.stage.world.cells.children.filter((cell: any) => cell.type === 'CELL').forEach((cell: Cell) => {
          cell.changeShadowTexture();
        });

        this.stage.world.cachedObjects.getPool('CELL').forEach((cell: Cell) => cell.changeShadowTexture());

        this.stage.world.minimap.changeCellShadowTexture();
        break;

      case 'MyShadow':
        this.stage.textureGenerator.generateMyCellShadow();

        this.stage.world.cells.children.filter((cell: any) => cell.type === 'CELL').forEach((cell: Cell) => {
          cell.changeShadowTexture();
        });

        this.stage.world.cachedObjects.getPool('CELL').forEach((cell: Cell) => cell.changeShadowTexture());

        this.stage.world.minimap.changeCellShadowTexture();
        break;
    }
  }

  updateThemingFood(): void {
    this.stage.textureGenerator.generateFood();

    const foodTexture = this.stage.textureGenerator.food;

    this.stage.world.food.children.forEach((food: Food) => {
      food.texture = foodTexture;
    });

    this.stage.world.cachedObjects.getPool('FOOD').forEach((food: Food) => {
      food.texture = foodTexture;
    });
  }

  updateThemingMap(type: TThemingMap): void {
    switch (type) {
      case 'BgImgUrl': 
        this.stage.world.map.background.updateTexture();
        break;

      case 'BgTint':
        this.stage.world.map.background.updateTint();
        this.stage.updateRendererBackgroundColor();
        break;

      case 'Border':
        this.stage.world.map.borders.updateTextures();
        break;

      case 'GlobalBgImgUrl':
        this.stage.world.map.globalBackground.updateTexture();
        break;

      case 'GlobalBgImgTint':
        this.stage.world.map.globalBackground.updateTint();
        break;
    }
  }

  updateThemingMinimap(type: TThemingMinimap): void {
    switch (type) {
      case 'BgColor':
        this.stage.world.minimap.updateBackgroundColor();
        break;

      case 'GhostCellsColor':
        this.stage.world.minimap.ghostCells.updateColor();
        break;

      case 'ViewportColors':
        this.stage.world.minimap.viewports.updateColors();
        break;

      case 'PlayerColor':
        this.stage.world.minimap.staticPlayerCells.updateColors();
        break;
    }
  }

  updateThemingMultibox(type: TThemingMultibox): void {
    switch (type) {
      case 'LinedRing':
        this.stage.textureGenerator.generateMultiboxLinedRing();
        break;
    }
  }

  updateThemingViewports(): void {
    
  }

  updateThemingViruses(): void {
    this.stage.textureGenerator.generateVirus();

    this.stage.world.minimap.changeVirusTexture();

    this.stage.world.cells.children.filter((cell: any) => cell.type === 'VIRUS').forEach((virus: Virus) => {
      virus.updateTexture();
    });
  }

  updateThemingVirusesMassType(type: VirusMassType): void {
    const viruses = this.stage.world.cells.children.filter((cell: any) => cell.type === 'VIRUS');

    switch (type) {
      case 'Disabled':
      case 'Full mass':
        viruses.forEach((virus: Virus) => {
          virus.shots.visible = false;
        });
        break;

      case 'Fill circle':
        viruses.forEach((virus: Virus) => {
          virus.shots.visible = true;
        });
        break;
    }
  }







  updateSystemCells(): void {
    
  }

  updateSystemCellsRings(type: RingsType): void {
    if (type !== 'Disabled' && !SettingsState.rings) {
      SettingsState.rings = true;
    } 
  }

  updateSystemEffects(): void {
    
  }

  updateSystemGameplay(): void {
    
  }

  updateSystemMinimap(): void {
    
  }

  updateSystemMultibox(): void {
    
  }

  updateSystemPerformance(): void {
    
  }
}

export type TThemingMap = 'Border' | 'BgTint' | 'BgImgUrl' | 'GlobalBgImgUrl' | 'GlobalBgImgTint';
export type TThemingCells = 'Shadow' | 'MyShadow';
export type TThemingMultibox = 'LinedRing';
export type TThemingMinimap = 'BgColor' | 'ViewportColors' | 'PlayerColor' | 'GhostCellsColor';