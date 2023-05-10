import socket from "@/socket/Socket";
import { Game } from "../base/Game";
import type { GameObject } from "../base/GameObject";
import { Map } from "./objects/Map";

import { Character, type CharacterOnline } from "../base/Character";
import { Npc } from "./objects/Npc";
import type { Player } from "..";
// interface eventsUpdate {
//   data: CharacterOnline;
//   character: Character;
// }

export class Lobby extends Game {
  private characterOnline: Character[] = [];

  constructor(map: Map, player: Player) {
    super(map, player);
    this.addGameObject(new Npc());
    socket.on("new_player", (data: CharacterOnline) => {
      console.log("lobby -> new_playe: ", data);
      this.characterOnline.push(this.addGameObject(new Character(data)) as Character);
      console.log(this.gameObjets.length);
    });

    socket.on("player_disconnect", (data: CharacterOnline) => {
      console.log("player_disconnect: ", data);
      for (let gameObject of this.characterOnline) {
        if (gameObject.objectId === data.objectId) {
          this, this.removeGameObject(gameObject);
          break;
        }
      }
    });

    socket.on("player_move", (data: CharacterOnline) => {
      console.log("player_move: ", data);
      for (let gameObject of this.characterOnline) {
        if (gameObject.objectId === data.objectId) {
          gameObject.setDados(data);
          break;
        }
      }
    });

    socket.on("player_look_all", (data: any) => {
      console.log("player_look_all: ", data);
      for (let gameObject of this.characterOnline) {
        if (gameObject.objectId === data.objectId) {
          const isStop = gameObject.animation.isStop;
          gameObject.animation.setAnimation(data.animation);
          gameObject.animation.setStop(isStop);
          break;
        }
      }
    });
  }

  draw(): void {
    super.draw();
  }
}
