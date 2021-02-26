import GameSettings from '../Settings/Settings';
import { MIPMAP_MODES, SCALE_MODES, Texture, Sprite, Container } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { getColor, rgbToStringHex } from '../utils/helpers';
import Globals from '../Globals';

const generateVirus = () => {
  const {
    color,
    transparency,
    borderWidth,
    glow,
    borderColor,
    glowColor,
    glowDistance,
    glowStrength
  } = GameSettings.all.settings.theming.viruses;

  const size = 512;
  const glowQuality = 0.015;

  const cellCanvas = document.createElement('canvas');
  const ctx = cellCanvas.getContext('2d');
  cellCanvas.width = cellCanvas.height = size;
  ctx.fillStyle = rgbToStringHex(color);
  ctx.globalAlpha = transparency;
  ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
  ctx.fill();

  const canv = document.createElement('canvas');
  const ct = canv.getContext('2d');
  canv.width = canv.height = size;
  ct.strokeStyle = rgbToStringHex(borderColor);
  ct.lineWidth = borderWidth;
  ct.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
  ct.stroke();

  let border: Sprite;
  let cell: Sprite;
  let cont: Container;

  if (glow) {

    if (GameSettings.all.settings.game.performance.glowFilterShaderType === 'GPU-1') {

      cell = Sprite.from(Texture.from(cellCanvas));
      border = Sprite.from(Texture.from(canv));
      cont = new Container();

      border.filters = [new GlowFilter({
        color: getColor(glowColor),
        distance: glowDistance,
        outerStrength: glowStrength,
        quality: glowQuality
      })];

    } else if (GameSettings.all.settings.game.performance.glowFilterShaderType === 'Canvas') {
      ctx.strokeStyle = rgbToStringHex(borderColor);
      ctx.lineWidth = borderWidth;
      ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
      ctx.shadowBlur = glowDistance / 1.25;
      ctx.shadowColor = rgbToStringHex(glowColor);
      
      for (let i = 0; i < glowStrength / 1.75; i++) {
        ctx.stroke();
      }
    }

  }

  let texture: Texture;

  if (glow) {
    if (GameSettings.all.settings.game.performance.glowFilterShaderType === 'GPU-1') {
      cont.addChild(cell, border);
      texture = Globals.app.renderer.generateTexture(cont, SCALE_MODES.LINEAR, 1);
    } else if (GameSettings.all.settings.game.performance.glowFilterShaderType === 'Canvas') {
      texture = Texture.from(cellCanvas);
    }
  } else {
    cell = Sprite.from(Texture.from(cellCanvas));
    border = Sprite.from(Texture.from(canv));
    cont = new Container();
    cont.addChild(cell, border);
    texture = Globals.app.renderer.generateTexture(cont, SCALE_MODES.LINEAR, 1);
  }

  texture.baseTexture.mipmap = MIPMAP_MODES.POW2;
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  return texture;
}

export default generateVirus;