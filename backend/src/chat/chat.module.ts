import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
	providers: [ChatGateway, ChatService],
	controllers: [ChatController],
  exports: [ChatService]
})
export class ChatModule {}
