import Settings from '../Settings';
import Writer from '../utils/Writer';
import Socket from './Socket';

const JOIN_OPCODE                    = 1;
const SPAWN_OPCODE                   = 2;
const DEATH_OPCODE                   = 3;
const NICK_OPCODE                    = 10;
const TAG_OPCODE                     = 11;
const SKIN_OPCODE                    = 12;
const CUSTOM_COLOR_OPCODE            = 13;
const PLAYER_CELL_COLOR_OPCODE       = 14;
const PARTY_TOKEN_OPCODE             = 15;
const SERVER_TOKEN_OPCODE            = 16;
const REGION_OPCODE                  = 17;
const GAMEMODE_OPCODE                = 18;
const PLAYER_UPDATE_OPCODE           = 20;
const PLAYER_POSITION_UPDATE_OPCODE  = 30;

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

	public sendPlayerTag(): void  {
		this.socket.player.tag = Settings.tag;
		this.sendString(TAG_OPCODE, this.socket.player.tag);
		this.socket.team.clear();
	}

	public sendPartyToken(token: string): void  {
		this.socket.player.partyToken = token;
		this.sendString(PARTY_TOKEN_OPCODE, token);
	}

	public sendServerToken(token: string): void  {
		this.socket.player.serverToken = token;
		this.sendString(SERVER_TOKEN_OPCODE, token);
		this.socket.team.clear();
	}

	public sendServerRegion(region: string): void  {
		this.sendString(REGION_OPCODE, region);
	}

	public sendServerGamemode(gameMode: TOgarGameMode): void  {
		this.sendString(GAMEMODE_OPCODE, gameMode);
	}

	public sendPlayerUpdate(): void  {
		const player = this.socket.player;
		const size = 13 + player.nick.length * 2 + player.skin.length * 2 + player.skin.length * 2 + player.color.cell.length * 2 + player.color.custom.length * 2;

		const buffer = new Writer(size);

		buffer.writeUInt8(PLAYER_UPDATE_OPCODE);

		buffer.writeUInt32(player.id);
		buffer.writeString16(player.nick);
		buffer.writeString16(player.skin);
		buffer.writeString16(player.color.custom);
		buffer.writeString16(player.color.cell);

		this.socket.send(buffer.buffer);
	}

	public sendPlayerPositionUpdate(): void  {
		const player = this.socket.player;
    const buffer = new Writer(17);
    
		buffer.writeUInt8(PLAYER_POSITION_UPDATE_OPCODE);

		buffer.writeUInt32(player.id);
		buffer.writeInt32(player.position.x);
		buffer.writeInt32(player.position.y);
    buffer.writeUInt32(player.mass);
    
		this.socket.send(buffer.buffer);
	}

	public sendPlayerState(state: number): void  {
		const buffer = new Writer(1);
		buffer.writeUInt8(state);
		this.socket.send(buffer.dataView.buffer);
	}

	public sendString(opcode: number, str: string): void {
		const view = new DataView(new ArrayBuffer(1 + 2 * str.length));
    view.setUint8(0, opcode);
    
		for (let i = 0; i < str.length; i++) {
			view.setUint16(1 + 2 * i, str.charCodeAt(i), true);
    }
    
		this.socket.send(view.buffer);
	}
}

export type TOgarGameMode = 'FFA' | 'PTY' | 'EXP';