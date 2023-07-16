# ---- Base Node ----
FROM node:alpine AS base

WORKDIR /app

COPY package.json ./

RUN npm install

# ---- Copy Files/Build ----
FROM base AS build

WORKDIR /app

COPY . .

RUN npx prisma generate

RUN npm run build

# --- Release ----
FROM node:alpine AS release

WORKDIR /app

# Copy script and make it executable
COPY docker-entrypoint.sh .

RUN chmod +x ./docker-entrypoint.sh

# Set the entry point to our script
ENTRYPOINT [ "./docker-entrypoint.sh" ]

COPY --from=build /app/dist ./dist

COPY --from=base /app/node_modules ./node_modules

COPY --from=build /app/prisma ./prisma

COPY package*.json ./

CMD [ "npm", "run", "start:prod" ]