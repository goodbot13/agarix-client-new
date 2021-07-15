import { Container } from 'pixi.js';
import World from '../../render/World';
import Borders from './Borders';
import Background from './Background';
import GlobalBackground from './GlobalBackground';

class GameMap extends Container {
  public borders: Borders;
  public background: Background;
  public globalBackground: GlobalBackground;
  public size: IMapSize = { width: 14142, height: 14142 };

  private eventListeners: Map<TMapEvent, Array<() => void>> = new Map();

  constructor(world: World) {
    super();

    this.borders = new Borders(this);
    this.background = new Background(world.view, this);
    this.globalBackground = new GlobalBackground(this);
    
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

  public setSize(width: number, height: number): void {
    if (this.width === this.size.width && this.height === this.size.height) {
      return;
    }

    this.size.width = width;
    this.size.height = height;
    this.emitEvent('sizechange');
  }

  public listen(event: TMapEvent, action: () => void) {
    this.eventListeners.get(event).push(action);
  }

  private emitEvent(event: TMapEvent) {
    this.eventListeners.get(event).forEach((action) => action());
  }
}

export default GameMap;

type TMapEvent = 'sizechange';

interface IMapSize {
  width: number,
  height: number
}