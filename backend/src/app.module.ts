import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FriendshipService } from './friendship/friendship.service';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { LobbyService } from './lobby/lobby.service';
import { LobbyModule } from './lobby/lobby.module';
import { PlayerModule } from './player/player.module';
import { SocketModule } from './socket/socket.module';

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
	],
	controllers: [AppController, FriendshipController, GameController],
	providers: [AppService, FriendshipService, GameService, LobbyService],
})
export class AppModule {}
