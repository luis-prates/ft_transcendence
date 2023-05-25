import type { GameObject, GameObjectType } from "@/game/base/GameObject";
import { Map } from "@/game";
import socket from "@/socket/Socket";

export class Door implements GameObject {
  type: GameObjectType = "door";
  imagem: any;
  x: number = 0;
  y: number = 0;
  w: number = 32;
  h: number = 32;
  objectId: number = 0;
  isSelect: boolean = false;
  mapName: string = "";
  mapPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(data: { x: number; y: number; objectId: number; mapName: string; mapPosition: { x: number; y: number } }) {
    this.setData(data);
  }

  draw(contex: CanvasRenderingContext2D): void {
    contex.fillStyle = "#1821E7";
    contex.fillRect(this.x, this.y, Map.SIZE, Map.SIZE);
  }

  setData(data: any): void {
    this.x = data.x;
    this.y = data.y;
    this.objectId = data.objectId;
    this.mapName = data.mapName;
    this.mapPosition = data.mapPosition;
  }

  interaction(gameObject: GameObject): void {
    console.log("door -> interaction", gameObject);
    socket.emit("join_map", { objectId: gameObject.objectId, map: { name: "house", position: { x: 300, y: 300 } } });
  }

  public getPointEvent(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  onSelected(): void {
    console.log("door -> onSelected");
  }
}
