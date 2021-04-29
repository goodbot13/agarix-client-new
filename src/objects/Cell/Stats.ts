import { BitmapText, Text, Point, TextStyle } from 'pixi.js';
import Cell from '.';
import GameSettings from '../../Settings/Settings';
import WorldState from '../../states/WorldState';
import * as PIXI from 'pixi.js';

export default class CellStats {
  public nick: Text;
  public mass: BitmapText;

  private massValue: number = 0;
  private shortMassValue: string = '0';
  private currentAnchor: Point = new Point(0, 0);
  private readonly NICK_STYLE: TextStyle = new TextStyle({
    fontFamily: 'Lato',
    fontSize: 140,
    fill: 0xffffff,
    stroke: 0x101010,
    strokeThickness: 5,
    fontWeight: '600',
  });

  constructor(private cell: Cell) {
    this.mass = new BitmapText('0', { fontName: 'MassLato' });
    this.mass.scale.set(0.58);
    this.mass.zIndex = 5;
    this.setMassAnchor();

    this.updateNick();
  }

  private setMassAnchor(): void {
    if (GameSettings.all.settings.game.cells.nicks) {
      if (this.currentAnchor.y !== -0.75) {
        this.mass.anchor = new Point(0.5, -0.75);
        this.currentAnchor = this.mass.anchor;
      }
    } else {
      if (this.currentAnchor.y !== 0.5) {
        this.mass.anchor = new Point(0.5, 0.5);
        this.currentAnchor = this.mass.anchor;
      }
    }
  }

  public update(): void {
    const {
      mass,
      myMass,
      nicks,
      myNick,
      autoHideMassAndNicks,
    } = GameSettings.all.settings.game.cells;

    const mNicks = GameSettings.all.settings.game.minimap.nicks;
    const mMass = GameSettings.all.settings.game.minimap.mass;

    if (this.cell.isMinimap && this.cell.isTeam) {
      this.nick.visible = this.nick.renderable = mNicks;
      this.nick.scale.set(7);
      this.nick.y = -512;
      return;
    }

    if (this.cell.isPlayerCell) {
      this.mass.visible = this.mass.renderable = myMass;
      this.nick.visible = this.nick.renderable = myNick;
    } else {
      if (this.cell.isMinimap && this.cell.originalSize >= 22) {
        this.nick.visible = this.nick.renderable = mNicks;
        this.mass.visible = this.mass.renderable = mMass;
        this.nick.scale.set(1.5);
      } else if (this.cell.originalSize <= 40) {
        this.mass.visible = this.mass.renderable = false;
        this.nick.visible = this.nick.renderable = false;
      } else {
        const visible = autoHideMassAndNicks
          ? this.cell.originalSize > 27 / this.cell.world.view.camera.scale
          : true;
        this.mass.visible = this.mass.renderable = visible && mass;
        this.nick.visible = this.nick.renderable = visible && nicks;
      }
    }
  }

  public updateTint(tint: number): void {
    this.nick.tint = tint;
    this.mass.tint = tint;
  }

  private generateNick(nick: string): void {
    if (this.nick) {
      this.nick.text = nick;
    } else {
      this.nick = new Text(nick, this.NICK_STYLE);
    }

    this.nick.texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.ON;
    this.nick.scale.set(0.75);
    this.nick.zIndex = 5;
    this.nick.anchor.set(0.5, 0.5);
  }

  public updateNick(): void {
    this.generateNick(this.cell.nick);
  }

  private calculateMass(): void {
    this.massValue = ~~((this.cell.originalSize * this.cell.originalSize) / 100);
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

    if (shortMass && this.massValue > 999) {
      this.mass.text = this.shortMassValue;
    } else {
      this.mass.text = this.massValue.toString();
    }

    this.setMassAnchor();
  }
}
