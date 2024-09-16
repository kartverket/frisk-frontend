FROM oven/bun:1 AS build
WORKDIR /react-app
COPY package*.json ./
RUN bun install
COPY . .
ENV VITE_BACKEND_URL="https://frisk-backend.fly.dev"
RUN bun run build

FROM nginx:1.19
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /react-app/dist /usr/share/nginx/html