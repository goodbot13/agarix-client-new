import Settings from '../../../Settings/Settings';
import { MIPMAP_MODES, SCALE_MODES, Texture, Sprite, Container, Rectangle } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { getColor, rgbToStringHex } from '../../../utils/helpers';
import Globals from '../../../Globals';

const generateVirus = (settings: Settings): Texture => {
  const {
    color,
    transparency,
    borderWidth,
    glow,
    borderColor,
    glowColor,
    glowDistance,
    glowStrength
  } = settings.all.settings.theming.viruses;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const halfBorder = borderWidth / 2;
  const glowOffset = glow ? glowDistance * 2 : 0;
  canvas.width = canvas.height = 400 + borderWidth + glowOffset;
  
  ctx.strokeStyle = rgbToStringHex(borderColor);
  ctx.lineWidth = borderWidth;

  const glowShift = glow ? glowDistance : 0;
  ctx.arc(200 + halfBorder + glowShift, 200 + halfBorder + glowShift, 200, 0, Math.PI * 2);
  ctx.stroke();

  let texture = Texture.from(canvas);

  texture.baseTexture.mipmap = MIPMAP_MODES.ON;
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  const sprite = new Sprite(texture);

  if (glow) {
    // @ts-ignore
    sprite.filters = [new GlowFilter({
      color: getColor(glowColor),
      distance: glowDistance,
      outerStrength: glowStrength,
      quality: 0.0175
    })];
  }

  texture = Globals.app.renderer.generateTexture(sprite, SCALE_MODES.LINEAR, 1);
  texture.baseTexture.mipmap = MIPMAP_MODES.ON;
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  return texture;
}

export default generateVirus;