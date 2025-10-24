# ============================================
# STAGE 1: Builder (includes devDependencies)
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies like typescript, tsx)
# This is needed for building the TypeScript code
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client (needs to be done before build)
RUN npx prisma generate

# Build TypeScript to JavaScript
# This uses 'tsc' which is in devDependencies
RUN npm run build:prod

# At this point, /app/dist contains compiled JavaScript files
# We no longer need TypeScript or other devDependencies

# ============================================
# STAGE 2: Production (only runtime dependencies)
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies (no typescript, tsx, etc.)
# This keeps the final image smaller and more secure
RUN npm ci --omit=dev

# Copy the compiled JavaScript from builder stage
# This is the OUTPUT of TypeScript compilation, not the source .ts files
COPY --from=builder /app/dist ./dist

# Copy public/assets (static files like images, icons, etc.)
# These are needed at runtime for serving static content
COPY --from=builder /app/public/assets ./public/assets

# Copy docs directory (ADDED - needed for document indexing)
COPY --from=builder /app/docs ./docs

# Generate Prisma Client in production image
# Prisma CLI is available because @prisma/client is a production dependency
RUN npx prisma generate

# Create necessary directories (will be mounted as volumes)
RUN mkdir -p /app/public/uploads /app/logs

# Set proper permissions for directories that need write access
# This is important because we'll switch to non-root user
RUN chown -R node:node /app/public/uploads /app/logs /app/docs

# Switch to non-root user for security
USER node

EXPOSE 3000

# Run the compiled JavaScript (not TypeScript)
# Node can run .js files directly, no TypeScript compiler needed
CMD ["node", "dist/index.js"]