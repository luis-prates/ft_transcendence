import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './gateway/lobby.gateway';
import { PlayerModule } from '../player/player.module';
import { GameModule } from '../game/game.module';
import { UserModule } from '../user/user.module';

@Module({
	imports: [PlayerModule, GameModule, UserModule],
	providers: [LobbyService, LobbyGateway],
})
export class LobbyModule {}
