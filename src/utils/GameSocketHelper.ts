/* eslint-disable */
export const generateClientKey = (option, _relatedTarget) => {
  if (!option.length || !_relatedTarget.byteLength) {
    return null;
  }
  let key = null;
  const suggestedValue = 1540483477;
  const constraints = option.match(/(wss+:\/\/)([^:]*)(:\d+)/)[2];
  const framesize = constraints.length + _relatedTarget.byteLength;
  const data = new Uint8Array(framesize);
  let value = 0;
  for (; value < constraints.length; value++) {
    data[value] = constraints.charCodeAt(value);
  }
  data.set(_relatedTarget, constraints.length);
  const view = new DataView(data.buffer);
  let maxTextureAvailableSpace = framesize - 1;
  const type = (maxTextureAvailableSpace - 4 & -4) + 4 | 0;
  let imulkeyValue = maxTextureAvailableSpace ^ 255;
  let offset = 0;
  for (; maxTextureAvailableSpace > 3;) {
    key = Math.imul(view.getInt32(offset, true), suggestedValue) | 0;
    imulkeyValue = (Math.imul(key >>> 24 ^ key, suggestedValue) | 0) ^ (Math.imul(imulkeyValue, suggestedValue) | 0);
    maxTextureAvailableSpace = maxTextureAvailableSpace - 4;
    offset = offset + 4;
  }
  switch (maxTextureAvailableSpace) {
    case 3:
      imulkeyValue = data[type + 2] << 16 ^ imulkeyValue;
      imulkeyValue = data[type + 1] << 8 ^ imulkeyValue;
      break;
    case 2:
      imulkeyValue = data[type + 1] << 8 ^ imulkeyValue;
      break;
    case 1:
      break;
    default:
      key = imulkeyValue;
      break;
  }
  if (key !== imulkeyValue) {
    key = Math.imul(data[type] ^ imulkeyValue, suggestedValue) | 0;
  }
  imulkeyValue = key >>> 13;
  key = imulkeyValue ^ key;
  key = Math.imul(key, suggestedValue) | 0;
  imulkeyValue = key >>> 15;
  key = imulkeyValue ^ key;
  return key;
}

export const shiftKey = (key) => {
  const value = 1540483477;
  key = Math.imul(key, value) | 0;
  key = (Math.imul(key >>> 24 ^ key, value) | 0) ^ 114296087;
  key = Math.imul(key >>> 13 ^ key, value) | 0;
  return key >>> 15 ^ key;
}

export const shiftMessage = (view, key, write) => {
  if (!write) {
    for (var length = 0; length < view.byteLength; length++) {
      view.setUint8(length, view.getUint8(length) ^ key >>> length % 4 * 8 & 255);
    }
  } else {
    for (var length = 0; length < view.length; length++) {
      view.writeUInt8(view.readUInt8(length) ^ key >>> length % 4 * 8 & 255, length);
    }
  }
  return view;
}

export const createView = (value) => {
  return new DataView(new ArrayBuffer(value));
}