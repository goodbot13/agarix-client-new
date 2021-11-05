import { utils } from "pixi.js";
import { Location, RGB } from "../objects/types";
import Settings from "../Settings/Settings";
import { IMapOffsets } from "../tabs/Socket/Socket";

export const transformMinimapLocation = (location: Location, mapOffsets: IMapOffsets, settings: Settings, shift?: boolean): Location => {
  const { size } = settings.all.settings.theming.minimap;

  const offsetX = !shift ? mapOffsets.minX : -mapOffsets.width / 2;
  const offsetY = !shift ? mapOffsets.minY : -mapOffsets.height / 2;

  return {
    x: (location.x - offsetX)  / mapOffsets.width * size,
    y: (location.y - offsetY) / mapOffsets.height * size,
    r: location.r / mapOffsets.width * size
  }
}

export const createTokens = (party: string, server: string): string => {
  if (!party && !server) {
    return '';
  }
  
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

export const tokenToWs = (token) => {
  if (!token) {
      return null;
  }
  let ws = null;
  if (!ws && /^[a-z0-9]{5,}\.tech$/ .test(token)) {
      ws = `wss://live-arena-` + token + `.agar.io:80`;
  }
  if (/^[a-zA-Z0-9=+/]{12,}$/ .test(token)) {
      const atobToken = atob(token);
      //ccse
      if(!ws && atobToken.search(/agar\.io/)==-1){
          ws = 'wss://'+atobToken
          return ws
      }
      if (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{1,4}/ .test(atobToken)) {
          ws = `wss://ip-${atobToken.replace(/./g, '-').replace(':', `.tech.agar.io:`)}`;
      }
  }
  if (!ws && /^[a-z0-9]{5,}$/ .test(token)) {
      ws = `wss://live-arena-` + token + `.agar.io:443`;
  }
  return ws;
}

export const wsToToken = (_ws) => {
  let serverToken = ''
  let serverIP = ''
  let matchOld = _ws.match(/ip-\d+/);
  const matchNew = _ws.match(/live-arena-([\w\d]+)/);
  var matchNew2 = _ws.match(/live-arena-(.+\.tech)/);
  let text = null;
  if (matchOld) {
      const replace = _ws.replace(`.tech.agar.io`, '').replace(/-/g, '.');
      matchOld = replace.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{1,4}/);
      if (matchOld) {
          serverIP = matchOld[0];
          text = btoa(serverIP);
      }
  }
  if (matchNew2 && matchNew2[1]) { //wss://live-arena-19bre41.tech.agar.io:80
      const replace = matchNew2[1]
      text = replace;
  }
  //ccse
  if(_ws.search(/wss?:\/\//)>-1 && _ws.search(/agar\.io/)==-1){
      text = _ws.match(/wss?:\/\/(.+)/)[1]
      serverIP = text
      text = btoa(text)
  }
  if (!text && matchNew) {
      text = matchNew[1];
  }
  if (text) {
      if (serverToken !== text) {
          serverToken = text;
      }
      /*this.server.partyToken = '';
      const matchPartyId = _ws.match(/party_id=([A-Z0-9]{6})/);
      if (matchPartyId) {
          this.server.partyToken = matchPartyId[1];
          master.setURL('/#' + window.encodeURIComponent(this.server.partyToken))
      }*/
      return text
  }
  return 'EWTT'+Math.random()
}