import { SocketSingleton } from './Lobby';
import { Lobby } from './Lobby';
import { GameMap } from './GameMap';
import { Socket } from 'socket.io';
import { off } from 'process';

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
	private _socket: SocketSingleton;
	avatar: string = '';
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

	constructor(socket: Socket, objectId: number) {
		this.setSocket(new SocketSingleton(socket));
		this.data.objectId = objectId;
		this.time = Date.now();
		console.log('player created: ' + this.objectId);
		Lobby.players.push(this);
	}

	get objectId(): number {
		return this.data.objectId;
	}

	getSocket(): SocketSingleton {
		return this._socket;
	}

	setSocket(value: SocketSingleton) {
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
		this._socket.off(event);
	}

	public offAll(): void {
		// this._socket.offAll();
	}
}
