import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { UserDto, UserBuySkinDto, UserUpdateSkinTableDto, UserUpdateStatsDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}

	/*@Patch()
	editUser(@GetUser('id') userId:number, @Body() dto: UserDto) {
		return (this.userService.editUser(userId, dto));
	}*/

	@Patch('update_profile')
	updateProfile(@GetUser('id') userId: number, @Body() dto: UserDto) {
		return this.userService.editUser(userId, dto);
	}

	@Post('status')
	status(@GetUser('id') userId: number, @Body() status: UserStatus) {
		return this.userService.status(userId, status);
	}

	@Patch('buy_skin')
	buySkin(@GetUser('id') userId: number, @Body() dto: UserBuySkinDto) {
		return this.userService.buySkin(userId, dto);
	}

	@Patch('update_table_skin')
	updateSkinTable(@GetUser('id') userId: number, @Body() dto: UserUpdateSkinTableDto) {
		return this.userService.updateSkinTable(userId, dto);
	}

	@Get('users')
	getUsers() {
		return this.userService.getUsers();
	}

	@Get('get_profile/:id')
	getProfile(@GetUser() user: User, @Param('id', ParseIntPipe) personId: number) {
		return this.userService.getProfile(user.id, personId);
	}

	@Post('updateStats')
	updateStats(@GetUser('id') userId: number, @Body() dto: UserUpdateStatsDto) {
		return this.userService.updateStats(userId, dto);
	}
}
