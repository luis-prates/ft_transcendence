import { Injectable, Logger } from '@nestjs/common';
import { Games } from '../ping_pong/Games';
import { ChatController } from '../chat/ChatController';
import { GameMap } from './GameMap';
import { Player } from './Player';
import * as path from 'path';
import * as fs from 'fs';
import { Socket } from 'socket.io';
import { PlayerService } from '../player/player.service';

@Injectable()
export class LobbyService {
	public game: Games = new Games();
	private gameMaps: Map<string, GameMap> = new Map<string, GameMap>();
	public chatController: ChatController = new ChatController();
	private readonly logger = new Logger(LobbyService.name);

	constructor(private playerService: PlayerService) {
		console.log('lobby from service created');
		const pathMap = path.join(__dirname, '..', 'public', 'maps');
		const files = fs.readdirSync(pathMap);
		files.forEach(file => {
			if (file.includes('.json')) {
				const map = new GameMap(file, this.playerService);
				this.gameMaps.set(map.objectId, map);
			}
		});
	}

	public connection(socket: Socket, payload: any): void {
		const player: Player = this.playerService.onSocketConnected(
			socket,
			payload,
		);
		//! done in game.service.ts
		// this.game.connection(player);
		this.chatController.connection(player);
		this.logger.debug(`new connection: ${player.objectId}`);
	}

	public joinMap(socket: Socket, payload: any): void {
		this.logger.debug('join_map event received');
		//this.logger.debug('data received: ' + JSON.stringify(data));
		this.logger.debug(
			`players count: ${this.playerService.getPlayerCount()}`,
		);
		const player = this.playerService.getPlayer(Number(payload.userId));
		if (!player) {
			this.logger.debug('player not found');
			return;
		}
		this.logger.debug('player found');
		this.gameMaps
			.get(payload.map.name)
			?.join(player, payload.map?.position);
	}
}
