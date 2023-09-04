import { Logger } from '@nestjs/common';
import { Ball } from './Ball';
import { Player_Pong } from './PlayerPong';
import { type gameRequest, type playerInfo } from '../../socket/SocketInterface';
import { GameService } from '../game.service';
import { UserService } from '../../user/user.service';
import { Server } from 'socket.io';
import { GameStatus } from '@prisma/client';
import { Player } from '../../player/Player';

export enum Status {
	Waiting,
	Starting,
	InGame,
	Finish,
}

export const infoBot: playerInfo = {
	objectId: '',
	userId: 6969,
	nickname: 'Marvin',
	avatar: 'marvin',
	color: '#12bab9',
	skin: '42Lisboa',
};

export class GameClass {
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
	onRemove: () => void;

	private readonly FRAME_RATE: number = 60; // desired frame rate, e.g., 60 FPS
	private readonly FRAME_DURATION: number = 1000 / this.FRAME_RATE; // duration of a frame in ms
	private lastFrameTime: [number, number] = process.hrtime();

	private readonly logger = new Logger(GameClass.name);
	private gameServer: Server;
	private gameService: GameService;
	private userService: UserService;

	constructor(gameResquest: gameRequest, gameService: GameService, userService: UserService, onRemove: () => void) {
		this.data = gameResquest;
		this.maxPoint = gameResquest.maxScore;
		this.ball = new Ball(this);
		this.bot = gameResquest.bot ? gameResquest.bot : this.bot;
		this.onRemove = onRemove;

		this.gameServer = gameService.getServer();
		this.gameService = gameService;

		this.userService = userService;
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
		this.gameService.updateGameStatus(this.data.objectId, GameStatus.IN_PROGESS);
		this.player1.socket?.emitToGame('start_game', {
			player: 1,
			status: Status.Starting,
			data: this.data,
			player1: {
				id: this.player1.userId,
				nickname: this.player1.nickname,
				avatar: this.player1.avatar,
				color: this.player1.color,
				skin: this.player1.skin,
			},
			player2: {
				id: this.player2.userId,
				nickname: this.player2.nickname,
				avatar: this.player2.avatar,
				color: this.player2.color,
				skin: this.player2.skin,
			},
		});
		if (this.bot == false) {
			this.player2.socket?.emitToGame('start_game', {
				player: 2,
				status: Status.Starting,
				data: this.data,
				player1: {
					id: this.player1.userId,
					nickname: this.player1.nickname,
					avatar: this.player1.avatar,
					color: this.player1.color,
					skin: this.player1.skin,
				},
				player2: {
					id: this.player2.userId,
					nickname: this.player2.nickname,
					avatar: this.player2.avatar,
					color: this.player2.color,
					skin: this.player2.skin,
				},
			});
		}
		console.log('emit_start_game');
		this.startGame();
		this.gameLoop();
	}

