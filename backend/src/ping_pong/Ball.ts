export class Ball {
  width: number = 25;
  height: number = 25;
  x: number = 0;
  y: number = 0;
  dir: number = 1;
  speed: number;
  angle: number = 0;

  constructor(x: number, y: number, dir: number, speed: number, angle: number) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.angle = speed;
  }

  updateBall(x: number, y: number, dir: number, speed: number, angle: number) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.angle = speed;
  }
}
