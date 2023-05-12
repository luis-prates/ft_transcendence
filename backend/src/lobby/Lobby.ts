import { Socket } from "socket.io";

export interface PathNode {
	x: number;
	y: number;
	direction: number;
  }
  
  export class Player extends Socket {
	data: {
	  name: string;
	  objectId: string;
	  x: number;
	  y: number;
	  pathFinding: PathNode[];
	} = {
	  name: '',
	  objectId: '',
	  x: 0,
	  y: 0,
	  pathFinding: [],
	};

	
  }