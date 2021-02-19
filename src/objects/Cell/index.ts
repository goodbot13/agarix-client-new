import * as PIXI from 'pixi.js';
import { Container, Texture } from 'pixi.js';
import Globals from '../../Globals';
import { Subtype, RGB, RemoveType, Location, CellType, IMainGameObject } from '../types';
import Stats from './Stats';
import World from '../../render/World';
import Rings from './Rings';
import Shadow from './Shadow';
import CellSprite from './CellSprite';

import GameSettings from '../../Settings/Settings';

export default class Cell extends Container implements IMainGameObject {
  public readonly subtype: Subtype;
  public originalSize: number = 0;
  public newOriginalSize: number = 0;
  public originalMass: number = 0;
  public shortMass: string = '';
  public isPlayerCell: boolean = false;
  public isTeam: boolean = false;
  public isDestroyed: boolean = false;
  public nick: string;
  public color: RGB;
  public newLocation: Location = { x: 0, y: 0, r: 0 };
  public removing: boolean = false;
  public colorHex: Array<string> = [];
  public isVisible: boolean;
  public animating: boolean = true;
  public cell: CellSprite;
  public shadow: Shadow;
  public stats: Stats;
  public sizeBeforeRemove: number = 0;
  public removeType: RemoveType;
  public multiboxFocuesTab: boolean = false;
  public world: World;
  public isMinimap: boolean = false;
  public rings: Rings;
  public type: CellType;
  public agarSkinName: string;
  public usesSkinByAgarName: boolean;
  public customSkinTexture: Texture;
  public agarSkinTexture: Texture;

  private usingSkin: boolean;

  constructor(subtype: Subtype, location: Location, color: RGB, nick: string, skin: string, world: World) {
    super();

    const { x, y, r } = location;
    const doubleR = r * 2;

    // apply default cell information 
    this.zIndex = doubleR;
    this.x = x;
    this.y = y;
    this.color = color;
    this.originalSize = r;
    this.subtype = subtype;
    this.type = 'CELL';
    this.agarSkinName = skin;
    this.world = world;
    this.sortableChildren = true;
    this.isVisible = false;

    this.nick = nick && nick.trim();
    this.usesSkinByAgarName = this.nick ? this.world.scene.master.skins.reservedSkinsByName.has(this.nick.toLowerCase()) : false;
    this.getSkin();

    // add cell to main container
    this.cell = new CellSprite(world, doubleR, this);
    this.shadow = new Shadow(world, this.cell, this, doubleR);
    this.stats = new Stats(this);
    this.rings = new Rings(this);

    this.addChild(this.cell);
    this.addChild(this.shadow.sprite);
    this.cell.addChild(this.rings.innerRing, this.rings.outerRing);
    this.cell.addChild(this.stats.name, this.stats.mass);

    this.addColorInformation(color);
    this.applyAlpha();
    this.applyTint();
    this.update(location);
  }

  private getSkin(): void {
    if (this.agarSkinTexture) {
      return;
    }

    if (this.usesSkinByAgarName || this.agarSkinName) {
      this.agarSkinTexture = this.world.scene.skinsLoader.getTextureByAgarSkinName(this.agarSkinName, this.nick); 
    }
  }

  private addColorInformation(color: RGB): void {
    const { red, green, blue } = color;

    const originalColor = Globals.rgbToStringHex({ red, green, blue });
    const modifiedColor = Globals.rgbToStringHex({ 
      red: ~~(red * 0.9), 
      green: ~~(green * 0.9), 
      blue: ~~(blue * 0.9) 
    });

    this.colorHex.push(originalColor, modifiedColor);
  }

  private applyAlpha(): void {
    this.cell.alpha = 0;
    this.shadow.sprite.alpha = 0;
  }

  public changeShadowTexture(): void {
    this.shadow.changeTexture();
  }

  public setIsMinimapCell(value: boolean): void {
    this.isMinimap = value;
    this.setIsVisible(true);
    this.updateAlpha(1, true);
  }

  public setIsFoucsedTab(value: boolean): void {
    this.multiboxFocuesTab = value;
  }

  public setIsVisible(value: boolean): void {
    this.isVisible = value;
  }

  public updateAlpha(a: number, set: boolean = false): void {
    if (set) {
      this.cell.alpha = a;
      this.shadow.sprite.alpha = a;
      this.rings.innerRing.alpha = a;
      this.rings.outerRing.alpha = a;
    } else {
      this.cell.alpha += a;
      this.shadow.sprite.alpha += a;
      this.rings.innerRing.alpha += a;
      this.rings.outerRing.alpha += a;
    }

    if (this.cell.alpha < 0 || this.shadow.sprite.alpha < 0 || this.rings.innerRing.alpha < 0) {
      this.cell.alpha = 0;
      this.rings.innerRing.alpha = 0;
      this.rings.outerRing.alpha = 0;
    }

    if (this.cell.alpha > 1 || this.shadow.sprite.alpha > 1 || this.rings.innerRing.alpha > 1) {
      this.shadow.sprite.alpha = 1;
      this.cell.alpha = 1;
      this.rings.innerRing.alpha = 1;
      this.rings.outerRing.alpha = 1;
    }
  }

