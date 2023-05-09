
// export class GameSound {
//   game: Game;
//   width: number = 30;
//   height: number = 100;
//   player: number;
//   y: number;
//   x: number = 0;
//   speed: number = 10;
//   score: number = 0;
//   nickname: string;
//   avatar = new Image();

//   constructor(game: Game, player_n: number, nickname: string, avatar: any) {
//     this.game = game;
//     this.player = player_n;
//     this.y = game.height / 2 - this.height / 2 + this.game.offSet;
//     if (this.player === 1) this.x = 50;
//     else if (this.player === 2) this.x = game.width - this.width - 50;
//     this.nickname = nickname;
//     this.avatar.src = avatar;
//   }

//   moveUp() {
//     if (this.y > this.game.offSet) this.y -= this.speed;
//   }

//   moveDown() {
//     if (this.y < this.game.height - this.height + this.game.offSet) this.y += this.speed;
//   }

//   point() {
//     this.score++;
//   }

//   update(input: string[]) {
//     if (this.player === 1) {
//       if (input.includes("w")) this.moveUp();
//       if (input.includes("s")) this.moveDown();
//     } else if (this.player === 2) {
//       if (input.includes("ArrowUp")) this.moveUp();
//       if (input.includes("ArrowDown")) this.moveDown();
//     }
//   }
