import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import passport from 'passport';
import session from 'express-session';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';
import * as https from 'https';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const httpsOptions = {
        key: fs.readFileSync('/etc/ssl/nginx-selfsigned.key'),
        cert: fs.readFileSync('/etc/ssl/nginx-selfsigned.crt'),
    };

	const app = await NestFactory.create(AppModule, { httpsOptions });
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
			secret: process.env.SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());
	await app.listen(3000);
}
bootstrap();
