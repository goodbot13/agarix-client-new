import { Application } from 'pixi.js';

export default new class Globals {
  public app: Application;
  public gameBlured: boolean;
  public gameBluring: boolean;
  public fullMapViewRender: boolean;
  
  public init(app: Application): void {
    this.app = app;
    this.gameBlured = false;
    this.gameBluring = false;
    this.fullMapViewRender = true;
  }
}