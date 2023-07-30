import type { GameObject, GameObjectType } from "@/game/base/GameObject";
import { ref } from "vue";
import { Player, Map, Game } from "@/game";

export class Camera {
  x = 0;
  y = 0;
  private _width = undefined;
  private _height = undefined;
  private map: Map;
  private player: GameObject;

  constructor(player: GameObject, map: Map) {
    this.map = map;
    console.log("map: ", map.w, map.h);
    this.player = player;
    this.x = 0;
    this.y = 0;
    // this.width = map.w;
    // this.height = map.h;
  }

  get width() {
    return this._width || window.innerWidth;
  }

  set width(value) {
    this._width = value;
  }

  get height() {
    return this._height || window.innerHeight;
  }

  set height(value) {
    this._height = value;
  }

  leftEdge() {
    return this.x + this.width * 0.25;
  }
  rightEdge() {
    return this.x + this.width * 0.25;
  }

  topEdge() {
    return this.y + this.height * 0.25;
  }

  bottomEdge() {
    return this.y + this.height * 0.25;
  }

  render(context: CanvasRenderingContext2D, gameObjecs: GameObject[]) {
    context.save();
    context.translate(-this.x, -this.y);
    gameObjecs = gameObjecs.sort((a, b) => a.y - b.y);
    for (let gameObjec of gameObjecs) {
      gameObjec.draw(context);
    }
	this.map.drawLayer_3(context);
    Game.instance.drawMenuLocal(context);
    context.restore();
  }

  update() {
    //limite do this.player
    if (this.player.x < 0) {
      this.player.x = 0;
    }
    if (this.player.x + this.player.w > this.map.w) {
      this.player.x = this.map.w - this.player.w;
    }
    if (this.player.y < 0) {
      this.player.y = 0;
    }
    if (this.player.y + this.player.h > this.map.h) {
      this.player.y = this.map.h - this.player.h;
    }

    //atualizar a posição da câmera em função do this.player
    if (this.player.x < this.leftEdge()) {
      this.x = this.player.x - this.width * 0.25;
    }
    if (this.player.x + this.player.w > this.rightEdge()) {
      this.x = this.player.x + this.player.w - this.width * 0.75;
    }
    if (this.player.y < this.topEdge()) {
      this.y = this.player.y - this.height * 0.25;
    }
    if (this.player.y + this.player.h > this.bottomEdge()) {
      this.y = this.player.y + this.player.h - this.height * 0.75;
    }

    //limite da câmera
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.width > this.map.w) {
      this.x = this.map.w - this.width;
    }
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y + this.height > this.map.h) {
      this.y = this.map.h - this.height;
    }
  }
}
