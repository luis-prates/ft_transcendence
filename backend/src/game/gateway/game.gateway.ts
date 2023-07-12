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
import { GameClass } from '../ping_pong/GamePong';
import { UserService } from 'src/user/user.service';
import { UserStatus } from '@prisma/client';

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

	async afterInit(server: any) {
		this.logger.log('Game Gateway initialized');
		this.gameService.setServer(this.server);
	}

	@SubscribeMessage('message')
	async handleMessage(@MessageBody() body: any) {
		this.logger.log(`Message received: ${body}`);
		this.server.emit('message', body);
		// return 'Hello world!';
	}

	async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		const { query } = client.handshake;
		this.logger.log(`Client connected on /game namespace: ${client.id}, userId: ${JSON.stringify(query)}`);
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

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log(client.data);
		//const userId = this.playerService.getUserIdFromGameSocket(client);
		const userId = client.data.userId;
		this.logger.log(`Client disconnected on /game namespace: ${userId}`);
		const player = this.playerService.getPlayer(userId);
		//! needs to be changed to check if player is in game
		//! perhaps add game id to player object?
		if (client.data.gameId) {
			const gameId = client.data.gameId;

			const isPlayer =
				this.socketService.gameIdToPlayerId.get(gameId) &&
				this.socketService.gameIdToPlayerId.get(gameId).includes(Number(userId));
			const isWatcher = this.socketService.gameIdToWatcherId.get(gameId)
				? this.socketService.gameIdToWatcherId.get(gameId).includes(Number(userId))
				: false;
			console.log(isPlayer, isWatcher);
			const game = await this.gameService.games.find(g => g.data.objectId == gameId);
			if (isPlayer) {
				if (game) {
					console.log('IS IN OTHER GAME!');
					game.disconnect(game.player1.userId == userId ? 1 : 2);
				}

				this.socketService.gameIdToPlayerId.set(
					gameId,
					this.socketService.gameIdToPlayerId.get(gameId).filter(playerId => playerId !== Number(userId)),
				);
				this.logger.log(`Removed player ${userId} from game ${gameId}`);
				this.logger.log(
					`Current players in game ${gameId}: ${this.socketService.gameIdToPlayerId.get(gameId)}`,
				);
				// Leave the room for the game
				client.leave(`game-${gameId}-player`);
				this.userService.status(userId, UserStatus.ONLINE);
			} else if (isWatcher) {
				this.socketService.gameIdToWatcherId.set(
					gameId,
					this.socketService.gameIdToWatcherId.get(gameId).filter(watcherId => watcherId !== userId),
				);
				this.logger.log(`Removed watcher ${userId} from game ${gameId}`);
				client.leave(`game-${gameId}-watcher`);
				game.emitAll('game_view', game.watchers.length);
			}
		}
		/*
		const userId = client.data.userId;
		const player = this.playerService.getPlayer(userId);
		this.logger.debug(`Removing Player ${userId} from playerService`);
		this.playerService.removePlayer(player);
		*/
		//console.log("PLAYERS:", this.playerService.getPlayers());
	}

	@SubscribeMessage('entry_game')
	async handleEnterGame(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Enter game received: ${JSON.stringify(body)}`);
		const gameId = body.objectId;
		const userId = client.data.userId;
		client.data.gameId = gameId;
		this.userService.status(userId, UserStatus.IN_GAME);

		const isInTheGamePlayer = this.socketService.gameIdToPlayerId.get(gameId)
			? this.socketService.gameIdToPlayerId.get(gameId).includes(userId)
			: false;
		const isInTheGameWatcher = this.socketService.gameIdToWatcherId.get(gameId)
			? this.socketService.gameIdToWatcherId.get(gameId).includes(userId)
			: false;
		if (isInTheGamePlayer || isInTheGameWatcher) {
			console.log(`The Client is connected AGAIN!: ${client.id}`);
			return ;
		}
		const player = this.playerService.getPlayer(userId);
		// Add userId to gameIdToUserId map
		// if gameId not in map, create new entry
		// if gameId in map, append userId to array
		// const isInGame = this.socketService.playerIdToGameId.get(userId);
		// if (isInGame)
		// {

		// }
		const isPlayer = await this.gameService.enterGame(player, body);

		//TODO Associar o player a um jogo
		//this.socketService.playerIdToGameId.set(userId, gameId);

		if (isPlayer) {
			this.socketService.gameIdToPlayerId.set(gameId, [
				...(this.socketService.gameIdToPlayerId.get(gameId) || []),
				userId,
			]);
			// Join the room for the game
			client.join(`game-${gameId}-player`);
			this.logger.debug(`Client ${client.id} Joining game-${gameId}-player`);
		}
		// else, add userId to gameIdToWatcherId map
		else {
			this.socketService.gameIdToWatcherId.set(gameId, [
				...(this.socketService.gameIdToWatcherId.get(gameId) || []),
				userId,
			]);
			this.logger.log(`Added watcher ${userId} to game ${gameId}`);
			client.join(`game-${gameId}-watcher`);
		}
	}

	@SubscribeMessage('match_making_game')
	async handleMatchMakingGame(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Match Making game received: ${JSON.stringify(body)}`);

		const userId = client.data.userId;
		const player = this.playerService.getPlayer(userId);

		const game = await this.gameService.matchMakingGame(player, body);
		if (game) {
			this.server.emit('match_making_game', game);
		}
	}

	// @SubscribeMessage('new_game')
	// handleNewGame(player: Player, ) {
	// 	this.logger.log(`New game received: ${body}`);
	// 	this.server.emit('new_game', body);
	// }
}
