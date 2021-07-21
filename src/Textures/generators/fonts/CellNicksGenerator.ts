import { Texture, utils, SCALE_MODES, MIPMAP_MODES } from "pixi.js";
import Logger from "../../../utils/Logger";

export default class CellNicksGenerator {
  private pool: Map<string, Texture | null> = new Map();
  private textCreationPool: Map<string, Array<(texture: Texture) => void>> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('NicksCache');
  }

  private has(nick: string): boolean {
    return this.pool.has(nick);
  }

  private get(nick: string): Texture | null {
    return this.pool.get(nick);
  }

  private set(nick: string, texture: Texture): void {
    this.pool.set(nick, texture);
  }

  private generateTexture(text: string): Texture {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const drawText = text === '__undefined__' ? '' : text;
    const font = 'bold 128px Lato';
    const lineWidth = 5;

    ctx.textAlign = 'center';
    ctx.lineWidth = lineWidth;
    ctx.font = font;
    
    let { width } = ctx.measureText(drawText);
    width += lineWidth * 2;

    if (width > 2048) {
      width = 2048;
    }

    canvas.width = width;

    if (text.length <= 3) {
      canvas.height = width * 2;
    } else {
      canvas.height = width;
    }

    ctx.textAlign = 'center';
    ctx.font = font;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#606060';
    ctx.fillStyle = '#FFF';
    ctx.strokeText(drawText, canvas.width / 2, canvas.height / 2);
    ctx.fillText(drawText, canvas.width / 2, canvas.height / 2);

    const texture = Texture.from(canvas);
    texture.baseTexture.mipmap = MIPMAP_MODES.ON;
    texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

    return texture;
  }

  public createNick(text: string, onCreateCallback: (texture: Texture) => void): void {

    // if there is already generated texture, return it
    if (this.has(text)) {
      onCreateCallback(this.get(text));
      return;
    }

    // if there is no generated texture, add text of the nickname to pool with callback
    // callback is gonna be fired right after the texture is generated
    const pool = this.textCreationPool.get(text) || [];
    pool.push(onCreateCallback);
    this.textCreationPool.set(text, pool);

    // generate with delay to decrease lag spikes
    setTimeout(() => {

      const texture = this.generateTexture(text);

      this.set(text, texture);

      // loop over all listeners (callbacks) assigned to this text
      // pool is a link to array so no need to call get method for textCreationPool again
      pool.forEach((onCreate) => onCreate(texture));

      // remove text from pool 
      this.textCreationPool.delete(text);

    }, (this.textCreationPool.size - 1) * 1000);
  }

  public clear(): void {
    const MAX_SAFE_SIZE = 768;

    if (this.pool.size <= MAX_SAFE_SIZE) {
      return;
    }

    this.pool.forEach((texture) => texture.destroy(true));

    this.logger.info(`Max safe size reached (${MAX_SAFE_SIZE}). Pool size cleared: ${this.pool.size} entries`);
    
    this.pool.clear();
  }
}