import { Container, filters, Graphics, Sprite, WRAP_MODES } from "pixi.js";
import GameSettings from "../../Settings/Settings";
import TextureGenerator from "../../Textures";
import * as PIXI from 'pixi.js';
import Globals from "../../Globals";
import ViewportVisualizer from "./ViewportVisualizer";
import View from "../../View";
import IMapObject from './interfaces';

export default class Background extends Container implements IMapObject {
  private sprite: Sprite;
  private displacementSprite: Sprite;
  private spriteContainer: Container;
  private gmask: Graphics;
  private viewportVisualizer: ViewportVisualizer;

  constructor(view: View, private textureGenerator: TextureGenerator) {
    super();

    this.create();
    this.zIndex = 9;

    this.viewportVisualizer = new ViewportVisualizer(view, textureGenerator);
    this.viewportVisualizer.zIndex = 100;
    this.spriteContainer.addChild(this.viewportVisualizer);
  }

  public async updateTexture(): Promise<any> {
    const texture = await this.textureGenerator.updateBackground();
    this.sprite.cacheAsBitmap = false;
    this.sprite.texture = texture;
    this.sprite.cacheAsBitmap = true;
  }

  public updateTint() {
    this.sprite.cacheAsBitmap = false;
    this.sprite.tint = Globals.getColor(GameSettings.all.settings.theming.map.backgroundTint);
    this.sprite.cacheAsBitmap = true;
  }

  private applyMask(): void {
    if (!this.mask) {
      this.gmask = new Graphics();
      this.gmask.beginFill(0xffffff);
      this.gmask.drawRect(0, 0, 14142, 14142);
      this.gmask.endFill();

      this.addChild(this.gmask);
      this.mask = this.gmask;
    }
  }

  private create(): void {
    const size = 14142;

    if (!this.spriteContainer) {
      this.spriteContainer = new Container();
      this.addChild(this.spriteContainer); 
    }

    if (this.sprite) {
      this.spriteContainer.removeChild(this.sprite);
      this.sprite.destroy();
    }

    this.sprite = new Sprite(this.textureGenerator.mapBackgroundImage);
    this.sprite.zIndex = 99;
    this.sprite.width = size + 800;
    this.sprite.height = size + 800;
    this.sprite.position.set(-400, -400);

    this.spriteContainer.addChild(this.sprite);

    if (!this.displacementSprite) {
      this.displacementSprite = new Sprite(this.textureGenerator.backgroundDisplacement);
      this.displacementSprite.texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
      this.displacementSprite.width = size;
      this.displacementSprite.height = size;
      this.displacementSprite.position.set(0, 0);
      this.displacementSprite.cacheAsBitmap = true;

      this.spriteContainer.addChild(this.displacementSprite);
      this.spriteContainer.filters = [new filters.DisplacementFilter(this.displacementSprite)];
    }

    this.applyMask();
    this.updateTint();
  }

  private animateDisplacement(): void {
    const { backgroundImageLiveEffectStrength } = GameSettings.all.settings.theming.map;

    const liveEffectEnabled = backgroundImageLiveEffectStrength !== 'Disabled';
    const strength = Number(backgroundImageLiveEffectStrength); 
    // temprary
    const isLiveEffectStatic = false;

    if (liveEffectEnabled) {
      const { deltaTime } = PIXI.Ticker.shared;

      if (!this.spriteContainer.filters.length) {
        this.spriteContainer.filters = [new filters.DisplacementFilter(this.displacementSprite)];
        this.displacementSprite.visible = true;
      }

      let x = 0;
      let y = 0;
  
      if (isLiveEffectStatic) {
        x += strength * deltaTime;
        y += strength * deltaTime;
      } else {
        x = Math.round(Math.random() * strength) * deltaTime;
        y = Math.round(Math.random() * strength) * deltaTime;
      }
  
      this.displacementSprite.x += x;
      this.displacementSprite.y += y;
      this.displacementSprite.visible = true;
    } else {
      if (this.spriteContainer.filters.length) {
        this.spriteContainer.filters = [];
        this.displacementSprite.visible = false;
      }
    }
  }

  public renderTick(): void {
    this.viewportVisualizer.renderTick();

    this.sprite.visible = GameSettings.all.settings.theming.map.backgroundImage;
    this.displacementSprite.visible = GameSettings.all.settings.theming.map.backgroundImage;

    this.animateDisplacement();
  }
}