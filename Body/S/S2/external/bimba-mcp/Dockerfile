# Bimba MCP Server - Multi-stage Dockerfile
# Builds TypeScript source and runs as lightweight Node.js container
# Supports stdio-based Model Context Protocol communication

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (production + dev for TypeScript compilation)
RUN npm ci

# Copy source code and configuration
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Verify build output
RUN test -f dist/index.js && echo "Build successful: dist/index.js exists"

# ============================================================================
# Stage 2: Runtime
# ============================================================================
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only (excludes dev dependencies)
# Remove npm cache to minimize image size
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    rm -rf ~/.npm

# Copy compiled JavaScript and other artifacts from build stage
COPY --from=builder /build/dist ./dist

# Expose port 3000 for optional HTTP transport mode
# (Currently runs on stdio, but this enables future HTTP transport)
EXPOSE 3000

# Health check: verify the compiled application exists and Node can parse it
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node --check dist/index.js && echo "Health check passed" || exit 1

# Run the MCP server via stdio transport
# The server connects to Neo4j for coordinate system and knowledge graph access
CMD ["node", "dist/index.js"]
