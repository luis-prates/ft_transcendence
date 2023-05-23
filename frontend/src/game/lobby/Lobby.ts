import socket from "@/socket/Socket";
import { Game } from "@/game";
import { Map } from "./objects/Map";

import { Character, type CharacterOnline } from "../base/Character";
import { Npc } from "./objects/Npc";
import { Table, type Player } from "..";

export class Lobby extends Game {
  constructor(map: Map, player: Player) {
    super(map, player);
    this.addGameObject(new Npc());
    console.log("Lobby", " SOCKET ON");
    socket.on("new_gameobject", (data: any) => {
      console.log("new_gameobject", data);
      this.addGameObjectData(data);
    });

    socket.on("update_gameobject", (data: any) => {
      for (let gameObject of this.gameObjets) {
        if (gameObject.objectId === data.objectId) {
          gameObject.setData(data);
          break;
        }
      }
    });

    socket.on("remove_gameobject", (data: any) => {
      console.log("remove_gameobject", data);
      for (let gameObject of this.gameObjets) {
        if (gameObject.objectId === data.objectId) {
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

  destructor(): void {
    super.destructor();
    socket.off("new_gameobject");
    socket.off("update_gameobject");
    socket.off("remove_gameobject");
  }
}
