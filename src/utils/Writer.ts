export default class Writer {
  public message: any;
  public offset: number;

  constructor(size?: number) {
    this.message = Buffer.alloc(size);
    this.offset = 0;
  }

  get buffer() {
    return this.message.buffer;
  }

  get dataView() {
    return new DataView(this.buffer);
  }

  public setToArray(): void {
    this.message = [];
  }

  public writeUInt8(value: number): void {
    this.message.writeUInt8(value, this.offset++);
  }

  public writeInt8(value: number): void{
    this.message.writeInt8(value, this.offset++);
  }

  public writeUInt16(value: number): void {
    this.message.writeUInt16LE(value, this.offset);
    this.offset += 2;
  }

  public writeInt16(value: number): void {
    this.message.writeInt16LE(value, this.offset);
    this.offset += 2;
  }

  public writeUInt24(value: number): void {
    this.message.writeUIntLE(value, this.offset, 3);
    this.offset += 3;
  }

  public writeInt24(value: number): void {
    this.message.writeIntLE(value, this.offset, 3);
    this.offset += 3;
  }

  public writeUInt32(value: number): void {
    this.message.writeUInt32LE(value, this.offset);
    this.offset += 4;
  }

  public writeInt32(value: number): void {
    this.message.writeInt32LE(value, this.offset);
    this.offset += 4;
  }

  public writeString(msg: string): void {
    for (let i = 0; i < msg.length; i++) {
      this.writeUInt8(msg.charCodeAt(i));
    }

    this.writeUInt8(0);
  }

  public writeString16(msg: string): void {
    for (let i = 0; i < msg.length; i++) {
      this.writeUInt16(msg.charCodeAt(i));
    }

    this.writeUInt16(0);
  }
  
	public writeBytes(bytes: any): void {
		this.message.push(...bytes);
  }
  
	public writeUint32InLEB128(value: number): void {
		while (true) {
			if ((value & -128) === 0) {
				this.message.push(value);
				break;
			} else {
				this.message.push(value & 127 | 128);
				value >>>= 7;
			}
		}
	}
}