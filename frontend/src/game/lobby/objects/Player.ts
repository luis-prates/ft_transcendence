import { Character } from "../../base/Character";
import socket from "@/socket/Socket";
import { Map } from "./Map";
import { Game } from "@/game/base/Game";
import type { GameObject } from "@/game/base/GameObject";
import { type Ref } from "vue";

export class Player extends Character {
  select: GameObject | undefined = undefined;
  private menu: Ref<HTMLDivElement | undefined>;

  constructor(menu: Ref<HTMLDivElement | undefined>) {
    super();
    this.menu = menu;
    this.menu.value?.setAttribute("style", "display: none");
    this.type = "player";
    this.name = "Player_" + Date.now();
    socket.emit("new_player", { objectId: this.objectId, name: this.name, x: this.x, y: this.y, animation: { name: this.animation.name, isStop: this.animation.isStop } });
  }

  draw(contex: CanvasRenderingContext2D): void {
    super.draw(contex);
    contex.fillStyle = "yellow";
    this.agent.getPath().forEach((node) => {
      contex.fillStyle = "green";
      // no centro do grid
      contex.fillRect(node.x * Map.SIZE + 10, node.y * Map.SIZE + 10, 6, 6);
      //   contex.fillRect(node.x * Map.SIZE, node.y * Map.SIZE, Map.SIZE, Map.SIZE);
    });
    if (this.agent.getPath().length > 0) {
      contex.fillStyle = "blue";
      contex.fillRect(this.agent.getPath()[this.agent.getPath().length - 1].x * Map.SIZE + 10, this.agent.getPath()[this.agent.getPath().length - 1].y * Map.SIZE + 10, 6, 6);
    }
  }
  mouseClick?(x: number, y: number, button: number): void {
    this.menu.value?.setAttribute("style", "display: none");
    if (button == 0) {
      this.select = Game.MouseColision(x, y);
      if (this.select && this.select != this) {
        console.log(this.select);
        this.agent.setDistinctionObject(this.select, (gameObject) => {
          if (gameObject instanceof Character) (gameObject as Character).setLookAt(this);
          this.menu.value?.setAttribute("style", "top: " + y + "px; left: " + x + "px; display: block");
        });
      } else {
        this.agent.setDistinction(x, y, 0);
      }
      socket.emit("player_move", { objectId: this.objectId, name: this.name, x: this.x, y: this.y, pathFinding: this.agent.getPath() });
    }
  }

  onSelected(): void {}

  public setLookAt(gameObject: GameObject): void {
    super.setLookAt(gameObject);
    // socket.emit("player_animation", { animation: this.animation.name , });
  }
}
