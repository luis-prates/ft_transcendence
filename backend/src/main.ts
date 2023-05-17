import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';
import Lobby from './lobby/Lobby';
import { Player } from './lobby/Player';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors(); // This is a security feature that allows the frontend to access the backend.
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
	})); // This is a security feature that validates the data sent to the backend.
	await app.listen(process.env.PORT || 3370);
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
