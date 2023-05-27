import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GameService } from './game.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {}

	@HttpCode(201)
	@Post('create')
	createGame(@GetUser() user: User, @Body() body: any) {
		return this.gameService.createGame(user, body);
	}
}
