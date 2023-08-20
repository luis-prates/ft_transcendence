import { GameMap } from '../lobby/GameMap';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PlayerService } from './player.service';
export type PathNode = {
	x: number;
	y: number;
	direction: number;
};

export type PlayerData = {
	className: string;
	name: string;
	objectId: number;
	x: number;
	y: number;
	avatar: number;
	nickname: string;
	animation: { name: string; isStop: boolean };
};

// Is objectId supposed to be the user ID?
export class Player {
	private _lobbySocket: Socket;
	gameSocket: Socket | null = null;
	avatar = '';
	name: string = 'name_' + Date.now();
	map: GameMap | null = null;
	data: PlayerData = {
		className: 'Character',
		name: '',
		objectId: 0,
		x: 64,
		y: 64,
		avatar: 0,
		nickname: '',
		animation: { name: 'walk_bottom', isStop: true },
	};
	time = 0;
	private readonly logger = new Logger(Player.name);

	constructor(socket: Socket, payload: any, private playerService?: PlayerService) {
		console.log('new player with data:', payload);
		this.setSocket(socket);
		this.data.objectId = payload.objectId;
		this.data.avatar = payload.avatar;
		this.data.nickname = payload.nickname;
		this.time = Date.now();
	}

	get objectId(): number {
		return this.data.objectId;
	}

	getSocket(): Socket {
		return this._lobbySocket;
	}

	setSocket(value: Socket) {
		this.logger.debug(`setSocket: ${value.id}`);
		value.on('disconnect', () => {
			this.map?.removePlayer(this);
		});
		this._lobbySocket = value;
	}

	setGameSocket(value: Socket) {
		this.gameSocket = value;
	}

	getGameSocket(): Socket {
		return this.gameSocket;
	}

	public get id(): string {
		return this._lobbySocket.id;
	}

	public emitToLobby(event: string, data: any): void {
		this._lobbySocket?.emit(event, data);
	}

	public emitToGame(event: string, data: any): void {
		this.gameSocket?.emit(event, data);
	}

	public onLobby(event: string, callback: (...args: any[]) => void): void {
		this._lobbySocket?.on(event, callback);
	}

	public onGame(event: string, callback: (...args: any[]) => void): void {
		this.gameSocket?.on(event, callback);
	}

	public offLobby(event: string): void {
		this._lobbySocket?.off(event, () => {});
	}

	public offGame(event: string): void {
		this.gameSocket?.off(event, () => {});
	}

	public destroy(): void {
		this._lobbySocket?.disconnect();
		this.gameSocket?.disconnect();
		// this.playerService.players = Lobby.players.splice(Lobby.players.indexOf(this), 1);
		// this.playerService?.removePlayer(this);
		//! need to check this
		this.map?.removePlayer(this);
	}
}
