import { Container, filters, Sprite } from "pixi.js";
import * as PIXI from 'pixi.js';
import IMapObject from "./interfaces";
import { getColor } from "../../utils/helpers";
import Map from "./Map";

export default class GlobalBackground extends Container implements IMapObject {
  private sprite: Sprite;
  private displacementSprite: Sprite;
  private spriteContainer: Container;

  constructor(private map: Map) {
    super();

    this.spriteContainer = new Container();
    
    this.create();
    
    this.sprite.addChild(this.displacementSprite);
    this.addChild(this.spriteContainer);

    this.map.listen('sizechange', () => this.create());
  }

  public async updateTexture(): Promise<any> {
    const texture = await this.map.world.textureGenerator.updateGlobalBackground();
    this.sprite.cacheAsBitmap = false;
    this.sprite.texture = texture;
    this.sprite.cacheAsBitmap = true;
  }

  public updateTint(): void {
    this.sprite.cacheAsBitmap = false;
    this.sprite.tint = getColor(this.map.world.settings.all.settings.theming.map.globalBackgroundImageTint);
    this.sprite.cacheAsBitmap = true;
  }
  
  public create(): void {
    const backgroundData = this.map.world.textureGenerator.secondBackgroundImage.baseTexture;
    const ratio = backgroundData.width / backgroundData.height;
    let width = ratio === 1 ? 50000 : 40000;
    let height = width / ratio + (ratio === 1 ? 0 : 5000);

    if (~~this.map.size.width !== 14142) {
      width += 20000;
      height = width / ratio + (ratio === 1 ? 0 : 10000);
    }

    if (this.sprite) {
      this.spriteContainer.removeChild(this.sprite);
      this.sprite.destroy();
      this.sprite = null;
    }

    if (this.displacementSprite) {
      this.spriteContainer.removeChild(this.displacementSprite);
      this.displacementSprite.destroy();
      this.displacementSprite = null;
    }

    this.sprite = new Sprite(this.map.world.textureGenerator.secondBackgroundImage);
    this.sprite.width = width;
    this.sprite.height = height;
    // this.sprite.position.set(-width / 2 + this.map.size.width, -this.map.size.height / 2 + 7171);

    this.sprite.position.set(
      (-width / 2) + this.map.size.width / 2, 
      (-height / 2) + this.map.size.height / 2
    );


    if (!this.displacementSprite) {
      this.displacementSprite = new Sprite(this.map.world.textureGenerator.globalDisplacement);
      this.displacementSprite.width = width;
      this.displacementSprite.height = height;  
      this.displacementSprite.position.set(0, 0);
      this.displacementSprite.cacheAsBitmap = true;
  
      this.spriteContainer.addChild(this.displacementSprite);
      this.spriteContainer.filters = [new filters.DisplacementFilter(this.displacementSprite)];
    }

    this.spriteContainer.addChild(this.sprite);
    this.spriteContainer.zIndex = 8;

    this.updateTint();
  }
  
  private animateDispacement(): void {
    const { globalBackgroundImageLiveEffectStrength } = this.map.world.settings.all.settings.theming.map;

    const liveEffectEnabled = globalBackgroundImageLiveEffectStrength !== 'Disabled'; 
    // temporaty
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
        x += Number(globalBackgroundImageLiveEffectStrength) * deltaTime;
        y += Number(globalBackgroundImageLiveEffectStrength) * deltaTime;
      } else {
        x = Math.round(Math.random() * Number(globalBackgroundImageLiveEffectStrength)) * deltaTime;
        y = Math.round(Math.random() * Number(globalBackgroundImageLiveEffectStrength)) * deltaTime;
      }
  
      this.displacementSprite.x += x;
      this.displacementSprite.y += y;
    } else {
      if (this.spriteContainer.filters.length) {
        this.spriteContainer.filters = [];
        this.displacementSprite.visible = false;
      }
    }
  }

  public renderTick(): void {
    const { backgroundImage, globalBackgroundImage } = this.map.world.settings.all.settings.theming.map;

    this.visible = backgroundImage && globalBackgroundImage;
    
    this.animateDispacement();
  }
}