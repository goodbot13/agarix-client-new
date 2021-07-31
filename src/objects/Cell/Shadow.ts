import { Sprite } from "pixi.js";
import Cell from './index';

export default class Shadow {
  public sprite: Sprite;
  public TEXTURE_OFFSET: number;

  constructor(private cellSprite: Sprite, private cell: Cell) {
    this.TEXTURE_OFFSET = this.cell.world.textureGenerator.cellShadow.width / this.cell.world.textureGenerator.cell.width;

    this.sprite = new Sprite(this.cell.world.textureGenerator.cellShadow);
    this.sprite.anchor.set(0.5);
    this.sprite.zIndex = 1;
  }

  public setSize(size: number) {
    this.sprite.width = size * this.TEXTURE_OFFSET;
    this.sprite.height = size * this.TEXTURE_OFFSET;
  }

  public update(): void {
    const { shadow } = this.cell.world.settings.all.settings.game.cells;

    if (shadow === 'All') {
      this.sprite.visible = true;
    } else if (shadow === 'Disabled') {
      this.sprite.visible = false;
    } else if (shadow === 'Only me') {
      this.sprite.visible = this.cell.isPlayerCell;
    }
  }

  public updateTexture(): void {
    if (this.cell.isPlayerCell) {
      this.sprite.texture = this.cell.world.textureGenerator.myCellShadow;
      this.TEXTURE_OFFSET = this.cell.world.textureGenerator.myCellShadow.width / this.cell.world.textureGenerator.cell.width;
    } else {
      this.sprite.texture = this.cell.world.textureGenerator.cellShadow;
      this.TEXTURE_OFFSET = this.cell.world.textureGenerator.cellShadow.width / this.cell.world.textureGenerator.cell.width;
    }

    this.sprite.width = this.sprite.height = this.cellSprite.width * this.TEXTURE_OFFSET;
  }
}