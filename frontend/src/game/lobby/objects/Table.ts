import type { GameObject } from "@/game";
import type { GameObjectType } from "@/game/base/GameObject";
import table from "@/assets/images/lobby/table0.png";

export class Table implements GameObject {
  type: GameObjectType = "item";
  imagem: any = new Image();
  x: number;
  y: number;
  w: number;
  h: number;
  isSelect: boolean;
  color: string;

  constructor(color: string = "green") {
    this.color = color;
    this.x = 100;
    this.y = 100;
    this.w = 32;
    this.h = 64;
    this.isSelect = false;
    this.imagem.src = table;
  }

  private pontoEvento = [
    { x: 13, y: 68, isFree: true },
    { x: 13, y: -0, isFree: true },
  ];

  draw(contex: CanvasRenderingContext2D): void {
    contex.fillStyle = this.color;
    contex.fillRect(this.x, this.y, this.w - 1, this.h - 14);
    contex.drawImage(this.imagem, this.x, this.y, this.w, this.h);
    // this.pontoEvento.forEach((ponto) => {
    //   contex.fillStyle = ponto.isFree ? "yellow" : "red";
    //   contex.fillRect(this.x + ponto.x, this.y + ponto.y, 6, 6);
    // });
  }

  update(deltaTime: number): void {}

  getPointEvent(): { x: number; y: number } {
    console.log("getPointEvent: ", this.pontoEvento);
    let _ponto = { x: this.x, y: this.y };

    for (let ponto of this.pontoEvento) {
      if (ponto.isFree && _ponto.x === this.x && _ponto.y === this.y) {
        ponto.isFree = false;
        console.log("ponto: ", ponto);
        _ponto = { x: this.x + ponto.x, y: this.y + ponto.y };
      } else ponto.isFree = true;
    }
    return _ponto;
  }
}
