import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './gateway/lobby.gateway';
import { PlayerModule } from '../player/player.module';
import { GameModule } from 'src/game/game.module';

@Module({
	imports: [PlayerModule, GameModule],
	providers: [LobbyService, LobbyGateway],
})
export class LobbyModule {}
