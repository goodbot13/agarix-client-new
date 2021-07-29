import { utils } from "pixi.js";
import { Location, RGB } from "../objects/types";
import Settings from "../Settings/Settings";
import { IMapOffsets } from "../tabs/Socket/Socket";

export const transformMinimapLocation = (location: Location, mapOffsets: IMapOffsets, shift?: boolean): Location => {
  const { size } = Settings.all.settings.theming.minimap;

  const offsetX = !shift ? mapOffsets.minX : -mapOffsets.width / 2;
  const offsetY = !shift ? mapOffsets.minY : -mapOffsets.height / 2;

  return {
    x: (location.x - offsetX)  / mapOffsets.width * size,
    y: (location.y - offsetY) / mapOffsets.height * size,
    r: location.r / mapOffsets.width * size
  }
}

export const createTokens = (party: string, server: string): string => {
  if (party) {
    return `${party}%${server}`;
  } else {
    return `%${server}`;
  }
}

export const getColorLighten = (lighten: number, { red, green, blue }: RGB): number => {
  const r = Math.min(lighten / red, 1);
  const g = Math.min(lighten / green, 1);
  const b = Math.min(lighten / blue, 1);

  return utils.rgb2hex([r, g, b]);
}

export const getColor = ({ red, green, blue }: RGB): number => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  return utils.rgb2hex([r, g, b]);
}

const componentToHex = (c: number): string => {
  const hex = c ? c.toString(16) : '';
  return hex.length == 1 ? "0" + hex : hex;
}

export const rgbToStringHex = ({ red, green, blue }: RGB): string => {
  return "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
}

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, r: number): void => {
  const radius = {
    tl: r, 
    tr: r, 
    br: r, 
    bl: r
  };

  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}

/* eslint-disable */
export const shiftKey = (key) => {
  return key = 0 | Math.imul(key, 1540483477), 
         key = 114296087 ^ (0 | Math.imul(key >>> 24 ^ key, 1540483477)), 
         (key = 0 | Math.imul(key >>> 13 ^ key, 1540483477)) >>> 15 ^ key;
}

export const shiftMessage = (view, key) => {
  for (var i = 0; i < view.byteLength; i++) 
    view.setUint8(i, view.getUint8(i) ^ key >>> i % 4 * 8 & 255);
  
  return view
}

export const murmur2 = (e, t) => {
  var i = e.length;
  t ^= i;
  for (var n, o = 0; 4 <= i;) n = 1540483477 * (65535 & (n = 255 & e.charCodeAt(o) | (255 & e.charCodeAt(++o)) << 8 | (255 & e.charCodeAt(++o)) << 16 | (255 & e.charCodeAt(++o)) << 24)) + ((1540483477 * (n >>> 16) & 65535) << 16), t = 1540483477 * (65535 & t) + ((1540483477 * (t >>> 16) & 65535) << 16) ^ (n = 1540483477 * (65535 & (n ^= n >>> 24)) + ((1540483477 * (n >>> 16) & 65535) << 16)), i -= 4, ++o;
  switch (i) {
      case 3:
          t ^= (255 & e.charCodeAt(o + 2)) << 16;
      case 2:
          t ^= (255 & e.charCodeAt(o + 1)) << 8;
      case 1:
          t = 1540483477 * (65535 & (t ^= 255 & e.charCodeAt(o))) + ((1540483477 * (t >>> 16) & 65535) << 16)
  }
  return ((t = 1540483477 * (65535 & (t ^= t >>> 13)) + ((1540483477 * (t >>> 16) & 65535) << 16)) ^ t >>> 15) >>> 0
}

export const createView = (value) => {
  return new DataView(new ArrayBuffer(value));
}