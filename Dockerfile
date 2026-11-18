# ==========================================
# Task Management Backend Service Dockerfile
# ==========================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY src/ ./src/

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose service port for Port Mapping (-p 3000:3000)
EXPOSE 3000

# Run with non-root security user
USER node

# Healthcheck definition for container monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application server
CMD ["node", "src/index.js"]
