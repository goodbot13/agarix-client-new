import { MIPMAP_MODES, SCALE_MODES, Texture } from 'pixi.js';
import Master from '../Master';
import Logger from './Logger';

export default new (class SkinsLoader {
  private cache: Map<string, Texture>;
  private pool: Set<string>;

  private logger: Logger;

  constructor() {
    this.cache = new Map();
    this.pool = new Set();
    this.logger = new Logger('SkinsLoader');
  }

  private cacheSkin(url: string) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);

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
        };

        img.onerror = () => {
          throw Error();
        };
      })
      .catch(() => this.logger.error(`Could not load skin. URL: ${url}`));
  }

  public load(url: string): void {
    if (!url) {
      return;
    }

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
      this.load(`${Master.envConfig.CUSTOM_SKINS_URL}${skinName}.png`);
    }

    const skinData = Master.skins.get(skinName || playerName.toLowerCase());

    if (skinData) {
      this.load(skinData.url);
    }
  }

  public getAgar(skinName: string = ''): Texture | null {
    if (skinName.includes('custom')) {
      return this.cache.get(`${Master.envConfig.CUSTOM_SKINS_URL}${skinName}.png`);
    }

    const skinData = Master.skins.get(skinName);

    if (skinData) {
      return this.cache.get(skinData.url);
    }

    return null;
  }

  public getAgarByNick(nick: string = ''): Texture | null {
    const data = Master.skins.get(nick);

    if (data) {
      return this.cache.get(data.url);
    }

    return null;
  }

  public getTextureByUrl(url: string): Texture {
    return this.cache.get(url);
  }
})();
