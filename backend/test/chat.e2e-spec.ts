import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AuthDto } from 'src/auth/dto';

describe('Chat', () => {
    let app: INestApplication; let prisma: PrismaService;

    const baseImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='; // The smallest base64 image from https://gist.github.com/ondrek/7413434
    const dtos: AuthDto[] = Array.from({length: 3}, (_, i) => {
        const id = i + 1; // as your ids start from 1
        return {
            id: id,
            email: `user${id}@test.com`,
            image: baseImage,
            name: `User${id}`,
            nickname: `tester${id}`,
        }
    });
    // Setup
    beforeAll(async () => {
        // launch app
        const moduleRef = await Test.createTestingModule({ imports: [AppModule], }).compile(); app = moduleRef.createNestApplication(); app.useGlobalPipes(new ValidationPipe({ whitelist: true })); await app.init(); await app.listen(3370); prisma = app.get(PrismaService); await prisma.cleanDb(); await prisma.setupDb();
        pactum.request.setBaseUrl('http://localhost:3370');

        // create a users
        for (const dto of dtos) {
            await pactum
                .spec()
                .post('/auth/signin')
                .withBody(dto)
                .expectStatus(201)
                .stores(`userAt${dto.id}`, 'access_token')
        }
    });

    // Teardown
    afterAll(() => {
        app.close();
    });

    // Testing
    describe('Create a public channel', () => {
        it('should create a public channel', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "name": "myPublicChannel",
                        "channelType": "PUBLIC",
                        "usersToAdd": [2, 3]
                    })
                    .expectBodyContains('PUBLIC')
                    .expectBodyContains('myPublicChannel')
                    .expectStatus(201)
            );
        });
        it('should fail if the channel has no name', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "channelType": "PUBLIC",
                        "usersToAdd": [2, 3]
                    })
                    .expectStatus(400)
            );
        });
        it('should fail if there is no channel type', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "name": "yourPublicChannel",
                        "usersToAdd": [2, 3]
                    })
                    .expectStatus(400)
            );
        });
        it('should fail if there is no usersToAdd', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "name": "yourPublicChannel",
                        "channelType": "PUBLIC",
                    })
                    .expectStatus(400)
            );
        });
        it('should fail if the channel name already exists', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "name": "myPublicChannel",
                        "channelType": "PUBLIC",
                        "usersToAdd": [2, 3]
                    })
                    .expectStatus(409)
            );
        });
    });

    describe('Create a private channel', () => {
        it('should create a private channel', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "name": "myPrivateChannel",
                        "channelType": "PRIVATE",
                        "usersToAdd": [2, 3]
                    })
                    .expectStatus(201)
                    .expectBodyContains('PRIVATE')
                    .expectBodyContains('myPrivateChannel')
            );
        });
    });

    describe('Create a protected channel', () => {
        it('should create a protected channel', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "name": "myProtectedChannel",
                        "channelType": "PRIVATE",
                        "usersToAdd": [2, 3],
                        "password" : "123"
                    })
                    .expectStatus(201)
                    .expectBodyContains('PRIVATE')
                    .expectBodyContains('myProtectedChannel')
            );
        });
    });
});