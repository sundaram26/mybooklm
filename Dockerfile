FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile

RUN cd apps/backend && pnpm prisma generate

RUN pnpm --filter backend build

FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable

COPY --from=builder /app .

RUN pnpm install --prod --filter backend

WORKDIR /app/apps/backend

EXPOSE 8080

CMD ["node","dist/src/app.js"]
