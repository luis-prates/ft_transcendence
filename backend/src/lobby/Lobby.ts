import { Server, Socket } from 'socket.io';
import { Player } from './Player';
import { GameMap } from './GameMap';
import * as fs from 'fs';
import * as path from 'path';
import { Games } from 'src/ping_pong/Games';
import { ChatController } from 'src/chat/ChatController';

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
	public chatController: ChatController = new ChatController();

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
		console.log("ada", this.gameMaps);
	}

	public connection(socket: Socket): void {
		socket.once('connection_lobby', (data) => {
			let player = Lobby.players.find((e) => e.objectId == data.objectId);

			if (player) player.setSocket(socket);
			else player = new Player(socket, data.objectId);
			this.game.connection(player);
			this.chatController.connection(player);
			console.log('new connection: ', player.objectId);
		});
		socket.on(
			'join_map',
			function (data: any) {
				const player = Lobby.players.find((e) => e.objectId == data.objectId);
				if (!player) return;
				this.gameMaps.get(data.map.name)?.join(player, data.map?.position);
			}.bind(this),
		);
	}
}
