import { Game } from "./pingPong";

export class Player {
  game: Game;
  width: number = 30;
  height: number = 100;
  player: number;
  y: number;
  x: number = 0;
  speed: number = 10;
  score: number = 0;
  nickname: string;
  avatar = new Image();

  constructor(game: Game, player_n: number, nickname: string, avatar: any) {
    this.game = game;
    this.player = player_n;
    this.y = game.height / 2 - this.height / 2 + this.game.offSet;
    if (this.player === 1) this.x = 50;
    else if (this.player === 2) this.x = game.width - this.width - 50;
    this.nickname = nickname;
    this.avatar.src = avatar;
  }

  moveUp() {
    if (this.y > this.game.offSet) this.y -= this.speed;
  }

  moveDown() {
    if (this.y < this.game.height - this.height + this.game.offSet) this.y += this.speed;
  }

  point() {
    this.score++;
  }

  update(input: string[]) {
    if (this.player === 1) {
      if (input.includes("w")) this.moveUp();
      if (input.includes("s")) this.moveDown();
    } else if (this.player === 2) {
      if (input.includes("ArrowUp")) this.moveUp();
      if (input.includes("ArrowDown")) this.moveDown();
    }
  }

  drawNickName(ctx: CanvasRenderingContext2D) {
    let pos_x = 100;
    let collor = "red";
    if (this.player === 2) {
      pos_x = this.game.width - 100 - 200;
      collor = "blue";
    }

    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.fillStyle = collor;

    ctx.strokeText(this.nickname, pos_x, 89, 200);
    ctx.fillText(this.nickname, pos_x, 89, 200);
  }

  draw(context: CanvasRenderingContext2D) {
    if (this.player === 1) {
      context.drawImage(this.avatar, 25, 35, 50, 50);
      context.strokeStyle = "black";
      context.lineWidth = 3;
      context.strokeRect(25, 35, 50, 50);
      context.fillStyle = "red";
      context.fillRect(this.x, this.y, this.width, this.height);
      this.drawNickName(context);
    } else if (this.player === 2) {
      context.drawImage(this.avatar, this.game.width - 25 - 50, 35, 50, 50);
      context.strokeStyle = "black";
      context.lineWidth = 3;
      context.strokeRect(this.game.width - 25 - 50, 35, 50, 50);
      context.fillStyle = "blue";
      context.fillRect(this.x, this.y, this.width, this.height);
      this.drawNickName(context);
    }

    context.strokeStyle = "black";
    context.lineWidth = 3;

    context.strokeRect(this.x, this.y, this.width, this.height);
    //  context.fillRect(this.x, this.y, this.width, this.height);
  }
}
