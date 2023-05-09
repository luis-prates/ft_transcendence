import { Game } from "./pingPong";

export class Player {
  game: Game;
  width: number;
  height: number;
  player: number;
  y: number;
  x: number;
  speed: number;
  offSet: number;

  constructor(game: Game, player_n: number) {
    this.game = game;
    this.width = 30;
    this.height = 100;
    this.player = player_n;
    this.y = game.height / 2 - this.height / 2 + this.game.offSet;
    if (this.player === 1) this.x = 50;
    else if (this.player === 2) this.x = game.width - this.width - 50;
    this.speed = 10;
  }

  moveUp() {
    if (this.y > this.game.offSet) this.y -= this.speed;
  }

  moveDown() {
    if (this.y < this.game.height - this.height + this.game.offSet) this.y += this.speed;
  }

  update(input) {
    if (this.player === 1) {
      if (input.includes("w")) this.moveUp();
      if (input.includes("s")) this.moveDown();
    } else if (this.player === 2) {
      if (input.includes("ArrowUp")) this.moveUp();
      if (input.includes("ArrowDown")) this.moveDown();
    }
  }
  
  draw(context: CanvasRenderingContext2D) {
    if (this.player === 1) context.fillStyle = "red";
    else if (this.player === 2) context.fillStyle = "blue";

    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
