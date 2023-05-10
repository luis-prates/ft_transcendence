import { Player } from "./player";
import { InputHandler } from "./input";
import { Ball } from "./ball";
import socket from "@/socket/Socket";

//Images
import tableImage from "@/assets/images/pingpong/table_1.png";
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import marvin from "@/assets/images/pingpong/marvin.png";

export class Game {
  width: number;
  height: number;
  offSet: number = 0;
  maxPoint = 3;
  inputKey: InputHandler;
  Player1: Player;
  Player2: Player;
  Ball: Ball;

  constructor(width: number, height: number, offSet: number, maxPoint: number = 3) {
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    this.maxPoint = maxPoint;
    this.inputKey = new InputHandler();
    this.Player1 = new Player(this, 1, "Player 1", avatarDefault);
    this.Player2 = new Player(this, 2, "Player 2", marvin);
    this.Ball = new Ball(this);
    socket.emit("new_game", {name: "tes", x: 6 });
    socket.on("new_game", e => {
        console.log("new_game", e)
    })
  }

  isEndGame() {
    if (this.Player1.score === this.maxPoint || this.Player2.score === this.maxPoint) return true;
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

  update() {
    if (!this.isEndGame()) this.Ball.update(this.Player1, this.Player2);

    this.Player1.update(this.inputKey.keys);
    this.Player2.update(this.inputKey.keys);
  }

  draw(context: CanvasRenderingContext2D) {
    this.Player1.draw(context);
    this.Player2.draw(context);
    this.drawScore(context);
    this.Ball.draw(context);
    if (this.isEndGame()) this.endGame(context);
  }

  drawScore(ctx: CanvasRenderingContext2D) {
    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.fillStyle = "black";

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.strokeText(this.Player1.score + " : " + this.Player2.score, this.width / 2 - 120, 90);

    ctx.fillStyle = "white";
    ctx.fillText(this.Player1.score + " : " + this.Player2.score, this.width / 2 - 120, 90);
  }
}
