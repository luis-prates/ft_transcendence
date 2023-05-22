import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';
import { Game, Status } from './ping_pong/GamePong';
import { Player } from './lobby/Lobby';
import {
  type updatePlayer,
  type updateBall,
  type gameResquest,
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
      games.push(new Game(e, games));
    });
    socket.on('entry_game', (e: any) => {
      console.log(e);
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game) {
        game.addUsers(socket as Player, e);
        console.log(games);
      }
      console.log('entry_game: ', e);
    });
    socket.on('watch_game', (e: any) => {
      //Ver Jogo
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game) game.addUsers(socket as Player, e);
      console.log('watch_game: ', e);
    });

    socket.on('game_move', (e: any) => {
      const game = games.find((g) => g.data.objectId == e.objectId);
      if (game && game.status == Status.InGame) {
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

    //Disconect
    socket.on('disconnect', () => {
      
      console.log('Socket desconectado:', socket.id);
      // Faça o tratamento necessário para lidar com a desconexão do socket
      
      function isInGame(game: Game)
      {
        const disconect = socket.id;
        if (game.status == Status.Finish)
          return ;
        if (game.player1.socket.id == disconect)
          game.endGame(2);
        else if (game.player2.socket.id == socket.id)
          game.endGame(1);
        const index = game.watchers.findIndex((socket) => socket.id === disconect);
        if (index !== -1) {
          game.watchers.splice(index, 1);
          console.log('Socket removido da lista de watchers');
        }
      }

      games.forEach((game) => isInGame(game));
    });
  });

}
bootstrap();
