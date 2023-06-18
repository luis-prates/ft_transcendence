import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { UserDto, UserBuySkinDto, UserUpdateSkinTableDto, UserProfileDto } from './dto';

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

	@Patch('update_table_skin')
	updateSkinTable(@GetUser('id') userId: number, @Body() dto: UserUpdateSkinTableDto) {
		console.log("updateSkinTable:", dto);
		return (this.userService.updateSkinTable(userId, dto));
	}

	@Get('users')
	getUsers(@GetUser() user: User) {
		return (this.userService.getUsers(user.id));
	}

	@Get('get_profile/:id')
	getProfile(@GetUser() user: User, @Param('id', ParseIntPipe) personId: number) {
		return (this.userService.getProfile(user.id, personId));
	}

}
