import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';


describe('App e2e', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({
			whitelist: true
		}));
		await app.init();
		await app.listen(3370);

		prisma = app.get(PrismaService);

		await prisma.cleanDb();
		pactum.request.setBaseUrl('http://localhost:3370');
	});

	afterAll(() => {
		app.close();
	});

	
	describe('Auth', () => {
		const dto: AuthDto = {
			email: 'test@test.com',
			id: 123456,
			image: 'https://test.com/image.jpg',
			name: 'Test User',
			nickname: 'testuser',
		}

		describe('Signin', () => {
			it('should throw if email empty', () => {
				return (
					pactum
					.spec()
					.post('/auth/signin')
					.withBody({
						name: dto.name,
					})
					.expectStatus(400)
				);
			});

			it('should throw if password empty', () => {
				return (
					pactum
					.spec()
					.post('/auth/signin')
					.withBody({
						email: dto.email,
					})
					.expectStatus(400)
				);
			});

			it('should throw if no body', () => {
				return (
					pactum
					.spec()
					.post('/auth/signin')
					.expectStatus(400)
				);
			});

			it('should signin', () => {
				return (
					pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto)
					.expectStatus(201)
					.stores('userAt', 'access_token')
				);
			});
		});

	});

	describe('User', () => {
		describe('Get me', () => {
			it('should get current user', () => {
				return (
					pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.expectStatus(200)
				)
			})
		});

		describe('Edit user', () => {
			it('should edit user', () => {
				const dto: EditUserDto = {
					name: 'Luis',
					email: 'testlp@gmail.com'
				}
				return (
					pactum
					.spec()
					.patch('/users')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.withBody(dto)
					.expectStatus(200)
					.expectBodyContains(dto.name)
					.expectBodyContains(dto.email)
				);
			});
		});
	});

})