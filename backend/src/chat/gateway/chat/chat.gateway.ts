/* eslint-disable prettier/prettier */
import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	WsResponse,
} from '@nestjs/websockets';
import { ChatService } from '../../chat.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
	private userIdToSocketMap: Map<number, Socket> = new Map<number, Socket>();
	private channelIdToUserIds: Map<number, Set<number>> = new Map<number, Set<number>>();
	private readonly logger = new Logger(ChatGateway.name);
	constructor(private chatService: ChatService) {}

	@WebSocketServer()
	server: Server;

	afterInit() {
		// Setup all listeners for events coming from the chat service
		// event for a new channel being created
		this.chatService.events.on('channel-created', async newChannel => {
			const channelId = newChannel.id;

			// delete the hash and twoFASecret fields from the user objects
			for (const user of newChannel.users) {
				delete user.hash;
				delete user.twoFASecret;
			}

			// Send an event only to the users in the DM if it is a DM
			if (newChannel.type == 'DM') {
				const client1: Socket = this.userIdToSocketMap.get(newChannel.users[0].user.id);
				const client2: Socket = this.userIdToSocketMap.get(newChannel.users[1].user.id);

				if (client1) {
					client1.join(`channel-${channelId}`);
					let userIdsInChannel = this.channelIdToUserIds.get(channelId);
					if (!userIdsInChannel) {
						userIdsInChannel = new Set();
						this.channelIdToUserIds.set(channelId, userIdsInChannel);
					}
					userIdsInChannel.add(newChannel.users[0].user.id);
					client1.emit('channel-created', {
						newChannel,
						message: `DM ${channelId} between you and user ${newChannel.users[0].userId} has been created}`,
					});
					client1.join(`channel-${channelId}`);
					console.log(`User ${newChannel.users[0].user.id} joined a room: channel-${channelId}`);
				}

				if (client2) {
					client2.join(`channel-${channelId}`);
					let userIdsInChannel = this.channelIdToUserIds.get(channelId);
					if (!userIdsInChannel) {
						userIdsInChannel = new Set();
						this.channelIdToUserIds.set(channelId, userIdsInChannel);
					}
					userIdsInChannel.add(newChannel.users[1].user.id);
					client2.emit('channel-created', {
						newChannel,
						message: `DM ${channelId} between you and user ${newChannel.users[0].userId} has been created}`,
					});
					client2.join(`channel-${channelId}`);
					console.log(`User ${newChannel.users[1].user.id} joined a room: channel-${channelId}`);
				}
			} else {
				// Send a message to all users that a new channel has been created
				this.server.emit('channel-created', {
					newChannel,
					message: `Channel ${channelId} has been created`,
				});
				// loop over all users in the channel and join them to the channel
				for (const user of newChannel.users) {
					const client: Socket = this.userIdToSocketMap.get(user.user.id);
					if (!client) {
						// if socketId not found, client is not currently connected and doesnt need the websocket event
						continue;
					}
					client.join(`channel-${channelId}`);
					client.data.rooms.add(`channel-${channelId}`);
					console.log(`User ${user.user.id} joined a room: channel-${channelId}`);

					// New for blocklist: maintain the users to channels mapping
					// Update the channelIdToUserIds map
					let userIdsInChannel = this.channelIdToUserIds.get(channelId);
					if (!userIdsInChannel) {
						userIdsInChannel = new Set();
						this.channelIdToUserIds.set(channelId, userIdsInChannel);
					}
					userIdsInChannel.add(user.user.id);
				}
			}
		});

		// event for a channel being edited
		this.chatService.events.on('channel-edited', async editedChannel => {
			// Send a message to all users in the channel that a new channel has been added
			console.log('edited channel', editedChannel);
			const channelId = editedChannel.id;
			this.server.emit('channel-edited', {
				editedChannel,
				message: `Channel ${channelId} has been edited`,
			});
		});

		// event for a channel being deleted
		this.chatService.events.on('channel-deleted', async deletedChannel => {
			// Send a message to all users in the channel that a new channel has been added
			const channelId = deletedChannel.id;
			this.server.emit('channel-deleted', {
				deletedChannel,
				message: `Channel ${channelId} has been deleted`,
			});
		});

		// event for a user being added to a channel
		this.chatService.events.on('user-added-to-channel', async ({ channelId, userId, user }) => {
			const client: Socket = this.userIdToSocketMap.get(userId);

			// if a user was added to the global channel by the server, it means he doesnt have a socket yet
			// therefore, we need to send a message from the server instead of the client socket.
			const globalChannelId = await this.chatService.getGlobalChannelId();
			if (!client && channelId == globalChannelId) {
				delete user.hash;
				delete user.twoFASecret;
				this.server.to(`channel-${channelId}`).emit('user-added', {
					channelId,
					userId,
					user,
					message: `User ${userId} has been added to channel ${channelId}`,
				});
				return;
			}

			if (!client) {
				console.log('client not found');
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			client.join(`channel-${channelId}`);
			client.data.rooms.add(`channel-${channelId}`);
			console.log(`User ${userId} joined a room: channel-${channelId}`);

			// New for blocklist: maintain the users to channels mapping
			// Update the channelIdToUserIds map
			let userIdsInChannel = this.channelIdToUserIds.get(channelId);
			if (!userIdsInChannel) {
				userIdsInChannel = new Set();
				this.channelIdToUserIds.set(channelId, userIdsInChannel);
			}
			userIdsInChannel.add(userId);

			client.emit('channel-added', {
				channelId,
				message: `You have been added to channel ${channelId}`,
			});

			// remove the twoFASecret field from the user object
			delete user.twoFASecret;

			client.broadcast.to(`channel-${channelId}`).emit('user-added', {
				channelId,
				userId,
				user,
				message: `User ${userId} has been added to channel ${channelId}`,
			});
		});

		this.chatService.events.on('user-removed-from-channel', async ({ channelId, userId, user }) => {
			const client: Socket = this.userIdToSocketMap.get(userId);
			if (!client) {
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			delete user.twoFASecret;

			client.leave(`channel-${channelId}`);
			console.log(`User ${userId} left a room: channel-${channelId}`);

			// Update channelIdToUserIds map: remove user from channel
			const userIdsInChannel = this.channelIdToUserIds.get(channelId);
			if (userIdsInChannel) {
				userIdsInChannel.delete(userId);

				// If no more users in the channel, we can also delete the channel entry
				if (userIdsInChannel.size === 0) {
					this.channelIdToUserIds.delete(channelId);
				}
			}

			client.emit('channel-removed', {
				channelId,
				message: `You have been removed from channel ${channelId}`,
			});

			// Send a message to all users in the channel that a user has been removed
			client.broadcast.to(`channel-${channelId}`).emit('user-removed', {
				channelId,
				userId,
				user,
				message: `User ${userId} has left the channel ${channelId}`,
			});
		});

		this.chatService.events.on('user-muted-in-channel', async ({ channelId, userId }) => {
			const client: Socket = this.userIdToSocketMap.get(userId);
			if (!client) {
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			client.emit('user-muted', {
				channelId,
				message: `You have been muted in channel ${channelId}`,
			});

			// Send a message to all users in the channel that a user has been muted
			client.broadcast.to(`channel-${channelId}`).emit('user-muted', {
				channelId,
				userId,
				message: `User ${userId} has been muted in channel ${channelId}`,
			});
		});

		this.chatService.events.on('user-unmuted-in-channel', async ({ channelId, userId }) => {
			const client: Socket = this.userIdToSocketMap.get(userId);
			if (!client) {
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			client.emit('user-unmuted', {
				channelId,
				message: `You have been unmuted in channel ${channelId}`,
			});

			// Send a message to all users in the channel that a user has been unmuted
			client.broadcast.to(`channel-${channelId}`).emit('user-unmuted', {
				channelId,
				userId,
				message: `User ${userId} has been unmuted in channel ${channelId}`,
			});
		});

		this.chatService.events.on('user-promoted-in-channel', async ({ channelId, userId }) => {
			const client: Socket = this.userIdToSocketMap.get(userId);
			if (!client) {
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			client.emit('user-promoted', {
				channelId,
				message: `You have been promoted in channel ${channelId}`,
			});

			// Send a message to all users in the channel that a user has been promoted
			client.broadcast.to(`channel-${channelId}`).emit('user-promoted', {
				channelId,
				userId,
				message: `User ${userId} has been promoted in channel ${channelId}`,
			});
		});

		this.chatService.events.on('user-demoted-in-channel', async ({ channelId, userId }) => {
			const client: Socket = this.userIdToSocketMap.get(userId);
			if (!client) {
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			client.emit('user-demoted', {
				channelId,
				message: `You have been demoted in channel ${channelId}`,
			});

			// Send a message to all users in the channel that a user has been demoted
			client.broadcast.to(`channel-${channelId}`).emit('user-demoted', {
				channelId,
				userId,
				message: `User ${userId} has been demoted in channel ${channelId}`,
			});
		});

		// Listener for a user being promoted to owner
		this.chatService.events.on('user-promoted-to-owner-in-channel', async ({ channelId, userId }) => {
			const client: Socket = this.userIdToSocketMap.get(userId);
			if (!client) {
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			client.emit('user-promoted-to-owner', {
				channelId,
				message: `You have been promoted to owner in channel ${channelId}`,
			});

			// Send a message to all users in the channel that a user has been promoted to owner
			client.broadcast.to(`channel-${channelId}`).emit('user-promoted-to-owner', {
				channelId,
				userId,
				message: `User ${userId} has been promoted to owner in channel ${channelId}`,
			});
		});

		// Listener for a user being banned from a channel
		this.chatService.events.on('user-banned-in-channel', async data => {
			const { channelId, userId } = data;
			// Send a message to all users in the channel that a user has been banned
			this.server.emit('user-banned-in-channel', {
				channelId,
				userId,
				message: `User ${userId} has been banned from channel ${channelId}`,
			});

			// Remove the user from the channel
			const client: Socket = this.userIdToSocketMap.get(userId);
			if (!client) {
				// if socketId not found, client is not currently connected and doesnt need the websocket event
				return;
			}

			client.leave(`channel-${channelId}`);
			console.log(`User ${userId} left a room: channel-${channelId}`);

			// Update channelIdToUserIds map: remove user from channel
			const userIdsInChannel = this.channelIdToUserIds.get(channelId);
			if (userIdsInChannel) {
				userIdsInChannel.delete(userId);

				// If no more users in the channel, we can also delete the channel entry
				if (userIdsInChannel.size === 0) {
					this.channelIdToUserIds.delete(channelId);
				}
			}

			client.emit('channel-banned', {
				channelId,
				message: `You have been banned and removed from channel ${channelId}`,
			});

			// Send a message to all users in the channel that a user has been removed
			client.broadcast.to(`channel-${channelId}`).emit('user-banned', {
				channelId,
				userId,
				message: `User ${userId} has been banned and removed from channel ${channelId}`,
			});
		});

		// Listener for a user being unbanned from a channel
		this.chatService.events.on('user-unbanned-in-channel', async data => {
			const { channelId, userId } = data;
			// Send a message to all users in the channel that a user has been unbanned
			this.server.emit('user-unbanned-in-channel', {
				channelId,
				userId,
				message: `User ${userId} has been unbanned from channel ${channelId}`,
			});
		});

		console.log('Chat Gateway Initialized!');
	}

	// Example of request: ws://localhost:3001/chat?userId=1
	async handleConnection(client: Socket) {
		// Extract variables from the handshake
		const { query } = client.handshake;

		// TODO: check if the user exists. If not, disconnect the socket.

		console.log(`Client connected on /chat namespace with:
			socketId: ${client.id}
			userId: ${query.userId}
		`);

		// For channel-added updates, we need to keep track of the socket
		this.userIdToSocketMap.set(Number(query.userId), client);

		// associate the socketId with the userId
		const userId = Number(query.userId);
		client.data.userId = userId;

		// track the rooms the user is in
		client.data.rooms = new Set();
		// this.userIdToSocketId.set(userId, client.id);

		// Add the user to his own room for personal notifications and channel-added updates
		// client.join(`user-${client.data.userId}`);
		// client.data.rooms.add(`user-${client.data.userId}`);
		// console.log(`User ${userId} joined a room: user-${client.data.userId}`);

		// Enter the user in the channels he belongs in
		const userChannels = await this.chatService.getUserChannels(Number(query.userId));

		// New for blocklist: maintain the users to channels mapping
		for (const channelId of userChannels) {
			client.join(`channel-${channelId}`);
			client.data.rooms.add(`channel-${channelId}`);
			console.log(`Client joined channel-${channelId}`);

			// Update the channelIdToUserIds map
			let userIdsInChannel = this.channelIdToUserIds.get(channelId);
			if (!userIdsInChannel) {
				userIdsInChannel = new Set();
				this.channelIdToUserIds.set(channelId, userIdsInChannel);
			}
			userIdsInChannel.add(userId);
		}
		console.log('rooms: ', client.rooms);
	}

	async handleDisconnect(client: Socket) {
		const userId: number = client.data.userId;
		this.userIdToSocketMap.delete(userId);
		const connectedRooms = [...client.data.rooms];
		// connectedRooms.forEach(room => client.leave(room));
		// Update the channelIdToUserIds map
		connectedRooms.forEach(room => {
			client.leave(room);
			const channelId = Number(room.split('-')[1]); // Assuming room names are in the format 'channel-{channelId}'
			const userIdsInChannel = this.channelIdToUserIds.get(channelId);
			// remove the disconnecting user from the userIdsInChannel set
			if (userIdsInChannel) {
				userIdsInChannel.delete(userId);
				if (userIdsInChannel.size === 0) {
					this.channelIdToUserIds.delete(channelId);
				}
			}
			console.log('userIdsInChannel test2', userIdsInChannel);
		});
		this.logger.log(`Client disconnected : ${client.id}`);
	}

	@SubscribeMessage('message')
	async handleMessage(client: Socket, payload: any): Promise<WsResponse<any>> {
		const senderId: number = client.data.userId;
		let message: string;
		let channelId: number;

		// First check if the payload is valid
		try {
			// in case the request was sent as raw string, we need to parse it
			if (typeof payload == 'string') {
				payload = JSON.parse(payload);
			}
			channelId = Number(payload.channelId);
			message = payload.message;
		} catch (error) {
			// console.error("Failed to parse payload or extract required parameters.", error);
			return { event: 'error', data: 'Invalid message format.' };
		}

		// Next, check if the user is allowed to send a message in the channel
		const userChannels = await this.chatService.getUserChannels(Number(senderId));

		if (!userChannels.includes(channelId)) {
			// console.error(`User ${senderId} is not allowed to send a message in channel ${channelId}.`);
			return {
				event: 'unauthorized',
				data: 'You are not allowed to send a message in this channel.',
			};
		}
		// if user is muted, he cannot send messages
		const isMuted = await this.chatService.isUserMutedInChannel(senderId, channelId);
		if (isMuted) {
			// note: giving any error event, disconnects hoppscotch, so be careful
			// console.error(`User ${senderId} is muted in channel ${channelId}.`);
			return {
				event: 'muted-message',
				data: 'You are muted in this channel.',
			};
		}

		// Finally, try to store the message and emit it to others in the channel
		try {
			const newMessage = await this.chatService.createMessage(senderId, message, channelId);

			// Iterate over all connected clients and emit the message only to those
			// who have not blocked the sender
			// Speed here could probably be improved
			const userIdsInChannel = this.channelIdToUserIds.get(channelId);
			if (userIdsInChannel) {
				for (const userId of userIdsInChannel) {
					if (!(await this.chatService.isUserBlocked(senderId, userId))) {
						console.log('UserId: ' + userId + 'received a message: ' + message);
						const socket = this.userIdToSocketMap.get(userId);
						socket?.emit('message', {
							channelId: channelId,
							senderId: senderId,
							message: message,
						});
					} else {
						console.log(
							'userId: ' +
								userId +
								' has blocked senderId: ' +
								senderId +
								' and does not receive the message',
						);
					}
				}
			}
		} catch (error) {
			console.error('Failed to store the message.', error);
			// client.emit('error', { message: 'There was an error sending your message.' });
			return {
				event: 'send-failure',
				data: 'There was an error sending your message.',
			};
		}
	}
}
