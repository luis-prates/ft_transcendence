import { Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import { Player } from './Player';
import { off } from 'process';

export class GameMap {
	public players: Player[] = [];
	public gameObjets: any[] = [];
	private map: any;

	constructor(mapFile: string = 'map_1.json') {
		const jsonPath = path.join(__dirname, '..', 'public/maps', mapFile);
		const jsonData = fs.readFileSync(jsonPath, 'utf-8');
		const jsonObject = JSON.parse(jsonData);
		this.map = jsonObject;
	}

	public join(player: Player, position?: { x: number; y: number }): void {
		GameMap.offAll(player);
		console.log('join_map: ', player.objectId, this.map.name);
		if (player.map) player.map.removePlayer(player);
		player.map = this;
		const clientSocket = this.players.find((clientSocket) => clientSocket.objectId === player.objectId);
		const data: any[] = this.players.filter((e) => e.objectId != player.objectId).map((e) => e.data);
		data.push(...this.gameObjets);
		player.data.x = position?.x || this.map.start_position.x;
		player.data.y = position?.y || this.map.start_position.y;
		player.emit('load_map', {
			map: this.map,
			player: clientSocket ? clientSocket.data : player.data,
			data: data,
		});
		if (clientSocket) {
			clientSocket.setSocket(player.getSocket());
			// console.log('re-connected socket: ', player.objectId);
		} else {
			this.players.push(player);
			this.emitAll('new_gameobject', player.data, player);
			console.log('_new player: ', player.objectId);
		}
		player.on(
			'new_gameobject',
			function (data: any) {
				this.gameObjets.push(data);
				this.emitAll('new_gameobject', data);
			}.bind(this),
		);
		player.on(
			'update_gameobject',
			function (data) {
				player.data = data;
				this.emitAll('update_gameobject', data);
			}.bind(this),
		);
	}

	public emitAll(event: string, data: any, ignorerPlayer?: Player): void {
		this.players.forEach((clientSocket) => {
			if (ignorerPlayer === undefined || clientSocket.objectId !== ignorerPlayer.objectId) clientSocket.emit(event, data);
		});
	}

	public removePlayer(player: Player): void {
		GameMap.offAll(player);
		this.players = this.players.filter((clientSocket) => {
			return clientSocket.objectId !== player.objectId;
		});
		this.emitAll('remove_gameobject', player.data, player);
	}

	public removeGameObject(objectId: string): void {
		this.gameObjets = this.gameObjets.filter((e) => e.objectId != objectId);
		this.emitAll('remove_gameobject', { objectId: objectId });
	}

	public get objectId(): string {
		return this.map.objectId;
	}

	public static offAll(player: Player): void {
		player.off('new_gameobject');
		player.off('update_gameobject');
		player.off('remove_gameobject');
		console.log('off all: ' + player.objectId);
	}
}
