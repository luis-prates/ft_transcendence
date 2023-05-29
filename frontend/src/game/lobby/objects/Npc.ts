import { Character } from "@/game/base/Character";
import oie_transparent from "@/assets/images/lobby/oie_transparent.png";
import { Game, Menu, Player } from "@/game";
import { SpeechBubble } from "../../Menu/SpeechBubble";
import { Shop } from "../../Menu/Shop";
import { ConfirmButton } from "@/game/Menu/ConfirmButton";
import { CreateGame } from "@/game/Menu/CreateGame";

export class Npc extends Character {
  constructor() {
    super();
    this.type = "npc";
    this.animation.sx = 144;
    this.x = 320;
    this.y = 680;
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
    Game.instance.addMenu(new Shop().menu);
  }
}
