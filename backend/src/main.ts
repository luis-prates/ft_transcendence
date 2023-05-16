import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';
import { Game, Status } from './ping_pong/GamePong';
import { Player } from './lobby/Lobby';
import {
  type updatePlayer,
  type updateBall,
  type gamePoint,
} from './ping_pong/SocketInterface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const io = new Server(app.getHttpServer(), {
    cors: {
      origin: '*',
    },
    pingInterval: 2000,
    pingTimeout: 5000,
  });
  const games: Game[] = [];

  io.on('connection', (socket) => {
    socket.on('new_game', (e) => {
      console.log('PLAYER: ', e);
      games.push(new Game(e));
    });
    socket.on('entry_game', (e: any) => {
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game) {
        game.addUsers(socket as Player);
        console.log(games);
      }
      console.log('entry_game: ', e);
    });
    socket.on('watch_game', (e: any) => {
      //Ver Jogo
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game) game.addUsers(socket as Player);
      console.log('watch_game: ', e);
    });

    //      ---- GAME ----      //
    socket.on('game_ball', (e: updateBall) => {
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game) {
        /* if (game.status != Status.InGame)
          return ;*/
        game.ball.angle = e.angle;
        game.ball.x = e.x;
        game.ball.y = e.y;
        game.ball.dir = e.dir;
        game.ball.speed = e.speed;

        game.emitAll('game_update_ball', e);
        //console.log('Ball: ', e);
      }
      //io.emit("new_game", e)
    });
    socket.on('game_move', (e: any) => {
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game) {
        if (e.playerNumber === 1) {
          game.player1.x = e.x;
          game.player1.y = e.y;
          game.player1.score = e.score;
        } else if (e.playerNumber === 2) {
          game.player2.x = e.x;
          game.player2.y = e.y;
          game.player2.score = e.score;
        }
        if (e.playerNumber === 1 || e.playerNumber === 2)
          game.emitAll('game_update_player', e);
      }
    });
    socket.on('game_point', (e: gamePoint) => {
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game && game.status == Status.InGame)
        game.makePoint(e.playerNumber, e);
    });
  });
}
bootstrap();
