import { utils, Application } from 'pixi.js';
import { RGB } from './objects/types';

export default new class Globals {
  public app: Application;
  public gameBlured: boolean;
  public gameBluring: boolean;
  public ticks: number;
  public gameJoined: boolean;
  public fullMapViewRender: boolean;

  public MAP_RATIO = 14142 / 2048;
  
  public init(app: Application): void {
    this.app = app;
    this.gameBlured = false;
    this.gameBluring = false;
    this.ticks = 0;
    this.gameJoined = false;
    this.fullMapViewRender = true;
  }

  public renderTick(): void {
    this.ticks++;
  }

  private componentToHex(c: number) {
    const hex = c ? c.toString(16) : '';
    return hex.length == 1 ? "0" + hex : hex;
  }

  public rgbToStringHex({ red, green, blue }: RGB): string {
    return "#" + this.componentToHex(red) + this.componentToHex(green) + this.componentToHex(blue);
  }

  public getTintColor(darkenValue: number, { red, green, blue }: RGB): number {
    const darkenR = darkenValue / red;
    const darkenG = darkenValue / green;
    const darkenB = darkenValue / blue;

    const r = darkenR > 1 ? 1 : darkenR;
    const g = darkenG > 1 ? 1 : darkenG;
    const b = darkenB > 1 ? 1 : darkenB;

    return utils.rgb2hex([r, g, b]);
  }

  public getColor({ red, green, blue }: RGB): number {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;

    return utils.rgb2hex([r, g, b]);
  }

  public roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, r: number): void {
    const radius = {
      tl: r, 
      tr: r, 
      br: r, 
      bl: r
    };

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  }
}