import { PlayerPong, InputHandler, Ball } from "@/game/ping_pong";
import { type gameRequest } from "./SocketInterface";

//Images
import viewGame from "@/assets/images/pingpong/view.png";
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";

//Audio
import sound_player from "@/assets/audio/paddle_hit.wav";
import sound_wall from "@/assets/audio/wall_hit.wav";
import sound_score from "@/assets/audio/score.wav";
import sound_counting from "@/assets/audio/counting.mp3";
import music from "@/assets/audio/music_game.mp3";

export enum Status {
  Waiting,
  Starting,
  InGame,
  Finish,
}

export class GamePong {
  status: number = Status.Waiting;
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
  endMessage: string = "";
  backgroundMusic = new Audio(music);
  watchersNumber: number = 0;

  constructor(width: number, height: number, offSet: number, context: CanvasRenderingContext2D, data: gameRequest) {
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    this.context = context;
    this.inputKey = new InputHandler();
    this.player1 = new PlayerPong(this, 1, "Player 1", avatarDefault);
    this.player2 = new PlayerPong(this, 2, "Player 2", avatarDefault);
    this.ball = new Ball(this);
    this.data = data;
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
    else if (this.status == Status.Finish) this.drawEndGame();
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
    try {
      this.context.drawImage(viewImage, 65, this.height + this.offSet + 9, 50, 50);
    } catch {
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
    this.context.strokeText("________", 95, 405, this.width - 180);

    this.context.fillStyle = "yellow";
    this.context.fillText("WAITING!", 95, 380, this.width - 180);
    this.context.fillText("________", 95, 405, this.width - 180);
  }
  //Draw End Game
  drawEndGame() {
    this.context.font = "100px 'Press Start 2P', cursive";
    this.context.fillStyle = "black";

    this.context.strokeStyle = "black";
    this.context.lineWidth = 10;
    this.context.strokeText(this.endMessage, 95, 380, this.width - 180);
    this.context.strokeText("_".repeat(this.endMessage.length), 95, 405, this.width - 180);

    this.context.fillStyle = this.playerNumber == 2 ? this.player2.color : this.player1.color;
    this.context.fillText(this.endMessage, 95, 380, this.width - 180);
    this.context.fillText("_".repeat(this.endMessage.length), 95, 405, this.width - 180);
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
}
