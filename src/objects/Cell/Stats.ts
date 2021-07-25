import { BitmapText, Sprite, Point, TextStyle, Texture, MIPMAP_MODES, SCALE_MODES } from "pixi.js";
import Cell from ".";
import GameSettings from "../../Settings/Settings";
import WorldState from "../../states/WorldState";
import * as PIXI from 'pixi.js';
import TexturesGenerator from "../../Textures/TexturesGenerator";

export default class CellStats {
  public nick: Sprite;
  public mass: BitmapText;

  private nick_text: string = '';
  private massValue: number = 0;
  private shortMassValue: string = '0';
  private currentAnchor: Point = new Point(0, 0);

  constructor(private cell: Cell) {
    this.mass = new BitmapText('0', { 
      fontName: 'MassLato' 
    });

    this.mass.scale.set(0.625);
    this.mass.zIndex = 5;
    this.setMassAnchor();

    this.nick = new Sprite();
    this.nick.anchor.set(0.45);
    this.nick.scale.set(0.85);
    this.nick.zIndex = 5;
  }
  
  private setMassAnchor(): void {
    if (GameSettings.all.settings.game.cells.nicks && this.nick_text) {
      if (this.currentAnchor.y !== -0.75) {
        this.mass.anchor.set(0.5, -0.75);
        this.currentAnchor = this.mass.anchor;
      }
    } else {
      if (this.currentAnchor.y !== 0.5) { 
        this.mass.anchor.set(0.5, 0.5);
        this.currentAnchor = this.mass.anchor;
      }
    }
  }

  public update(): void {
    const { mass, myMass, nicks, myNick, autoHideMassAndNicks } = GameSettings.all.settings.game.cells;

    const mNicks = GameSettings.all.settings.game.minimap.nicks;
    const mMass = GameSettings.all.settings.game.minimap.mass;

    if (this.cell.isMinimap && this.cell.isTeam) {
      this.nick.visible = this.nick.renderable = mNicks;
      this.nick.scale.set(7);
      this.nick.y = -700;
      return;
    }

    this.nick.y = 0;

    if (this.cell.isPlayerCell) {
      this.mass.visible = this.mass.renderable = myMass;
      this.nick.visible = this.nick.renderable = myNick;
    } else {
      if (this.cell.isMinimap && this.cell.originalSize >= 15) {
        this.nick.visible = this.nick.renderable = mNicks;
        this.mass.visible = this.mass.renderable = mMass;
        this.nick.scale.set(1.33);
      } else if (this.cell.originalSize <= 70) {
        this.mass.visible = this.mass.renderable = false;
        this.nick.visible = this.nick.renderable = false;
      } else {
        const visible = autoHideMassAndNicks ? this.cell.originalSize > (27 / this.cell.world.view.camera.scale) : true;
        this.mass.visible = this.mass.renderable = visible && mass;
        this.nick.visible = this.nick.renderable = visible && nicks;
        this.nick.scale.set(0.85);
      }
    }
  }

  public updateTint(tint: number): void {
    this.nick.tint = tint;
    this.mass.tint = tint;
  }

  public updateNick(nick: string): void {
    this.nick_text = nick;

    TexturesGenerator.cellNicksGenerator.createNick(nick, (texture) => {
      this.nick.texture = texture;
    });
  }
  
  private calculateMass(): void {
    this.massValue = ~~(this.cell.originalSize * this.cell.originalSize / 100);
    this.shortMassValue = Math.round(this.massValue / 100) / 10 + 'k';
  }

  public updateMass(forced: boolean = false): void {
    const { deltaTime } = PIXI.Ticker.shared;
    const { ticks } = WorldState;
    const { shortMass, massUpdateDelay } = GameSettings.all.settings.game.cells;

    if (massUpdateDelay > 1) {
      if (~~(ticks * deltaTime) % massUpdateDelay === 1) {
        this.calculateMass();
      }
    } else {
      this.calculateMass();
    }

    if (forced) {
      this.calculateMass();
    }

    if (shortMass) {
      this.mass.text = this.shortMassValue;
    } else {
      this.mass.text = this.massValue.toString();
    }

    this.setMassAnchor();
  }
}