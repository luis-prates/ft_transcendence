import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
	public userIdToGameSocketId: Map<number, string> = new Map<number, string>();
	public gameSocketMap: Map<string, Socket> = new Map<string, Socket>();
}