  public setPlayerCell(nick: string, skinTexture: Texture) {
    if (!this.isPlayerCell) {
      this.updateAlpha(0.4, true); // initial player cell alpha
    }

    this.isPlayerCell = true;
    this.nick = nick && nick.trim();
    this.stats.updateNick(nick);
    this.customSkinTexture = skinTexture;
  }

  private applyTint(): void {
  
    const { shadowColor, myShadowColor, oneColoredStatsColor, oneColoredColor, colorLighten } = GameSettings.all.settings.theming.cells;
    const { oneColored } = GameSettings.all.settings.game.cells;

    const adaptiveShadow = true;

    if (this.isPlayerCell) {
      const { initialStaticCellColor, focusedStaticCellColor } = GameSettings.all.settings.theming.multibox;
      const { changeCellColor, staticColor } = GameSettings.all.settings.game.multibox;

      if (GameSettings.all.settings.game.multibox.enabled) {
        if (staticColor) {
          this.cell.tint = Globals.getColor(initialStaticCellColor);
          this.shadow.sprite.tint = this.cell.tint;
        }
  
        if (this.multiboxFocuesTab && changeCellColor) {
          this.cell.tint = Globals.getColor(focusedStaticCellColor);
          this.shadow.sprite.tint = this.cell.tint;
        }
      } else {
        if (this.usingSkin) {
          this.cell.tint = 0xFFFFFF;
        } else {
          this.cell.tint = Globals.getTintColor(colorLighten, this.color);
        }

        if (adaptiveShadow) {
          this.shadow.sprite.tint = Globals.getTintColor(colorLighten, this.color);
        } else {
          this.shadow.sprite.tint = Globals.getColor(myShadowColor);
        }
      }

      return;
    }

    if (this.usingSkin) {
      this.cell.tint = 0xFFFFFF;
      this.stats.updateTint(0xFFFFFF);

      if (adaptiveShadow) {
        this.shadow.sprite.tint = Globals.getTintColor(colorLighten, this.color);
      } else {
        this.shadow.sprite.tint = Globals.getColor(shadowColor);
      }
    } else {
      if (oneColored) {
        this.cell.tint = Globals.getColor(oneColoredColor);
        this.stats.updateTint(Globals.getColor(oneColoredStatsColor));
        this.shadow.sprite.tint = Globals.getColor(shadowColor);
      } else {
        this.cell.tint = Globals.getTintColor(colorLighten, this.color);
        this.stats.updateTint(0xFFFFFF);

        if (adaptiveShadow) {
          this.shadow.sprite.tint = this.cell.tint;
        } else {
          this.shadow.sprite.tint = Globals.getColor(shadowColor);
        }
      }
    }

  }

  private calcMass(): void {
    const { deltaTime } = PIXI.Ticker.shared;
    const { ticks } = Globals;

    if (~~(ticks % (3 * deltaTime)) === 0) {
      this.originalMass = ~~(this.originalSize * this.originalSize / 100);
      this.shortMass = Math.round(this.originalMass / 100) / 10 + 'k';

      this.stats.updateMass(this.shortMass);
    }
  }

  private updateSkinsVisibility(): void {
    const { skinsType } = GameSettings.all.settings.game.cells;
    const allowSkins = true;

    if (allowSkins) {

      if (GameSettings.all.settings.game.multibox.enabled && GameSettings.all.settings.game.multibox.hideOwnSkins && this.isPlayerCell) {
        this.cell.texture = this.world.textureGenerator.cell;
        this.usingSkin = false;
        return;
      }

      if (this.isTeam && this.customSkinTexture && (skinsType === 'Custom' || skinsType === 'All')) {
        this.cell.texture = this.customSkinTexture;
        this.usingSkin = true;
      } else {
        if (this.agarSkinTexture && (skinsType === 'Vanilla' || skinsType === 'All')) {
          this.cell.texture = this.agarSkinTexture;
          this.usingSkin = true;
        } else {
          this.cell.texture = this.world.textureGenerator.cell;
          this.usingSkin = false;
        }
      }

    } else {
      this.cell.texture = this.world.textureGenerator.cell;
      this.usingSkin = false;
    }
  }

  private updateInfo(): void {
    this.getSkin();
    this.updateSkinsVisibility();
    this.applyTint();
    this.calcMass();

    this.rings.update();
    this.shadow.update();
    this.stats.update();
  }

  public setIsTeam(isTeam: boolean, skinTexture?: Texture): void {
    if (isTeam) {
      this.customSkinTexture = skinTexture;
      this.isTeam = true;
    } else if (this.isTeam) {
      this.cell.texture = this.world.textureGenerator.cell;
      this.isTeam = false;
    }
  }

