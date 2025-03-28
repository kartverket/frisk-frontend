FROM oven/bun:1.2 AS build
WORKDIR /react-app
COPY package*.json ./
COPY bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM nginx:stable-alpine
RUN apk add --no-cache nginx-mod-http-js

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/main.js /etc/nginx/main.js
COPY --from=build /react-app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
