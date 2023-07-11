import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Player } from './Player';
import { PrismaService } from '../prisma/prisma.service';
import { validateHeaderValue } from 'http';

@Injectable()
export class PlayerService {
	private players: Map<number, Player> = new Map<number, Player>();
	//! lobby only socket map
	private sockets: Map<number, Socket> = new Map<number, Socket>();
	private readonly logger = new Logger(Player.name);

	constructor(private prismaService: PrismaService) {
		this.logger.log('PlayerService initialized');
		//TODO: Improve this, use Marvin/bot identifier instead of 6969
		this.prismaService.user
			.findUnique({
				where: {
					id: 6969,
				},
			})
			.then(user => {
				if (!user) {
					this.prismaService.user
						.create({
							data: {
								id: 6969,
								name: 'Marvin',
								nickname: 'Marvin',
								email: 'marvin@marvin.com',
								image: '@/frontend/src/assets/images/pingpong/marvin.jpg',
								hash: 'asdgasdgasdg',
							},
						})
						.then(user => {
							this.logger.log(`created bot user: ${user.id}`);
						});
				}
			});

		//! feed from database maybe?
	}

	//TODO: add namespace to keys maybe?
	createPlayer(socket: Socket, payload: any): Player {
		const player = new Player(socket, payload, this);
		this.logger.debug(`created player: ${player.objectId}`);
		this.players.set(player.objectId, player);
		this.sockets.set(player.objectId, socket);
		return player;
	}

	removePlayer(player: Player): void {
		//! is it needed?
		//verificar se existe no gateaway do game
		this.logger.log(`Remove Player: ${player}`);
		if (!player) {
			return;
		}
		const playerFromMap = this.getPlayer(player.objectId);

		playerFromMap.destroy();
		this.players.delete(player.objectId);
		this.sockets.delete(player.objectId);
		this.logger.log(`Removed`);
	}

	getPlayer(userId: number): Player {
		this.logger.debug(`number of players is ${this.players.size}`);
		this.logger.debug(`getPlayer with userId: ${userId}`);
		// log each player in players map
		for (const [key, value] of this.players.entries()) {
			if (key == userId) {
				return value;
			}
		}
		this.logger.debug(`userId: ${userId}`);
		const player: Player = this.players.get(userId);
		this.logger.debug(`player: ${JSON.stringify(player)}`);
		return player;
	}

	getUserIdFromGameSocket(socket: Socket): number {
		// find id in sockets map
		for (const [key, value] of this.players.entries()) {
			if (value.getGameSocket() && value.getGameSocket().id == socket.id) {
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

	getUserIdBySocket(socket: Socket): number | undefined {
		for (const [number, value] of this.sockets.entries()) {
			if (value === socket) {
				return number;
			}
		}
		return undefined;
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
		if (this.players.has(payload.userId)) {
			this.players.delete(payload.userId);
		}

		// If this socket was already in the map, remove the old socket data
		if (this.sockets.has(payload.userId)) {
			this.sockets.delete(payload.userId);
		}

		console.log('count', this.getPlayerCount());
		// Then you can add the new player data associated with the new socket
		const player = this.createPlayer(socket, payload);
		// this.logger.debug('onSocketConnected');
		// this.logger.debug('player: ' + JSON.stringify(player));
		// this.logger.debug('socket: ' + JSON.stringify(socket));
		console.log('count', this.getPlayerCount());
		return player;
	}

	onSocketDisconnect(socket: Socket, payload: any): Player {
		// If this socket was already associated with a player, remove the old player data
		if (this.players.has(payload.userId)) {
			this.players.delete(payload.userId);
		}

		// If this socket was already in the map, remove the old socket data
		if (this.sockets.has(payload.userId)) {
			console.log('SOCKETTT REMOVED!');
			this.sockets.delete(payload.userId);
		}

		// Then you can add the new player data associated with the new socket
		const player = this.createPlayer(socket, payload);
		// this.logger.debug('onSocketConnected');
		// this.logger.debug('player: ' + JSON.stringify(player));
		// this.logger.debug('socket: ' + JSON.stringify(socket));
		return player;
	}
}
