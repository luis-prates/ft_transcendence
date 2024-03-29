import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import passport from 'passport';
import session from 'express-session';
import * as bodyParser from 'body-parser';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors(); // This is a security feature that allows the frontend to access the backend.
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	); // This is a security feature that validates the data sent to the backend.

	// Here we set the limit option
	app.use(bodyParser.json({ limit: '10mb' }));
	app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
	app.use(
		session({
			secret: 'secret',
			resave: false,
			saveUninitialized: false,
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());
	await app.listen(3000);
}
bootstrap();
