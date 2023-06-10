import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './game.service';
import { SocketService } from '../socket/socket.service';
import { PlayerModule } from '../player/player.module';

@Module({
	imports: [PlayerModule],
	providers: [GameGateway, GameService, SocketService],
	controllers: [GameController],
})
export class GameModule {}
