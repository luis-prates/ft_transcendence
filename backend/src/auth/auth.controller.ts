import {
	Body,
	Controller,
	Get,
	Logger,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseFilters,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import passport from 'passport';
import { FortyTwoGuard } from './guard/42.guard';
import { AuthDto, TwoFADto } from './dto/auth.dto';
import { JwtGuard } from './guard';
import { User } from '@prisma/client';
import { GetUser } from './decorator';
import { Response } from 'express';
import { OAuthExceptionFilter } from './filters/oauth-exception.filter';

@Controller('api/auth')
export class AuthController {
	private readonly logger = new Logger('AuthController');

	constructor(private authService: AuthService) {}

	@Post('signin')
	signin(@Body() dto: AuthDto) {
		return this.authService.signin(dto);
	}

	@Get('42')
	@UseFilters(OAuthExceptionFilter)
	@UseGuards(FortyTwoGuard)
	authenticate42() {
		passport.authenticate('42', { failureRedirect: '/login' });
	}

	@Get('42/return')
	@UseFilters(OAuthExceptionFilter)
	@UseGuards(FortyTwoGuard)
	callback42(@Req() req: any, @Res() res: Response) {
		res.redirect(
			`${process.env.FRONTEND_REDIRECT_URL}/?token=${req.user.access_token}&isFirstTime=${req.user.firstTime}`,
		);
	}

	@Post('2fa/turn-on')
	@UseGuards(JwtGuard)
	async turnOn2FA(@GetUser() user: User, @Body() body: TwoFADto) {
		const isCodeValid = this.authService.isTwoFactorValid(body.twoFACode, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid 2FA code');
		}
		if (user.isTwoFAEnabled) {
			throw new UnauthorizedException('2FA is already turned on');
		}
		this.logger.debug(`User ${user.id} turned on 2FA`);
		await this.authService.turnOnTwoFactor(user.id);

		return { message: `2FA turned on for user ${user.id}` };
	}

	@Post('2fa/turn-off')
	@UseGuards(JwtGuard)
	async turnOff2FA(@GetUser() user: User, @Body() body: TwoFADto) {
		const isCodeValid = this.authService.isTwoFactorValid(body.twoFACode, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid 2FA code');
		}
		this.logger.debug(`User ${user.id} turned off 2FA`);
		await this.authService.turnOffTwoFactor(user.id);

		return { message: `2FA turned off for user ${user.id}` };
	}

	@Post('2fa/generate')
	@UseGuards(JwtGuard)
	async generate2FAQRCode(@GetUser() user: User) {
		const { secret, otpauthUrl } = await this.authService.generateTwoFactorSecret(user);

		const responseObj = await this.authService.generateQrCodeDataURL(otpauthUrl);
		//! secret needs to be removed in production
		//! secret is needed for testing
		return { secret, responseObj };
	}

	//! not used currently, but left in case it's needed in the future
	@Post('2fa/validate')
	@UseGuards(JwtGuard)
	async validate2FACode(@GetUser() user: User, @Body() body: TwoFADto) {
		const isCodeValid = this.authService.isTwoFactorValid(body.twoFACode, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid 2FA code');
		}

		return { message: '2FA code is valid' };
	}
}
