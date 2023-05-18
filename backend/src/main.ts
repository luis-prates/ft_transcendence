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
      console.log(e);
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

    socket.on('game_move', (e: any) => {
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game) {
        if (e.playerNumber == 1) {
          if (e.move == "up")
            game.player1.moveUp();
          else if (e.move == "down")
            game.player1.moveDown();
         

        //  game.emitAll('game_update_player', e);
        } else if (e.playerNumber == 2) {
            if (e.move == "up")
              game.player2.moveUp();
            else if (e.move == "down")
              game.player2.moveDown();
          
        }
      }
    });
  });

}
bootstrap();
