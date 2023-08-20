import { Character } from "@/game/base/Character";
import { Game, Menu, Player } from "@/game";
import { SpeechBubble } from "../../Menu/SpeechBubble";
import { Shop } from "../../Menu/Shop";
import { userStore } from "@/stores/userStore";

export class Npc extends Character {
  public message: string;
  public timeOut: number;

  constructor() {
    super();
    this.nickname = "Shop Amelia";
    this.type = "npc";
    this.animation.sx = 144;
    this.x = 1850;
    this.y = 700;
    this.message = "Bem vindos amigos!";
    this.timeOut = 10;
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
    userStore().userSelected = "shop";
   /* userStore().npcSelected = this;
    userStore().userSelected = "npc";*/
    // Game.instance.addMenu(new Shop().menu);
  }
}
