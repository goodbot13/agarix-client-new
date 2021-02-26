import { IState } from "./Storage/initState"
import Storage from "./Storage/Storage";
import Stage from '../index';
import Food from "../objects/Food";
import Virus from "../objects/Virus/Virus";
import Cell from "../objects/Cell";
import TextureGenerator from '../Textures/TexturesGenerator'

export default new class Settings {
  public all: IState = Storage.init();
  public stage: Stage;

  

  init(stage: Stage) {
    this.stage = stage;

    this.transformProfilesState();

    return this;
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
        TextureGenerator.generateCellShadow();
        
        this.stage.world.cells.children.filter((cell: any) => cell.type === 'CELL').forEach((cell: Cell) => {
          cell.changeShadowTexture();
        });

        this.stage.world.minimap.changeCellShadowTexture();
        break;

      case 'MyShadow':
        TextureGenerator.generateMyCellShadow();

        this.stage.world.playerCells.firstTab.forEach((cell) => {
          cell.changeShadowTexture();
        });

        this.stage.world.playerCells.secondTab.forEach((cell) => {
          cell.changeShadowTexture();
        });

        this.stage.world.minimap.changeCellShadowTexture();
        break;
    }
  }

  updateThemingFood(): void {
    TextureGenerator.generateFood();

    const foodTexture = TextureGenerator.food;

    this.stage.world.food.children.forEach((food: Food) => {
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
        TextureGenerator.generateMultiboxLinedRing();
        break;
    }
  }

  updateThemingViewports(): void {
    
  }

  updateThemingViruses(): void {
    TextureGenerator.generateVirus();

    const virusTexture = TextureGenerator.virus;

    this.stage.world.minimap.changeVirusTexture();

    this.stage.world.cells.children.filter((cell: any) => cell.type === 'VIRUS').forEach((virus: Virus) => {
      virus.virus.texture = virusTexture;
    });
  }







  updateSystemCells(): void {
    
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