import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GameService } from './game.service';
import { GameDto, GameEndDto } from './dto';
import { playerInfo } from '../socket/SocketInterface';
import { GameStatus } from '@prisma/client';

//! deactivated for testing purposes
@UseGuards(JwtGuard)
@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {}

	@HttpCode(201)
	@Post('create')
	createGame(@Body() body: GameDto) {
		return this.gameService.createGame(body);
	}

	@Get('active')
	getActiveGames(@Query('status') status: GameStatus) {
		return this.gameService.getActiveGames(status);
	}

	@Get('leaderboard')
	getLeaderboard() {
		return this.gameService.getLeaderboard();
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
	@Patch('end/:gameId')
	endGame(@Param('gameId', new ParseUUIDPipe()) gameId: string, @Body() body: GameEndDto) {
		return this.gameService.endGame(gameId, body);
	}

	@Get('/user/:userId')
	getUserGames(@Param('userId', new ParseIntPipe()) userId: number) {
		return this.gameService.getUserGames(userId);
	}
}
