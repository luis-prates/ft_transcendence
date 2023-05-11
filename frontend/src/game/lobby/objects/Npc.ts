import { Character } from "@/game/base/Character";

export class Npc extends Character {
  constructor() {
    super();
    this.type = "npc";
    this.animation.sx = 144;
    this.x = 320;
    this.y = 320;
  }

  private pontoEvento = [
    { x: -16, y: 16 },
    { x: 48, y: 16 },
    // { x: 16, y: 48 },
    // { x: 16, y: -48 },
  ];

  draw(context: CanvasRenderingContext2D): void {
    super.draw(context);
    // this.pontoEvento.forEach((p) => {
    //   let ponto: any = { x: this.x + p.x, y: this.y + p.y };
    //   context.beginPath();
    //   context.arc(ponto.x, ponto.y, 5, 0, 2 * Math.PI);
    //   context.fillStyle = "red";
    //   context.fill();
    //   context.closePath();
    // });
  }

  public getPointEvent(): { x: number; y: number } {
    const pontoRomdom = Math.floor(Math.random() * this.pontoEvento.length);
    const ponto = this.pontoEvento[pontoRomdom];
    console.log("Npc -> getPointEvent -> ponto", ponto);
    return { x: this.x + ponto.x, y: this.y + ponto.y };
  }
}
