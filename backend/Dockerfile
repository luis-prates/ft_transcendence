# ---- Base Node ----
FROM node:alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

# ---- Copy Files/Build ----
FROM base AS build

# WORKDIR /app

RUN npm install -g @nestjs/cli

COPY . .

RUN npx prisma generate

RUN npm run build

# --- Release ----
FROM node:alpine AS release

RUN npm install pm2 -g

WORKDIR /app

# Set the entry point to our script

COPY --from=build /app/dist ./dist

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/prisma ./prisma

COPY --from=build package*.json ./

# CMD [ "npm", "run", "start:prod" ]

# Copy script and make it executable
COPY docker-entrypoint.sh .
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT [ "./docker-entrypoint.sh" ]

CMD [ "pm2-runtime", "start", "dist/main.js" ]