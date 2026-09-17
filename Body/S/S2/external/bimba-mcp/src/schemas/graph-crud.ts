/**
 * Schemas for raw Cypher + CRUD + introspection tools.
 *
 * These are the low-level "escape hatch" tools: arbitrary parametrized Cypher,
 * schema-agnostic node/relationship CRUD, and live schema introspection. They
 * favour raw exploration of the real graph over curated, shape-assuming reads.
 *
 * Open-schema doctrine (see bimba-mcp/AGENTS.md):
 * - Values are ALWAYS bound as $params; only identifiers (labels, rel types,
 *   property keys) are interpolated, and only through a strict allowlist.
 * - The coordinate-prefix law is AVAILABLE (coordinate-default locators,
 *   teaching examples) but never ENFORCED — any property key is permitted.
 */

import { z } from 'zod';

// =============================================================================
// Shared node locator
// =============================================================================

/**
 * Locate a node by coordinate, by uuid (c_2_uuid OR legacy uuid), or by an
 * arbitrary {key, value} pair. Used (nested) by every CRUD tool.
 */
export const NodeLocatorSchema = z
  .object({
    coordinate: z
      .string()
      .min(1)
      .optional()
      .describe('Locate by Bimba coordinate, matched against the unprefixed `coordinate` property (e.g. "M1-0").'),
    uuid: z
      .string()
      .min(1)
      .optional()
      .describe('Locate by UUID, matched against c_2_uuid OR legacy uuid.'),
    match_key: z
      .string()
      .min(1)
      .optional()
      .describe('Arbitrary property key to match on, e.g. "c_1_name". Use with match_value.'),
    match_value: z.unknown().optional().describe('Value for match_key.'),
    label: z
      .string()
      .optional()
      .describe('Optional label constraint to narrow the match, e.g. "Bimba".'),
  })
  .refine(
    (v) => Boolean(v.coordinate) || Boolean(v.uuid) || (v.match_key !== undefined && v.match_value !== undefined),
    'Provide one of: coordinate, uuid, or (match_key + match_value).'
  );

export type NodeLocator = z.infer<typeof NodeLocatorSchema>;

// =============================================================================
// graph_cypher
// =============================================================================

export const GraphCypherInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(20000)
    .describe(
      'A single Cypher statement. Use $param placeholders for ALL values — never interpolate values into the string. Example: MATCH (n:Bimba) WHERE n.coordinate STARTS WITH $p RETURN n LIMIT 25'
    ),
  params: z
    .record(z.unknown())
    .optional()
    .default({})
    .describe('Parameter map bound to $placeholders in the query.'),
  write: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'false (default) routes to a READ session and REJECTS mutating clauses. Set true to allow CREATE/MERGE/SET/DELETE/REMOVE on a WRITE session.'
    ),
  row_limit: z
    .number()
    .int()
    .min(1)
    .max(5000)
    .optional()
    .default(500)
    .describe('Max rows returned to the caller (1-5000, default 500). Applied after execution; does not modify your query.'),
  timeout_ms: z
    .number()
    .int()
    .min(100)
    .max(120000)
    .optional()
    .default(30000)
    .describe('Query timeout in ms (100-120000, default 30000).'),
});

export type GraphCypherInput = z.infer<typeof GraphCypherInputSchema>;

export interface GraphCypherOutput {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  row_count: number;
  truncated: boolean;
  write: boolean;
  counters?: Record<string, number>;
  execution_time_ms: number;
}

// =============================================================================
// CRUD primitives
// =============================================================================

export const GraphUpsertNodeInputSchema = z.object({
  merge_on: z
    .enum(['coordinate', 'uuid', 'match_key'])
    .optional()
    .default('coordinate')
    .describe('Which key to MERGE on (the idempotent upsert anchor).'),
  coordinate: z.string().min(1).optional().describe('Anchor/seed coordinate, e.g. "M2-5".'),
  uuid: z.string().min(1).optional().describe('Anchor uuid (written to c_2_uuid when merge_on=uuid).'),
  match_key: z.string().min(1).optional().describe('Anchor property key when merge_on=match_key.'),
  match_value: z.unknown().optional().describe('Anchor value for match_key.'),
  labels: z
    .array(z.string())
    .optional()
    .default(['Bimba'])
    .describe('Labels to ensure on the node (applied on create AND match). Default ["Bimba"].'),
  properties: z
    .record(z.unknown())
    .optional()
    .default({})
    .describe(
      'Properties to SET. ANY key allowed, prefixed or not, e.g. {"c_1_name":"X","coordinate":"M2-5","custom_flag":true}.'
    ),
  on_create_properties: z
    .record(z.unknown())
    .optional()
    .describe('Properties applied only when the node is first created (ON CREATE SET).'),
});

