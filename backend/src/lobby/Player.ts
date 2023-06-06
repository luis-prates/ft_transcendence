import { Lobby } from './Lobby';
import { GameMap } from './GameMap';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
export interface PathNode {
	x: number;
	y: number;
	direction: number;
}

export interface PlayerData {
	className: string;
	name: string;
	objectId: number;
	x: number;
	y: number;
	animation: { name: string; isStop: boolean };
}

export class Player {
	private _socket: Socket;
	avatar: string = '';
	name: string = 'name_' + Date.now();
	map: GameMap | null = null;
	data: PlayerData = {
		className: 'Character',
		name: '',
		objectId: 0,
		x: 64,
		y: 64,
		animation: { name: 'walk_bottom', isStop: true },
	};
	time: number = 0;
	private readonly logger = new Logger(Player.name);

	constructor(socket: Socket, objectId: number) {
		this.logger.debug('new player with objectId: ', objectId);
		this.setSocket(socket);
		this.data.objectId = objectId;
		this.time = Date.now();
	}

	get objectId(): number {
		return this.data.objectId;
	}

	getSocket(): Socket {
		return this._socket;
	}

	setSocket(value: Socket) {
		this.time = 0;
		value.on('disconnect', () => {
			this.time = Date.now();
			setTimeout(() => {
				console.log('disconnect: ' + this.objectId);
				if (this.time && this.map) {
					this.map.removePlayer(this);
					Lobby.players = Lobby.players.splice(Lobby.players.indexOf(this), 1);
				}
			}, 30000);
		});
		this._socket = value;
	}

	public get id(): string {
		return this._socket.id;
	}

	public emit(event: string, data: any): void {
		this._socket.emit(event, data);
	}

	public on(event: string, callback: (...args: any[]) => void): void {
		this._socket.on(event, callback);
	}

	public off(event: string): void {
		this._socket.off(event, () => {});
	}

	public offAll(): void {
		// this._socket.offAll();
	}

	public destroy(): void {
		this.offAll();
		this._socket.disconnect();
		Lobby.players = Lobby.players.splice(Lobby.players.indexOf(this), 1);
		this.map?.removePlayer(this);
	}
}
