import { Game } from "../base/Game";

export interface framePosition {
  x: number;
  y: number;
}

interface animationList {
  frames: framePosition[];
}

interface animations {
  [key: string]: animationList;
}

export class AnimationController {
  private image: HTMLImageElement;
  private w: number;
  private h: number;
  private speed: number;
  private frame: number = 0;
  private frameX: number = 0;
  private frameY: number = 0;
  private animation: animations = {};
  private currentAnimation: string = "";
  private size_w: number;
  private size_h: number;
  private isStop = true;

  constructor(image: HTMLImageElement, size_w: number, size_h: number, speed: number) {
    this.image = image;
    this.w = image.width / size_w;
    this.h = image.height / size_h;
    this.size_w = size_w;
    this.size_h = size_h;
    console.log(image.width, image.height, size_w, size_h, this.w, this.h);
    this.speed = speed;
  }

  public createAnimation(name: string, frames: animationList) {
    frames.frames = frames.frames.map((frame) => {
      frame.x = frame.x * this.size_w;
      frame.y = frame.y * this.size_h;
      return frame;
    });
    console.log(frames);
    this.animation[name] = frames;
  }

  public setAnimation(name: string) {
    if (name != this.currentAnimation || this.isStop) this.currentAnimation = name;
    console.log(this.currentAnimation);
    this.isStop = false;
  }

  public draw(contex: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    if (!this.isStop) {
      this.frame += this.speed * Game.deltaTime;
      if (this.frame >= this.animation[this.currentAnimation].frames.length) {
        this.frame = 0;
      }
    }
    this.frameX = this.animation[this.currentAnimation]?.frames[Math.floor(this.frame)].x;
    this.frameY = this.animation[this.currentAnimation]?.frames[Math.floor(this.frame)].y;
    contex.drawImage(this.image, this.frameX, this.frameY, this.size_w, this.size_h, x, y, w, h);
  }

  public stop(frame: number = 0) {
    this.frame = frame;
    this.isStop = true;
  }

  public play() {
    this.isStop = false;
  }

  public isStoped() {
    return this.isStop;
  }
}
