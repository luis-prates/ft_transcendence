import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameMap, Player, Lobby } from '../lobby';
import { PlayerData } from '../lobby/Player';
import { LobbyService } from '../lobby/lobby.service';

@Injectable()
export class PlayerService {
	private players: Map<string, Player> = new Map<string, Player>();
	private sockets: Map<string, Socket> = new Map<string, Socket>();
	private readonly logger = new Logger(Player.name);

	createPlayer(socket: Socket, objectId: number): Player {
		const player = new Player(socket, objectId);
		this.players.set(socket.id, player);
		this.sockets.set(socket.id, socket);
		return player;
	}

	removePlayer(socket: Socket): void {
		const player = this.players.get(socket.id);
        if (!player) {
            return;
        }
        player.destroy();
        this.players.delete(socket.id);
		this.sockets.delete(socket.id);
	}

	getPlayer(socket: Socket): Player {
		return this.players.get(socket.id);
	}

	getPlayerCount(): number {
		return this.players.size;
	}

	getPlayerFromObjectId(objectId: number): boolean {
		// find objectId in sockets map
		for (const [key, value] of this.sockets.entries()) {
			if (value.data.objectId == objectId) {
				return true;
			}
		}
		return false;
	}

	updatePlayerSocket(socket: Socket): void {
		this.logger.debug('updatePlayerSocket');
		const playerSocket = this.sockets.get(socket.id);
		if (!playerSocket) {
			return;
		}
		
	}

	onSocketConnected(socket: Socket, objectId: number): Player {
		// If this socket was already associated with a player, remove the old player data
		if (this.players.has(socket.id)) {
			this.players.delete(socket.id);
		}
		
		  // If this socket was already in the map, remove the old socket data
		if (this.sockets.has(socket.id)) {
			this.sockets.delete(socket.id);
		}
		
		  // Then you can add the new player data associated with the new socket
		const player = this.createPlayer(socket, objectId);
		// this.logger.debug('onSocketConnected');
		// this.logger.debug('player: ' + JSON.stringify(player));
		// this.logger.debug('socket: ' + JSON.stringify(socket));
		return (player);
	}

}
