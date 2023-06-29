import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, TwoFADto } from './dto/auth.dto';
import { JwtGuard } from './guard';
import { User } from '@prisma/client';
import { GetUser } from './decorator';


@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('signin')
	signin(@Body() dto: AuthDto) {
		return this.authService.signin(dto);
	}
  
	@Post('2fa/turn-on')
	@UseGuards(JwtGuard)
	async turnOn2FA(@GetUser() user: User, @Body() body: TwoFADto) {
		const isCodeValid = this.authService.isTwoFactorValid(body.twoFACode, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid 2FA code');
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
	async generate2FAQRCode(@GetUser() user: User, @Response() response: any) {
		const { otpauthUrl } = await this.authService.generateTwoFactorSecret(user);

		return response.json(await this.authService.generateQrCodeDataURL(otpauthUrl));
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
