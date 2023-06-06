import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './game.service';
import { SocketService } from '../socket/socket.service';

@Module({
		providers: [GameGateway, GameService, SocketService],
		controllers: [GameController],
})
export class GameModule {}
