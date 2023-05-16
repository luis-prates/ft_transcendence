import { Player } from 'src/lobby/Lobby';
import { Ball } from './Ball';
import { Player_Pong } from './PlayerPong';
import { Socket } from 'socket.io';
import { type gameResquest, type gamePoint } from './SocketInterface';

export enum Status {
  Waiting,
  Starting,
  InGame,
  Finish,
}

export class Game {
  maxPoint = 3;
  status: number = Status.Waiting;
  player1: Player_Pong;
  player2: Player_Pong;
  ball: Ball;
  whatchers: Player[] = [];
  data: gameResquest;

  constructor(gameResquest: gameResquest) {
    this.data = gameResquest;
    // this.maxPoint = gameResquest.maxPoint;
    // this.player1 = new Player_Pong(1, gameResquest.player1);
    // this.player2 = new Player_Pong(2, gameResquest.player2);
    this.ball = new Ball(0, 0, 0, 0, 0);
  }

  addUsers(user: Player) {
    if (!this.player1) {
      this.player1 = new Player_Pong(1, user);
      console.log('player1 connect');
    } else if (!this.player2) {
      this.player2 = new Player_Pong(2, user);
      console.log('player2 connect');
      this.player1.socket.emit('start_game', {
        player: 1,
        status: Status.Starting,
      });
      this.player2.socket.emit('start_game', {
        player: 2,
        status: Status.Starting,
      });
      console.log('emit_start_game');
      this.startGame();
    } else if (!this.whatchers.includes(user)) this.whatchers.push(user);

    //console.log("p1: ", this.player1, " p2: ", this.player2, " ws: ", this.whatchers);
  }

  emitWatchers(event: string, data: any): void {
    this.whatchers.forEach((clientSocket) => {
      if (
        clientSocket.id !== this.player1.socket.id ||
        clientSocket.id !== this.player2.socket.id
      )
        clientSocket.emit(event, data);
    });
  }

  countdown(seconds: number) {
    console.log(seconds);

    if (seconds > 0) {
      this.emitAll('game_counting', seconds);

      setTimeout(() => {
        this.countdown(seconds - 1);
      }, 1000);
    } else {
      this.emitAll('game_counting', 0);
      this.status = Status.InGame;
    }
  }

  startGame() {
    if (this.status != Status.Finish) this.countdown(4);
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
    if (
      this.player1.score >= this.maxPoint ||
      this.player2.score >= this.maxPoint
    )
      return true;
    return false;
  }

  endGame(player_n: number) {
    if ((player_n == 1 || player_n == 2) && this.status != Status.Finish) {
      if (player_n === 1) {
        this.player1.socket.emit('end_game', {
          objectId: this.data.objectId,
          result: 'You Win!',
        });
        this.player2.socket.emit('end_game', {
          objectId: this.data.objectId,
          result: 'You Loose!',
        });
        this.emitWatchers('end_game', {
          objectId: this.data.objectId,
          result: this.player1.nickname + ' Win!',
        });
      } else if (player_n === 2) {
        this.player1.socket.emit('end_game', {
          objectId: this.data.objectId,
          result: 'You Loose!',
        });
        this.player2.socket.emit('end_game', {
          objectId: this.data.objectId,
          result: 'You Win!',
        });
        this.emitWatchers('end_game', {
          objectId: this.data.objectId,
          result: this.player2.nickname + ' Win!',
        });
      }
      this.status = Status.Finish;
      //INSERT IN DATABASE
    }
  }

  makePoint(player_n: number, e: gamePoint) {
    this.status = Status.Waiting;

    if (player_n === 1) {
      this.player1.point();
    } else if (player_n === 2) this.player2.point();

    if (player_n === 1 || player_n === 2) {
      this.status = Status.Starting;
      this.emitAll('game_update_point', e);
    }

    if (this.isEndGame()) this.endGame(player_n);
    else this.startGame();
    console.log('1: ', this.player1.score, ' 2:', this.player2.score);
  }
}
