import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const expectedTools = [
  'resolve_coordinate',
  'semantic_search',
  'get_context',
  'list_coordinates',
  'graph_query',
  'graph_traverse',
  'graph_traverse_positions',
  'graph_context',
  'spec_retrieve',
  'graph_search',
  'graph_embed',
  'graph_validate',
  'graph_sync',
  'graph_chunk',
  'graph_rerank',
  'telegram_send_message',
  'telegram_get_recent_messages',
  'telegram_reply',
  'graph_admin',
].sort();

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['dist/legacy.js'],
  env: {
    ...process.env,
    BIMBA_MCP_PRINCIPAL: 'legacy-fixture',
    BIMBA_MCP_PERMISSIONS: 'bimba:read,bimba:write,bimba:admin',
  },
});

const client = new Client({ name: 'legacy-bimba-fixture', version: '1.0.0' });

try {
  await client.connect(transport);
  const result = await client.listTools();
  assert.deepEqual(result.tools.map(tool => tool.name).sort(), expectedTools);
  console.error(`legacy fixture: ${result.tools.length} tools preserved`);
} finally {
  await client.close();
}
