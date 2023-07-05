import { Game } from "@/game";

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
  private speed: number;
  private frame: number = 0;
  private frameX: number = 0;
  private frameY: number = 0;
  private animation: animations = {};
  private currentAnimation: string = "";
  sx: number;
  sy: number;
  private size_w: number;
  private size_h: number;
  isStop = true;
  isRepeat;
  name: string = "";

  constructor(image: HTMLImageElement, size_w: number, size_h: number, speed: number, sx: number = 0, sy: number = 0, isRepeat: boolean = true) {
    this.image = image;
    this.size_w = size_w;
    this.size_h = size_h;
    this.speed = speed;
    this.sx = sx;
    this.sy = sy;
    this.isRepeat = isRepeat;
  }

  public init(image: HTMLImageElement, size_w: number, size_h: number, speed: number, sx: number = 0, sy: number = 0) {
    this.image = image;
    this.size_w = size_w;
    this.size_h = size_h;
    this.speed = speed;
    this.sx = sx;
    this.sy = sy;
    this.image = image;
    this.size_w = size_w;
    this.size_h = size_h;
    this.speed = speed;
    this.sx = sx;
    this.sy = sy;
  }

  public createAnimation(name: string, frames: animationList) {
    frames.frames = frames.frames.map((frame) => {
      frame.x = frame.x * this.size_w;
      frame.y = frame.y * this.size_h;
      return frame;
    });
    this.animation[name] = frames;
  }

  public setAnimation(name: string) {
    this.name = name;
    if (name != this.currentAnimation || this.isStop) this.currentAnimation = name;
    this.isStop = false;
  }

  public draw(contex: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    if (!this.isStop) {
      this.frame += this.speed * Game.deltaTime;
      if (this.frame >= this.animation[this.currentAnimation].frames.length) {
        this.frame = 0;
        //console.log("this.isRepeat", this.isRepeat);
        this.setStop(!this.isRepeat);
      }
    }
    this.frameX = this.animation[this.currentAnimation]?.frames[Math.floor(this.frame)].x + this.sx;
    this.frameY = this.animation[this.currentAnimation]?.frames[Math.floor(this.frame)].y + this.sy;
    contex.drawImage(this.image, this.frameX, this.frameY, this.size_w, this.size_h, x, y, w, h);
  }

  public setStop(isStop: boolean) {
    if (isStop) this.frame = 1;
    this.isStop = isStop;
  }
}
