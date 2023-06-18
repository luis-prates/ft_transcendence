import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { EditUserDto } from 'src/user/dto';

describe('User', () => {
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

		// create a user
		await pactum
			.spec()
			.post('/auth/signin')
			.withBody(dto1)
			.expectStatus(201)
			.stores('userAt1', 'access_token');
	});

	// Teardown
	afterAll(() => {
		app.close();
	});

	// Testing
	describe('Get me', () => {
		it('should get current user', () => {
			return pactum
				.spec()
				.get('/users/me')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(200);
		});
	});

	describe('Edit user', () => {
		it('should edit user', () => {
			const dto: EditUserDto = {
				name: 'New Tester1',
				email: 'new_user1@gmail.com',
				// TODO: add a test for change of image, change of nickname (if possible)
			};
			return pactum
				.spec()
				.patch('/users')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody(dto)
				.expectStatus(200)
				.expectBodyContains(dto.name)
				.expectBodyContains(dto.email);
		});
	});
});
