import { Body, Controller, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GameService } from './game.service';
import { GetUser } from '../auth/decorator';
import { GameDto } from './dto';
import { playerInfo } from '../ping_pong/SocketInterface';

//! deactivated for testing purposes
//@UseGuards(JwtGuard)
@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {}

	@HttpCode(201)
	@Post('create')
	createGame(@Body() body: GameDto) {
		return this.gameService.createGame(body);
	}

	@HttpCode(200)
	@Patch('add/:gameId')
	addGameUser(@Param('gameId', new ParseUUIDPipe()) gameId: string, @Body() body: playerInfo) {
		return this.gameService.addGameUser(gameId, body);
	}

	@HttpCode(200)
	@Patch('start/:gameId')
	startGame(@Param('gameId', new ParseUUIDPipe()) gameId: string, @Body() body: GameDto) {
		return this.gameService.startGame(gameId, body);
	}

	//! as Patch request for testing purposes
	@Patch('update/:gameId')
	endGame(@Param('gameId', new ParseUUIDPipe()) gameId: string, @Body() body: GameDto) {
		return this.gameService.endGame(gameId, body);
	}
}
