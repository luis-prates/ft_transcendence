import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('Friendship', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	const dto1: AuthDto = {
		id: 1,
		email: 'user1@test.com',
		image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // The smallets base64 image from https://gist.github.com/ondrek/7413434
		name: 'User1',
		nickname: 'tester1',
	};
	const dto2: AuthDto = {
		id: 2,
		email: 'user2@test.com',
		image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // The smallets base64 image from https://gist.github.com/ondrek/7413434
		name: 'User2',
		nickname: 'tester2',
	};

	// Setup
	beforeAll(async () => {
		// launch app
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
		await app.init();
		await app.listen(3370);
		prisma = app.get(PrismaService);
		await prisma.cleanDb();
		await prisma.setupDb();
		pactum.request.setBaseUrl('http://localhost:3370');

		// create a user
		await pactum
			.spec()
			.post('/auth/signin')
			.withBody(dto1)
			.expectStatus(201)
			.stores('userAt1', 'access_token');
		// create a user
		await pactum
			.spec()
			.post('/auth/signin')
			.withBody(dto2)
			.expectStatus(201)
			.stores('userAt2', 'access_token');
	});

	// Teardown
	afterAll(() => {
		app.close();
	});

	// Testing
	describe('Send Friend Request', () => {
		it('should send a friend request from user1 to user2', () => {
			return pactum
				.spec()
				.post('/friendship/send/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(201)
				.expectBodyContains('PENDING');
		});
	});

	// User2 accepts the friend request from user1
	describe('Accept Friend Request', () => {
		// send a friend request before it can be accepted
		it('should accept the friend request from user1 to user2', () => {
			return pactum
				.spec()
				.post('/friendship/accept/1')
				.withHeaders({ Authorization: 'Bearer $S{userAt2}' })
				.expectStatus(201)
				.expectBodyContains('ACCEPTED');
		});
	});
	describe('Unfriend', () => {
		it('should remove user1 from the friend list of user2 and vice versa', () => {
			return pactum
				.spec()
				.delete('/friendship/unfriend/1')
				.withHeaders({ Authorization: 'Bearer $S{userAt2}' })
				.expectStatus(204);
		});
	});
	describe('Reject Friend Request', () => {
		// send a friend request from user1 to user2 first
		beforeEach(async () => {
			await pactum
				.spec()
				.post('/friendship/send/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(201);
		});
		// then test the rejection from user2
		it('should reject the friendship', () => {
			return pactum
				.spec()
				.delete('/friendship/reject/1')
				.withHeaders({ Authorization: 'Bearer $S{userAt2}' })
				.expectStatus(204);
		});
	});
	describe('Cancel Friend Request', () => {
		// send a friend request from user1 to user2 first
		beforeEach(async () => {
			await pactum
				.spec()
				.post('/friendship/send/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(201);
		});
		// cancel friend request from user1
		it('should cancel the friend request', () => {
			return pactum
				.spec()
				.delete('/friendship/cancel/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(204);
		});
	});
	describe('Get Friends List', () => {
		// send a friend request from user1 to user2 first and accept it
		beforeEach(async () => {
			await pactum
				.spec()
				.post('/friendship/send/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(201);
			await pactum
				.spec()
				.post('/friendship/accept/1')
				.withHeaders({ Authorization: 'Bearer $S{userAt2}' })
				.expectStatus(201);
		});
		// return friendslist
		it('should return the full friends list of the user', () => {
			return pactum
				.spec()
				.get('/friendship/friends')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(200);
		});
	});
	describe('Get Friends Requests', () => {
		// remove current friendship and make a new one
		beforeEach(async () => {
			await pactum
				.spec()
				.delete('/friendship/unfriend/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(204);
			await pactum
				.spec()
				.post('/friendship/send/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(201);
		});
		// return friendrequest
		it('should return the friend requests of the user', () => {
			return pactum
				.spec()
				.get('/friendship/requests')
				.withHeaders({ Authorization: 'Bearer $S{userAt2}' })
				.expectStatus(200)
				.expectBodyContains('PENDING');
		});
	});
});
