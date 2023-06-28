import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, JoinChannelDto } from './dto';
import { ConflictException } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { EventEmitter } from 'events';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
	public events: EventEmitter;

	constructor(private prisma: PrismaService) {
		this.events = new EventEmitter();
	}

	async getChannels(): Promise<Channel[]> {
		return this.prisma.channel.findMany({
			include: {
				users: {
					select: {
						user: {
							select: {
								id: true,
								nickname: true,
								image: true,
							},
						},
					},
				},
			},
		});
	}

	async getChannelsByUser(user: any) {
		return this.prisma.channel.findMany({
			where: {
				users: {
					some: {
						userId: user.id,
					},
				},
			},
		});
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

	async getMessagesByUser(user: any) {
		const userChannels = await this.prisma.channelUser.findMany({
			where: { userId: user.id },
			select: { channelId: true },
		});
		const channelIds = userChannels.map(channelUser => channelUser.channelId);
		return this.prisma.message.findMany({
			where: {
				channelId: {
					in: channelIds,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async createChannel(createChannelDto: CreateChannelDto, user: any) {
		let newChannel;

		if (
			createChannelDto.channelType !== 'DM' &&
			(typeof createChannelDto.name === 'undefined' ||
				createChannelDto.name === null ||
				createChannelDto.name === '')
		) {
			throw new BadRequestException('Channels that are not DMs must have a name.');
		}

		if (createChannelDto.channelType === 'PROTECTED' && !createChannelDto.password) {
			throw new BadRequestException('Protected channels must have a password.');
		}

		try {
			// Logic for public and private channels
			if (createChannelDto.channelType == 'PUBLIC' || createChannelDto.channelType == 'PRIVATE') {
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
										},
									},
									isAdmin: true,
								},
								...createChannelDto.usersToAdd.map(id => ({
									user: {
										connect: {
											id: id,
										},
									},
								})),
							],
						},
					},
					include: {
						users: true,
					},
				});
			}

			// Logic for protected channels
			if (createChannelDto.channelType == 'PROTECTED') {
				// Note: channel name has to be unique for open channels
				// add encryption here
				const saltRounds = 10;
				const hashedPassword = await bcrypt.hash(createChannelDto.password, saltRounds);

				newChannel = await this.prisma.channel.create({
					data: {
						name: createChannelDto.name,
						type: createChannelDto.channelType,
						ownerId: user.id,
						hash: hashedPassword,
						users: {
							create: [
								{
									user: {
										connect: {
											id: user.id,
										},
									},
									isAdmin: true,
								},
								...createChannelDto.usersToAdd.map(id => ({
									user: {
										connect: {
											id: id,
										},
									},
								})),
							],
						},
					},
					include: {
						users: true,
					},
				});
			}

			// Logic for DM
			if (createChannelDto.channelType == 'DM' && createChannelDto.usersToAdd.length !== 1) {
				throw new BadRequestException('DMs can only be created with one other user');
			}

			if (createChannelDto.channelType == 'DM') {
				// check if there already is a DM already between users
				const existingDM = await this.prisma.channel.findFirst({
					where: {
						AND: [
							{ type: 'DM' },
							{ users: { some: { userId: user.id } } },
							{
								users: {
									some: {
										userId: createChannelDto.usersToAdd[0],
									},
								},
							},
						],
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
										},
									},
								},
								...createChannelDto.usersToAdd.map(id => ({
									user: {
										connect: {
											id: id,
										},
									},
								})),
							],
						},
					},
				});
			}
			// emit event to creator for new channel
			this.events.emit('user-added-to-channel', {
				channelId: newChannel.id,
				userId: user.id,
			});
			// emit event to all other users added to channel
			for (user of createChannelDto.usersToAdd) {
				this.events.emit('user-added-to-channel', {
					channelId: newChannel.id,
					userId: user,
				});
			}
		} catch (error) {
			if (error.code === 'P2002') {
				throw new ConflictException('Channel already exists');
			} else if (error.code === 'P2025' && error.meta.cause.includes('User')) {
				throw new NotFoundException('User not found');
			} else if (error instanceof ConflictException || error instanceof BadRequestException) {
				throw error;
			} else {
				console.log('Error: ', error);
				throw new BadRequestException('Something went wrong');
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

		// Emit an event when a user is added to a new channel
		this.events.emit('user-added-to-channel', { channelId, userId });

		return newChannelUser;
	}

	async removeUserFromChannel(channelId: number, actingUserId: number, removedUserId: number) {
		const removeUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: removedUserId,
				},
			},
		});

		if (!removeUser) {
			throw new NotFoundException('User is not part of this channel');
		}

		const actingUserInChannel = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: actingUserId,
				},
			},
		});

		const channel = await this.prisma.channel.findUnique({
			where: { id: channelId },
		});

		// Prevent an admin from kicking another admin or the owner.
		if (actingUserInChannel.isAdmin && (removeUser.isAdmin || removedUserId === channel.ownerId)) {
			throw new ForbiddenException('You do not have permission to remove this user from the channel');
		}

		await this.prisma.channelUser.delete({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: removedUserId,
				},
			},
		});

		// emit an event that user left the channel
		this.events.emit('user-removed-from-channel', {
			channelId,
			userId: removedUserId,
		});
	}

	async joinChannel(joinChannelDto: JoinChannelDto, channelId: number, user: any) {
		const { password } = joinChannelDto;
		const userId = user.id;
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
			},
		});

		if (!channel) {
			throw new NotFoundException('Channel not found');
		}

		if (channel.type == 'PROTECTED') {
			const isMatch = await bcrypt.compare(password, channel.hash);
			if (!isMatch) {
				throw new BadRequestException('Password is incorrect');
			}
		}

		if (channel.type == 'PRIVATE') {
			throw new ForbiddenException('Cannot join a private channel without an invite');
		}

		const channelUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					userId: user.id,
					channelId: channelId,
				},
			},
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

		// Emit an event when a user is added to a new channel
		this.events.emit('user-added-to-channel', { channelId, userId });
	}

	async leaveChannel(channelId: number, user: any) {
		const channel = await this.prisma.channel.findUnique({
			where: { id: channelId },
		});

		if (!channel) {
			throw new NotFoundException(`Channel with ID ${channelId} not found`);
		}

		if (channel.type == 'DM') {
			throw new ForbiddenException(`Cannot leave a DM`);
		}

		const channelUsers = await this.prisma.channelUser.findMany({
			where: { channelId: channelId },
		});

		// if the user is the owner
		if (channel.ownerId === user.id) {
			if (channelUsers.length > 1) {
				// Assign new owner
				const newOwner = channelUsers.find(u => u.userId !== user.id);
				await this.prisma.channel.update({
					where: { id: channelId },
					data: { ownerId: newOwner.userId },
				});
			} else {
				// Delete the channel
				await this.prisma.channel.delete({ where: { id: channelId } });
				return;
			}
		}

		// Remove user from channel
		await this.prisma.channelUser.delete({
			where: {
				userId_channelId: { channelId: channelId, userId: user.id },
			},
		});

		// Delete the channel if no users left
		if (channelUsers.length === 1) {
			await this.prisma.channel.delete({ where: { id: channelId } });
		}

		this.events.emit('user-removed-from-channel', {
			channelId,
			userId: user.id,
		});
	}

	async muteUser(channelId: number, userId: number) {
		const channelUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
		});

		if (!channelUser) {
			throw new NotFoundException('User is not part of this channel');
		}

		// if muser is already muted, throw error
		if (channelUser.isMuted) {
			throw new BadRequestException('User is already muted');
		}

		// Mute the user
		await this.prisma.channelUser.update({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
			data: {
				isMuted: true,
			},
		});
		// emit event that user was muted
		this.events.emit('user-muted-in-channel', { channelId, userId });
	}

	async unmuteUser(channelId: number, userId: number) {
		const channelUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
		});

		if (!channelUser) {
			throw new NotFoundException('User is not part of this channel');
		}

		// if user is already unmuted, throw error
		if (!channelUser.isMuted) {
			throw new BadRequestException('User is already unmuted');
		}

		// Unmute the user
		await this.prisma.channelUser.update({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
			data: {
				isMuted: false,
			},
		});
		// emit event that user was unmuted
		this.events.emit('user-unmuted-in-channel', { channelId, userId });
	}

	async makeAdmin(channelId: number, userId: number) {
		const channelUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
		});

		if (!channelUser) {
			throw new NotFoundException('User is not part of this channel');
		}

		// Make the user an admin
		await this.prisma.channelUser.update({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
			data: {
				isAdmin: true,
			},
		});
		// emit an event someone was promoted to admin
		this.events.emit('user-promoted-in-channel', { channelId, userId });
	}

	// Demote admins back to normal users
	async demoteAdmin(actingUserId: number, channelId: number, targetUserId: number) {
		const actingUserInChannel = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: actingUserId,
				},
			},
		});

		if (!actingUserInChannel || !actingUserInChannel.isAdmin) {
			throw new ForbiddenException('You do not have permission to demote this user');
		}

		const channelUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: targetUserId,
				},
			},
		});

		if (!channelUser) {
			throw new NotFoundException('User is not part of this channel');
		}

		// Demote the user
		await this.prisma.channelUser.update({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: targetUserId,
				},
			},
			data: {
				isAdmin: false,
			},
		});

		// emit an event someone was demoted from admin
		this.events.emit('user-demoted-in-channel', {
			channelId,
			userId: targetUserId,
		});
	}

	// Owner can delete a channel
	async deleteChannel(channelId: number, user: any) {
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
			},
			include: {
				users: {
					select: {
						user: true,
					},
				},
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

		const users = channel.users.map(cu => cu.user);

		// Emit events to all users when a channel is deleted
		for (const user of users) {
			this.events.emit('user-removed-from-channel', {
				channelId,
				userId: user.id,
			});
		}
	}

	// Change password of a protected channel
	async changeChannelPassword(joinChannelDto: JoinChannelDto, channelId: number) {
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
			},
		});

		if (!channel) {
			throw new NotFoundException('Channel not found');
		}

		if (channel.type !== 'PROTECTED') {
			throw new BadRequestException('Channel is not protected');
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(joinChannelDto.password, saltRounds);

		await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				hash: hashedPassword,
			},
		});
	}

	// BELOW IS FOR WEBSOCKETS
	async getUserChannels(userId: number): Promise<number[]> {
		// Fetch the ChannelUser entities for this user
		const userChannels = await this.prisma.channelUser.findMany({
			where: { userId: userId },
			select: { channelId: true },
		});
		// Extract the channel IDs from the ChannelUser
		const channelIds = userChannels.map(channelUser => channelUser.channelId);
		return channelIds;
	}

	async createMessage(senderId: number, message: string, channelId: number) {
		return await this.prisma.message.create({
			data: {
				content: message,
				userId: senderId,
				channelId: channelId,
			},
		});
	}

	async isUserMutedInChannel(userId: number, channelId: number) {
		const channelUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
		});

		if (!channelUser) {
			throw new NotFoundException('User is not part of this channel');
		}

		return channelUser.isMuted;
	}

	async isUserBlocked(senderId: number, receiverId: number): Promise<boolean> {
		const blockRecord = await this.prisma.blocklist.findFirst({
			where: {
				AND: [{ blockerId: receiverId }, { blockedId: senderId }],
			},
		});

		return !!blockRecord;
	}
}
