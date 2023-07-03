import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector, private prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const userId = request.user?.id;
		const channelId = Number(request.params['channelId']);

		const channelUser = await this.prisma.channelUser.findFirst({
			where: {
				channelId: channelId,
				userId: Number(userId),
			},
		});

		// if endpoint requires a member role
		if (roles.includes('member') && channelUser) {
			return true;
		}

		// if endpoint requires an admin role
		if (roles.includes('admin') && channelUser && channelUser.isAdmin) {
			return true;
		}

		// if endpoint requires owner role
		if (roles.includes('owner')) {
			const channel = await this.prisma.channel.findFirst({
				where: {
					id: channelId,
				},
			});

			if (!channel) {
				throw new NotFoundException('Channel not found!');
			}

			if (channel.ownerId === Number(userId)) {
				return true;
			}
		}

		// If the user is none of the above
		throw new UnauthorizedException('You are not part of this channel!');
	}
}
