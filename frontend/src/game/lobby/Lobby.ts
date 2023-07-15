import { Game, Map, Menu, Npc, type ElementUI, type Player } from "@/game";
import { io, type Socket } from "socket.io-client";
import { env } from "../../env";
import { userStore } from "../../stores/userStore";
import { socketClass } from "../../socket/SocketClass";

export class Lobby extends Game {
  private list_update_gameobject: any[] = [];
  private user = userStore().user;
  public lobbySocket: Socket = socketClass.getLobbySocket();

  constructor(map: Map, player: Player) {
    super(map, player);
    this.addGameObject(new Npc());
	this.lobbySocket.on("new_gameobject", (data: any) => {
      this.addGameObjectData(data);
      console.log("new_gameobject", data);
    });

    this.lobbySocket.on("update_gameobject", (data: any) => this.list_update_gameobject.push(data));

    this.lobbySocket.on("remove_gameobject", (data: any) => {
      for (let gameObject of this.gameObjets) {
        if (gameObject.objectId == data.objectId) {
          if (gameObject.destroy) gameObject.destroy();
          this.removeGameObject(gameObject);
          break;
        }
      }
    });
  }

  draw(): void {
    super.draw();
  }

  update(): void {
    for (let data of this.list_update_gameobject) {
      for (let gameObject of this.gameObjets) {
        if (gameObject.objectId == data.objectId) {
          gameObject.setData(data);
          break;
        }
      }
    }
    this.list_update_gameobject = [];
    super.update();
  }

  destructor(): void {
    super.destructor();
    this.lobbySocket.off("new_gameobject");
    this.lobbySocket.off("update_gameobject");
    this.lobbySocket.off("remove_gameobject");
  }
}
