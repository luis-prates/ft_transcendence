import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto';
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
	
			return (user);
			
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException(`Defined field value already exists. Error: ${error.message.substring(error.message.indexOf('Unique constraint'))}`);
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
	
				return (updatedUser);
			}
		} catch (error) {
			throw error;
		}
	}

	
	async buySkin(userId: number, dto: UserDto) {

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
	
				return (updatedUser);
			}
		} catch (error) {
			throw error;
		}
	}

}
