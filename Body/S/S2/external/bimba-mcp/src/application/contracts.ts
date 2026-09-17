export const BIMBA_PROTOCOL_REVISION = '2026-07-28' as const;
export const BIMBA_LEGACY_PROTOCOL_MAX = '2025-11-25' as const;

export type BimbaPermission = 'bimba:read' | 'bimba:write' | 'bimba:admin';

/** Stable Bimba identity. Transport ids, MCP sessions and JSON-RPC ids never belong here. */
export type BimbaRef =
  | { kind: 'coordinate'; value: string }
  | { kind: 'uuid'; value: string }
  | { kind: 'name'; value: string };

/**
 * Runtime principal is the credentialed software/human principal performing the call.
 * agentIdentity is optional descriptive lineage and MUST NOT grant authority.
 */
export interface BimbaAuthority {
  runtimePrincipal: string;
  permissions: ReadonlySet<BimbaPermission>;
  agentIdentity?: string;
}

export interface BimbaProvenance {
  source: 'bimba';
  operation: string;
  runtimePrincipal: string;
  agentIdentity?: string;
  observedAt: string;
  /** Returned Bimba material is evidence/data, never automatic AIKit Context or canon. */
  promotion: 'none';
}

export interface BimbaResult<T> {
  data: T;
  provenance: BimbaProvenance;
}

export interface BimbaQueryOptions {
  includeNested?: boolean;
  limit?: number;
}

export interface BimbaSearchOptions {
  topK?: number;
  mode?: 'vector_only' | 'graph_only' | 'hybrid_rrf' | 'hybrid_weighted';
  searchChunks?: boolean;
  expandToParent?: boolean;
}

export interface BimbaEmbeddingMutation {
  ref: BimbaRef;
  text: string;
  taskType?: string;
  dimensions?: 768 | 1536 | 3072;
}

export interface BimbaBackend {
  queryByCoordinate(coordinate: string, includeNested?: boolean, limit?: number): Promise<unknown>;
  search(
    query: string,
    topK?: number,
    coordinates?: unknown,
    mode?: 'vector_only' | 'graph_only' | 'hybrid_rrf' | 'hybrid_weighted',
    searchChunks?: boolean,
    expandToParent?: boolean
  ): Promise<unknown>;
  embed(text: string, taskType?: string, dimensions?: 768 | 1536 | 3072, storeFor?: string): Promise<unknown>;
}

export class BimbaAuthorizationError extends Error {
  readonly code = 'BIMBA_FORBIDDEN';
  constructor(readonly required: BimbaPermission) {
    super(`Bimba authority '${required}' is required`);
    this.name = 'BimbaAuthorizationError';
  }
}

export class BimbaRequestError extends Error {
  readonly code = 'BIMBA_INVALID_REQUEST';
  constructor(message: string) {
    super(message);
    this.name = 'BimbaRequestError';
  }
}
