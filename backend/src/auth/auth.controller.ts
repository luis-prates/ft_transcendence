import { Body, Controller, Get, Post, Redirect, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import passport from 'passport';
import { FortyTwoGuard } from './guard/42.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('signin')
	signin(@Body() dto: AuthDto) {
		return this.authService.signin(dto);
	}

	@Get('42')
	@UseGuards(FortyTwoGuard)
	authenticate42() {
		passport.authenticate('42', { failureRedirect: '/login' }),
			function (req: any, res: any) {
				res.redirect('/');
			};
	}

	@Get('42/return')
	@UseGuards(FortyTwoGuard)
	@Redirect(process.env.FRONTEND_REDIRECT_URL)
	callback42() {
		return;
	}
}
