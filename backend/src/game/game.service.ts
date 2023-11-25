import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Game, GameStatus, Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GameDto, GameEndDto, GameIdDto } from './dto';
import { EventEmitter } from 'events';
import { GameClass, Status, infoBot } from './ping_pong/GamePong';
import { playerInfo } from '../socket/SocketInterface';
import { PlayerService } from '../player/player.service';
import { Server } from 'socket.io';
import { Player } from '../player/Player';
import { UserService } from '../user/user.service';

type LeaderBoard = {
	rank: number;
	userId: number;
	nickname: string;
	image: string;
	points: number;
	gamesWon: number;
	gamesLost: number;
};

@Injectable()
export class GameService {
	public events: EventEmitter;
	public games: GameClass[] = [];
	private readonly logger = new Logger(GameService.name);
	private server: Server;

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
		const game = await this.prisma.game.create({
			data: {
				gameType: body.gameType,
				players: {
					connect: body.players.map(player => ({ id: player })),
				},
			},
			include: {
				players: true,
			},
		});
		const playerOne = this.playerService.getPlayer(body.players[0]);
		body.gameRequest.objectId = game.id;
		this.games.push(
			new GameClass(body.gameRequest, this, this.userService, () => {
				// this.events.emit('gameEnded', game);
				// remove game from games array
				this.games = this.games.filter(g => g.data.objectId !== body.gameRequest.objectId);
				playerOne?.map?.removeGameObject(playerOne, body.gameRequest.objectId);
			}),
		);
		// adds bot if bot is true
		if (body.gameRequest.bot === true) {
			this.addGameUser(game.id, infoBot);
		}
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

	async matchMakingGame(player: Player, info: playerInfo) {
		const game = this.games.find(g => g.status == Status.Waiting);
		if (!game) {
			const gameCreated = await this.createGame({
				gameType: 'PUBLIC',
				players: [],
				gameRequest: {
					objectId: `gametest_${info}`,
					maxScore: 3,
					table: '#1e8c2f',
					tableSkin: '',
					bot: false,
				},
			} as GameDto);
			return gameCreated.id;
		}
		return game.data.objectId;
	}

	async challengeGame(player1Id: number, player2Id: number) {
		//TODO TESTAR
		try {
			const player1 = await this.prisma.user.findUnique({
				where: {
					id: player1Id,
				},
			});

			const player2 = await this.prisma.user.findUnique({
				where: {
					id: player2Id,
				},
			});

			if (player1.status == UserStatus.IN_GAME || player2.status == UserStatus.IN_GAME) {
				return undefined;
			}

			const gameCreated = (await this.createGame({
				gameType: 'PUBLIC',
				players: [player1Id, player2Id],
				gameRequest: {
					objectId: `gametest_${player1Id}_${player2Id}`,
					maxScore: 3,
					table: '#1e8c2f',
					tableSkin: '',
					bot: false,
				},
			} as GameDto)) as any;
			return gameCreated.id;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`Defined field value already exists. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}

	async getActiveGames(status: GameStatus): Promise<Game[]> {
		if (!status) {
			throw new ForbiddenException('Cannot get games without status.');
		}
		if (status == GameStatus.FINISHED) {
			throw new ForbiddenException('Cannot get finished games.');
		}
		return this.prisma.game.findMany({
			where: {
				status: status,
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

	// leaderboard ranks users first by their won games, then by their lost games
	// if two users have the same number of won games, the user with the least
	// number of lost games will be ranked higher
	// if two users have the same number of won and lost games, their rank will be the same
	async getLeaderboard(): Promise<Array<LeaderBoard>> {
		const leaderboard = await this.prisma.user.findMany({
			where: {
				id: {
					not: 6969,
				},
			},
			select: {
				id: true,
				nickname: true,
				image: true,
				wonGames: {
					select: {
						winnerId: true,
						winnerNickname: true,
						winnerScore: true,
						loserId: true,
						loserNickname: true,
						loserScore: true,
					},
					where: {
						AND: [{ status: GameStatus.FINISHED }, { players: { none: { id: 6969 } } }],
					},
				},
				lostGames: {
					select: {
						winnerId: true,
						winnerNickname: true,
						winnerScore: true,
						loserId: true,
						loserNickname: true,
						loserScore: true,
					},
					where: {
						AND: [{ status: GameStatus.FINISHED }, { players: { none: { id: 6969 } } }],
					},
				},
			},
			orderBy: [
				{
					wonGames: {
						_count: 'desc',
					},
				},
				{
					lostGames: {
						_count: 'asc',
					},
				},
			],
		});

		const leaderboardReturn: Array<LeaderBoard> = [];
		(await leaderboard).forEach(user => {
			const gamesWon = user.wonGames.length;
			const gamesLost = user.lostGames.length;

			let points = 0;

			user.wonGames.forEach(wongame => {
				points += wongame.loserScore == 0 ? 3 : 2;
			});
			//TODO if lose 0 points lose -1?
			/*user.lostGames.forEach(lostgame => {
				points += lostgame.loserScore == 0 ? -1 : 0;
				points = points < 0 ? 0 : points;
			});*/

			leaderboardReturn.push({
				rank: 1,
				userId: user.id,
				nickname: user.nickname,
				image: user.image,
				points: points,
				gamesWon,
				gamesLost,
			});
		});

		leaderboardReturn.sort((a, b) => b.points - a.points);

		let last_points = 0;
		let last_rank = 1;
		leaderboardReturn.forEach((user, index) => {
			let cur_rank = index + 1;
			if (index == 0) {
				last_rank = user.rank;
				last_points = user.points;
			} else {
				if (last_points == user.points) {
					cur_rank = last_rank;
				} else {
					last_rank = cur_rank;
					last_points = user.points;
				}
			}
			user.rank = cur_rank;
		});
		return leaderboardReturn;
	}

	async enterGame(player: Player, info: playerInfo): Promise<boolean> {
		const game = this.games.find(g => g.data.objectId === info.objectId);
		if (!game) {
			throw new ForbiddenException('Game does not exist');
		}
		const isPlayer = !game.player1 || !game.player2;
		if (isPlayer) {
			this.addGameUser(info.objectId, info);
		}
		game.entry_game(player, isPlayer, info);
		return isPlayer;
	}

	async updateGameStatus(gameId: string, status?: GameStatus): Promise<Game> {
		try {
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					status: status,
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
	async addGameUser(gameId: string, body: GameIdDto): Promise<Game> {
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

	async startGame(gameId: string, body: GameDto): Promise<Game> {
		try {
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					status: body.status,
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
	async endGame(gameId: string, body: GameEndDto): Promise<Game> {
		try {
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					status: body?.status,
					winnerScore: body.gameStats.winnerScore,
					loserScore: body.gameStats.loserScore,
					winner: {
						connect: {
							id: body.gameStats.winnerId,
						},
					},
					loser: {
						connect: {
							id: body.gameStats.loserId,
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

	async getUserGames(userId: number): Promise<Game[]> {
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
			},
		});
	}

	async deleteGame(gameId: string): Promise<Game> {
		const index = this.games.findIndex(g => g.data.objectId === gameId);
		if (index !== -1) {
			this.games.splice(index, 1);
		}
		return this.prisma.game.delete({
			where: {
				id: gameId,
			},
		});
	}
}