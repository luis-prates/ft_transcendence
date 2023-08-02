import { Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('api/friendship')
export class FriendshipController {
	constructor(private friendshipService: FriendshipService) {}

	@HttpCode(201)
	@Post('accept/:id')
	acceptFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return this.friendshipService.acceptFriendRequest(user.id, friend);
	}

	@HttpCode(204)
	@Delete('reject/:id')
	rejectFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return this.friendshipService.rejectFriendRequest(user.id, friend);
	}

	@HttpCode(201)
	@Post('send/:id')
	sendFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return this.friendshipService.sendFriendRequest(user, friend);
	}

	@HttpCode(204)
	@Delete('cancel/:id')
	cancelFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return this.friendshipService.cancelFriendRequest(user.id, friend);
	}

	@HttpCode(204)
	@Delete('unfriend/:id')
	deleteFriend(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return this.friendshipService.deleteFriend(user.id, friend);
	}

	@Get('friends')
	getFriends(@GetUser() user: User) {
		return this.friendshipService.getFriends(user.id);
	}

	@Get('requests')
	getFriendRequests(@GetUser() user: User) {
		return this.friendshipService.getFriendRequests(user.id);
	}
}
