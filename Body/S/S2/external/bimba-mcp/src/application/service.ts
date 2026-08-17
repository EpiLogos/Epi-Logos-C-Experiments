import {
  BimbaAuthorizationError,
  BimbaRequestError,
  type BimbaAuthority,
  type BimbaBackend,
  type BimbaEmbeddingMutation,
  type BimbaPermission,
  type BimbaProvenance,
  type BimbaQueryOptions,
  type BimbaRef,
  type BimbaResult,
  type BimbaSearchOptions,
} from './contracts.js';

const DEFAULT_READ_LIMIT = 100;
const MAX_READ_LIMIT = 1000;
const MAX_SEARCH_RESULTS = 100;

function requirePermission(authority: BimbaAuthority, permission: BimbaPermission): void {
  if (!authority.permissions.has(permission)) {
    throw new BimbaAuthorizationError(permission);
  }
}

function provenance(authority: BimbaAuthority, operation: string): BimbaProvenance {
  return {
    source: 'bimba',
    operation,
    runtimePrincipal: authority.runtimePrincipal,
    ...(authority.agentIdentity ? { agentIdentity: authority.agentIdentity } : {}),
    observedAt: new Date().toISOString(),
    promotion: 'none',
  };
}

function requireCoordinate(ref: BimbaRef): string {
  if (ref.kind !== 'coordinate' || !ref.value.trim()) {
    throw new BimbaRequestError('This operation requires a non-empty Bimba coordinate ref');
  }
  return ref.value;
}

function requireUuid(ref: BimbaRef): string {
  if (ref.kind !== 'uuid' || !ref.value.trim()) {
    throw new BimbaRequestError('This mutation requires a non-empty Bimba UUID ref');
  }
  return ref.value;
}

/**
 * Canonical application seam for Bimba reads and mutations.
 *
 * It has no MCP/JSON-RPC/session/HTTP concepts. Adapters resolve transport-level
 * identity into BimbaAuthority, then invoke this service. Agent identity is
 * provenance only and never expands permissions.
 */
export class BimbaApplicationService {
  constructor(private readonly backend: BimbaBackend) {}

  async get(
    ref: BimbaRef,
    options: BimbaQueryOptions,
    authority: BimbaAuthority
  ): Promise<BimbaResult<unknown>> {
    requirePermission(authority, 'bimba:read');
    const coordinate = requireCoordinate(ref);
    const limit = options.limit ?? DEFAULT_READ_LIMIT;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_READ_LIMIT) {
      throw new BimbaRequestError(`limit must be an integer between 1 and ${MAX_READ_LIMIT}`);
    }

    const data = await this.backend.queryByCoordinate(
      coordinate,
      options.includeNested ?? true,
      limit
    );
    return { data, provenance: provenance(authority, 'bimba.get') };
  }

  async search(
    query: string,
    options: BimbaSearchOptions,
    authority: BimbaAuthority
  ): Promise<BimbaResult<unknown>> {
    requirePermission(authority, 'bimba:read');
    if (!query.trim()) {
      throw new BimbaRequestError('query must not be empty');
    }
    const topK = options.topK ?? 10;
    if (!Number.isInteger(topK) || topK < 1 || topK > MAX_SEARCH_RESULTS) {
      throw new BimbaRequestError(`topK must be an integer between 1 and ${MAX_SEARCH_RESULTS}`);
    }

    const data = await this.backend.search(
      query,
      topK,
      undefined,
      options.mode ?? 'hybrid_rrf',
      options.searchChunks ?? true,
      options.expandToParent ?? false
    );
    return { data, provenance: provenance(authority, 'bimba.search') };
  }

  async storeEmbedding(
    mutation: BimbaEmbeddingMutation,
    authority: BimbaAuthority
  ): Promise<BimbaResult<unknown>> {
    requirePermission(authority, 'bimba:write');
    const uuid = requireUuid(mutation.ref);
    if (!mutation.text.trim()) {
      throw new BimbaRequestError('embedding text must not be empty');
    }
    const dimensions = mutation.dimensions ?? 768;
    const taskType = mutation.taskType ?? 'SEMANTIC_SIMILARITY';

    const data = await this.backend.embed(mutation.text, taskType, dimensions, uuid);
    return { data, provenance: provenance(authority, 'bimba.store_embedding') };
  }
}

export function authorityFromEnvironment(prefix = 'BIMBA_MCP'): BimbaAuthority {
  const runtimePrincipal = process.env[`${prefix}_PRINCIPAL`]?.trim() || 'local-stdio';
  const agentIdentity = process.env[`${prefix}_AGENT_IDENTITY`]?.trim() || undefined;
  const configured = process.env[`${prefix}_PERMISSIONS`]
    ?.split(',')
    .map(value => value.trim())
    .filter(Boolean) ?? ['bimba:read'];

  const allowed = new Set<BimbaPermission>();
  for (const value of configured) {
    if (value === 'bimba:read' || value === 'bimba:write' || value === 'bimba:admin') {
      allowed.add(value);
    }
  }

  return {
    runtimePrincipal,
    permissions: allowed,
    ...(agentIdentity ? { agentIdentity } : {}),
  };
}
