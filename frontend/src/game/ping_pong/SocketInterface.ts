import type { Status } from "./GamePong";

export interface gameRequest {
  objectId: string,
  maxScore: number,
  table: string,
  tableSkin: string,
  bot: boolean,
}

export interface playerInfo {
  objectId: string,
  nickname: string,
  avatar: string,
  color: string,
  skin: string,
}

export interface updatePlayer {
  objectId: string,
  playerNumber: number,
  x: number,
  y: number,
  score: number,
  nickname: string,
  avatar: string,
  color: string,
}

export interface updateBall {
  objectId: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  dir: number;
}

export interface gamePoint {
  objectId: string;
  playerNumber: number;
  score: number;
}

export interface gameEnd {
  result: string;
  exp: number;
  money: number;
  watchers: number;
  gameResults: ResultGame;
}

interface ResultGame {
  winnerId: number,
  winnerName: string,
  winnerScore: number,
  loserId: number,
  loserName: string,
  loserScore: number,
}

export interface GameStart {
  player: number;
  status: Status;
  data: any;
  player1: PlayerData;
  player2: PlayerData;
  watchers: number;
}

interface PlayerData {
  id: number;
  nickname: string;
  avatar: string;
  color: string;
  skin: string;
}