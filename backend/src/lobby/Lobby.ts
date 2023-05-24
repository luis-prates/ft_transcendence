import { Server, Socket } from 'socket.io';
import { Player } from './Player';
import { GameMap } from './GameMap';
import * as fs from 'fs';
import * as path from 'path';
import { Games } from 'src/ping_pong/Games';

export interface TableData {
	className: string;
	x: number;
	y: number;
	objectId: string;
	pontoEvento: { x: number; y: number; isFree: boolean }[];
}

export class Lobby {
	public game: Games = new Games();
	private gameMaps: Map<string, GameMap> = new Map<string, GameMap>();
	public static players: Player[] = [];

	constructor(io: Server) {
		console.log('lobby created');
		const pathMap = path.join(__dirname, '..', 'public', 'maps');
		const files = fs.readdirSync(pathMap);
		files.forEach((file) => {
			if (file.includes('.json')) {
				const map = new GameMap(file);
				this.gameMaps.set(map.objectId, map);
			}
		});
	}

	public connection(socket: Socket): void {
		socket.on('join_map', (data) => {
			const player = Lobby.players.find((e) => e.objectId == data.objectId) || new Player(socket, data.objectId);
			this.game.connection(player);
			this.gameMaps.get(data.map.name)?.join(player, data.map?.position);
		});
	}
}

export class SocketSingleton {
	private socket: Socket;
	private events: string[] = [];

	constructor(socket: Socket) {
		this.socket = socket;
	}

	on(event: string, listener: (...args: any[]) => void) {
		if (this.events.includes(event)) return;
		this.socket.on(event, listener);
		this.events.push(event);
	}

	emit(event: string, ...args: any[]) {
		this.socket.emit(event, ...args);
	}
	off(event: string) {
		this.socket.off(event, () => {});
		this.events = this.events.filter((e) => e !== event);
	}

	get id(): string {
		return this.socket.id;
	}
}
