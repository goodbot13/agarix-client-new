import { MIPMAP_MODES, SCALE_MODES, Texture } from "pixi.js"
import Master from "../Master";
import Logger from "./Logger";

export default class SkinsLoader {

  // actual skins cache
  private cache: Map<string, Texture> = new Map();

  // used to store onload skin callbacks for multiple request of same skin 
  private requestPool: Map<string, Array<(skinTexture: Texture | null) => void>> = new Map();

  // urls which failed to load. Used to ignore and prevent loading cycle
  private failedToLoadUrls: Set<string> = new Set();

  private logger: Logger = new Logger('SkinsLoader');

  constructor() {
    (window as any).skinsLoader = this;
  }

  private blobToTexture(blob: Blob): Promise<Texture> {
    return new Promise((resolve, reject) => {

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
  
      img.onload = () => {
        canvas.width = canvas.height = 512;
        
        if (img.width === 1024 && img.height === 512) {
  
          // agar level skins are splitted by two parts (vertical) of two 512x512 images
          // so draw just left part of it
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

        texture.update();
        texture.baseTexture.mipmap = MIPMAP_MODES.ON;
        texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

        // return drawn image as texture
        resolve(texture);
      }
  
      img.onerror = () => reject();
  
      img.src = URL.createObjectURL(blob);

    });
  }

  private getSkinTexture(url: string): Promise<Texture> {
    return new Promise(async (resolve, reject) => {

      // load skin data by url
      await fetch(url).then((response) => response.blob()).then((blob) => {

        // transform loaded skin data to texture
        this.blobToTexture(blob).then((texture) => {

          resolve(texture);

        }).catch((reason) => {
          this.logger.error('Error while creating texture blob.');
          reject();
        });
        
      }).catch((reason) => {
        this.logger.error(`Error while fetching skin url ${url}`);
        reject();
      });

    });
  }

  private checkUrlAndCache(url: string, onLoad: (skinTexture: Texture | null) => void): boolean {
    // check if this url has failed before
    if (this.failedToLoadUrls.has(url)) {
      onLoad(null);
      return true;
    }

    // check if we already have requested skin in cache, just return it
    if (this.cache.has(url)) {
      onLoad(this.cache.get(url));
      return true;
    } 
  }

  private startSkinGeneration(url: string, onLoad: (skinTexture: Texture | null) => void): void {

    // there is no skin in cache. A new texture has to be generated
    const pool = this.requestPool.get(url) || [];
    pool.push(onLoad);

    this.requestPool.set(url, pool);

    // texture generation is already fired 
    if (pool.length > 1) {
      return;
    }

    // generate with delay to avoid lag spikes (freezes)
    setTimeout(() => {

      this.getSkinTexture(url).then((texture) => {

        this.cache.set(url, texture);

        // fire all onLoad callbacks which were assigned to this texture load
        pool.forEach((onLoad) => onLoad(texture));

        // clean up
        this.requestPool.delete(url);

      }).catch(() => {

        // error to load this url. Add to blacklist
        this.failedToLoadUrls.add(url);
        pool.forEach((onLoad) => onLoad(null));

      });

    }, (this.requestPool.size - 1) * 150);
  }

  public getCustomSkin(url: string, onLoad: (skinTexture: Texture | null) => void): void {
    if (this.checkUrlAndCache(url, onLoad)) {
      return;
    }

    this.startSkinGeneration(url, onLoad);
  }

  public getAgarSkinByPlayerNick(nick: string, onLoad: (skinTexture: Texture | null) => void): void {
    const skinData = Master.skins.get(nick);

    let url = '';

    if (!skinData) {
      onLoad(null);
      return;
    }

    url = skinData.url;

    if (this.checkUrlAndCache(url, onLoad)) {
      return;
    }

    this.startSkinGeneration(url, onLoad);
  }

  public getAgarSkinBySkinName(skinName: string, onLoad: (skinTexture: Texture | null) => void): void {
    let url = '';

    if (!skinName) {
      return;
    }

    if (skinName.includes('custom')) {
      url = `${Master.envConfig.CUSTOM_SKINS_URL}${skinName}.png`;
    } else {
      url = Master.skins.get(skinName).url;
    }

    if (this.checkUrlAndCache(url, onLoad)) {
      return;
    }

    this.startSkinGeneration(url, onLoad);
  }
}