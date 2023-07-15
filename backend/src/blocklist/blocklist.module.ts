import { Module } from '@nestjs/common';
import { BlocklistController } from './blocklist.controller';
import { BlocklistService } from './blocklist.service';

@Module({
	controllers: [BlocklistController],
	providers: [BlocklistService],
})
export class BlocklistModule {}
