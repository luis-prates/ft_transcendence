import { IsNotEmpty, IsOptional, IsEnum, MinLength, isNotEmpty, IsArray, IsNumber } from "class-validator";
import { ChannelType } from '../../types'

export class CreateChannelDto {
    @IsOptional()
    name: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    userIdsToAdd: number[];

    @IsEnum(ChannelType)
    channelType: ChannelType;

    @IsOptional()
    @MinLength(3, {
        message: 'Password is too short. Minimum length is $constraint1 characters, but actual is $value',
    })
    password: string;

    @IsOptional()
    secondUserId: number;
}

export class JoinChannelDto {
    @IsOptional()
    @MinLength(3, {
        message: 'Password is too short. Minimum length is $constraint1 characters, but actual is $value',
    })
    password: string;

    @IsNotEmpty()
    channelId: number;
}

export class ChannelUserDto {
    @IsNotEmpty()
    channelId: number;

    @IsNotEmpty()
    userId: number;
}