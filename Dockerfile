###########################
# Stage 1: deps
###########################
FROM node:18.20.8-alpine AS deps
WORKDIR /quillsocial

# Corepack (Yarn) already bundled with Node 18; pin Yarn version
RUN corepack enable && corepack prepare yarn@3.4.1 --activate

# Copy only manifest files first for better layer caching
COPY package.json yarn.lock .yarnrc.yml turbo.json ./
COPY .yarn ./.yarn
COPY apps/web/package.json apps/web/
COPY packages ./packages
## Copy environment files only for build-time (NOT copied to final image)
COPY .env.production ./.env.production
COPY .env.development ./.env.development

# (Optional) ensure prisma package manifest present for generate

ENV YARN_ENABLE_IMMUTABLE_INSTALLS=true
RUN yarn install --immutable

###########################
# Stage 2: builder
###########################
FROM node:18.20.8-alpine AS builder
WORKDIR /quillsocial
ENV NODE_ENV=production
RUN corepack enable && corepack prepare yarn@3.4.1 --activate

# Copy lockfile and installed dependencies (zero-install/cache strategy)
COPY --from=deps /quillsocial/.yarn ./.yarn
COPY --from=deps /quillsocial/.yarnrc.yml ./
COPY --from=deps /quillsocial/yarn.lock ./
COPY --from=deps /quillsocial/node_modules ./node_modules
COPY --from=deps /quillsocial/package.json ./
COPY --from=deps /quillsocial/turbo.json ./
COPY --from=deps /quillsocial/packages ./packages
COPY --from=deps /quillsocial/apps/web/package.json ./apps/web/

# Copy the rest of source (pages, components, etc.)
COPY apps/web ./apps/web
## Provide env file only for build stage (not copied to final runtime)
COPY --from=deps /quillsocial/.env.production ./.env.production

# Generate Prisma Client before build (needed for TS types like BillingType)
RUN yarn workspace @quillsocial/prisma prisma generate

# Build only the web app (will invoke next build). We rely on copied .env.production
# (NODE_ENV=production set earlier) so next.config.js can read required secrets.
# No secrets are baked into final runtime image: runner stage does NOT copy .env.* files.
RUN yarn workspace @quillsocial/web build


###########################
# Stage 3: runner
###########################
FROM node:18.20.8-alpine AS runner
WORKDIR /quillsocial
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
RUN corepack enable && corepack prepare yarn@3.4.1 --activate

# Copy production focused node_modules and built app
COPY --from=builder /quillsocial/node_modules ./node_modules
COPY --from=builder /quillsocial/package.json ./
COPY --from=builder /quillsocial/apps/web ./apps/web
COPY --from=builder /quillsocial/packages ./packages

# Expose only what Next.js needs (PORT default 3000)
ENV PORT=3000
EXPOSE 3000

USER nextjs

# Use json form CMD; start the web workspace
CMD ["yarn", "workspace", "@quillsocial/web", "start"]
