import imgUrl from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg";
import type { GameObject } from "./GameObject";
import { Game, type Inputhandler } from "./Game";
import { AnimationController } from "../animation/AnimationController";
import { Character } from "./Character";
import socket from "@/socket/Socket";

export class Player extends Character {

  constructor() {
    super();
    this.name = "Player_" + Date.now();
    socket.emit("new_player", { objectId: this.objectId, name: this.name, x: this.x, y: this.y, animation: { name: this.animation.name, isStop: this.animation.isStop }});
  }

  keyDown(key: string[]): void {
    if (key.includes("w")) (this.y -= this.speed * Game.deltaTime), this.animation?.setAnimation("walk_top");
    if (key.includes("s")) (this.y += this.speed * Game.deltaTime), this.animation?.setAnimation("walk_bottom");
    if (key.includes("a")) (this.x -= this.speed * Game.deltaTime), this.animation?.setAnimation("walk_left");
    if (key.includes("d")) (this.x += this.speed * Game.deltaTime), this.animation?.setAnimation("walk_right");
    // if (key.includes("p")) {
    //   this.animation?.stop(1);
    // }
    this.animation.setStop(false);
    socket.emit("player_move", { objectId: this.objectId, name: this.name, x: this.x, y: this.y, animation: { name: this.animation.name, isStop: this.animation.isStop }});
  }

  keyUp(key: string[]): void {
    if (!key.includes("w") || !key.includes("s") || !key.includes("a") || !key.includes("d")) this.animation?.setStop(true)
    socket.emit("player_move", { objectId: this.objectId, name: this.name, x: this.x, y: this.y, animation: { name: this.animation.name, isStop: this.animation.isStop }});
  }

}
