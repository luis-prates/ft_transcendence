import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Game, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GameDto } from './dto';
import { EventEmitter } from 'events';
import { PlayerService } from '../player/player.service';
import { GameClass } from '../ping_pong/GamePong';
import { Player } from '../lobby';
import { playerInfo } from '../ping_pong/SocketInterface';

@Injectable()
export class GameService {
	public events: EventEmitter;
	private games: GameClass[] = [];
	private readonly logger = new Logger(GameService.name);

	// TODO: to be added to Game service
	// private isInLobby = false;

	constructor(private prisma: PrismaService, private players: PlayerService) {
		this.events = new EventEmitter();
	}

	async createGame(body: GameDto) {
		this.logger.debug('createGame is called with body: ', body);
		const game = await this.prisma.game.create({
			data: {
				gameType: body.gameType,
				gameStats: Prisma.JsonNull,
				players: {
					connect: body.players.map(player => ({ id: player })),
				},
			},
			include: {
				players: true,
			},
		});
		this.logger.debug('game created in database: ', game);
		const playerOne = await this.players.getPlayer(game.players[0].id);
		// //! should it be here?
		// //! will entry game be here or separate?
		// if (game.players.length === 2) {
		// 	const playerTwo = await this.players.getPlayerFromObjectId(
		// 		game.players[1].id,
		// 	);
		// }
		// objectId same as game.id generated in database?
		body.gameRequest.objectId = game.id;
		// new_game equivalent
		this.games.push(
			new GameClass(body.gameRequest, () => {
				// this.events.emit('gameEnded', game);
				// remove game from games array
				this.games = this.games.filter(
					g => g.data.objectId !== body.gameRequest.objectId,
				);
				this.logger.log(`Game ${game.id} ended and removed.`);
				playerOne?.map.removeGameObject(body.gameRequest.objectId);
			}),
		);
		this.logger.debug('GameClass Object created in memory: ', this.games);

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
		game.entry_game(player, isPlayer, info);
	}

	// when the client receives the game object, it will have the players array
	// if the players array is equal or greater than 2, the client
	// will enable the start game button
	// when the client clicks the start game button, it will send a request
	// to the backend to call the start game function, which could be an event
	async addGameUser(gameId: string, body: GameDto) {
		try {
			const game = await this.prisma.game.update({
				where: {
					id: gameId,
				},
				data: {
					players: {
						connect: body.players.map(player => ({ id: player })),
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
}
