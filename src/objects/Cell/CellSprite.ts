import { Sprite } from "pixi.js";
import Cell from ".";
import World from "../../render/World";

export default class CellSprite extends Sprite {
  constructor(private world: World) {
    super(world.textureGenerator.cell);
    this.sortableChildren = true;
    this.anchor.set(0.5);
    this.zIndex = 2;
  }

  public setSize(size: number) {
    this.width = size;
    this.height = size;
  }
}