import { Player } from '../lobby';
import { Ball } from './Ball';
import { Player_Pong } from './PlayerPong';
import { type gameRequest, type playerInfo } from './SocketInterface';

export enum Status {
	Waiting,
	Starting,
	InGame,
	Finish,
}

const infoBot: playerInfo = {
	objectId: '',
	nickname: 'Marvin',
	avatar: 'marvin',
	color: '#12bab9',
	skin: '42Lisboa',
};

export class Game {
	games: Game[];
	width = 1000;
	height = 522;
	status: number = Status.Waiting;
	ball: Ball;
	player1: Player_Pong | null = null;
	player2: Player_Pong | null = null;
	maxPoint = 3;
	watchers: Player[] = [];
	data: gameRequest;
	bot = false;
	onRemove: Function = () => {};

	//Loop
	private readonly FRAME_RATE: number = 60; // desired frame rate, e.g., 60 FPS
	private readonly FRAME_DURATION: number = 1000 / this.FRAME_RATE; // duration of a frame in ms
	private lastFrameTime: [number, number] = process.hrtime();

	constructor(gameResquest: gameRequest, onRemove: Function) {
		this.data = gameResquest;
		this.maxPoint = gameResquest.maxScore;
		this.ball = new Ball(this);
		this.bot = gameResquest.bot ? gameResquest.bot : this.bot;
		this.onRemove = onRemove;
	}

	//Game Loop 1000 milesecond (1second) for 60 fps
	gameLoop() {
		// Calculate elapsed time in milliseconds
		const currentTime = process.hrtime();
		const diffTime = process.hrtime(this.lastFrameTime);
		const elapsedTime = diffTime[0] * 1e3 + diffTime[1] * 1e-6;

		// If the elapsed time is greater than frame duration, update the game state
		if (elapsedTime >= this.FRAME_DURATION) {
			if (!this.isEndGame()) {
				if (this.status == Status.InGame) {
					this.ball.update();
				}
				if (this.player1) {
					this.player1.update();
				}
				if (this.player2) {
					this.player2.update();
				}
			}
			// update the last frame time
			this.lastFrameTime = currentTime;
		}
		// Schedule the next game loop
		setImmediate(() => {
			if (!this.isEndGame()) {
				this.gameLoop();
			}
		});
	}

