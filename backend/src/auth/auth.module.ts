import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { FortyTwoStrategy } from './strategy/42.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './serializer/session.serializer';
import { ChatModule } from '../chat/chat.module';

@Module({
	imports: [JwtModule.register({}), PassportModule, ChatModule],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, FortyTwoStrategy, SessionSerializer],
})
export class AuthModule {}
