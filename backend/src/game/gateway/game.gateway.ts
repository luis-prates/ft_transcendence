import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
	MessageBody,
    WsResponse,
} from '@nestjs/websockets';
import { SocketService } from '../../socket/socket.service';
import { Server } from 'http';
import { GameService } from '../game.service';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Player } from '../../lobby';

@WebSocketGateway(3001, {namespace: 'game', cors: {origin: '*'}})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(GameGateway.name);

	constructor(
		private gameService: GameService,
		private socketService: SocketService
	) {}

	@WebSocketServer()
	server: Server;

	afterInit(server: any) {
		this.logger.log('Game Gateway initialized');
		//console.log(this.server.maxConnections);

	}

	@SubscribeMessage('message')
	handleMessage(@MessageBody() body : any) {
		this.logger.log(`Message received: ${body}`);
		this.server.emit('message', body);
		// return 'Hello world!';
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log('On Connect')
		const { query } = client.handshake;
		this.logger.log(`Client connected on /game namespace: ${client.id}, userId: ${query.userId}`);
		this.socketService.gameSocketMap.set(client.id, client);
		const userId = Number(query.userId);
		const gameId = String(query.gameId);
		const isPlayer = Boolean(query.isPlayer);
		client.data.userId = userId;
		client.data.gameId = gameId;
		this.socketService.playerIdToSocketId.set(userId, client.id);
		// Add userId to gameIdToUserId map
		// if gameId not in map, create new entry
		// if gameId in map, append userId to array
		if (isPlayer) {
			this.socketService.gameIdToPlayerId.set(gameId, [...this.socketService.gameIdToPlayerId.get(gameId) || [], userId]);
			this.logger.log(`Added player ${userId} to game ${gameId}`);
			this.logger.log(`Current players in game ${gameId}: ${this.socketService.gameIdToPlayerId.get(gameId)}`);
			// Join the room for the game
			client.join(`game-${gameId}-player`);
		}
		// else, add userId to gameIdToWatcherId map
		else {
			this.socketService.gameIdToWatcherId.set(gameId, [...this.socketService.gameIdToWatcherId.get(gameId) || [], userId]);
			this.logger.log(`Added watcher ${userId} to game ${gameId}`);
			client.join(`game-${gameId}-watcher`);
		}

	}

	handleDisconnect(client: Socket) {
		const userId = client.data.userId;
		this.logger.log(`Client disconnected on /game namespace: ${userId}`);
		this.socketService.playerIdToSocketId.delete(userId);
		const gameId = client.data.gameId;
		const isPlayer = this.socketService.gameIdToPlayerId.get(gameId).includes(userId);
		if (isPlayer) {
			this.socketService.gameIdToPlayerId.set(gameId, this.socketService.gameIdToPlayerId.get(gameId).filter((playerId) => playerId !== userId));
			this.logger.log(`Removed player ${userId} from game ${gameId}`);
			this.logger.log(`Current players in game ${gameId}: ${this.socketService.gameIdToPlayerId.get(gameId)}`);
			// Leave the room for the game
			client.leave(`game-${gameId}-player`);
		}
		else {
			this.socketService.gameIdToWatcherId.set(gameId, this.socketService.gameIdToWatcherId.get(gameId).filter((watcherId) => watcherId !== userId));
			this.logger.log(`Removed watcher ${userId} from game ${gameId}`);
			client.leave(`game-${gameId}-watcher`);
		}
	}

	// @SubscribeMessage('new_game')
	// handleNewGame(player: Player, ) {
	// 	this.logger.log(`New game received: ${body}`);
	// 	this.server.emit('new_game', body);
	// }
}
