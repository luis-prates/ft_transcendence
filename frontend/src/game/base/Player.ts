import { Character } from "./Character";
import socket from "@/socket/Socket";
import { PathFinding } from "../path_finding/PathFinding";
import { Map } from "./Map";

export class Player extends Character {
  constructor() {
    super();
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
    console.log("this.agent.getDistinction(this.x, this.y, x, y)");
    if (button == 0) {
      this.agent.setDistinction(this.x, this.y, x, y, 0);
      socket.emit("player_move", { objectId: this.objectId, name: this.name, x: this.x, y: this.y, pathFinding: this.agent.getPath() });
    }
  }
}
