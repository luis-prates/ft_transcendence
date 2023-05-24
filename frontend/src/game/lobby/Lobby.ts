import socket from "@/socket/Socket";
import { Game, Menu, type ElementUI } from "@/game";
import { Map } from "./objects/Map";

import { Npc } from "./objects/Npc";
import { type Player } from "..";

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

    const menu = new Menu();
    const element: ElementUI & any = {
      type: "button",
      retanglulo: {
        x: 10,
        y: "10%",
        w: "10%",
        h: "10%",
      },
      onClick: () => console.log("Criar NPC"),
      draw(contex: any) {
        contex.fillStyle = "red";
        contex.fillRect(this.retanglulo.x, this.retanglulo.y, this.retanglulo.w, this.retanglulo.h);
      },
      imagem: null,
    };
    // menu.layer = "Global";
    menu.add(element);
    this.addMenu(menu);
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
