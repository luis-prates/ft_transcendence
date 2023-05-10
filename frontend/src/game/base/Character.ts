import imgUrl from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg";
import type { GameObject, GameObjectType } from "./GameObject";
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
  type: GameObjectType = "character";
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
  isSelect: boolean = false;

  constructor(data?: CharacterOnline) {
    this.imagem.src = imgUrl;
    this.animation.init(this.imagem, 48, 80, 8);
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
  }

  public setDados(data: CharacterOnline) {
    if (data) {
      console.log("set: data", data);
      this.name = data.name;
      this.objectId = data.objectId;
      this.x = data.x;
      this.y = data.y;
      this.agent?.setPath(data.pathFinding);
      // this.animation?.setAnimation(data.animation.name);
      // this.animation?.setStop(data.animation.isStop);
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    if (this.isSelect) {
      context.beginPath();
      context.arc(this.x + this.w / 2, this.y + this.h / 2 - 5, 10, 0, 2 * Math.PI);
      context.fillStyle = "blue";
      context.fill();
      context.closePath();
    }
    this.animation?.draw(context, this.x, this.y - this.h / 2, this.w, this.h);
  }

  public move(x: number, y: number, animation: string) {
    this.x = x;
    this.y = y;
    this.animation?.setAnimation(animation);
  }

  update(deltaTime: number): void {
    this.agent.update(deltaTime);
  }

  onSelected(): void {
    this.isSelect = true;
  }

  onDeselected(): void {
    this.isSelect = false;
  }

  public setLookAt(gameObject: GameObject) {
    const isStop = this.animation.isStop;
    if (this.x > gameObject.x) {
      this.animation.setAnimation("walk_left");
    } else if (this.x < gameObject.x) {
      this.animation.setAnimation("walk_right");
    }
    if (this.y > gameObject.y) {
      this.animation.setAnimation("walk_top");
    }
    if (this.y < gameObject.y) {
      this.animation.setAnimation("walk_bottom");
    }
    this.animation.setStop(isStop);
  }
}
