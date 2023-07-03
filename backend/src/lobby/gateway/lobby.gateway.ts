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
import { PlayerService } from '../../player/player.service';
import { GameService } from '../../game/game.service';

@WebSocketGateway({ namespace: 'lobby', cors: { origin: '*' } })
export class LobbyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(LobbyGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(private lobbyService: LobbyService, private playerService: PlayerService, private gameService: GameService) {}

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
		//TODO: do the chat setup here?
		//TODO: add to global chat room, etc.
		client.once('connection_lobby', payload => {
			//	this.logger.log(`Client ${client.id} connected to lobby`);
			this.lobbyService.connection(client, payload);
			client.join('lobby');
			client.to('lobby').emit('lobby_add_user', client.id);
		});
	}

	@SubscribeMessage('join_map')
	async joinMap(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
		this.lobbyService.joinMap(client, payload);
	}

	handleDisconnect(client: Socket) {
		this.logger.debug(`Client disconnected: ${client.id} from lobby namespace`);
	}

	
	@SubscribeMessage('invite_game')
	async handleInviteGame(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Invite game received: ${JSON.stringify(body)}`);

		//Desafiador
		const challengerId = body.challengerId;
		const challengerNickname = body.challengerNickname;
		//Desafiado
		const challengedId = body.challengedId;
		const challengedNickname = body.challengedNickname;

		console.log("id:" , challengedId, " id:", challengerId);
		//Verificar
		const player1 = this.playerService.getPlayer(challengerId);
		const player2 = this.playerService.getPlayer(challengedId);

		if (!player1 || !player2)
			return ;
		console.log("EMITIR PARA TODOS");
		this.server.to(player2.getSocket().id).emit('invite_request_game', {
			playerId: challengerId,
			playerName: challengerNickname
		 });

		this.server.to(player1.getSocket().id).emit('invite_confirm_game', {
			playerId: challengedId,
			playerName: challengedNickname,
		});
	}
	
	@SubscribeMessage('challenge_game')
	async handleChallengeGame(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`challenge game received: ${JSON.stringify(body)}`);

		const challenged = client.data.challenged;
		const challenger = client.data.challenger;
		const player1 = this.playerService.getPlayer(challenged);
		const player2 = this.playerService.getPlayer(challenger);

		if (!player1 || !player2)
			return ;
	
		const userId = client.data.userId;
		const player = this.playerService.getPlayer(userId);	
		const game = await this.gameService.challengeGame(player1, player2);

		this.server.to(player1.getSocket().id).emit('challenge_game', game);
		this.server.to(player2.getSocket().id).emit('challenge_game', game);
	}

}
