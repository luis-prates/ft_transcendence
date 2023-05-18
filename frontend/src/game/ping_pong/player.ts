import { Game } from "./PingPong";
import { type updatePlayer } from "./SocketInterface";
import socket from "@/socket/Socket";

export class Player {
  game: Game;
  width: number = 30;
  height: number = 100;
  player: number;
  y: number;
  x: number = 0;
  //speed: number = 10;
  score: number = 0;
  nickname: string;
  avatar = new Image();

  constructor(game: Game, player_n: number, nickname: string, avatar: any) {
    this.game = game;
    this.player = player_n;
    this.y = game.height / 2 - this.height / 2 + this.game.offSet;
    if (this.player == 1) this.x = 50;
    else if (this.player == 2) this.x = game.width - this.width - 50;
    this.nickname = nickname;
    this.avatar.src = avatar;
  }

  emitMove() {
    socket.emit("game_move", {
      objectId: this.game.data.objectId,
      playerNumber: this.game.playerNumber,
      // x: this.x,
      // y: this.y - this.game.offSet,
      move: "up",
    });
  }

  moveUp() {
    //Emit UP
    if (this.y > this.game.offSet) {
      socket.emit("game_move", {
        objectId: this.game.data.objectId,
        playerNumber: this.game.playerNumber,
        // x: this.x,
        // y: this.y - this.game.offSet,
        move: "up",
      });
    }
  }

  moveDown() {
    //Emit DOWN
    if (this.y < this.game.height - this.height + this.game.offSet) {
      socket.emit("game_move", {
        objectId: this.game.data.objectId,
        playerNumber: this.game.playerNumber,
        move: "down",
      });
    }
  }

  point(score: number) {
    if (this.score != score)
      this.score = score;
  }

  update(input: string[]) {
    if (this.game.playerNumber == 1 || this.game.playerNumber == 2) {
      if (input.includes("w")) this.moveUp();
      if (input.includes("s")) this.moveDown();
    }
  }

  updatePlayer(x: number, y: number) {
    this.x = x;
    this.y = y + this.game.offSet;
  }

  draw(context: CanvasRenderingContext2D) {
    if (this.player == 1) {
      this.drawPhoto(context);
      this.drawNickName(context);
      this.drawPlayer(context, "red");
    } else if (this.player == 2) {
      this.drawPhoto(context, this.game.width - 50);
      this.drawNickName(context);
      this.drawPlayer(context, "blue");
    }
  }
  drawNickName(ctx: CanvasRenderingContext2D) {
    let pos_x = 100;
    let collor = "red";
    if (this.player == 2) {
      pos_x = this.game.width - 100 - 200;
      collor = "blue";
    }

    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.fillStyle = collor;

    const nickname = this.nickname.length > 10 ? this.nickname.slice(0, 10) + "." : this.nickname;

    ctx.strokeText(nickname, pos_x, 89, 200);
    ctx.fillText(nickname, pos_x, 89, 200);
  }

  drawPhoto(context: CanvasRenderingContext2D, whidth?: number) {
    context.drawImage(this.avatar, whidth ? whidth - 25 : 25, 35, 50, 50);
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeRect(whidth ? whidth - 25 : 25, 35, 50, 50);
  }

  drawPlayer(context: CanvasRenderingContext2D, color: string) {
    context.fillStyle = color;
    context.fillRect(this.x, this.y, this.width, this.height);

    context.strokeStyle = "black";
    context.lineWidth = 3;

    context.strokeRect(this.x, this.y, this.width, this.height);
  }
}
