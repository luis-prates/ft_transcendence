import type { Game } from "./PingPong";

export class Ball {
  game: Game;
  width: number = 25;
  height: number = 25;
  x: number = 0;
  y: number = 0;
  dir: number = 1;

  constructor(game: Game) {
    this.game = game;
    this.x = game.width / 2 - this.width / 2;
    this.y = game.height / 2 - this.height / 2;
    this.dir = 1;
  }

  updateBall(x: number, y: number, dir: number) {
    this.x = x;
    this.y = y;
    this.dir = dir;
  }

  draw(context: CanvasRenderingContext2D) {
    if (this.dir === 1) context.fillStyle = this.game.player1.color;
    else if (this.dir === 2) context.fillStyle = this.game.player2.color;

    context.beginPath();
    context.arc(this.x + this.width / 2, this.y + this.height / 2 + this.game.offSet, this.width / 2, 0, 360);
    context.fill();
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.stroke();
  }
}
