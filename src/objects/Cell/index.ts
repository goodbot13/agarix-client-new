import * as PIXI from 'pixi.js';
import { Container } from 'pixi.js';
import { Subtype, RGB, RemoveType, Location, CellType, IMainGameObject, Vector } from '../types';
import Stats from './Stats';
import World from '../../render/World';
import Rings from './Rings';
import Shadow from './Shadow';
import CellSprite from './CellSprite';
import { getColor, getColorLighten, rgbToStringHex } from '../../utils/helpers';
import { SkinTexture } from '../../utils/SkinsLoader';
import SettingsState from '../../states/SettingsState';

export default class Cell extends Container implements IMainGameObject {
  public subtype: Subtype;
  public originalSize: number = 0;
  public newOriginalSize: number = 0;
  public isPlayerCell: boolean = false;
  public isTeam: boolean = false;
  public isDestroyed: boolean = false;
  public nick: string;
  public color: RGB;
  public newLocation: Location = { x: 0, y: 0, r: 0 };
  public removing: boolean = false;
  public colorHex: Array<string> = [];
  public isVisible: boolean;
  public cell: CellSprite;
  public shadow: Shadow;
  public stats: Stats;
  public sizeBeforeRemove: number = 0;
  public removeType: RemoveType;
  public multiboxFocuesTab: boolean = false;
  public isMinimap: boolean = false;
  public rings: Rings;
  public type: CellType;
  public agarSkinName: string;
  public usesSkinByAgarName: boolean;
  public customSkinTexture: SkinTexture;
  public agarSkinTexture: SkinTexture;
  public skinByNameTexture: SkinTexture;
  public culled: boolean = false;
  public eatenBy: Vector = { x: 0, y: 0 };

  private usingSkin: boolean;
  private distBeforeRemove: number = -1;

  constructor(public world: World) {
    super();

    this.cell = new CellSprite(world);
    this.shadow = new Shadow(this.cell, this);
    this.stats = new Stats(this);
    this.rings = new Rings(this);

    this.addChild(this.cell);
    this.addChild(this.shadow.sprite);
    this.cell.addChild(this.rings.innerRing, this.rings.outerRing);
    this.cell.addChild(this.stats.nick, this.stats.mass);

    // this.interactive = true;
    // this.on('mousedown', () => {
    //   console.log(this);
    // });
  }

  public reuse(subtype: Subtype, location: Location, color: RGB, nick: string, skin: string, world: World): void {
    const { x, y, r } = location;

    this.zIndex = r * 2;
    this.x = x;
    this.y = y;
    this.transform.position.set(x, y);
    this.nick = nick;
    this.color = color;
    this.originalSize = this.newOriginalSize = r;
    this.subtype = subtype;
    this.type = 'CELL';
    this.agarSkinName = skin;
    this.world = world;
    this.sortableChildren = true;
    this.isVisible = false;
    this.renderable = false;

    this.isPlayerCell = false;
    this.isTeam = false;
    this.isDestroyed = false;
    this.newLocation = location;
    this.removing = false;
    this.colorHex = [];
    this.sizeBeforeRemove = 0;
    this.multiboxFocuesTab = false;
    this.isMinimap = false;
    this.culled = false;

    this.agarSkinTexture = null;
    this.skinByNameTexture = null;
    this.eatenBy = { x: 0, y: 0 };
    this.distBeforeRemove = -1;

    this.cell.transform.scale.set(1, 1);
    this.cell.scale.set(1, 1);
    this.cell.alpha = 0;
    this.shadow.sprite.alpha = 0;

    this.getSkins();
    this.addColorInformation(color);
    this.applyTint();
    this.update(location);
    this.stats.updateMass(true);
    this.stats.updateNick(nick);
    this.cell.setSize(r * 2);
    this.newOriginalSize = r;
    this.shadow.setSize(this.cell.width);
  }

  private getSkins(): void {
    if (this.isMinimap) {
      return;
    }

    this.usesSkinByAgarName = this.world.scene.master.skins.skinsByNameHas(this.nick);

    this.world.skinsLoader.getAgarSkinByPlayerNick(this.nick, (skinTexture) => {
      this.skinByNameTexture = skinTexture;
    });

    this.world.skinsLoader.getAgarSkinBySkinName(this.agarSkinName, (texture) => {
      this.agarSkinTexture = texture;
    });
  }

  private addColorInformation(color: RGB): void {
    const { red, green, blue } = color;

    const originalColor = rgbToStringHex({ red, green, blue });
    const modifiedColor = rgbToStringHex({ 
      red: ~~(red * 0.9), 
      green: ~~(green * 0.9), 
      blue: ~~(blue * 0.9) 
    });

    this.colorHex.push(originalColor, modifiedColor);
  }

  public changeShadowTexture(): void {
    this.shadow.updateTexture();
  }

