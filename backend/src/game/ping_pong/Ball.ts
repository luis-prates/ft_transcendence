import { GameClass } from './GamePong';
import { Player_Pong } from './PlayerPong';

export class Ball {
	//Macros
	speedIncrement = 1;
	speedStart = 5;

	game: GameClass;
	width = 25;
	height = 25;
	x = 0;
	y = 0;
	dir = 1;
	speed: number;
	angle = 0;

	constructor(game: GameClass) {
		this.game = game;
		this.x = game.width / 2 - this.width / 2;
		this.y = this.game.height / 2 - this.height / 2;
		this.dir = Math.floor(Math.random() * 2) + 1;
		this.speed = this.speedStart;
		this.angle = this.dir === 1 ? this.generateRandomAngle(135, 225) : this.generateRandomAngle(-45, 45);
	}

	generateRandomAngle(minAngle: number, maxAngle: number) {
		const range = maxAngle - minAngle;
		const randomAngle = Math.random() * range + minAngle;
		return (randomAngle * Math.PI) / 180;
	}

	createAngle(player: Player_Pong) {
		const relativeIntersectY = player.y + player.height / 2 - (this.y + this.height / 2);
		const normalizedRelativeIntersectionY = relativeIntersectY / (player.height / 2);
		let intersect = Math.max(-1, Math.min(1, normalizedRelativeIntersectionY));
		const sinal = intersect <= 0 ? 1 : -1;
		if (intersect < 0) {
			intersect = -intersect;
		}
		this.angle = intersect * ((45 * Math.PI) / 180);
		if (player.player_n != 1) {
			this.angle = Math.PI - this.angle;
		}
		this.angle *= sinal;
	}

	ballColide() {
		const random = this.generateRandomAngle(-1, 1);
		// Verifica se a bola colidiu com a raquete do jogador 1
		if (this.dir == 1) {
			const isBallHorizontallyWithinPlayer1 =
				this.x >= this.game.player1.x && this.x <= this.game.player1.x + this.game.player1.width;
			const isBallVerticallyWithinPlayer1 =
				this.y >= this.game.player1.y && this.y <= this.game.player1.y + this.game.player1.height;
			const isBallBottomWithinPlayer1 =
				this.y + this.height >= this.game.player1.y &&
				this.y + this.height <= this.game.player1.y + this.game.player1.height;
			if (isBallHorizontallyWithinPlayer1 && (isBallVerticallyWithinPlayer1 || isBallBottomWithinPlayer1)) {
				this.createAngle(this.game.player1);
				this.angle += random;

				this.dir = 2;
				this.speed += this.speedIncrement;

				this.emitSound('player');
			}
		}
		// Verifica se a bola colidiu com a raquete do jogador 2
		else if (this.dir === 2) {
			const isBallHorizontallyWithinPlayer2 =
				this.x + this.width >= this.game.player2.x &&
				this.x + this.width <= this.game.player2.x + this.game.player2.width;
			const isBallVerticallyWithinPlayer2 =
				this.y >= this.game.player2.y && this.y <= this.game.player2.y + this.game.player2.height;
			const isBallBottomWithinPlayer2 =
				this.y + this.height >= this.game.player2.y &&
				this.y + this.height <= this.game.player2.y + this.game.player2.height;

			if (isBallHorizontallyWithinPlayer2 && (isBallVerticallyWithinPlayer2 || isBallBottomWithinPlayer2)) {
				this.createAngle(this.game.player2);
				this.angle += random;

				this.dir = 1;
				this.speed += this.speedIncrement;

				this.emitSound('player');
			}
		}

		// Verifica se a bola colidiu com as paredes superior ou inferior
		if (this.y < 0 || this.y + this.height > this.game.height) {
			//Para impedir que saia
			if (this.y < 0) {
				this.y = 0;
			}
			if (this.y + this.height > this.game.height) {
				this.y = this.y - this.height;
			}
			// Inverte a direção da bola
			this.angle = -this.angle;
			if (this.dir == 1) {
				this.emitBall();
			} else if (this.dir === 2) {
				this.emitBall();
			}
			this.emitSound('wall');
		}
	}

	ballPoint() {
		if (this.x <= 0) {
			// Player 2 do Point
			this.game.player2.point();
			this.angle = this.generateRandomAngle(-45, 45);
			this.dir = 2;

			// Reinicia a posição e o ângulo da bola
			this.x = this.game.width / 2 - this.width / 2;
			this.y = this.game.height / 2 - this.height / 2;
			this.speed = this.speedStart;

			this.game.makePoint(2);
		} else if (this.x + this.width >= this.game.width) {
			// Player 1 do Point

			this.game.player1.point();
			this.angle = this.generateRandomAngle(135, 225);
			this.dir = 1;

			// Reinicia a posição e o ângulo da bola
			this.x = this.game.width / 2 - this.width / 2;
			this.y = this.game.height / 2 - this.height / 2;
			this.speed = this.speedStart;

			this.game.makePoint(1);
		}

		// Reinicia a posição e o ângulo da bola
		this.x = this.game.width / 2 - this.width / 2;
		this.y = this.game.height / 2 - this.height / 2;
		this.speed = this.speedStart;

		this.emitSound('score');
	}

	update() {
		// Move a bola com base em sua velocidade e ângulo
		this.x += this.speed * Math.cos(this.angle);
		this.y += this.speed * Math.sin(this.angle);

		this.ballColide();

		if (this.x <= 0 || this.x + this.width >= this.game.width) {
			this.ballPoint();
		}

		this.emitBall();
	}

	emitBall() {
		this.game.emitAll('game_update_ball', {
			objectId: this.game.data.objectId,
			x: this.x,
			y: this.y,
			dir: this.dir,
			// speed: this.speed,
			// angle: this.angle,
		});
	}
	emitSound(sound: string) {
		this.game.emitAll('game_sound', {
			objectId: this.game.data.objectId,
			sound: sound,
		});
	}
}
