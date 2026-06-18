/**
 * Raw Cypher + CRUD + introspection implementations.
 *
 * Low-level escape-hatch tools for the bimba-mcp server. See AGENTS.md for the
 * Open-Schema Doctrine these follow.
 */

import neo4j from 'neo4j-driver';
import type { ManagedTransaction, QueryResult } from 'neo4j-driver';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { getNeo4jConnectionManager } from '../db/neo4j.js';
import type {
  NodeLocator,
  GraphCypherInput,
  GraphCypherOutput,
  GraphUpsertNodeInput,
  GraphSetPropertyInput,
  GraphLabelInput,
  GraphCreateRelationshipInput,
  GraphDeleteRelationshipInput,
  GraphDeleteNodeInput,
  GraphSchemaInput,
  GraphSchemaOutput,
  CrudResult,
} from '../schemas/graph-crud.js';

// =============================================================================
// Pure helpers (unit-tested in graph-crud.test.ts)
// =============================================================================

const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Validate a Cypher identifier (label, relationship type, or property key).
 *
 * Cypher cannot parametrize identifiers — only values — so identifiers must be
 * interpolated. This is the injection guard: anything not matching the strict
 * allowlist (which permits every legal Neo4j identifier, prefixed or not) is
 * rejected before it can reach a query string.
 */
