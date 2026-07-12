/**
 * Map-index projection — the graduated Neo4j -> repo *reflection* sync direction (Track 45.T45.2).
 *
 * Graduates the vault-side `Idea/Bimba/Map/datasets/scripts/project-map-index.mjs` seed into a
 * maintained `graph_sync neo4j_to_obsidian` direction scoped to `map-index`, sourced from the LIVE
 * graph rather than the frozen dataset dumps. Emits pithy, wikilink-open `/map` index files whose
 * folder tree mirrors the containment (children) hierarchy and whose bodies carry curated node
 * content + the full relation index. Full node detail stays in Neo4j; this is its navigable surface.
 *
 * ARCHITECTURE (source §3): the wikilink<->Neo4j system has TWO directions and they must never be
 * conflated. Crystallisation (repo -> Neo4j, UPWARD, authoring) is Hen's job. Reflection/projection
 * (Neo4j -> repo, DOWNWARD, navigation) is THIS module. `map-index` artifacts are reflection-only:
 * they are NEVER re-promoted upward — `syncMapIndex` refuses any upward direction, and the general
 * `syncVaultToGraph` skips `c_4_artifact_role: map-index` files. The data already lives in the graph.
 *
 * CANONICAL FORM (source §3.3): coordinate rendering reuses the ALREADY-synchronised TS normaliser
 * `wrapContextFrames`/`convertHashToMFamily` (coordinates/syntax.ts) — this is NOT a sixth local
 * impl, it is the sanctioned shared one. `/` is illegal in filenames, so file/wikilink names render
 * it `∕` (U+2215); `coordinate:` + the `c_4_graph_node` pointer keep the true `/`.
 *
 * IDEMPOTENCY / FRESHNESS (Verify line): re-projecting an unchanged graph node yields byte-identical
 * output (the `c_3_projected_at` stamp is sourced from the node's own `updated_at`, not a wall clock,
 * so a re-run without a graph change produces no diff). When the node's content changes, the file
 * changes. `syncMapIndex` only writes when the projected bytes differ from what is on disk.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';

import { getNeo4jConnectionManager } from '../db/neo4j.js';
import { convertHashToMFamily, wrapContextFrames } from '../coordinates/syntax.js';
import type { SyncDirection, SyncResult, SyncStats } from '../schemas/sync.js';

// =============================================================================
// Types
// =============================================================================

/** A containment/relation edge incident to a projected node (source OR target = the node). */
export interface MapRelationEdge {
  source: string;
  relType: string;
  target: string | null;
  props: Record<string, unknown>;
}

/**
 * A single live-graph node snapshot to project. In the live graph coordinates are already in
 * canonical `M` form; `ancestors` is the containment chain from just below the branch root down to
 * the direct parent (canonical, branch root excluded), which fixes the `/map` file path.
 */
export interface MapNodeSnapshot {
  coordinate: string;
  properties: Record<string, unknown>;
  relations: MapRelationEdge[];
  children: string[];
  ancestors: string[];
  childrenBeyondDepth?: number;
}

export interface ProjectedMapIndex {
  coordinate: string;
  relPath: string;
  markdown: string;
}

/** The live-graph read source. The default impl queries Neo4j; tests inject real in-memory data. */
export interface MapIndexGraphSource {
  fetchSnapshots(coordinateFilter?: string): Promise<MapNodeSnapshot[]>;
}

export const MAP_INDEX_ROLE = 'map-index';

// =============================================================================
// Canonical coordinate rendering (reuses the shared normaliser — NOT a 6th impl)
// =============================================================================

export function canonicalMapCoordinate(coord: string): string {
  return wrapContextFrames(convertHashToMFamily(coord));
}

