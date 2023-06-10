import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';

@Module({
	imports: [],
	providers: [PlayerService],
	exports: [PlayerService],
})
export class PlayerModule {}
