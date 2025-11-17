import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import totp from 'totp-generator';

describe('2FA', () => {
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
		await pactum.spec().post('/auth/signin').withBody(dto1).expectStatus(201).stores('userAt1', 'access_token');
	});

	// Teardown
	afterAll(() => {
		app.close();
	});

	describe('Generate 2FA secret', () => {
		// Testing
		it('should generate 2FA secret', () => {
			return pactum
				.spec()
				.post('/auth/2fa/generate')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(201)
				.expectJsonLike({
					secret: /.+/,
				})
				.stores('secretAt1', 'secret');

			// secret = response.secret; // assuming the secret is returned in 'secret' key
			// expect(secret).to.exist;
		});
	});

	describe('Turn on 2FA', () => {
		it('should give invalid 2FA', async () => {
			await pactum
				.spec()
				.post('/auth/2fa/generate')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(201)
				.expectJsonLike({
					secret: /.+/,
				});

			return pactum
				.spec()
				.post('/auth/2fa/turn-on')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.withJson({ twoFACode: '123456' })
				.expectStatus(401)
				.expectBodyContains('Invalid 2FA code');
		});

		it('should turn on 2FA', async () => {
			const token = await pactum
				.spec()
				.post('/auth/2fa/generate')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(201)
				.expectJsonLike({
					secret: /.+/,
				});

			return pactum
				.spec()
				.post('/auth/2fa/turn-on')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.withJson({ twoFACode: totp(token.body.secret) })
				.expectStatus(201);
		});

		it('should already be turned on 2FA', async () => {
			const token = await pactum
				.spec()
				.post('/auth/2fa/generate')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(201)
				.expectJsonLike({
					secret: /.+/,
				});

			return await pactum
				.spec()
				.post('/auth/2fa/turn-on')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.withJson({ twoFACode: totp(token.body.secret) })
				.expectStatus(401)
				.expectBodyContains('2FA is already turned on');
		});
	});

	describe('Turn off 2FA', () => {
		it('should give invalid 2FA', async () => {
			return pactum
				.spec()
				.post('/auth/2fa/turn-off')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.withJson({ twoFACode: '123456' })
				.expectStatus(401)
				.expectBodyContains('Invalid 2FA code');
		});

		it('should turn off 2FA', async () => {
			const token = await pactum
				.spec()
				.post('/auth/2fa/generate')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(201)
				.expectJsonLike({
					secret: /.+/,
				});

			return pactum
				.spec()
				.post('/auth/2fa/turn-off')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.withJson({ twoFACode: totp(token.body.secret) })
				.expectStatus(201);
		});

		it('should already be turned off 2FA', async () => {
			return pactum
				.spec()
				.post('/auth/2fa/turn-off')
				.withHeaders({ Authorization: 'Bearer $S{userAt1}' })
				.withJson({ twoFACode: '123456' })
				.expectStatus(403)
				.expectBodyContains('Two factor authentication is not set up. Please turn it on first');
		});
	});
});
