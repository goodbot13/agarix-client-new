import FrontAPI, { ITopTeamPlayer } from "../communication/FrontAPI";
import Reader from "../utils/Reader";
import Socket from "./Socket";

export type MessageType = 'COMMON_MESSAGE' | 'COMMANDER_MESSAGE' | 'SERVER_MESSAGE';

export default class Receiver {
	private socket: Socket;

	constructor(socket: Socket) {
		this.socket = socket;
	}

	public getChatMessage(reader: Reader) {
		if (this.socket.second) {
			return;
		}

		const messageType = reader.getUint8();	
		const playerID = reader.getUint32();

    reader.shiftOffset(4);
    
		const arr = reader.readUTF16string().split(': ');
    let author = arr[0];
		let message = arr[1];

		let _type: MessageType = 'COMMON_MESSAGE';
		
		switch (messageType) {
			case 102:
				_type = 'COMMANDER_MESSAGE';
				break;

			case 101:
				_type = 'COMMON_MESSAGE';
				break;

			default:
				_type = 'SERVER_MESSAGE';
				break;
		}

		(<any>window).addChatMessage && (<any>window).addChatMessage({ 
			nick: author, 
			text: message,
			type: _type
		});
	}

	public updateTeamPlayer(reader: Reader) {
		if (this.socket.second) {
			return;
		}

		const id = reader.getUint32();
		const player = this.socket.add(id);

		player.nick = reader.readUTF16string().trim();
		player.skin = reader.readUTF16string();
		player.color = {
			custom: reader.readUTF16string(),
			cell: reader.readUTF16string(),
		};

		this.socket.skinsLoader.load(player.skin);

		FrontAPI.updateTopTeam([...this.socket.team.values()].map((player) => {
			return {
				nick: player.nick,
				mass: player.mass,
				isAlive: player.alive
			} as ITopTeamPlayer;
		}));
	}

	public updateTeamPlayerPosition(reader: Reader) {
		if (this.socket.second) {
			return;
		}

		const id = reader.getUint32();
    const player = this.socket.add(id);
    
		player.position = {
			x: reader.getInt32(),
			y: reader.getInt32(),
    };
    
    player.mass = reader.getUint32();
		player.alive = true;
		player.updateTime = Date.now();

		FrontAPI.updateTopTeam([...this.socket.team.values()].map((player) => {
			return {
				nick: player.nick,
				mass: player.mass,
				isAlive: player.alive
			} as ITopTeamPlayer;
		}));
	}
}
