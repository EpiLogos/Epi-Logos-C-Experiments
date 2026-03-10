# Claude Code MCP Configuration

## Overview

The bimba-mcp server is configured as an MCP (Model Context Protocol) server for Claude Code development. This document describes the configuration options and deployment modes.

## Configuration Location

**File**: `~/.claude/mcp.json`

**Project Config** (alternative): `.claude/settings.json` with `mcp_servers` section

## Local Development (Stdio Transport)

### Configuration

```json
{
  "mcpServers": {
    "bimba-mcp": {
      "command": "node",
      "args": ["/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/bimba-mcp/dist/index.js"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "password",
        "GEMINI_API_KEY": "${GEMINI_API_KEY}",
        "NODE_ENV": "development"
      }
    }
  }
}
```

### Prerequisites

1. **Node.js**: v20+ (bimba-mcp uses ES modules)
2. **Build**: Run `npm run build` to generate dist/ directory
3. **Neo4j**: Running on `bolt://localhost:7687` (default Docker Compose setup)
4. **GEMINI_API_KEY**: Set in environment for embedding operations

### Starting Claude Code

Claude Code will automatically load the MCP server from `~/.claude/mcp.json`:

```bash
claude
```

The bimba-mcp server will start via stdio transport and communicate with Claude's message protocol.

## Container Mode (HTTP Transport)

### Use Case

For deployment in containerized environments (Docker, Kubernetes) where multiple services communicate over HTTP.

### Configuration

When running in Docker Compose with the Neo4j and FastAPI services:

```json
{
  "mcpServers": {
    "bimba-mcp": {
      "command": "curl",
      "args": ["http://bimba-mcp:3000/{endpoint}"],
      "env": {
        "MCP_TRANSPORT": "http"
      }
    }
  }
}
```

### Prerequisites

1. **Docker Compose**: Service named `bimba-mcp` running on port 3000
2. **Network**: Services on same Docker network (`epi-network`)
3. **Health Check**: Compose file includes health check for service readiness

### Service Definition

See `Idea/Pratibimba/System/app/docker-compose.yml`:

```yaml
bimba-mcp:
  build:
    context: ../bimba-mcp
    dockerfile: Dockerfile
  container_name: epi-bimba-mcp
  ports:
    - "3000:3000"
  environment:
    - NEO4J_URI=bolt://neo4j:7687
    - NEO4J_USER=neo4j
    - NEO4J_PASSWORD=password
    - GEMINI_API_KEY=${GEMINI_API_KEY}
  depends_on:
    neo4j:
      condition: service_healthy
  networks:
    - epi-network
```

### Starting Services

```bash
cd Idea/Pratibimba/System/app
docker-compose up
```

## Testing MCP Server

### Basic Startup Test

```bash
# Test stdio transport
timeout 5 node /path/to/bimba-mcp/dist/index.js || true

# Should start without errors, timeout after 5s (waiting for messages)
```

### Verify JSON Syntax

```bash
# Validate mcp.json
cat ~/.claude/mcp.json | python3 -m json.tool
```

## Environment Variables

### Required (for both transports)

- `NEO4J_URI`: Neo4j connection URI (default: `bolt://localhost:7687`)
- `NEO4J_USER`: Neo4j username (default: `neo4j`)
- `NEO4J_PASSWORD`: Neo4j password (default: `password`)

### Optional

- `GEMINI_API_KEY`: Google Gemini API key for embedding operations
- `NODE_ENV`: Runtime environment (default: `development`, set to `production` for deployments)

## Available MCP Tools

Once configured, the following tools are available in Claude Code:

- `graph-query`: Query entities by coordinate or pattern
- `graph-search`: Hybrid semantic and graph-based search
- `graph-traverse`: Navigate relationships with depth control
- `graph-context`: Gather contextual knowledge at variable scopes
- `graph-disclosure`: Progressive disclosure of entity information
- `graph-embed`: Generate embeddings using Gemini API
- `graph-validate`: Validate graph alignment and integrity
- `spec-retrieve`: Look up specifications by title, UUID, or coordinate
- `graph-sync`: Synchronize Obsidian vault files with Neo4j graph

## Troubleshooting

### Build Errors

```bash
# Rebuild the project
cd Idea/Pratibimba/System/bimba-mcp
npm run build
npm run typecheck
```

### Circular Import Errors

The project resolves circular imports by defining `CoordinateSchema` locally in `src/schemas/graph.ts` rather than importing from the main schemas module.

### Connection Errors

Check Neo4j is running and accessible:

```bash
# Test Neo4j connection
curl -u neo4j:password http://localhost:7474
```

### MCP Server Not Loading

1. Verify file path in mcp.json is correct
2. Check file permissions: `ls -la ~/.claude/mcp.json`
3. Validate JSON syntax: `python3 -m json.tool ~/.claude/mcp.json`
4. Check Node.js version: `node --version` (requires v20+)

## See Also

- `.claude/plugins/epi-moirai/` - Moirai agents for Claude Code
- `Idea/Pratibimba/System/bimba-mcp/` - Source code
- `lib/coordinate-semantics.md` - Coordinate system reference
