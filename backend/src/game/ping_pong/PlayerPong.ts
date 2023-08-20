import { Player } from '../../player/Player';
import { GameClass, Status } from './GamePong';
import { playerInfo } from '../../socket/SocketInterface';

export class Player_Pong {
	game: GameClass;
	width = 30;
	height = 100;
	socket: Player;
	player_n: number;
	y = 0;
	x = 0;
	speed = 5;
	score = 0;
	nickname: string;
	avatar: string;
	fpsUpdate = 0;
	color: string;
	skin: string;
	userId: number;
	up = false;
	down = false;

	constructor(game: GameClass, player_n: number, playerLobby: Player, info?: playerInfo) {
		this.game = game;
		this.player_n = player_n;
		this.y = game.height / 2 - this.height / 2;
		if (this.player_n == 1) {
			this.x = 50;
		} else if (this.player_n == 2 || this.player_n == 3) {
			this.x = game.width - this.width - 50;
		}
		if (this.player_n != 3) {
			this.socket = playerLobby;
		}
		this.nickname = info.nickname;
		this.avatar = info.avatar;
		this.color = info.color;
		this.skin = info.skin;
		this.userId = info.userId;
	}

	moveUp() {
		if (this.fpsUpdate == 1) {
			return;
		}
		if (this.y > 0) {
			this.y -= this.speed;
		}
		this.fpsUpdate = 1;
	}

	moveDown() {
		if (this.fpsUpdate == 1) {
			return;
		}
		if (this.y < this.game.height - this.height) {
			this.y += this.speed;
		}
		this.fpsUpdate = 1;
	}

	point() {
		if (this.game.maxPoint > this.score) {
			this.score++;
		}
	}

	update() {
		if (this.player_n == 3 || this.game.status != Status.InGame) {
			const ballUporDown =
				this.game.ball.y - (this.game.ball.y + this.game.ball.speed * Math.sin(this.game.ball.angle));
			const move = this.game.ball.y + this.game.ball.height / 2 - (this.y + this.height / 2);
			if (ballUporDown > 0 && move < this.speed) {
				this.moveUp();
			} else if (ballUporDown < 0 && move > this.speed) {
				this.moveDown();
			}
			if (this.game.status != Status.InGame) {
				if (ballUporDown < 0 && move < this.speed) {
					this.moveUp();
				} else if (ballUporDown > 0 && move > this.speed) {
					this.moveDown();
				}
			}
		}
		if (!(this.up && this.down)) {
			if (this.up) {
				this.moveUp();
			} else if (this.down) {
				this.moveDown();
			}
		}
		this.emitPlayer();
	}

	reset_keys() {
		this.up = false;
		this.down = false;
	}

	emitPlayer() {
		this.game.emitAll('game_update_player', {
			objectId: this.game.data.objectId,
			playerNumber: this.player_n,
			nickname: this.nickname,
			x: this.x,
			y: this.y,
			score: this.score,
			color: this.color,
		});
		this.fpsUpdate = 0;
	}
}
