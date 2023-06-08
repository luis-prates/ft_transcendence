import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
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
}
