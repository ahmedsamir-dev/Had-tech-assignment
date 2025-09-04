# Base image
FROM node:22-alpine AS base
RUN apk add --no-cache bash curl libc6-compat openssl postgresql-client
WORKDIR /api
# Install pnpm globally
RUN npm i -g --ignore-scripts pnpm

# Install all dependencies (both prod and dev)
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
	pnpm fetch \
	--frozen-lockfile \
	--ignore-scripts
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
	pnpm install \
	--frozen-lockfile \
	--ignore-scripts

# Build stage
FROM base AS build
COPY --from=deps /api/node_modules ./node_modules
COPY --from=deps /api/package.json ./package.json
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src
RUN pnpm build

# Final stage - includes everything for all environments
FROM base AS final
# Copy everything from build stage (includes dependencies, source, built code, and config)
COPY --from=build /api ./

# Copy scripts and set permissions (before changing user)
COPY scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh

# Set ownership and switch to non-root user
RUN chown -R node:node /api
USER node

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
	CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Dynamically set CMD based on NODE_ENV
CMD ["bash", "-c", "\
    if [ \"$NODE_ENV\" = \"development\" ] || [ \"$NODE_ENV\" = \"local\" ]; then \
        pnpm run dev:docker; \
    else \
        pnpm run start; \
    fi \
"]
