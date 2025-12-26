# ---------- BASE ----------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl

# ---------- BUILD ----------
FROM base AS build
WORKDIR /repo


COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services ./services
COPY packages ./packages

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

RUN pnpm --filter authenticationService exec prisma generate
RUN pnpm --filter authenticationService build
RUN pnpm deploy --filter authenticationService --prod /prod/authenticationService

COPY services/authenticationService/.env /prod/authenticationService/.env
WORKDIR /prod/authenticationService
RUN pnpm exec prisma generate

# ---------- RUNTIME ----------
FROM base AS runtime
WORKDIR /app

COPY --from=build /prod/authenticationService ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]