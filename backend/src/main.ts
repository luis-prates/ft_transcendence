import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors(); // This is a security feature that allows the frontend to access the backend.
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
	})); // This is a security feature that validates the data sent to the backend.
	await app.listen(process.env.BACKEND_PORT || 3380);
}
bootstrap();
