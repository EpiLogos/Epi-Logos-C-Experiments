import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const expectedTools = [
  'get_context',
  'graph_add_label',
  'graph_admin',
  'graph_chunk',
  'graph_context',
  'graph_create_relationship',
  'graph_cypher',
  'graph_delete_node',
  'graph_delete_relationship',
  'graph_disclosure',
  'graph_embed',
  'graph_embed_batch',
  'graph_query',
  'graph_remove_label',
  'graph_rerank',
  'graph_schema',
  'graph_search',
  'graph_set_property',
  'graph_sync',
  'graph_traverse',
  'graph_traverse_positions',
  'graph_upsert_node',
  'graph_validate',
  'list_coordinates',
  'resolve_coordinate',
  'semantic_search',
  'spec_retrieve',
  'telegram_get_recent_messages',
  'telegram_reply',
  'telegram_send_message',
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
