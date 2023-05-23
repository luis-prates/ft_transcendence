import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';

// For use all throughout the tests
const dto1: AuthDto = {
    id: 1,
    email: 'user1@test.com',
    image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // The smallets base64 image from https://gist.github.com/ondrek/7413434
    name: 'User1',
    nickname: 'tester1',
}
const dto2: AuthDto = {
    id: 2,
    email: 'user2@test.com',
    image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // The smallets base64 image from https://gist.github.com/ondrek/7413434
    name: 'User2',
    nickname: 'tester2',
}

describe('App e2e', () => {
    let app: INestApplication; let prisma: PrismaService; beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ imports: [AppModule], }).compile(); app = moduleRef.createNestApplication(); app.useGlobalPipes(new ValidationPipe({ whitelist: true })); await app.init(); await app.listen(3370); prisma = app.get(PrismaService); await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3370');
    });

    afterAll(() => {
        app.close();
    });

    // Authentication
    describe('Auth', () => {
        describe('Signin', () => {
            it('should throw if email empty', () => {
                return (
                    pactum
                        .spec()
                        .post('/auth/signin')
                        .withBody({
                            id: 1,
                            name: 'Test User',
                            nickname: 'testuser',
                        })
                        .expectStatus(400)
                );
            });

            it('should throw if nickname empty', () => {
                return (
                    pactum
                        .spec()
                        .post('/auth/signin')
                        .withBody({
                            email: 'test@test.com',
                            id: 1,
                        })
                        .expectStatus(400)
                );
            });

            it('should throw if image is not base64 encoding', async () => {
                const response = await pactum
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
                return (
                    pactum
                        .spec()
                        .post('/auth/signin')
                        .withBody(dto1)
                        .expectStatus(201)
                        .stores('userAt1', 'access_token')
                );
            });
            it('should signin user2', () => {
                return (
                    pactum
                        .spec()
                        .post('/auth/signin')
                        .withBody(dto2)
                        .expectStatus(201)
                        .stores('userAt2', 'access_token')
                );
            });
        });

        // TODO: verify the access_token given to us by the front-end and check this off versus 42 OAuth
    });

    // User
    describe('User', () => {
        describe('Get me', () => {
            it('should get current user', () => {
                return (
                    pactum
                        .spec()
                        .get('/users/me')
                        .withHeaders({
                            Authorization: 'Bearer $S{userAt1}'
                        })
                        .expectStatus(200)
                )
            })
        });

        describe('Edit user', () => {
            it('should edit user', () => {
                const dto: EditUserDto = {
                    name: 'New Tester1',
                    email: 'new_user1@gmail.com',
                    // TODO: add a test for change of image, change of nickname (if possible)
                }
                return (
                    pactum
                        .spec()
                        .patch('/users')
                        .withHeaders({
                            Authorization: 'Bearer $S{userAt1}'
                        })
                        .withBody(dto)
                        .expectStatus(200)
                        .expectBodyContains(dto.name)
                        .expectBodyContains(dto.email)
                );
            });
        });
    });

    // Friendship
    describe('Friendship', () => {
        // user1 sends friend request to user2
        describe('Send Friend Request', () => {
            it('should send a friend request from user1 to user2', () => {
                return (
                    pactum
                        .spec()
                        .post('/friendship/send/2')
                        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                        .expectStatus(201)
                        .expectBodyContains('PENDING')
                );
            });
        });

        // User2 accepts the friend request from user1
        describe('Accept Friend Request', () => {
            // send a friend request before it can be accepted
            it('should accept the friend request from user1 to user2', () => {
                return (
                    pactum
                        .spec()
                        .post('/friendship/accept/1')
                        .withHeaders({ Authorization: 'Bearer $S{userAt2}' })
                        .expectStatus(201)
                        .expectBodyContains('ACCEPTED')
                );
            });
            // it('should throw an error if trying to send another friend request to the same user', () => {
            //     return (
            //         pactum
            //             .spec()
            //             .post('/friendship/accept/1')
            //             .withHeaders({ Authorization: 'Bearer $S{userAt2}' })
            //             .expectStatus(404)
            //     )
            // })
        });
        describe('Unfriend', () => {
            it('should remove user1 from the friend list of user2 and vice versa', () => {
                return (
                    pactum
                        .spec()
                        .delete('/friendship/unfriend/1')
                        .withHeaders({ Authorization: 'Bearer $S{userAt2}' })
                        .expectStatus(204)
                );
            })
        });
        describe('Reject Friend Request', () => {
            // send a friend request from user1 to user2 first
            beforeEach(async () => {
                await pactum
                    .spec()
                    .post('/friendship/send/2')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .expectStatus(201)
            });
            // then test the rejection from user2
            it ('should reject the friendship', () => {
                return (
                    pactum
                        .spec()
                        .delete('/friendship/reject/1')
                        .withHeaders({ Authorization: 'Bearer $S{userAt2}' })
                        .expectStatus(204)
                );
            });
        });
        describe('Cancel Friend Request', () => {
            // send a friend request from user1 to user2 first
            beforeEach(async () => {
                await pactum
                    .spec()
                    .post('/friendship/send/2')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .expectStatus(201)
            });
            // cancel friend request from user1
            it ('should cancel the friend request', () => {
                return (
                    pactum
                        .spec()
                        .delete('/friendship/cancel/2')
                        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                        .expectStatus(204)
                );
            });
        })
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
                    .expectStatus(201)
            });
            // return friendslist
            it ('should return the full friends list of the user', () => {
                return (
                    pactum
                        .spec()
                        .get('/friendship/friends')
                        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                        .expectStatus(200)
                );
            })
        })
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
            it ('should return the friend requests of the user', () => {
                return (
                    pactum
                        .spec()
                        .get('/friendship/requests')
                        .withHeaders({ Authorization: 'Bearer $S{userAt2}' })
                        .expectStatus(200)
                        .expectBodyContains('PENDING')
                        .inspect()
                );
            })
        })
    });
});