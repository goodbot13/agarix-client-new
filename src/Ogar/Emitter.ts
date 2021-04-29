import Writer from '../utils/Writer';
import Socket from './Socket';
import FrontAPI from '../communication/FrontAPI';
import GameSettings from '../Settings/Settings';
import Master from '../Master';

const SPAWN_OPCODE = 1;
const DEATH_OPCODE = 2;
const JOIN_OPCODE = 3;
const NICK_OPCODE = 10;
const TAG_OPCODE = 11;
const SKIN_OPCODE = 12;
const CUSTOM_COLOR_OPCODE = 13;
const PLAYER_CELL_COLOR_OPCODE = 14;
const PARTY_TOKEN_OPCODE = 15;
const SERVER_TOKEN_OPCODE = 16;
const REGION_OPCODE = 17;
const GAMEMODE_OPCODE = 18;
const PLAYER_UPDATE_OPCODE = 20;
const PLAYER_POSITION_UPDATE_OPCODE = 30;

export default class Emitter {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public sendHandshake(): void {
    let buffer = new Writer(3);

    buffer.writeUInt8(0);
    buffer.writeUInt16(this.socket.handshakeKey);

    this.socket.send(buffer.buffer);

    // statistics at https://snez.org:8080/
    buffer = new Writer(3);
    buffer.writeUInt8(5);
    buffer.writeUInt16(90);
    this.socket.send(buffer.buffer);
  }

  public sendChatMessage(str: string, type: number): void {
    const buffer = new Writer(12 + str.length * 2);

    buffer.writeUInt8(100);
    buffer.writeUInt8(type);
    buffer.writeUInt32(this.socket.player.id);
    buffer.writeUInt32(0);
    buffer.writeString16(str);

    this.socket.send(buffer.buffer);
  }

  public sendPlayerSpawn(): void {
    this.socket.player.alive = true;
    this.sendPlayerState(SPAWN_OPCODE);
  }

  public sendPlayerDeath(): void {
    this.socket.player.alive = false;
    this.sendPlayerState(DEATH_OPCODE);
  }

  public sendPlayerJoin(): void {
    this.socket.player.alive = false;
    this.sendPlayerState(JOIN_OPCODE);
  }

  public sendPlayerNick(): void {
    this.sendString(NICK_OPCODE, this.socket.player.nick);
  }

  public sendPlayerSkin(): void {
    this.sendString(SKIN_OPCODE, this.socket.player.skin);
  }

  public sendPlayerTag(): void {
    this.sendString(TAG_OPCODE, GameSettings.all.profiles.tag);
    this.socket.team.clear();

    FrontAPI.updateTopTeam([]);
  }

  public sendPartyToken(token: string): void {
    this.sendString(PARTY_TOKEN_OPCODE, token);
  }

  public sendServerToken(token: string): void {
    this.sendString(SERVER_TOKEN_OPCODE, token);
    this.socket.team.clear();
  }

  public sendServerRegion(): void {
    this.sendString(REGION_OPCODE, Master.regions.getCurrent().split('-')[0]);
  }

  public sendServerGamemode(): void {
    this.sendString(GAMEMODE_OPCODE, Master.gameMode.getOgar());
  }

  public sendCustomColor(): void {
    this.sendString(CUSTOM_COLOR_OPCODE, this.socket.player.color.custom);
  }

  public sendPlayerUpdate(): void {
    const {
      id,
      nick,
      skin,
      color: { cell: colorCell, custom: colorCustom },
    } = this.socket.player;

    const size =
      13 + nick.length * 2 + skin.length * 2 + colorCell.length * 2 + colorCustom.length * 2;

    const buffer = new Writer(size);

    buffer.writeUInt8(PLAYER_UPDATE_OPCODE);

    buffer.writeUInt32(id);
    buffer.writeString16(nick);
    buffer.writeString16(skin);
    buffer.writeString16(colorCustom);
    buffer.writeString16(colorCell);

    this.socket.send(buffer.buffer);
  }

  public sendPlayerPositionUpdate(): void {
    const {
      id,
      mass,
      position: { x: posX, y: posY },
    } = this.socket.player;

    const buffer = new Writer(17);

    buffer.writeUInt8(PLAYER_POSITION_UPDATE_OPCODE);

    buffer.writeUInt32(id);
    buffer.writeInt32(posX);
    buffer.writeInt32(posY);
    buffer.writeUInt32(mass);

    this.socket.send(buffer.buffer);
  }

  private sendPlayerState(state: number): void {
    const buffer = new Writer(1);
    buffer.writeUInt8(state);
    this.socket.send(buffer.dataView.buffer);
  }

  private sendString(opcode: number, str: string): void {
    const view = new DataView(new ArrayBuffer(1 + 2 * str.length));
    view.setUint8(0, opcode);

    for (let i = 0; i < str.length; i++) {
      view.setUint16(1 + 2 * i, str.charCodeAt(i), true);
    }

    this.socket.send(view.buffer);
  }
}
