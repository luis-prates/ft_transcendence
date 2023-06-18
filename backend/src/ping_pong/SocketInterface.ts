export interface gameRequest {
  objectId: string,
  maxScore: number,
  table: string,
  tableSkin: string,
  bot: boolean,
}

export interface playerInfo {
  objectId: string,
  userId: number,
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
