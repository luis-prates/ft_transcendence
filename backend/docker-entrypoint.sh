#!/bin/sh

# generate prisma bindings
npm run prisma:generate

# deploys the latest prisma schema and build the project
npm run db:dev:restart:unix

# run the command passed to the docker CMD command
exec "$@"