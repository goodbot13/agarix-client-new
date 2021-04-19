import { MIPMAP_MODES, SCALE_MODES, Texture, utils } from 'pixi.js';

const generateVirusShots = () => {
  const size = 416;
  const shadowSize = 16;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.height = size;

  ctx.shadowBlur = shadowSize;
  ctx.shadowColor = 'white';
  ctx.fillStyle = 'white';
  ctx.arc(size / 2, size / 2, size / 2 - shadowSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.fill();
  
  const texture = Texture.from(canvas);

  texture.baseTexture.mipmap = MIPMAP_MODES.POW2;
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  return texture;
}

export default generateVirusShots;