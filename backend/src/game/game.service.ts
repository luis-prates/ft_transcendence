import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	async createGame(user: User, body: any) {
		const game = await this.prisma.game.create({
			data: {
				players: {
					connect: {
						id: user.id,
					},
					...body.players.map((player: number) => ({
						connect: {
							id: player,
						},
					})),
				},
				testJson: body.testJson,
			},
		});

		return game;
	}
}
