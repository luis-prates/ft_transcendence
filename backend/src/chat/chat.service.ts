import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async getMessagesByChannel(channelId: number) {
        return this.prisma.message.findMany({
            where: {
                channelId: channelId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async createChannel(createChannelDto: CreateChannelDto, user: any) {
        // Implement the logic to create a channel
        const newChannel = await this.prisma.channel.create({
            data: {
                name: createChannelDto.name,
                isPrivate: createChannelDto.isPrivate,
                ownerId: user.id
            },
        });

        if (createChannelDto.isPrivate && createChannelDto.secondUserId) {
            await this.prisma.channelUser.create({
                data: {
                    channelId: newChannel.id,
                    userId: createChannelDto.secondUserId,
                },
            });
        }

        return newChannel;
    }

    async addUserToChannel(channelId: number, userId: number) {
        // Implement the logic to add a user to a channel
    }

    async removeUserFromChannel(channelId: number, userId: number) {
        // Implement the logic to remove a user from a channel
    }

    async muteUser(channelId: number, userId: number) {
        // Implement the logic to mute a user
    }

    async makeAdmin(channelId: number, userId: number) {
        // Implement the logic to make a user an admin
    }
}
