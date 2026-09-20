#!/usr/bin/env node

import { getNeo4jConnectionManager } from './db/neo4j.js';

async function main(): Promise<void> {
  const manager = getNeo4jConnectionManager();
  try {
    await manager.connect();
    const health = await manager.healthCheck();
    console.log(JSON.stringify({ healthy: health.isHealthy, latencyMs: health.latencyMs }));
    await manager.shutdown();
    if (!health.isHealthy) process.exitCode = 1;
  } catch {
    console.log(JSON.stringify({ healthy: false }));
    process.exitCode = 1;
    await manager.shutdown();
  }
}

void main();
