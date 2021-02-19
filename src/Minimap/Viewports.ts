import { ParticleContainer } from "pixi.js";
import Globals from "../Globals";
import { Location } from "../objects/types";
import ViewBox from "../objects/ViewBox";
import World from "../render/World";
import GameSettings from "../Settings/Settings";

export default class Viewports extends ParticleContainer {
  private firstTab: ViewBox;
  private topOneTab: ViewBox;

  constructor(private world: World) {
    super();

    this.zIndex = -8;

    this.create();
  }

  private transformLocation(location: Location, shift?: boolean): Location {
    const { size } = GameSettings.all.settings.theming.minimap;
    const { minX, minY } = this.world.view.firstTab.mapOffsets;

    const offsetX = !shift ? minX : -7071;
    const offsetY = !shift ? minY : -7071;

    return {
      x: (location.x - offsetX)  / 14142 * size,
      y: (location.y - offsetY) / 14142 * size,
      r: location.r / 14142 * size
    }
  }

  private create(): void {
    this.topOneTab = new ViewBox(this.world.textureGenerator);
    this.topOneTab.width = 0;
    this.topOneTab.height = 0;

    this.firstTab = new ViewBox(this.world.textureGenerator);
    this.firstTab.width = 0;
    this.firstTab.height = 0;

    this.updateColors();

    this.addChild(this.firstTab, this.topOneTab);
  }

  private animateFirstTab(): void {
    const { size } = GameSettings.all.settings.theming.minimap;
    const { viewport } = GameSettings.all.settings.game.minimap;

    if (viewport === 'All' || viewport === 'Main tab') {
      this.firstTab.visible = this.world.view.firstTab.isPlaying;

      const bounds = this.world.view.firstTab.bounds;
      const { x, y } = this.transformLocation({ x: bounds.left, y: bounds.top, r: 0 });
      const w = bounds.width / 14142 * size;
      const h = bounds.height / 14142 * size;
 
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

      const { x, y } = this.transformLocation({ x: bounds.left, y: bounds.top, r: 0 });
      const w = bounds.width / 14142 * size;
      const h = bounds.height / 14142 * size;
 
      this.topOneTab.animate(x, y, w, h);
    } else {
      this.topOneTab.visible = false;
    }
  }

  public updateColors(): void {
    const { topOneViewportColor, myViewportColor } = GameSettings.all.settings.theming.minimap;

    this.topOneTab.tint = Globals.getColor(topOneViewportColor);
    this.topOneTab.alpha = topOneViewportColor.alpha;

    this.firstTab.tint = Globals.getColor(myViewportColor);
    this.firstTab.alpha = myViewportColor.alpha;
  }

  public renderTick(): void {
    this.animateFirstTab();
    this.animateTopOneTab();
  }
}