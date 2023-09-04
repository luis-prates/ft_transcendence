import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto, EditChannelDto, JoinChannelDto } from './dto';
import { ConflictException } from '@nestjs/common';
import { Channel, User, ChannelUser, Message } from '@prisma/client';
import { ChannelType } from '@prisma/client';
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
								status: true,
								image: true,
							},
						},
						isAdmin: true,
						isMuted: true,
					},
				},
				banList: true,
			},
		});
	}

	async getChannelsByUser(user: User): Promise<Channel[]> {
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

  async getMessagesByChannel(channelId: number, userId: number): Promise<Message[]> {

    // Get the list of users that the current user has blocked
    const blockedUsers = await this.prisma.blocklist.findMany({
      where: {
        blockerId: userId,
      },
      select: {
        blockedId: true
      }
    });

    // Extract the IDs of the blocked users
    const blockedUserIds = blockedUsers.map(b => b.blockedId);

    // Fetch messages from the channel excluding those from blocked users
    return this.prisma.message.findMany({
      where: {
        channelId: channelId,
        // Excluding messages from blocked users
        NOT: {
          userId: {
            in: blockedUserIds
          }
        }
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getMessagesByUser(user: User): Promise<Message[]> {
    // Fetch the user's channels.
    const userChannels = await this.prisma.channelUser.findMany({
      where: { userId: user.id },
      select: { channelId: true },
    });
    const channelIds = userChannels.map(channelUser => channelUser.channelId);

    // Fetch the list of users the current user has blocked.
    const blockedUsers = await this.prisma.blocklist.findMany({
      where: { blockerId: user.id },
      select: { blockedId: true },
    });
    const blockedUserIds = blockedUsers.map(block => block.blockedId);

    // Fetch messages from the user's channels excluding messages from blocked users.
    return this.prisma.message.findMany({
      where: {
        channelId: {
          in: channelIds,
        },
        userId: { // Exclude messages from blocked users.
          notIn: blockedUserIds,
        }
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

	async createChannel(createChannelDto: CreateChannelDto, user: User): Promise<Channel> {
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
						...(createChannelDto.avatar && { avatar: createChannelDto.avatar }),
					},
					include: {
						users: {
							select: {
								isAdmin: true,
								isMuted: true,
								user: {
									select: {
										id: true,
										image: true,
										nickname: true,
										status: true,
									},
								},
							},
						},
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
						users: {
							select: {
								isAdmin: true,
								isMuted: true,
								user: {
									select: {
										id: true,
										image: true,
										nickname: true,
										status: true,
									},
								},
							},
						},
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
					include: {
						users: {
							select: {
								isAdmin: true,
								isMuted: true,
								user: {
									select: {
										id: true,
										nickname: true,
										status: true,
										image: true,
									},
								},
							},
						},
					},
				});
			}

			// emit event to everyone that a new channel was just created
			this.events.emit('channel-created', newChannel);

			// emit event to creator for new channel
			// const user_db = await this.prisma.user.findUnique({
			// 	where: { id: user.id },
			// });

			// temporary disabled
			// this.events.emit('user-added-to-channel', {
			// 	channelId: newChannel.id,
			// 	userId: user.id,
			// 	user: user_db,
			// });

			// // emit event to all other users added to channel
			// for (user of createChannelDto.usersToAdd) {
			// 	this.events.emit('user-added-to-channel', {
			// 		channelId: newChannel.id,
			// 		userId: user,
			// 		user: user_db,
			// 	});
			// }
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

	async addUserToChannel(channelId: number, userId: number): Promise<ChannelUser> {
		const channel = await this.prisma.channel.findUnique({
			where: { id: channelId },
		});

		if (!channel) {
			throw new NotFoundException('Channel not found');
		}

		// send back error if they are already in the channel
		const channelUser = await this.prisma.channelUser.findUnique({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: userId,
				},
			},
		});

		if (channelUser) {
			throw new BadRequestException('User is already part of this channel');
		}

		// if user is banned from this channel
		const isBanned = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				banList: {
					some: {
						id: userId,
					},
				},
			},
		});

		if (isBanned) {
			throw new BadRequestException('Cannot add users who are banned from this channel');
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
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});
		this.events.emit('user-added-to-channel', { channelId, userId, user });

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

		const db_user = await this.prisma.user.findUnique({
			where: { id: removedUserId },
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
    // The owner can still kick admins.
    if (actingUserInChannel.isAdmin && actingUserId !== channel.ownerId) {
      if (removeUser.isAdmin) {
        throw new ForbiddenException('You do not have permission to remove this user');
      }
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
			user: db_user,
		});
	}

	async joinChannel(joinChannelDto: JoinChannelDto, channelId: number, user: User) {
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

		// if user is on the banlist
		const isBanned = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				banList: {
					some: {
						id: userId,
					},
				},
			},
		});

		if (isBanned) {
			throw new BadRequestException('You are banned from this channel');
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

		const user_db = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		// Emit an event when a user is added to a new channel
		this.events.emit('user-added-to-channel', { channelId, userId, user: user_db });
	}

	async leaveChannel(channelId: number, user: User) {
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

		// if the user is the owner and last member of the channel
		if (channel.ownerId === user.id) {
				throw new ForbiddenException('Owner can not leave a channel. Promote someone else to owner first.');
			}

		// Remove user from channel
		await this.prisma.channelUser.delete({
			where: {
				userId_channelId: { channelId: channelId, userId: user.id },
			},
		});

		// Delete the channel if no users left and it is not the global channel
    const globalChannel = await this.prisma.channel.findFirst({
      where: {
        name: 'global',
      },
    });

    if (channelUsers.length === 1 && channel.id !== globalChannel.id) {
      await this.prisma.message.deleteMany({
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

		// get data of user to inform channel
		const db_user = await this.prisma.user.findUnique({
			where: { id: user.id },
		});

		this.events.emit('user-removed-from-channel', {
			channelId,
			userId: user.id,
			user: db_user,
		});
	}

	async muteUser(channelId: number, userId: number, muteDuration: number) {
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

		// if user is already muted, throw error
		if (channelUser.isMuted) {
			throw new BadRequestException('User is already muted');
		}

		// if muted user is owner, throw error
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (channel.ownerId === userId) {
      throw new BadRequestException('Cannot mute the owner of the channel');
    }

		// If mute timer is over 1 day, throw error
		if (muteDuration > 1440) {
			throw new BadRequestException('Mute timer cannot be over 1 day (1440 minutes)');
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

		// Set the timeout to unmute the user
		setTimeout(async () => {
			// check if userId is still muted
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
				// no need to do anything if already unmuted
				return;
			}

			await this.unmuteUser(Number(channelId), Number(userId));
		}, muteDuration * 60 * 1000); // Convert minutes to milliseconds

		// emit event that user was muted
		this.events.emit('user-muted-in-channel', { channelId, userId, muteDuration });
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

	async makeOwner(channelId: number, userId: number) {
		const channel = await this.prisma.channel.findUnique({
			where: { id: channelId },
		});

		if (!channel) {
			throw new NotFoundException('Channel not found');
		}

		// check if user is in the channel
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

		// Make the channel owned by user
		await this.prisma.channel.update({
			where: { id: channelId },
			data: { ownerId: userId },
		});

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

		// emit an event someone was promoted to owner
		this.events.emit('user-promoted-to-owner-in-channel', { channelId, userId });
	}

	// Owner can edit a channel
	async editChannel(channelId: number, editChannelDto: EditChannelDto): Promise<Channel> {
		let channelType = editChannelDto.channelType;
		const name = editChannelDto.name;
		const avatar = editChannelDto.avatar;
		const password = editChannelDto.password;

		// Get the channel from prisma through the id
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
			},
		});

		// Use current channelType if not provided in request
		if (!channelType) {
			channelType = channel.type;
		}

		// Check if channel exists or if its name exists
		if (!channel) {
			throw new NotFoundException(`Channel with id ${channelId} does not exist.`);
		}

		if (name && name == channel.name) {
			throw new BadRequestException('This channel name is already in use.');
		}

		// Check if DM type is not allowed
		if (channelType == ChannelType.DM) {
			throw new BadRequestException('Invalid Channel Type');
		}

		// Check if user wants to remove password, then type should be Public and password should be empty
		if (channelType !== ChannelType.PUBLIC && channelType !== ChannelType.PRIVATE && !password) {
			throw new BadRequestException(
				'If you want to remove a password, the channel type must be Public and password must be empty.',
			);
		}

		// Check if user wants to change a password, then type should be Protected and password should not be empty
		if (password && channelType !== ChannelType.PROTECTED) {
			throw new BadRequestException(
				'If you want to change a password, the channel type must be Protected and a password must be entered.',
			);
		}

		// Check if user wants to add a password to a public channel, password should be provided and type should be protected
		if (channelType === ChannelType.PUBLIC && password) {
			throw new BadRequestException(
				'If you want to add a password to a public channel, the password must be provided and type must be Protected.',
			);
		}

		// If password is provided, hash it
		let hashedPassword = null;
		if (password) {
			const saltRounds = 10;
			hashedPassword = await bcrypt.hash(password, saltRounds);
		}

		const editedChannel = await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				...(name ? { name } : {}),
				...(avatar ? { avatar } : {}),
				...(hashedPassword ? { hash: hashedPassword } : {}),
				...(channelType ? { type: channelType } : {}),
			},
		});

		// emit an event that a channel was edited
		this.events.emit('channel-edited', editedChannel);

		return editedChannel;
	}

	// Owner can delete a channel
	async deleteChannel(channelId: number, user: User) {
		const toBeDeletedChannel = await this.prisma.channel.findUnique({
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

		if (!toBeDeletedChannel) {
			throw new NotFoundException('Channel not found');
		}

		if (toBeDeletedChannel.ownerId !== user.id) {
			throw new ForbiddenException('Only the channel owner can delete the channel');
		}

		// Delete all ChannelUsers associated with the channel
		await this.prisma.channelUser.deleteMany({
			where: {
				channelId: channelId,
			},
		});

		// Delete all messages associated with the channel
		await this.prisma.message.deleteMany({
			where: {
				channelId: channelId,
			},
		});

		await this.prisma.channel.delete({
			where: {
				id: channelId,
			},
		});

		const users = toBeDeletedChannel.users.map(cu => cu.user);

		// Emit events to all users when a channel is deleted
		this.events.emit('channel-deleted', toBeDeletedChannel);

		// Emit events to all channel users when a channel is deleted
		for (const user of users) {
			// get data of user to inform channel
			const db_user = await this.prisma.user.findUnique({
				where: { id: user.id },
			});

			this.events.emit('user-removed-from-channel', {
				channelId,
				userId: user.id,
				user: db_user,
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

	// Ban a user
	async banUser(channelId: number, bannedUserId: number, banningUser: any) {
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
			},
		});

		if (!channel) {
			throw new NotFoundException('Channel not found');
		}

		const bannedUser = await this.prisma.channelUser.findUnique({
      where: {
        userId_channelId: {
          channelId: channelId,
          userId: bannedUserId,
        },
      },
		});

		if (!bannedUser) {
			throw new NotFoundException('User not found');
		}

		// Check if user is already banned
		const isBanned = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				banList: {
					some: {
						id: bannedUserId,
					},
				},
			},
		});

		if (isBanned) {
			throw new BadRequestException('User is already banned');
		}

    // If user to be banned is owner, throw error
    if (channel.ownerId === bannedUserId) {
      throw new ForbiddenException('Cannot ban the owner of the channel');
    }

    // Admins can be banned only by the owner but not by other admins
    if (bannedUser.isAdmin && channel.ownerId !== banningUser.id) {
      throw new ForbiddenException('Cannot ban an admin unless your are owner');
    }

		// Remove the user from the channel
		await this.prisma.channelUser.delete({
			where: {
				userId_channelId: {
					channelId: channelId,
					userId: bannedUserId,
				},
			},
		});

		// Ban the user
		await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				banList: {
					connect: {
						id: bannedUserId,
					},
				},
			},
		});

		// emit an event someone was banned
		this.events.emit('user-banned-in-channel', {
			channelId,
			userId: bannedUserId,
		});
	}

	// Unban a user
	async unbanUser(channelId: number, userId: number) {
		const channel = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
			},
		});

		if (!channel) {
			throw new NotFoundException('Channel not found');
		}

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		// Check if user is already unbanned
		const isBanned = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				banList: {
					some: {
						id: userId,
					},
				},
			},
		});

		if (!isBanned) {
			throw new BadRequestException('User is not banned from this channel');
		}

		// Unban the user
		await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				banList: {
					disconnect: {
						id: userId,
					},
				},
			},
		});

		// emit an event someone was unbanned
		this.events.emit('user-unbanned-in-channel', {
			channelId,
			userId,
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

	async createMessage(senderId: number, message: string, channelId: number): Promise<Message> {
		return await this.prisma.message.create({
			data: {
				content: message,
				userId: senderId,
				channelId: channelId,
			},
		});
	}

	async isUserMutedInChannel(userId: number, channelId: number): Promise<boolean> {
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

	async getGlobalChannelId(): Promise<number> {
		const globalChannel = await this.prisma.channel.findFirst({
			where: {
				name: 'global',
			},
		});

		return globalChannel.id;
	}
}
