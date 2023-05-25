import { Body, Controller, Get, Param, Post, UseGuards, Request, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from './roleguard';
import { Roles } from './decorator';
import { CreateChannelDto } from './dto';

@UseGuards(JwtGuard)
@Controller('chat/channels')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    // Get Messages of a channel
    @Get(':channelId/messages')
    @UseGuards(RolesGuard)
    @Roles('admin', 'owner')
    async getMessages(@Param('channelId') channelId: string) {
        return this.chatService.getMessagesByChannel(Number(channelId));
    }

    // Create a channel
    @Post()
    async createChannel(@Body() createChannelDto : CreateChannelDto, @Request() req ) {
        return this.chatService.createChannel(createChannelDto, req.user);
    }

    // add Users to channel, if you are admin/owner
    @Post(':channelId/users/:userId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'owner')
    async addUserToChannel(@Param('channelId') channelId: string, @Param('userId') userId: string) {
        return this.chatService.addUserToChannel(Number(channelId), Number(userId));
    }

    // Remove user from channel
    @Delete(':channelId/users/:userId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'owner')
    async removeUserFromChannel(@Param('channelId') channelId: string, @Param('userId') userId: string) {
        return this.chatService.removeUserFromChannel(Number(channelId), Number(userId));
    }

    // Mute user
    @Post(':channelId/mute/:userId')
    @UseGuards(RolesGuard)
    @Roles('admin', 'owner')
    async muteUser(@Param('channelId') channelId: string, @Param('userId') userId: string) {
        return this.chatService.muteUser(Number(channelId), Number(userId));
    }

    // make someone admin if you are the owner
    @Post(':channelId/admin/:userId')
    @UseGuards(RolesGuard)
    @Roles('owner')
    async makeAdmin(@Param('channelId') channelId: string, @Param('userId') userId: string) {
        return this.chatService.makeAdmin(Number(channelId), Number(userId));
    }
}
