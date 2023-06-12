import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './game.service';
import { PlayerModule } from '../player/player.module';
import { SocketModule } from '../socket/socket.module';

@Module({
	imports: [PlayerModule, SocketModule],
	providers: [GameGateway, GameService],
	controllers: [GameController],
})
export class GameModule {}
