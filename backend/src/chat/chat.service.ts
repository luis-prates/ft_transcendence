import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, JoinChannelDto } from './dto';
import { ConflictException } from '@nestjs/common';
import { ChannelType } from 'src/types';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async getChannels() {
        // To be defined, what do we want to return here? Channel browsing list?
    }

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
        let newChannel;

        console.log(createChannelDto);
        if(createChannelDto.channelType !== 'DM' && (createChannelDto.name === null || createChannelDto.name === '')){
            throw new BadRequestException("Channels that are not DMs must have a name.");
        }

        if (createChannelDto.channelType === 'PRIVATE' && !createChannelDto.password) {
            throw new BadRequestException("Private channels must have a password.");
        }

        try {
            // Logic for public channels
            if (createChannelDto.channelType == 'PUBLIC') {
                console.log("LOL");
                // Note: channel name has to be unique for open channels
                newChannel = await this.prisma.channel.create({
                    data: {
                        name: createChannelDto.name,
                        type: createChannelDto.channelType,
                        ownerId: user.id,
                        users: {
                            create: [
                                {
                                    user: {
                                        connect: {
                                            id: user.id,
                                        }
                                    },
                                    isAdmin: true,
                                },
                                ...createChannelDto.usersToAdd.map((id) => ({
                                    user: {
                                        connect: {
                                            id: id,
                                        },
                                    },
                                }))
                            ]
                        }
                    },
                    include: {
                        users: true,
                    }
                });
                console.log("damn");
            }

            // Logic for public channels
            if (createChannelDto.channelType == 'PRIVATE') {
                // Note: channel name has to be unique for open channels
                let data : { name: string, type: ChannelType, ownerId: number, password?: string, users?: any } = {
                    name: createChannelDto.name,
                    type: createChannelDto.channelType,
                    ownerId: user.id
                };

                // If a password is provided in the DTO, add it to the data object
                if (createChannelDto.password) {
                    data.password = createChannelDto.password;
                }

                // add users connection
                data.users = {
                    create: {
                        user: {
                            connect: {
                                id: user.id,
                            }
                        },
                        isAdmin: true,
                    },
                    ...createChannelDto.usersToAdd.map((id) => ({
                        user: {
                            connect: {
                                id: id,
                            },
                        },
                    }))
                };

                newChannel = await this.prisma.channel.create({
                    data: data,
                });
            }

            // Logic for DM
            if (createChannelDto.channelType == 'DM' && createChannelDto.usersToAdd.length !== 1) {
                throw new BadRequestException('DMs can only be created with one other user');
            }
            if (createChannelDto.channelType == 'DM') {
                // check if there already is a private channel between users
                const existingDM = await this.prisma.channel.findFirst({
                    where: {
                        AND: [
                            { type : 'DM' },
                            { users: { some: { userId: user.id } } },
                            { users: { some: { userId: createChannelDto.usersToAdd[0] } } }
                        ]
                    },
                });
                if (existingDM) {
                    throw new ConflictException('DM between these users already exists');
                }
                // Note: no need to set channel name when creating a DM
                newChannel = await this.prisma.channel.create({
                    data: {
                        type: createChannelDto.channelType,
                        users: {
                            create: [
                                {
                                    user: {
                                        connect: {
                                            id: user.id,
                                        }
                                    }
                                }
                            ]
                        }
                    },
                });
            }
        } catch (error) {
            if (error.code === 'P2002' && error.meta.target.includes('name')) {
                throw new ConflictException('Channel name already exists');
            }
            // add more error codes here if needed
        }
        return newChannel;
    }

    async addUserToChannel(channelId: number, userId: number) {
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        if (channel.type == 'DM') {
            throw new ForbiddenException('Cannot add users to a DM');
        }

        const newChannelUser = await this.prisma.channelUser.create({
            data: {
                channelId: channelId,
                userId: userId,
            },
        });

        return newChannelUser;
    }

    async removeUserFromChannel(channelId: number, actingUserId: number, removedUserId: number) {
        const removeUser = await this.prisma.channelUser.findUnique({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: removedUserId
                }
            }
        });

        if (!removeUser) {
            throw new NotFoundException('User is not part of this channel');
        }

        const actingUserInChannel = await this.prisma.channelUser.findUnique({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: actingUserId
                }
            }
        });

        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId }
        });

        // Prevent an admin from kicking another admin or the owner.
        if (actingUserInChannel.isAdmin && (removeUser.isAdmin || removedUserId === channel.ownerId)) {
            throw new ForbiddenException('You do not have permission to remove this user from the channel');
        }

        await this.prisma.channelUser.delete({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: removedUserId
                }
            }
        });
    }

    async joinChannel(joinChannelDto: JoinChannelDto, user: any) {
        const { channelId, password } = joinChannelDto;

        const channel = await this.prisma.channel.findUnique({
            where: {
                id: channelId,
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        if (channel.type == 'PRIVATE' && channel.password !== password) {
            throw new BadRequestException('Password is incorrect');
        }

        const channelUser = await this.prisma.channelUser.findUnique({
            where: {
                userId_channelId: {
                    userId: user.id,
                    channelId: channelId,
                }
            }
        });

        if (channelUser) {
            throw new BadRequestException('User is already part of this channel');
        }

        await this.prisma.channelUser.create({
            data: {
                userId: user.id,
                channelId: channelId,
            },
        });
    }

    async leaveChannel(channelId: number, user: any) {
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId }
        });

        if (!channel) {
            throw new NotFoundException(`Channel with ID ${channelId} not found`);
        }

        if (channel.type == 'DM') {
            throw new ForbiddenException(`Cannot leave a DM`);
        }

        const channelUsers = await this.prisma.channelUser.findMany({
            where: { channelId: channelId }
        });

        // if the user is the owner
        if (channel.ownerId === user.id) {
            if (channelUsers.length > 1) {
                // Assign new owner
                const newOwner = channelUsers.find(u => u.userId !== user.id);
                await this.prisma.channel.update({
                    where: { id: channelId },
                    data: { ownerId: newOwner.userId }
                });
            } else {
                // Delete the channel
                await this.prisma.channel.delete({ where: { id: channelId } });
                return;
            }
        }

        // Remove user from channel
        await this.prisma.channelUser.delete({
            where: { userId_channelId: { channelId: channelId, userId: user.id } }
        });

        // Delete the channel if no users left
        if (channelUsers.length === 1) {
            await this.prisma.channel.delete({ where: { id: channelId } });
        }
    }

    async muteUser(channelId: number, userId: number) {
        const channelUser = await this.prisma.channelUser.findUnique({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: userId
                }
            }
        });

        if (!channelUser) {
            throw new NotFoundException('User is not part of this channel');
        }

        // Mute the user
        await this.prisma.channelUser.update({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: userId
                }
            },
            data: {
                isMuted: true,
            },
        });
    }

    async makeAdmin(channelId: number, userId: number) {
        const channelUser = await this.prisma.channelUser.findUnique({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: userId
                }
            }
        });

        if (!channelUser) {
            throw new NotFoundException('User is not part of this channel');
        }

        // Make the user an admin
        await this.prisma.channelUser.update({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: userId
                }
            },
            data: {
                isAdmin: true,
            },
        });
    }

    // Demote admins back to normal users
    async demoteAdmin(actingUserId: number, channelId: number, targetUserId: number) {
        const actingUserInChannel = await this.prisma.channelUser.findUnique({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: actingUserId
                }
            }
        });

        if (!actingUserInChannel || !actingUserInChannel.isAdmin) {
            throw new ForbiddenException('You do not have permission to demote this user');
        }

        const channelUser = await this.prisma.channelUser.findUnique({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: targetUserId
                }
            }
        });

        if (!channelUser) {
            throw new NotFoundException('User is not part of this channel');
        }

        // Demote the user
        await this.prisma.channelUser.update({
            where: {
                userId_channelId: {
                    channelId: channelId,
                    userId: targetUserId
                }
            },
            data: {
                isAdmin: false
            }
        });
    }

    // Owner can delete a channel
    async deleteChannel(channelId: number, user: any) {
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: channelId,
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        if (channel.ownerId !== user.id) {
            throw new ForbiddenException('Only the channel owner can delete the channel');
        }

        // Delete all ChannelUsers associated with the channel
        await this.prisma.channelUser.deleteMany({
            where: {
                channelId: channelId,
            },
        });

        await this.prisma.channel.delete({
            where: {
                id: channelId,
            },
        });
    }
}
