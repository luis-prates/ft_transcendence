#!/bin/sh

npx prisma generate

# generate prisma bindings
# npm run prisma:dev:deploy
npx prisma migrate deploy

# deploys the latest prisma schema and build the project
# npm run db:setup:docker

# run the command passed to the docker CMD command
exec "$@"