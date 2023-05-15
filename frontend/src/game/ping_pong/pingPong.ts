import { Player } from "./Player";
import { InputHandler } from "./Input";
import { Ball } from "./Ball";
import socket from "@/socket/Socket";
import { type gameResquest } from "./SocketInterface";

//Images
import tableImage from "@/assets/images/pingpong/table_1.png";
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import marvin from "@/assets/images/pingpong/marvin.png";

export enum Status {
  Waiting,
  InGame,
  Finish,
}

export class Game {
  status: number = Status.Waiting;
  width: number;
  height: number;
  offSet: number = 0;
  inputKey: InputHandler;
  player1: Player;
  player2: Player;
  ball: Ball;
  data: gameResquest;
  playerNumber: number = 0;

  constructor(width: number, height: number, offSet: number, data: gameResquest) {
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    this.inputKey = new InputHandler();
    this.player1 = new Player(this, 1, "Player 1", avatarDefault);
    this.player2 = new Player(this, 2, "Player 2", marvin);
    this.ball = new Ball(this);
    this.data = data;
  }

  /*startGame()
  {
    
  }*/

  isEndGame() {
    if (this.player1.score === this.data.maxScore || this.player2.score === this.data.maxScore) return true;
    return false;
  }

  endGame(context: CanvasRenderingContext2D) {
    context.font = "100px 'Press Start 2P', cursive";
    context.fillStyle = "black";

    context.strokeStyle = "black";
    context.lineWidth = 10;
    context.strokeText("GAME OVER", 56, 380);
    context.strokeText("____ ____", 56, 405);

    context.fillStyle = "yellow";
    context.fillText("GAME OVER", 56, 380);
    context.fillText("____ ____", 56, 405);
  }

  waitingGame(context: CanvasRenderingContext2D) {
    context.font = "100px 'Press Start 2P', cursive";
    context.fillStyle = "black";

    context.strokeStyle = "black";
    context.lineWidth = 10;
    context.strokeText("WAITING.", 95, 380);
    context.strokeText("________", 95, 405);

    context.fillStyle = "yellow";
    context.fillText("WAITING.", 95, 380);
    context.fillText("________", 95, 405);
  }

  update(context: CanvasRenderingContext2D) {
    if (this.status !== Status.InGame) {
      this.waitingGame(context);
      return;
    }

    if (!this.isEndGame()) this.ball.update(this.player1, this.player2);

    if (this.playerNumber === 1) this.player1.update(this.inputKey.keys);
    else if (this.playerNumber === 2) this.player2.update(this.inputKey.keys);
  }

  draw(context: CanvasRenderingContext2D) {
    this.player1.draw(context);
    this.player2.draw(context);
    this.drawScore(context);
    this.ball.draw(context);
    if (this.isEndGame()) this.endGame(context);
  }

  drawScore(ctx: CanvasRenderingContext2D) {
    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.fillStyle = "black";

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.strokeText(this.player1.score + " : " + this.player2.score, this.width / 2 - 120, 90);

    ctx.fillStyle = "white";
    ctx.fillText(this.player1.score + " : " + this.player2.score, this.width / 2 - 120, 90);
  }
}
