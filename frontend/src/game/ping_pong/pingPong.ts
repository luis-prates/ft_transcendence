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
  Starting,
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
  counting: number = 0;
  context: CanvasRenderingContext2D;
  endMessage: string = "";

  constructor(width: number, height: number, offSet: number, context: CanvasRenderingContext2D, data: gameResquest) {
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    this.context = context;
    this.inputKey = new InputHandler();
    this.player1 = new Player(this, 1, "Player 1", avatarDefault);
    this.player2 = new Player(this, 2, "Player 2", marvin);
    this.ball = new Ball(this);
    this.data = data;
  }

  isEndGame() {
    if (this.player1.score === this.data.maxScore || this.player2.score === this.data.maxScore) return true;
    return false;
  }

  start_game() {
    this.status = Status.InGame;
  }

  endGame() {
    this.context.font = "100px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText("GAME OVER", 56, 380);
    this.context.strokeText("____ ____", 56, 405);

    this.context.fillStyle = "yellow";
    this.context.fillText("GAME OVER", 56, 380);
    this.context.fillText("____ ____", 56, 405);
  }

  update() {
    if (this.status != Status.InGame) {
      return;
    }

    if (!this.isEndGame()) this.ball.update(this.player1, this.player2);

    if (this.playerNumber === 1) this.player1.update(this.inputKey.keys);
    else if (this.playerNumber === 2) this.player2.update(this.inputKey.keys);
  }

  waitingGame() {
    this.context.font = "100px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText("WAITING!", 95, 380, this.width - 180);
    this.context.strokeText("________", 95, 405, this.width - 180);

    this.context.fillStyle = "yellow";
    this.context.fillText("WAITING!", 95, 380, this.width - 180);
    this.context.fillText("________", 95, 405, this.width - 180);
  }

  drawEndGame() {
    this.context.font = "100px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText(this.endMessage, 95, 380, this.width - 180);
    this.context.strokeText("_".repeat(this.endMessage.length), 95, 405, this.width - 180);

    this.context.fillStyle = "yellow";
    this.context.fillText(this.endMessage, 95, 380, this.width - 180);
    this.context.fillText("_".repeat(this.endMessage.length), 95, 405, this.width - 180);
  }

  countingGame(counting: number) {
    this.context.font = "100px 'Press Start 2P', cursive";
    this.context.fillStyle = this.ball.dir == 1 ? "red" : "blue";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;

    if (counting == 0) {
      this.context.strokeText("GO!", this.width / 2 - 100, 470);
      this.context.strokeText("___", this.width / 2 - 100, 485);
      this.context.fillText("GO!", this.width / 2 - 100, 470);
      this.context.fillText("___", this.width / 2 - 100, 485);
    } else if (counting > 0) {
      this.context.strokeText(counting.toString(), this.width / 2 - 50, 470);
      this.context.strokeText("_", this.width / 2 - 50, 485);
      this.context.fillText(counting.toString(), this.width / 2 - 50, 470);
      this.context.fillText("_", this.width / 2 - 50, 485);
    }
  }

  draw() {
    this.player1.draw(this.context);
    this.player2.draw(this.context);
    this.ball.draw(this.context);
    this.drawScore();
    if (this.isEndGame()) this.endGame();
  }

  drawScore() {
    if (this.status == Status.Waiting) this.waitingGame();
    else if (this.status == Status.Starting) this.countingGame(this.counting - 1);
    else if (this.status == Status.Finish) this.drawEndGame();

    this.context.font = "50px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText(
      this.player1.score + " : " + this.player2.score,
      this.width / 2 - 120,
      90,
      this.width - 750
    );

    this.context.fillStyle = "white";
    this.context.fillText(this.player1.score + " : " + this.player2.score, this.width / 2 - 120, 90, this.width - 750);
  }
}
