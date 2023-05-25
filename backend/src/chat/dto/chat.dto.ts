import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateChannelDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    isPrivate: boolean;

    @IsOptional()
    secondUserId: number;
}

export class ChannelUserDto {
    @IsNotEmpty()
    channelId: number;

    @IsNotEmpty()
    userId: number;
}