import socket from "@/socket/Socket";
import { Game } from "../base/Game";
import type { GameObject } from "../base/GameObject";
import { Map } from "../base/Map";
import { Character, type CharacterOnline } from "../base/Character";
interface eventsUpdate {
  data: CharacterOnline;
  character: Character;
}

export class Lobby extends Game {
  private characterOnline: Character[] = [];

  constructor() {
    super();
    this.addGameObject(new Map());
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
  }

  draw(): void {
    super.draw();
  }
}
