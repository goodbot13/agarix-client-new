import { Container } from 'pixi.js';
import * as PIXI from 'pixi.js';
import Globals from '../../Globals';
import World from '../../render/World';
import Borders from './Borders';
import Background from './Background';
import GlobalBackground from './GlobalBackground';

class Map extends Container {
  public borders: Borders;
  public background: Background;
  public globalBackground: GlobalBackground;

  constructor(world: World) {
    super();

    this.borders = new Borders();
    this.background = new Background(world.view);
    this.globalBackground = new GlobalBackground();

    this.addChild(this.globalBackground, this.background, this.borders);
  }

  public renderTick(): void {
    this.borders.renderTick();
    this.background.renderTick();
    this.globalBackground.renderTick();
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}

export default Map;
