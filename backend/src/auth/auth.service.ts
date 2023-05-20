import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService
	) {}

	async signin(dto: AuthDto) {
		const hash = await argon.hash(dto.nickname);

		try {
			const userExists = await this.prisma.user.findUnique({
				where: {
					id: dto.id,
				},
			});
			if (userExists) {
				delete userExists.hash;
				return (this.signToken(userExists));
			}

			const user = await this.prisma.user.create({
				data: {
					id: dto.id,
					name: dto.name,
					nickname: dto.nickname,
					email: dto.email,
					image: dto.image,
					hash,
				},
			});

			delete user.hash;

			return (this.signToken(user));
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('User already exists.');
				}
			}
			throw error;
		}
	}

	async signToken(user: AuthDto)
		: Promise<{ dto: AuthDto; access_token: string }> {
		const payload = {
			sub: user.id,
			nickname: user.nickname,
		};
		const secret = this.config.get('JWT_SECRET');
		const access_token = await this.jwt.signAsync(payload,
			{
				expiresIn: '15m',
				secret: secret,
			}
		);
		return { dto: user, access_token };
	}
}