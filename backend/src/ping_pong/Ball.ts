import { Game } from './GamePong';
import { Player_Pong } from './PlayerPong';
import { type gamePoint } from './SocketInterface';


export class Ball {
  //Macros
  speedIncrement = 1;
  speedStart = 5;

  game: Game;
  width: number = 25;
  height: number = 25;
  x: number = 0;
  y: number = 0;
  dir: number = 1;
  speed: number;
  angle: number = 0;

  constructor(game: Game) {
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

  ballColide()
  {
    const random = this.generateRandomAngle(-1, 1);
    
    // Verifica se a bola colidiu com a raquete do jogador 1
    if (this.dir == 1) {
      if (
        this.x >= this.game.player1.x &&
        this.x <= this.game.player1.x + this.game.player1.width &&
        (this.y >= this.game.player1.y &&
        this.y <= this.game.player1.y + this.game.player1.height ||
        this.y + this.height >= this.game.player1.y &&
        this.y + this.height <= this.game.player1.y + this.game.player1.height)
      ) {
        // Inverte a direção da bola
        this.angle = Math.PI - this.angle;

        // Ajusta o ângulo com base no ponto de contato na raquete
        let relativeIntersectY = this.game.player1.y + this.game.player1.height / 2 - (this.y + this.height / 2);
        let normalizedRelativeIntersectionY = relativeIntersectY / (this.game.player1.height / 2);
        this.angle -= normalizedRelativeIntersectionY * (Math.PI / 4);

        this.angle += random;

        this.dir = 2;
        this.speed += this.speedIncrement;

        this.emitSound("player");
      }
    }
    // Verifica se a bola colidiu com a raquete do jogador 2
    else if (this.dir === 2) {
      if (
        this.x + this.width >= this.game.player2.x &&
        this.x + this.width <= this.game.player2.x + this.game.player2.width &&
        (this.y >= this.game.player2.y &&
        this.y <= this.game.player2.y + this.game.player2.height ||
        this.y + this.height >= this.game.player2.y &&
        this.y + this.height <= this.game.player2.y + this.game.player2.height)
      ) {
        // Inverte a direção da bola
        this.angle = Math.PI - this.angle;

        // Ajusta o ângulo com base no ponto de contato na raquete
        let relativeIntersectY = this.game.player2.y + this.game.player2.height / 2 - (this.y + this.height / 2);
        let normalizedRelativeIntersectionY = relativeIntersectY / (this.game.player2.height / 2);
        this.angle = normalizedRelativeIntersectionY * (Math.PI / 4) + Math.PI;

        this.angle += random;

        this.dir = 1;
        this.speed += this.speedIncrement;

        this.emitSound("player");
      }
    }

    // Verifica se a bola colidiu com as paredes superior ou inferior
    if (this.y < 0 || this.y + this.height > this.game.height) {
      // Inverte a direção da bola
      this.angle = -this.angle;
      this.emitSound("wall");
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

    this.emitSound("score");
  }

  update() {
    // Move a bola com base em sua velocidade e ângulo
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);

    this.ballColide();

    if (this.x <= 0 || this.x + this.width >= this.game.width)
      this.ballPoint();

    this.emitBall();
  }
  
  emitBall() {
    this.game.emitAll("game_update_ball", {
      objectId: this.game.data.objectId,
      x: this.x,
      y: this.y,
      dir: this.dir,
    });
  }
  emitSound(sound: string) {
    this.game.emitAll("game_sound", {
      objectId: this.game.data.objectId,
      sound: sound,
    });
  }
}
