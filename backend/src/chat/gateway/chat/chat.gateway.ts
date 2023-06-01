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
import { JwtGuard } from 'src/auth/guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway(3001, {namespace: 'chat', cors: {origin: 'https://hoppscotch.io'}})
export class ChatGateway implements OnGatewayConnection {
    constructor(private chatService: ChatService) {}

    @WebSocketServer()
    server: Server;

    afterInit() {
        console.log('Chat Gateway Initialized!');
    }

    // Example of request: ws://localhost:3001/chat?userId=1
    async handleConnection(client: Socket, ...args: any[]) {
        // Extract variables from the handshake
        const { query } = client.handshake;
        console.log(`Client connected on /chat namespace with:
            socketId: ${client.id}
            userId: ${query.userId}
        `);

        // associate the socketId with the userId
        client.data.userId = Number(query.userId);

        // Enter the user in the channels he belongs in
        const userChannels = await this.chatService.getUserChannels(Number(query.userId));
        for (let channelId of userChannels) {
            client.join(`channel-${channelId}`);
            console.log(`Client joined channel-${channelId}`);
        }
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client disconnected : ${client.id}`);
        const connectedRooms = Object.keys(client.rooms);
        connectedRooms.forEach((room) => client.leave(room));
    }

    @SubscribeMessage('message')
    async handleMessage(client: Socket, payload: string): Promise<WsResponse<any>> {
        let parsedPayload;
        let senderId : number = client.data.userId;
        let message : string;
        let channelId : number;

        // First check if the payload is valid
        try {
            parsedPayload = JSON.parse(payload);
            channelId = Number(parsedPayload.channelId);
            message = parsedPayload.message;
        } catch (error) {
            console.error("Failed to parse payload or extract required parameters.", error);
            client.emit('error', { message: 'Invalid message format.' });
            return { event: 'error', data: 'Invalid message format.' };
        }

        // Next, check if the user is allowed to send a message in the channel
        const userChannels = await this.chatService.getUserChannels(Number(senderId));

        if (!userChannels.includes(channelId)) {
            console.error(`User ${senderId} is not allowed to send a message in channel ${channelId}.`);
            client.emit('error', { message: 'You are not allowed to send a message in this channel.' });
            return { event: 'error', data: 'You are not allowed to send a message in this channel.' };
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