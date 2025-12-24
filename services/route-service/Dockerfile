# ---------- BASE ----------
    FROM node:22-slim AS base
    ENV PNPM_HOME="/pnpm"
    ENV PATH="$PNPM_HOME:$PATH"
    RUN corepack enable
    
    # ---------- BUILD ----------
    FROM base AS build
    WORKDIR /repo
    
    COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
    COPY services ./services
    COPY packages ./packages
    
    RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
        pnpm install --frozen-lockfile
    
    RUN pnpm --filter route-service build
    RUN pnpm deploy --filter route-service --prod /prod/route-service
    
    # ---------- RUNTIME ----------
    FROM node:22-slim
    WORKDIR /app
    
    COPY --from=build /prod/route-service ./
    
    ENV NODE_ENV=production
    EXPOSE 3003
    CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
    