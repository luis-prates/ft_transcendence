#!/bin/sh

npx prisma generate

# generate prisma bindings
# npm run prisma:dev:deploy
# Check if migrations exist
if [ ! -d "prisma/migrations" ]; then
  # Create the initial migration
  npx prisma migrate dev --name init
else
  # Run the migrations
  npx prisma migrate deploy
fi
# deploys the latest prisma schema and build the project
# npm run db:setup:docker

# run the command passed to the docker CMD command
exec "$@"