import { Graphics, SCALE_MODES, Rectangle } from "pixi.js";
import Globals from "../../../Globals";

const createViewBox = () => {
  const g = new Graphics();
  
  g.beginFill(0xFFFFFF, 1);
  g.drawRect(0, 0, 512, 512);
  g.endFill();

  const area = new Rectangle(0, 0, 512, 512);
  const texture = Globals.app.renderer.generateTexture(g, SCALE_MODES.LINEAR, 1, area);

  return texture;
}

export default createViewBox;