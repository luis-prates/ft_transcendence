import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('Blocklist', () => {
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
	describe('Blocking', () => {
		it('should block a user', () => {
			return pactum
				.spec()
				.post('/blocklist/block/2')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.expectStatus(201)
		});
        it('should not block a user if already blocked', () => {
            return pactum
                .spec()
                .post('/blocklist/block/2')
                .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                .expectStatus(409)
        });
        it('should not block a user if user does not exist', () => {
            return pactum
                .spec()
                .post('/blocklist/block/3')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(404)
        });
        it('should not block a user if user is self', () => {
            return pactum
                .spec()
                .post('/blocklist/block/1')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(400)
        });
    });
    describe('Unblocking', () => {
        it('should unblock a user', () => {
            return pactum
                .spec()
                .delete('/blocklist/block/2')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(204)
        });
        it('should not unblock a user if not blocked', () => {
            return pactum
                .spec()
                .delete('/blocklist/block/2')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(400)
        });
        it('should not unblock a user if user does not exist', () => {
            return pactum
                .spec()
                .delete('/blocklist/block/3')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(404)
        });
        it('should not unblock a user if user is self', () => {
            return pactum
                .spec()
                .delete('/blocklist/block/1')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(400)
        });
	});
    describe('Viewing', () => {
        beforeAll(async () => {
            await pactum
                .spec()
                .post('/blocklist/block/2')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(201)
        });
        it('should get list of blocked users', () => {
            return pactum
                .spec()
                .get('/blocklist')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(200)
        });
        it('should get list of users who blocked you', () => {
            return pactum
                .spec()
                .get('/blocklist/blockedBy')
                .withHeaders({ Authorization : 'Bearer $S{userAt1}' })
                .expectStatus(200)
        });
    });
});