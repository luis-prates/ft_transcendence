import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('Auth', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	const dto1: AuthDto = {
		id: 1,
		email: 'user1@test.com',
		image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // The smallets base64 image from https://gist.github.com/ondrek/7413434
		name: 'User1',
		nickname: 'tester1',
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
	});

	// Teardown
	afterAll(() => {
		app.close();
	});

	// Testing
	describe('Signin', () => {
		it('should throw if email empty', () => {
			return pactum
				.spec()
				.post('/auth/signin')
				.withBody({
					id: 1,
					name: 'Test User',
					nickname: 'testuser',
				})
				.expectStatus(400);
		});

		it('should throw if nickname empty', () => {
			return pactum
				.spec()
				.post('/auth/signin')
				.withBody({
					email: 'test@test.com',
					id: 1,
				})
				.expectStatus(400);
		});

		it('should throw if image is not base64 encoding', async () => {
			return pactum
				.spec()
				.post('/auth/signin')
				.withBody({
					id: 1,
					email: 'test@test.com',
					image: 'https://test.com/image.jpg',
					name: 'Test User',
					nickname: 'testuser',
				})
				.expectStatus(400);
		});

		it('should signin user1', () => {
			return pactum
				.spec()
				.post('/auth/signin')
				.withBody(dto1)
				.expectStatus(201)
				.stores('userAt1', 'access_token');
		});
	});
});
