import { Player } from '../lobby';
import { Game, Status } from './GamePong';
import { playerInfo } from './SocketInterface';

export class Player_Pong {
	game: Game;
	width = 30;
	height = 100;
	socket: Player;
	player_n: number;
	y: number = 0;
	x: number = 0;
	speed: number = 5;
	score: number = 0;
	nickname: string;
	avatar: string;
	fpsUpdate = 0;
	color: string;
	skin: string;
	up: boolean = false;
	down: boolean = false;

	constructor(
		game: Game,
		player_n: number,
		playerLobby: Player,
		info?: playerInfo,
	) {
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
				this.game.ball.y -
				(this.game.ball.y +
					this.game.ball.speed * Math.sin(this.game.ball.angle));
			const move =
				this.game.ball.y +
				this.game.ball.height / 2 -
				(this.y + this.height / 2);
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
		if (!(this.up && this.down))
		{
			if (this.up) this.moveUp();
			else if (this.down) this.moveDown();
		}
		this.emitPlayer();
	}

	reset_keys()
	{
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
			avatar: this.avatar,
			color: this.color,
		});
		this.fpsUpdate = 0;
	}
}
