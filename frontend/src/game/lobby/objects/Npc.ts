import { Character } from "@/game/base/Character";
import oie_transparent from "@/assets/images/lobby/oie_transparent.png";
import { Game, Menu } from "@/game";

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
  }

  public getPointEvent(): { x: number; y: number } {
    const pontoRomdom = Math.floor(Math.random() * this.pontoEvento.length);
    const ponto = this.pontoEvento[pontoRomdom];
    return { x: this.x + ponto.x, y: this.y + ponto.y };
  }

  public interaction(gameObject: Character): void {
    this.setLookAt(gameObject);

    const image = new Image();
    image.src = oie_transparent;
    image.onload = () => {
      const menu = new Menu({ timeOut: 5000 });
      const element = {
        type: "image",
        retanglulo: { x: this.x + 5, y: this.y - (this.h + 40), w: 100, h: 100 },
        draw: (context: any) => {
          context.drawImage(image, element.retanglulo.x, element.retanglulo.y, element.retanglulo.w, element.retanglulo.h);
        },
      };
      const element2 = {
        type: "text",
        retanglulo: { x: this.x + 5, y: this.y - (this.h + 40), w: 100, h: 100 },
        draw: (context: any) => {
          context.font = "20px Arial";
          context.fillStyle = "red";
          context.fillText("Ola", element.retanglulo.x + 10, element.retanglulo.y + 20);
        },
      };
      menu.add(element, element2);
      menu.onClose = () => {
        console.log("fechou");
        this.isSelect = false;
      };
      Game.instance.addMenu(menu);
    };
  }
}
