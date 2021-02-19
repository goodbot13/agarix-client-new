import { Sprite } from "pixi.js";
import GameSettings from "../../Settings/Settings";
import Cell from "./index";
import Globals from "../../Globals";
import * as PIXI from 'pixi.js';

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
    const { focusedRingColor, initialRingColor } = GameSettings.all.settings.theming.multibox;
    const { changeRingColor } = GameSettings.all.settings.game.multibox;

    if (isPlayerCell) {
      if (multiboxFocuesTab && changeRingColor) {
        this.innerRing.tint = this.outerRing.tint = Globals.getColor(focusedRingColor);
      } else {
        this.innerRing.tint = this.outerRing.tint = Globals.getColor(initialRingColor);
      }
    }
  }

  public update(): void {

    const { ringsType, ringsSpinning } = GameSettings.all.settings.game.cells;

    const { deltaTime } = PIXI.Ticker.shared;
    const { textureGenerator } = this.cell.world;
    const { isPlayerCell, isTeam } = this.cell;

    const enabledAndPlayer = ringsType !== 'Disabled' && isPlayerCell;
    const enabledForTeam = /* ringsEnabled && !onlyMyCellRings && isTeam; */ true;
    const multiboxEnabled = GameSettings.all.settings.game.multibox.enabled;
    const isMultiboxRingLine = GameSettings.all.settings.theming.multibox.ringStyle === 'Line';

    if (enabledAndPlayer || enabledForTeam) {

      if (isPlayerCell && multiboxEnabled && isMultiboxRingLine) {
        this.outerRing.texture = textureGenerator.multiboxLinedRing;
        this.outerRing.scale.set(1);
        this.outerRing.visible = true;
        this.innerRing.visible = false;
      } else if (ringsType === 'Acimazis') {
        this.innerRing.texture = textureGenerator.innerRing;
        this.outerRing.texture = textureGenerator.outerRing;
        this.outerRing.scale.set(1);
        this.innerRing.visible = this.outerRing.visible = true;
      } else if (ringsType === '2CL') {
        this.outerRing.texture = textureGenerator.hsloRing;
        this.outerRing.scale.set(1.15);
        this.innerRing.visible = false;
        this.outerRing.visible = true;
      } else if (ringsType === 'Yue') {
        this.outerRing.texture = textureGenerator.removeAnimationYue[2];
        this.outerRing.scale.set(1.15);
        this.innerRing.visible = false;
        this.outerRing.visible = true;
      }
      
      if (ringsSpinning) {
        this.outerRing.rotation += this.OUTER_RING_SPEED * deltaTime;
        this.innerRing.rotation -= this.INNER_RING_SPEED * deltaTime;
      }

      this.updateTint();
      
    } else {
      this.outerRing.visible = this.innerRing.visible = false;
    }

  }
} 