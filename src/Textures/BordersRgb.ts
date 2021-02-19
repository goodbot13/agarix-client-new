import GameSettings from '../Settings/Settings';
import Globals from '../Globals';
import { MIPMAP_MODES, SCALE_MODES, Texture } from 'pixi.js';

const generateRgbBorderLine = () => {
  const { borderRoundness, borderColor, borderWidth } = GameSettings.all.settings.theming.map;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const renderSize = 512 * 4;

  canvas.width = canvas.height = renderSize;

  const ratio = Globals.MAP_RATIO;
  const offset = (borderWidth * 2 / 2 / ratio);

  ctx.strokeStyle = Globals.rgbToStringHex(borderColor);
  ctx.lineWidth = borderWidth * 2 / ratio;

  if (borderRoundness !== 0) {
    Globals.roundRect(ctx, offset, offset, renderSize - offset, renderSize - offset, borderRoundness / 4);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.lineTo(offset, offset);
    ctx.lineTo(renderSize - offset, offset);
    ctx.lineTo(renderSize - offset, renderSize - offset);
    ctx.lineTo(offset, renderSize - offset);
    ctx.closePath();
    ctx.stroke();
  }

  const texture = Texture.from(canvas);
  texture.baseTexture.mipmap = MIPMAP_MODES.POW2;
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  return texture;
}

export default generateRgbBorderLine;