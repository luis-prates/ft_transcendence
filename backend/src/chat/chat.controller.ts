import { Body, Controller, Get, Param, Post, UseGuards, Request, Delete, HttpCode, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from './roleguard';
import { Roles } from './decorator';
import { CreateChannelDto, JoinChannelDto, EditChannelDto, MuteUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('chat/channels')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	// Get List of all channels
	@Get()
	async getChannels() {
		return this.chatService.getChannels();
	}

	// Get List of all channels which user is in
	@Get('user')
	async getChannelsByUser(@Request() req: any) {
		return this.chatService.getChannelsByUser(req.user);
	}

	// Get all messages for a user's channels
	@Get('user/messages')
	async getMessagesByUser(@Request() req: any) {
		return this.chatService.getMessagesByUser(req.user);
	}

	// Get Messages of a channel
	@Get(':channelId/messages')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner', 'member')
	async getMessagesByChannel(@Param('channelId') channelId: string) {
		return this.chatService.getMessagesByChannel(Number(channelId));
	}

	// Create a channel
	@HttpCode(201)
	@Post()
	async createChannel(@Body() createChannelDto: CreateChannelDto, @Request() req: any) {
		return this.chatService.createChannel(createChannelDto, req.user);
	}

	// Edit a channel
	@Patch('edit/:channelId')
	@UseGuards(RolesGuard)
	@Roles('owner')
	async editChannel(@Param('channelId') channelId: string, @Body() editChannelDto: EditChannelDto) {
		return this.chatService.editChannel(+channelId, editChannelDto);
	}

	// Delete a channel
	@HttpCode(204)
	@Delete(':id')
	async deleteChannel(@Param('id') id: string, @Request() req: any) {
		return this.chatService.deleteChannel(Number(id), req.user);
	}

	// Add Users to channel, if you are admin/owner
	@HttpCode(201)
	@Post(':channelId/users/:userId')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async addUserToChannel(@Param('channelId') channelId: string, @Param('userId') userId: string) {
		return this.chatService.addUserToChannel(Number(channelId), Number(userId));
	}

	// Remove user from channel
	@HttpCode(204)
	@Delete(':channelId/users/:userId')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async removeUserFromChannel(
		@Param('channelId') channelId: string,
		@Request() req: any,
		@Param('userId') userId: string,
	) {
		return this.chatService.removeUserFromChannel(Number(channelId), Number(req.user.id), Number(userId));
	}

	// Join a channel by Id
	@Post(':channelId/join')
	async joinChannelById(
		@Param('channelId') channelId: string,
		@Body() joinChannelDto: JoinChannelDto,
		@Request() req: any,
	) {
		// Overwrite channelId from the DTO with the one from the URL.
		return this.chatService.joinChannel(joinChannelDto, Number(channelId), req.user);
	}

	// Leave a channel by Id
	@HttpCode(204)
	@UseGuards(RolesGuard)
	@Roles('member')
	@Delete(':channelId/leave')
	async leaveChannel(@Param('channelId') channelId: string, @Request() req: any) {
		return this.chatService.leaveChannel(Number(channelId), req.user);
	}

	// Mute user
	@Post(':channelId/mute/:userId')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async muteUser(
		@Param('channelId') channelId: string,
		@Param('userId') userId: string,
		@Body() muteUserDto: MuteUserDto,
	) {
		return this.chatService.muteUser(Number(channelId), Number(userId), muteUserDto.muteDuration);
	}

	// Unmute user
	@Post(':channelId/unmute/:userId')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async unmuteUser(@Param('channelId') channelId: string, @Param('userId') userId: string) {
		return this.chatService.unmuteUser(Number(channelId), Number(userId));
	}

	// Make someone admin if you are the owner
	@Post(':channelId/admin/:userId')
	@UseGuards(RolesGuard)
	@Roles('owner')
	async makeAdmin(@Param('channelId') channelId: string, @Param('userId') userId: string) {
		return this.chatService.makeAdmin(Number(channelId), Number(userId));
	}

	// Demote an admin
	@Post(':channelId/users/:userId/demote')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async demoteAdmin(@Request() req: any, @Param('channelId') channelId: string, @Param('userId') userId: string) {
		return this.chatService.demoteAdmin(Number(req.user.id), Number(channelId), Number(userId));
	}

	// Make someone owner if you are the owner
	@Post(':channelId/owner/:userId')
	@UseGuards(RolesGuard)
	@Roles('owner')
	async makeOwner(@Param('channelId') channelId: string, @Param('userId') userId: string) {
		return this.chatService.makeOwner(Number(channelId), Number(userId));
	}

	// Change channel password
	@Post(':channelId/password')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async changePassword(@Param('channelId') channelId: string, @Body() joinChannelDto: JoinChannelDto) {
		return this.chatService.changeChannelPassword(joinChannelDto, Number(channelId));
	}

	// Ban a user from the channel
	@Post(':channelId/ban/:userId')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async banUser(@Param('channelId') channelId: string, @Param('userId') userId: string) {
		return this.chatService.banUser(Number(channelId), Number(userId));
	}

	// Unban a user from the channel
	@Post(':channelId/unban/:userId')
	@UseGuards(RolesGuard)
	@Roles('admin', 'owner')
	async unbanUser(@Param('channelId') channelId: string, @Param('userId') userId: string) {
		return this.chatService.unbanUser(Number(channelId), Number(userId));
	}
}
