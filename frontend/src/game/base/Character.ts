import imgUrl from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg";
import type { GameObject } from "./GameObject";
import { AnimationController } from "../animation/AnimationController";
import { PathFinding, type PathNode } from "../path_finding/PathFinding";

export interface CharacterOnline {
  name: string;
  objectId: string;
  x: number;
  y: number;
  pathFinding: PathNode[];
}

export class Character implements GameObject {
  imagem: any = new Image();
  name: string = "player";
  objectId: string = "";
  x: number = 64;
  y: number = 64;
  w: number = 32;
  h: number = 80;
  speed: number = 0.2;
  frameX: number = 0;
  frameY: number = 0;
  gameFrame: number = 0;
  staggerFrame: number = 660000;
  animation: AnimationController = new AnimationController(this.imagem, 48, 80, 8);
  agent: PathFinding = new PathFinding(this);

  constructor(data?: CharacterOnline) {
    this.imagem.src = imgUrl;
    this.imagem.onload = () => {
      this.animation = new AnimationController(this.imagem, 48, 80, 8);
      this.animation.createAnimation("idle", {
        frames: [{ x: 0, y: 0 }],
      });
      this.animation.createAnimation("walk_top", {
        frames: [
          { x: 0, y: 3 },
          { x: 1, y: 3 },
          { x: 2, y: 3 },
        ],
      });
      this.animation.createAnimation("walk_left", {
        frames: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      });
      this.animation.createAnimation("walk_right", {
        frames: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
        ],
      });
      this.animation.createAnimation("walk_bottom", {
        frames: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      });
      this.animation.setAnimation("walk_bottom");
      this.animation.setStop(true);
      if (data) this.setDados(data);
    };
  }

  public setDados(data: CharacterOnline) {
    if (data) {
      console.log("set: data", data);
      this.name = data.name;
      this.objectId = data.objectId;
      this.x = data.x;
      this.y = data.y;
      this.agent.setPath(data.pathFinding);
      // this.animation?.setAnimation(data.animation.name);
      // this.animation?.setStop(data.animation.isStop);
    }
  }

  draw(contex: CanvasRenderingContext2D): void {
    this.animation?.draw(contex, this.x, this.y - this.h / 2, this.w, this.h);
  }

  public move(x: number, y: number, animation: string) {
    this.x = x;
    this.y = y;
    this.animation?.setAnimation(animation);
  }

  update(deltaTime: number): void {
    this.agent.update(deltaTime);
  }

  public isMouseColision(x: number, y: number): boolean {
    if (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h) {
      return true;
    }
    return false;
  }
}
