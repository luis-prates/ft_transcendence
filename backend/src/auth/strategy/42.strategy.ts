import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from '../auth.service';
import { AuthDto } from '../dto';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
			callbackURL: process.env.FORTYTWO_CALLBACK_URL,
			passReqToCallback: true,
			profileFields: {
				id: function (obj: any) {
					return Number(obj.id);
				},
				username: 'login',
				displayName: 'displayname',
				'name.familyName': 'last_name',
				'name.givenName': 'first_name',
				profileUrl: 'url',
				emails: 'email',
				phoneNumber: 'phone',
				image: 'image.link',
			},
		});
	}

	async validate(
		request: { session: { accessToken: string } },
		accessToken: string,
		refreshToken: string,
		profile: any,
		cb: any,
	) {
		const { id, emails, username, displayName, image } = profile;
		const dto: AuthDto = {
			id: id,
			email: emails,
			name: displayName,
			nickname: username,
			image: image,
		};
		const user = await this.authService.signin(dto);
		if (!user) {
			throw new UnauthorizedException();
		}
		return cb(null, user);
	}
}
