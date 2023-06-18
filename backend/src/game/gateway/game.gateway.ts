import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { SocketService } from '../../socket/socket.service';
import { GameService } from '../game.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PlayerService } from '../../player/player.service';

@WebSocketGateway(3001, { namespace: 'game', cors: { origin: '*' } })
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new Logger(GameGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(
		private gameService: GameService,
		private socketService: SocketService,
		private playerService: PlayerService,
	) {}

	afterInit(server: any) {
		this.logger.log('Game Gateway initialized');
		this.gameService.setServer(this.server);
		//console.log(this.server.maxConnections);
	}

	@SubscribeMessage('message')
	handleMessage(@MessageBody() body: any) {
		this.logger.log(`Message received: ${body}`);
		this.server.emit('message', body);
		// return 'Hello world!';
	}

	handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		console.log('On Connect');
		const { query } = client.handshake;
		this.logger.log(
			`Client connected on /game namespace: ${
				client.id
			}, userId: ${JSON.stringify(query)}`,
		);
		const userId = Number(query.userId);
		// set the current socket to the player game socket
		this.logger.debug(`UserId is ${userId}`);
		const player = this.playerService.getPlayer(userId);
		if (!player) {
			this.logger.error(`Player ${userId} not found`);
			return;
		} else {
			this.logger.debug(`Player ${userId} found`);
		}
		player.gameSocket = client;
		client.data.userId = userId;
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		const userId = this.playerService.getUserIdFromGameSocket(client);
		this.logger.log(`Client disconnected on /game namespace: ${userId}`);
		const player = this.playerService.getPlayer(userId);
		this.logger.debug(`Removing Player ${userId} from playerService`);
		this.playerService.removePlayer(player);
		//! needs to be changed to check if player is in game
		//! perhaps add game id to player object?
		if (client.data.gameId) {
			const gameId = client.data.gameId;
			// Remove the player from the game
			const isPlayer = this.socketService.gameIdToPlayerId
				.get(gameId)
				.includes(Number(userId));
			if (isPlayer) {
				this.socketService.gameIdToPlayerId.set(
					gameId,
					this.socketService.gameIdToPlayerId
						.get(gameId)
						.filter(playerId => playerId !== userId),
				);
				this.logger.log(`Removed player ${userId} from game ${gameId}`);
				this.logger.log(
					`Current players in game ${gameId}: ${this.socketService.gameIdToPlayerId.get(
						gameId,
					)}`,
				);
				// Leave the room for the game
				client.leave(`game-${gameId}-player`);
			} else {
				this.socketService.gameIdToWatcherId.set(
					gameId,
					this.socketService.gameIdToWatcherId
						.get(gameId)
						.filter(watcherId => watcherId !== userId),
				);
				this.logger.log(
					`Removed watcher ${userId} from game ${gameId}`,
				);
				client.leave(`game-${gameId}-watcher`);
			}
		}
	}

	@SubscribeMessage('entry_game')
	handleEnterGame(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: any,
	) {
		this.logger.debug(`Enter game received: ${JSON.stringify(body)}`);
		const isPlayer = body.isPlayer;
		const gameId = body.objectId;
		client.data.gameId = gameId;
		const userId = client.data.userId;
		const player = this.playerService.getPlayer(userId);
		// Add userId to gameIdToUserId map
		// if gameId not in map, create new entry
		// if gameId in map, append userId to array
		if (isPlayer) {
			this.socketService.gameIdToPlayerId.set(gameId, [
				...(this.socketService.gameIdToPlayerId.get(gameId) || []),
				userId,
			]);
			this.logger.log(`Added player ${userId} to game ${gameId}`);
			this.logger.log(
				`Current players in game ${gameId}: ${this.socketService.gameIdToPlayerId.get(
					gameId,
				)}`,
			);
			// Join the room for the game
			client.join(`game-${gameId}-player`);
			this.logger.debug(
				`Client ${client.id} Joining game-${gameId}-player`,
			);
			this.gameService.enterGame(player, isPlayer, body);
		}
		// else, add userId to gameIdToWatcherId map
		else {
			this.socketService.gameIdToWatcherId.set(gameId, [
				...(this.socketService.gameIdToWatcherId.get(gameId) || []),
				userId,
			]);
			this.logger.log(`Added watcher ${userId} to game ${gameId}`);
			client.join(`game-${gameId}-watcher`);
			this.gameService.enterGame(player, isPlayer, body.playerInfo);
		}
	}

	// @SubscribeMessage('new_game')
	// handleNewGame(player: Player, ) {
	// 	this.logger.log(`New game received: ${body}`);
	// 	this.server.emit('new_game', body);
	// }
}
