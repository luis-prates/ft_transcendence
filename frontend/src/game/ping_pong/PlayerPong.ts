import { GamePong } from "@/game/ping_pong/";
import { skin, TypeSkin } from "./Skin";


//Avatar
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import { type updatePlayer } from "./SocketInterface";
import { socketClass } from "@/socket/Socket";

//Avatar
import avatarMarvin from "@/assets/images/pingpong/marvin.jpg";
import type { Socket } from "socket.io-client";

export class PlayerPong {
  game: GamePong;
  width: number = 30;
  height: number = 100;
  player: number;
  y: number;
  x: number = 0;
  score: number = 0;
  nickname: string;
  avatar = new Image();
  color: string;
  skin = new Image();
  key_w_press: boolean = false;
  key_s_press: boolean = false;
  socket: Socket = socketClass.getGameSocket();

  constructor(game: GamePong, player_n: number, nickname: string, avatar: any) {
    this.game = game;
    this.player = player_n;
    this.y = game.height / 2 - this.height / 2 + this.game.offSet;
    if (this.player == 1) this.x = 50;
    else if (this.player == 2) this.x = game.width - this.width - 50;
    this.nickname = nickname;
    this.avatar.src = avatar;
    this.color = player_n == 1 ? "red" : "blue";
    this.skin.src = "";
  }

  updateSkin(skin_label: string) {
    this.skin = skin.get_skin(TypeSkin.Paddle + "_" + skin_label);
  }

  moveUp(key_press: boolean) {
    this.key_w_press = key_press;
    //Emit UP
	this.socket.emit("game_move", {
	  objectId: this.game.data.objectId,
	  playerNumber: this.game.playerNumber,
	  move: "up",
	  key: key_press,
	});
  }

  moveDown(key_press: boolean) {
    this.key_s_press = key_press;
    //Emit DOWN
	this.socket.emit("game_move", {
	  objectId: this.game.data.objectId,
	  playerNumber: this.game.playerNumber,
	  move: "down",
	  key: key_press,
	});
  }

  point(score: number) {
    if (this.score != score) this.score = score;
  }

  update(input: string[]) {
    if (this.game.playerNumber == 1 || this.game.playerNumber == 2) {
      if (input.includes("w") && this.key_w_press == false) this.moveUp(true);
      if (!(input.includes("w")) && this.key_w_press == true) this.moveUp(false);
      if (input.includes("s") && this.key_s_press == false) this.moveDown(true);
      if (!(input.includes("s")) && this.key_s_press == true) this.moveDown(false);
    }
  }

  updatePlayer(x: number, y: number, score: number) {
    this.x = x;
    this.y = y + this.game.offSet;
    this.score = score;
  }

  draw(context: CanvasRenderingContext2D) {
    this.drawNickName(context);
    this.drawPlayer(context, this.color);
    this.drawPhoto(context);
  }
  drawNickName(ctx: CanvasRenderingContext2D) {
    let pos_x = 100;
    let collor = this.color;
    if (this.player == 2) {
      pos_x = this.game.width - 100 - 200;
      collor = this.color;
    }

    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.fillStyle = collor;

    const nickname = this.nickname.length > 10 ? this.nickname.slice(0, 10) + "." : this.nickname;

    ctx.strokeText(nickname, pos_x, 89, 200);
    ctx.fillText(nickname, pos_x, 89, 200);
  }

  drawPhoto(context: CanvasRenderingContext2D) {
    let width: number = 0;
    if (this.player == 2) width = this.game.width - 50;
    
    try {
      context.drawImage(this.avatar, width != 0 ? width - 25 : 25, 35, 50, 50);
    }
    catch {
      this.avatar.src = avatarDefault;
      context.drawImage(this.avatar, width != 0 ? width - 25 : 25, 35, 50, 50);
    }


    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeRect(width ? width - 25 : 25, 35, 50, 50);
  }

  drawSkin(context: CanvasRenderingContext2D) {
    if (this.x > this.game.width / 2) {
      try {
        context.drawImage(this.skin, this.x, this.y, this.width, this.height);
      } catch {
        return;
      }
    } else {
      context.save();

      const rotationAngle = (180 * Math.PI) / 180;

      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      context.translate(centerX, centerY);

      context.rotate(rotationAngle);

      try {
        context.drawImage(this.skin, -this.width / 2, -this.height / 2, this.width, this.height);
      } catch {
        ("");
      }

      context.restore();
    }
  }

  drawPlayer(context: CanvasRenderingContext2D, color: string) {
    context.fillStyle = color;

    context.lineWidth = 3;
    context.fillRect(this.x, this.y, this.width, this.height);

    if (this.skin.src) this.drawSkin(context);

    context.strokeStyle = "black";

    context.strokeRect(this.x, this.y, this.width, this.height);
  }
}
