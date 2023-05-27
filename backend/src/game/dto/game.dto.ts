import { GameStatus } from "@prisma/client";
import { IsArray, IsEnum, IsJSON, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class GameDto {

	@IsOptional()
	@IsEnum(GameStatus)
	status?: GameStatus;

	// could be just number, but array allows
	// for more than 2 players
	@IsNotEmpty()
	@IsArray()
	@IsNumber({}, { each: true })
	players: number[];

	@IsNotEmpty()
	@IsJSON()
	gameJson: JSON;

}