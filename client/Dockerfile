FROM node:18-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/package.json

RUN pnpm install --frozen-lockfile

COPY client ./client

RUN pnpm --filter client build

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/client/dist/ /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
