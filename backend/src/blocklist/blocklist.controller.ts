import { Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BlocklistService } from './blocklist.service';

@UseGuards(JwtGuard)
@Controller('api/blocklist')
export class BlocklistController {
	constructor(private blocklistService: BlocklistService) {}

	// Block a user
	@Post('block/:id')
	blockUser(@GetUser() user: User, @Param('id', ParseIntPipe) blockedId: number): any {
		return this.blocklistService.blockUser(user, blockedId);
	}

	// Unblock a user
	@HttpCode(204)
	@Delete('block/:id')
	unblockUser(@GetUser() user: User, @Param('id', ParseIntPipe) blockedId: number): any {
		return this.blocklistService.unblockUser(user, blockedId);
	}

	// Get list of blocked users
	@Get()
	getBlockedUsers(@GetUser() user: User): any {
		return this.blocklistService.getBlockedUsers(user);
	}

	// Get list of users who blocked you
	@Get('blockedBy')
	getBlockedBy(@GetUser() user: User): any {
		return this.blocklistService.getBlockedBy(user);
	}
}
