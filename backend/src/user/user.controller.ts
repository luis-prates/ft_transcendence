import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { UserDto, UserBuySkinDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('me')
	getMe(@GetUser() user: User) {
		return (user);
	}

	/*@Patch()
	editUser(@GetUser('id') userId:number, @Body() dto: UserDto) {
		return (this.userService.editUser(userId, dto));
	}*/
	
	@Patch('update_profile')
	updateProfile(@GetUser('id') userId: number, @Body() dto: UserDto) {
		console.log("update_profile:", dto);
		return (this.userService.updateProfile(userId, dto));
	}

	@Patch('buy_skin')
	buySkin(@GetUser('id') userId: number, @Body() dto: UserBuySkinDto) {
		console.log(dto);
		return (this.userService.buySkin(userId, dto));
	}
}
