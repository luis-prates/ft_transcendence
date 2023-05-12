import { Player } from "./player";
import { InputHandler } from "./input";
import { Ball } from "./ball";
import socket from "@/socket/Socket";

//Images
import tableImage from "@/assets/images/pingpong/table_1.png";
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import marvin from "@/assets/images/pingpong/marvin.png";

enum Status {
  Waiting,
  InGame,
  Finish
}

export interface gameResquest {
  objectId: string,
  maxScore: number,
  status: number,
}
export class Game {
  status: number = Status.Waiting;
  width: number;
  height: number;
  offSet: number = 0;
  //maxPoint = 3;
  inputKey: InputHandler;
  Player1: Player;
  Player2: Player;
  Ball: Ball;
  data: gameResquest;

  
  playerNumber: number = 0;

  constructor(width: number, height: number, offSet: number, data: gameResquest) {
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    //this.maxPoint = maxPoint;
    this.inputKey = new InputHandler();
    this.Player1 = new Player(this, 1, "Player 1", avatarDefault);
    this.Player2 = new Player(this, 2, "Player 2", marvin);
    this.Ball = new Ball(this);
    this.data = data;
    
    /*socket.emit("new_game", { name: "tes", x: 6 });
    socket.on("new_game", (e) => {
      console.log("new_game", e);
    });*/
  }

  startGame()
  {
    
  }


  isEndGame() {
    if (this.Player1.score === this.data.maxScore || this.Player2.score === this.data.maxScore) return true;
    return false;
  }

  endGame(context: CanvasRenderingContext2D) {
    context.font = "100px 'Press Start 2P', cursive";
    context.fillStyle = "black";

    context.strokeStyle = "black";
    context.lineWidth = 10;
    context.strokeText("GAME OVER", 56, 380);
    context.strokeText("____ ____", 56, 405);

    context.fillStyle = "yellow";
    context.fillText("GAME OVER", 56, 380);
    context.fillText("____ ____", 56, 405);
  }

  waitingGame(context: CanvasRenderingContext2D) {
    context.font = "100px 'Press Start 2P', cursive";
    context.fillStyle = "black";

    context.strokeStyle = "black";
    context.lineWidth = 10;
    context.strokeText("WAITING.", 95, 380);
    context.strokeText("________", 95, 405);

    context.fillStyle = "yellow";
    context.fillText("WAITING.", 95, 380);
    context.fillText("________", 95, 405);
  }

  update(context: CanvasRenderingContext2D) {
    if (this.status === Status.Waiting || this.status === Status.Finish)
    {
      this.waitingGame(context);
      return ;
    }

    if (!this.isEndGame()) this.Ball.update(this.Player1, this.Player2);

    this.Player1.update(this.inputKey.keys);
    this.Player2.update(this.inputKey.keys);
  }

  draw(context: CanvasRenderingContext2D) {
    this.Player1.draw(context);
    this.Player2.draw(context);
    this.drawScore(context);
    this.Ball.draw(context);
    if (this.isEndGame()) this.endGame(context);
  }

  drawScore(ctx: CanvasRenderingContext2D) {
    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.fillStyle = "black";

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.strokeText(this.Player1.score + " : " + this.Player2.score, this.width / 2 - 120, 90);

    ctx.fillStyle = "white";
    ctx.fillText(this.Player1.score + " : " + this.Player2.score, this.width / 2 - 120, 90);
  }
}

/*
gameResquest {
  player1: {
	  name: string;
    avatar: string;
	};
  player2: {
	  name: string;
    avatar: string;
	};
  maxPoint: number;
}




/*/
