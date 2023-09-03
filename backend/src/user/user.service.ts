import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserBuySkinDto, UserDto, UserUpdateSkinTableDto, UserUpdateStatsDto } from './dto';
import { Prisma, User, UserStatus } from '@prisma/client';
import { Server } from 'socket.io';

@Injectable()
export class UserService {
	private server: Server;
	private readonly logger = new Logger(UserService.name);

	constructor(private prisma: PrismaService) { }

	setServer(server: Server) {
		this.server = server;
	}

	getServer(): Server {
		return this.server;
	}

	async editUser(userId: number, dto: UserDto): Promise<User> {
		try {
			let user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (dto.paddleSkinEquipped && user.paddleSkinEquipped !== dto.paddleSkinEquipped) {
				const paddleSkinExists = user.paddleSkinsOwned.findIndex(skin => skin === dto.paddleSkinEquipped);
				if (paddleSkinExists === -1) {
					throw new ForbiddenException('Paddle skin not owned');
				}
			}
			if (dto.tableSkinEquipped && user.tableSkinEquipped !== dto.tableSkinEquipped) {
				const tableSkinExists = user.tableSkinsOwned.findIndex(skin => skin === dto.tableSkinEquipped);
				if (tableSkinExists === -1) {
					throw new ForbiddenException('Table skin not owned');
				}
			}

			let nicknameIsChange: boolean = false;

			if (dto.nickname && user.nickname !== dto.nickname) {
				user = await this.prisma.user.findUnique({
					where: {
						nickname: dto.nickname,
					},
				});
				if (user) {
					throw new ForbiddenException('Nickname already taken');
				}

				nicknameIsChange = true;
			}

			let imageIsChange: boolean = false;
			if (dto.image && user.image !== dto.image) imageIsChange = true;

			user = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					...dto,
				},
			});

			delete user.twoFASecret;

			if (imageIsChange) {
				this.server.emit('updateImage', {
					id: userId,
					image: dto.image,
				});
			}

			if (nicknameIsChange) {
				this.server.emit('updateNickname', {
					id: userId,
					nickname: dto.nickname,
				});
			}

			return user;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`Defined field value already exists. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}

	async status(userId: number, status: UserStatus): Promise<User> {
		if (!userId || !status) {
			return;
		}

		const id = userId.toString();
		userId = parseInt(id);
		try {
			let user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});

			if (user?.status == status) {
				console.log('Status already updated!');
				return;
			}
			this.logger.debug(`Current user status: ${user?.status}. Next status ${status}`);

			user = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					status: status,
				},
			});
			delete user.twoFASecret;
			this.logger.debug(`Updated user status: ${user.status}`);

			this.server.emit('updateStatus', {
				id: userId,
				status: status,
			});

			return user;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`Defined field value already exists. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}

	async getUserStatus(userId: number) {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (!user) {
				throw new ForbiddenException('User not found');
			}
			return user.status;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`The user doesn't exist. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}

	async buySkin(userId: number, dto: UserBuySkinDto): Promise<User> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (user) {
				if (user.money - dto.price < 0) {
					//Erro
					return;
				}
				const paddleSkins = user.paddleSkinsOwned;
				const tableSkins = user.tableSkinsOwned;

				if (dto.typeSkin == 0 && !paddleSkins.includes(dto.skin)) {
					paddleSkins.push(dto.skin);
				} else if (dto.typeSkin == 1 && !tableSkins.includes(dto.skin)) {
					tableSkins.push(dto.skin);
				} else {
					//ERRO
					return;
				}

				const money = user.money - dto.price;

				const updatedUser = await this.prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						money: money,
						tableSkinsOwned: tableSkins,
						paddleSkinsOwned: paddleSkins,
					},
				});

				delete updatedUser.twoFASecret;

				return updatedUser;
			}
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`The User don't Exist. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}

	async updateSkinTable(userId: number, dto: UserUpdateSkinTableDto): Promise<User> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});

			if (user) {
				if (!user.tableSkinsOwned.includes(dto.skin) && dto.skin != '') {
					//ERRO
					return;
				}

				const color = user.tableColorEquipped != dto.color ? dto.color : user.tableColorEquipped;
				const skin = user.tableSkinEquipped != dto.skin ? dto.skin : user.tableSkinEquipped;

				if (user.tableColorEquipped != color || user.tableSkinEquipped != skin) {
					const updatedUser = await this.prisma.user.update({
						where: {
							id: userId,
						},
						data: {
							tableColorEquipped: color,
							tableSkinEquipped: skin,
						},
					});

					delete updatedUser.twoFASecret;

					return updatedUser;
				}
				return;
			}
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`The User don't Exist. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}

	async getUsers(): Promise<User[]> {
		const users = this.prisma.user.findMany();

		return users;
	}

	async getProfile(userId: number, personId: number): Promise<User> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: personId,
				},
			});

			if (user) {
				return user;
			}
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`The User don't Exist. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}

	async updateStats(userId: number, dto: UserUpdateStatsDto): Promise<User> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (user) {
				const userMoney = user.money + dto.money;
				let user_xp = user.xp + dto.xp;
				let user_level = user.level;

				while (user_xp >= user_level * 200) {
					user_xp -= user_level * 100;
					user_level += 1;
				}

				const updatedUser = await this.prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						money: userMoney,
						xp: user_xp,
						level: user_level,
					},
				});

				delete updatedUser.twoFASecret;

				return updatedUser;
			}
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(
						`The User don't Exist. Error: ${error.message.substring(
							error.message.indexOf('Unique constraint'),
						)}`,
					);
				}
			}
			throw error;
		}
	}
}
