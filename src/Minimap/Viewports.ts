import { Container } from "pixi.js";
import ViewBox from "../objects/ViewBox";
import World from "../render/World";
import GameSettings from "../Settings/Settings";
import PlayerState from "../states/PlayerState";
import { getColor, transformMinimapLocation } from "../utils/helpers";

export default class Viewports extends Container {
  private firstTab: ViewBox;
  private topOneTab: ViewBox;

  constructor(private world: World) {
    super();

    this.zIndex = -8;

    this.create();
  }

  private create(): void {
    this.topOneTab = new ViewBox();
    this.topOneTab.width = 0;
    this.topOneTab.height = 0;

    this.firstTab = new ViewBox();
    this.firstTab.width = 0;
    this.firstTab.height = 0;

    this.updateColors();

    this.addChild(this.firstTab, this.topOneTab);
  }

  private animateFirstTab(): void {
    const { size } = GameSettings.all.settings.theming.minimap;
    const { viewport } = GameSettings.all.settings.game.minimap;

    if (viewport === 'All' || viewport === 'Main tab') {
      this.firstTab.visible = PlayerState.first.playing;

      const bounds = this.world.view.firstTab.bounds;

      const { x, y } = transformMinimapLocation({ 
          x: bounds.left, 
          y: bounds.top, 
          r: 0 
        }, 
        this.world.view.firstTab.getShiftedMapOffsets()
      );

      const w = bounds.width / this.world.map.size.width * size;
      const h = bounds.height / this.world.map.size.height * size;
 
      this.firstTab.animate(x, y, w, h);
    } else {
      this.firstTab.visible = false;
    }
  }

  private animateTopOneTab(): void {
    const { size } = GameSettings.all.settings.theming.minimap;
    const { viewport } = GameSettings.all.settings.game.minimap;

    if (viewport === 'All' || viewport === 'Top one tab') {
      const { viewport } = this.world.view.topOneTab;

      this.topOneTab.visible = (viewport.x !== 0 && viewport.y !== 0);

      const bounds = this.world.view.topOneTab.bounds;

      const { x, y } = transformMinimapLocation({ 
          x: bounds.left, 
          y: bounds.top, 
          r: 0 
        }, 
        this.world.view.firstTab.getShiftedMapOffsets()
      );

      const w = bounds.width / this.world.map.size.width * size;
      const h = bounds.height / this.world.map.size.height * size;
 
      this.topOneTab.animate(x, y, w, h);
    } else {
      this.topOneTab.visible = false;
    }
  }

  public updateColors(): void {
    const { topOneViewportColor, myViewportColor } = GameSettings.all.settings.theming.minimap;

    this.topOneTab.tint = getColor(topOneViewportColor);
    this.topOneTab.alpha = topOneViewportColor.alpha;

    this.firstTab.tint = getColor(myViewportColor);
    this.firstTab.alpha = myViewportColor.alpha;
  }

  public renderTick(): void {
    this.animateFirstTab();
    this.animateTopOneTab();
  }
}