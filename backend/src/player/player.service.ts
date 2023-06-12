import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Player } from '../lobby';

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

	removePlayer(player: Player): void {
		const playerFromMap = this.players.get(Number(player.objectId));
		if (!player) {
			return;
		}

		playerFromMap.destroy();
		this.players.delete(Number(player.objectId));
		this.sockets.delete(Number(player.objectId));
	}

	getPlayer(userId: number): Player {
		this.logger.debug(`number of players is ${this.players.size}`);
		this.logger.debug('getPlayer with userId: ' + userId);
		// log each player in players map
		for (const [key, value] of this.players.entries()) {
			if (key == userId) {
				return value;
			}
			this.logger.debug('key: ' + key + ' value: ' + value.name);
		}
		this.logger.debug('userId: ' + userId);
		const player: Player = this.players.get(userId);
		this.logger.debug('player: ' + JSON.stringify(player));
		return player;
	}

	getUserIdFromSocket(socket: Socket): number {
		// find id in sockets map
		for (const [key, value] of this.sockets.entries()) {
			if (value.id == socket.id) {
				return key;
			}
		}
		return null;
	}

	getPlayerCount(): number {
		return this.players.size;
	}

	getPlayers(): Map<number, Player> {
		return this.players;
	}

	addPlayer(player: Player): void {
		this.players.set(player.objectId, player);
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
