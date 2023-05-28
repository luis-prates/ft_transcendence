import { Body, Controller, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GameService } from './game.service';
import { GetUser } from '../auth/decorator';
import { GameDto } from './dto';

@UseGuards(JwtGuard)
@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {}

	@HttpCode(201)
	@Post('create')
	createGame(@Body() body: GameDto) {
		return this.gameService.createGame(body);
	}

	//! as Patch request for testing purposes
	@Patch('update/:gameId')
	endGame(@Param('gameId') gameId: string, @Body() body: GameDto) {
		return this.gameService.endGame(gameId, body);
	}
}
