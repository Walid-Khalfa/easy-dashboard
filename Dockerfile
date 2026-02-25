# Multi-stage build for production-ready Node.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install root dependencies
RUN npm ci

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Build frontend
WORKDIR /app
RUN npm run build --if-present

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY .variables.env ./
COPY server.ts ./

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/server.js"]
