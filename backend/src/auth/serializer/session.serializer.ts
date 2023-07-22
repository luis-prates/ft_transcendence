import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthDto } from '../dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor() {
		super();
	}

	serializeUser(user: AuthDto, done: (err: Error, user: AuthDto) => void): any {
		done(null, user);
	}

	deserializeUser(payload: AuthDto, done: (err: Error, user: AuthDto) => void) {
		return done(null, payload);
	}
}
