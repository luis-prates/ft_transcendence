import imgUrl from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg";
import type { GameObject } from "./GameObject";
import { Game, type Inputhandler } from "./Game";
import { AnimationController } from "../animation/AnimationController";

export class Player implements GameObject {
  imagem: any = new Image();
  x: number = 64.5;
  y: number = 64.5;
  w: number = 48;
  h: number = 80;
  speed: number = 70;
  frameX: number = 0;
  frameY: number = 0;
  gameFrame: number = 0;
  staggerFrame: number = 660000;
  private animation: AnimationController | null = null;

  constructor() {
    this.imagem.src = imgUrl;
    this.imagem.onload = () => {
      this.animation = new AnimationController(this.imagem, 48, 80, 5);
      this.animation?.createAnimation("idle", {
        frames: [{ x: 0, y: 0 }],
      });
      this.animation?.createAnimation("walk_top", {
        frames: [
          { x: 0, y: 3 },
          { x: 1, y: 3 },
          { x: 2, y: 3 },
        ],
      });
      this.animation?.createAnimation("walk_left", {
        frames: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      });
      this.animation?.createAnimation("walk_right", {
        frames: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
        ],
      });
      this.animation?.createAnimation("walk_bottom", {
        frames: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      });
      this.animation?.setAnimation("walk_bottom");
      this.animation?.stop(1);
    };
  }

  draw(contex: CanvasRenderingContext2D): void {
    this.animation?.draw(contex, this.x, this.y, this.w, this.h);
  }

  update(deltaTime: number): void {}

  keyDown(key: string[]): void {
    if (key.includes("w")) (this.y -= this.speed * Game.deltaTime), this.animation?.setAnimation("walk_top");
    if (key.includes("s")) (this.y += this.speed * Game.deltaTime), this.animation?.setAnimation("walk_bottom");
    if (key.includes("a")) (this.x -= this.speed * Game.deltaTime), this.animation?.setAnimation("walk_left");
    if (key.includes("d")) (this.x += this.speed * Game.deltaTime), this.animation?.setAnimation("walk_right");
    if (key.includes("p")) {
      this.animation?.stop(1);
    }
  }

  keyUp(key: string[]): void {
    if (!key.includes("w") || !key.includes("s") || !key.includes("a") || !key.includes("d")) this.animation?.stop(1);
  }
}
