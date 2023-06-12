import {
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket,
	MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from '../lobby.service';
import { Logger, UnauthorizedException } from '@nestjs/common';

@WebSocketGateway(3001, { namespace: 'lobby', cors: { origin: '*' } })
export class LobbyGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new Logger(LobbyGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(private lobbyService: LobbyService) {}

	afterInit(server: Server) {
		this.logger.log('LobbyGateway initialized');
		server.use((socket: Socket, next) => {
			const token = socket.handshake.query.token;
			// TODO: check if token is valid
			if (true) {
				return next();
			}

			return next(new UnauthorizedException('Authentication error'));
		});
	}

	isValidConnection(token: string): boolean {
		// TODO: check if token is valid
		return true;
	}

	async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		this.logger.debug(`Client connected: ${client.id} to lobby namespace`);
		client.once('connection_lobby', payload => {
			//	this.logger.log(`Client ${client.id} connected to lobby`);
			this.lobbyService.connection(client, payload);
			client.join('lobby');
			client.to('lobby').emit('lobby_add_user', client.id);
		});
	}

	@SubscribeMessage('join_map')
	async joinMap(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: any,
	) {
		this.lobbyService.joinMap(client, payload);
	}

	handleDisconnect(client: Socket) {
		this.logger.debug(
			`Client disconnected: ${client.id} from lobby namespace`,
		);
	}
}
