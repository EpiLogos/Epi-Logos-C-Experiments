import type { BimbaPermission } from './application/contracts.js';

export const LEGACY_PROTOCOL_REVISIONS = [
  '2024-10-07',
  '2025-03-26',
  '2025-06-18',
  '2025-11-25',
] as const;

export interface JsonRpcRequestLike {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

export function advertisedProtocolRevision(request: JsonRpcRequestLike): string | undefined {
  const params = asRecord(request.params);
  const meta = asRecord(params?.['_meta']);
  const revision = meta?.['io.modelcontextprotocol/protocolVersion'];
  return typeof revision === 'string' ? revision : undefined;
}

export function isModernProtocolRequest(request: JsonRpcRequestLike): boolean {
  if (request.method === 'server/discover') return true;
  return advertisedProtocolRevision(request) === '2026-07-28';
}

/**
 * Legacy tool names are preserved exactly; authorization is classified before
 * the request reaches the old MCP implementation. The tool name and arguments
 * determine authority. A discoverable tool never grants that authority.
 */
export function requiredPermissionForLegacyTool(
  toolName: string,
  args: Record<string, unknown> = {}
): BimbaPermission {
  if (toolName === 'graph_admin') return 'bimba:admin';

  if (
    toolName === 'graph_sync' ||
    toolName === 'graph_chunk' ||
    toolName === 'telegram_send_message' ||
    toolName === 'telegram_reply'
  ) {
    return 'bimba:write';
  }

  // graph_embed is a read/external-compute operation until a graph target is
  // explicitly supplied; store_for makes it a Bimba mutation.
  if (toolName === 'graph_embed' && args['store_for'] !== undefined) {
    return 'bimba:write';
  }

  return 'bimba:read';
}

export function requiredPermissionForLegacyRequest(
  request: JsonRpcRequestLike
): BimbaPermission | undefined {
  if (request.method !== 'tools/call') return undefined;
  const params = asRecord(request.params);
  const name = params?.['name'];
  if (typeof name !== 'string') return undefined;
  const args = asRecord(params?.['arguments']) ?? {};
  return requiredPermissionForLegacyTool(name, args);
}
