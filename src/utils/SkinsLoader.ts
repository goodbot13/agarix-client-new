import { MIPMAP_MODES, SCALE_MODES, Texture } from "pixi.js"
import Master from "../Master";

class SkinsLoader {
  private cache: Map<string, Texture>;
  private pool: Set<string>;
  
  constructor(private master: Master) {
    this.cache = new Map();
    this.pool = new Set();
  }

  private cacheSkin(url: string): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 512;

      const ctx = canvas.getContext('2d');

      // agar level skins 
      if (img.width === 1024 && img.height === 512) {
        ctx.drawImage(img, 0, 0, 512, 512, 0, 0, 512, 512);
      } else {
        ctx.drawImage(img, 0, 0, 512, 512);
      }
      
      ctx.globalCompositeOperation = 'destination-in';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.beginPath();
      ctx.arc(256, 256, 256, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      const texture = Texture.from(canvas);
      texture.baseTexture.mipmap = MIPMAP_MODES.ON;
      texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

      this.cache.set(url, texture);
    } 
  }

  public load(url: string): void {
    // skin is already loaded or exists in queue
    if (this.pool.has(url)) {
      return;
    }

    // add skin to queue
    this.pool.add(url);

    // load & cache it
    this.cacheSkin(url);
  }

  public loadAgar(skinName: string = '', playerName: string = ''): void {
    if (skinName.includes('custom')) {
      this.load(`${this.master.envConfig.CUSTOM_SKINS_URL}${skinName}.png`);
    } 

    const skinData = this.master.skins.get(skinName || playerName.toLowerCase());
    
    if (skinData) {
      this.load(skinData.url);
    }
  }

  public getTextureByAgarSkinName(skinName: string = '', playerName: string = ''): Texture {
    if (skinName.includes('custom')) {
      return this.cache.get(`${this.master.envConfig.CUSTOM_SKINS_URL}${skinName}.png`);
    } 

    const skinData = this.master.skins.get(skinName) || this.master.skins.get(playerName);

    return this.cache.get(skinData ? skinData.url : '');
  }

  public getTextureByUrl(url: string): Texture {
    return this.cache.get(url);
  }
}

export default SkinsLoader;