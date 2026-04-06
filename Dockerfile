# ============================================================
# DanClaw Agent Runtime - OpenClaw Dockerfile
# Multi-stage build for optimized production image
# ============================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps

RUN apk add --no-cache \
    curl \
    dumb-init \
    git \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Enable corepack for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/agent/package.json ./packages/agent/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Builder
FROM node:20-alpine AS builder

RUN apk add --no-cache \
    curl \
    dumb-init \
    git \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Copy dependency outputs from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/agent/node_modules ./packages/agent/node_modules

# Copy source code
COPY . .

# Build the agent runtime
RUN pnpm --filter @danclaw/agent build

# Stage 3: Runtime
FROM node:20-alpine AS runner

# Security: Install only necessary packages
RUN apk add --no-cache \
    dumb-init \
    ca-certificates \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S openclaw && \
    adduser -S openclaw -u 1001 -G openclaw

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOST=0.0.0.0

# Create required directories with proper ownership
RUN mkdir -p /app/dist /app/shared && chown -R openclaw:openclaw /app

# Copy built artifacts from builder
COPY --from=builder --chown=openclaw:openclaw /app/packages/agent/dist ./dist
COPY --from=builder --chown=openclaw:openclaw /app/packages/shared/dist ./shared
COPY --from=builder /app/packages/agent/package.json ./package.json

# Copy node_modules from deps stage (production only)
COPY --from=deps --chown=openclaw:openclaw /app/node_modules ./node_modules
COPY --from=deps --chown=openclaw:openclaw /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps --chown=openclaw:openclaw /app/packages/agent/node_modules ./packages/agent/node_modules

# Copy entrypoint script
COPY --from=builder --chown=openclaw:openclaw /app/packages/agent/src/start.sh ./start.sh
RUN chmod +x start.sh

# Expose port
EXPOSE 8080

# Health check using curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Switch to non-root user
USER openclaw

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command - can be overridden
CMD ["node", "dist/server.js"]