/** `/` -> `∕` (U+2215) so the canonical coordinate is filesystem/wikilink-safe. */
export function mapIndexFileId(canonical: string): string {
  return canonical.replace(/\//g, '∕');
}

const coordRef = (canonical: string): string => `[[${mapIndexFileId(canonical)}]]`;

/**
 * The `/map` relative path for a node: `M{branch}/{anc1}/.../{self}[/{self}].md`. Each ancestor is a
 * folder; a node WITH children is a folder-note (`{self}/{self}.md`) so `[[{self}]]` resolves, a leaf
 * is `{self}.md`. Mirrors `project-map-index.mjs` `relPathFor`.
 */
export function mapIndexRelPath(
  canonical: string,
  ancestorsCanonical: string[],
  hasChildren: boolean
): string {
  const branchMatch = /^([CPMSLT]\d+)/.exec(canonical);
  const branch = branchMatch?.[1] ?? canonical;
  const dirs = ancestorsCanonical.map(mapIndexFileId);
  const self = mapIndexFileId(canonical);
  const leaf = hasChildren ? join(self, `${self}.md`) : `${self}.md`;
  return join(branch, ...dirs, leaf);
}

// =============================================================================
// Content rendering (curated + bounded, faithful to the projector)
// =============================================================================

const CONTENT_FIELDS: Array<[string, string]> = [
  ['description', 'Description'],
  ['operationalEssence', 'Operational essence'],
  ['operationalSymbolics', 'Operational symbolics'],
  ['symbol', 'Symbol'],
  ['completeFormulation', 'Complete formulation'],
  ['internalStructure', 'Internal structure'],
  ['keyPrinciples', 'Key principles'],
  ['architecturalFunction', 'Architectural function'],
  ['philosophicalFoundation', 'Philosophical foundation'],
  ['resonances', 'Resonances'],
  ['qlCategory', 'QL category'],
  ['qlPosition', 'QL position'],
  ['contextFrame', 'Context frame'],
];

function fmtVal(value: unknown, max = 600): string {
  let v: string;
  if (Array.isArray(value)) {
    v = value.map((x) => (x && typeof x === 'object' ? JSON.stringify(x) : String(x))).join('; ');
  } else if (value && typeof value === 'object') {
    v = JSON.stringify(value);
  } else {
    v = String(value);
  }
  v = v.replace(/\s+/g, ' ').trim();
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
}

function pithy(value: unknown, max = 240): string {
  const one = String(value ?? '').replace(/\s+/g, ' ').trim();
  return one.length > max ? `${one.slice(0, max - 1)}…` : one;
}

const REL_PROP_PRIORITY = [
  'relationship',
  'connection_type',
  'relationshipType',
  'type',
  'resonanceType',
  'mathematical_basis',
  'mathematicalEssence',
  'significance',
  'insight',
  'description',
];
const REL_PROP_SKIP = new Set(['createdAt', 'created_at']);

function renderRelProps(props: Record<string, unknown>): string[] {
  const keys = Object.keys(props || {}).filter(
    (k) => !REL_PROP_SKIP.has(k) && props[k] != null && String(props[k]).trim()
  );
  keys.sort((a, b) => {
    const ia = REL_PROP_PRIORITY.indexOf(a);
    const ib = REL_PROP_PRIORITY.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const shown = keys.slice(0, 8);
  const lines = shown.map((k) => {
    let v = String(props[k]).replace(/\s+/g, ' ').trim();
    if (v.length > 200) v = `${v.slice(0, 197)}…`;
    return `  - ${k}: ${v}`;
  });
  if (keys.length > shown.length) {
    lines.push(`  - *(+${keys.length - shown.length} more props in graph)*`);
  }
  return lines;
}

function titleOf(properties: Record<string, unknown>, canonical: string): string {
  return (
    (properties['name'] as string) ??
    (properties['title'] as string) ??
    (properties['c_1_name'] as string) ??
    canonical
  );
}

/**
 * Projection timestamp is sourced from the node's own last-changed time, NOT a wall clock, so that
 * re-projecting an unchanged node is byte-identical (idempotent) while a changed node produces a
 * fresh stamp. Returns `undefined` when the graph carries no such value (line then omitted).
 */
function projectedAtOf(properties: Record<string, unknown>): string | undefined {
  const raw =
    properties['updated_at'] ??
    properties['c_3_updated_at'] ??
    properties['c_3_projected_at'] ??
    properties['c_3_created_at'];
  if (raw == null) return undefined;
  return String(raw);
}

// =============================================================================
// Pure projection: live-graph snapshot -> map-index markdown
// =============================================================================

/**
 * Project one live-graph node snapshot into its canonical `map-index` markdown + `/map` relative
 * path. Pure and deterministic: the same snapshot always yields byte-identical output.
 */
export function projectMapNode(snapshot: MapNodeSnapshot): ProjectedMapIndex {
  const canonical = canonicalMapCoordinate(snapshot.coordinate);
  const ancestors = snapshot.ancestors.map(canonicalMapCoordinate);
  const children = snapshot.children.map(canonicalMapCoordinate);
  const hasChildren = children.length > 0;
  const props = snapshot.properties;
  const title = titleOf(props, canonical);

  const branchMatch = /^([CPMSLT]\d+)/.exec(canonical);
  const branchRoot = branchMatch?.[1] ?? canonical;
  const parent = ancestors[ancestors.length - 1] ?? branchRoot;

  // De-duplicated edge list (source OR target = this node).
  const edgeSeen = new Set<string>();
  const edges = snapshot.relations.filter((e) => {
    const key = `${e.source}|${e.relType}|${e.target ?? ''}`;
    if (edgeSeen.has(key)) return false;
    edgeSeen.add(key);
    return true;
  });

  const rawCoord = snapshot.coordinate;
  const relatedUniq = Array.from(
    new Set<string>([
      ...children.map(coordRef),
      ...edges
        .map((e) => (e.source === rawCoord ? e.target : e.source))
        .filter((c): c is string => Boolean(c) && c !== rawCoord)
        .map((c) => coordRef(canonicalMapCoordinate(c))),
    ])
  ).slice(0, 24);

  const leadKey = props['essence'] ? 'essence' : props['coreNature'] ? 'coreNature' : 'description';
  const lead = pithy(props['essence'] ?? props['coreNature'] ?? props['description'] ?? '');
  const skip = new Set([leadKey, 'essence', 'coreNature']);
  const content: string[] = [];
  for (const [key, label] of CONTENT_FIELDS) {
    if (skip.has(key) || props[key] == null) continue;
    const val = fmtVal(props[key]);
    if (!val) continue;
    content.push(`- **${label}:** ${val}`);
  }

  const yaml = (v: string): string => JSON.stringify(v);
  const projectedAt = projectedAtOf(props);
  const fm: string[] = [
    '---',
    `coordinate: ${yaml(canonical)}`,
    `c_4_artifact_role: "${MAP_INDEX_ROLE}"`,
    `title: ${yaml(title)}`,
    `c_0_source_coordinates: [${yaml(coordRef(parent))}]`,
    `c_0_related_coordinates: [${relatedUniq.map(yaml).join(', ')}]`,
    `c_3_projected_from: "neo4j://Bimba"`,
    ...(projectedAt ? [`c_3_projected_at: ${yaml(projectedAt)}`] : []),
    `c_4_graph_node: ${yaml(`neo4j://Bimba/${canonical}`)}`,
    '---',
  ];

  const body: string[] = [`# ${canonical} · ${title}`.trim(), ''];
  if (lead) body.push(`> ${lead}`, '');
  if (content.length) {
    body.push('## Detail', ...content, '');
  }
  if (children.length || (snapshot.childrenBeyondDepth ?? 0) > 0) {
    body.push('## Contains');
    if (children.length) body.push(children.map(coordRef).join(' · '));
    const deeper = snapshot.childrenBeyondDepth ?? 0;
    if (deeper > 0) {
      body.push(`*(+${deeper} deeper ${deeper === 1 ? 'child' : 'children'} in Neo4j — beyond projection depth)*`);
    }
    body.push('');
  }
  if (edges.length) {
    body.push(`## Relations (${edges.length})`);
    body.push(
      '*Each line: `[[source]] - [[relation_type]] - [[target]]`; relation types are wikilinks, so their backlinks index every edge of that type across the map.*',
      ''
    );
    for (const e of edges) {
      const s = coordRef(canonicalMapCoordinate(e.source));
      const t = e.target ? coordRef(canonicalMapCoordinate(e.target)) : null;
      body.push(t ? `- ${s} - [[${e.relType}]] - ${t}` : `- ${s} - [[${e.relType}]]`);
      body.push(...renderRelProps(e.props));
    }
    body.push('');
  }
  body.push('## Full node', `\`graph_context ${canonical}\` · sourced live from \`neo4j://Bimba/${canonical}\``, '');

  const markdown = `${fm.join('\n')}\n\n${body.join('\n')}`;
  return {
    coordinate: canonical,
    relPath: mapIndexRelPath(canonical, ancestors, hasChildren),
    markdown,
  };
}

// =============================================================================
// The maintained sync direction
// =============================================================================

function emptyStats(): SyncStats {
  return { processed: 0, created: 0, updated: 0, deleted: 0, failed: 0, skipped: 0 };
}

/**
 * The graduated `map-index` sync direction. `neo4j_to_obsidian` projects live-graph nodes into their
 * `/map` files idempotently. Any UPWARD direction is refused — map-index is reflection-only and the
 * data is never re-promoted (source §3).
 */
export async function syncMapIndex(opts: {
  direction: SyncDirection;
  mapRoot: string;
  source: MapIndexGraphSource;
  coordinateFilter?: string;
  dryRun?: boolean;
}): Promise<SyncResult> {
  const { direction, mapRoot, source, coordinateFilter, dryRun = false } = opts;
  const startTime = new Date();
  const startMs = Date.now();

  const base = (): Omit<SyncResult, 'success'> => ({
    direction,
    start_time: startTime.toISOString(),
    end_time: new Date().toISOString(),
    execution_time_ms: Date.now() - startMs,
    vault_to_graph: emptyStats(),
  });

  // No re-promotion: refuse any upward flow of map-index reflection artifacts.
  if (direction === 'obsidian_to_neo4j' || direction === 'bidirectional') {
    return {
      success: false,
      ...base(),
      error_message:
        'map-index is a Neo4j->repo reflection artifact and is never re-promoted upward; ' +
        'use direction "neo4j_to_obsidian" for the map-index scope (crystallisation is Hen\'s job).',
    };
  }

  const stats = emptyStats();
  const filesProcessed: string[] = [];
  try {
    const snapshots = await source.fetchSnapshots(coordinateFilter);
    for (const snapshot of snapshots) {
      stats.processed += 1;
      try {
        const projected = projectMapNode(snapshot);
        const absPath = join(mapRoot, projected.relPath);

        let existing: string | null = null;
        try {
          existing = await readFile(absPath, 'utf-8');
        } catch {
          existing = null;
        }

        if (existing === projected.markdown) {
          stats.skipped += 1; // idempotent no-op: on-disk bytes already fresh
          continue;
        }

        if (!dryRun) {
          await mkdir(dirname(absPath), { recursive: true });
          await writeFile(absPath, projected.markdown, 'utf-8');
        }
        filesProcessed.push(projected.relPath);
        if (existing === null) stats.created += 1;
        else stats.updated += 1;
      } catch {
        stats.failed += 1;
      }
    }
  } catch (error) {
    return {
      success: false,
      ...base(),
      graph_to_vault: stats,
      error_message: error instanceof Error ? error.message : 'Unknown error during map-index sync',
    };
  }

  return {
    success: true,
    ...base(),
    graph_to_vault: stats,
    files_processed: filesProcessed,
  };
}

// =============================================================================
// Default live-graph source (Neo4j-backed) — I/O glue over getNeo4jConnectionManager
// =============================================================================

/**
 * Structural containment relation types (the children relation). `HAS_INTERNAL_COMPONENT` is
 * canonical; the `HAS_*`/`CONTAINS_*` family covers domain groupings. Semantic verbs
 * (`PROVIDES_*`, `GENERATES`, …) are excluded — they connect nested coords but are not containment.
 */
function isContainmentType(relType: string): boolean {
  return relType === 'HAS_INTERNAL_COMPONENT' || /^(HAS_|CONTAINS_)/.test(relType);
}

/** Coordinate-prefix ancestor test on canonical form: `M2-5` is an ancestor of `M2-5-2`. */
function isCoordinateAncestor(ancestor: string, coord: string): boolean {
  if (coord.length <= ancestor.length || !coord.startsWith(ancestor)) return false;
  const next = coord[ancestor.length];
  return next === '-' || next === '.' || next === '/';
}

/**
 * Neo4j-backed source. Reads live `:Bimba` nodes (optionally coordinate-filtered), their incident
 * relations, containment children, and the containment-ancestor chain. Reflection-downward read
 * only — never writes to the graph.
 */
export class Neo4jMapIndexSource implements MapIndexGraphSource {
  async fetchSnapshots(coordinateFilter?: string): Promise<MapNodeSnapshot[]> {
    const manager = getNeo4jConnectionManager();

    const nodeQuery = coordinateFilter
      ? 'MATCH (n:Bimba) WHERE n.coordinate STARTS WITH $prefix RETURN n.coordinate AS coordinate, properties(n) AS props LIMIT 5000'
      : 'MATCH (n:Bimba) WHERE n.coordinate IS NOT NULL RETURN n.coordinate AS coordinate, properties(n) AS props LIMIT 5000';
    const nodeRows = await manager.executeRead<{ coordinate: string; props: Record<string, unknown> }>(
      nodeQuery,
      coordinateFilter ? { prefix: coordinateFilter } : {}
    );

    const snapshots: MapNodeSnapshot[] = [];
    for (const row of nodeRows) {
      const coordinate = row.coordinate;
      if (!coordinate) continue;

      const relRows = await manager.executeRead<{
        source: string;
        relType: string;
        target: string | null;
        props: Record<string, unknown>;
      }>(
        'MATCH (a:Bimba {coordinate: $coord})-[r]->(b:Bimba) ' +
          'RETURN a.coordinate AS source, type(r) AS relType, b.coordinate AS target, properties(r) AS props ' +
          'UNION MATCH (a:Bimba)-[r]->(b:Bimba {coordinate: $coord}) ' +
          'RETURN a.coordinate AS source, type(r) AS relType, b.coordinate AS target, properties(r) AS props',
        { coord: coordinate }
      );

      const relations: MapRelationEdge[] = relRows.map((r) => ({
        source: r.source,
        relType: r.relType,
        target: r.target ?? null,
        props: r.props ?? {},
      }));

      const children = relations
        .filter(
          (r) => r.source === coordinate && r.target && isContainmentType(r.relType) && isCoordinateAncestor(coordinate, r.target)
        )
        .map((r) => r.target as string);

      // Containment-ancestor chain: incoming containment edges whose source is a coordinate-ancestor.
      const ancestorCandidates = relations
        .filter((r) => r.target === coordinate && isContainmentType(r.relType) && isCoordinateAncestor(r.source, coordinate))
        .map((r) => r.source);
      const directParent = ancestorCandidates.sort((a, b) => b.length - a.length)[0];
      const ancestors = directParent ? await this.ancestorChain(manager, directParent) : [];

      snapshots.push({
        coordinate,
        properties: row.props ?? {},
        relations,
        children: Array.from(new Set(children)),
        ancestors,
      });
    }
    return snapshots;
  }

  private async ancestorChain(
    manager: ReturnType<typeof getNeo4jConnectionManager>,
    directParent: string
  ): Promise<string[]> {
    const chain: string[] = [directParent];
    let cursor = directParent;
    const guard = new Set<string>([directParent]);
    // Walk up containment parents until a branch root (single family+digit, no further '-'/'.').
    while (/[-.]/.test(cursor)) {
      const rows = await manager.executeRead<{ source: string; relType: string }>(
        'MATCH (a:Bimba)-[r]->(b:Bimba {coordinate: $coord}) RETURN a.coordinate AS source, type(r) AS relType',
        { coord: cursor }
      );
      const parent = rows
        .filter((r) => isContainmentType(r.relType) && isCoordinateAncestor(r.source, cursor))
        .map((r) => r.source)
        .sort((a, b) => b.length - a.length)[0];
      if (!parent || guard.has(parent) || !/[-.]/.test(parent)) break;
      chain.unshift(parent);
      guard.add(parent);
      cursor = parent;
    }
    return chain;
  }
}
