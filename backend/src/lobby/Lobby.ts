import { Server, Socket } from 'socket.io';
import { Player } from './Player';
import { GameMap } from './Map';
import * as fs from 'fs';
import * as path from 'path';

export interface TableData {
	className: string;
	x: number;
	y: number;
	objectId: string;
	pontoEvento: { x: number; y: number; isFree: boolean }[];
}

export default class Lobby {
	private gameMaps: Map<string, GameMap> = new Map<string, GameMap>();
	// public static players: Map<string, Player> = new Map<string, Player>();

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
			const player = new Player(socket, data.objectId);
			this.gameMaps.get(data.mapName)?.join(player);
			console.log('join_map', data.objectId, 'mapName: ', data.mapName, ' isInclude: ', this.gameMaps.has(data.mapName));
			this.gameMaps.forEach((map) => {
				console.log('test: ', map.objectId);
			});
		});
	}
}
