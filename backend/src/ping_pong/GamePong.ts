import { Player } from "src/lobby/Lobby";
import { Ball } from "./Ball";
import { Player_Pong } from "./PlayerPong";
import { Socket } from "socket.io";

interface gameResquest {
  objectId: string, 
  maxScore: number
}

export class Game {

  maxPoint = 3;
  status: string = "waiting";
  player1: Player_Pong;
  player2: Player_Pong;
  Ball: Ball;
  whatchers: Player[] = [];
  data: gameResquest;

  constructor(gameResquest: gameResquest) {
    this.data = gameResquest;
   // this.maxPoint = gameResquest.maxPoint;
   // this.player1 = new Player_Pong(1, gameResquest.player1);
   // this.player2 = new Player_Pong(2, gameResquest.player2);
    this.Ball = new Ball(0, 0, 0, 0, 0);
  }

  addUsers(user: Player)
  {
    if (!this.player1)
      this.player1 = new Player_Pong(1, user);
    else if (!this.player2)
    {
      this.player2 = new Player_Pong(2, user);
      this.player1.socket.emit("start_game", 1);
      this.player2.socket.emit("start_game", 2);
    }
    else if (!this.whatchers.includes(user))
      this.whatchers.push(user);
    
    console.log("p1: ", this.player1, " p2: ", this.player2, " ws: ", this.whatchers);
  }

  emitWatchers(event: string, data: any): void {
    this.whatchers.forEach((clientSocket) => {
      if (clientSocket.id !== this.player1.socket.id || clientSocket.id !== this.player2.socket.id)
        clientSocket.emit(event, data);
    });
  }

  emitPlayers(event: string, data: any): void {
    this.player1.socket.emit(event, data);
    this.player2.socket.emit(event, data);
  }

  emitAll(event: string, data: any): void {
    this.emitPlayers(event, data);
    this.emitWatchers(event, data);
  }

  isEndGame() {
    if (this.player1.score === this.maxPoint || this.player2.score === this.maxPoint) return true;
      return false;
  }

  endGame(player_n: number) {
    if (player_n === 1)
    {
      this.player1.socket.emit("end_game", { data: "win"});
      this.player2.socket.emit("end_game", { data: "lose"});
      this.emitWatchers("end_game", { data: "player1"});
    }
    else if (player_n === 2)
    {
      this.player1.socket.emit("end_game", { data: "win"});
      this.player2.socket.emit("end_game", { data: "lose"});
      this.emitWatchers("end_game", { data: "player2"});
    }
  }

  makePoint(player_n: number)
  {
    this.status = "waiting";

    if (player_n === 1)
    {
      this.player1.point();
      
    }
    else if (player_n === 2)
      this.player2.point();
    
    if (this.isEndGame())
      this.endGame(player_n);
  }

  /*startGame()
  {
    if (this.s)
  }*/

}
