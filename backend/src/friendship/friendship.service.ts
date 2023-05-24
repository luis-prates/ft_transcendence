import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendReqStatus, FriendRequest, User } from '@prisma/client';

@Injectable()
export class FriendshipService {
	constructor(private prisma: PrismaService) {}

	async acceptFriendRequest(user: number, friend: number): Promise<FriendRequest> {
		const updatedFriendship = this.prisma.friendRequest.update({
			where: {
				requestorId_requesteeId: {
					requestorId: friend,
					requesteeId: user,
				},
			},
			data: {
				status: FriendReqStatus.ACCEPTED,
			},
		});


		await this.prisma.friend.create({
			data: {
				user: { connect: { id: (await updatedFriendship).requestorId } },
				friend: { connect: { id: (await updatedFriendship).requesteeId } },
			}
		});

		await this.prisma.friend.create({
			data: {
				user: { connect: { id: (await updatedFriendship).requesteeId } },
				friend: { connect: { id: (await updatedFriendship).requestorId } },
			}
		});
		console.log(`${(await updatedFriendship).requestorName} and ${(await updatedFriendship).requesteeName} are now friends.`);

		await this.prisma.friendRequest.delete({
			where: {
				requestorId_requesteeId: {
					requestorId: friend,
					requesteeId: user,
				},
			},
		});

		return (updatedFriendship);
	}

	async rejectFriendRequest(user: number, friend: number) {
		const request = this.prisma.friendRequest.update({
			where: {
				requestorId_requesteeId: {
					requestorId: friend,
					requesteeId: user,
				},
			},
			data: {
				status: FriendReqStatus.REJECTED,
			},
		});

		console.log(`${(await request).requestorName} rejected ${(await request).requesteeName}'s friend request.`);

		// delete friend request
		await this.prisma.friendRequest.delete({
			where: {
				requestorId_requesteeId: {
					requestorId: friend,
					requesteeId: user,
				},
			},
		});

		return (request);
	}

	async sendFriendRequest(requestor: User, requesteeId: number) {
		const	targetFriend = await this.prisma.user.findUnique({
			where: {
				id: requesteeId,
			},
		});

		const friendship = this.prisma.friendRequest.create({
			data: {
				requestorId: requestor.id,
				requestorName: requestor.nickname,
				requesteeId: targetFriend.id,
				requesteeName: targetFriend.nickname,
				status: FriendReqStatus.PENDING,
			},
		});

		console.log(`${requestor.nickname} sent a friend request to ${targetFriend.nickname}.`);

		return (friendship);
	}

	async cancelFriendRequest(requestorId: number, requesteeId: number) {
		const targetFriend = await this.prisma.user.findUnique({
			where: {
				id: requesteeId,
			},
		});

		const friendship = await this.prisma.friendRequest.update({
			where: {
				requestorId_requesteeId: {
					requestorId: requestorId,
					requesteeId: targetFriend.id,
				},
			},
			data: {
				status: FriendReqStatus.CANCELLED,
			},
		});

		await this.prisma.friendRequest.delete({
			where: {
				requestorId_requesteeId: {
					requestorId: requestorId,
					requesteeId: targetFriend.id,
				},
			},
		});

		console.log(`${(await friendship).requestorName} cancelled the friend request sent to ${targetFriend.nickname}.`);

		return (friendship);
	}

	async deleteFriend(user: number, friend: number) {
		const [deleteFriend1, deleteFriend2] = await this.prisma.$transaction([
			this.prisma.friend.delete({
				where: {
					userId_friendId: {
						userId: user,
						friendId: friend,
					},
				},
			}),
			this.prisma.friend.delete({
				where: {
					userId_friendId: {
						userId: friend,
						friendId: user,
					},
				},
			}),
		]);

		console.log(`${(await deleteFriend1).userName} and ${(await deleteFriend2).userName} are no longer friends.`);

		return (deleteFriend1);
	}

	async getFriendRequests(user: number) {
		const friendRequests = this.prisma.friendRequest.findMany({
			where: {
                OR: [
                    {
                        requesteeId: user,
                        status: FriendReqStatus.PENDING,
                    },
                    {
                        requestorId: user,
                        status: FriendReqStatus.PENDING,
                    }
                ]
			},
		});

		return (friendRequests);
	}

	async getFriends(user: number) {
		const friends = this.prisma.friend.findMany({
			where: {
				userId: user,
			},
		});

		return (friends);
	}

}
