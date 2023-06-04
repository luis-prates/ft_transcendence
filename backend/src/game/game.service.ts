import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GameDto } from './dto';
import EventEmitter from 'events';

@Injectable()
export class GameService {
	public events: EventEmitter;

	constructor(private prisma: PrismaService) {
		this.events = new EventEmitter();
	}

	async createGame(body: GameDto) {
		const gameData: any = {
			data: {
				gameType: body.gameType,
				gameStats: Prisma.JsonNull
			},
			include: {
				players: true,
			},
		};
		if (body.players.length > 0) {
			gameData.data.players = {
				connect: body.players.map((player) => ({ id: player })),
			};
		}
		const game = await this.prisma.game.create(gameData);

		return (game);
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
						connect: body.players.map((player) => ({ id: player })),
					},
				},
				include: {
					players: true,
				},
			});
			// delete the hash for all users from the players object
			game.players.forEach((player: User) => {
				delete player.hash;
			});
	
			return (game);
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
			// delete the hash for all users from the players object
			game.players.forEach((player: User) => {
				delete player.hash;
			});

			return (game);
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
			// delete the hash for all users from the players object
			game.players.forEach((player: User) => {
				delete player.hash;
			});
	
			return (game);
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
