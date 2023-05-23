import type { GameObject, GameObjectType } from "@/game/base/GameObject";
import { Game, Map } from "@/game";
import waterfont from "@/assets/images/lobby/water_font.png";
import { AnimationController } from "@/game/animation/AnimationController";

export class WaterFont implements GameObject {
  type: GameObjectType = "water_font";
  imagem: any = new Image();
  x: number = 0;
  y: number = 0;
  w: number = 96;
  h: number = 64;
  sx: number = 0;
  sy: number = 0;
  objectId: number = 0;
  isSelect: boolean = false;
  animation: AnimationController = new AnimationController(this.imagem, 96, 64, 8);

  constructor(data: { x: number; y: number; w: number; h: number; sx: number; sy: number; frames: { x: number; y: number }[] }) {
    this.setData(data);
    this.imagem.src = waterfont;
    Game.grid[Math.floor(this.x / Map.SIZE)][Math.floor(this.y / Map.SIZE)] = 1;
  }

  draw(contex: CanvasRenderingContext2D): void {
    this.animation.draw(contex, this.x + this.sx, this.y + this.sy, this.w, this.h);
  }

  setData(data: any): void {
    this.x = data.x;
    this.y = data.y;
    this.w = data.w;
    this.h = data.h;
    this.sx = data.sx;
    this.sy = data.sy;
    this.animation = new AnimationController(this.imagem, data.w, data.h, 8, data?.aimation_sx, data?.aimation_sy);
    this.animation.createAnimation("font", {
      frames: data.frames,
    });
    this.animation.setAnimation("font");
  }

  public getPointEvent(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  destroy(): void {
    Game.grid[Math.floor(this.x / Map.SIZE)][Math.floor(this.y / Map.SIZE)] = 0;
  }
}
