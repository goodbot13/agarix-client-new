import { SCALE_MODES, Texture } from "pixi.js";
import GameSettings from "../../../Settings/Settings";

const generateMultiboxLinedRing = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 512;
  const lineWidth = GameSettings.all.settings.theming.multibox.linedRingSize;

  canvas.width = canvas.height = size;

  ctx.fillStyle = 'transparent';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = lineWidth;
  ctx.arc(size / 2, size / 2, size / 2 - lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();

  let texture = Texture.from(canvas);
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  return texture;
}

export default generateMultiboxLinedRing;