	//Create Players and Watchers
	addUsers(user: Player, isPlayer: boolean, playerInfo?: playerInfo) {
		if (isPlayer && this.player1 == null) {
			this.player1 = new Player_Pong(this, 1, user, playerInfo);
			//console.log('player1 connect', playerInfo);
			if (this.bot == true) {
				this.player2 = new Player_Pong(this, 3, user, infoBot);
				this.emitStartGame();
			}
		} else if (isPlayer && this.player2 == null) {
			this.player2 = new Player_Pong(this, 2, user, playerInfo);
			//console.log('player2 connect', playerInfo);
			this.emitStartGame();
		} else if (!this.watchers.includes(user)) {
			this.watchers.push(user);
			user.emitToGame('start_game', {
				status: Status.Starting,
				data: this.data,
				player1: {
					id: this.player1.userId,
					nickname: this.player1.nickname,
					avatar: this.player1.avatar,
					color: this.player1.color,
					skin: this.player1.skin,
				},
				player2: {
					id: this.player2.userId,
					nickname: this.player2.nickname,
					avatar: this.player2.avatar,
					color: this.player2.color,
					skin: this.player2.skin,
				},
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
	//! Send game stats to the client
	endGame(playerNumber: number) {
		if ((playerNumber == 1 || playerNumber == 2) && this.status != Status.Finish) {
			this.updateStatus(Status.Finish);

			this.logger.debug('Game End');

			if (playerNumber === 1) {
				this.updateGameStatsForWinner(this.player1, this.player2);
			} else if (playerNumber === 2) {
				this.updateGameStatsForWinner(this.player2, this.player1);
			}

			this.player1?.socket.offGame('game_move');
			if (this.player2 != null && this.bot == false) {
				this.player2?.socket.offGame('game_move');
			}
			this.watchers.forEach(watcher => watcher.offGame('game_move'));
			this.onRemove();
		}
	}

	disconnect(disconnectPlayerNumber: number) {
		if ((disconnectPlayerNumber == 1 || disconnectPlayerNumber == 2) && this.status != Status.Finish) {
			if (!this.player1 || !this.player2) {
				this.deleteGame();
			} else {
				this.emitAll('game_update_point', {
					objectId: this.data.objectId,
					disconnectPlayerNumber: disconnectPlayerNumber == 1 ? 2 : 1,
					score: this.maxPoint,
				});
				if (disconnectPlayerNumber == 1) {
					this.player2.score = this.maxPoint;
				} else if (disconnectPlayerNumber == 2) {
					this.player1.score = this.maxPoint;
				}
				this.endGame(disconnectPlayerNumber == 1 ? 2 : 1);
			}
		}
	}

	async deleteGame() {
		this.logger.debug(`Delete game ${this.data.objectId}`);
		await this.gameService.deleteGame(this.data.objectId);
	}

	private updateGameStatsForWinner(winner: Player_Pong, loser: Player_Pong) {
		const gameResults = {
			winnerId: winner.userId,
			winnerName: winner.nickname,
			winnerScore: winner.score,
			loserId: loser.userId,
			loserName: loser.nickname,
			loserScore: loser.score,
		};

		if (winner.player_n !== 3) {
			winner.socket.emitToGame('end_game', {
				objectId: this.data.objectId,
				result: 'You Win!',
				exp: this.maxPoint * (this.bot ? 50 : loser.score == 0 ? 150 : 100),
				money: this.maxPoint * (this.bot ? 2 : loser.score == 0 ? 5 : 3),
				watchers: this.watchers.length,
				gameResults,
			});
			this.updatePlayerStats(winner.userId, {
				xp: this.maxPoint * (this.bot ? 50 : loser.score == 0 ? 150 : 100),
				money: this.maxPoint * (this.bot ? 2 : loser.score == 0 ? 5 : 3),
			});
		}
		if (loser.player_n !== 3) {
			loser.socket.emitToGame('end_game', {
				objectId: this.data.objectId,
				result: 'You Lose!',
				exp: loser.score == 0 ? 10 : loser.score * (this.bot ? 10 : 20),
				money: loser.score == 0 ? 1 : loser.score * (this.bot ? 1 : 2),
				watchers: this.watchers.length,
				gameResults,
			});
			this.updatePlayerStats(loser.userId, {
				xp: loser.score == 0 ? 10 : loser.score * (this.bot ? 10 : 20),
				money: loser.score == 0 ? 1 : loser.score * (this.bot ? 1 : 2),
			});
		}
		this.emitWatchers('end_game', {
			objectId: this.data.objectId,
			result: winner.nickname + ' Win!',
			exp: 0,
			money: 0,
			watchers: this.watchers.length,
		});

		this.logger.debug(`Game End. Winner player ${winner.nickname}`);

		this.updateGameStats({
			status: GameStatus.FINISHED,
			gameStats: gameResults,
		});
	}

	async updateGameStats(body: any) {
		await this.gameService.endGame(this.data.objectId, body);
	}

	async updatePlayerStats(player_id: number, body: any) {
		await this.userService.updateStats(player_id, body);
	}

	//Update Status and Emit for ALL
	updateStatus(status: number) {
		if (this.status != status && this.status != Status.Finish) {
			this.status = status;
			this.emitAll('game_update_status', status);
		}
	}
	//Make the Countdown and Emit for ALL
	countdown(seconds: number) {
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
		this.gameServer?.to(`game-${this.data.objectId}-player`).emit(event, data);
	}
	//Emit for Watchers
	emitWatchers(event: string, data: any): void {
		this.gameServer?.to(`game-${this.data.objectId}-watcher`).emit(event, data);
	}
	//Emit for Players and Watchers
	emitAll(event: string, data: any): void {
		this.emitPlayers(event, data);
		this.emitWatchers(event, data);
	}

	entry_game(player: Player, isPlayer: boolean, info: playerInfo) {
		// || (this.player2 == null && this.bot == false))
		if (isPlayer) {
			player.onGame('game_move', (e: any) => this.game_move(e));
		}
		this.addUsers(player, isPlayer, info);
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
