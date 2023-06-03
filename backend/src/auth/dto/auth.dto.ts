import { Transform } from "class-transformer";
import { IsNumber, IsNotEmpty, IsString, IsEmail, IsBase64 } from "class-validator";

export class AuthDto {
	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsString()
	name: string;

	@IsString()
	@IsNotEmpty()
	nickname: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsBase64()
	image: string;
}