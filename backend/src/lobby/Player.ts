import { Socket } from 'socket.io';
import Lobby from './Lobby';
import { GameMap } from './Map';

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
	map: {
		current: GameMap | null;
		preveiw: GameMap | null;
		position_preveiw: { x: number; y: number };
	} = { current: null, preveiw: null, position_preveiw: { x: 0, y: 0 } };
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
		this.socket = socket;
		this.data.objectId = objectId;
		this.time = Date.now();
	}

	get objectId(): number {
		return this.data.objectId;
	}

	get socket(): Socket {
		return this._socket;
	}

	set socket(value: Socket) {
		this.time = 0;
		value.on('disconnect', () => {
			this.time = Date.now();
			setTimeout(() => {
				console.log('disconnect: ' + this.objectId);
				if (this.time && this.map.current) {
					this.map.current.removePlayer(this);
					this.map.current.emitAll('remove_gameobject', this.data);
				}
			}, 30000);
		});
		this._socket = value;
	}

	public emit(event: string, data: any): void {
		this._socket.emit(event, data);
	}

	public on(event: string, callback: (...args: any[]) => void): void {
		this._socket.on(event, callback);
	}
}
