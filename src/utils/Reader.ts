export default class Reader {
  public offset: number;
  public view: DataView;

  constructor(value?: ArrayBuffer | DataView, ab?: boolean) {
    if (value) {
      if (ab) {
        this.view = new DataView(value as ArrayBuffer);
      } else {
        this.view = value as DataView;
      }

      this.offset = 0;
    }
  }

  public setView(view: DataView): void {
    this.offset = 0;
    this.view = view;
  }

  public endOfBuffer() {
    return this.offset >= this.view.byteLength;
  }

  public shiftOffset(number: number): void {
    this.offset += number;
  }

  public getUint8(): number {
    return this.view.getUint8(this.offset++);
  }

  public getInt8(): number {
    return this.view.getInt8(this.offset++);
  }

  public getUint16(): number {
    return this.view.getUint16((this.offset += 2) - 2, true);
  }

  public getInt16(): number {
    return this.view.getInt16((this.offset += 2) - 2, true);
  }

  public getUint32(): number {
    return this.view.getUint32((this.offset += 4) - 4, true);
  }

  public getInt32(): number {
    return this.view.getInt32((this.offset += 4) - 4, true);
  }

  getFloat32(): number {
    return this.view.getFloat32((this.offset += 4) - 4, true);
  }

  public getFloat64(): number {
    return this.view.getFloat64((this.offset += 8) - 8, true);
  }

  public getStringUTF8(): string {
    let string = '';
    let byte;

    while ((byte = this.view.getUint8(this.offset++)) !== 0) {
      string += String.fromCharCode(byte);
    }

    return decodeURIComponent(escape(string));
  }

  public readUTF16string() {
    let ue = '';
    for (; !this.endOfBuffer(); ) {
      const fe = this.getUint16();
      if (0 === fe) {
        break;
      }
      ue += String.fromCharCode(fe);
    }
    return ue;
  }

  public decompressMessage(): void {
    const messageBuffer = Buffer.from(this.view.buffer);
    const readMessage = Buffer.alloc(messageBuffer.readUInt32LE(1));
    this.uncompressBlock(messageBuffer.slice(5), readMessage);
    this.setView(new DataView(readMessage.buffer));
  }

  private copy(dest, src, di, si, len): void {
    for (let i = 0; i < len; ++i) {
      dest[di++] = src[si++];
    }
  }

  private uncompressBlock(src, dest): void {
    const sn = src.length;
    const dn = dest.length;
    if (sn === 0) {
      return;
    }
    for (let si = 0, di = 0; ; ) {
      let lLen = src[si] >> 4;
      let mLen = src[si] & 0xf;
      if (++si === sn) {
        throw new Error('Invalid source');
      }
      if (lLen > 0) {
        if (lLen === 0xf) {
          while (src[si] === 0xff) {
            lLen += 0xff;
            if (++si === sn) {
              throw new Error('Invalid source');
            }
          }
          lLen += src[si];
          if (++si === sn) {
            throw new Error('Invalid source');
          }
        }
        if (dn - di < lLen || si + lLen > sn) {
          throw new Error('Short buffer');
        }
        this.copy(dest, src, di, si, lLen);
        di += lLen;
        si += lLen;
        if (si >= sn) {
          return;
        }
      }

      si += 2;
      if (si >= sn) {
        throw new Error('Invalid source');
      }
      const offset = src[si - 2] | (src[si - 1] << 8);
      if (di - offset < 0 || offset === 0) {
        throw new Error('Invalid source');
      }
      if (mLen === 0xf) {
        while (src[si] === 0xff) {
          mLen += 0xff;
          if (++si === sn) {
            throw new Error('Invalid source');
          }
        }
        mLen += src[si];
        if (++si === sn) {
          throw new Error('Invalid source');
        }
      }
      mLen += 4;
      if (dn - di <= mLen) {
        throw new Error('Short buffer');
      }
      for (; mLen >= offset; mLen -= offset) {
        this.copy(dest, dest, di, di - offset, offset);
        di += offset;
      }
      this.copy(dest, dest, di, di - offset, mLen);
      di += mLen;
    }
  }
}
