export interface gameResquest {
  objectId: string;
  maxScore: number;
}

export interface updatePlayer {
  objectId: string;
  playerNumber: number;
  x: number;
  y: number;
  score: number;
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
}