	emitStartGame() {
		this.player1.socket.emit('start_game', {
			player: 1,
			status: Status.Starting,
			data: this.data,
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
				data: this.data,
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

		if (this.player1 == null) {
			this.player1 = new Player_Pong(this, 1, user, playerInfo);
			//console.log('player1 connect', playerInfo);
			if (this.bot == true) {
				this.player2 = new Player_Pong(this, 3, user, infoBot);
				this.emitStartGame();
			}
		} else if (this.player2 == null) {
			this.player2 = new Player_Pong(this, 2, user, playerInfo);
			//console.log('player2 connect', playerInfo);
			this.emitStartGame();
		} else if (!this.watchers.includes(user)) {
			this.watchers.push(user);
			user.emit('start_game', {
				//Game
				status: this.status,
				data: this.data,
				nickname1: this.player1.nickname,
				avatar1: this.player1.avatar,
				color1: this.player1.color,
				skin1: this.player1.skin,
				nickname2: this.player2.nickname,
				avatar2: this.player2.avatar,
				color2: this.player2.color,
				skin2: this.player2.skin,
			});
			this.emitAll('game_view', this.watchers.length);
		}
		//console.log("p1: ", this.player1, " p2: ", this.player2, " ws: ", this.whatchers);
	}
	//Begin the Game
	startGame() {
		if (this.status != Status.Finish) {
			this.countdown(4);
		}
	}
	//When one of the Players make a Point
	makePoint(playerNumber: number) {
		this.player1.reset_keys();
		this.player2.reset_keys();
		this.emitAll('game_update_point', {
			objectId: this.data.objectId,
			playerNumber: playerNumber,
			score: playerNumber == 1 ? this.player1.score : this.player2.score,
		});

		if (this.isEndGame()) {
			this.endGame(playerNumber);
		} else {
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
					exp: 0,
					max_exp: this.maxPoint * (this.bot ? 50 : this.player2.score == 0 ? 150 : 100),
					money: 0,
					max_money: this.maxPoint * (this.bot ? 2 : this.player2.score == 0 ? 5 : 3),
					watchers: 0,
					max_watchers: this.watchers.length,
				});
				if (this.player2 && this.bot == false) {
					this.player2.socket.emit('end_game', {
						objectId: this.data.objectId,
						result: 'You Lose!',
						exp: 0,
						max_exp: this.player2.score == 0 ? 10 : this.player2.score * (this.bot ? 10 : 20),
						money: 0,
						max_money: this.player2.score == 0 ? 1 : this.player2.score * (this.bot ? 1 : 2),
						watchers: 0,
						max_watchers: this.watchers.length,
					});
				}
				this.emitWatchers('end_game', {
					objectId: this.data.objectId,
					result: this.player1.nickname + ' Win!',
					exp: 0,
					max_exp: 0,
					money: 0,
					max_money: 0,
					watchers: 0,
					max_watchers: 0,
				});
			} else if (player_n === 2) {
				this.player1.socket.emit('end_game', {
					objectId: this.data.objectId,
					result: 'You Lose!',
					exp: 0,
					max_exp: this.player1.score == 0 ? 10 : this.player1.score * (this.bot ? 10 : 20),
					money: 0,
					max_money: this.player1.score == 0 ? 1 : this.player1.score * (this.bot ? 1 : 2),
					watchers: 0,
					max_watchers: this.watchers.length,
				});
				if (this.player2 && this.bot == false) {
					this.player2.socket.emit('end_game', {
						objectId: this.data.objectId,
						result: 'You Win!',
						exp: 0,
						max_exp: this.maxPoint * (this.bot ? 50 : this.player1.score == 0 ? 150 : 100),
						money: 0,
						max_money: this.maxPoint * (this.bot ? 2 : this.player1.score == 0 ? 5 : 3),
						watchers: 0,
						max_watchers: this.watchers.length,
					});
				}
				this.emitWatchers('end_game', {
					objectId: this.data.objectId,
					result: this.player2.nickname + ' Win!',
					exp: 0,
					max_exp: 0,
					money: 0,
					max_money: 0,
					watchers: 0,
					max_watchers: 0,
				});
			}
			//INSERT IN DATABASE
			this.player1?.socket.off('game_move');
			if (this.player2 != null && this.bot == false) {
				this.player2?.socket.off('game_move');
			}
			this.watchers.forEach(watcher => watcher.off('game_move'));
			this.onRemove();
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
		if (this.player1.score >= this.maxPoint || this.player2.score >= this.maxPoint) {
			return true;
		}
		return false;
	}

	//Emit for Players
	emitPlayers(event: string, data: any): void {
		if (this.player1) {
			this.player1.socket.emit(event, data);
		}
		if (this.player2 && !this.bot) {
			this.player2.socket.emit(event, data);
		}
	}
	//Emit for Watchers
	emitWatchers(event: string, data: any): void {
		if (this.watchers.length <= 0) {
			return;
		}
		this.watchers.forEach(clientSocket => {
			if (clientSocket.id !== this.player1.socket.id || clientSocket.id !== this.player2.socket.id) {
				clientSocket.emit(event, data);
			}
		});
	}
	//Emit for Players and Watchers
	emitAll(event: string, data: any): void {
		this.emitPlayers(event, data);
		this.emitWatchers(event, data);
	}

	entry_game(player: Player, info: playerInfo) {
		if (this.player1 == null || (this.player2 == null && this.bot == false)) {
			player.on('game_move', (e: any) => this.game_move(e));
		}
		this.addUsers(player, info);
		console.log(this.games);
	}

	private game_move(e: any) {
		if (this.status == Status.InGame) {
			if (e.playerNumber == 1) {
				if (e.move == 'up') {
					this.player1.up = e.key != this.player1.up ? e.key : this.player1.up;
				} else if (e.move == 'down') {
					this.player1.down = e.key != this.player1.down ? e.key : this.player1.down;
				}
			} else if (e.playerNumber == 2) {
				if (e.move == 'up') {
					this.player2.up = e.key != this.player2.up ? e.key : this.player2.up;
				} else if (e.move == 'down') {
					this.player2.down = e.key != this.player2.down ? e.key : this.player2.down;
				}
			}
		}
	}
}
