import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class BlocklistService {
	constructor(private prisma: PrismaService) {}

	async blockUser(user: any, blockedId: number): Promise<any> {
		if (user.id === blockedId) {
			throw new BadRequestException('Cannot block self');
		}
		try {
			const blocked = await this.prisma.user.findUnique({
				where: {
					id: blockedId,
				},
			});
			if (!blocked) {
				throw new NotFoundException('User not found');
			}
			const block = await this.prisma.blocklist.create({
				data: {
					blocker: {
						connect: {
							id: user.id,
						},
					},
					blocked: {
						connect: {
							id: blockedId,
						},
					},
				},
			});
			return block;
		} catch (error) {
			if (error.code === 'P2002') {
				throw new ConflictException('User already blocked');
			}
			throw error;
		}
	}
	async unblockUser(user: any, blockedId: number): Promise<any> {
		if (user.id === blockedId) {
			throw new BadRequestException('Cannot unblock self');
		}
		try {
			const unblocked = await this.prisma.user.findUnique({
				where: {
					id: blockedId,
				},
			});
			if (!unblocked) {
				throw new NotFoundException('User not found');
			}
			// throw if the user is not blocked
			const blocked = await this.prisma.blocklist.findUnique({
				where: {
					blockerId_blockedId: {
						blockerId: user.id,
						blockedId: blockedId,
					},
				},
			});
			if (!blocked) {
				throw new BadRequestException('User not blocked');
			}
			const unblock = await this.prisma.blocklist.delete({
				where: {
					blockerId_blockedId: {
						blockerId: user.id,
						blockedId: blockedId,
					},
				},
			});
			return unblock;
		} catch (error) {
			if (error.code === 'P2002') {
				throw new BadRequestException('User already unblocked');
			}
			throw error;
		}
	}

	async getBlockedUsers(user: any): Promise<any> {
		const blockedUsers = await this.prisma.blocklist.findMany({
			where: {
				blockerId: user.id,
			},
		});

		return blockedUsers;
	}

	async getBlockedBy(user: any): Promise<any> {
		const blockedBy = await this.prisma.blocklist.findMany({
			where: {
				blockedId: user.id,
			},
		});

		return blockedBy;
	}
}