export type GraphUpsertNodeInput = z.infer<typeof GraphUpsertNodeInputSchema>;

export const GraphSetPropertyInputSchema = z.object({
  locator: NodeLocatorSchema,
  set: z.record(z.unknown()).optional().describe('Property keys to set to given values. Any key, prefixed or not.'),
  remove: z.array(z.string()).optional().describe('Property keys to remove.'),
});

export type GraphSetPropertyInput = z.infer<typeof GraphSetPropertyInputSchema>;

export const GraphLabelInputSchema = z.object({
  locator: NodeLocatorSchema,
  labels: z.array(z.string()).min(1).describe('Labels to add or remove.'),
});

export type GraphLabelInput = z.infer<typeof GraphLabelInputSchema>;

export const GraphCreateRelationshipInputSchema = z.object({
  from: NodeLocatorSchema,
  to: NodeLocatorSchema,
  rel_type: z
    .string()
    .min(1)
    .describe('Relationship type, e.g. MANIFESTS, INVERTS_TO, GENERATES, MAPS_TO_COORDINATE.'),
  properties: z.record(z.unknown()).optional().default({}).describe('Relationship properties.'),
  merge: z
    .boolean()
    .optional()
    .default(true)
    .describe('true (default) = MERGE (idempotent). false = CREATE (always a new edge).'),
});

export type GraphCreateRelationshipInput = z.infer<typeof GraphCreateRelationshipInputSchema>;

export const GraphDeleteRelationshipInputSchema = z.object({
  from: NodeLocatorSchema,
  to: NodeLocatorSchema,
  rel_type: z
    .string()
    .min(1)
    .optional()
    .describe('If omitted, deletes relationships of ANY type between the two nodes.'),
  direction: z.enum(['out', 'in', 'both']).optional().default('out').describe('Edge direction to match.'),
});

export type GraphDeleteRelationshipInput = z.infer<typeof GraphDeleteRelationshipInputSchema>;

export const GraphDeleteNodeInputSchema = z.object({
  locator: NodeLocatorSchema,
  detach: z
    .boolean()
    .optional()
    .default(false)
    .describe('false (default) = DELETE, fails if relationships exist. true = DETACH DELETE (removes node AND its edges).'),
  confirm: z.literal(true).describe('Must be explicitly true — acknowledges that this destroys data.'),
});

export type GraphDeleteNodeInput = z.infer<typeof GraphDeleteNodeInputSchema>;

// =============================================================================
// graph_schema (introspection)
// =============================================================================

export const GraphSchemaInputSchema = z.object({
  include_prefixes: z
    .boolean()
    .optional()
    .default(true)
    .describe('Group property keys by their {family}_{n}_ prefix (c_, l_, t_, m_, p_, s_, plus unprefixed like "coordinate").'),
  include_counts: z
    .boolean()
    .optional()
    .default(true)
    .describe('Include node-count-per-label and relationship-count-per-type.'),
  sample_size: z
    .number()
    .int()
    .min(0)
    .max(5000)
    .optional()
    .default(1000)
    .describe('When include_prefixes, how many nodes to sample for key discovery (0 = use db.propertyKeys() only).'),
});

export type GraphSchemaInput = z.infer<typeof GraphSchemaInputSchema>;

export interface GraphSchemaOutput {
  node_labels: string[];
  relationship_types: string[];
  property_keys: string[];
  property_key_prefixes?: Array<{ prefix: string; count: number }>;
  node_counts_by_label?: Array<{ label: string; count: number }>;
  relationship_counts_by_type?: Array<{ type: string; count: number }>;
  total_nodes?: number;
  total_relationships?: number;
  notes?: string[];
  execution_time_ms: number;
}

export interface CrudResult {
  matched: number;
  counters?: Record<string, number>;
  nodes?: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
  deleted?: number;
  execution_time_ms: number;
}
