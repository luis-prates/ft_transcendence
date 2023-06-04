import socket from "@/socket/Socket";
import { Game, Map, Menu, Npc, type ElementUI, type Player } from "@/game";

export class Lobby extends Game {
  private list_update_gameobject: any[] = [];

  constructor(map: Map, player: Player) {
    super(map, player);
    this.addGameObject(new Npc());
    socket.on("new_gameobject", (data: any) => {
      this.addGameObjectData(data);
      console.log("new_gameobject", data);
    });

    socket.on("update_gameobject", (data: any) => this.list_update_gameobject.push(data));

    socket.on("remove_gameobject", (data: any) => {
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
    socket.off("new_gameobject");
    socket.off("update_gameobject");
    socket.off("remove_gameobject");
  }
}
