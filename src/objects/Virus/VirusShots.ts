import { Sprite, Container, BitmapText, Point } from "pixi.js";
import TextureGenerator from "../../Textures/TexturesGenerator";
import * as PIXI from 'pixi.js';
import GameSettings from '../../Settings/Settings';

export default class VirusShots extends Container {
  private shotsCircleSprite: Sprite;
  private text: BitmapText;
  private animatedRadius: number = 100;

  constructor(private virusRadius: number) {
    super();

    this.animatedRadius = virusRadius;

    this.shotsCircleSprite = new Sprite(TextureGenerator.virusShots);
    this.shotsCircleSprite.anchor.set(0.5, 0.5);
    this.shotsCircleSprite.scale.set((100 - (200 - this.virusRadius)) / 50);
    this.addChild(this.shotsCircleSprite);

    this.text = new BitmapText('0', { fontName: 'MassLato', fontSize: 160 }); 
    
    //@ts-ignore
    this.text.anchor = new Point(0.5, 0.5);

    this.addChild(this.text);

    this.alpha = 0.925;
  }

  private getShotsAmount(): string {
    switch (this.virusRadius) {
      case 100: return '7';
      case 106: return '6';
      case 113: return '5';
      case 119: return '4';
      case 125: return '3';
      case 131: return '2';
      case 136: return '1';
      case 141: return '0';
    }
  }

  private updateShotsCircleSize(): void {
    const scaleTo = (100 - (200 - this.virusRadius)) / 50;
    const newScale = (scaleTo - this.shotsCircleSprite.scale.x) * this.getAnimationSpeed();

    this.shotsCircleSprite.scale.x += newScale;
    this.shotsCircleSprite.scale.y += newScale;

    this.shotsCircleSprite.visible = GameSettings.all.settings.theming.viruses.massType === 'Fill circle';
  }

  private updateText(): void {
    const { massType } = GameSettings.all.settings.theming.viruses;

    this.text.visible = true;

    if (massType === 'Shots amount') {
      this.text.text = this.getShotsAmount();
    } else if (massType === 'Full mass') {
      this.text.text = (~~(100 - this.animatedRadius * 2)).toString();
    } else {
      this.text.visible = false;
    }
  }

  private animateRadius(): void {
    const newRadius = (this.virusRadius - this.animatedRadius) * this.getAnimationSpeed();
    this.animatedRadius += newRadius;
  }

  private getAnimationSpeed(): number {
    return (GameSettings.all.settings.game.gameplay.animationSpeed / 1000) * PIXI.Ticker.shared.deltaTime;
  }

  public update(virusRadius: number): void {
    this.virusRadius = virusRadius;
  } 

  public animate() {
    this.updateShotsCircleSize();
    this.updateText();
    this.animateRadius();
  }
}