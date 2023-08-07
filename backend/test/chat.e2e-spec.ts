/* eslint-disable prettier/prettier */
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import socketIoClient, { Socket } from 'socket.io-client';

type HandlerArg = {
  channelId: string;
  userId: string;
  message: string;
};

type IDataStore = {
  [key: string]: any;
};

describe('Chat', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const baseImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='; // The smallest base64 image from https://gist.github.com/ondrek/7413434
  // for logging in
  const dtos: AuthDto[] = Array.from({ length: 4 }, (_, i) => {
    const id = i + 1; // as your ids start from 1
    return {
      id: id,
      email: `user${id}@test.com`,
      image: baseImage,
      name: `User${id}`,
      nickname: `tester${id}`,
    };
  });
  // for websockets
  const clients: Socket[] = [];
  let listeners: any[] = [];

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

    // create a users
    for (const dto of dtos) {
      await pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(201)
        .stores(`userAt${dto.id}`, 'access_token')
        .stores(`user${dto.id}Id`, 'dto.id');
    }

    // connect all users to the socket
    await Promise.all(
      dtos.map(async dto => {
        const client = socketIoClient('http://localhost:3370/chat', {
          query: { userId: dto.id.toString() },
        });
        clients.push(client);

        // Test connection for each client
        await new Promise((resolve, reject) => {
          client.on('connect', () => resolve(undefined));
          client.on('connect_error', reject);
        });
      }),
    );
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
    for (const listener of listeners) {
      listener.client.off('message', listener.handler);
      listener.client.off('user-added', listener.handler);
      listener.client.off('user-removed', listener.handler);
      listener.client.off('user-muted', listener.handler);
      listener.client.off('muted-message', listener.handler);
      listener.client.off('user-unmuted', listener.handler);
      listener.client.off('user-promoted', listener.handler);
      listener.client.off('user-demoted', listener.handler);
      // add more events here if needed
    }
    listeners = [];
  });

  // Testing
  // Let's start by creating 3 channels: a public channel, a private channel and a protected channel.
  describe('Create a public channel', () => {
    it('should create a public channel', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'myPublicChannel',
          channelType: 'PUBLIC',
          usersToAdd: [2, 3],
        })
        .expectBodyContains('PUBLIC')
        .expectBodyContains('myPublicChannel')
        .expectStatus(201)
        .stores('publicChannelId', 'id');
    });
    it('should fail if the channel has no name', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'PUBLIC',
          usersToAdd: [2, 3],
        })
        .expectStatus(400);
    });
    it('should fail if there is no channel type', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'yourPublicChannel',
          usersToAdd: [2, 3],
        })
        .expectStatus(400);
    });
    it('should fail if there is no usersToAdd', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'yourPublicChannel',
          channelType: 'PUBLIC',
        })
        .expectStatus(400);
    });
    it('should fail if the channel name already exists', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'myPublicChannel',
          channelType: 'PUBLIC',
          usersToAdd: [2, 3],
        })
        .expectStatus(409);
    });
  });

  describe('Create a private channel', () => {
    it('should create a private channel', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'myPrivateChannel',
          channelType: 'PRIVATE',
          usersToAdd: [2, 3],
        })
        .expectStatus(201)
        .expectBodyContains('PRIVATE')
        .expectBodyContains('myPrivateChannel')
        .stores('privateChannelId', 'id');
    });
  });

  describe('Create a protected channel', () => {
    it('should create a protected channel', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'myProtectedChannel',
          channelType: 'PROTECTED',
          usersToAdd: [2, 3],
          password: '123',
        })
        .expectStatus(201)
        .expectBodyContains('PROTECTED')
        .expectBodyContains('myProtectedChannel')
        .stores('protectedChannelId', 'id');
    });
  });

  // Create a DM channel between user1 and user2
  describe('Create a DM channel', () => {
    it('should create a DM channel', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'DM',
          usersToAdd: [2],
        })
        .expectStatus(201)
        .expectBodyContains('DM')
        .stores('DMChannelId', 'id');
    });
    it('should fail if usersToAdd is empty', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'DM',
          usersToAdd: [],
        })
        .expectStatus(400);
    });
    it('should fail if usersToAdd has more than 1 person', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt2}' })
        .withBody({
          channelType: 'DM',
          usersToAdd: [1, 3],
        })
        .expectStatus(400);
    });
    it('should fail if the DM channel already exists', () => {
      return pactum
        .spec()
        .post('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'DM',
          usersToAdd: [2],
        })
        .expectStatus(409);
    });
  });

  // Edit a channel
  describe('Edit a channel', () => {
    it('should change a channel name', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{publicChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'aBetterNameForAPublicChannel',
        })
        .expectStatus(200);
    });
    it('should change a channel from PUBLIC to PRIVATE type', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{publicChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'PRIVATE',
        })
        .expectStatus(200);
    });
    it('should change a channel from PRIVATE to PROTECTED type', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{publicChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'PROTECTED',
          password: '12345',
        })
        .expectStatus(200);
    });
    it('should change a channel from PROTECTED to PUBLIC type', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{publicChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'PUBLIC',
        })
        .expectStatus(200);
    });
    it('should not allow to set a password to a public channel', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{publicChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'PUBLIC',
          password: '123',
        })
        .expectStatus(400);
    });
    it('should allow us to change the name back to the original', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{publicChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'myPublicChannel',
        })
        .expectStatus(200);
    });
    it('should not allow to edit a DM channel', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{DMChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          name: 'aBetterNameForADMChannel',
          channelType: 'DM',
        })
        .expectStatus(401);
    });
    it('should not allow to remove password from a PROTECTED channel', () => {
      return pactum
        .spec()
        .patch('/chat/channels/edit/$S{protectedChannelId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({
          channelType: 'PROTECTED',
          password: '',
        })
        .expectStatus(400);
    });
  });

  // Send some messages in each channel!
  describe('Send messages', () => {
    it('should connect all the users', async () => {
      const connectionPromises = clients.map(
        client =>
          new Promise((resolve, reject) => {
            if (client.connected) {
              resolve(undefined);
            } else {
              client.on('connect', () => {
                expect(client.connected).toBeTruthy();
                resolve(undefined);
              });
              client.on('connect_error', err => {
                reject(err);
              });
            }
          }),
      );
      await Promise.all(connectionPromises);
    });
    it('should send a message to the public channel', async () => {
      // get publicChannelId as a string
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const publicChannelId: string = dataStore['publicChannelId'];
      // expect the message to be received by user2 and user3
      const messagePromises = clients.slice(1, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, message }: HandlerArg) => {
              expect(channelId).toBe(publicChannelId);
              expect(message).toBe('Hello from Public!');
              resolve(undefined);
            };
            client.on('message', handler);
            listeners.push({ client, handler });
          }),
      );
      // Emit the message as user1
      clients[0].emit('message', {
        channelId: publicChannelId,
        message: 'Hello from Public!',
      });
      await Promise.all(messagePromises);
    });
    it('should send a message to the private channel', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const privateChannelId: string = dataStore['privateChannelId'];
      // We'll make an array of promises for every client that needs to receive the message
      const messagePromises = clients.slice(1, 3).map(
        client =>
          new Promise((resolve, reject) => {
            // We'll make a handler for each client that will resolve the promise when the message is received
            const handler = ({ channelId, message }: HandlerArg) => {
              expect(channelId).toBe(privateChannelId);
              expect(message).toBe('Hello from Private!');
              resolve(undefined);
            };
            // once a message is received, we'll call the handler which resolves the promise
            client.on('message', handler);
            listeners.push({ client, handler });
          }),
      );
      // setImmediate will run the code after the current event loop
      // This is needed because the client.on('message') is not yet set up
      setImmediate(() =>
        clients[0].emit('message', {
          channelId: privateChannelId,
          message: 'Hello from Private!',
        }),
      );
      // the Promise.all method will wait for all the promises to resolve
      await Promise.all(messagePromises);
    });
    it('should send a message to the protected channel', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const protectedChannelId: string = dataStore['protectedChannelId'];
      // We'll make an array of promises for every client that needs to receive the message
      const messagePromises = clients.slice(1, 3).map(
        client =>
          new Promise((resolve, reject) => {
            // We'll make a handler for each client that will resolve the promise when the message is received
            const handler = ({ channelId, message }: HandlerArg) => {
              expect(channelId).toBe(protectedChannelId);
              expect(message).toBe('Hello from Protected!');
              resolve(undefined);
            };
            // once a message is received, we'll call the handler which resolves the promise
            client.on('message', handler);
            listeners.push({ client, handler });
          }),
      );
      // setImmediate will run the code after the current event loop
      // This is needed because the client.on('message') is not yet set up
      setImmediate(() =>
        clients[0].emit('message', {
          channelId: protectedChannelId,
          message: 'Hello from Protected!',
        }),
      );
      // the Promise.all method will wait for all the promises to resolve
      await Promise.all(messagePromises);
    });
    // Note: For DM we only need to set up 1 client to receive the message
    it('should send a message to the DM channel', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const DMChannelId = dataStore['DMChannelId'];
      // We'll make an array of promises for every client that needs to receive the message
      const messagePromise = new Promise((resolve, reject) => {
        // We'll make a handler for each client that will resolve the promise when the message is received
        const handler = ({ channelId, message }: HandlerArg) => {
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
      setImmediate(() =>
        clients[0].emit('message', {
          channelId: DMChannelId,
          message: 'Hello from DM!',
        }),
      );
      // the Promise.all method will wait for all the promises to resolve
      await messagePromise;
    });
    it('should not let messages from blocked users be sent to users that blocked them', async () => {
      await pactum
        .spec()
        .post('/blocklist/block/$S{user2Id}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(201);

      const dataStore: IDataStore = pactum.stash.getDataStore();
      const protectedChannelId = dataStore['protectedChannelId'];
      const user2Id = dataStore['user2Id'];

      // promise that will resolve if no message is received from user4 to user1 for 1 second
      const messagePromise = new Promise((resolve, reject) => {
        // We'll make a handler for each client that will resolve the promise when the message is received
        const handler = ({ channelId: receivedChannelId, message }: HandlerArg) => {
          // If the blocking user1 receives a message from user4, reject the promise
          reject(new Error(`User ${user2Id} is blocked but their message was received.`));
        };
        // once a message by user1 is received, we'll call the handler
        clients[0].on('message', handler);
        listeners.push({ client: clients[0], handler });

        // send message from user2 to user1
        clients[1].emit('message', {
          channelId: protectedChannelId,
          message: 'Hello from Blocked User!',
        });

        // if no message is received after 1 second, resolve the promise
        setTimeout(resolve, 1000);
      });
    });
    it('should allow users to receive messages from users that they have unblocked', async () => {
      // unblock user2
      await pactum
        .spec()
        .delete('/blocklist/block/$S{user2Id}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(204);

      // get channelId
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const channelId: string = dataStore['protectedChannelId'];

      // promise that will resolve if a message is received from user4 to user1
      const messagePromise = new Promise((resolve, reject) => {
        const handler = ({ channelId, message }: HandlerArg) => {
          expect(channelId).toBe(channelId);
          expect(message).toBe('Hello from Unblocked User!');
          resolve(undefined);
        };
        clients[0].on('message', handler);
        listeners.push({ client: clients[0], handler });
      });

      // send message from user4 to user1
      clients[1].emit('message', {
        channelId: channelId,
        message: 'Hello from Unblocked User!',
      });

      await messagePromise;
    });
  });
  describe('Retrieve channels & messages', () => {
    it('should retrieve all the channels', () => {
      return pactum
        .spec()
        .get('/chat/channels')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(200)
        .expectBodyContains('myPublicChannel')
        .expectBodyContains('myPrivateChannel')
        .expectBodyContains('myProtectedChannel');
    });
    it('should retrieve the channels the current user is in', () => {
      return pactum
        .spec()
        .get('/chat/channels/user')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(200)
        .expectBodyContains('myPublicChannel')
        .expectBodyContains('myPrivateChannel')
        .expectBodyContains('myProtectedChannel');
    });
    it('should retrieve all the messages for the current user', () => {
      return pactum
        .spec()
        .get('/chat/channels/user/messages')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(200)
        .expectBodyContains('Hello from Public!')
        .expectBodyContains('Hello from Private!')
        .expectBodyContains('Hello from Protected!')
        .expectBodyContains('Hello from DM!');
    });
    it('should retrieve all the messages of current user for a channel', () => {
      return pactum
        .spec()
        .get('/chat/channels/$S{publicChannelId}/messages')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(200)
        .expectBodyContains('Hello from Public!');
    });
  });
  describe('Channel management', () => {
    it('should let a new user join the public channel and receive user-added event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const publicChannelId: string = dataStore['publicChannelId'];
      const user4Id: string = dataStore['user4Id'];
      // start listening to 'user-added' event for users 1 to 3 before sending the request
      const userAddedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId }: HandlerArg) => {
              expect(channelId).toBe(publicChannelId);
              expect(userId).toBe(user4Id);
              resolve(undefined);
            };
            client.on('user-added', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .post('/chat/channels/$S{publicChannelId}/join')
        .withHeaders({ Authorization: 'Bearer $S{userAt4}' })
        .expectStatus(201);
      await Promise.all(userAddedPromises);
    });
    it('should not let user4 join the private channel', async () => {
      return pactum
        .spec()
        .post('/chat/channels/$S{privateChannelId}/join')
        .withHeaders({ Authorization: 'Bearer $S{userAt4}' })
        .expectStatus(403);
    });
    it('should let a new user leave the public channel and others receive user-removed event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const publicChannelId = dataStore['publicChannelId'];
      const user4Id = dataStore['user4Id'];
      // start listening to 'user-removed' event for users 1 to 3 before sending the request
      const userRemovedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId }: HandlerArg) => {
              expect(channelId).toBe(publicChannelId);
              expect(userId).toBe(user4Id);
              resolve(undefined);
            };
            client.on('user-removed', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .delete('/chat/channels/$S{publicChannelId}/leave')
        .withHeaders({ Authorization: 'Bearer $S{userAt4}' })
        .expectStatus(204);
      await Promise.all(userRemovedPromises);
    });
    it('should let a new user join the private channel and receive user-added event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const privateChannelId = dataStore['privateChannelId'];
      const user4Id = dataStore['user4Id'];
      // start listening to 'user-added' event for users 1 to 3 before sending the request
      const userAddedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId }: HandlerArg) => {
              expect(channelId).toBe(privateChannelId);
              expect(userId).toBe(user4Id);
              resolve(undefined);
            };
            client.on('user-added', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .post('/chat/channels/$S{privateChannelId}/users/$S{user4Id}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(201);
      await Promise.all(userAddedPromises);
    });
    it('should let users in the private channel receive messages from the new user', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const privateChannelId: string = dataStore['privateChannelId'];
      // We'll make an array of promises for every client that needs to receive the message
      const messagePromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            // We'll make a handler for each client that will resolve the promise when the message is received
            const handler = ({ channelId, message }: HandlerArg) => {
              expect(channelId).toBe(privateChannelId);
              expect(message).toBe('Hello from User4!');
              resolve(undefined);
            };
            // once a message is received, we'll call the handler which resolves the promise
            client.on('message', handler);
            listeners.push({ client, handler });
          }),
      );
      // setImmediate will run the code after the current event loop
      // This is needed because the client.on('message') is not yet set up
      setImmediate(() =>
        clients[3].emit('message', {
          channelId: privateChannelId,
          message: 'Hello from User4!',
        }),
      );
      // the Promise.all method will wait for all the promises to resolve
      await Promise.all(messagePromises);
    });
    it('should let the channel owner kick a user from the private channel and others receive a removed-user event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const privateChannelId = dataStore['privateChannelId'];
      const user4Id = dataStore['user4Id'];
      // start listening to 'user-removed' event for users 1 to 3 before sending the request
      const userRemovedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId }: HandlerArg) => {
              expect(channelId).toBe(privateChannelId);
              expect(userId).toBe(user4Id);
              resolve(undefined);
            };
            client.on('user-removed', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .delete('/chat/channels/$S{privateChannelId}/users/$S{user4Id}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(204);
      await Promise.all(userRemovedPromises);
    });
    it('should let a new user join the protected channel and others receive user-added event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const protectedChannelId: string = dataStore['protectedChannelId'];
      const user4Id: string = dataStore['user4Id'];
      // start listening to 'user-added' event for users 1 to 3 before sending the request
      const userAddedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId }: HandlerArg) => {
              expect(channelId).toBe(protectedChannelId);
              expect(userId).toBe(user4Id);
              resolve(undefined);
            };
            client.on('user-added', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .post('/chat/channels/$S{protectedChannelId}/join')
        .withHeaders({ Authorization: 'Bearer $S{userAt4}' })
        .withBody({ password: '123' })
        .expectStatus(201);
      await Promise.all(userAddedPromises);
    });
    // TODO: add muted user event
    it('should mute a user and let others receive a muted-user event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const protectedChannelId: string = dataStore['protectedChannelId'];
      const user4Id: string = dataStore['user4Id'];

      const userMutedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId }: HandlerArg) => {
              expect(channelId).toBe(protectedChannelId);
              expect(userId).toBe(user4Id);
              resolve(undefined);
            };
            client.on('user-muted', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .post('/chat/channels/$S{protectedChannelId}/mute/$S{user4Id}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .withBody({ "muteDuration": 0.2}) // mute duration is in minutes
        .expectStatus(201);
      await Promise.all(userMutedPromises);
    });
    it('should make sure the other users do not receive messages from the muted user and muted user receives error message', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const channelId = dataStore['protectedChannelId'];
      const user4Id = dataStore['user4Id'];

      // This promise is for checking if an event with 'You are muted' was sent back to sender
      const userErrorPromise = new Promise((resolve, reject) => {
        const handler = (message: string) => {
          expect(message).toBe('You are muted in this channel.');
          resolve(undefined);
        };
        clients[3].on('muted-message', handler);
        listeners.push({ client: clients[3], handler });
      });

      // These other promises will resolve if no message is received from user4 for 1 second
      const messagePromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            // We'll make a handler for each client that will resolve the promise when the message is received
            const handler = ({ channelId: receivedChannelId, message }: HandlerArg) => {
              // If any of these clients receives a message from user4, reject the promise
              if (receivedChannelId === channelId) {
                reject(new Error(`User ${user4Id} is muted but their message was received.`));
              }
            };
            // once a message is received, we'll call the handler
            client.on('message', handler);
            listeners.push({ client, handler });

            // if no message is received after 1 second, resolve the promise
            setTimeout(resolve, 1000);
          }),
      );

      setImmediate(() =>
        clients[3].emit('message', {
          channelId: channelId,
          message: 'Hello from Muted User!',
        }),
      );

      await Promise.all([userErrorPromise, ...messagePromises]);
    });
    it('should unmute a user and let others receive a unmuted-user event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const protectedChannelId = dataStore['protectedChannelId'];
      const user4Id = dataStore['user4Id'];

      const userUnmutedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId }: HandlerArg) => {
              expect(channelId).toBe(protectedChannelId);
              expect(userId).toBe(user4Id);
              resolve(undefined);
            };
            client.on('user-unmuted', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .post('/chat/channels/$S{protectedChannelId}/unmute/$S{user4Id}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(201);
      await Promise.all(userUnmutedPromises);
    });
    it('should make a user admin and let others receive a promoted-user event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const protectedChannelId = dataStore['protectedChannelId'];
      const user4Id = dataStore['user4Id'];

      const userPromotedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId, message }: HandlerArg) => {
              expect(channelId).toBe(protectedChannelId);
              expect(userId).toBe(user4Id);
              expect(message).toBe(`User ${user4Id} has been promoted in channel ${protectedChannelId}`);
              resolve(undefined);
            };
            client.on('user-promoted', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .post('/chat/channels/$S{protectedChannelId}/admin/$S{user4Id}')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(201);
      await Promise.all(userPromotedPromises);
    });
    it('should demote a user and let others receive a demoted-user event', async () => {
      const dataStore: IDataStore = pactum.stash.getDataStore();
      const protectedChannelId = dataStore['protectedChannelId'];
      const user4Id = dataStore['user4Id'];

      const userDemotedPromises = clients.slice(0, 3).map(
        client =>
          new Promise((resolve, reject) => {
            const handler = ({ channelId, userId, message }: HandlerArg) => {
              expect(channelId).toBe(protectedChannelId);
              expect(userId).toBe(user4Id);
              expect(message).toBe(`User ${user4Id} has been demoted in channel ${protectedChannelId}`);
              resolve(undefined);
            };
            client.on('user-demoted', handler);
            listeners.push({ client, handler });
          }),
      );
      await pactum
        .spec()
        .post('/chat/channels/$S{protectedChannelId}/users/$S{user4Id}/demote')
        .withHeaders({ Authorization: 'Bearer $S{userAt1}' })
        .expectStatus(201);
      await Promise.all(userDemotedPromises);
    });
  });

  describe('Disconnect', () => {
    it('should disconnect all the users', async () => {
      // Tell all the clients to disconnect
      clients.forEach(client => client.disconnect());

      // Then wait for them all to disconnect
      const disconnectionPromises = clients.map(
        client =>
          new Promise((resolve, reject) => {
            if (!client.connected) {
              resolve(undefined);
            } else {
              client.on('disconnect', () => {
                expect(client.connected).toBeFalsy();
                resolve(undefined);
              });
              client.on('connect_error', err => {
                reject(err);
              });
            }
          }),
      );
      await Promise.all(disconnectionPromises);
    });
  });
});
