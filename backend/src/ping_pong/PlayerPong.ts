import { Player } from 'src/lobby/Lobby';
import { Game } from './GamePong';
import { gameResquest } from './SocketInterface';

export class Player_Pong {
  game: Game;
  width: number = 30;
  height: number = 100;
  socket: Player;
  player_n: number;
  y: number = 0;
  x: number = 0;
  speed: number = 8;
  score: number = 0;
  nickname: string;
  avatar: string;
  fpsUpdate: number = 0;
  color: string;

  constructor(game: Game, player_n: number, playerLobby: Player, info?: gameResquest) {
    this.game = game;
    this.player_n = player_n;
    this.y = game.height / 2 - this.height / 2;
    if (this.player_n === 1) this.x = 50;
    else if (this.player_n === 2) this.x = game.width - this.width - 50;
    this.socket = playerLobby;
    this.nickname = info.nickname;
    this.avatar = info.avatar;
    this.color = info.color;
  }

  moveUp() {
    if (this.fpsUpdate == 1)
      return;
    if (this.y > 0) this.y -= this.speed;
    this.fpsUpdate = 1;
  }

  moveDown() {
    if (this.fpsUpdate == 1)
      return;
    if (this.y < this.game.height - this.height) this.y += this.speed;
    this.fpsUpdate = 1;
  }

  point() {
    if (this.game.maxPoint > this.score)
      this.score++;
  }

  update() {
    this.emitPlayer();
  }
  
  emitPlayer() {
    this.game.emitAll("game_update_player", {
      objectId: this.game.data.objectId,
      playerNumber: this.player_n,
      nickname: this.nickname,
      x: this.x,
      y: this.y,
      score: this.score,
      avatar: this.avatar,
      color: this.color,
    });
    this.fpsUpdate = 0;
  }
}