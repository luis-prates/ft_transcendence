import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { GameStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GameDto } from './dto';
import { EventEmitter } from 'events';
import { GameClass, infoBot } from './ping_pong/GamePong';
import { playerInfo } from '../socket/SocketInterface';
import { PlayerService } from '../player/player.service';
import { Server } from 'socket.io';
import { Player } from '../player/Player';
import { UserService } from '../user/user.service';

@Injectable()
export class GameService {
	public events: EventEmitter;
	private games: GameClass[] = [];
	private readonly logger = new Logger(GameService.name);
	private server: Server;

	// TODO: to be added to Game service
	// private isInLobby = false;

	constructor(private prisma: PrismaService, private playerService: PlayerService, private userService: UserService) {
		this.events = new EventEmitter();
	}

	setServer(server: Server) {
		this.server = server;
	}

	getServer(): Server {
		return this.server;
	}

	async createGame(body: GameDto) {
		this.logger.debug(`createGame is called with body: ${JSON.stringify(body)}`);
		const game = await this.prisma.game.create({
			data: {
				gameType: body.gameType,
				gameStats: Prisma.JsonNull,
				//! used if players are added when game is created
				// players: {
				// 	connect: body.players.map(player => ({ id: player })),
				// },
			},
			include: {
				players: true,
			},
		});
		this.logger.debug(`game created in database: ${JSON.stringify(game)}`);
		const playerOne = this.playerService.getPlayer(body.players[0]);
		// objectId same as game.id generated in database?
		body.gameRequest.objectId = game.id;
		// new_game equivalent
		this.games.push(
			new GameClass(body.gameRequest, this, this.userService, () => {
				// this.events.emit('gameEnded', game);
				// remove game from games array
				this.games = this.games.filter(g => g.data.objectId !== body.gameRequest.objectId);
				this.logger.log(`Game ${game.id} ended and removed.`);
				playerOne?.map?.removeGameObject(playerOne, body.gameRequest.objectId);
			}),
		);
		// adds bot if bot is true
		if (body.gameRequest.bot === true) {
			this.addGameUser(game.id, infoBot);
		}

		this.logger.debug('GameClass Object created in memory');

		//! perhaps this should be in the gateway?
		// // entry_game equivalent
		// this.logger.log(`Player 1 entered Game ${game.id}.`);
		// // newGameIndex - 1 should be the index of the game that was just pushed
		// this.games[newGameIndex - 1].entry_game(playerOne, body.playerInfo);

		// this.players.getPlayerFromObjectId(game.players[0].id).then(player => {
		// 	this.games.push(new GameClass(player, game.id));
		// });

		return game;
	}

	async enterGame(player: Player, isPlayer: boolean, info: playerInfo) {
		const game = this.games.find(g => g.data.objectId === info.objectId);
		if (!game) {
			throw new ForbiddenException('Game does not exist');
		}
		this.addGameUser(info.objectId, info);
		game.entry_game(player, isPlayer, info);
	}

	async updateGame(gameId: string, body?: any) {
		try {
			this.logger.debug(`updateGame for game ${gameId} is called with body: ${JSON.stringify(body)}`);
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					gameStats: body?.gameStats,
					status: body?.status,
				},
				include: {
					players: true,
				},
			});

			return game;
		} catch (error) {
			this.logger.error(error);
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2016') {
					throw new ForbiddenException('Game not found.');
				}
				throw error;
			}
		}
	}

	// when the client receives the game object, it will have the players array
	// if the players array is equal or greater than 2, the client
	// will enable the start game button
	// when the client clicks the start game button, it will send a request
	// to the backend to call the start game function, which could be an event
	async addGameUser(gameId: string, body: playerInfo) {
		try {
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					players: {
						connect: {
							id: body.userId,
						},
					},
				},
				include: {
					players: true,
				},
			});

			return game;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2016') {
					throw new ForbiddenException('Game not found.');
				}

				throw error;
			}
		}
	}

	async startGame(gameId: string, body: GameDto) {
		try {
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					gameStats: body.gameStats,
				},
				include: {
					players: true,
				},
			});

			return game;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2016') {
					throw new ForbiddenException('Game not found.');
				}

				throw error;
			}
		}
	}

	// handles what to do when the game ends
	async endGame(gameId: string, body: GameDto) {
		try {
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					gameStats: body.gameStats,
				},
				include: {
					players: true,
				},
			});

			return game;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2016') {
					throw new ForbiddenException('Game not found.');
				}

				throw error;
			}
		}
	}

	async getUserGames(userId: number) {
		return this.prisma.game.findMany({
			where: {
				players: {
					some: {
						id: userId,
					},
				},
				status: GameStatus.FINISHED,
			},
			include: {
				players: {
					select: {
						id: true,
						nickname: true,
						image: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			}
		});
	}

	async getActiveGames(status: GameStatus) {
		if (status === GameStatus.FINISHED) {
			throw new ForbiddenException('Cannot get finished games.');
		}
		return this.prisma.game.findMany({
			where: {
				status,
			},
			include: {
				players: {
					select: {
						id: true,
						nickname: true,
						image: true,
					},
				},
			},
		});
	}
}
