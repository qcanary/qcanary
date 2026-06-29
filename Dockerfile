# ── QCanary API — Dockerfile ──────────────────────────────────────
# Multi-stage build for minimal production image.

# ── Stage 1: Install dependencies ─────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copy root manifests
COPY package.json package-lock.json ./

# Copy workspace manifests so npm ci resolves correctly
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/agent/package.json packages/agent/package.json

RUN npm ci --only=production && \
    cp -R node_modules /app/prod_node_modules && \
    npm ci

# ── Stage 2: Build ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace @qcanary/api

# ── Stage 3: Production runner ────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 qcanary

# Copy built output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy production dependencies only (smaller image)
COPY --from=deps /app/prod_node_modules ./node_modules

# Copy minimal workspace structure so `npm run start --workspace` resolves
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

USER qcanary

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "run", "start", "--workspace", "@qcanary/api"]
