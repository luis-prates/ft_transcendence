import { UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNumber, IsNotEmpty, IsString, IsEmail, IsOptional, IsArray, IsEnum, Length } from 'class-validator';

export class AuthDto {
	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	name: string;

	@IsString()
	@IsNotEmpty()
	nickname: string;

	@IsString()
	image: string;

	@IsNumber()
	@IsOptional()
	money?: number;

	@IsNumber()
	@IsOptional()
	avatar?: number;

	// Info Ping Pong
	@IsOptional()
	infoPong?: object;

	@IsNumber()
	@IsOptional()
	level?: number;

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

export class TwoFADto {
	@IsString()
	// length of 6 because 2FA codes are 6 digits long
	@Length(6, 6, {
		message: '2FA code must be 6 digits long',
	})
	@IsNotEmpty()
	twoFACode: string;
}
