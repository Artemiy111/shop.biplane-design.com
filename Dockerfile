FROM oven/bun:alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun i --freze-lockfile 

COPY . .

RUN bun run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output

CMD [ "node", ".output/server/index.mjs" ]


# FROM oven/bun:alpine
# WORKDIR /app

# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.output ./.output

# CMD [ "bun", ".output/server/index.mjs" ]