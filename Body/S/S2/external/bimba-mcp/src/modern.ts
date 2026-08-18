#!/usr/bin/env node

import { serveStdio } from '@modelcontextprotocol/server/stdio';
import type { TaskType } from './embeddings/gemini.js';
import { queryByCoordinate, search, embed } from './api/graph.js';
import { getNeo4jConnectionManager } from './db/neo4j.js';
import type { BimbaBackend } from './application/contracts.js';
import { BimbaApplicationService, authorityFromEnvironment } from './application/service.js';
import { createModernBimbaServer } from './mcp/modern-server.js';

const backend: BimbaBackend = {
  queryByCoordinate: (coordinate, includeNested, limit) =>
    queryByCoordinate(coordinate, includeNested, limit),
  search: (query, topK, _coordinates, mode, searchChunks, expandToParent) =>
    search(query, topK, undefined, mode, searchChunks, expandToParent),
  embed: (text, taskType, dimensions, storeFor) =>
    embed(
      text,
      (taskType as TaskType | undefined) ?? 'SEMANTIC_SIMILARITY',
      dimensions,
      storeFor
    ),
};

const service = new BimbaApplicationService(backend);
const manager = getNeo4jConnectionManager();

async function main(): Promise<void> {
  await manager.connect();

  // Explicitly reject the 2025 initialize-era protocol here. Existing clients
  // use dist/legacy.js; there is no ambiguous hybrid interpretation.
  await serveStdio(
    () => createModernBimbaServer(service, () => authorityFromEnvironment()),
    { legacy: 'reject' }
  );
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void manager.shutdown().finally(() => process.exit(0));
  });
}

main().catch(error => {
  // Do not echo database configuration, credentials or provider detail to the
  // MCP protocol channel. stderr is operational diagnostics only.
  console.error('Failed to start modern Bimba MCP server:', error instanceof Error ? error.name : 'Error');
  process.exit(1);
});
