<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Chat API
This document describes the API endpoints for the chatting application.

### Endpoints

#### `GET /chat/channels`

Retrieve a list of all channels.

#### `GET /chat/channels/user`

Retrieve a list of all channels that the authenticated user is in.

#### `GET /chat/channels/user/messages`

Retrieve all messages for channels that the authenticated user is in.

#### `GET /chat/channels/:channelId/messages`

Retrieve all messages for a specific channel. The user must be an admin, owner, or member of the channel to access this endpoint.

#### `POST /chat/channels`

Create a new chat channel. The user will be set as the owner of the channel.

The request body should include:

```json
{
    "name": "Channel Name",
    "usersToAdd": [user_ids],
    "channelType": "PUBLIC" or "PRIVATE" or "PROTECTED" or "DM",
    "password": "Optional Password for Protected Channel"
}
```

#### DELETE /chat/channels/:id

Delete a channel by its ID. The user must be the owner of the channel to access this endpoint.
#### POST /chat/channels/:channelId/users/:userId
Add a user to a channel by their user ID. The authenticated user must be an admin or owner of the channel to access this endpoint.

#### DELETE /chat/channels/:channelId/users/:userId
Remove a user from a channel by their user ID. The authenticated user must be an admin or owner of the channel to access this endpoint.

#### POST /chat/channels/:channelId/join
Join a channel by its ID.

The request body should include:
```
{
    "password": "Optional Password for Protected Channel"
}
```

#### DELETE /chat/channels/:channelId/leave
Leave a channel by its ID. The user must be a member of the channel to access this endpoint.

#### POST /chat/channels/:channelId/mute/:userId
Mute a user in a channel by their user ID. The authenticated user must be an admin or owner of the channel to access this endpoint.

#### POST /chat/channels/:channelId/admin/:userId
Promote a user to an admin of a channel by their user ID. The authenticated user must be the owner of the channel to access this endpoint.

#### POST /chat/channels/:channelId/users/:userId/demote
Demote an admin in a channel by their user ID. The authenticated user must be an admin or owner of the channel to access this endpoint.

### Status Codes

The API uses standard HTTP status codes:
    200 OK for successful GET and PUT requests.
    201 Created for successful POST requests.
    204 No Content for successful DELETE requests.
    400 Bad Request if the request is malformed or validation fails.
    401 Unauthorized if the user is not authenticated.
    403 Forbidden if the user is authenticated but does not have permission to access the resource.
    404 Not Found if the resource could not be found.
    409 Conflict if there is a conflict with the existing state of the resource, such as trying to create a channel with a name that already exists.

## License

Nest is [MIT licensed](LICENSE).
