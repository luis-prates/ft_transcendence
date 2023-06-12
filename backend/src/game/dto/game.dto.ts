import { GameStatus, GameType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
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

class GameRequestDto {
	@IsOptional()
	@IsString()
	objectId: string;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	maxScore: number;

	@IsOptional()
	@IsString()
	table: string;

	@IsOptional()
	@IsString()
	tableSkin: string;

	@IsOptional()
	@IsBoolean()
	bot: boolean;
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

	@IsNotEmpty()
	@Type(() => GameRequestDto)
	@ValidateNested()
	gameRequest: GameRequestDto;
}
