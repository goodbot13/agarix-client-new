import { BitmapFont, TextStyle } from "pixi.js";

export default class MassFontsGenerator {
  private readonly CHARS_SET: Array<string> = ['.', 'k', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  private readonly TEXTURE_SIZE: number = 256;

  public generateLatoBitmap(): void {
    const style = new TextStyle({
      fontFamily: 'Tajawal',
      fontWeight: '500',
      fill: 0xFFFFFF,
      fontSize: 128,
      align: 'center',
      stroke: 0x161616,
      strokeThickness: 5,
    });

    BitmapFont.from('MassLato', style, {
      chars: this.CHARS_SET,
      textureWidth: this.TEXTURE_SIZE,
      textureHeight: this.TEXTURE_SIZE,
      resolution: 1
    });
  }
}