import { Sprite } from "pixi.js";
import GameSettings from "../../Settings/Settings";
import Cell from "./index";;
import * as PIXI from 'pixi.js';
import { getColor } from "../../utils/helpers";
import TextureGenerator from '../../Textures/TexturesGenerator';
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
    const { focusedRingColor, initialRingColor } = GameSettings.all.settings.theming.multibox;
    const { changeRingColor } = GameSettings.all.settings.game.multibox;

    if (isPlayerCell) {
      if (multiboxFocuesTab && changeRingColor) {
        this.innerRing.tint = this.outerRing.tint = getColor(focusedRingColor);
      } else {
        this.innerRing.tint = this.outerRing.tint = getColor(initialRingColor);
      }
    }
  }

  private spin(): void {
    if (GameSettings.all.settings.game.cells.ringsSpinning) {
      const { deltaTime } = PIXI.Ticker.shared;
      this.outerRing.rotation += this.OUTER_RING_SPEED * deltaTime;
      this.innerRing.rotation -= this.INNER_RING_SPEED * deltaTime;
    }
  }

  private setAuthorRing(): void {
    const { ringsType } = GameSettings.all.settings.game.cells;

    if (ringsType === 'Acimazis') {
      this.innerRing.texture = TextureGenerator.innerRing;
      this.outerRing.texture = TextureGenerator.outerRing;
      this.outerRing.scale.set(1);
      this.innerRing.visible = this.outerRing.visible = true;
    } else if (ringsType === '2CL') {
      this.outerRing.texture = TextureGenerator.hsloRing;
      this.outerRing.scale.set(1.149);
      this.innerRing.visible = false;
      this.outerRing.visible = true;
    } else if (ringsType === 'Yue') {
      this.outerRing.texture = TextureGenerator.removeAnimationYue[2];
      this.outerRing.scale.set(1.149);
      this.innerRing.visible = false;
      this.outerRing.visible = true;
    }
  }

  public update(): void {

    if (!SettingsState.rings) {
      this.innerRing.visible = this.outerRing.visible = false;
      return;
    }
    
    const { ringsType } = GameSettings.all.settings.game.cells;
    const { isPlayerCell, isTeam } = this.cell;

    const enabledAndPlayer = ringsType !== 'Disabled' && isPlayerCell;
    const enabledForTeam = ringsType !== 'Disabled' && isTeam;
    const multiboxEnabled = GameSettings.all.settings.game.multibox.enabled;

    if (isPlayerCell && multiboxEnabled) {
      if (GameSettings.all.settings.game.multibox.ring) {
        if (GameSettings.all.settings.theming.multibox.ringStyle === 'Line') {
          this.outerRing.scale.set(1);
          this.outerRing.texture = TextureGenerator.multiboxLinedRing;
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