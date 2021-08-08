import { BitmapText, Sprite, Point } from "pixi.js";
import Cell from ".";
import WorldState from "../../states/WorldState";
import * as PIXI from 'pixi.js';

export default class CellStats {
  public nick: Sprite;
  public mass: BitmapText;

  private massValue: number = 0;
  private shortMassValue: string = '0';

  constructor(private cell: Cell) {
    const { massScale, nicksScale } = cell.world.settings.all.settings.game.cells;

    this.mass = new BitmapText('0', { 
      fontName: 'MassLato' 
    });

    this.mass.scale.set(massScale);
    this.mass.zIndex = 5;
    this.mass.anchor.x = 0.5;
    this.mass.y = 64;
    
    this.nick = new Sprite();
    this.nick.anchor.set(0.45);
    this.nick.scale.set(nicksScale);
    this.nick.zIndex = 5;
  }
  
  public update(): void {
    const { mass, myMass, nicks, myNick, autoHideMassAndNicks, massScale, nicksScale } = this.cell.world.settings.all.settings.game.cells;

    const mNicks = this.cell.world.settings.all.settings.game.minimap.nicks;
    const mMass = this.cell.world.settings.all.settings.game.minimap.mass;

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
      this.mass.scale.set(massScale);
      this.nick.scale.set(nicksScale);
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
        this.nick.scale.set(nicksScale);
        this.mass.scale.set(massScale);
      }
    }
  }

  public updateTint(tint: number): void {
    this.nick.tint = tint;
    this.mass.tint = tint;
  }

  public updateNick(nick: string): void {
    this.cell.world.textureGenerator.cellNicksGenerator.createNick(nick, (texture) => {
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
    const { shortMass, massUpdateDelay } = this.cell.world.settings.all.settings.game.cells;

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
  }
}