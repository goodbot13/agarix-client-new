import { MIPMAP_MODES, SCALE_MODES, Texture, utils } from 'pixi.js';

const generateCell = () => {
  const size = 512;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.height = size;

  ctx.fillStyle = 'white';
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  utils.trimCanvas(canvas);
  
  const texture = Texture.from(canvas);

  texture.baseTexture.mipmap = MIPMAP_MODES.POW2;
  texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

  return texture;
}

export default generateCell;