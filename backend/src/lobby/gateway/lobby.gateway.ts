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
import { UserService } from '../../user/user.service';
import { UserStatus } from '@prisma/client';

@WebSocketGateway({ namespace: 'lobby', cors: { origin: '*' } })
export class LobbyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(LobbyGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(
		private lobbyService: LobbyService,
		private playerService: PlayerService,
		private gameService: GameService,
		private userService: UserService,
	) {}

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
		this.userService.setServer(this.server);
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
			this.userService.status(payload.userId, UserStatus.ONLINE);
		});
	}

	@SubscribeMessage('join_map')
	async joinMap(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
		this.lobbyService.joinMap(client, payload);
	}

	handleDisconnect(client: Socket) {
		this.logger.debug(`Client disconnected: ${client.id} from lobby namespace`);

		this.logger.log(`Clients Before: ${this.playerService.getPlayerCount()}`);

		const userId = this.playerService.getUserIdBySocket(client);
		this.playerService.removePlayer(this.playerService.getPlayer(userId));

		this.userService.status(userId, UserStatus.OFFLINE);

		this.logger.log(`Clients After: ${this.playerService.getPlayerCount()}`);
	}

	@SubscribeMessage('invite_game')
	async handleInviteGame(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		//Desafiador
		const challengerId = body.challengerId;
		const challengerNickname = body.challengerNickname;

		//Desafiado
		const challengedId = body.challengedId;

		//Verificar
		const player1 = this.playerService.getPlayer(challengerId);
		const player2 = this.playerService.getPlayer(challengedId);

		if (!player2) {
			this.server.to(player1.getSocket().id).emit('invite_confirm_game', 'Is not Connect!');
		}

		if (!player1 || !player2) {
			return;
		}

		this.server.to(player2.getSocket().id).emit('invite_request_game', {
			playerId: challengerId,
			playerName: challengerNickname,
		});

		this.server.to(player1.getSocket().id).emit('invite_confirm_game', 'Recive your Invite!');
	}

	@SubscribeMessage('challenge_game')
	async handleChallengeGame(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`challenge game received: ${JSON.stringify(body)}`);

		const challenged = body.challenged;
		const challenger = body.challenger;
		const player1 = this.playerService.getPlayer(challenged);
		const player2 = this.playerService.getPlayer(challenger);

		if (!player1 || !player2) {
			return;
		}

		const game = await this.gameService.challengeGame(challenged, challenger);

		//		console.log(game);
		this.server.to(player1.getSocket().id).emit('challenge_game', game);
		this.server.to(player2.getSocket().id).emit('challenge_game', game);
	}

	//Block User
	@SubscribeMessage('block_user')
	async handleBlockUser(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Block User received: ${JSON.stringify(body)}`);

		//Quem Bloqueou
		const blockerId = body.blockerId;
		const blockerNickname = body.blockerNickname;

		//Foi Bloqueado
		const blockedId = body.blockId;

		//Verificar
		const player = this.playerService.getPlayer(blockedId);

		if (!player) {
			return;
		}

		this.server.to(player.getSocket().id).emit('block_user', {
			blocker: {
				id: blockerId,
				nickname: blockerNickname,
			},
			blockerId: blockerId,
			blockedId: blockedId,
		});
	}

	//Unblock User
	@SubscribeMessage('unblock_user')
	async handleUnblockUser(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Unblock User received: ${JSON.stringify(body)}`);

		//Quem Bloqueou
		const blockerId = body.blockerId;
		const blockerNickname = body.blockerNickname;

		//Foi Bloqueado
		const blockedId = body.blockId;

		//Verificar
		const player = this.playerService.getPlayer(blockedId);

		if (!player) {
			return;
		}

		this.server.to(player.getSocket().id).emit('unblock_user', {
			blocker: {
				id: blockerId,
				nickname: blockerNickname,
			},
			blockerId: blockerId,
			blockedId: blockedId,
		});
	}

	//Send Friend Request
	@SubscribeMessage('sendFriendRequest')
	async handleSendFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Send Friend Request received: ${JSON.stringify(body)}`);

		//Quem foi Pedido
		const requesteeId = body.requesteeId;
		const requesteeName = body.requesteeName;

		//Quem Mandou
		const requestorId = body.requestorId;
		const requestorName = body.requestorName;

		//Verificar
		const player = this.playerService.getPlayer(requesteeId);

		if (!player) {
			return;
		}

		this.server.to(player.getSocket().id).emit('sendFriendRequest', {
			requesteeId: requesteeId,
			requesteeName: requesteeName,
			requestorId: requestorId,
			requestorName: requestorName,
		});
	}

	//Cancel Friend Request
	@SubscribeMessage('cancelFriendRequest')
	async handleCancelFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Cancel Friend Request received: ${JSON.stringify(body)}`);

		//Quem Mandou
		const requesteeId = body.requesteeId;

		//Quem foi Pedido
		const requestorId = body.requestorId;

		//Verificar
		const player = this.playerService.getPlayer(requesteeId);

		if (!player) {
			return;
		}

		this.server.to(player.getSocket().id).emit('cancelFriendRequest', {
			requestorId: requestorId,
		});
	}

	//Accept Friend Request
	@SubscribeMessage('acceptFriendRequest')
	async handleAcceptFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Accept Friend Request received: ${JSON.stringify(body)}`);

		//Quem Aceitou
		const requesteeId = body.requesteeId;
		const requesteeName = body.requesteeName;

		//Quem Mandou
		const requestorId = body.requestorId;

		//Verificar
		const player = this.playerService.getPlayer(requestorId);

		if (!player) {
			return;
		}

		this.server.to(player.getSocket().id).emit('acceptFriendRequest', {
			id: requesteeId,
			nickname: requesteeName,
		});
	}

	//Accept Friend Request
	@SubscribeMessage('rejectFriendRequest')
	async handleRejectFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Reject Friend Request received: ${JSON.stringify(body)}`);

		//Quem Aceitou
		const requesteeId = body.requesteeId;

		//Quem Mandou
		const requestorId = body.requestorId;

		//Verificar
		const player = this.playerService.getPlayer(requestorId);

		if (!player) {
			return;
		}

		this.server.to(player.getSocket().id).emit('rejectFriendRequest', {
			requesteeId: requesteeId,
		});
	}

	//Delete Friend
	@SubscribeMessage('deleteFriend')
	async handleDeleteFriend(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
		this.logger.debug(`Delete Friend received: ${JSON.stringify(body)}`);

		//Quem Mandou
		const unfriend = body.unfriend;
		const id = body.id;

		//Verificar
		const player = this.playerService.getPlayer(unfriend);

		if (!player) {
			return;
		}

		this.server.to(player.getSocket().id).emit('deleteFriend', {
			id: id,
		});
	}
}
