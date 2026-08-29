# Stage 1: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Install security and system dependencies
RUN apk add --no-cache curl

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Ensure uploads directory exists and has proper permissions
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]