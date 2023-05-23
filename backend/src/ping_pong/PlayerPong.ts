import { Player } from '../lobby';
import { Game } from './GamePong';
import { playerInfo } from './SocketInterface';

export class Player_Pong {
	game: Game;
	width: number = 30;
	height: number = 100;
	socket: Player;
	player_n: number;
	y: number = 0;
	x: number = 0;
	speed: number = 8;
	score: number = 0;
	nickname: string;
	avatar: string;
	fpsUpdate: number = 0;
	color: string;
	skin: string;

	constructor(game: Game, player_n: number, playerLobby: Player, info?: playerInfo) {
		this.game = game;
		this.player_n = player_n;
		this.y = game.height / 2 - this.height / 2;
		if (this.player_n == 1) this.x = 50;
		else if (this.player_n == 2 || this.player_n == 3) this.x = game.width - this.width - 50;
		if (this.player_n != 3) this.socket = playerLobby;
		this.nickname = info.nickname;
		this.avatar = info.avatar;
		this.color = info.color;
		this.skin = info.skinPlayer;
	}

	moveUp() {
		if (this.fpsUpdate == 1) return;
		if (this.y > 0) this.y -= this.speed;
		this.fpsUpdate = 1;
	}

	moveDown() {
		if (this.fpsUpdate == 1) return;
		if (this.y < this.game.height - this.height) this.y += this.speed;
		this.fpsUpdate = 1;
	}

	point() {
		if (this.game.maxPoint > this.score) this.score++;
	}

	update() {
		if (this.player_n == 3) {
			//up or down
			const ballUporDown = this.game.ball.y - (this.game.ball.y += this.game.ball.speed * Math.sin(this.game.ball.angle));
			//posiçao em relaçao a bola
			const move = this.game.ball.y + this.game.ball.height / 2 - (this.y + this.height / 2);
			// console.log("REsult:", move);
			if (ballUporDown > 0 && move < this.speed) this.moveUp();
			else if (ballUporDown < 0 && move > this.speed) this.moveDown();
		}
		this.emitPlayer();
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
