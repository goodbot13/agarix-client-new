import { Texture } from "pixi.js";

export default class CellNicksCache {
  private pool: Map<string, Texture | null> = new Map();

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
    this.pool.forEach((texture) => texture.destroy(true));
  }
}