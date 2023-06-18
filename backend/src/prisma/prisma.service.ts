import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelType, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
	constructor(config: ConfigService) {
		super({
			datasources: {
				db: {
					url: config.get('DATABASE_URL'),
				},
			},
		});
	}

	async onModuleInit() {
		await this.setupDb();
	}

	// On startup
	async setupDb() {
		const globalChannelName = 'global';

		const existingGlobalChannel = await this.channel.findUnique({
			where: { name: globalChannelName },
		});

		if (!existingGlobalChannel) {
			await this.channel.create({
				data: {
					// id: 1, // we want this for normal mode but not for testing
					name: globalChannelName,
					type: ChannelType.PUBLIC,
				},
			});
			console.log('Global channel created');
		}
	}

	// When shutting down
	cleanDb() {
		return this.$transaction([
			// friend requests
			this.friendRequest.deleteMany(),

            // blocklist
            this.blocklist.deleteMany(),

			// messages
			this.message.deleteMany(),

			// channel
			this.channelUser.deleteMany(),
			this.channel.deleteMany(),

			// user
			this.user.deleteMany(),
		]);
	}
}
