import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse,
} from '@nestjs/websockets';
import { SocketService } from '../../socket/socket.service';
import { Server } from 'http';
import { GameService } from '../game.service';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway(3000, {namespace: 'game', cors: {origin: '*'}})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(GameGateway.name);

	constructor(
		private gameService: GameService,
		private socketService: SocketService
	) {}

	@WebSocketServer()
	server: Server;

	afterInit(server: any) {
		
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log('On Connect')
		const { query } = client.handshake;
		this.logger.log(`Client connected on /game namespace: ${client.id}, userId: ${query.userId}`);
		this.socketService.gameSocketMap.set(client.id, client);
		const userId = Number(query.userId);
		client.data.userId = userId;
		this.socketService.userIdToGameSocketId.set(userId, client.id);

		//client.join(`user-${userId}`);

	}

	handleDisconnect() {
		console.log('On Disconnect')
	}
}
