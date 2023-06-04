import { FriendReqStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsNumber, IsNotEmpty, IsEnum } from "class-validator";

export class FriendshipDto {
	
	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsNotEmpty()
	requestorId: number;

	@IsEnum(FriendReqStatus)
	status?: FriendReqStatus;


}