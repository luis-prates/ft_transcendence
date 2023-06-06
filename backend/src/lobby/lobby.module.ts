import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './lobby.gateway';
import { PlayerService } from '../player/player.service';

@Module({
	providers: [LobbyService, LobbyGateway, PlayerService],
})
export class LobbyModule {}
