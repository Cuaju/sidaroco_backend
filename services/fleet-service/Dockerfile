# ---------- BASE ----------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---------- BUILD ----------
FROM base AS build
WORKDIR /repo

# workspace metadata
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# workspace packages
COPY services ./services
COPY packages ./packages

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

RUN pnpm --filter fleet-service build
RUN pnpm deploy --filter fleet-service --prod /prod/fleet-service


# ---------- RUNTIME ----------
FROM node:22-slim
WORKDIR /app

COPY --from=build /prod/fleet-service ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
