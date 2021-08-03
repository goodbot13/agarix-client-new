import { Container } from "pixi.js";
import ViewBox from "../ViewBox";
import * as PIXI from 'pixi.js';
import IMapObject from "./interfaces";
import World from "../../render/World";

export default class ViewportVisualizer extends Container implements IMapObject {
  public firstTab: ViewBox;
  public secondTab: ViewBox;
  public topOneTab: ViewBox;

  constructor(private world: World) {
    super();
    this.create();




    this.visible = false;



    

  }

  private checkSettings(): void {
/*     const { firstTab, secondTab, topOneTab } = Settings.viewBox;
    const { deltaTime } = PIXI.Ticker.shared;
    const { ticks } = Globals;

    if (~~(ticks % (5 * deltaTime)) === 0) {
      this.firstTab.visible = firstTab.enabled;
      this.firstTab.alpha = firstTab.alpha;
      this.firstTab.tint = Globals.getColor(firstTab.tint);

      this.secondTab.visible = secondTab.enabled;
      this.secondTab.alpha = secondTab.alpha;
      this.secondTab.tint = Globals.getColor(secondTab.tint);

      this.topOneTab.visible = topOneTab.enabled;
      this.topOneTab.alpha = topOneTab.alpha;
      this.topOneTab.tint = Globals.getColor(topOneTab.tint);
    } */
  }

  private create(): void {
    this.firstTab = new ViewBox(this.world); 
    this.firstTab.zIndex = 101;

    this.secondTab = new ViewBox(this.world);
    this.secondTab.zIndex = 102;

    this.topOneTab = new ViewBox(this.world);
    this.topOneTab.zIndex = 103;

    this.addChild(this.firstTab, this.secondTab, this.topOneTab);
  }

  public renderTick(): void {
    const { topOneTab, firstTab, secondTab } = this.world.view;

    this.firstTab.animate(
      firstTab.bounds.left - firstTab.mapOffsets.minX, 
      firstTab.bounds.top - firstTab.mapOffsets.minY, 
      firstTab.bounds.width, 
      firstTab.bounds.height
    );

    this.secondTab.animate(
      secondTab.bounds.left - firstTab.mapOffsets.minX, 
      secondTab.bounds.top - firstTab.mapOffsets.minY, 
      secondTab.bounds.width, 
      secondTab.bounds.height
    );

    this.topOneTab.animate(
      topOneTab.bounds.left - firstTab.mapOffsets.minX, 
      topOneTab.bounds.top - firstTab.mapOffsets.minY, 
      topOneTab.bounds.width, 
      topOneTab.bounds.height
    );

    this.checkSettings();
  }
}