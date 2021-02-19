import { Sprite } from "pixi.js";
import Cell from ".";
import Globals from "../../Globals";
import World from '../../render/World';

export default class CellSprite extends Sprite {
  constructor(world: World, size: number, private cell: Cell) {
    super(world.textureGenerator.cell);
    this.sortableChildren = true;
    this.width = size;
    this.height = size;
    this.anchor.set(0.5);
    this.zIndex = 2;
  }
}