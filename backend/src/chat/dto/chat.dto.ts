import { IsNotEmpty, IsOptional, IsEnum, MinLength, IsArray, IsNumber, IsString } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
	@IsOptional()
	name: string;

	@IsArray()
	@IsNumber({}, { each: true })
	usersToAdd: number[];

	@IsEnum(ChannelType)
	channelType: ChannelType;

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
