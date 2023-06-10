import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameMap, Player, Lobby } from '../lobby';
import { PlayerData } from '../lobby/Player';
import { LobbyService } from '../lobby/lobby.service';

@Injectable()
export class PlayerService {
	private players: Map<number, Player> = new Map<number, Player>();
	//! lobby only socket map
	private sockets: Map<number, Socket> = new Map<number, Socket>();
	private readonly logger = new Logger(Player.name);

	//TODO: add namespace to keys maybe?
	createPlayer(socket: Socket, payload: any): Player {
		const player = new Player(socket, payload.objectId);
		this.logger.debug('created player: ' + player.objectId);
		this.players.set(player.objectId, player);
		this.sockets.set(player.objectId, socket);
		return player;
	}

	removePlayer(socket: Socket, payload: any): void {
		const player = this.players.get(Number(payload.userId));
		if (!player) {
			return;
		}

		player.destroy();
		this.players.delete(Number(payload.userId));
		this.sockets.delete(Number(payload.userId));
	}

	getPlayer(payload: any): Player {
		this.logger.debug(`number of players is ${this.players.size}`);
		this.logger.debug('getPlayer with userId: ' + payload.userId);
		// log each player in players map
		const userId = Number(payload.userId);
		for (const [key, value] of this.players.entries()) {
			if (key == userId)
				return value;
			this.logger.debug('key: ' + key + ' value: ' + value.name);
		}
		this.logger.debug('userId: ' + userId);
		const player: Player = this.players.get(userId);
		this.logger.debug('player: ' + JSON.stringify(player));
		return player;
	}

	getPlayerCount(): number {
		return this.players.size;
	}

	hasPlayerFromObjectId(objectId: number): boolean {
		// find objectId in sockets map
		for (const [key, value] of this.sockets.entries()) {
			if (value.data.objectId == objectId) {
				return true;
			}
		}
		return false;
	}

	getPlayerFromObjectId(objectId: number): Player {
		// find objectId in sockets map
		for (const [key, value] of this.sockets.entries()) {
			if (value.data.objectId == objectId) {
				return this.players.get(key);
			}
		}
		return null;
	}

	updatePlayerSocket(socket: Socket): void {
		this.logger.debug('updatePlayerSocket');
		const playerSocket = this.sockets.get(Number(socket.id));
		if (!playerSocket) {
			return;
		}
	}

	onSocketConnected(socket: Socket, payload: any): Player {
		// If this socket was already associated with a player, remove the old player data
		if (this.players.has(Number(payload.userId))) {
			this.players.delete(Number(payload.userId));
		}

		// If this socket was already in the map, remove the old socket data
		if (this.sockets.has(Number(payload.userId))) {
			this.sockets.delete(Number(payload.userId));
		}

		// Then you can add the new player data associated with the new socket
		const player = this.createPlayer(socket, payload);
		// this.logger.debug('onSocketConnected');
		// this.logger.debug('player: ' + JSON.stringify(player));
		// this.logger.debug('socket: ' + JSON.stringify(socket));
		return player;
	}
}
