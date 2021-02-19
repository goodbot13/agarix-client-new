import { Container, filters, NineSlicePlane, Sprite } from "pixi.js";
import Globals from "../../Globals";
import GameSettings from "../../Settings/Settings";
import TextureGenerator from "../../Textures";
import * as PIXI from 'pixi.js';
import IMapObject from "./interfaces";

export default class Borders extends Container implements IMapObject {
  private bordersSprite: NineSlicePlane;
  private rgbBorders: Sprite;
  private rgbBordersLine: Sprite;

  private colorMatrixFilter: filters.ColorMatrixFilter;
  private colorMatrixFilterHue: number = 0;

  constructor(private textureGenerator: TextureGenerator) {
    super();

    this.zIndex = 10;

    this.create();
    this.createRgb();
    this.applyFilter();
  }

  private applyFilter(): void {
    this.colorMatrixFilter = new filters.ColorMatrixFilter();
    this.filters = [this.colorMatrixFilter];
  }

  private animateFilter(): void {
    const { deltaTime } = PIXI.Ticker.shared;
    const { borderType } = GameSettings.all.settings.theming.map;

    const animatedBorder = borderType.includes('anim');
    const rgbBorder = borderType === 'RGB' || borderType === 'RGB (anim)';

    if (animatedBorder) {
      if (rgbBorder) {
        if (this.colorMatrixFilterHue >= 360) {
          this.colorMatrixFilterHue = 0;
        }

        this.colorMatrixFilterHue += 1 * deltaTime;
      } else {
        this.colorMatrixFilterHue += 0.1 * deltaTime;
      }
      
      this.colorMatrixFilter.hue(this.colorMatrixFilterHue, false);
    } else {
      if (this.colorMatrixFilterHue !== 0) {
        this.colorMatrixFilterHue = 0;
        this.colorMatrixFilter.hue(0, false);
      }
    }
  }

  public updateTextures(): void {
    this.create();
    this.createRgb();
  }

  public create(): void {
    const { borderGlow, borderWidth, borderGlowDistance } = GameSettings.all.settings.theming.map;
    const { glowFilterShaderType } = GameSettings.all.settings.game.performance;
    const { MAP_RATIO } = Globals;
    
    if (this.bordersSprite) {
      this.textureGenerator.generateMapBorders();
      this.removeChild(this.bordersSprite);
      this.bordersSprite.destroy();
    }

    let bordersSize = 14142;
    let pos = 0;

    if (borderGlow) {
      bordersSize += borderWidth * 2 + borderGlowDistance * 2;
      pos = -(borderWidth * 2 + borderGlowDistance);
    }

    let sideSize = 0;
    if (glowFilterShaderType === 'GPU-1') {
      sideSize = borderGlow ? (borderWidth * 2 + borderGlowDistance * 2) : borderWidth * 2;
    } else {
      sideSize = borderGlow ? (borderWidth * 2 + borderGlowDistance * 2) / MAP_RATIO / 2 : borderWidth * 2 / MAP_RATIO / 2;
    }

    this.bordersSprite = new NineSlicePlane(this.textureGenerator.mapBorders, sideSize, sideSize, sideSize, sideSize);
    this.bordersSprite.width = bordersSize;
    this.bordersSprite.height = bordersSize;
    this.bordersSprite.x = pos;
    this.bordersSprite.y = pos;

    this.addChild(this.bordersSprite);
  }

  private createRgb(): void {
    const size = 1100;

    if (this.rgbBorders || this.rgbBordersLine) {
      this.textureGenerator.generateRgbLine();
      this.removeChild(this.rgbBorders, this.rgbBordersLine);
      this.rgbBorders.destroy();
      this.rgbBordersLine.destroy();
    }

    // HARDCODED POSITION
    const borderWidth = 20;

    this.rgbBorders = new Sprite(this.textureGenerator.rgbBorder);
    this.rgbBorders.width = 14142 + size;
    this.rgbBorders.height = 14142 + size;
    this.rgbBorders.x = -size / 2;
    this.rgbBorders.y = -size / 2;

    this.rgbBordersLine = new Sprite(this.textureGenerator.mapBordersRgbLine);
    this.rgbBordersLine.width = 14142 + borderWidth * 2;
    this.rgbBordersLine.height = 14142 + borderWidth * 2;
    this.rgbBordersLine.x = -borderWidth;
    this.rgbBordersLine.y = -borderWidth;

    this.addChild(this.rgbBorders, this.rgbBordersLine);
  }

  public renderTick(): void {
    const { borderType } = GameSettings.all.settings.theming.map

    this.visible = borderType !== 'Disabled';
    this.rgbBorders.visible = borderType === 'RGB' || borderType === 'RGB (anim)';
    this.rgbBordersLine.visible = borderType === 'RGB' || borderType === 'RGB (anim)';
    this.bordersSprite.visible = borderType === 'Common' || borderType === 'Common (anim)';

    this.animateFilter();
  }
}