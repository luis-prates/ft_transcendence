import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { GameStatus, GameType } from '@prisma/client';

describe('Game', () => {
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

	const dtoBot: AuthDto = {
		id: 6969,
		email: 'marvin@marvin.com',
		image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // The smallets base64 image from https://gist.github.com/ondrek/7413434
		name: 'Marvin',
		nickname: 'marvin',
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
			.stores('userAt1', 'access_token')
			.stores('user1Id', 'dto.id');
		await pactum
			.spec()
			.post('/auth/signin')
			.withBody(dto2)
			.expectStatus(201)
			.stores('userAt2', 'access_token')
			.stores('user2Id', 'dto.id');
		await pactum.spec().post('/auth/signin').withBody(dtoBot).expectStatus(201).stores('userBot', 'access_token');
	});

	// Teardown
	afterAll(() => {
		app.close();
	});

	describe('Create game', () => {
		it('should not create game', () => {
			return pactum
				.spec()
				.post('/game/create')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					players: [],
				})
				.expectStatus(400);
		});

		it('should give error with no players field', () => {
			return pactum
				.spec()
				.post('/game/create')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: GameStatus.NOT_STARTED,
					gameType: GameType.PRIVATE,
					gameRequest: {
						objectId: '1',
						maxScore: 10,
						table: 'TABLE',
						tableSkin: 'TABLE_SKIN',
						bot: true,
					},
				})
				.expectStatus(400);
		});

		it('should create game with empty players array', () => {
			return pactum
				.spec()
				.post('/game/create')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: GameStatus.NOT_STARTED,
					players: [],
					gameType: GameType.PRIVATE,
					gameRequest: {
						objectId: '1',
						maxScore: 10,
						table: 'TABLE',
						tableSkin: 'TABLE_SKIN',
						bot: true,
					},
				})
				.expectStatus(201);
		});

		it('should create game with 1 player', () => {
			return pactum
				.spec()
				.post('/game/create')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: GameStatus.NOT_STARTED,
					players: [1],
					gameType: GameType.PUBLIC,
					gameRequest: {
						objectId: '1',
						maxScore: 10,
						table: 'TABLE',
						tableSkin: 'TABLE_SKIN',
						bot: true,
					},
				})
				.expectStatus(201);
		});

		it('should create game with 2 players', () => {
			return pactum
				.spec()
				.post('/game/create')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: GameStatus.NOT_STARTED,
					players: [1, 2],
					gameType: GameType.PUBLIC,
					gameRequest: {
						objectId: '1',
						maxScore: 10,
						table: 'TABLE',
						tableSkin: 'TABLE_SKIN',
						bot: false,
					},
				})
				.expectStatus(201)
				.stores('gameId', 'id');
		});

		it('should end game', () => {
			return pactum
				.spec()
				.patch('/game/end/$S{gameId}')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: GameStatus.FINISHED,
					gameStats: {
						winnerScore: 3,
						loserScore: 0,
						winnerId: 1,
						loserId: 2,
					},
				})
				.expectStatus(200);
		});
	});

	describe('Get Games', () => {
		it('should forbidden exception on get active games - no status', () => {
			return pactum
				.spec()
				.get('/game/active')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(403)
				.expectBodyContains('Cannot get games without status.');
		});

		it('should forbidden exception on get active games - finished', () => {
			return pactum
				.spec()
				.get('/game/active')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: [GameStatus.FINISHED],
				})
				.expectStatus(403)
				.expectBodyContains('Cannot get finished games.');
		});

		it('should forbidden exception on get active games - finished and not started', () => {
			return pactum
				.spec()
				.get('/game/active')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: [GameStatus.NOT_STARTED, GameStatus.FINISHED],
				})
				.expectStatus(403)
				.expectBodyContains('Cannot get finished games.');
		});

		it('should get active games - not started', () => {
			return pactum
				.spec()
				.get('/game/active')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: [GameStatus.NOT_STARTED],
				})
				.expectStatus(200)
				.expectJsonLength(2);
		});

		it('should get active games - not started and in progress', () => {
			return pactum
				.spec()
				.get('/game/active')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.withBody({
					status: [GameStatus.NOT_STARTED, GameStatus.IN_PROGESS],
				})
				.expectStatus(200)
				.expectJsonLength(2);
		});

		it('should get user games', () => {
			return pactum
				.spec()
				.get('/game/$S{user1Id}')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(200)
				.expectJsonLength(1);
		});
	});

	describe('Get leaderboard', () => {
		it('should get leaderboard', () => {
			return pactum
				.spec()
				.get('/game/leaderboard')
				.withHeaders({
					Authorization: 'Bearer $S{userAt1}',
				})
				.expectStatus(200);
		});
	});
});
