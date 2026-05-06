#!/usr/bin/env node

import { startMCPServer } from '/Users/admin/.npm-global/lib/node_modules/gitnexus/dist/mcp/server.js';
import { LocalBackend } from '/Users/admin/.npm-global/lib/node_modules/gitnexus/dist/mcp/local/local-backend.js';
import { pathToFileURL } from 'url';

export class RefreshingLocalBackend extends LocalBackend {
  async resolveRepo(repoParam) {
    await this.refreshRepos();
    return super.resolveRepo(repoParam);
  }
}

export async function main() {
  process.on('uncaughtException', (err) => {
    console.error(`GitNexus MCP wrapper: uncaught exception — ${err.message}`);
    setTimeout(() => process.exit(1), 100);
  });

  process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason);
    console.error(`GitNexus MCP wrapper: unhandled rejection — ${msg}`);
  });

  const backend = new RefreshingLocalBackend();
  await backend.init();
  const repos = await backend.listRepos();

  if (repos.length === 0) {
    console.error(
      'GitNexus wrapper: No indexed repos yet. Run `gitnexus analyze` in a git repo — the server will pick it up automatically.',
    );
  } else {
    console.error(
      `GitNexus wrapper: MCP server starting with ${repos.length} repo(s): ${repos.map((repo) => repo.name).join(', ')}`,
    );
  }

  await startMCPServer(backend);
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;

if (entrypoint && import.meta.url === entrypoint) {
  await main();
}
