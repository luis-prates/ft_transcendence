import { Player } from "./player";
import { InputHandler } from "./input";
import { Ball } from "./ball";
import tableImage from "@/assets/images/pingpong/table_1.png";

export class Game {
  width: number;
  height: number;
  inputKey: InputHandler;
  Player1: Player;
  Player2: Player;
  Ball: Ball;
  player1Score: number = 0;
  player2Score: number = 0;
  offSet: number = 0;
  // table = new Image();

  constructor(width: number, height: number, offSet: number) {
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    this.inputKey = new InputHandler();
    this.Player1 = new Player(this, 1);
    this.Player2 = new Player(this, 2);
    this.Ball = new Ball(this);
    this.player1Score = 0;
    this.player2Score = 0;
  }
  point(player: number) {
    if (player === 1) this.player1Score++;
    else this.player2Score++;
  }
  update() {
    this.Player1.update(this.inputKey.keys);
    this.Player2.update(this.inputKey.keys);
    this.Ball.update(this.Player1, this.Player2);
  }
  draw(context: CanvasRenderingContext2D) {
    this.Player1.draw(context);
    this.Player2.draw(context);
    this.drawScore(context);
    this.Ball.draw(context);
    context.fillStyle = "yellow";
    context.fillRect(0, this.offSet, this.width, 1);
    context.fillRect(0, this.height + this.offSet, this.width, 1);
  }
  drawScore(ctx: CanvasRenderingContext2D) {
    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.fillStyle = "black";

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.strokeText(this.player1Score + " : " + this.player2Score, this.width / 2 - 120, 80);

    ctx.fillStyle = "white";
    ctx.fillText(this.player1Score + " : " + this.player2Score, this.width / 2 - 120, 80);
  }
}
