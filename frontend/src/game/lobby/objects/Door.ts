import type { GameObject, GameObjectType } from "@/game/base/GameObject";
import { Game, Lobby, Map } from "@/game";
import { socketClass } from "@/socket/SocketClass";
import type { Socket } from "socket.io-client";

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
  public lobbySocket: Socket = socketClass.getLobbySocket();

  constructor(data: { x: number; y: number; objectId: number; mapName: string; mapPosition: { x: number; y: number } }) {
    this.setData(data);
  }

  draw(contex: CanvasRenderingContext2D): void {

  }

  setData(data: any): void {
    this.x = data.x;
    this.y = data.y;
    this.objectId = data.objectId;
    this.mapName = data.mapName;
    this.mapPosition = data.mapPosition;
  }

  interaction(gameObject: GameObject): void {
    Lobby.isLoaded.value = false;
    Game.lastPosition = undefined;
    this.lobbySocket.emit("join_map", {
      userId: gameObject.objectId, objectId: gameObject.objectId, map: {
        name: this.mapName,
        position: this.mapPosition
      }
    });
  }

  public getPointEvent(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  onSelected(): void {
  }
}
