import { Character } from "@/game/base/Character";
import { type ElementUI, Game, Menu, Player } from "@/game";
import { SpeechBubble } from "../../Menu/SpeechBubble";
import { Shop } from "../../Menu/Shop";
import { userStore } from "@/stores/userStore";

export class Npc extends Character {
  public message: string[];
  public typeNpc: string = "npc";

  constructor(data?: any) {
    super();
    this.nickname = "Shop Amelia";
    this.type = "npc";
    this.animation.sx = 144;
    this.x = 1850;
    this.y = 700;
    this.message = [];
    // console.log("npc: ", this.x, this.y);
    if (data) this.setData(data);
  }

  private pontoEvento = [
    { x: -16, y: 16 },
    { x: 48, y: 16 },
    // { x: 16, y: 48 },
    // { x: 16, y: -48 },
  ];

  public setData(data: any): void {
    //console.log("npc: ", data);
    if (data?.animation != undefined) {
      this.animation?.setAnimation(data.animation.name);
      this.animation?.setStop(data.animation.isStop);
    }
    if (data?.objectId != undefined) this.objectId = data.objectId;
    if (data?.x != undefined) this.x = data.x;
    if (data?.y != undefined) this.y = data.y;
    if (data?.nickname != undefined) this.nickname = data.nickname;
    if (data?.typeNpc != undefined) this.typeNpc = data.typeNpc || "npc";
    if (data?.avatar != undefined) {
      this.avatar = data.avatar || 1;
      this.animation.sx = (this.avatar - 4 >= 0 ? this.avatar - 4 : this.avatar) * 144;
      this.animation.sy = (this.avatar - 4 >= 0 ? 1 : 0) * 320;
    }
  }

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
    
    if (this.typeNpc == "shop")
    {
      userStore().userSelected = "shop";
      return ;
    }
        
    if (this.typeNpc == "mafalda")
    {
      this.message = [
      "Hi, " + userStore().user.nickname + "! I'm Mafalda, the Headmaster for 42 Lisboa!\n\
      I will explation the \"Pong Game\" rules! Click here to see the rules or click in red button for close.",
      "Objective:\n\
      Direct the ball past your opponent's paddle to score a point while preventing them from doing the same to you.",
      "Player Controls:\n\
      W: Move paddle up.\n\
      S: Move paddle down.",
      "Starting Play:\n\
      The ball is served from the center of the screen and moves in a random direction.\n\
      On subsequent serves, the ball moves in a random direction but towards the last scorer.",
      "Gameplay:\n\
      Paddles can only move vertically along their respective sides.\
      The ball bounces off walls and paddles.\
      If the ball passes a player's paddle and reaches the screen's edge, the opposing player scores a point.",
      "Winning:\n\
      The first player to reach a pre-determined number of points 3, 6, 9 or 12 wins the game.",
      "And, That's all! Thank you for seeing the rules."
    ];
      userStore().npcSelected = this;
      userStore().userSelected = "npc";
    }
    else if (this.typeNpc == "lili")
    {
      this.message = ["Hi! I'm Lili, the Security Guard for 42 Lisboa! Welcome!"];
      userStore().npcSelected = this;
      userStore().userSelected = "npc";
    }
  }
}
