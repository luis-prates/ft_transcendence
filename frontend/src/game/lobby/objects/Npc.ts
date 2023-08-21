import { Character } from "@/game/base/Character";
import { type ElementUI, Game, Menu, Player } from "@/game";
import { SpeechBubble } from "../../Menu/SpeechBubble";
import { Shop } from "../../Menu/Shop";
import { userStore } from "@/stores/userStore";

export class Npc extends Character {
  public message: string;
  public timeOut: number;
  public typeNpc: string = "npc";

  constructor(data?: any) {
    super();
    this.nickname = "Shop Amelia";
    this.type = "npc";
    this.animation.sx = 144;
    this.x = 1850;
    this.y = 700;
    this.message = "";
    this.timeOut = 10;
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
    console.log("npc: ", data);
    if (data?.animation != undefined) {
      this.animation?.setAnimation(data.animation.name);
      this.animation?.setStop(data.animation.isStop);
    }
    if (data?.objectId != undefined) this.objectId = data.objectId;
    if (data?.x != undefined) this.x = data.x;
    if (data?.y != undefined) this.y = data.y;
    if (data?.nickname != undefined) this.nickname = data.nickname;
    if (data?.typeNpc != undefined) this.typeNpc = data.typeNpc;
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
    /* userStore().npcSelected = this;
    userStore().userSelected = "npc";*/
    // Game.instance.addMenu(new Shop().menu);
    
    if (this.nickname == "Shop Amelia")
    {
      userStore().userSelected = "shop";
      // Game.instance.addMenu(new Shop().menu);
      return ;
    }
    
    //const m = new Menu({ KeyClose: "A" });
    
    if (this.nickname == "Mafalda")
    {
      this.message = "Hi, " + userStore().user.nickname + "! I'm Mafalda, the Headmaster for 42 Lisboa!";
      userStore().npcSelected = this;
      userStore().userSelected = "npc";
      // const e: ElementUI = {
      //   type: "button",
      //   rectangle: SpeechBubble.rectangleDimesion("Hi! I'm Mafalda, the Headmaster for 42 Lisboa!", this.x, this.y),
      //   draw: (c) => SpeechBubble.draw(c, e.rectangle, "Hi! I'm Mafalda, the Headmaster for 42 Lisboa!"),
      // };
      // m.add(e);
    }
    else if (this.nickname == "Lili")
    {
      this.message = "Hi! I'm Lili, the Security Guard for 42 Lisboa! Welcome!";
      userStore().npcSelected = this;
      userStore().userSelected = "npc";
      // const e: ElementUI = {
      //   type: "button",
      //   rectangle: SpeechBubble.rectangleDimesion("Hi! I'm Lili, the Security Guard for 42 Lisboa! Welcome!", this.x, this.y),
      //   draw: (c) => SpeechBubble.draw(c, e.rectangle, "Hi! I'm Lili, the Security Guard for 42 Lisboa! Welcome!"),
      // };
      // m.add(e);
    }
    // Game.addMenu(m);
  }
}
