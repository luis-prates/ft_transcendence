import { ChannelType } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsEnum, MinLength, IsArray, IsNumber, IsBase64, IsString } from 'class-validator';


export class CreateChannelDto {
	@IsOptional()
	name: string;

	@IsArray()
	@IsNumber({}, { each: true })
	usersToAdd: number[];

	@IsEnum(ChannelType)
	channelType: ChannelType;

	@IsString()
	//@IsBase64()
	@IsOptional()
	avatar?: string;

	@IsOptional()
	@MinLength(3, {
		message: 'Password is too short. Minimum length is $constraint1 characters, but actual is $value',
	})
	password: string;
}

export class JoinChannelDto {
	@IsOptional()
	@MinLength(3, {
		message: 'Password is too short. Minimum length is $constraint1 characters, but actual is $value',
	})
	password: string;
}

export class ChannelUserDto {
	@IsNotEmpty()
	channelId: number;

	@IsNotEmpty()
	userId: number;
}

export class EditChannelDto {
	@IsEnum(ChannelType)
	@IsOptional()
	channelType?: ChannelType;

	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	avatar?: string;

	@IsString()
	@IsOptional()
	@MinLength(3, {
		message: 'Password is too short. Minimum length is $constraint1 characters, but actual is $value',
	})
	password?: string;
}
