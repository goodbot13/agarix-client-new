import { Texture } from "pixi.js";
import Logger from "../utils/Logger";

class CachedTexture {
  private lastUsedTime: number;
  public key: string;
  public texture: Texture;

  constructor(texure: Texture, key: string) {
    this.texture = texure;
    this.key = key;
    this.update();
  }

  public update() {
    this.lastUsedTime = Date.now();
  }

  public canBeRemoved() {
    /* return (Date.now() - this.lastUsedTime) > Settings.globals.textureLifetime * 60000; */
  }
}

class Cache {
  private massTextures: Map<string, Texture>;
  private nameTextures: Map<string, CachedTexture>;
  private logger: Logger;

  constructor() {
    this.massTextures = new Map();
    this.nameTextures = new Map();
    this.logger = new Logger('TextureCache');
    /* setInterval(() => this.clearNames(), Settings.globals.textureCheckInterval); */
  }

  public addMassTexture(mass: string, texture: Texture): void {
    this.massTextures.set(mass, texture);
  }

  public addNameTexture(name: string, texture: Texture): void {
    this.nameTextures.set(name, new CachedTexture(texture, name));

    /* if (this.nameTextures.size > Settings.globals.texturesBufferSize) {
      this.clearNames();
    } */
  }

  public getMassTexture(mass: string): Texture {
    return this.massTextures.get(mass);
  }

  public updateLastUsed(name: string): void {
    this.nameTextures.get(name).update();
  }

  public getNameTexture(name: string): Texture {
    const cached = this.nameTextures.get(name);
    let texture = cached ? cached.texture : undefined;

    if (texture) {
      cached.update();
    }

    return texture;
  }

  public clearNames(): void {
    [...this.nameTextures.values()].filter((cached) => cached.canBeRemoved()).forEach((cached, index) => {
      setTimeout(() => {
        cached.texture.destroy(true);
        Texture.removeFromCache(cached.texture);
      }, index * 5); // delay the destroy helps to avoid freezes
    });

    this.logger.info(`Textures cleanup due to world change (buffer size: ${this.nameTextures.size}).`,);

    this.nameTextures.clear();
  }
}

export default Cache;