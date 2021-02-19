import GameSettings from '../Settings/Settings';
import Globals from '../Globals';
import { MIPMAP_MODES, SCALE_MODES, Graphics, Container, Rectangle, Texture } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

const generateBorders = () => {
  const {
    borderGlow,
    borderGlowColor,
    borderGlowDistance,
    borderGlowStrength,
    borderRoundness,
    borderColor,
    borderWidth
  } = GameSettings.all.settings.theming.map;

  const glowQuality = 0.0065;
  const bordersRenderSize = 512;
  const rounded = true;

  if (GameSettings.all.settings.game.performance.glowFilterShaderType === 'GPU-1') {
    const offset = borderGlow ? borderWidth : 0;
    const g = new Graphics();

    g.lineStyle(borderWidth, Globals.getColor(borderColor));
    
    if (rounded) {
      g.drawRoundedRect(offset, offset, bordersRenderSize * 1.5 - offset, bordersRenderSize * 1.5 - offset, borderRoundness);
    } else {
      g.lineTo(bordersRenderSize * 1.5 - offset, 0);
      g.lineTo(bordersRenderSize * 1.5 - offset, bordersRenderSize * 1.5 - offset);
      g.lineTo(0, bordersRenderSize * 1.5 - offset);
      g.closePath();
    }

    if (borderGlow) {
      g.filters = [new GlowFilter({ 
        quality: glowQuality, 
        outerStrength: borderGlowStrength,
        distance: borderGlowDistance, 
        color: Globals.getColor(borderGlowColor)
      })];
      g.y = g.x = borderWidth + borderGlowDistance;
    } else {
      g.y = g.x = borderWidth / 2;
    }

    const c = new Container();
    c.addChild(g);

    const borderSize = borderGlow 
      ? (bordersRenderSize * 1.5 + borderGlowDistance * 2 + borderWidth * 2) 
      : bordersRenderSize * 1.5 + borderWidth;

    const area = new Rectangle(0, 0, borderSize, borderSize);
    const texture = Globals.app.renderer.generateTexture(c, SCALE_MODES.LINEAR, 1, area);
    texture.baseTexture.mipmap = MIPMAP_MODES.ON; 

    return texture;
  } else {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const renderSize = bordersRenderSize * 4;

    canvas.width = canvas.height = renderSize;

    const ratio = Globals.MAP_RATIO;
    const _borderGlowDistance = borderGlow ? borderGlowDistance : 1;
    const offset = ((_borderGlowDistance / ratio) + (borderWidth / 2 / ratio)) * 2;

    ctx.strokeStyle = Globals.rgbToStringHex(borderColor);
    ctx.lineWidth = borderWidth / ratio;

    ctx.beginPath();
    ctx.lineTo(offset, offset);
    ctx.lineTo(renderSize - offset, offset);
    ctx.lineTo(renderSize - offset, renderSize - offset);
    ctx.lineTo(offset, renderSize - offset);
    ctx.closePath();

    if (borderGlow) {
      ctx.shadowBlur = _borderGlowDistance / ratio / 1.5;
      ctx.shadowColor = Globals.rgbToStringHex(borderGlowColor);
          
      for (let i = 0; i < borderGlowStrength; i++) {
        ctx.stroke();
      }
    } else {
      ctx.stroke();
    }

    let texture = Texture.from(canvas);
    texture.baseTexture.mipmap = MIPMAP_MODES.POW2;

    return texture;
  }
}

export default generateBorders;