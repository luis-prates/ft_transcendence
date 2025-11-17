import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './game.service';
import { PlayerModule } from '../player/player.module';
import { SocketModule } from '../socket/socket.module';
import { UserModule } from '../user/user.module';

@Module({
	imports: [PlayerModule, SocketModule, UserModule],
	providers: [GameGateway, GameService],
	controllers: [GameController],
	exports: [GameService],
})
export class GameModule {}
