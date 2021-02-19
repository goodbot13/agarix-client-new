import Reader from '../utils/Reader';
import Emitter from './Emitter';
import Player from './Player';
import Receiver from './Receiver';
import Opcodes from '../tabs/Socket/Opcodes';
import OgarSkinsLoader from '../utils/SkinsLoader';
import UICommunicationService from '../communication/FrontAPI';
import { extend } from './DeltaSocketExtender';

export default class Socket {
	private readonly ip: string = 'wss://wss.ogario.eu:3443';
	public readonly handshakeKey: number;

	private receiver: Receiver;
	private ws: WebSocket;
	private interval: NodeJS.Timer;
	private connected: boolean;

	public emitter: Emitter;
	public player: Player;
	public team: Map<number, Player>;
	public second: boolean;

  constructor(public skinsLoader: OgarSkinsLoader, second = false) {
		this.handshakeKey = 401;
    this.emitter = new Emitter(this);
		this.receiver = new Receiver(this);
    this.player = new Player();
		this.team = new Map();
		this.connected = false;
		this.second = second;
	}
	
	public deltaOverOgar(): void {
		extend();
	}

  public connect(): Promise<boolean> {
    return new Promise((resolve: any) => {
			if (this.connected) {
				resolve(true);
				return;
			}

			this.ws = new WebSocket(this.ip);
			this.ws.binaryType = 'arraybuffer';

			this.ws.onopen = () => {
				this.emitter.sendHandshake();
				resolve(true);
			};
			
			this.ws.onmessage = (msg) => this.handleMessage(msg.data);
			this.ws.onerror = () => UICommunicationService.sendChatMessage('Ogar server connection lost');
			
			this.connected = true;
			this.interval = setInterval(() => this.updateInterval(), 1000);
		});
	}
	
	public disconnect(): void {
		clearInterval(this.interval);

		this.ws.close();
		this.team.clear();
		this.connected = false;

		UICommunicationService.sendChatMessage('Ogar server connection disconnected');
	}

  private handleMessage(arrayBuffer: ArrayBuffer): void {
		const reader = new Reader(arrayBuffer, true);
	
		const opCode = reader.getUint8();

		switch (opCode) {
			case 0:
				this.player.id = reader.getUint32();
        break;
        
			case 1:
				this.emitter.sendPlayerUpdate();
        break;
        
			case 20:
				this.receiver.updateTeamPlayer(reader);
        break;
        
			case 30:
				this.receiver.updateTeamPlayerPosition(reader);
        break;
        
			case 100:
				this.receiver.getChatMessage(reader);
				break;
		}
	}
	
	
	public add(id: number): Player {
		if (!this.team.has(id)) {
			const player = new Player(id);
			this.team.set(id, player);
		}

		return this.team.get(id);
	}

  public send(arrayBuffer: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === Opcodes.SOCKET_OPENED) {
			this.ws.send(arrayBuffer);
		}
  }

  public sendChat(message: string): void {
		const msg = `${this.player.nick}: ${message}`;
		this.emitter.sendChatMessage(msg, 101);
	}

	public sendChatCommander(message: string): void {
		const msg = `${this.player.nick}: ${message}`;
		this.emitter.sendChatMessage(msg, 102);
	}

	private updateInterval(): void {
		this.team.forEach((player) => {
			if (player.mass === 0 || (player.alive && Date.now() - player.updateTime >= 2000)) {
				player.alive = false;
      }
    });
    
    if (this.player.alive) {
      this.emitter.sendPlayerPositionUpdate();
    }
	}

	public spawn(): void {
		if (this.player.color.cell === "#000000") {
			setTimeout(() => this.spawn(), 333);
      return;
    } 
		
		this.emitter.sendPlayerSpawn();
	}

	public death(): void {
		if (this.player.alive) {
			this.player.color.cell = "#000000";
			this.emitter.sendPlayerDeath();
		}
	}

	public updatePosition(x: number, y: number, mass: number): void {
		this.player.position.x = x;
		this.player.position.y = y;
		this.player.mass = mass;
	}

	public join(serverToken: string, partyToken: string): void {
		this.sendPartyData(serverToken, partyToken);
		this.emitter.sendPlayerDeath();
		this.emitter.sendPlayerJoin();
	}

	public sendPartyData(serverToken: string, partyToken: string): void {
		this.emitter.sendPlayerTag();
		this.emitter.sendPartyToken(partyToken);
		this.emitter.sendServerToken(serverToken);
		this.emitter.sendPlayerNick();
	}
}