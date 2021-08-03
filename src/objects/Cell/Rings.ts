import { Sprite } from "pixi.js";
import Cell from "./index";;
import * as PIXI from 'pixi.js';
import { getColor } from "../../utils/helpers";
import SettingsState from "../../states/SettingsState";

export default class Rings {
  public innerRing: Sprite;
  public outerRing: Sprite;
  private readonly INNER_RING_SPEED: number = 0.0028;
  private readonly OUTER_RING_SPEED: number = 0.0032;

  constructor(private cell: Cell) {
    this.innerRing = new Sprite();
    this.innerRing.scale.set(1.0206);
    this.innerRing.zIndex = 4;
    this.innerRing.anchor.set(0.5);

    this.outerRing = new Sprite();
    this.outerRing.zIndex = 4;
    this.outerRing.anchor.set(0.5);
  }

  private updateTint(): void {
    const { isPlayerCell, multiboxFocuesTab } = this.cell;
    const { focusedRingColor, initialRingColor } = this.cell.world.settings.all.settings.theming.multibox;
    const { changeRingColor } = this.cell.world.settings.all.settings.game.multibox;

    if (isPlayerCell) {
      if (multiboxFocuesTab && changeRingColor) {
        this.innerRing.tint = this.outerRing.tint = getColor(focusedRingColor);
      } else {
        this.innerRing.tint = this.outerRing.tint = getColor(initialRingColor);
      }
    }
  }

  private spin(): void {
    if (this.cell.world.settings.all.settings.game.cells.ringsSpinning) {
      const { deltaTime } = PIXI.Ticker.shared;
      this.outerRing.rotation += this.OUTER_RING_SPEED * deltaTime;
      this.innerRing.rotation -= this.INNER_RING_SPEED * deltaTime;
    }
  }

  private setAuthorRing(): void {
    const { ringsType } = this.cell.world.settings.all.settings.game.cells;

    switch (ringsType) {
      case 'Acimazis':
        this.innerRing.texture = this.cell.world.textureGenerator.innerRing;
        this.outerRing.texture = this.cell.world.textureGenerator.outerRing;
        this.outerRing.scale.set(1);
        this.innerRing.visible = this.outerRing.visible = true;
        break;

      case '2CL':
        this.outerRing.texture = this.cell.world.textureGenerator.hsloRing;
        this.outerRing.scale.set(1.149);
        this.innerRing.visible = false;
        this.outerRing.visible = true;
        break;

      case 'Yue':
        this.outerRing.texture = this.cell.world.textureGenerator.removeAnimationYue[2];
        this.outerRing.scale.set(1.149);
        this.innerRing.visible = false;
        this.outerRing.visible = true;
        break;
    }
  }

  public update(): void {

    if (!SettingsState.rings) {
      this.innerRing.visible = this.outerRing.visible = false;
      return;
    }
    
    const { ringsType } = this.cell.world.settings.all.settings.game.cells;
    const { isPlayerCell, isTeam } = this.cell;

    const enabledAndPlayer = ringsType !== 'Disabled' && isPlayerCell;
    const enabledForTeam = ringsType !== 'Disabled' && isTeam;
    const multiboxEnabled = this.cell.world.settings.all.settings.game.multibox.enabled;

    if (isPlayerCell && multiboxEnabled) {
      if (this.cell.world.settings.all.settings.game.multibox.ring) {
        if (this.cell.world.settings.all.settings.theming.multibox.ringStyle === 'Line') {
          this.outerRing.scale.set(1);
          this.outerRing.texture = this.cell.world.textureGenerator.multiboxLinedRing;
          this.innerRing.visible = false;
          this.outerRing.visible = true;
        } else {
          this.setAuthorRing();
          this.spin();
        }
      } else {
        this.outerRing.visible = this.innerRing.visible = false;
      }
      this.updateTint();
    } else if (enabledAndPlayer || enabledForTeam) {
      this.setAuthorRing();
      this.spin();
    } else {
      this.outerRing.visible = this.innerRing.visible = false;
    }
  }
} 