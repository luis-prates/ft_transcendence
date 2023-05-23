import { Player } from '../lobby';
import { Ball } from './Ball';
import { Player_Pong } from './PlayerPong';
import { Socket } from 'socket.io';
import { type gameRequest, type playerInfo } from './SocketInterface';

export enum Status {
	Waiting,
	Starting,
	InGame,
	Finish,
}

const infoBot: playerInfo = {
	objectId: '',
	nickname: 'marvin',
	avatar: 'marvin',
	color: 'grey',
	skinPlayer: '',
};

export class Game {
	games: Game[];
	width: number = 1000;
	height: number = 522;
	status: number = Status.Waiting;
	ball: Ball;
	player1: Player_Pong;
	player2: Player_Pong;
	maxPoint = 3;
	watchers: Player[] = [];
	data: gameRequest;
	bot: boolean = false;
	onRemove: Function = () => {};

	constructor(gameResquest: gameRequest, games: Game[], onRemove: Function) {
		this.games = games;
		this.data = gameResquest;
		this.maxPoint = gameResquest.maxScore;
		this.ball = new Ball(this);
		this.bot = gameResquest.bot ? gameResquest.bot : this.bot;
	}
	removeGame() {
		const index = this.games.findIndex((g) => g.data.objectId == this.data.objectId);
		if (index !== -1) {
			this.games.splice(index, 1);
			console.log('Game is removed!');
		}
		this.onRemove();
	}
	//Game Loop 1000 milesecond (1second) for 60 fps
	gameLoop() {
		if (!this.isEndGame() && this.status == Status.InGame) {
			this.ball.update();
			this.player1.update();
			this.player2.update();
		}
		setTimeout(() => {
			this.gameLoop();
		}, 1000 / 60);
	}

	emitStartGame() {
		this.player1.socket.emit('start_game', {
			player: 1,
			status: Status.Starting,
			nickname1: this.player1.nickname,
			avatar1: this.player1.avatar,
			color1: this.player1.color,
			skin1: this.player1.skin,
			nickname2: this.player2.nickname,
			avatar2: this.player2.avatar,
			color2: this.player2.color,
			skin2: this.player2.skin,
		});
		if (this.bot == false) {
			this.player2.socket.emit('start_game', {
				player: 2,
				status: Status.Starting,
				nickname1: this.player1.nickname,
				avatar1: this.player1.avatar,
				color1: this.player1.color,
				skin1: this.player1.skin,
				nickname2: this.player2.nickname,
				avatar2: this.player2.avatar,
				color2: this.player2.color,
				skin2: this.player2.skin,
			});
		}
		console.log('emit_start_game');
		this.startGame();
		this.gameLoop();
	}

	//Create Players and Watchers
	addUsers(user: Player, playerInfo?: playerInfo) {
		// DATA BASE VERIFICATION

		if (!this.player1) {
			this.player1 = new Player_Pong(this, 1, user, playerInfo);
			//console.log('player1 connect', playerInfo);
			if (this.bot == true) {
				this.player2 = new Player_Pong(this, 3, user, infoBot);
				this.emitStartGame();
			}
		} else if (!this.player2) {
			this.player2 = new Player_Pong(this, 2, user, playerInfo);
			console.log('player2 connect', playerInfo);
			this.emitStartGame();
		} else if (!this.watchers.includes(user)) {
			this.watchers.push(user);
			user.emit('start_game', {
				//Game
				status: this.status,
				nickname1: this.player1.nickname,
				avatar1: this.player1.avatar,
				color1: this.player1.color,
				skin1: this.player1.skin,
				nickname2: this.player2.nickname,
				avatar2: this.player2.avatar,
				color2: this.player2.color,
				skin2: this.player2.skin,
			});
		}
		//console.log("p1: ", this.player1, " p2: ", this.player2, " ws: ", this.whatchers);
	}
	//Begin the Game
	startGame() {
		if (this.status != Status.Finish) this.countdown(4);
	}
	//When one of the Players make a Point
	makePoint(playerNumber: number) {
		this.emitAll('game_update_point', { objectId: this.data.objectId, playerNumber: playerNumber, score: playerNumber == 1 ? this.player1.score : this.player2.score });

		if (this.isEndGame()) this.endGame(playerNumber);
		else {
			this.updateStatus(Status.Starting);
			this.startGame();
		}
		//console.log('1: ', this.player1.score, ' 2:', this.player2.score);
	}
	//End Game
	endGame(player_n: number) {
		if ((player_n == 1 || player_n == 2) && this.status != Status.Finish) {
			this.updateStatus(Status.Finish);
			if (player_n === 1) {
				this.player1.socket.emit('end_game', {
					objectId: this.data.objectId,
					result: 'You Win!',
				});
				if (this.player2 && this.bot == false) {
					this.player2.socket.emit('end_game', {
						objectId: this.data.objectId,
						result: 'You Lose!',
					});
				}
				this.emitWatchers('end_game', {
					objectId: this.data.objectId,
					result: this.player1.nickname + ' Win!',
				});
			} else if (player_n === 2) {
				this.player1.socket.emit('end_game', {
					objectId: this.data.objectId,
					result: 'You Lose!',
				});
				if (this.player2 && this.bot == false) {
					this.player2.socket.emit('end_game', {
						objectId: this.data.objectId,
						result: 'You Win!',
					});
				}
				this.emitWatchers('end_game', {
					objectId: this.data.objectId,
					result: this.player2.nickname + ' Win!',
				});
			}
			//INSERT IN DATABASE
			this.removeGame();
		}
	}
	//Update Status and Emit for ALL
	updateStatus(status: number) {
		if (this.status != status) {
			this.status = status;
			this.emitAll('game_update_status', status);
			console.log('Status: ', this.status);
		}
	}
	//Make the Countdown and Emit for ALL
	countdown(seconds: number) {
		console.log(seconds);

		if (seconds > 0) {
			this.emitAll('game_counting', seconds);

			setTimeout(() => {
				this.countdown(seconds - 1);
			}, 1000);
		} else {
			this.updateStatus(Status.InGame);
			this.emitAll('game_counting', 0);
		}
	}
	//Verific if the game is Ending
	isEndGame() {
		if (this.player1.score >= this.maxPoint || this.player2.score >= this.maxPoint) return true;
		return false;
	}

	//Emit for Players
	emitPlayers(event: string, data: any): void {
		if (this.player1) this.player1.socket.emit(event, data);
		if (this.player2 && !this.bot) this.player2.socket.emit(event, data);
	}
	//Emit for Watchers
	emitWatchers(event: string, data: any): void {
		this.watchers.forEach((clientSocket) => {
			if (clientSocket.socket.id !== this.player1.socket.socket.id || clientSocket.socket.id !== this.player2.socket.socket.id) clientSocket.emit(event, data);
		});
	}
	//Emit for Players and Watchers
	emitAll(event: string, data: any): void {
		this.emitPlayers(event, data);
		this.emitWatchers(event, data);
	}
}
