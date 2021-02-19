import { Sprite, Texture, MIPMAP_MODES, SCALE_MODES, utils } from "pixi.js";
import Cell from ".";
import GameSettings from "../../Settings/Settings";

export default class CellStats {
  public name: Sprite;
  public mass: Sprite;
  private nameInserted: boolean;
  private massInserted: boolean;

  constructor(private cell: Cell) {
    let nick = cell.nick === undefined ? '__undefined__' : cell.nick;

    this.name = new Sprite();
    this.name.anchor.set(0.5);
    this.name.scale.set(1.2);
    this.name.zIndex = 0;

    this.mass = new Sprite();
    this.mass.anchor.set(0.5);
    this.mass.scale.set(1.2);
    this.mass.y = 100;

    this.updateNick(nick);
    this.updateMass(cell.shortMass);
  }

  public update(): void {
    const { mass, myMass, nicks, myNick, autoHideMassAndNicks } = GameSettings.all.settings.game.cells;

    const mNicks = GameSettings.all.settings.game.minimap.nicks;
    const mMass = GameSettings.all.settings.game.minimap.mass;

    if (this.cell.isMinimap && this.cell.isTeam) {
      this.name.visible = mNicks;
      this.name.scale.set(7);
      this.name.y = -512;
      return;
    }

    if (this.cell.isPlayerCell) {
      this.mass.visible = myMass;
      this.name.visible = myNick;
    } else {
      if (this.cell.isMinimap && this.cell.originalSize >= 22) {
        this.name.visible = mNicks;
        this.mass.visible = mMass;
        this.name.scale.set(1.5);
      } else if (this.cell.originalSize <= 40) {
        this.mass.visible = false;
        this.name.visible = false;
      } else {
        const visible = autoHideMassAndNicks ? this.cell.originalSize > (22 / this.cell.world.view.camera.scale) : true;
        this.mass.visible = visible && mass;
        this.name.visible = visible && nicks;
      }
    }
  }

  public updateTint(tint: number): void {
    this.name.tint = tint;
    this.mass.tint = tint;
  }

  public updateNick(_nick: string): void {
    const { cache } = this.cell.world.textureGenerator;
    const nameTexture = cache.getNameTexture(_nick);

    if (nameTexture) {
      this.name.texture = nameTexture;
    } else {
      const texture = this.createText(_nick);
      cache.addNameTexture(_nick, texture);
      this.name.texture = texture;
    }
  }

  public updateMass(_mass: string): void {
    const { cache } = this.cell.world.textureGenerator;
    const massTexture = cache.getMassTexture(_mass);

    if (massTexture) {
      this.mass.texture = massTexture;
    } else {
      const texture = this.createText(_mass, false);
      cache.addMassTexture(_mass, texture);
      this.mass.texture = texture;
    }
  }

  public createText(text: string, nick: boolean = true): Texture {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const drawText = text === '__undefined__' ? '' : text;
    const font = nick ? '96px Quicksand' : '64px Quicksand';
    const lineWidth = nick ? 5 : 3;

    ctx.textAlign = 'center';
    ctx.lineWidth = lineWidth;
    ctx.font = font;
    
    let { width } = ctx.measureText(drawText);
    width += lineWidth * 2;

    if (!nick && text.length <= 2) {
      width *= 1.5;
    }

    if (width > 2048) {
      width = 2048;
    }

    canvas.width = width;
    canvas.height = width;

    ctx.textAlign = 'center';
    ctx.font = font;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#606060';
    ctx.fillStyle = '#FFF';
    ctx.strokeText(drawText, canvas.width / 2, canvas.height / 2);
    ctx.fillText(drawText, canvas.width / 2, canvas.height / 2);

    utils.trimCanvas(canvas);

    const texture = Texture.from(canvas);
    texture.baseTexture.mipmap = MIPMAP_MODES.ON;
    texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

    return texture;
  }
}