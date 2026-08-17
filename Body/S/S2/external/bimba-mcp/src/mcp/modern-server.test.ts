import { afterEach, describe, expect, it, vi } from 'vitest';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createMcpHandler } from '@modelcontextprotocol/server';
import type { BimbaAuthority, BimbaBackend } from '../application/contracts.js';
import { BimbaApplicationService } from '../application/service.js';
import { createModernBimbaServer } from './modern-server.js';

const openHandlers: Array<{ close(): Promise<void> }> = [];
const openClients: Client[] = [];

afterEach(async () => {
  await Promise.all(openClients.splice(0).map(client => client.close()));
  await Promise.all(openHandlers.splice(0).map(handler => handler.close()));
});

function authority(...permissions: Array<'bimba:read' | 'bimba:write' | 'bimba:admin'>): BimbaAuthority {
  return {
    runtimePrincipal: 'modern-test',
    permissions: new Set(permissions),
    agentIdentity: 'agent/test',
  };
}

function fixture() {
  const backend: BimbaBackend = {
    queryByCoordinate: vi.fn(async coordinate => ({ coordinate, nodes: [{ uuid: 'n1' }] })),
    search: vi.fn(async query => ({ query, results: [{ uuid: 'n1' }] })),
    embed: vi.fn(async (_text, _task, _dimensions, storeFor) => ({ stored: true, storeFor })),
  };
  const service = new BimbaApplicationService(backend);
  let currentAuthority = authority('bimba:read');
  const handler = createMcpHandler(
    () => createModernBimbaServer(service, () => currentAuthority),
    { legacy: 'reject' }
  );
  openHandlers.push(handler);
  return {
    backend,
    handler,
    setAuthority(next: BimbaAuthority) { currentAuthority = next; },
  };
}

async function connect(handler: { fetch(request: Request): Promise<Response> }): Promise<Client> {
  const transport = new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client(
    { name: 'bimba-conformance', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' } }
  );
  await client.connect(transport);
  openClients.push(client);
  return client;
}

function parseToolResult(result: Awaited<ReturnType<Client['callTool']>>): Record<string, unknown> {
  const first = result.content[0];
  if (!first || first.type !== 'text') throw new Error('Expected text tool result');
  return JSON.parse(first.text) as Record<string, unknown>;
}

describe('MCP 2026-07-28 Bimba adapter', () => {
  it('negotiates modern discovery and advertises only the curated capability surface', async () => {
    const { handler } = fixture();
    const client = await connect(handler);

    expect(client.getNegotiatedProtocolVersion()).toBe('2026-07-28');
    expect(client.getDiscoverResult()).toBeDefined();
    const tools = await client.listTools();
    expect(tools.tools.map(tool => tool.name)).toEqual([
      'bimba_get',
      'bimba_search',
      'bimba_store_embedding',
    ]);
    expect((await client.listResources()).resources).toEqual([]);
    expect((await client.listPrompts()).prompts).toEqual([]);
  });

  it('performs representative read and authorised write through the same application service', async () => {
    const { backend, handler, setAuthority } = fixture();
    const client = await connect(handler);

    const read = parseToolResult(await client.callTool({
      name: 'bimba_get',
      arguments: { coordinate: 'M0', include_nested: false },
    }));
    expect(read).toMatchObject({
      data: { coordinate: 'M0' },
      provenance: { source: 'bimba', operation: 'bimba.get', promotion: 'none' },
    });

    setAuthority(authority('bimba:read', 'bimba:write'));
    const write = parseToolResult(await client.callTool({
      name: 'bimba_store_embedding',
      arguments: { uuid: 'n1', text: 'hello', dimensions: 768 },
    }));
    expect(write).toMatchObject({
      data: { stored: true, storeFor: 'n1' },
      provenance: { source: 'bimba', operation: 'bimba.store_embedding', promotion: 'none' },
    });
    expect(backend.embed).toHaveBeenCalledTimes(1);
  });

  it('denies an unauthorised write even after a prior authorised request', async () => {
    const { backend, handler, setAuthority } = fixture();
    const client = await connect(handler);

    setAuthority(authority('bimba:write'));
    await client.callTool({
      name: 'bimba_store_embedding',
      arguments: { uuid: 'n1', text: 'allowed' },
    });

    setAuthority(authority('bimba:read'));
    const denied = await client.callTool({
      name: 'bimba_store_embedding',
      arguments: { uuid: 'n1', text: 'denied' },
    });
    expect(denied.isError).toBe(true);
    expect(denied.content).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'text', text: expect.stringContaining('bimba:write') }),
    ]));
    expect(backend.embed).toHaveBeenCalledTimes(1);
  });

  it('rejects HTTP routing/version substitution before tool dispatch', async () => {
    const { handler, backend } = fixture();
    const response = await handler.fetch(new Request('http://test.local/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2025-11-25',
        'Mcp-Method': 'tools/list',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/list',
        params: {
          _meta: {
            'io.modelcontextprotocol/protocolVersion': '2026-07-28',
            'io.modelcontextprotocol/clientInfo': { name: 'confused-client', version: '1' },
            'io.modelcontextprotocol/clientCapabilities': {},
          },
        },
      }),
    }));

    expect(response.status).toBe(400);
    const body = await response.json() as { error?: { code?: number } };
    expect(body.error?.code).toBe(-32020);
    expect(backend.queryByCoordinate).not.toHaveBeenCalled();
  });

  it('does not let an undeclared client extension alter the Bimba tool catalog', async () => {
    const { handler } = fixture();
    const response = await handler.fetch(new Request('http://test.local/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2026-07-28',
        'Mcp-Method': 'tools/list',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 8,
        method: 'tools/list',
        params: {
          _meta: {
            'io.modelcontextprotocol/protocolVersion': '2026-07-28',
            'io.modelcontextprotocol/clientInfo': { name: 'extension-client', version: '1' },
            'io.modelcontextprotocol/clientCapabilities': {
              extensions: { 'io.modelcontextprotocol/oauth-client-credentials': {} },
            },
          },
        },
      }),
    }));

    expect(response.status).toBe(200);
    const body = await response.json() as { result?: { tools?: Array<{ name: string }> } };
    expect(body.result?.tools?.map(tool => tool.name)).toEqual([
      'bimba_get',
      'bimba_search',
      'bimba_store_embedding',
    ]);
  });

  it('rejects malformed protocol input without invoking Bimba', async () => {
    const { handler, backend } = fixture();
    const response = await handler.fetch(new Request('http://test.local/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2026-07-28',
      },
      body: '{not-json',
    }));

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(backend.queryByCoordinate).not.toHaveBeenCalled();
  });
});
