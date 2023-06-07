import { GameStatus, GameType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	ValidateNested,
} from 'class-validator';

class GameStatsDto {
	@IsOptional()
	@IsNotEmpty()
	@IsInt()
	winnerId: number;

	@IsOptional()
	@IsNotEmpty()
	@IsInt()
	loserId: number;

	@IsOptional()
	@IsNotEmpty()
	@IsInt()
	winnerScore: number;

	@IsOptional()
	@IsNotEmpty()
	@IsInt()
	loserScore: number;
}

export class GameDto {
	@IsOptional()
	@IsEnum(GameStatus)
	status: GameStatus;

	// could be just number, but array allows
	// for more than 2 players
	@IsArray()
	@IsNumber({}, { each: true })
	@ArrayMaxSize(4)
	players: number[];

	@IsOptional()
	@IsNotEmpty()
	@ValidateNested()
	@Type(() => GameStatsDto)
	gameStats?: string;

	@IsOptional()
	@IsEnum(GameType)
	gameType?: GameType;
}