  public setIsMinimapCell(size: number): void {
    this.isMinimap = true;
    this.renderable = true;
    this.setIsVisible(true);
    this.updateAlpha(1, true);
    this.shadow.sprite.visible = false;
    this.shadow.sprite.renderable = false;
    this.stats.nick.visible = false;
    this.stats.nick.renderable = false;
    this.stats.mass.visible = false;
    this.stats.mass.renderable = false;
    this.customSkinTexture = null;
    this.agarSkinTexture = null;
    this.cell.setSize(size * 2);
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

  public setPlayerCell(nick: string, textureUrl: string) {
    if (!this.isPlayerCell) {
      this.updateAlpha(0.4, true); // initial player cell alpha
    }

    this.isPlayerCell = true;
    this.nick = nick && nick.trim();
    this.stats.updateNick(nick);
    this.shadow.updateTexture();

    this.usesSkinByAgarName = this.world.scene.master.skins.skinsByNameHas(this.nick);

    this.world.skinsLoader.getCustomSkin(textureUrl, (texture) => {
      this.customSkinTexture = texture;
    });
  }

  private applyTint(): void {
  
    const { shadowColor, myShadowColor, oneColoredStatsColor, oneColoredColor, colorLighten, adaptiveShadow } = this.world.scene.settings.all.settings.theming.cells;
    const { oneColored } = this.world.scene.settings.all.settings.game.cells;

    if (this.isPlayerCell) {
      const { initialStaticCellColor, focusedStaticCellColor } = this.world.scene.settings.all.settings.theming.multibox;
      const { changeCellColor, staticColor } = this.world.scene.settings.all.settings.game.multibox;

      if (this.world.scene.settings.all.settings.game.multibox.enabled) {
        if (staticColor) {
          this.cell.tint = getColor(initialStaticCellColor);
          this.shadow.sprite.tint = this.cell.tint;
        } else {
          this.cell.tint = getColorLighten(colorLighten, this.color);
          this.shadow.sprite.tint = this.cell.tint;
        }
  
        if (changeCellColor) {
          if (this.multiboxFocuesTab) {
            this.cell.tint = getColor(focusedStaticCellColor);
            this.shadow.sprite.tint = this.cell.tint;
          }
        } else if (staticColor) {
          this.cell.tint = getColor(initialStaticCellColor);
          this.shadow.sprite.tint = this.cell.tint;
        } else {
          this.cell.tint = getColorLighten(colorLighten, this.color);
          this.shadow.sprite.tint = this.cell.tint;
        }
      } else {
        if (this.usingSkin) {
          this.cell.tint = 0xFFFFFF;
        } else {
          this.cell.tint = getColorLighten(colorLighten, this.color);
        }

        if (adaptiveShadow) {
          this.shadow.sprite.tint = getColorLighten(colorLighten, this.color);
        } else {
          this.shadow.sprite.tint = getColor(myShadowColor);
        }
      }

      return;
    }

    if (this.usingSkin) {
      this.cell.tint = 0xFFFFFF;
      this.stats.updateTint(0xFFFFFF);

      if (adaptiveShadow) {
        this.shadow.sprite.tint = getColorLighten(colorLighten, this.color);
      } else {
        this.shadow.sprite.tint = getColor(shadowColor);
      }
    } else {
      if (oneColored) {
        this.cell.tint = getColor(oneColoredColor);
        this.stats.updateTint(getColor(oneColoredStatsColor));
        this.shadow.sprite.tint = getColor(shadowColor);
      } else {
        this.cell.tint = getColorLighten(colorLighten, this.color);
        this.stats.updateTint(0xFFFFFF);

        if (adaptiveShadow) {
          this.shadow.sprite.tint = this.cell.tint;
        } else {
          this.shadow.sprite.tint = getColor(shadowColor);
        }
      }
    }

  }

  private updateSkinsVisibility(): void {
    const { skinsType } = this.world.scene.settings.all.settings.game.cells;

    if (SettingsState.allowSkins) {

      if (this.world.scene.settings.all.settings.game.multibox.enabled && this.world.scene.settings.all.settings.game.multibox.hideOwnSkins && this.isPlayerCell) {
        this.cell.texture = this.world.textureGenerator.cell;
        this.usingSkin = false;
        return;
      }

      const teamAndCustomSkin = this.isTeam && !!this.customSkinTexture;
      const playerAndCustomSkin = this.isPlayerCell && !!this.customSkinTexture;
      const usesSkinByAgarName = this.usesSkinByAgarName && !!this.skinByNameTexture;
      const allowCustomSkins = skinsType === 'Custom' || skinsType === 'All';

      if ((teamAndCustomSkin || playerAndCustomSkin) && allowCustomSkins) {
        this.cell.texture = this.customSkinTexture.texture;
        this.usingSkin = true;
      } else {
        if (usesSkinByAgarName && (skinsType === 'Vanilla' || skinsType === 'All')) {
          this.cell.texture = this.skinByNameTexture.texture;
          this.usingSkin = true;
        } else if (this.agarSkinTexture && (skinsType === 'Vanilla' || skinsType === 'All')) {
          this.cell.texture = this.agarSkinTexture.texture;
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

    this.agarSkinTexture && this.agarSkinTexture.update();
    this.skinByNameTexture && this.skinByNameTexture.update();
    this.customSkinTexture && this.customSkinTexture.update();
  }

  private updateInfo(): void {
    this.updateSkinsVisibility();
    this.applyTint();
    this.stats.updateMass();

    this.rings.update();
    this.shadow.update();
    this.stats.update();
  }

  public setIsTeam(isTeam: boolean, skinUrl: string): void {
    if (isTeam) {
      this.isTeam = true;
      this.world.skinsLoader.getCustomSkin(skinUrl, (texture) => {
        this.customSkinTexture = texture;
      });
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

  public remove(type: RemoveType, eatenBy?: Cell): void {
    this.removing = true;
    this.removeType = type;
    this.sizeBeforeRemove = this.cell.width;
    this.zIndex = 0;
    
    if (eatenBy) {
      this.eatenBy = {
        x: eatenBy.x,
        y: eatenBy.y
      }

      this.distBeforeRemove = this.calcDistBetweenEatenAndCurrent();
    }
  }

  private calcDistBetweenEatenAndCurrent(): number {
    const distX = Math.pow(this.eatenBy.x - this.x, 2);
    const distY = Math.pow(this.eatenBy.y - this.y, 2);

    return Math.sqrt(distX + distY);
  }

  private animateOutOfView(fadeSpeed: number): void {
    if (this.cell.alpha <= 0 || fadeSpeed === 0) {
      this.isDestroyed = true;
    } else {
      this.updateAlpha(-fadeSpeed);
    }
  }

  private animateEaten(animationSpeed: number, fadeSpeed: number, soakSpeed: number): void {
    if (!this.isVisible) {
      this.isDestroyed = true;
      return;
    }

    if (soakSpeed !== 0) {
      const apf = this.isMinimap ? (animationSpeed / 5) : soakSpeed;

      let newSize = -(this.width * apf);

      if (this.world.scene.settings.all.settings.game.cells.soakToEaten) {
        const x = (this.eatenBy.x - this.x) * (animationSpeed / 5);
        const y = (this.eatenBy.y - this.y) * (animationSpeed / 5);

        this.x += x;
        this.y += y;

        newSize /= 1.5;
      }

      this.cell.width += newSize;
      this.cell.height += newSize;
      this.shadow.sprite.width += newSize * this.shadow.TEXTURE_OFFSET;
      this.shadow.sprite.height += newSize * this.shadow.TEXTURE_OFFSET;

      const { transparency } = this.world.scene.settings.all.settings.theming.cells;
      const newTransparency = this.cell.width / this.sizeBeforeRemove;

      if (transparency > newTransparency) {
        this.updateAlpha(this.cell.width / this.sizeBeforeRemove);
      }
      
      if (this.width <= 20) {
        this.isDestroyed = true;
      }
    } else {
      if (fadeSpeed === 0) {
        this.isDestroyed = true;
        return;
      } 

      if (this.cell.alpha > 0) {
        this.updateAlpha(-fadeSpeed);
      } else {
        this.isDestroyed = true;
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

  private animateMove(animationSpeed: number, fadeSpeed: number): void {
    const { transparency } = this.world.scene.settings.all.settings.theming.cells;

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
        this.updateAlpha(-fadeSpeed);
      } else {
        this.updateAlpha(0, true);
        this.visible = false;
        this.renderable = false;
      }
    } else {
      this.visible = true;
      this.renderable = true;

      if (this.cell.alpha < transparency && fadeSpeed !== 0) {
        this.updateAlpha(fadeSpeed);
      } else {
        this.updateAlpha(transparency, true);
      }
    }
  }

  public animate(animationSpeed: number, fadeSpeed: number, soakSpeed: number): void {
    this.originalSize += (this.newOriginalSize - this.originalSize) * animationSpeed;
    this.updateInfo();

    if (!(window as any).zzz) {
      (window as any).zzz = this.width;
    }
    if ((window as any).zzz < this.width) {
      (window as any).zzz = this.width;
    }

    if (this.removing) {
      // fix

      if (this.culled) {
        this.isDestroyed = true;
        return;
      }

      if (this.removeType === 'REMOVE_CELL_OUT_OF_VIEW') {
        this.animateOutOfView(fadeSpeed);
      } else if (this.removeType === 'REMOVE_EATEN_CELL') {
        this.animateEaten(animationSpeed, fadeSpeed, soakSpeed);
      }
    } else {
      if (this.culled) {
        this.visible = false;
        this.renderable = false;
        this.x = this.newLocation.x;
        this.y = this.newLocation.y;
        this.cell.width = this.cell.height = this.newLocation.r;
        this.shadow.sprite.width = this.shadow.sprite.height = this.shadow.TEXTURE_OFFSET * this.newLocation.r;
      } else {
        this.animateMove(animationSpeed, fadeSpeed);
      }
    }
  }
}