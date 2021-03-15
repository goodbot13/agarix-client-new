import { SCALE_MODES, Texture } from 'pixi.js';
import generateBorders from './Borders';
import generateRgbBorderLine from './BordersRgb';
import generateCell from './Cell';
import generateFood from './Food';
import generateRemoveEffect from './RemoveEffect';
import generateVirus from './Virus';
import generateViewBox from './ViewBox';
import generateCellShadow from './CellShadow';
import generateVirusShots from './VirusShots';
import generateMultiboxLinedRing from './MultiboxRing';
import Cache from './Cache';
import FrontAPI from '../communication/FrontAPI';
import GameSettings from '../Settings/Settings';
import generateMyCellShadow from './MyCellShadow';
import Logger from '../utils/Logger';

export default new class TextureGenerator {
  public mapBackgroundImage: Texture;
  public secondBackgroundImage: Texture;
  public backgroundDisplacement: Texture;
  public globalDisplacement: Texture;
  public outerRing: Texture;
  public innerRing: Texture;
  public multiboxLinedRing: Texture;
  public hsloRing: Texture;
  public rgbBorder: Texture;
  public mapBorders: Texture;
  public mapBordersRgbLine: Texture;
  public cell: Texture;
  public cellShadow: Texture;
  public myCellShadow: Texture;
  public food: Texture;
  public removeEffect: Texture;
  public virus: Texture;
  public viewBox: Texture;
  public virusShots: Texture;
  public cache: Cache;
  public removeAnimationsAcim: Array<Texture> = [];
  public removeAnimationHSLO3D: Texture;
  public removeAnimationYue: Array<Texture> = [];

  private logger: Logger;

  constructor() {
    this.cache = new Cache();
    this.logger = new Logger('TextureGenerator');
  }

  private async loadImg(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = () => {
        this.logger.error(`[GameLoader]: Reosurce not found: ${!url ? '[EMPTY_URL]' : url} (skipped)`);
        resolve(new Image());
      }
    });
  }

  private generateNewTexture(width: number, height: number, img: HTMLImageElement, isRect: boolean = true): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    
    if (!isRect) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    const texture = Texture.from(canvas);
    texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

    return texture;
  }

  private async loadRemoveAnimationAcim(): Promise<any> {
    const s1 = await this.loadImg('https://i.imgur.com/pbNStJi.png');
    const s2 = await this.loadImg('https://i.imgur.com/sq7aL6t.png');
    const s3 = await this.loadImg('https://i.imgur.com/3YzFPva.png');
    const s4 = await this.loadImg('https://i.imgur.com/l6cJBC6.png');
    const s5 = await this.loadImg('https://i.imgur.com/7LHFr7F.png');
    const s6 = await this.loadImg('https://i.imgur.com/MmNUhC5.png');
    const s7 = await this.loadImg('https://i.imgur.com/QCSiEdJ.png');
    const s8 = await this.loadImg('https://i.imgur.com/IeaHa9h.png');
    const s9 = await this.loadImg('https://i.imgur.com/4XdwjFG.png');

    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s1));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s2));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s3));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s4));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s5));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s6));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s7));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s8));
    this.removeAnimationsAcim.push(this.generateNewTexture(512, 512, s9));
  }

  private async loadRemoveAnimationYue(): Promise<any> {
    const s1 = await this.loadImg('https://i.imgur.com/0v90r6G.png');
    const s2 = await this.loadImg('https://i.imgur.com/OZmc9LV.png');
    const s3 = await this.loadImg('https://i.imgur.com/LRtQovo.png');

    this.removeAnimationYue.push(this.generateNewTexture(512, 512, s1));
    this.removeAnimationYue.push(this.generateNewTexture(512, 512, s2));
    this.removeAnimationYue.push(this.generateNewTexture(512, 512, s3));
  }

  public async updateBackground(): Promise<Texture> {
    const mapBg = await this.loadImg(GameSettings.all.settings.theming.map.backgroundImageUrl);
    const texture = this.generateNewTexture(2048, 2048, mapBg);

    this.removeFromCache(this.mapBackgroundImage);
    this.mapBackgroundImage = texture;

    return texture;
  }

  public async updateGlobalBackground(): Promise<Texture> {
    const sMapBg = await this.loadImg(GameSettings.all.settings.theming.map.globalBackgroundImageUrl);
    const texture = this.generateNewTexture(2048, 2048, sMapBg);

    this.removeFromCache(this.secondBackgroundImage);
    this.secondBackgroundImage = texture;

    return texture;
  }

  private async load() {
    const mapBg = await this.loadImg(GameSettings.all.settings.theming.map.backgroundImageUrl); 
    const rgbBorder = await this.loadImg('https://i.imgur.com/7eDfixc.png'); 
    const bgDispl = await this.loadImg('https://res.cloudinary.com/dvxikybyi/image/upload/v1486634113/2yYayZk_vqsyzx.png'); 
    const sMapBg = await this.loadImg(GameSettings.all.settings.theming.map.globalBackgroundImageUrl); 
    const glDispl = await this.loadImg('https://i.imgur.com/vtLSnyt.jpg'); 
    const outerRing = await this.loadImg('https://i.imgur.com/B24DABv.png'); 
    const innerRing = await this.loadImg('https://i.imgur.com/nr8ngwx.png'); 
    const hsloRing = await this.loadImg('https://i.imgur.com/Bx8Im3s.png'); 
    const rmAnimHslo = await(this.loadImg('https://i.imgur.com/ZTiEaOI.png'));
    await this.loadRemoveAnimationAcim();
    await this.loadRemoveAnimationYue();

    this.mapBackgroundImage = this.generateNewTexture(2048, 2048, mapBg); 
    this.rgbBorder = this.generateNewTexture(2048, 2048, rgbBorder); 
    this.secondBackgroundImage = this.generateNewTexture(2048, 2048, sMapBg); 
    this.globalDisplacement = this.generateNewTexture(512, 512, glDispl); 
    this.backgroundDisplacement = this.generateNewTexture(512, 512, bgDispl); 
    this.outerRing = this.generateNewTexture(512, 512, outerRing, true); 
    this.innerRing = this.generateNewTexture(512, 512, innerRing, true); 
    this.hsloRing = this.generateNewTexture(512, 512, hsloRing, true); 
    this.removeAnimationHSLO3D = this.generateNewTexture(512, 512, rmAnimHslo);
  }

  public async init(): Promise<any> {
    await this.load();

    const delay = () => new Promise((resolve: any) => setTimeout(() => resolve(), 50));

    await delay(); this.generateCell(); 
    await delay(); this.generateFood(); 
    await delay(); this.generateVirus(); 
    await delay(); this.generateMultiboxLinedRing(); 
    await delay(); this.generateMapBorders();
    await delay(); this.generateCellShadow(); 
    await delay(); this.generateRemoveEffect(); 
    await delay(); this.generateViewBox();
    await delay(); this.generateMyCellShadow();
    await delay(); this.mapBordersRgbLine = generateRgbBorderLine();
    await delay(); this.virusShots = generateVirusShots();

    FrontAPI.setGameLoaderShown(false);
  }

  public removeFromCache(texture: Texture): void {
    if (texture) {
      texture.destroy(true);
      Texture.removeFromCache(texture);
    }
  }

  public generateMultiboxLinedRing() {
    this.removeFromCache(this.multiboxLinedRing);
    this.multiboxLinedRing = generateMultiboxLinedRing();
  }

  public generateCell() {
    this.removeFromCache(this.cell);
    this.cell = generateCell();
  }

  public generateFood() {
    this.removeFromCache(this.food);
    this.food = generateFood();
  }

  public generateVirus() {
    this.removeFromCache(this.virus);
    this.virus = generateVirus();
  }

  public generateMapBorders() {
    this.removeFromCache(this.mapBorders);
    this.mapBorders = generateBorders();
  }

  public generateRgbLine() {
    this.removeFromCache(this.mapBordersRgbLine);
    this.mapBordersRgbLine = generateRgbBorderLine();
  }

  public generateRemoveEffect() {
    this.removeFromCache(this.removeEffect);
    this.removeEffect = generateRemoveEffect();
  }

  public generateViewBox() {
    this.removeFromCache(this.viewBox);
    this.viewBox = generateViewBox();
  }

  public generateCellShadow() {
    this.removeFromCache(this.cellShadow);
    this.cellShadow = generateCellShadow();
  }

  public generateMyCellShadow() {
    this.removeFromCache(this.myCellShadow);
    this.myCellShadow = generateMyCellShadow();
  }
}