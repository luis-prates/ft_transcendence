import { PlayerPong, InputHandler, Ball } from "@/game/ping_pong";
import { type gameEnd, type gameRequest } from "./SocketInterface";

//Images
import viewGame from "@/assets/images/pingpong/view.png";
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";

//Audio
import sound_player from "@/assets/audio/paddle_hit.wav";
import sound_wall from "@/assets/audio/wall_hit.wav";
import sound_score from "@/assets/audio/score.wav";
import sound_counting from "@/assets/audio/counting.mp3";
import sound_coin from "@/assets/audio/coin.mp3";
import sound_coins from "@/assets/audio/coins.mp3";
import music from "@/assets/audio/music_game.mp3";
import { TablePong } from "@/game/ping_pong";
import Router from "@/router";

export enum Status {
  Waiting,
  Starting,
  InGame,
  Finish,
}

export class GamePong {
  table: TablePong;
  status: number = Status.Waiting;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  offSet: number = 0;
  inputKey: InputHandler;
  player1: PlayerPong;
  player2: PlayerPong;
  ball: Ball;
  data: gameRequest;
  playerNumber: number = 0;
  counting: number = 0;
  context: CanvasRenderingContext2D;
  endGame: gameEnd = {
    result: "",
    exp: 0,
    money: 0,
    watchers: 0,
    gameResults: {
      winnerId: 0,
      winnerName: "",
      winnerScore: 0,
      loserId: 0,
      loserName: "",
      loserScore: 0,
    }
  };
  cur: any = {
    exp: 0,
    money: 0,
    watchers: 0,
  }
  backgroundMusic = new Audio(music);
  watchersNumber: number = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number, offSet: number, context: CanvasRenderingContext2D, data: gameRequest, table: TablePong) {
    this.canvas = canvas;
    this.table = table;
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    this.context = context;
    this.inputKey = new InputHandler();
    this.player1 = new PlayerPong(this, 1, "Player 1", avatarDefault);
    this.player2 = new PlayerPong(this, 2, "Player 2", avatarDefault);
    this.ball = new Ball(this);
    this.data = data;

    this.canvas.addEventListener("click", (event) => this.handleClick(event, this));
  }
  //Update Input Keys
  update() {
    if (this.status != Status.InGame) {
      return;
    }
    if (this.playerNumber == 1) this.player1.update(this.inputKey.keys);
    else if (this.playerNumber == 2) this.player2.update(this.inputKey.keys);
  }

  //Update Status and Emit for ALL
  updateStatus(status: number) {
    if (this.status != status) this.status = status;
  }
  //Update Watchers
  updateWatchers(watchers: number) {
    if (this.watchersNumber != watchers) this.watchersNumber = watchers;
  }
  //Audio Controller
  audio(sound: string) {
    if (sound == "player") new Audio(sound_player).play();
    else if (sound == "wall") new Audio(sound_wall).play();
    else if (sound == "score") new Audio(sound_score).play();
    else if (sound == "counting") new Audio(sound_counting).play();
    else if (sound == "music_play") this.backgroundMusic.play();
    else if (sound == "music_stop") this.backgroundMusic.pause();
  }
  //Draw Controller
  draw() {
    this.player1.draw(this.context);
    this.player2.draw(this.context);
    this.ball.draw(this.context);
    this.drawScore();
    this.drawViews();
    if (this.status == Status.Waiting) this.waitingGame();
    else if (this.status == Status.Starting) this.countingGame(this.counting - 1);
    else if (this.status == Status.Finish) this.drawBoard();
  }
  //Draw Score
  drawScore() {
    this.context.font = "50px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText(this.player1.score + " : " + this.player2.score, this.width / 2 - 120, 90, this.width - 750);

    this.context.fillStyle = "white";
    this.context.fillText(this.player1.score + " : " + this.player2.score, this.width / 2 - 120, 90, this.width - 750);
  }
  //Views
  drawViews() {
    this.context.font = "20px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.fillStyle = "white";
    this.context.lineWidth = 1;

    const viewImage = new Image();
    viewImage.src = viewGame;

    if (viewImage.complete)
      this.context.drawImage(viewImage, 65, this.height + this.offSet + 9, 50, 50);
    else {
      this.context.fillText("Viewrs:", 10, this.height + this.offSet + 45, 100);
      this.context.strokeText("Viewrs:", 10, this.height + this.offSet + 45, 100);
    }

    this.context.fillText(this.watchersNumber.toString(), 120, this.height + this.offSet + 45, 50);
    this.context.strokeText(this.watchersNumber.toString(), 120, this.height + this.offSet + 45, 50);
  }
  //Draw Waiting Game
  waitingGame() {
    this.context.font = "100px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText("WAITING!", 95, 380, this.width - 180);
    this.context.strokeText("_".repeat("WAITING!".length), 95, 380, this.width - 180);

    this.context.fillStyle = "yellow";
    this.context.fillText("WAITING!", 95, 380, this.width - 180);
    this.context.fillText("_".repeat("WAITING!".length), 95, 380, this.width - 180);
  }

  //Animation Loop 1000 milesecond (1second) for 10 fps
	animation_points() {
    
    let gain_exp = Math.ceil(this.endGame.exp / 10);
    gain_exp = this.cur.exp + gain_exp > this.endGame.exp ? this.endGame.exp - gain_exp : gain_exp;

    this.endGame.exp > this.cur.exp ? this.cur.exp += gain_exp : (this.endGame.money > this.cur.money ? this.cur.money++ : 
      (this.endGame.watchers > this.cur.watchers ? this.cur.watchers++ : 0 ));
      
    new Audio(sound_coin).play();
		
    setTimeout(() => {
      if (!(this.cur.exp == this.endGame.exp && this.cur.money == this.endGame.money && this.cur.watchers == this.endGame.watchers))
			  this.animation_points();
		}, 1000 / 10);
	}

  drawBoard()
  {
    this.context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.context.fillRect(85, 150, this.width - 170, 500);

    this.context.strokeStyle = "black";
    this.context.strokeRect(85, 150, this.width - 170, 500);
    this.context.lineWidth = 2;

    this.context.font = "40px 'Press Start 2P', cursive";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText(this.endGame.result, 85 + (this.width - 180) / 2 - 140, 210);

    this.context.fillStyle = "yellow";
    this.context.fillText(this.endGame.result, 85 + (this.width - 180) / 2 - 140, 210);

    if (this.playerNumber == 1 || this.playerNumber == 2)
      this.winingBoard();

    this.drawButtonFinalScore(this.context);
  }

  winingBoard()
  {
    this.context.font = "30px 'Press Start 2P', cursive";
    this.context.fillStyle = "yellow";
    
    this.context.strokeText("Experience:", 85 + (this.width - 180) / 8, 410);
    this.context.strokeText("Money:", 85 + (this.width - 180) / 8, 470);
    this.context.strokeText("Watchers:", 85 + (this.width - 180) / 8, 530);

    this.context.strokeText("+" + this.cur.exp.toString() + " Exp", 85 + (this.width - 180) / 1.85, 410);
    this.context.strokeText("+" + this.cur.money.toString() + "₳", 85 + (this.width - 180) / 1.85, 470);
    this.context.strokeText(this.cur.watchers.toString(), 85 + (this.width - 180) / 1.85, 530);
    

    this.context.fillText("Experience:", 85 + (this.width - 180) / 8, 410);
    this.context.fillText("Money:", 85 + (this.width - 180) / 8, 470);
    this.context.fillText("Watchers:", 85 + (this.width - 180) / 8, 530);
    
    this.context.fillStyle = "white";
    
    this.context.fillText("+" + this.cur.exp.toString() + " Exp", 85 + (this.width - 180) / 1.85, 410);
    this.context.fillText("+" + this.cur.money.toString() + "₳", 85 + (this.width - 180) / 1.85, 470);
    this.context.fillText(this.cur.watchers.toString(), 85 + (this.width - 180) / 1.85, 530);

  }
  
  drawButtonFinalScore(context: CanvasRenderingContext2D) {

    this.context.font = "30px 'Press Start 2P', cursive";

    //Button "Go Back!"
    if ((this.playerNumber != 1 && this.playerNumber != 2) || this.cur.exp == this.endGame.exp && this.cur.money == this.endGame.money && this.cur.watchers == this.endGame.watchers)
    { 
      this.context.fillStyle = "yellow";
      this.context.strokeRect(this.width / 2 - 140, 575, 280, 50);
      this.context.fillRect(this.width / 2 - 140, 575, 280, 50);
      this.context.fillStyle = "white";
      this.context.strokeText("Go Back!", this.width / 2 - 110, 617.5)
      this.context.fillText("Go Back!", this.width / 2 - 110, 617.5);   
    }
  
    context.strokeRect(210, 250, 100, 100);
    context.strokeRect(this.width - 210 - 100, 250, 100, 100);

    context.drawImage(this.player1.avatar, 210, 250, 100, 100);
    context.drawImage(this.player2.avatar, this.width - 210 - 100, 250, 100, 100);


    this.context.font = "50px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText(this.player1.score + " - " + this.player2.score, this.width / 2 - 120, 325, this.width - 750);

    this.context.fillStyle = "white";
    this.context.fillText(this.player1.score + " - " + this.player2.score, this.width / 2 - 120, 325, this.width - 750);
  }

  //Draw Counting
  countingGame(counting: number) {
    this.context.font = "100px 'Press Start 2P', cursive";
    this.context.fillStyle = this.ball.dir == 1 ? this.player1.color : this.player2.color;

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;

    if (counting == 0) {
      this.context.strokeText("GO!", this.width / 2 - 100, 470);
      this.context.strokeText("___", this.width / 2 - 100, 485);
      this.context.fillText("GO!", this.width / 2 - 100, 470);
      this.context.fillText("___", this.width / 2 - 100, 485);
    } else if (counting > 0) {
      this.context.strokeText(counting.toString(), this.width / 2 - 50, 470);
      this.context.strokeText("_", this.width / 2 - 50, 485);
      this.context.fillText(counting.toString(), this.width / 2 - 50, 470);
      this.context.fillText("_", this.width / 2 - 50, 485);
    }
  }

  //TODO
  handleClick(event: MouseEvent, game: GamePong) {

    if (game.status != Status.Finish)
      return ;

    const isgetall = (game.cur.exp == game.endGame.exp && game.cur.money == game.endGame.money && game.cur.watchers == game.endGame.watchers);

    if (!isgetall)
    {
      game.cur.exp = game.endGame.exp;
      game.cur.money = game.endGame.money;
      game.cur.watchers = game.endGame.watchers;
    }
    else
    {
      game.canvas.removeEventListener("click", (event) => this.handleClick(event, game));
      Router.push(`/`);
    }

    return ;

    //TODO

    console.log("click 1!! game:", game.endGame)

    const rect = game.canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const buttonX1 = game.width / 2 - 140;
    const buttonX2 = game.width / 2 + 140;
    const buttonY1 = 525;
    const buttonY2 = 575;

    const totalWidth = window.innerWidth;
    const totalHeight = window.innerHeight;
    
    // Calcular a nova posição do botão
    const newButtonX1 = (buttonX1 / totalWidth) * game.canvas.width;
    const newButtonX2 = (buttonX2 / totalWidth) * game.canvas.width;
    const newButtonY1 = (buttonY1 / totalHeight) * game.canvas.height;
    const newButtonY2 = (buttonY2 / totalHeight) * game.canvas.height;
    
    console.log("rect:", rect);
    console.log("event:", event)


    console.log("click on x: ", mouseX, "y: ", mouseY)
    console.log("click on x1: ", newButtonX1, "x2: ", newButtonX2)
    console.log("click on y1: ", newButtonY1, "y2: ", newButtonY2)

    // Verificar se o clique ocorreu dentro da nova posição do botão
    if (isgetall && (mouseX >= newButtonX1 && mouseX <= newButtonX2 && mouseY >= newButtonY1 && mouseY <= newButtonY2)) {
      // Botão clicado!
      game.canvas.removeEventListener("click", (event) => this.handleClick(event, game));
      Router.push(`/`);
    }

    if (mouseX >= 0 && mouseX <= game.canvas.width && mouseY >= 0 && mouseY <= game.canvas.height) {
      game.endGame.exp = game.endGame.exp;
      game.endGame.money = game.endGame.money;
      game.endGame.watchers = game.endGame.watchers; 
    }

    // if ( isgetall && (mouseX >= game.width / 2 - 140 && mouseX <= game.width / 2 + 140  && mouseY >= 575 && mouseY <= 625)) {
    //     console.log("click push!!")
    //     
    // }
  }
}
