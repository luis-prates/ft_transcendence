import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';
import { Game } from './ping_pong/GamePong';
import { Player } from './lobby/Lobby';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const io = new Server(app.getHttpServer(), {
    cors: {
      origin: '*',
    },
    pingInterval: 2000,
    pingTimeout: 5000,
  })
  const games: Game [] = [];
  
  io.on('connection', (socket) => {


    socket.on("new_game", (e) =>{
      
      console.log("PLAYER: ", e)
      
      games.push(new Game(e));

    })
    socket.on("entry_game", (e: any) =>{
      
      const game = games.find( g => g.data.objectId == e.objectId)
      if (game)
        game.addUsers(socket as Player);
      console.log("entry_game: ", e)
    })
    socket.on("watch_game", (e: any) =>{
      //Ver Jogo
      const game = games.find( g => g.data.objectId == e.objectId)
      if (game)
        game.addUsers(socket as Player);
      console.log("watch_game: ", e)
    })
    
    //      ---- GAME ----      //
    socket.on("game_ball", (e) =>{
      //console.log("PLAYER: ", e)
      //io.emit("new_game", e)
    })
    socket.on("game_move", (e) =>{
      //console.log("PLAYER: ", e)
      //io.emit("new_game", e)
    })
    socket.on("game_point", (e) =>{
      //console.log("PLAYER: ", e)
      //io.emit("new_game", e)
    })

  })


}
bootstrap();