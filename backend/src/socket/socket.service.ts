import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
	public playerIdToSocketId: Map<number, string> = new Map<number, string>();
	public gameIdToPlayerId: Map<string, number[]> = new Map<string, number[]>();
	public gameIdToWatcherId: Map<string, number[]> = new Map<string, number[]>();
	public gameSocketMap: Map<string, Socket> = new Map<string, Socket>();
}
