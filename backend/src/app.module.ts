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

@Module({
	imports: [
		AuthModule,
		UserModule,
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		FriendshipModule
	],
	controllers: [AppController, FriendshipController],
	providers: [AppService, FriendshipService],
})
export class AppModule {}
