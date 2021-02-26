import { Sprite } from "pixi.js";
import Cell from ".";
import TextureGenerator from '../../Textures/TexturesGenerator';

export default class CellSprite extends Sprite {
  constructor(size: number, private cell: Cell) {
    super(TextureGenerator.cell);
    this.sortableChildren = true;
    this.width = size;
    this.height = size;
    this.anchor.set(0.5);
    this.zIndex = 2;
  }
}