export function sanitizeIdentifier(id: string): string {
  if (typeof id !== 'string' || !IDENTIFIER_RE.test(id)) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Illegal identifier "${id}". Labels, relationship types, and property keys must match /^[A-Za-z_][A-Za-z0-9_]*$/.`
    );
  }
  return id;
}

const MUTATION_KEYWORDS =
  /\b(CREATE|MERGE|DELETE|SET|REMOVE|FOREACH|DROP)\b|\bLOAD\s+CSV\b|\bCALL\s+(apoc\.(create|merge|refactor|atomic|trigger)|db\.create)/i;

/**
 * Strip string literals (single/double/backtick) and comments to a single
 * space so the mutation screen never trips on a keyword that lives inside a
 * literal (e.g. RETURN 'CREATE') or a comment.
 */
function stripLiteralsAndComments(query: string): string {
  let out = '';
  let i = 0;
  const n = query.length;
  while (i < n) {
    const c = query[i];
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      i++;
      while (i < n && query[i] !== quote) {
        if (query[i] === '\\') i++;
        i++;
      }
      i++; // consume closing quote
      out += ' ';
      continue;
    }
    if (c === '/' && query[i + 1] === '/') {
      while (i < n && query[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && query[i + 1] === '*') {
      i += 2;
      while (i < n && !(query[i] === '*' && query[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * Reject a query that mutates the graph (when write=false) or contains more
 * than one statement. Defense-in-depth: the READ session is the hard backstop;
 * this gives a clean, early error before the driver/server rejects it.
 */
export function screenReadOnly(query: string): void {
  const stripped = stripLiteralsAndComments(query);
  if (MUTATION_KEYWORDS.test(stripped)) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'Query appears to mutate the graph but write=false. Set write:true to run mutations.'
    );
  }
  const withoutTrailing = stripped.replace(/;\s*$/, '');
  if (withoutTrailing.includes(';')) {
    throw new McpError(ErrorCode.InvalidRequest, 'Only a single Cypher statement is allowed.');
  }
}

function serializeProps(o: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(o)) out[k] = serializeValue(val);
  return out;
}

/** Serialize a full record row (record.toObject()) into plain JSON. */
export function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  return serializeProps(row);
}

/**
 * Recursively convert any neo4j driver value (Integer, Node, Relationship,
 * Path, temporal, spatial, list, map) into plain JSON-safe data.
 */
export function serializeValue(v: unknown): unknown {
  if (v === null || v === undefined) return v;

  if (neo4j.isInt(v)) {
    const i = v as unknown as { inSafeRange(): boolean; toNumber(): number; toString(): string };
    return i.inSafeRange() ? i.toNumber() : i.toString();
  }

  if (Array.isArray(v)) return v.map(serializeValue);

  if (v instanceof neo4j.types.Node) {
    return {
      _type: 'node',
      identity: serializeValue(v.identity),
      labels: v.labels,
      properties: serializeProps(v.properties as Record<string, unknown>),
    };
  }

  if (v instanceof neo4j.types.Relationship) {
    return {
      _type: 'relationship',
      identity: serializeValue(v.identity),
      rel_type: v.type,
      start: serializeValue(v.start),
      end: serializeValue(v.end),
      properties: serializeProps(v.properties as Record<string, unknown>),
    };
  }

  if (v instanceof neo4j.types.Path) {
    return {
      _type: 'path',
      length: v.length,
      segments: v.segments.map((s) => ({
        start: serializeValue(s.start),
        relationship: serializeValue(s.relationship),
        end: serializeValue(s.end),
      })),
    };
  }

  // Temporal / spatial types stringify cleanly.
  if (
    v instanceof neo4j.types.Date ||
    v instanceof neo4j.types.DateTime ||
    v instanceof neo4j.types.LocalDateTime ||
    v instanceof neo4j.types.LocalTime ||
    v instanceof neo4j.types.Time ||
    v instanceof neo4j.types.Duration ||
    v instanceof neo4j.types.Point
  ) {
    return String(v);
  }

  if (typeof v === 'object') return serializeProps(v as Record<string, unknown>);

  return v;
}

/**
 * Build a parametrized `MATCH (var[:Label]) WHERE …` fragment locating a node
 * by coordinate, uuid (c_2_uuid OR legacy uuid), or an arbitrary key/value.
 * Values are always bound as $params; only the optional label and match_key
 * are interpolated, each through sanitizeIdentifier. `suffix` disambiguates
 * param names when two locators appear in one query.
 */
export function buildLocator(
  loc: NodeLocator,
  varName: string,
  suffix = ''
): { match: string; params: Record<string, unknown> } {
  const labelPart = loc.label ? `:${sanitizeIdentifier(loc.label)}` : '';
  const params: Record<string, unknown> = {};
  let where: string;

  if (loc.uuid) {
    params[`uuid${suffix}`] = loc.uuid;
    where = `(${varName}.c_2_uuid = $uuid${suffix} OR ${varName}.uuid = $uuid${suffix})`;
  } else if (loc.coordinate) {
    params[`coord${suffix}`] = loc.coordinate;
    where = `${varName}.coordinate = $coord${suffix}`;
  } else if (loc.match_key !== undefined && loc.match_value !== undefined) {
    params[`mk${suffix}`] = loc.match_value;
    where = `${varName}.\`${sanitizeIdentifier(loc.match_key)}\` = $mk${suffix}`;
  } else {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'Locator requires one of: coordinate, uuid, or match_key + match_value.'
    );
  }

  return { match: `MATCH (${varName}${labelPart}) WHERE ${where}`, params };
}

// =============================================================================
// Execution helpers
// =============================================================================

function toNum(v: unknown): number {
  if (neo4j.isInt(v)) return (v as unknown as { toNumber(): number }).toNumber();
  return typeof v === 'number' ? v : Number(v ?? 0);
}

function extractCounters(counters: { updates(): Record<string, number> }): Record<string, number> {
  const updates = counters.updates();
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (typeof v === 'number' && v !== 0) out[k] = v;
  }
  return out;
}

