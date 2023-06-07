import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse,
} from '@nestjs/websockets';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChatService } from '../../chat.service';
import { Namespace, Server, Socket } from 'socket.io';
import { JwtGuard } from '../../../auth/guard';
import { UseGuards } from '@nestjs/common';
import { TestLogger } from '../../../../test/utils/TestLogger';

// For testing purposes, we want to make sure Global channel always has ID = 1, so we sleep a bit the afterInit before it can go to testing
// function sleep(ms: number): Promise<void> {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

@WebSocketGateway(3001, {namespace: 'chat', cors: {origin: '*'}})
export class ChatGateway implements OnGatewayConnection {
    private userIdToSocketId: Map<number, string> = new Map<number, string>();
    private socketMap: Map<string, Socket> = new Map<string, Socket>;
    private readonly logger = new TestLogger(ChatGateway.name);
    constructor(private chatService: ChatService) {}

    @WebSocketServer()
    server: Server;

    afterInit() {
        // Setup all listeners for events coming from the chat service
        this.chatService.events.on('user-added-to-channel', async ({ channelId, userId }) => {
            const socketId : string = this.userIdToSocketId.get(userId);
            if (!socketId) {
                // if socketId not found, client is not currently connected and doesnt need the websocket event
                return;
            }

            const client: Socket = this.socketMap.get(socketId);
            if (!client) {
                this.logger.error(`No client socket found for socketId ${socketId}`);
                return;
            }

            client.join(`channel-${channelId}`);
            console.log(`Client joined channel-${channelId}`);
            client.emit('channel-added', { channelId, message: `You have been added to channel ${channelId}` });

            // Send a message to all users in the channel that a new user has been added
            client.broadcast.to(`channel-${channelId}`).emit('user-added', { channelId, userId, message: `User ${userId} has been added to channel ${channelId}` });
        });

        this.chatService.events.on('user-removed-from-channel', async ({ channelId, userId }) => {
            const socketId : string = this.userIdToSocketId.get(userId);
            if (!socketId) {
                // if socketId not found, client is not currently connected and doesnt need the websocket event
                return;
            }

            const client: Socket = this.socketMap.get(socketId);
            if (!client) {
                console.error(`No client socket found for socketId ${socketId}`);
                return;
            }

            client.leave(`channel-${channelId}`);
            console.log(`Client left channel-${channelId}`);
            client.emit('channel-removed', { channelId, message: `You have been removed from channel ${channelId}` });

            // Send a message to all users in the channel that a user has been removed
            client.broadcast.to(`channel-${channelId}`).emit('user-removed', { channelId, userId, message: `User ${userId} has left the channel ${channelId}` });
        });
        this.chatService.events.on('user-muted-in-channel', async ({ channelId, userId }) => {
            const socketId : string = this.userIdToSocketId.get(userId);
            if (!socketId) {
                // if socketId not found, client is not currently connected and doesnt need the websocket event
                return;
            }

            const client: Socket = this.socketMap.get(socketId);
            if (!client) {
                console.error(`No client socket found for socketId ${socketId}`);
                return;
            }

            client.emit('user-muted', { channelId, message: `You have been muted in channel ${channelId}` });

            // Send a message to all users in the channel that a user has been muted
            client.broadcast.to(`channel-${channelId}`).emit('user-muted', { channelId, userId, message: `User ${userId} has been muted in channel ${channelId}` });
        });

        // ONLY FOR TESTING: we sleep for 0.5 seconds to make sure the global channel is created before we start testing
        // sleep(1000);
        console.log('Chat Gateway Initialized!');
    }

    // Example of request: ws://localhost:3001/chat?userId=1
    async handleConnection(client: Socket, ...args: any[]) {
        // Extract variables from the handshake
        const { query } = client.handshake;

        // TODO: check if the user exists. If not, disconnect the socket.

        console.log(`Client connected on /chat namespace with:
            socketId: ${client.id}
            userId: ${query.userId}
        `);

        // For channel-added updates, we need to keep track of the socket
        this.socketMap.set(client.id, client);

        // associate the socketId with the userId
        const userId = Number(query.userId);
        client.data.userId = userId;
        this.userIdToSocketId.set(userId, client.id);

        // Add the user to his own room for personal notifications and channel-added updates
        client.join(`user-${client.data.userId}`);
        console.log(`Client joined user-${client.data.userId}`);

        // Enter the user in the channels he belongs in
        const userChannels = await this.chatService.getUserChannels(Number(query.userId));
        for (let channelId of userChannels) {
            client.join(`channel-${channelId}`);
            console.log(`Client joined channel-${channelId}`);
        }
    }

    async handleDisconnect(client: Socket) {
        const userId: number = client.data.userId;
        this.userIdToSocketId.delete(userId);
        this.logger.log(`Client disconnected : ${client.id}`);
        const connectedRooms = Object.keys(client.rooms);
        connectedRooms.forEach((room) => client.leave(room));
    }

    @SubscribeMessage('message')
    async handleMessage(client: Socket, payload: any): Promise<WsResponse<any>> {
        let senderId : number = client.data.userId;
        let message : string;
        let channelId : number;

        // First check if the payload is valid
        try {
            // in case the request was sent as raw string, we need to parse it
            console.log("Received message: ", payload);
            if (typeof payload == 'string') {
                payload = JSON.parse(payload);
            }
            console.log("Parsed payload: ", payload);
            channelId = Number(payload.channelId);
            console.log("channelId parsed: ", channelId);
            message = payload.message;
        } catch (error) {
            console.error("Failed to parse payload or extract required parameters.", error);
            client.emit('error', { message: 'Invalid message format.' });
            return { event: 'error', data: 'Invalid message format.' };
        }

        // Next, check if the user is allowed to send a message in the channel
        const userChannels = await this.chatService.getUserChannels(Number(senderId));
        console.log("channelId: ", channelId);
        console.log("User channels: ", userChannels);

        if (!userChannels.includes(channelId)) {
            console.error(`User ${senderId} is not allowed to send a message in channel ${channelId}.`);
            client.emit('error', { message: 'You are not allowed to send a message in this channel.' });
            return { event: 'error', data: 'You are not allowed to send a message in this channel.' };
        }

        // if user is muted, he cannot send messages
        const isMuted = await this.chatService.isUserMutedInChannel(senderId, channelId);
        if (isMuted) {
            console.error(`User ${senderId} is muted in channel ${channelId}.`);
            client.emit('error', { message: 'You are muted in this channel.' });
            return { event: 'error', data: 'You are muted in this channel.' };
        }

        // Finally, try to store the message and emit it to others in the channel
        try {
            const newMessage = await this.chatService.createMessage(senderId, message, channelId);

            client.to(`channel-${channelId}`).emit('message', { channelId: channelId, message: message });
            return { event: 'message', data: 'Message sent successfully.' };
        } catch (error) {
            console.error("Failed to store the message.", error);
            client.emit('error', { message: 'There was an error sending your message.' });
            return { event: 'error', data: 'There was an error sending your message.' };
        }
    }
}