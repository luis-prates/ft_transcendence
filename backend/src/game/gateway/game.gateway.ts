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
import { UserService } from '../../user/user.service';
import { UserStatus } from '@prisma/client';
import { playerInfo } from '../../socket/SocketInterface';

@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(GameGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(
		private gameService: GameService,
		private socketService: SocketService,
		private playerService: PlayerService,
		private userService: UserService,
	) {}

	async afterInit() {
		this.logger.log('Game Gateway initialized');
		this.gameService.setServer(this.server);
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		const { query } = client.handshake;
		const userId = Number(query.userId);
		// set the current socket to the player game socket
		const player = this.playerService.getPlayer(userId);

		this.logger.log(`Client connected on /game namespace: ${client.id}, userId: ${JSON.stringify(query)}`);
		if (!player) {
			this.logger.error(`Player ${userId} not found`);
			return;
		}
		this.logger.debug(`Player ${userId} found`);
		player.gameSocket = client;
		client.data.userId = userId;
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		const userId = client.data.userId;

		this.logger.log(`Client disconnected on /game namespace: ${userId}`);
		//! needs to be changed to check if player is in game
		//! perhaps add game id to player object?
		if (client.data.gameId) {
			const gameId = client.data.gameId;
			const convertedUserId = Number(userId);
			const isPlayer =
				this.socketService.gameIdToPlayerId.get(gameId) &&
				this.socketService.gameIdToPlayerId.get(gameId).includes(convertedUserId);
			const isWatcher = this.socketService.gameIdToWatcherId.get(gameId)
				? this.socketService.gameIdToWatcherId.get(gameId).includes(convertedUserId)
				: false;
			const game = this.gameService.games.find(g => g.data.objectId == gameId);

			if (isPlayer) {
				game?.disconnect(game.player1.userId == userId ? 1 : 2);

				this.socketService.gameIdToPlayerId.set(
					gameId,
					this.socketService.gameIdToPlayerId.get(gameId).filter(playerId => playerId !== convertedUserId),
				);
				this.logger.log(`Removed player ${userId} from game ${gameId}`);
				this.logger.log(
					`Current players in game ${gameId}: ${this.socketService.gameIdToPlayerId.get(gameId)}`,
				);
				// Leave the room for the game
				client?.leave(`game-${gameId}-player`);
				await this.userService.status(userId, UserStatus.ONLINE);
			} else if (isWatcher) {
				this.socketService.gameIdToWatcherId.set(
					gameId,
					this.socketService.gameIdToWatcherId.get(gameId).filter(watcherId => watcherId !== userId),
				);
				this.logger.log(`Removed watcher ${userId} from game ${gameId}`);
				client?.leave(`game-${gameId}-watcher`);
				game?.emitAll('game_view', game.watchers.length);
			}
		}
	}

	@SubscribeMessage('entry_game')
	async handleEnterGame(@ConnectedSocket() client: Socket, @MessageBody() body: playerInfo) {
		const gameId = body.objectId;
		const userId = client.data.userId;

		client.data.gameId = gameId;
		await this.userService.status(userId, UserStatus.IN_GAME);

		const isInTheGamePlayer = this.socketService.gameIdToPlayerId.get(gameId)
			? this.socketService.gameIdToPlayerId.get(gameId).includes(userId)
			: false;
		const isInTheGameWatcher = this.socketService.gameIdToWatcherId.get(gameId)
			? this.socketService.gameIdToWatcherId.get(gameId).includes(userId)
			: false;
		if (isInTheGamePlayer || isInTheGameWatcher) {
			console.log(`The Client is connected AGAIN!: ${client.id}`);
			return;
		}
		const player = this.playerService.getPlayer(userId);
		let isPlayer;
		try {
			isPlayer = await this.gameService.enterGame(player, body);
		} catch (error) {
			if (error.message == 'Game does not exist') {
				this.logger.warn(`Game ${gameId} not found`);
				await this.userService.status(userId, UserStatus.ONLINE);
			}
			client?.emit('error', error.message);
		}

		//TODO Associar o player a um jogo
		//this.socketService.playerIdToGameId.set(userId, gameId);

		if (isPlayer) {
			this.socketService.gameIdToPlayerId.set(gameId, [
				...(this.socketService.gameIdToPlayerId.get(gameId) || []),
				userId,
			]);
			// Join the room for the game
			client?.join(`game-${gameId}-player`);
			this.logger.debug(`Client ${client.id} Joining game-${gameId}-player`);
		}
		// else, add userId to gameIdToWatcherId map
		else {
			this.socketService.gameIdToWatcherId.set(gameId, [
				...(this.socketService.gameIdToWatcherId.get(gameId) || []),
				userId,
			]);
			this.logger.log(`Added watcher ${userId} to game ${gameId}`);
			client?.join(`game-${gameId}-watcher`);
		}
	}

	@SubscribeMessage('match_making_game')
	async handleMatchMakingGame(@ConnectedSocket() client: Socket, @MessageBody() body: playerInfo) {
		const userId = client.data.userId;
		const player = this.playerService.getPlayer(userId);
		const game = await this.gameService.matchMakingGame(player, body);

		this.logger.debug(`Match Making game received`);
		if (game) {
			this.server?.emit('match_making_game', game);
		}
	}
}
