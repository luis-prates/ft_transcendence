import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserBuySkinDto, UserDto, UserUpdateSkinTableDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	/*async editUser(userId: number, dto: UserDto) {
		try {
			const user = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					...dto,
				},
			});

			delete user.hash;

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
	}*/

	async updateProfile(userId: number, dto: UserDto) {
		try {
			// Check if image encoding is correct
			/* var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            if (!base64regex.test(dto.image)) {
                throw new BadRequestException('Image is not base64 encoding');
            }*/

			// Check if user exists
			const userExists = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (userExists) {
				const updatedUser = await this.prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						nickname: dto.nickname,
						avatar: dto.avatar,
						image: dto.image,
						color: dto.color,
						paddleSkinEquipped: dto.paddleSkinEquipped,
					},
				});

				delete updatedUser.hash;

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

	async buySkin(userId: number, dto: UserBuySkinDto) {
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

				delete updatedUser.hash;

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

	async updateSkinTable(userId: number, dto: UserUpdateSkinTableDto) {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
			});

			if (user) {
				if (!user.tableSkinsOwned.includes(dto.skin) && dto.skin != "") {
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

					delete updatedUser.hash;

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

	async getUsers(userId: number) {
		const users = this.prisma.user.findMany();

		return users;
	}

	async getProfile(userId: number, personId: number) {
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
}
