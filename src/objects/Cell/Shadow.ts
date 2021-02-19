import { Sprite } from "pixi.js";
import World from "../../render/World";
import GameSettings from "../../Settings/Settings";
import Cell from './index';

export default class Shadow {
  public sprite: Sprite;
  public TEXTURE_OFFSET: number;

  constructor(private world: World, private cellSprite: Sprite, private cell: Cell, size: number) {
    this.TEXTURE_OFFSET = world.textureGenerator.cellShadow.width / world.textureGenerator.cell.width;

    this.sprite = new Sprite(world.textureGenerator.cellShadow);
    this.sprite.anchor.set(0.5);
    this.sprite.width = size * this.TEXTURE_OFFSET;
    this.sprite.height = size * this.TEXTURE_OFFSET;
    this.sprite.zIndex = 1;
  }

  public update(): void {
    const { shadow } = GameSettings.all.settings.game.cells;

    if (shadow === 'All') {
      this.sprite.visible = true;
    } else if (shadow === 'Disabled') {
      this.sprite.visible = false;
    } else if (shadow === 'Only me') {
      this.sprite.visible = this.cell.isPlayerCell;
    }
  }

  public changeTexture(): void {
    const { textureGenerator } = this.world;

    this.sprite.texture = textureGenerator.cellShadow;
    this.TEXTURE_OFFSET = textureGenerator.cellShadow.width / textureGenerator.cell.width;
    this.sprite.width = this.sprite.height = this.cellSprite.width * this.TEXTURE_OFFSET;
  }
}