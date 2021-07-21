import { Container } from 'pixi.js';
import World from '../../render/World';
import Borders from './Borders';
import Background from './Background';
import GlobalBackground from './GlobalBackground';
import Logger from '../../utils/Logger';

class GameMap extends Container {
  public borders: Borders;
  public background: Background;
  public globalBackground: GlobalBackground;
  public size: IMapSize = { width: 14142, height: 14142 };

  private eventListeners: Map<TMapEvent, Array<() => void>> = new Map();
  private logger = new Logger('Map');

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
    if (~~this.width === ~~this.size.width && ~~this.height === ~~this.size.height) {
      return;
    }

    this.size.width = width;
    this.size.height = height;

    this.emitEvent('sizechange');

    this.logger.info(`Size set - width: ${width}, height: ${height}`);
  }

  public listen(event: TMapEvent, action: () => void) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(action);

    this.eventListeners.set(event, listeners);

    this.logger.info(`Event: ${event}, action: ${typeof action}`);
  }

  private emitEvent(event: TMapEvent) {
    const events = this.eventListeners.get(event);

    if (events) {
      events.forEach((action) => action());
      
      this.logger.info(`Event emitted: ${event}, listeners: ${events.length}`);
    }
  }
}

export default GameMap;

type TMapEvent = 'sizechange';

interface IMapSize {
  width: number,
  height: number
}