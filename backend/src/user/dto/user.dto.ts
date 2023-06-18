import { UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {
	@IsEmail()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	nickname?: string;

	@IsString()
	@IsOptional()
	image?: string;

	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsOptional()
	money?: number;

	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsOptional()
	avatar?: number;

	// Info Ping Pong
	@IsOptional()
	infoPong?: object;

	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsOptional()
	level?: number;

	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsOptional()
	xp?: number;

	@IsString()
	@IsOptional()
	color?: string;

	@IsString()
	@IsOptional()
	tableColorEquipped?: string;

	@IsString()
	@IsOptional()
	tableSkinEquipped?: string;

	@IsString()
	@IsOptional()
	paddleSkinEquipped?: string;

	@IsArray()
	@IsOptional()
	tableSkinsOwned?: string[];

	@IsArray()
	@IsOptional()
	paddleSkinsOwned?: string[];

	/*
	Game History
	*/

	@IsEnum(UserStatus)
	@IsOptional()
	status?: UserStatus;
}

export class UserBuySkinDto {
	@IsString()
	skin: string;

	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	typeSkin: number;

	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	price: number;
}

export class UserUpdateSkinTableDto {
	@IsString()
	skin: string;

	@IsString()
	color: string;
}
