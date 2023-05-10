import type { GameObject, GameObjectType } from "@/game/base/GameObject";
import { ref } from "vue";
import { Player } from "./Player";

export class Camera implements GameObject {
  private player: Player = new Player(ref(undefined));

  constructor() {}
  type: GameObjectType = "camera";
  imagem: any = null;
  // x: number = 0;
  // y: number = 0;
  isSelect: boolean = false;

  draw(contex: CanvasRenderingContext2D): void {
    contex.fillStyle = "rgba(0,0,0,0.5)";
    contex.fillRect(10, 10, this.w, this.h);
    contex.strokeStyle = "white";
    contex.strokeRect(100, 100, this.w - 200, this.h - 200);
  }
  update(deltaTime: number): void {}

  public setPlayer(player: Player) {
    this.player = player;
  }

  get x(): number {
    return this.player.x - this.w / 2;
  }

  get y(): number {
    return this.player.y - this.h / 2;
  }

  get w(): number {
    return window.innerWidth;
  }

  get h(): number {
    return window.innerHeight - 700;
  }
}
