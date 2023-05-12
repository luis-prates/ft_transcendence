import { Player } from "src/lobby/Lobby";

export class Player_Pong {

  width: number = 30;
  height: number = 100;
  socket: Player;
  player_n: number;
  y: number = 0;
  x: number = 0;
  speed: number = 10;
  score: number = 0;
  nickname: string;
  avatar: any;

  constructor(player_n: number, playerLobby: Player) {

    this.socket = playerLobby;
    this.player_n = player_n;
    this.nickname = playerLobby.data.name;
    //this.avatar.src = avatar;
  }

  move(y: number)
  {
    this.y = y;
  }

  point() {
    this.score++;
  }
}
