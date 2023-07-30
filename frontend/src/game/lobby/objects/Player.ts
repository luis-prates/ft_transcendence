import { Character } from "../../base/Character";
import { socketClass } from "@/socket/SocketClass";
import { Map } from "./Map";
import { Game } from "@/game/base/Game";
import type { GameObject } from "@/game/base/GameObject";
import { type Ref } from "vue";
import { userStore, type GAME } from "@/stores/userStore";
import { LeaderBoard } from "@/game/Menu/LeaderBoard";
import { Profile } from "@/game/Menu/Profile";
import { YourProfile } from "@/game/Menu/YourProfile";
import { ConfirmButton } from "@/game/Menu/ConfirmButton";
import { Shop } from "@/game/Menu/Shop";
import type { Socket } from "socket.io-client";
import { YourMenu } from "@/game/Menu/YourMenu";

export class Player extends Character {
  select: GameObject | undefined = undefined;
  private menu: Ref<HTMLDivElement | undefined>;
  private store: any;
  public socket: Socket = socketClass.getLobbySocket();

  constructor(menu: Ref<HTMLDivElement | undefined>, data: any) {
    super();
    this.store = userStore();
    this.objectId = this.store.user.id;
    this.x = data.x;
    this.y = data.y;
    this.menu = menu;
    this.animation.sx = (this.store.user.avatar - 4 >= 0 ? this.store.user.avatar - 4 : this.store.user.avatar) * 144;
    this.animation.sy = (this.store.user.avatar - 4 >= 0 ? 1 : 0) * 320;
    this.menu.value?.setAttribute("style", "display: none");
    this.type = "player";
    this.name = "Player_" + Date.now();
    this.nickname = data.nickname;
    this.avatar = data.avatar;
    console.log("Player", data);
    this.socket.emit("new_player", { objectId: this.objectId, name: this.name, nickname: this.nickname, avatar: this.avatar, x: this.x, y: this.y, animation: { name: this.animation.name, isStop: this.animation.isStop, sx: this.animation.sx, sy: this.animation.sy} });
  }

  draw(contex: CanvasRenderingContext2D): void {
    if (this.agent.getPath().length > 0) {
      contex.lineWidth = 2;
      contex.strokeStyle = "blue";
      contex.beginPath();

      const sx = this.w / 2;
      const sy = this.h / 2 - 10;
      contex.moveTo(this.x + sx, this.y + sy);
      for (let i = 0; i < this.agent.getPath().length; i++) {
        contex.lineTo(this.agent.getPath()[i].x * Map.SIZE + sx, this.agent.getPath()[i].y * Map.SIZE + sy);
      }
      contex.stroke();
      const ultimoPonto = this.agent.getPath()[this.agent.getPath().length - 1];
      contex.beginPath();
      contex.arc(ultimoPonto.x * Map.SIZE + sx, ultimoPonto.y * Map.SIZE + sy, 5, 0, Math.PI * 2);
      contex.fillStyle = "red";
      contex.fill();
    }
    super.draw(contex);
  }

  mouseClick?(x: number, y: number, button: number): void {
    this.menu.value?.setAttribute("style", "display: none");
    if (button == 0) {
      this.select = Game.MouseColision(x, y);
      if (this.select == this) {

        Game.instance.addMenu(new YourProfile(this).menu);

      } else if (this.select && this.select != this && this.select.interaction) {
        this.agent.setDistinctionObject(this.select, (gameObject) => {
          if (gameObject && gameObject.interaction) gameObject.interaction(this);
        });
      } else {
        this.agent.setDistinction(x, y, 0);
      }
    }
  }

  onSelected(): void {}

  public setLookAt(gameObject: GameObject): void {
    super.setLookAt(gameObject);
    // socket.emit("player_animation", { animation: this.animation.name , });
  }

  public clearPath(): void {
    this.agent.setPath([]);
  }

  interaction(gameObject: GameObject): void {
  }
  // public move(x: number, y: number, animation: string): void {
  //   super.move(x, y, animation);
  //   socket.emit("update_gameobject", { className: "Character", objectId: this.objectId, name: this.name, x: this.x, y: this.y, animation: { name: animation, isStop: this.animation.isStop } });
  // }
}
