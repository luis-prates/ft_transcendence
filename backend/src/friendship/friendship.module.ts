import { Module } from '@nestjs/common';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';

@Module({
	controllers: [FriendshipController],
	providers: [FriendshipService],
})
export class FriendshipModule {}
