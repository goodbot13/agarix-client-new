import GameSettings from '../Settings/Settings';
import Globals from '../Globals';
import { SCALE_MODES, Texture, Sprite, utils, MIPMAP_MODES } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

const generateFood = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const { 
    size,
    color,
    glow,
    glowColor,
    glowDistance,
    glowStrength,
    crisp
  } = GameSettings.all.settings.theming.food;

  const canvasSize = 512;
  const glowQuality = 0.13;

  canvas.width = canvas.height = canvasSize; // 512

  ctx.fillStyle = Globals.rgbToStringHex(color);
  ctx.globalAlpha = color.alpha;
  ctx.arc(canvasSize / 2, canvasSize / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  let sprite: Sprite;

  if (glow) {
    if (GameSettings.all.settings.game.performance.glowFilterShaderType === 'GPU-1') {

      utils.trimCanvas(canvas);

      sprite = new Sprite(Texture.from(canvas));

      sprite.filters = [new GlowFilter({
        color: Globals.getColor(glowColor),
        distance: glowDistance,
        outerStrength: glowStrength,
        quality: glowQuality
      })];

    } else {

      ctx.shadowColor = Globals.rgbToStringHex(glowColor);
      ctx.shadowBlur = glowDistance / 2.5;
  
      for (let i = 0; i < glowStrength / 1.5; i++) {
        ctx.fill();
      }
  
      utils.trimCanvas(canvas);

      sprite = new Sprite(Texture.from(canvas));
    }
    
  } else {
    sprite = new Sprite(Texture.from(canvas));
  }

  const texture = Globals.app.renderer.generateTexture(sprite, SCALE_MODES.LINEAR, 1);
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  if (!crisp) {
    texture.baseTexture.mipmap = MIPMAP_MODES.POW2;
  }

  return texture;
}

export default generateFood;