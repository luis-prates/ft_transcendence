import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FriendshipModule } from './friendship/friendship.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { LobbyModule } from './lobby/lobby.module';
import { PlayerModule } from './player/player.module';
import { SocketModule } from './socket/socket.module';
import { BlocklistModule } from './blocklist/blocklist.module';

@Module({
	imports: [
		AuthModule,
		UserModule,
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		FriendshipModule,
		GameModule,
		ChatModule,
		LobbyModule,
		PlayerModule,
		SocketModule,
		BlocklistModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