/** Run a single write statement, returning serialized rows + non-zero counters. */
async function runWriteRaw(
  query: string,
  params: Record<string, unknown>
): Promise<{ rows: Array<Record<string, unknown>>; counters: Record<string, number> }> {
  const mgr = getNeo4jConnectionManager();
  await mgr.connect();
  const session = mgr.getWriteSession();
  try {
    const res = await session.executeWrite((tx: ManagedTransaction) => tx.run(query, params));
    return {
      rows: res.records.map((r) => serializeRow(r.toObject())),
      counters: extractCounters(res.summary.counters),
    };
  } catch (e) {
    throw new McpError(ErrorCode.InvalidRequest, `Write failed: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    await mgr.releaseSession(session);
  }
}

// =============================================================================
// graph_cypher
// =============================================================================

/**
 * Execute an arbitrary parametrized Cypher statement. Read-only by default
 * (rejects mutating clauses + uses a READ session); set write:true to mutate.
 */
export async function runCypher(input: GraphCypherInput): Promise<GraphCypherOutput> {
  const mgr = getNeo4jConnectionManager();
  await mgr.connect();

  if (!input.write) screenReadOnly(input.query);

  const start = Date.now();
  const session = input.write ? mgr.getWriteSession() : mgr.getReadSession();
  try {
    const work = (tx: ManagedTransaction): Promise<QueryResult> => tx.run(input.query, input.params);
    const res = input.write
      ? await session.executeWrite(work, { timeout: input.timeout_ms })
      : await session.executeRead(work, { timeout: input.timeout_ms });

    const columns = res.records.length > 0 ? res.records[0]!.keys.map(String) : [];
    const allRows = res.records.map((r) => serializeRow(r.toObject()));
    const rows = allRows.slice(0, input.row_limit);

    return {
      columns,
      rows,
      row_count: rows.length,
      truncated: allRows.length > rows.length,
      write: input.write,
      counters: input.write ? extractCounters(res.summary.counters) : undefined,
      execution_time_ms: Date.now() - start,
    };
  } catch (e) {
    if (e instanceof McpError) throw e;
    throw new McpError(ErrorCode.InvalidRequest, `Cypher failed: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    await mgr.releaseSession(session);
  }
}

// =============================================================================
// CRUD primitives — schema-agnostic, prefix-agnostic
// =============================================================================

/** MERGE a node on a chosen anchor key and SET arbitrary properties + labels. */
export async function upsertNode(input: GraphUpsertNodeInput): Promise<CrudResult> {
  const start = Date.now();

  let anchorKey: string;
  let anchorVal: unknown;
  if (input.merge_on === 'uuid') {
    anchorKey = 'c_2_uuid';
    anchorVal = input.uuid;
  } else if (input.merge_on === 'match_key') {
    anchorKey = sanitizeIdentifier(input.match_key ?? '');
    anchorVal = input.match_value;
  } else {
    anchorKey = 'coordinate';
    anchorVal = input.coordinate;
  }
  if (anchorVal === undefined || anchorVal === null || anchorVal === '') {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Upsert merge_on='${input.merge_on}' requires the corresponding anchor value (coordinate/uuid/match_value).`
    );
  }

  const labels = (input.labels ?? ['Bimba']).map(sanitizeIdentifier);
  const labelClause = labels.length ? `SET n:${labels.map((l) => `\`${l}\``).join(':')} ` : '';
  const hasOnCreate = input.on_create_properties && Object.keys(input.on_create_properties).length > 0;

  const query =
    `MERGE (n {\`${anchorKey}\`: $anchor}) ` +
    (hasOnCreate ? 'ON CREATE SET n += $onCreateProps ' : '') +
    'SET n += $props ' +
    labelClause +
    'RETURN n';

  const params: Record<string, unknown> = { anchor: anchorVal, props: input.properties ?? {} };
  if (hasOnCreate) params.onCreateProps = input.on_create_properties;

  const { rows, counters } = await runWriteRaw(query, params);
  return {
    matched: rows.length,
    counters,
    nodes: rows.map((r) => r.n as Record<string, unknown>),
    execution_time_ms: Date.now() - start,
  };
}

/** SET and/or REMOVE individual properties on a located node. */
export async function setProperty(input: GraphSetPropertyInput): Promise<CrudResult> {
  const start = Date.now();
  const hasSet = input.set && Object.keys(input.set).length > 0;
  const hasRemove = input.remove && input.remove.length > 0;
  if (!hasSet && !hasRemove) {
    throw new McpError(ErrorCode.InvalidRequest, 'Provide `set` and/or `remove`.');
  }

  const { match, params } = buildLocator(input.locator, 'n');
  const clauses: string[] = [];
  if (hasSet) {
    clauses.push('SET n += $set');
    params.set = input.set;
  }
  if (hasRemove) {
    const removeKeys = input.remove!.map((k) => `n.\`${sanitizeIdentifier(k)}\``);
    clauses.push(`REMOVE ${removeKeys.join(', ')}`);
  }

  const query = `${match} ${clauses.join(' ')} RETURN n`;
  const { rows, counters } = await runWriteRaw(query, params);
  return {
    matched: rows.length,
    counters,
    nodes: rows.map((r) => r.n as Record<string, unknown>),
    execution_time_ms: Date.now() - start,
  };
}

/** Add or remove labels on a located node. */
export async function setLabels(input: GraphLabelInput, mode: 'add' | 'remove'): Promise<CrudResult> {
  const start = Date.now();
  const { match, params } = buildLocator(input.locator, 'n');
  const labelClause = input.labels.map((l) => `\`${sanitizeIdentifier(l)}\``).join(':');
  const op = mode === 'add' ? 'SET' : 'REMOVE';
  const query = `${match} ${op} n:${labelClause} RETURN n`;
  const { rows, counters } = await runWriteRaw(query, params);
  return {
    matched: rows.length,
    counters,
    nodes: rows.map((r) => r.n as Record<string, unknown>),
    execution_time_ms: Date.now() - start,
  };
}

/** MERGE (or CREATE) a typed relationship between two located nodes. */
export async function createRelationship(input: GraphCreateRelationshipInput): Promise<CrudResult> {
  const start = Date.now();
  const relType = sanitizeIdentifier(input.rel_type);
  const a = buildLocator(input.from, 'a', '_a');
  const b = buildLocator(input.to, 'b', '_b');
  const verb = input.merge ? 'MERGE' : 'CREATE';

  const query =
    `${a.match} ` +
    `${b.match} ` +
    `${verb} (a)-[r:\`${relType}\`]->(b) ` +
    'SET r += $relProps ' +
    'RETURN a, r, b';

  const params = { ...a.params, ...b.params, relProps: input.properties ?? {} };
  const { rows, counters } = await runWriteRaw(query, params);
  return {
    matched: rows.length,
    counters,
    edges: rows.map((r) => r.r as Record<string, unknown>),
    nodes: rows.flatMap((r) => [r.a, r.b] as Record<string, unknown>[]),
    execution_time_ms: Date.now() - start,
  };
}

/** Delete relationship(s) between two located nodes (optionally by type/direction). */
export async function deleteRelationship(input: GraphDeleteRelationshipInput): Promise<CrudResult> {
  const start = Date.now();
  const a = buildLocator(input.from, 'a', '_a');
  const b = buildLocator(input.to, 'b', '_b');
  const relPart = input.rel_type ? `r:\`${sanitizeIdentifier(input.rel_type)}\`` : 'r';
  const dir = input.direction ?? 'out';
  const relMatch =
    dir === 'in' ? `(a)<-[${relPart}]-(b)` : dir === 'both' ? `(a)-[${relPart}]-(b)` : `(a)-[${relPart}]->(b)`;

  const query = `${a.match} ${b.match} MATCH ${relMatch} DELETE r RETURN count(r) AS deleted`;
  const params = { ...a.params, ...b.params };
  const { rows, counters } = await runWriteRaw(query, params);
  return {
    matched: rows.length,
    counters,
    deleted: toNum(rows[0]?.deleted),
    execution_time_ms: Date.now() - start,
  };
}

/** DELETE (or DETACH DELETE) a located node. Requires confirm:true at the schema. */
export async function deleteNode(input: GraphDeleteNodeInput): Promise<CrudResult> {
  const start = Date.now();
  if (input.confirm !== true) {
    throw new McpError(ErrorCode.InvalidRequest, 'deleteNode requires confirm:true.');
  }
  const { match, params } = buildLocator(input.locator, 'n');
  const verb = input.detach ? 'DETACH DELETE' : 'DELETE';
  // Collect first so we can both delete and report a count without returning deleted entities.
  const query = `${match} WITH collect(n) AS ns FOREACH (x IN ns | ${verb} x) RETURN size(ns) AS deleted`;
  const { rows, counters } = await runWriteRaw(query, params);
  return {
    matched: toNum(rows[0]?.deleted),
    counters,
    deleted: toNum(rows[0]?.deleted),
    execution_time_ms: Date.now() - start,
  };
}

// =============================================================================
// graph_schema — live introspection
// =============================================================================

/** Return the real labels, relationship types, property keys + prefix inventory. */
export async function graphSchema(input: GraphSchemaInput): Promise<GraphSchemaOutput> {
  const start = Date.now();
  const mgr = getNeo4jConnectionManager();
  await mgr.connect();
  const notes: string[] = [];

  try {
    const labels = (
      await mgr.executeRead<{ label: string }>(`CALL db.labels() YIELD label RETURN label ORDER BY label`)
    ).map((r) => r.label);
    const relTypes = (
      await mgr.executeRead<{ relationshipType: string }>(
        `CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType`
      )
    ).map((r) => r.relationshipType);
    const propertyKeys = (
      await mgr.executeRead<{ propertyKey: string }>(
        `CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey`
      )
    ).map((r) => r.propertyKey);

    const out: GraphSchemaOutput = {
      node_labels: labels,
      relationship_types: relTypes,
      property_keys: propertyKeys,
      execution_time_ms: 0,
    };

    if (input.include_prefixes && input.sample_size > 0) {
      const prefixRows = await mgr.executeRead<{ prefix: string; c: unknown }>(
        `MATCH (n) WITH n LIMIT $sample
         UNWIND keys(n) AS k
         WITH CASE WHEN k =~ '[a-z]_[0-9]+_.*' THEN split(k,'_')[0] + '_' + split(k,'_')[1] ELSE 'unprefixed' END AS prefix
         RETURN prefix, count(*) AS c ORDER BY c DESC`,
        { sample: neo4j.int(input.sample_size) }
      );
      out.property_key_prefixes = prefixRows.map((r) => ({ prefix: r.prefix, count: toNum(r.c) }));
      notes.push(`Property-key prefixes sampled over up to ${input.sample_size} nodes.`);
    }

    if (input.include_counts) {
      const nodeCounts = await mgr.executeRead<{ label: string; c: unknown }>(
        `MATCH (n) UNWIND labels(n) AS label RETURN label, count(*) AS c ORDER BY c DESC`
      );
      out.node_counts_by_label = nodeCounts.map((r) => ({ label: r.label, count: toNum(r.c) }));

      const relCounts = await mgr.executeRead<{ t: string; c: unknown }>(
        `MATCH ()-[r]->() RETURN type(r) AS t, count(*) AS c ORDER BY c DESC`
      );
      out.relationship_counts_by_type = relCounts.map((r) => ({ type: r.t, count: toNum(r.c) }));

      const nodeTotal = await mgr.executeRead<{ c: unknown }>(`MATCH (n) RETURN count(n) AS c`);
      out.total_nodes = toNum(nodeTotal[0]?.c);
      const relTotal = await mgr.executeRead<{ c: unknown }>(`MATCH ()-[r]->() RETURN count(r) AS c`);
      out.total_relationships = toNum(relTotal[0]?.c);
    }

    notes.push(
      'Relationship types are named/correspondential (e.g. MANIFESTS, OPERATES_IN, HAS_INTERNAL_COMPONENT), NOT positional POSn_*. The POSn_* scheme is retired (see graph-schema canon).'
    );
    out.notes = notes;
    out.execution_time_ms = Date.now() - start;
    return out;
  } catch (e) {
    throw new McpError(ErrorCode.InvalidRequest, `Schema introspection failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
