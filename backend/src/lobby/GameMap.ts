import * as fs from 'fs';
import * as path from 'path';
import { Player } from '../player/Player';
import { Logger } from '@nestjs/common';
import { PlayerService } from '../player/player.service';

export class GameMap {
	public players: Player[] = [];
	public gameObjets: any[] = [];
	private map: any;
	private readonly logger = new Logger(GameMap.name);

	constructor(mapFile = 'map_1.json', private playerService: PlayerService) {
		const jsonPath = path.join(__dirname, '..', 'public/maps', mapFile);
		const jsonData = fs.readFileSync(jsonPath, 'utf-8');
		const jsonObject = JSON.parse(jsonData);
		this.map = jsonObject;
	}

	public join(player: Player, position?: { x: number; y: number }): void {
		GameMap.offAll(player);
		this.logger.debug(`player ${player.objectId} joined map: ${this.map.objectId}`);
		//TODO: player.map.map.objectId needs to be cleaned up
		if (player.map && player.map.map.objectId != this.map.objectId) {
			player.map.removePlayer(player);
		}
		player.map = this;
		const clientSocket = this.players.find(clientSocket => clientSocket.objectId == player.objectId);
		const data: any[] = this.players.filter(e => e.objectId != player.objectId).map(e => e.data);
		data.push(...this.gameObjets);
		player.data.x = position?.x || this.map.start_position.x;
		player.data.y = position?.y || this.map.start_position.y;
		this.logger.debug('Emitting load_map event');
		console.log(data)
		player.emitToLobby('load_map', {
			map: this.map,
			player: clientSocket ? clientSocket.data : player.data,
			data: data,
		});
		//! why? is it needed?
		if (clientSocket) {
			clientSocket.setSocket(player.getSocket());
			// console.log('re-connected socket: ', player.objectId);
		} else {
			this.players.push(player);
			this.playerService.addPlayer(player);
			this.emitAll('new_gameobject', player.data, player, true);
		}
		//! this emits the new player to existing players
		//TODO: check alternatives
		player.onLobby(
			'new_gameobject',
			function (data: any) {
				this.gameObjets.push(data);
				this.emitAll('new_gameobject', data, player, false);
			}.bind(this),
		);
		player.onLobby(
			'update_gameobject',
			function (data: any) {
				player.data = data;
				console.log(data == player.data);
				this.logger.debug('update_gameobject: ' + JSON.stringify(data));
				this.emitAll('update_gameobject', data, player, false);
			}.bind(this),
		);
	}

	public emitAll(event: string, data: any, player: Player, ignorePlayer: boolean): void {
		// this.playerService.getPlayers().forEach(clientSocket => {
		// 	if (
		// 		ignorerPlayer === undefined ||
		// 		clientSocket.objectId !== ignorerPlayer.objectId
		// 	) {
		// 		clientSocket.emitToLobby(event, data);
		// 	}
		// });
		if (ignorePlayer) {
			player.getSocket().to('lobby').emit(event, data);
		} else {
			player.getSocket().to('lobby').emit(event, data);
			player.getSocket().emit(event, data);
		}
	}

	public removePlayer(player: Player): void {
		GameMap.offAll(player);
		// this sets the player.map to undefined
		player.map = undefined;
		//this.playerService.removePlayer(player);
		this.emitAll('remove_gameobject', player.data, player, true);
	}

	public removeGameObject(player: Player, objectId: string): void {
		this.gameObjets = this.gameObjets.filter(e => e.objectId != objectId);
		this.emitAll('remove_gameobject', { objectId: objectId }, player, false);
	}

	public get objectId(): string {
		return this.map.objectId;
	}

	public static offAll(player: Player): void {
		player.offLobby('new_gameobject');
		player.offLobby('update_gameobject');
		player.offLobby('remove_gameobject');
		console.log('off all: ' + player.objectId);
	}
}
