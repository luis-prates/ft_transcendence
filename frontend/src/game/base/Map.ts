import type { GameObject } from "./GameObject";
import titles from "@/assets/images/lobby/tiles.png";

export class Map implements GameObject {
  imagem: any = new Image();
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;

  constructor() {
    this.imagem.src = titles;
    this.w = 1000;
    this.h = 1000;
  }

  draw(contex: CanvasRenderingContext2D): void {
    for (let x = 0; x < this.w; x++) {
      for (let y = 0; y < this.h; y++) {
        contex.drawImage(this.imagem, 576, 0, 32, 32, (x * 32), y * 32, 32, 32);
      }
    }
  }

  update(deltaTime: number): void {

  }

}
