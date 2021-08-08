import { Container, filters, NineSlicePlane, Sprite } from "pixi.js";
import * as PIXI from 'pixi.js';
import IMapObject from "./interfaces";
import Map from "./Map";

export default class Borders extends Container implements IMapObject {
  private bordersSprite: NineSlicePlane;
  private rgbBorders: Sprite;
  private rgbBordersLine: Sprite;

  // @ts-ignore
  private colorMatrixFilter: filters.ColorMatrixFilter;
  private colorMatrixFilterHue: number = 0;

  constructor(private map: Map) {
    super();

    this.zIndex = 10;

    this.create();
    this.createRgb();
    this.applyFilter();

    this.map.listen('sizechange', () => {
      let borderWidth = 20;
      let size = 20;

      this.rgbBorders.width = this.map.size.width + size;
      this.rgbBorders.height = this.map.size.height + size;
      this.rgbBordersLine.width = this.map.size.width + borderWidth * 2;
      this.rgbBordersLine.height = this.map.size.height + borderWidth * 2;

      this.create();
    });
  }

  private applyFilter(): void {
    this.colorMatrixFilter = new filters.ColorMatrixFilter();
    this.filters = [this.colorMatrixFilter];
  }

  private animateFilter(): void {
    const { deltaTime } = PIXI.Ticker.shared;
    const { borderType } = this.map.world.settings.all.settings.theming.map;

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
    const { borderGlow, borderWidth, borderGlowDistance } = this.map.world.settings.all.settings.theming.map;
    const { glowFilterShaderType } = this.map.world.settings.all.settings.game.performance;
    const MAP_RATIO = 14142 / 2048;
    
    if (this.bordersSprite) {
      // this.map.world.textureGenerator.generateMapBorders();
      this.removeChild(this.bordersSprite);
      this.bordersSprite.destroy();
      this.map.world.textureGenerator.generateMapBorders();
    }

    let bordersSize = this.map.size.width;
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

    this.bordersSprite = new NineSlicePlane(this.map.world.textureGenerator.mapBorders, sideSize, sideSize, sideSize, sideSize);
    this.bordersSprite.width = bordersSize;
    this.bordersSprite.height = bordersSize;
    this.bordersSprite.x = pos;
    this.bordersSprite.y = pos;

    this.addChild(this.bordersSprite);
  }

  private createRgb(): void {
    const size = 1100;

    if (this.rgbBorders || this.rgbBordersLine) {
      this.map.world.textureGenerator.generateRgbLine();
      this.removeChild(this.rgbBorders, this.rgbBordersLine);
      this.rgbBorders.destroy();
      this.rgbBordersLine.destroy();
    }

    // HARDCODED POSITION
    const borderWidth = 20;

    this.rgbBorders = new Sprite(this.map.world.textureGenerator.rgbBorder);
    this.rgbBorders.width = this.map.size.width + size;
    this.rgbBorders.height = this.map.size.height + size;
    this.rgbBorders.x = -size / 2;
    this.rgbBorders.y = -size / 2;

    this.rgbBordersLine = new Sprite(this.map.world.textureGenerator.mapBordersRgbLine);
    this.rgbBordersLine.width = this.map.size.width + borderWidth * 2;
    this.rgbBordersLine.height = this.map.size.height + borderWidth * 2;
    this.rgbBordersLine.x = -borderWidth;
    this.rgbBordersLine.y = -borderWidth;

    this.addChild(this.rgbBorders, this.rgbBordersLine);
  }

  public renderTick(): void {
    const { borderType } = this.map.world.settings.all.settings.theming.map

    this.visible = borderType !== 'Disabled';
    this.rgbBorders.visible = borderType === 'RGB' || borderType === 'RGB (anim)';
    this.rgbBordersLine.visible = borderType === 'RGB' || borderType === 'RGB (anim)';
    this.bordersSprite.visible = borderType === 'Common' || borderType === 'Common (anim)';

    this.animateFilter();
  }
}