import { Texture } from "pixi.js";
import Logger from "../../utils/Logger";

export default class CellNicksCache {
  private pool: Map<string, Texture | null> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('NicksCache');
  }

  public has(nick: string): boolean {
    return this.pool.has(nick);
  }

  public get(nick: string): Texture | null {
    return this.pool.get(nick);
  }

  public set(nick: string, texture: Texture): void {
    this.pool.set(nick, texture);
  }

  public clear(): void {
    const MAX_SAFE_SIZE = 512;

    if (this.pool.size <= MAX_SAFE_SIZE) {
      return;
    }

    this.pool.forEach((texture) => texture.destroy(true));

    this.logger.info(`Max safe size reached (${MAX_SAFE_SIZE}). Pool size cleared: ${this.pool.size} entries`);
    
    this.pool.clear();
  }
}