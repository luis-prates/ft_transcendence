import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';
import Lobby from './lobby/Lobby';
import { Player } from './lobby/Player';

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
  const lobby = new Lobby(io);
  io.on('connection', (socket) => {
    socket.on('join_lobby', (data) => {
      lobby.putPlayer(new Player(socket, data.objectId));
    });
    //
  });
}
bootstrap();
