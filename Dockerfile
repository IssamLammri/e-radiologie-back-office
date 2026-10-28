FROM oven/bun:1 AS bun
FROM node:22-bookworm-slim

# Bun preserves the existing lockfile; Vue's type checker runs with Node.
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
