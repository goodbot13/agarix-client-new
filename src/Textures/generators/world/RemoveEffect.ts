import { SCALE_MODES, Texture } from 'pixi.js';

const generateRemoveEffect = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 512;

  const depth = 256 - 25;

  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, depth);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, '#ff96f1');

  ctx.arc(256, 256, 256, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();

  const texture = Texture.from(canvas);
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  return texture;
}

export default generateRemoveEffect;