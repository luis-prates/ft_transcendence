FROM node:alpine as build-stage

WORKDIR /app

COPY package.json ./

RUN npm install

# install envsubst
RUN apk add --no-cache gettext

COPY . .

RUN npm run build-only

# production stage

FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY --from=build-stage /usr/bin/envsubst /usr/local/bin/envsubst

COPY ./docker-entrypoint.sh /

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT [ "/docker-entrypoint.sh" ]

CMD ["nginx", "-g", "daemon off;"]