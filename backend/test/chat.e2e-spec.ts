import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AuthDto } from 'src/auth/dto';
import socketIoClient, { Socket } from "socket.io-client";

describe('Chat', () => {
    let app: INestApplication; let prisma: PrismaService;

    const baseImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='; // The smallest base64 image from https://gist.github.com/ondrek/7413434
    // for logging in
    const dtos: AuthDto[] = Array.from({ length: 3 }, (_, i) => {
        const id = i + 1; // as your ids start from 1
        return {
            id: id,
            email: `user${id}@test.com`,
            image: baseImage,
            name: `User${id}`,
            nickname: `tester${id}`,
        }
    });
    // for websockets
    let clients: Socket[] = [];
    let listeners = [];

    // Setup
    beforeAll(async () => {
        // launch app
        const moduleRef = await Test.createTestingModule({ imports: [AppModule], }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
        await app.listen(3370);
        prisma = app.get(PrismaService);
        await prisma.cleanDb();
        await prisma.setupDb();
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

        // connect all users to the socket
        await Promise.all(dtos.map(async (dto) => {
            const client = socketIoClient('http://localhost:3001/chat', { query: { userId: dto.id.toString() } });
            clients.push(client);

            // Test connection for each client
            await new Promise((resolve, reject) => {
                client.on('connect', () => resolve(undefined));
                client.on('connect_error', reject);
            });
        }));
    });

    // Teardown
    afterAll(async () => {
        for (const client of clients) {
            client.disconnect();
        }
        await app.close();
    });

    // afterEach
    afterEach(() => {
        // Clean up listeners after each test.
        for (let listener of listeners) {
            listener.client.off('message', listener.handler);
            // add more events here if needed
        }
        listeners = [];
    });

    // Testing
    // Let's start by creating 3 channels: a public channel, a private channel and a protected channel.
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
                    .stores('publicChannelId', 'id')
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
                    .stores('privateChannelId', 'id')
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
                        "channelType": "PROTECTED",
                        "usersToAdd": [2, 3],
                        "password": "123"
                    })
                    .expectStatus(201)
                    .expectBodyContains('PROTECTED')
                    .expectBodyContains('myProtectedChannel')
                    .stores('protectedChannelId', 'id')
            );
        });
    });

    // Create a DM channel between user1 and user2
    describe('Create a DM channel', () => {
        it('should create a DM channel', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "channelType": "DM",
                        "usersToAdd": [2],
                    })
                    .expectStatus(201)
                    .expectBodyContains('DM')
                    .stores('DMChannelId', 'id')
            );
        });
        it('should fail if usersToAdd is empty', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "channelType": "DM",
                        "usersToAdd": [],
                    })
                    .expectStatus(400)
            );
        });
        it('should fail if usersToAdd has more than 1 person', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt2}' })
                    .withBody({
                        "channelType": "DM",
                        "usersToAdd": [1, 3],
                    })
                    .expectStatus(400)
            );
        });
        it('should fail if the DM channel already exists', () => {
            return (
                pactum
                    .spec()
                    .post('/chat/channels')
                    .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
                    .withBody({
                        "channelType": "DM",
                        "usersToAdd": [2],
                    })
                    .expectStatus(409)
            );
        });
    });

    // Send some messages in each channel!
    describe('Send messages', () => {
        it('should connect all the users', async () => {
            const connectionPromises = clients.map(client => new Promise((resolve, reject) => {
                if (client.connected) {
                    resolve(undefined);
                } else {
                    client.on('connect', () => {
                        expect(client.connected).toBeTruthy();
                        resolve(undefined);
                    });
                    client.on('connect_error', (err) => {
                        reject(err);
                    });
                }
            }));
            await Promise.all(connectionPromises);
        });
        it('should send a message to the public channel', async () => {
            // get publicChannelId as a string
            const publicChannelId =  pactum.stash.getDataStore()['publicChannelId'];
            console.log("publicChannelId: ", publicChannelId);
            // emit the message event as user1
            // clients[0].emit('message', { "channelId": publicChannelId, "message": "Hello World!" });
            // expect the message to be received by user2 and user3
            const messagePromises = clients.slice(1).map(client => new Promise((resolve, reject) => {
                const handler = ({channelId, message}) => {
                    expect(channelId).toBe(publicChannelId);
                    expect(message).toBe('Hello from Public!');
                    resolve(undefined);
                };
                client.on('message', handler);
                listeners.push({client, handler});
            }));
            setImmediate(() => clients[0].emit('message', { "channelId": publicChannelId, "message": "Hello from Public!" }));
            await Promise.all(messagePromises);
        });
        it('should send a message to the private channel', async () => {
            const privateChannelId = pactum.stash.getDataStore()['privateChannelId'];
            // We'll make an array of promises for every client that needs to receive the message
            const messagePromises = clients.slice(1).map(client => new Promise((resolve, reject) => {
                // We'll make a handler for each client that will resolve the promise when the message is received
                const handler = ({channelId, message}) => {
                    expect(channelId).toBe(privateChannelId);
                    expect(message).toBe('Hello from Private!');
                    resolve(undefined);
                };
                // once a message is received, we'll call the handler which resolves the promise
                client.on('message', handler);
                listeners.push({client, handler});
            }));
            // setImmediate will run the code after the current event loop
            // This is needed because the client.on('message') is not yet set up
            setImmediate(() => clients[0].emit('message', { "channelId": privateChannelId, "message": "Hello from Private!" }));
            // the Promise.all method will wait for all the promises to resolve
            await Promise.all(messagePromises);
        });
        it('should send a message to the protected channel', async () => {
            const protectedChannelId = pactum.stash.getDataStore()['protectedChannelId'];
            // We'll make an array of promises for every client that needs to receive the message
            const messagePromises = clients.slice(1).map(client => new Promise((resolve, reject) => {
                // We'll make a handler for each client that will resolve the promise when the message is received
                const handler = ({channelId, message}) => {
                    expect(channelId).toBe(protectedChannelId);
                    expect(message).toBe('Hello from Protected!');
                    resolve(undefined);
                };
                // once a message is received, we'll call the handler which resolves the promise
                client.on('message', handler);
                listeners.push({client, handler});
            }));
            // setImmediate will run the code after the current event loop
            // This is needed because the client.on('message') is not yet set up
            setImmediate(() => clients[0].emit('message', { "channelId": protectedChannelId, "message": "Hello from Protected!" }));
            // the Promise.all method will wait for all the promises to resolve
            await Promise.all(messagePromises);
        });
        // Note: For DM we only need to set up 1 client to receive the message
        it('should send a message to the DM channel', async () => {
            const DMChannelId = pactum.stash.getDataStore()['DMChannelId'];
            // We'll make an array of promises for every client that needs to receive the message
            const messagePromise = new Promise((resolve, reject) => {
                // We'll make a handler for each client that will resolve the promise when the message is received
                const handler = ({ channelId, message }) => {
                    expect(channelId).toBe(DMChannelId);
                    expect(message).toBe('Hello from DM!');
                    resolve(undefined);
                };
                // once a message is received, we'll call the handler which resolves the promise
                clients[1].on('message', handler);
                listeners.push({ client: clients[1], handler });
            });
            // setImmediate will run the code after the current event loop
            // This is needed because the client.on('message') is not yet set up
            setImmediate(() => clients[0].emit('message', { "channelId": DMChannelId, "message": "Hello from DM!" }));
            // the Promise.all method will wait for all the promises to resolve
            await messagePromise;
        });

        // Retrieve the channel list that a user can inspect and join

        // Retrieve the channel list the user is already in

        // Retrieve all of a user's messages accross all channels

        // Retrieve all of a user's messages for a specific channel

        // User4 joins to the public channel
        // Other users should be notified about a new user in the channel
        // And should see his messages

        // Make the owner user1 kick user4 out of the public channel
        // Other users should be notified about the user leaving the channel

        // Invite a fourth user to the private channel
        // And let the fourth user leave the private channel, others should be notified

        // User4 joins the protected channel by knowing the password
        // And let the owner make him admin

        // Let the new admin user mute user2 and see if it works

        // Let the owner unmute user2 and see if it works

        // Take away the admin privileges of user4

    });
    describe('Disconnect', () => {
        it('should disconnect all the users', async () => {
            // Tell all the clients to disconnect
            clients.forEach(client => client.disconnect());

            // Then wait for them all to disconnect
            const disconnectionPromises = clients.map(client => new Promise((resolve, reject) => {
                if (!client.connected) {
                    resolve(undefined);
                } else {
                    client.on('disconnect', () => {
                        expect(client.connected).toBeFalsy();
                        resolve(undefined);
                    });
                    client.on('connect_error', (err) => {
                        reject(err);
                    });
                }
            }));
            await Promise.all(disconnectionPromises);
        });
    });
});