  public update(location: Location): void {
    this.newLocation.x = location.x;
    this.newLocation.y = location.y;
    this.newLocation.r = location.r * 2;
    this.newOriginalSize = location.r;
  }

  public remove(type: RemoveType): void {
    this.removing = true;
    this.removeType = type;
    this.sizeBeforeRemove = this.cell.width;
    this.zIndex = 0;
  }

  private fullDestroy(): void {
    this.destroy({ children: true });
    this.isDestroyed = true;
  }  
  
  private getAnimationSpeed(): number {
    return 0.11 + 0.002 * GameSettings.all.settings.game.gameplay.animationSpeed * PIXI.Ticker.shared.deltaTime;
  }

  private getFadeSpeed(): number {
    if (GameSettings.all.settings.game.cells.fadeSpeed === 'Disabled') {
      return 0;
    }

    return 0.01 + (0.015 * (6 - +GameSettings.all.settings.game.cells.fadeSpeed)) * PIXI.Ticker.shared.deltaTime;
  }

  private getSoakSpeed(): number {
    if (GameSettings.all.settings.game.cells.soakSpeed === 'Disabled') {
      return 0;
    }

    return (6 - +GameSettings.all.settings.game.cells.soakSpeed) / 25 * PIXI.Ticker.shared.deltaTime;
  }

  private animateOutOfView(): void {
    const fadeSpeed = this.getFadeSpeed();

    if (this.cell.alpha <= 0 || fadeSpeed === 0) {
      this.destroy({ children: true });
      this.isDestroyed = true;
    } else {
      this.updateAlpha(-fadeSpeed * 1.5);
    }
  }

  private animateEaten(): void {
    const animationSpeed = this.getAnimationSpeed();
    const fadeSpeed = this.getFadeSpeed();
    const soakSpeed = this.getSoakSpeed();

    if (!this.isVisible) {
      this.fullDestroy();
      return;
    }

    if (soakSpeed !== 0) {
      const apf = this.isMinimap ? (animationSpeed / 5) : soakSpeed;

      if (this.cell.width > 1) {
        const newSize = -(this.cell.width * apf);

        this.cell.width += newSize;
        this.cell.height += newSize;
        this.shadow.sprite.width += newSize * this.shadow.TEXTURE_OFFSET;
        this.shadow.sprite.height += newSize * this.shadow.TEXTURE_OFFSET;

        this.updateAlpha(this.cell.width / this.sizeBeforeRemove);
      } else {
        this.fullDestroy();
      }
    } else {
      if (fadeSpeed === 0) {
        this.fullDestroy();
        return;
      }

      if (this.cell.alpha > 0) {
        this.updateAlpha(-fadeSpeed * 1.5);
      } else {
        this.fullDestroy();
      }
    }
  }

  public forceAnimateSet(location: Location) {
    const { x, y, r } = location;

    this.x = x;
    this.y = y;

    this.cell.width = r;
    this.cell.height = r;
    this.zIndex = r;

    this.shadow.sprite.width = r * this.shadow.TEXTURE_OFFSET;
    this.shadow.sprite.height = r * this.shadow.TEXTURE_OFFSET;
  }

  private animateMove(): void {
    const { transparency } = GameSettings.all.settings.theming.cells;

    const animationSpeed = this.getAnimationSpeed();
    const fadeSpeed = this.getFadeSpeed();

    const mtv = (this.isMinimap && this.isTeam) ? 0.1 : 1;

    const x = (this.newLocation.x - this.x) * animationSpeed * mtv;
    const y = (this.newLocation.y - this.y) * animationSpeed * mtv;
    const r = (this.newLocation.r - this.cell.width) * animationSpeed * mtv;

    this.cell.width += r;
    this.cell.height += r;
    this.zIndex = this.originalSize;
    this.x += x;
    this.y += y;

    this.shadow.sprite.width += r * this.shadow.TEXTURE_OFFSET;
    this.shadow.sprite.height += r * this.shadow.TEXTURE_OFFSET;

    if (!this.isVisible) {
      if (this.cell.alpha > 0 && fadeSpeed !== 0) {
        this.updateAlpha(-fadeSpeed * 1.5);
      } else {
        this.updateAlpha(0, true);
        this.visible = false;
      }
    } else {
      this.visible = true;

      if (this.cell.alpha < transparency && fadeSpeed !== 0) {
        this.updateAlpha(fadeSpeed * 1.5);
      } else {
        this.updateAlpha(transparency, true);
      }
    }
  }

  public animate(): void {
    this.originalSize += (this.newOriginalSize - this.originalSize) * this.getAnimationSpeed();
    this.updateInfo();

    if (this.removing) {
      if (this.removeType === 'REMOVE_CELL_OUT_OF_VIEW') {
        this.animateOutOfView();
      } else if (this.removeType === 'REMOVE_EATEN_CELL') {
        this.animateEaten();
      }
    } else {
      this.animateMove();
    }
  }
}