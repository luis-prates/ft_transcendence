import { ForbiddenException, Injectable, NotFoundException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService,
		private chatService: ChatService,
	) {}

	async signin(dto: AuthDto) {
		const hash = await argon.hash(dto.nickname);

		try {
			// Check if user exists
			const userExists = await this.prisma.user.findUnique({
				where: {
					id: dto.id,
				},
			});
			if (userExists) {
				this.logger.warn(`User ${userExists.id} already exists.`);
				if (userExists.status != 'OFFLINE') {
					throw new UnauthorizedException('User already logged in');
				}
				delete userExists.hash;
				delete userExists.twoFASecret;
				const signedUser = await this.signToken(userExists);
				const sentUser = {
					...signedUser,
					firstTime: false,
				};
				return sentUser;
			}

			const user = await this.prisma.user.create({
				data: {
					id: dto.id,
					name: dto.name,
					nickname: dto.nickname,
					email: dto.email,
					image: dto.image,
					color: dto.color,
					hash,
				},
			});
			this.logger.log(`User ${user.id} created.`);

			// Get the global channel ID
			const globalChannel = await this.prisma.channel.findUnique({
				where: {
					name: 'global',
				},
			});

			if (!globalChannel) {
				throw new NotFoundException('Global channel not found');
			}

			// Add user to the global channel, emit event to socket etc
			await this.chatService.joinChannel({ password: '' }, globalChannel.id, user);

			delete user.hash;
			delete user.twoFASecret;
			const signedUser = await this.signToken(user);
			const sentUser = {
				...signedUser,
				firstTime: true,
			};

			return sentUser;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('User already exists.');
				}
			}
			throw error;
		}
	}

	async signToken(user: User): Promise<{ dto: User; access_token: string }> {
		const payload = {
			sub: user.id,
			nickname: user.nickname,
		};
		const secret = this.config.get('JWT_SECRET');
		const access_token = await this.jwt.signAsync(payload, {
			expiresIn: '1w',
			secret: secret,
		});
		return { dto: user, access_token };
	}

	async generateTwoFactorSecret(user: User) {
		const secret = authenticator.generateSecret();

		const otpauthUrl = authenticator.keyuri(user.email, 'transcendence-app', secret);

		await this.prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				twoFASecret: secret,
			},
		});

		return { secret, otpauthUrl };
	}

	async turnOnTwoFactor(userId: number) {
		await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				isTwoFAEnabled: true,
			},
		});
	}

	async turnOffTwoFactor(userId: number) {
		await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				isTwoFAEnabled: false,
				twoFASecret: null,
			},
		});
	}

	isTwoFactorValid(twoFACode: string, user: User) {
		if (!user.twoFASecret) {
			throw new ForbiddenException('Two factor authentication is not set up. Please turn it on first');
		}
		return authenticator.verify({ token: twoFACode, secret: user.twoFASecret });
	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}
}
