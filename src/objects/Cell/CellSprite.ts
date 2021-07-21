import { Sprite } from "pixi.js";
import Cell from ".";
import TextureGenerator from '../../Textures/TexturesGenerator';

export default class CellSprite extends Sprite {
  constructor() {
    super(TextureGenerator.cell);
    this.sortableChildren = true;
    this.anchor.set(0.5);
    this.zIndex = 2;
  }

  public setSize(size: number) {
    this.width = size;
    this.height = size;
  }
}