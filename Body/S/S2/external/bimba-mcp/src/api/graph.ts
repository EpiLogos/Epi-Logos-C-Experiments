/**
 * GraphAPI - Query API for the Neo4j Bimba knowledge graph
 *
 * Provides methods to query nodes by QL coordinate and retrieve graph results
 * with nodes, edges, and optional nested position data.
 */

import { getNeo4jConnectionManager } from '../db/neo4j.js';
import { GeminiEmbeddingClient, type TaskType } from '../embeddings/gemini.js';
import { getAlignmentValidator } from '../validation/alignment.js';
import type { GraphResult, NodeRef, PathResult, EdgeRef, ContextResult, RelTypeConnections, SpecResult, CoordinateSpec, PositionConnectedEntities, ConnectedEntity, RetrievalResult, GraphSearchOutput, CoordinateFilter, DisclosureResult, EmbeddingResult, BatchEmbeddingResult, ValidationResult, GraphChunkResult, GraphChunkInput, GraphTraversePositionsOutput, TraversalStep, GraphAdminInput, GraphAdminOutput } from '../schemas/graph.js';
import { chunkDocument } from '../chunking/contextual.js';
import { readFile } from 'fs/promises';
import { join } from 'node:path';
import { resolvePresentRoot } from '../repo-paths.js';
import neo4j from 'neo4j-driver';
import { convertHashToMFamily, wrapContextFrames } from '../coordinates/syntax.js';
import { buildRoleView, groupByFamily } from './property-roles.js';
import { sanitizeIdentifier } from './graph-crud.js';

// =============================================================================
// Helper for Node Property Translation
// =============================================================================

/**
 * Build a NodeRef from a node's raw properties + labels, prefix-agnostically.
 *
 * Synthesizes the back-compat keys (uuid/title/coordinate/file_path) that
 * handlers read directly, AND attaches the open-schema views (`roles`,
 * `by_family`) so the rich {family}_{n}_ data is surfaced rather than buried.
 * `fallbackUuid` is the top-level uuid some Cypher projections carry alongside
 * properties.
 */
export function buildNodeRef(
  rawProperties: Record<string, unknown>,
  labels: string[],
  fallbackUuid?: unknown
): NodeRef {
  const roles = buildRoleView(rawProperties);
  const resolvedUuid = roles.uuid?.value ?? rawProperties['uuid'] ?? fallbackUuid;
  const resolvedName = roles.name?.value;
  const coordinate = rawProperties['coordinate'];
  const filePath = rawProperties['s_1_vault_path'] ?? rawProperties['file_path'];

  const properties: Record<string, unknown> = {
    ...rawProperties,
    uuid: resolvedUuid,
    title:
      (typeof resolvedName === 'string' ? resolvedName : undefined) ??
      (typeof rawProperties['title'] === 'string' ? (rawProperties['title'] as string) : undefined) ??
      `Node at ${coordinate}`,
    coordinate,
    file_path: filePath,
  };

  return {
    uuid: typeof resolvedUuid === 'string' ? resolvedUuid : '',
    labels,
    properties,
    // The structured views are plain objects; the schema types them as records.
    by_family: groupByFamily(rawProperties) as unknown as Record<string, unknown>,
    roles: roles as unknown as Record<string, unknown>,
    file_path: typeof filePath === 'string' ? filePath : undefined,
  };
}

export function mapNeo4jNode(nodeData: unknown): NodeRef | null {
  if (!nodeData || typeof nodeData !== 'object') {
    return null;
  }

  const obj = nodeData as Record<string, unknown>;
  const rawProperties =
    typeof obj['properties'] === 'object' && obj['properties'] !== null
      ? (obj['properties'] as Record<string, unknown>)
      : {};
  const labels = Array.isArray(obj['labels']) ? (obj['labels'] as string[]) : [];

  return buildNodeRef(rawProperties, labels, obj['uuid']);
}


// =============================================================================
// Coordinate Filtering
// =============================================================================

/**
 * Convert a coordinate pattern to a Cypher filter condition
 *
 * Examples:
 * - 'M2' -> "node.coordinate STARTS WITH 'M2'"
 * - 'M2-5' -> range filters on coordinate structure
 * - '#' -> no filter (all nodes)
 * - 'C3-P2-*' -> "node.coordinate STARTS WITH 'C3-P2-'"
 */
function coordinateToFilter(coordinate: string): {
  condition: string;
  params: Record<string, unknown>;
} {
  if (coordinate === '#') {
    return { condition: '', params: {} };
  }

  // Handle full QL coordinate with possible wildcards: C3-P2-M*-S*-T*-L*
  if (coordinate.includes('-') && coordinate.includes('*')) {
    const splitResult = coordinate.split('*');
    const prefix = (splitResult[0] ?? '').replace(/-$/, '');
    return {
      condition: `node.coordinate STARTS WITH $coordinatePrefix`,
      params: { coordinatePrefix: prefix },
    };
  }

  // A coordinate is a PATH: '-' is branch descent and '.' is a 4-segment nest,
  // never a numeric range. So "M1-0" means the node at that path (plus its
  // descendants under prefix match) — NOT the range M1..M0. The old range branch
  // built an illegal regex (e.g. [1-0]) and crashed; matching by prefix is the
  // same behavior every other coordinate already uses.
  return {
    condition: `node.coordinate STARTS WITH $coordinatePrefix`,
    params: { coordinatePrefix: coordinate },
  };
}

// =============================================================================
// Graph Query API
// =============================================================================

export interface GraphQueryOptions {
  coordinate: string;
  includeNested?: boolean;
  limit?: number;
}

/**
 * Query nodes by QL coordinate
 *
 * Returns a GraphResult with matching nodes and their relationships.
 * Supports:
 * - '#' wildcard to get all nodes
 * - Partial coordinates (P2, M3-5) to match by prefix
 * - Full QL coordinates (C3-P2-M1-S2-T1-L0)
 * - Nested position arrays (p0_*, p1_*, etc.) when includeNested=true
 *
 * @param coordinate Coordinate pattern to query
 * @param includeNested If true, includes nested position arrays in results
 * @param limit Max number of nodes to return (default 100, max 1000)
 * @returns GraphResult with matching nodes and edges
 * @throws Error if coordinate format is invalid or query fails
 */
export async function queryByCoordinate(
  coordinate: string,
  includeNested = false,
  limit = 100
): Promise<GraphResult> {
  // Validate limit
  if (limit < 1 || limit > 1000) {
    throw new Error('Limit must be between 1 and 1000');
  }

  const connectionManager = getNeo4jConnectionManager();
  if (!connectionManager.isConnected()) {
    throw new Error('Not connected to Neo4j');
  }

  // Raw '#' archetypes (#, #0..#5) are stored literally and are DISTINCT nodes
  // from the M-family manifestations — do not rewrite them to M, or the # nodes
  // become unreachable and # queries wrongly return M results. Only convert the
  // legacy hash form for non-'#' input.
  const trimmed = coordinate.trim();
  const normalizedCoordinate = trimmed.startsWith('#') ? trimmed : wrapContextFrames(convertHashToMFamily(coordinate));

  try {
    const startTime = Date.now();
    const { condition, params } = coordinateToFilter(normalizedCoordinate);

    // Build base query for nodes (querying canonical :Bimba label)
    let query = `
      MATCH (node:Bimba)
      ${condition ? `WHERE ${condition}` : ''}
      RETURN node
      LIMIT $limit
    `;

    const queryParams = {
      ...params,
      // Neo4j requires an Integer for LIMIT; the JS driver marshals plain
      // numbers as floats (which Neo4j 5 rejects), so wrap with neo4j.int().
      limit: neo4j.int(limit),
    };

    // Execute query
    const records = await connectionManager.executeRead<Record<string, unknown>>(
      query,
      queryParams
    );

    // Convert records to NodeRef objects using mapNeo4jNode
    const nodeList: (NodeRef | null)[] = records
      .map((record) => {
        const nodeData = record['node'];
        const mapped = mapNeo4jNode(nodeData);
        if (mapped && includeNested) {
          // Keep nested position properties
          for (const [key, value] of Object.entries(mapped.properties)) {
            if (key.match(/^p\d+_/)) {
              mapped.properties[key] = value;
            }
          }
        }
        return mapped;
      });

    const nodes: NodeRef[] = nodeList.filter((node): node is NodeRef => node !== null);

    const executionTime = Date.now() - startTime;

    // Build result
    const result: GraphResult = {
      nodes,
      edges: [], // Edges would be populated if we queried relationships
      coordinate: normalizedCoordinate === '#' ? undefined : normalizedCoordinate,
      sync_status: 'synced',
      query,
      execution_time_ms: executionTime,
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Graph query failed for coordinate "${coordinate}": ${errorMessage}`);
  }
}

/**
 * Query nodes by full QL coordinate (6-dimensional)
 *
 * Specialized method for querying full 6-dimensional coordinates in the format:
 * C{n}-P{n}-M{n}-S{n}-T{n}-L{n}
 *
 * Supports wildcards: C3-P2-*-*-*-*
 */
export async function queryByQLCoordinate(
  coordinate: string,
  limit = 100
): Promise<GraphResult> {
  // Normalize legacy hash coordinate + context frames if present
  const normalized = wrapContextFrames(convertHashToMFamily(coordinate));

  // Ensure it looks like a QL coordinate
  if (!normalized.match(/^[CPMSLT]\d+/)) {
    throw new Error('Invalid QL coordinate format. Must start with a coordinate type letter followed by numbers');
  }

  return queryByCoordinate(normalized, false, limit);
}

// =============================================================================
// Graph Traversal API
// =============================================================================

export interface TraverseOptions {
  startUuid: string;
  maxDepth?: number;
  relTypes?: string[];
  direction?: 'in' | 'out' | 'both';
}

export interface TraverseResult {
  start_uuid: string;
  paths: PathResult[];
  total_paths: number;
  total_nodes: number;
  max_depth_reached: number;
  execution_time_ms: number;
}

/**
 * Traverse the graph starting from a given node
 *
 * Returns all paths from the start node up to max_depth, with optional
 * filtering by relationship types and direction.
 *
 * @param startUuid UUID of the starting node
 * @param maxDepth Maximum traversal depth (1-5, default 3)
 * @param relTypes Optional array of relationship types to filter by
 * @param direction Traversal direction: 'in', 'out', or 'both' (default 'out')
 * @returns TraverseResult with paths and metadata
 * @throws Error if node not found or query fails
 */
export async function traverse(
  startUuid: string,
  maxDepth = 3,
  relTypes?: string[],
  direction: 'in' | 'out' | 'both' = 'out'
): Promise<TraverseResult> {
  // Validate inputs
  if (maxDepth < 1 || maxDepth > 5) {
    throw new Error('maxDepth must be between 1 and 5');
  }

  // Direction parameter is included for API compatibility but currently only 'out' is implemented
  void direction;

  const connectionManager = getNeo4jConnectionManager();
  if (!connectionManager.isConnected()) {
    throw new Error('Not connected to Neo4j');
  }

  try {
    const startTime = Date.now();

    // Build relationship filter condition
    let relFilter = '';
    if (relTypes && relTypes.length > 0) {
      const relList = relTypes.map((r) => `'${r}'`).join(',');
      relFilter = `AND type(rel) IN [${relList}]`;
    }

    // Note: Graph traversal direction is specified in the Cypher pattern
    // Current implementation supports 'out' direction via (start)-[rel]->(target)

    // Use Cypher path traversal to find all paths from start node
    // Returns paths of varying lengths from start to reachable nodes
    const query = `
      MATCH path = (start:Bimba)-[rel*1..${maxDepth}]->(target:Bimba)
      WHERE start.c_2_uuid = $startUuid OR start.uuid = $startUuid
      ${relFilter}
      RETURN {
        nodes: [n IN nodes(path) | {uuid: coalesce(n.c_2_uuid, n.uuid), labels: labels(n), properties: properties(n)}],
        edges: [e IN relationships(path) | {source_uuid: coalesce(startNode(e).c_2_uuid, startNode(e).uuid), target_uuid: coalesce(endNode(e).c_2_uuid, endNode(e).uuid), rel_type: type(e), properties: properties(e)}],
        length: length(path)
      } AS path_data
      LIMIT $pathLimit
    `;

    const pathLimit = 1000; // Reasonable limit for path results

    const records = await connectionManager.executeRead<Record<string, unknown>>(
      query,
      {
        startUuid,
        pathLimit: neo4j.int(pathLimit),
      }
    );

    // Convert records to PathResult objects
    const paths: PathResult[] = [];
    const nodeSet = new Set<string>();
    let maxDepthReached = 0;

    records.forEach((record) => {
      const pathData = record['path_data'] as Record<string, unknown>;
      if (!pathData || typeof pathData !== 'object') {
        return;
      }

      // Extract nodes
      const nodesRaw = Array.isArray(pathData['nodes']) ? pathData['nodes'] : [];
      const nodeList: NodeRef[] = [];
      for (const n of nodesRaw) {
        if (!n || typeof n !== 'object') continue;
        const nodeObj = n as Record<string, unknown>;
        
        const rawProperties = typeof nodeObj['properties'] === 'object' && nodeObj['properties'] !== null
          ? (nodeObj['properties'] as Record<string, unknown>)
          : {};
        const labels = Array.isArray(nodeObj['labels']) ? (nodeObj['labels'] as string[]) : [];
        const ref = buildNodeRef(rawProperties, labels, nodeObj['uuid']);
        if (!ref.uuid) continue;
        nodeSet.add(ref.uuid);
        nodeList.push(ref);
      }
      const nodes = nodeList;

      // Extract edges
      const edgesRaw = Array.isArray(pathData['edges']) ? pathData['edges'] : [];
      const edgeList: EdgeRef[] = [];
      for (const e of edgesRaw) {
        if (!e || typeof e !== 'object') continue;
        const edgeObj = e as Record<string, unknown>;
        const sourceUuid = typeof edgeObj['source_uuid'] === 'string' ? edgeObj['source_uuid'] : '';
        const targetUuid = typeof edgeObj['target_uuid'] === 'string' ? edgeObj['target_uuid'] : '';
        const relType = typeof edgeObj['rel_type'] === 'string' ? edgeObj['rel_type'] : '';

        if (!sourceUuid || !targetUuid || !relType) {
          continue;
        }

        edgeList.push({
          source_uuid: sourceUuid,
          target_uuid: targetUuid,
          rel_type: relType,
          properties:
            typeof edgeObj['properties'] === 'object' && edgeObj['properties'] !== null
              ? (edgeObj['properties'] as Record<string, unknown>)
              : undefined,
        });
      }
      const edges = edgeList;

      const pathLength = typeof pathData['length'] === 'number' ? pathData['length'] : 0;
      maxDepthReached = Math.max(maxDepthReached, pathLength);

      paths.push({
        nodes,
        edges,
        length: pathLength,
        coordinate: undefined,
      });
    });

    const executionTime = Date.now() - startTime;

    return {
      start_uuid: startUuid,
      paths,
      total_paths: paths.length,
      total_nodes: nodeSet.size,
      max_depth_reached: maxDepthReached,
      execution_time_ms: executionTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Graph traversal failed from UUID "${startUuid}": ${errorMessage}`);
  }
}

/**
 * Traverse the graph following a sequence of real relationship types, hop by hop.
 *
 * Each step follows one relationship type from the entities reached at the
 * previous step. Relationship types are the graph's actual named/correspondential
 * types (e.g. FAMILY_CONTAINS, MANIFESTS, REFLECTS_AS) — call graph_schema to
 * discover them. The retired POSn_* scheme is NOT used.
 *
 * Example: rel_type_sequence ["FAMILY_CONTAINS", "MANIFESTS"] will:
 *   1. Find entities connected via FAMILY_CONTAINS from start
 *   2. From each result, find entities connected via MANIFESTS
 *
 * @param startUuid UUID of the starting node
 * @param relTypeSequence Relationship types to follow, one per step
 * @param maxPerPosition Maximum entities to return per step (default 10)
 * @returns GraphTraversePositionsOutput with entities organized by step
 * @throws Error if traversal fails or a rel type is not a valid identifier
 */
export async function traversePositions(
  startUuid: string,
  relTypeSequence: string[],
  maxPerPosition = 10
): Promise<GraphTraversePositionsOutput> {
  // Validate inputs
  if (!relTypeSequence || relTypeSequence.length === 0) {
    throw new Error('rel_type_sequence must contain at least one relationship type');
  }

  // Each rel type is interpolated into the per-hop Cypher, so validate it against
  // the identifier allowlist (injection guard) before use.
  relTypeSequence.forEach((t) => sanitizeIdentifier(t));

  if (maxPerPosition < 1 || maxPerPosition > 100) {
    throw new Error('max_per_position must be between 1 and 100');
  }

  const connectionManager = getNeo4jConnectionManager();
  if (!connectionManager.isConnected()) {
    throw new Error('Not connected to Neo4j');
  }

  try {
    const startTime = Date.now();

    // Start with the root node
    const startQuery = `
      MATCH (start:Bimba)
      WHERE start.c_2_uuid = $startUuid OR start.uuid = $startUuid
      RETURN {
        uuid: coalesce(start.c_2_uuid, start.uuid),
        labels: labels(start),
        properties: properties(start)
      } AS node
    `;

    const startRecords = await connectionManager.executeRead<Record<string, unknown>>(startQuery, {
      startUuid,
    });

    if (startRecords.length === 0) {
      throw new Error(`Start node with UUID "${startUuid}" not found`);
    }

    const startNode = startRecords[0]?.['node'] as Record<string, unknown>;
    const rawStartProps = typeof startNode?.['properties'] === 'object' ? (startNode.properties as Record<string, unknown>) : {};
    const startLabels = Array.isArray(startNode?.['labels']) ? (startNode.labels as string[]) : [];
    const startNodeRef: NodeRef = buildNodeRef(rawStartProps, startLabels, startNode?.['uuid'] ?? startUuid);

    // Build the traversal path by following the relationship-type sequence
    const steps: TraversalStep[] = [];
    const allFoundUuids = new Set<string>([startUuid]);
    let currentNodes: string[] = [startUuid];

    for (let i = 0; i < relTypeSequence.length; i++) {
      const relType = sanitizeIdentifier(relTypeSequence[i]!);

      // Query for nodes connected via this step's relationship type
      const posQuery = `
        UNWIND $nodeUuids AS current_uuid
        MATCH (current:Bimba)
        WHERE current.c_2_uuid = current_uuid OR current.uuid = current_uuid
        MATCH (current)-[rel:\`${relType}\`]->(next:Bimba)
        RETURN DISTINCT {
          uuid: coalesce(next.c_2_uuid, next.uuid),
          labels: labels(next),
          properties: properties(next)
        } AS node
        LIMIT $limit
      `;

      const posRecords = await connectionManager.executeRead<Record<string, unknown>>(posQuery, {
        nodeUuids: currentNodes,
        limit: neo4j.int(maxPerPosition),
      });

      // Convert records to NodeRef objects
      const positionNodes: NodeRef[] = [];
      const nextNodeUuids: string[] = [];

      for (const record of posRecords) {
        const nodeData = record['node'] as Record<string, unknown>;
        const rawProps = typeof nodeData?.['properties'] === 'object' ? (nodeData.properties as Record<string, unknown>) : {};
        const labels = Array.isArray(nodeData?.['labels']) ? (nodeData.labels as string[]) : [];
        const nodeRef = buildNodeRef(rawProps, labels, nodeData?.['uuid']);
        const uuid = nodeRef.uuid;

        if (uuid && !allFoundUuids.has(uuid)) {
          allFoundUuids.add(uuid);
          positionNodes.push(nodeRef);
          nextNodeUuids.push(uuid);
        }
      }

      // Record this step's results
      steps.push({
        rel_type: relType,
        entities: positionNodes,
        connection_count: currentNodes.length,
      });

      // Move to next step - only continue if we found entities here
      currentNodes = nextNodeUuids;
      if (currentNodes.length === 0) {
        break; // No more entities found, stop traversal
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      start_uuid: startUuid,
      start_node: startNodeRef,
      rel_type_sequence: relTypeSequence,
      steps,
      total_paths: steps.length,
      total_entities: allFoundUuids.size - 1, // Exclude start node
      execution_time_ms: executionTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Position-based traversal failed from UUID "${startUuid}": ${errorMessage}`);
  }
}

// =============================================================================
// Graph Context API
// =============================================================================

export interface ContextOptions {
  entityUuid: string;
  depth?: number;
  mode?: 'narrow' | 'balanced' | 'wide';
  positions?: number[];
}

/**
 * Gather context around an entity by retrieving its neighborhood
 *
 * Retrieves the entity and its neighbors up to a specified depth,
 * organized by position level. Supports three modes:
 * - narrow: 1-hop neighbors only
 * - balanced: 2-hop neighbors (default)
 * - wide: 3+ hop neighbors
 *
 * @param entityUuid UUID of the entity to contextualize
 * @param depth Maximum traversal depth (1-5, default 2)
 * @param mode Context breadth mode: narrow (1-hop), balanced (2-hop), wide (3+ hops)
 * @param positions Optional filter by position levels (0-5)
 * @returns ContextResult with entity, neighbors, paths, and position-organized connections
 * @throws Error if entity not found or query fails
 */
export async function context(
  entityUuid: string,
  depth = 2,
  mode: 'narrow' | 'balanced' | 'wide' = 'balanced',
  relTypes?: string[]
): Promise<ContextResult> {
  // Validate inputs
  if (depth < 1 || depth > 5) {
    throw new Error('depth must be between 1 and 5');
  }

  const connectionManager = getNeo4jConnectionManager();
  if (!connectionManager.isConnected()) {
    throw new Error('Not connected to Neo4j');
  }

  try {
    const startTime = Date.now();

    // Map mode to actual depth for traversal
    let traversalDepth = depth;
    if (mode === 'narrow') {
      traversalDepth = Math.min(depth, 1);
    } else if (mode === 'balanced') {
      traversalDepth = Math.min(depth, 2);
    } else {
      // wide mode uses full depth (3+)
      traversalDepth = Math.max(3, depth);
    }

    // Filter by ACTUAL relationship type (the rel that connects to the neighbor),
    // not by the retired POSn_* position scheme. $relTypes is a value param — no
    // injection surface.
    const relTypeFilter =
      relTypes && relTypes.length > 0
        ? 'AND type(relationships(path)[-1]) IN $relTypes'
        : '';

    // Query to get entity and its context from canonical :Bimba nodes
    const query = `
      MATCH path = (entity:Bimba)-[rel*1..${traversalDepth}]->(neighbor:Bimba)
      WHERE (entity.c_2_uuid = $entityUuid OR entity.uuid = $entityUuid)
      ${relTypeFilter}
      WITH entity, neighbor, path
      RETURN {
        entity: {uuid: coalesce(entity.c_2_uuid, entity.uuid), labels: labels(entity), properties: properties(entity)},
        neighbor: {uuid: coalesce(neighbor.c_2_uuid, neighbor.uuid), labels: labels(neighbor), properties: properties(neighbor)},
        path_data: {
          nodes: [n IN nodes(path) | {uuid: coalesce(n.c_2_uuid, n.uuid), labels: labels(n), properties: properties(n)}],
          edges: [e IN relationships(path) | {source_uuid: coalesce(startNode(e).c_2_uuid, startNode(e).uuid), target_uuid: coalesce(endNode(e).c_2_uuid, endNode(e).uuid), rel_type: type(e), properties: properties(e)}],
          length: length(path)
        },
        rel_type: type(relationships(path)[-1])
      } AS result
      LIMIT $resultLimit
    `;

    const resultLimit = 1000;

    const records = await connectionManager.executeRead<Record<string, unknown>>(
      query,
      {
        entityUuid,
        resultLimit: neo4j.int(resultLimit),
        relTypes: relTypes ?? [],
      }
    );

    // Process records to build context
    let entityNode: NodeRef | null = null;
    const neighborMap = new Map<string, NodeRef>();
    const pathList: PathResult[] = [];
    const edgeSet = new Set<string>();
    const neighborsByRelType = new Map<string, RelTypeConnections>();

    for (const record of records) {
      const result = record['result'] as Record<string, unknown>;
      if (!result || typeof result !== 'object') {
        continue;
      }

      // Extract entity
      if (!entityNode) {
        const entityData = result['entity'] as Record<string, unknown>;
        if (entityData && typeof entityData === 'object') {
          const rawProps = typeof entityData['properties'] === 'object' && entityData['properties'] !== null ? (entityData['properties'] as Record<string, unknown>) : {};
          const labels = Array.isArray(entityData['labels']) ? (entityData['labels'] as string[]) : [];
          entityNode = buildNodeRef(rawProps, labels, entityData['uuid']);
        }
      }

      // Extract neighbor
      const neighborData = result['neighbor'] as Record<string, unknown>;
      if (neighborData && typeof neighborData === 'object') {
        const rawProps = typeof neighborData['properties'] === 'object' && neighborData['properties'] !== null ? (neighborData['properties'] as Record<string, unknown>) : {};
        const labels = Array.isArray(neighborData['labels']) ? (neighborData['labels'] as string[]) : [];
        const neighborRef = buildNodeRef(rawProps, labels, neighborData['uuid']);
        const neighborUuid = neighborRef.uuid;

        if (neighborUuid && !neighborMap.has(neighborUuid)) {
          neighborMap.set(neighborUuid, neighborRef);
        }
      }

      // Extract path data
      const pathData = result['path_data'] as Record<string, unknown>;
      if (pathData && typeof pathData === 'object') {
        const nodesRaw = Array.isArray(pathData['nodes']) ? pathData['nodes'] : [];
        const nodeList: NodeRef[] = [];
        for (const n of nodesRaw) {
          if (!n || typeof n !== 'object') continue;
          const nodeObj = n as Record<string, unknown>;
          const rawProps = typeof nodeObj['properties'] === 'object' && nodeObj['properties'] !== null ? (nodeObj['properties'] as Record<string, unknown>) : {};
          const labels = Array.isArray(nodeObj['labels']) ? (nodeObj['labels'] as string[]) : [];
          const ref = buildNodeRef(rawProps, labels, nodeObj['uuid']);
          if (!ref.uuid) continue;
          nodeList.push(ref);
        }

        const edgesRaw = Array.isArray(pathData['edges']) ? pathData['edges'] : [];
        const edgeList: EdgeRef[] = [];
        for (const e of edgesRaw) {
          if (!e || typeof e !== 'object') continue;
          const edgeObj = e as Record<string, unknown>;
          const sourceUuid = typeof edgeObj['source_uuid'] === 'string' ? edgeObj['source_uuid'] : '';
          const targetUuid = typeof edgeObj['target_uuid'] === 'string' ? edgeObj['target_uuid'] : '';
          const relType = typeof edgeObj['rel_type'] === 'string' ? edgeObj['rel_type'] : '';

          if (!sourceUuid || !targetUuid || !relType) {
            continue;
          }

          const edgeKey = `${sourceUuid}-${targetUuid}-${relType}`;
          edgeSet.add(edgeKey);

          edgeList.push({
            source_uuid: sourceUuid,
            target_uuid: targetUuid,
            rel_type: relType,
            properties: typeof edgeObj['properties'] === 'object' && edgeObj['properties'] !== null ? (edgeObj['properties'] as Record<string, unknown>) : undefined,
          });
        }

        const pathLength = typeof pathData['length'] === 'number' ? pathData['length'] : 0;

        pathList.push({
          nodes: nodeList,
          edges: edgeList,
          length: pathLength,
        });
      }

      // Group neighbors by the ACTUAL relationship type connecting them.
      const relType = typeof result['rel_type'] === 'string' ? result['rel_type'] : '';
      const nodeUuidVal = typeof (result['neighbor'] as Record<string, unknown>)?.['uuid'] === 'string' ? ((result['neighbor'] as Record<string, unknown>)['uuid'] as string) : '';
      const neighbor = neighborMap.get(nodeUuidVal);

      if (neighbor && relType) {
        let bucket = neighborsByRelType.get(relType);
        if (!bucket) {
          bucket = { rel_type: relType, connections: [] };
          neighborsByRelType.set(relType, bucket);
        }
        bucket.connections.push({
          node: neighbor,
          rel_type: relType,
          properties: typeof result['properties'] === 'object' && result['properties'] !== null ? (result['properties'] as Record<string, unknown>) : undefined,
        });
      }
    }

    if (!entityNode) {
      throw new Error(`Entity with UUID "${entityUuid}" not found`);
    }

    // Build result
    const neighbors = Array.from(neighborMap.values());
    const relTypeConnections = Array.from(neighborsByRelType.values()).sort(
      (a, b) => b.connections.length - a.connections.length || a.rel_type.localeCompare(b.rel_type)
    );

    const executionTime = Date.now() - startTime;

    const result: ContextResult = {
      entity: entityNode,
      neighbors,
      paths: pathList,
      rel_type_connections: relTypeConnections,
      depth_used: traversalDepth,
      mode_used: mode,
      total_nodes: 1 + neighbors.length,
      total_edges: edgeSet.size,
      execution_time_ms: executionTime,
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Graph context retrieval failed for UUID "${entityUuid}": ${errorMessage}`);
  }
}

// =============================================================================
// Spec Retrieve API
// =============================================================================

export interface SpecRetrieveOptions {
  entityName: string;
  includeConnected?: boolean;
  maxConnectedPerPosition?: number;
}

/**
 * Retrieve the full specification of an entity
 *
 * @deprecated The live `spec_retrieve` MCP tool routes to the canon engine
 * adapter (`tools/spec-retrieve.ts` → `epi canon coord`), NOT this function.
 * This Neo4j-backed implementation is retained as an internal helper only; its
 * `connected_by_position` output is empty against the current named-relationship
 * graph (use `graph_context`/`graph_cypher` for connections).
 *
 * Returns comprehensive entity information including:
 * - UUID, title, file path
 * - QL coordinates (C, P, M, S, T, L)
 * - Position arrays (wiki-links by position)
 * - Content summary
 * - Connected entities organized by position
 *
 * @param entityName Entity title or UUID to look up
 * @param includeConnected Whether to traverse wiki-links (default: true)
 * @param maxConnectedPerPosition Max connected entities per position (default: 10)
 * @returns SpecResult with full entity specification
 * @throws Error if entity not found or query fails
 */
export async function spec(
  entityName: string,
  includeConnected = true,
  maxConnectedPerPosition = 10
): Promise<SpecResult> {
  // Validate inputs
  if (!entityName || entityName.trim().length === 0) {
    throw new Error('entity_name is required');
  }

  if (maxConnectedPerPosition < 1 || maxConnectedPerPosition > 100) {
    throw new Error('max_connected_per_position must be between 1 and 100');
  }

  const connectionManager = getNeo4jConnectionManager();
  if (!connectionManager.isConnected()) {
    throw new Error('Not connected to Neo4j');
  }

  try {
    const startTime = Date.now();

    // First, try to find the entity by UUID if it looks like one, otherwise by title
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityName);

    // Querying canonical :Bimba label
    const entityQuery = isUuid
      ? 'MATCH (entity:Bimba) WHERE entity.c_2_uuid = $entityName OR entity.uuid = $entityName RETURN entity'
      : 'MATCH (entity:Bimba) WHERE entity.c_1_name = $entityName OR entity.title = $entityName RETURN entity LIMIT 1';

    const entityRecords = await connectionManager.executeRead<Record<string, unknown>>(
      entityQuery,
      { entityName }
    );

    if (entityRecords.length === 0) {
      throw new Error(`Entity "${entityName}" not found`);
    }

    const entityData = entityRecords[0]?.['entity'];
    if (!entityData || typeof entityData !== 'object') {
      throw new Error(`Invalid entity data for "${entityName}"`);
    }

    const mappedEntity = mapNeo4jNode(entityData);
    if (!mappedEntity) {
      throw new Error(`Failed to map entity data for "${entityName}"`);
    }

    const uuid = mappedEntity.uuid;
    const title = typeof mappedEntity.properties['title'] === 'string' ? mappedEntity.properties['title'] : entityName;
    const filePath = mappedEntity.file_path;

    // Extract coordinates from properties
    const properties = mappedEntity.properties;

    // Derive the family + top-level position from the real `coordinate` string
    // (e.g. "M1-0" -> {M: 1}). Raw `C`/`P`/`M`/… numeric props do not exist on
    // live nodes; this reads the one authoritative coordinate field.
    const coordStr = typeof properties['coordinate'] === 'string' ? (properties['coordinate'] as string) : '';
    const headMatch = coordStr.match(/^([CPMSLT])(\d+)/);
    const coordinates: CoordinateSpec = {};
    if (headMatch && headMatch[1] && headMatch[2]) {
      coordinates[headMatch[1] as keyof CoordinateSpec] = parseInt(headMatch[2], 10);
    }

    // Extract content summary (use description/c_1_description if available, otherwise truncate content/c_5_content)
    const contentSummary =
      typeof properties['c_1_description'] === 'string'
        ? properties['c_1_description']
        : typeof properties['description'] === 'string'
          ? properties['description']
          : typeof properties['c_5_content'] === 'string'
            ? (properties['c_5_content'] as string).substring(0, 500)
            : typeof properties['content'] === 'string'
              ? (properties['content'] as string).substring(0, 500)
              : title;

    // Extract position arrays
    const positionArrays: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (key.match(/^p\d+_/) && Array.isArray(value)) {
        positionArrays[key] = value as string[];
      }
    }

    // If include_connected is false, return early
    if (!includeConnected) {
      const result: SpecResult = {
        uuid,
        title,
        file_path: filePath,
        coordinates,
        position_arrays: Object.keys(positionArrays).length > 0 ? positionArrays : undefined,
        content_summary: contentSummary,
        connected_by_position: [],
        total_connected: 0,
        execution_time_ms: Date.now() - startTime,
      };
      return result;
    }

    // Query for connected entities (neighbors up to 2 hops) using canonical :Bimba label
    const connectedQuery = `
      MATCH path = (entity:Bimba)-[rel*1..2]->(neighbor:Bimba)
      WHERE entity.c_2_uuid = $uuid OR entity.uuid = $uuid
      WITH entity, neighbor, path, relationships(path)[-1] AS lastRel
      RETURN {
        neighbor: {uuid: coalesce(neighbor.c_2_uuid, neighbor.uuid), labels: labels(neighbor), properties: properties(neighbor)},
        rel_type: type(lastRel),
        properties: properties(lastRel)
      } AS result
      LIMIT $resultLimit
    `;

    const resultLimit = maxConnectedPerPosition * 6; // rough upper bound for all positions
    const connectedRecords = await connectionManager.executeRead<Record<string, unknown>>(
      connectedQuery,
      {
        uuid,
        resultLimit: neo4j.int(resultLimit),
      }
    );

    // Process connected entities and organize by position
    const connectedByPositionMap = new Map<number, PositionConnectedEntities>();
    const positionLabels: Record<number, 'grounds' | 'definitions' | 'operations' | 'patterns' | 'contexts' | 'integrations'> = {
      0: 'grounds',
      1: 'definitions',
      2: 'operations',
      3: 'patterns',
      4: 'contexts',
      5: 'integrations',
    };

    let totalConnected = 0;

    for (const record of connectedRecords) {
      const result = record['result'] as Record<string, unknown>;
      if (!result || typeof result !== 'object') {
        continue;
      }

      const neighborData = result['neighbor'] as Record<string, unknown>;
      const relType = typeof result['rel_type'] === 'string' ? result['rel_type'] : '';

      if (!neighborData || typeof neighborData !== 'object' || !relType) {
        continue;
      }

      // Extract position from rel_type (e.g., POS0_LINKS_TO -> position 0)
      const posMatch = relType.match(/POS(\d+)_/);
      const posNumberStr = posMatch ? posMatch[1] : undefined;
      const posNumber = posNumberStr ? parseInt(posNumberStr, 10) : -1;

      if (posNumber < 0 || posNumber > 5) {
        continue;
      }

      // Get label for this position (validated by range check above)
      const label = positionLabels[posNumber];
      if (!label) {
        continue;
      }

      // Initialize position group if needed
      if (!connectedByPositionMap.has(posNumber)) {
        connectedByPositionMap.set(posNumber, {
          position: posNumber,
          label,
          entities: [],
        });
      }

      const posGroup = connectedByPositionMap.get(posNumber);
      if (posGroup && posGroup.entities.length < maxConnectedPerPosition) {
        const mappedNeighbor = mapNeo4jNode(neighborData);
        if (!mappedNeighbor) continue;

        const connectedEntity: ConnectedEntity = {
          node: mappedNeighbor,
          rel_type: relType,
          properties: typeof result['properties'] === 'object' && result['properties'] !== null
            ? (result['properties'] as Record<string, unknown>)
            : undefined,
        };

        posGroup.entities.push(connectedEntity);
        totalConnected++;
      }
    }

    // Build final result
    const connectedByPosition = Array.from(connectedByPositionMap.values()).sort((a, b) => a.position - b.position);

    const result: SpecResult = {
      uuid,
      title,
      file_path: filePath,
      coordinates,
      position_arrays: Object.keys(positionArrays).length > 0 ? positionArrays : undefined,
      content_summary: contentSummary,
      connected_by_position: connectedByPosition,
      total_connected: totalConnected,
      execution_time_ms: Date.now() - startTime,
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Spec retrieval failed for entity "${entityName}": ${errorMessage}`);
  }
}

// =============================================================================
// Hybrid Search (Vector + Graph)
// =============================================================================

export interface SearchOptions {
  query: string;
  topK?: number;
  coordinates?: CoordinateFilter;
  mode?: 'vector_only' | 'graph_only' | 'hybrid_rrf' | 'hybrid_weighted';
}

/**
 * Build coordinate filter condition for Neo4j query
 *
 * Converts CoordinateFilter (with C, P, M, S, T, L levels and is_prime flags) into a Cypher WHERE condition.
 * Filters by coordinate prefix based on specified levels and respects prime marker for Bimba/Pratibimba aspect.
 *
 * Semantic meaning:
 * - Unprime (default): Bimba aspect - canonical, original, source
 * - Prime ('): Pratibimba aspect - reflected, instanced, operational
 *
 * @param coordinates CoordinateFilter with type-level mappings and optional is_prime flags
 * @returns Cypher condition string
 */
function buildCoordinateFilterCondition(coordinates: CoordinateFilter | undefined): string {
  if (!coordinates) return '';

  const types = ['C', 'P', 'M', 'S', 'T', 'L'] as const;
  const conditions: string[] = [];

  for (const type of types) {
    const level = coordinates[type];
    const isPrimeKey = `${type}_is_prime` as const;
    const isPrimeFilter = coordinates[isPrimeKey];

    if (level && level > 0) {
      // Base coordinate filter by type and level (e.g., M4 includes M4, M4-*, M4.*)
      let coordCondition = `node.coordinate STARTS WITH '${type}${level}'`;

      // Add prime marker filter if specified
      if (isPrimeFilter !== undefined) {
        if (isPrimeFilter) {
          // Filter for prime (Pratibimba) coordinates - must end with '
          coordCondition += ` AND node.coordinate ENDS WITH "'"`;
        } else {
          // Filter for unprime (Bimba) coordinates - must NOT end with '
          coordCondition += ` AND NOT (node.coordinate ENDS WITH "'")`;
        }
      }

      conditions.push(coordCondition);
    }
  }

  if (conditions.length === 0) return '';
  return `(${conditions.join(' OR ')})`;
}

/**
 * Perform graph-based search using Neo4j graph structure
 *
 * Scores nodes based on their position and relationships in the graph.
 * Closer nodes and central nodes get higher scores.
 *
 * @param query Search query text (used for keyword matching in node properties)
 * @param topK Number of top results to return
 * @param connectionManager Neo4j connection manager
 * @param coordinateFilterCondition Cypher WHERE clause for coordinate filtering
 * @returns Array of nodes with graph scores
 */
async function performGraphSearch(
  query: string,
  topK: number,
  connectionManager: ReturnType<typeof getNeo4jConnectionManager>,
  coordinateFilterCondition: string
): Promise<Array<{ node: NodeRef; score: number }>> {
  // Convert query to lowercase for keyword matching
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter((k) => k.length > 0);

  // Query nodes and count relationships (degree) for scoring
  const graphQuery = `
    MATCH (node:Bimba)
    ${coordinateFilterCondition ? `WHERE ${coordinateFilterCondition}` : ''}
    WITH node, COUNT { (node)--() } AS degree
    RETURN {
      node: {uuid: coalesce(node.c_2_uuid, node.uuid), labels: labels(node), properties: properties(node)},
      degree: degree
    } AS result
    ORDER BY degree DESC
    LIMIT ${topK * 3}
  `;

  const records = await connectionManager.executeRead<Record<string, unknown>>(graphQuery, {});

  // Convert records to nodes with graph scores based on degree
  const maxDegree = Math.max(1, records.length > 0 && typeof (records[0]?.['result'] as Record<string, unknown>)?.['degree'] === 'number' ? ((records[0]?.['result'] as Record<string, unknown>)?.['degree'] as number) : 1);

  const results: Array<{ node: NodeRef; score: number }> = [];

  for (const record of records) {
    const result = record['result'] as Record<string, unknown>;
    if (!result || typeof result !== 'object') continue;

    const nodeData = result['node'] as Record<string, unknown>;
    if (!nodeData || typeof nodeData !== 'object') continue;

    const degree = typeof result['degree'] === 'number' ? result['degree'] : 0;
    const degreeScore = Math.min(1.0, degree / maxDegree);

    const mapped = mapNeo4jNode(nodeData);
    if (!mapped) continue;

    // Also check if query keywords appear in node title or description
    const title = typeof mapped.properties['title'] === 'string'
      ? mapped.properties['title'].toLowerCase()
      : '';

    const keywordMatch = keywords.some((k) => title.includes(k)) ? 0.2 : 0;

    results.push({
      node: mapped,
      score: Math.min(1.0, degreeScore + keywordMatch),
    });
  }

  return results;
}

/**
 * Perform chunk-aware search that includes both documents and chunks
 *
 * Searches across both Position nodes (documents) and Chunk nodes,
 * with chunks ranked by contextualized embedding similarity.
 * Supports expanding chunks to include parent document info.
 */
async function performChunkAwareSearch(
  query: string,
  topK: number,
  connectionManager: ReturnType<typeof getNeo4jConnectionManager>,
  coordinateFilterCondition: string,
  expandToParent: boolean
): Promise<Array<{ node: NodeRef; score: number; isChunk?: boolean; chunkMetadata?: Record<string, unknown> }>> {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter((k) => k.length > 0);

  // Query both Bimba nodes and Chunk nodes
  const graphQuery = `
    MATCH (node)
    WHERE (node:Bimba OR node:Chunk)
    ${coordinateFilterCondition ? `AND ${coordinateFilterCondition}` : ''}
    WITH node, COUNT { (node)--() } AS degree, labels(node) AS nodeLabels
    RETURN {
      node: {uuid: coalesce(node.c_2_uuid, node.uuid), labels: nodeLabels, properties: properties(node)},
      degree: degree,
      nodeLabels: nodeLabels
    } AS result
    ORDER BY degree DESC
    LIMIT ${topK * 5}
  `;

  const records = await connectionManager.executeRead<Record<string, unknown>>(graphQuery, {});

  // Convert records to nodes with scores
  const maxDegree = Math.max(1, records.length > 0 && typeof (records[0]?.['result'] as Record<string, unknown>)?.['degree'] === 'number' ? ((records[0]?.['result'] as Record<string, unknown>)?.['degree'] as number) : 1);

  const results: Array<{ node: NodeRef; score: number; isChunk?: boolean; chunkMetadata?: Record<string, unknown> }> = [];

  for (const record of records) {
    const result = record['result'] as Record<string, unknown>;
    if (!result || typeof result !== 'object') continue;

    const nodeData = result['node'] as Record<string, unknown>;
    const nodeLabels = result['nodeLabels'] as string[];
    if (!nodeData || typeof nodeData !== 'object') continue;

    const mapped = mapNeo4jNode(nodeData);
    if (!mapped) continue;

    const isChunk = nodeLabels?.includes('Chunk');
    const degree = typeof result['degree'] === 'number' ? result['degree'] : 0;
    const degreeScore = Math.min(1.0, degree / maxDegree);

    // Check keyword match in node content/title
    const title = typeof mapped.properties['title'] === 'string'
      ? mapped.properties['title'].toLowerCase()
      : '';

    const content = typeof mapped.properties['raw_content'] === 'string'
      ? mapped.properties['raw_content'].toLowerCase()
      : typeof mapped.properties['content'] === 'string'
        ? mapped.properties['content'].toLowerCase()
        : '';

    const keywordMatch = keywords.some((k) => title.includes(k) || content.includes(k)) ? 0.2 : 0;

    // Boost chunk scores slightly for better contextualized results
    let score = Math.min(1.0, degreeScore + keywordMatch);
    if (isChunk) {
      score = Math.min(1.0, score * 1.1); // Slight boost for chunks
    }

    const uuid = mapped.uuid;
    const labels = mapped.labels;
    const properties = mapped.properties;

    const chunkMetadata = isChunk ? {
      chunk_uuid: uuid,
      parent_uuid: typeof properties['parent_uuid'] === 'string' ? properties['parent_uuid'] : undefined,
      sequence_num: typeof properties['sequence_num'] === 'number' ? properties['sequence_num'] : undefined,
      raw_content: typeof properties['raw_content'] === 'string' ? properties['raw_content'] : undefined,
    } : undefined;

    results.push({
      node: { uuid, labels, properties },
      score,
      isChunk,
      chunkMetadata,
    });
  }

  // If expand_to_parent is true, fetch parent document info for chunks
  if (expandToParent && results.some(r => r.isChunk)) {
    for (const result of results) {
      if (result.isChunk && result.chunkMetadata?.parent_uuid) {
        const parentQuery = `
          MATCH (parent:Bimba)
          WHERE parent.c_2_uuid = $parentUuid OR parent.uuid = $parentUuid
          OPTIONAL MATCH (parent)-[r:CONTAINS]->(chunk {uuid: $chunkUuid})
          OPTIONAL MATCH (parent)-[r:CONTAINS]->(prevChunk:Chunk)
            WHERE prevChunk.sequence_num = $sequenceNum - 1
          OPTIONAL MATCH (parent)-[r:CONTAINS]->(nextChunk:Chunk)
            WHERE nextChunk.sequence_num = $sequenceNum + 1
          RETURN {
            parent: {
              uuid: coalesce(parent.c_2_uuid, parent.uuid),
              title: coalesce(parent.c_1_name, parent.title, parent.name),
              file_path: coalesce(parent.s_1_vault_path, parent.file_path)
            },
            prevChunk: {
              uuid: coalesce(prevChunk.uuid, prevChunk.c_2_uuid),
              sequence_num: prevChunk.sequence_num,
              raw_content: prevChunk.raw_content
            },
            nextChunk: {
              uuid: coalesce(nextChunk.uuid, nextChunk.c_2_uuid),
              sequence_num: nextChunk.sequence_num,
              raw_content: nextChunk.raw_content
            }
          } AS expandedData
        `;

        const expandedRecords = await connectionManager.executeRead<Record<string, unknown>>(
          parentQuery,
          {
            parentUuid: result.chunkMetadata.parent_uuid,
            chunkUuid: result.chunkMetadata.chunk_uuid,
            sequenceNum: result.chunkMetadata.sequence_num,
          }
        );

        if (expandedRecords.length > 0) {
          const expandedData = expandedRecords[0]?.['expandedData'] as Record<string, unknown>;
          if (expandedData) {
            const parent = expandedData['parent'] as Record<string, unknown>;
            result.chunkMetadata.parent_title = typeof parent?.['title'] === 'string' ? parent['title'] : undefined;
            result.chunkMetadata.parent_path = typeof parent?.['file_path'] === 'string' ? parent['file_path'] : undefined;

            const prevChunk = expandedData['prevChunk'] as Record<string, unknown>;
            const nextChunk = expandedData['nextChunk'] as Record<string, unknown>;

            if (prevChunk?.['uuid'] || nextChunk?.['uuid']) {
              result.chunkMetadata.surrounding_chunks = {
                prev_chunk: prevChunk?.['uuid'] ? {
                  uuid: prevChunk['uuid'] as string,
                  sequence_num: prevChunk['sequence_num'] as number,
                  content: prevChunk['raw_content'] as string,
                } : undefined,
                next_chunk: nextChunk?.['uuid'] ? {
                  uuid: nextChunk['uuid'] as string,
                  sequence_num: nextChunk['sequence_num'] as number,
                  content: nextChunk['raw_content'] as string,
                } : undefined,
              };
            }
          }
        }
      }
    }
  }

  return results;
}

/**
 * Perform hybrid search combining vector and graph methods
 *
 * Supports multiple search modes:
 * - vector_only: Vector similarity only
 * - graph_only: Graph structure only
 * - hybrid_rrf: Reciprocal Rank Fusion combining both methods
 * - hybrid_weighted: Weighted average of both methods
 *
 * Can optionally search chunks and expand chunk results to include parent document info.
 *
 * @param query Natural language search query
 * @param topK Number of top results to return (1-100)
 * @param coordinates Optional coordinate filter
 * @param mode Search mode (default: hybrid_rrf)
 * @param searchChunks Include chunk nodes in search (default true)
 * @param expandToParent For chunks, include parent document info and surrounding chunks (default false)
 * @returns GraphSearchOutput with ranked retrieval results
 * @throws Error if query fails or connection unavailable
 */
/**
 * True vector similarity search against the canonical `coord_embedding` index
 * (:Bimba.c_5_embedding, 3072-dim cosine). Embeds the query with the same Gemini
 * client used for writes, then queries the native Neo4j vector index.
 *
 * Throws if the embedding API/index is unavailable — callers in hybrid mode catch
 * and degrade to graph ranking; vector_only surfaces the error.
 */
async function performVectorSearch(
  query: string,
  topK: number,
  connectionManager: ReturnType<typeof getNeo4jConnectionManager>
): Promise<Array<{ node: NodeRef; score: number }>> {
  const client = new GeminiEmbeddingClient();
  // The coord_embedding index is 3072-dim; embed the query at full resolution.
  const queryVector = await client.embedText(query, 'SEMANTIC_SIMILARITY', 3072);

  const records = await connectionManager.executeRead<Record<string, unknown>>(
    `CALL db.index.vector.queryNodes('coord_embedding', $k, $vec) YIELD node, score
     RETURN {uuid: coalesce(node.c_2_uuid, node.uuid), labels: labels(node), properties: properties(node)} AS node, score`,
    { k: neo4j.int(topK), vec: queryVector }
  );

  const out: Array<{ node: NodeRef; score: number }> = [];
  for (const rec of records) {
    const mapped = mapNeo4jNode(rec['node']);
    if (mapped) {
      out.push({ node: mapped, score: typeof rec['score'] === 'number' ? rec['score'] : Number(rec['score'] ?? 0) });
    }
  }
  return out;
}

/** Reciprocal-rank-fusion merge of vector and graph result lists (k=60). */
function rrfMerge(
  vec: Array<{ node: NodeRef; score: number }>,
  graph: Array<{ node: NodeRef; score: number }>,
  topK: number,
  k = 60
): RetrievalResult[] {
  const merged = new Map<string, { node: NodeRef; rrf: number; vector_score?: number; graph_score?: number }>();
  const add = (list: Array<{ node: NodeRef; score: number }>, kind: 'vector' | 'graph') => {
    list.forEach((r, i) => {
      const key = r.node.uuid || `${kind}:${i}`;
      const e = merged.get(key) ?? { node: r.node, rrf: 0 };
      e.rrf += 1 / (k + i + 1);
      if (kind === 'vector') e.vector_score = r.score;
      else e.graph_score = r.score;
      merged.set(key, e);
    });
  };
  add(vec, 'vector');
  add(graph, 'graph');
  return Array.from(merged.values())
    .sort((a, b) => b.rrf - a.rrf)
    .slice(0, topK)
    .map((e, idx) => ({
      node: e.node,
      score: e.rrf,
      vector_score: e.vector_score,
      graph_score: e.graph_score,
      rank_position: idx,
      match_context: `Hybrid RRF (vector ${e.vector_score !== undefined ? '✓' : '✗'} + graph ${e.graph_score !== undefined ? '✓' : '✗'})`,
    }));
}

export async function search(
  query: string,
  topK = 10,
  coordinates?: CoordinateFilter,
  mode: 'vector_only' | 'graph_only' | 'hybrid_rrf' | 'hybrid_weighted' = 'hybrid_rrf',
  searchChunks = true,
  expandToParent = false
): Promise<GraphSearchOutput> {
  // Validate inputs
  if (!query || query.trim().length === 0) {
    throw new Error('query is required');
  }

  if (topK < 1 || topK > 100) {
    throw new Error('top_k must be between 1 and 100');
  }

  const connectionManager = getNeo4jConnectionManager();
  if (!connectionManager.isConnected()) {
    throw new Error('Not connected to Neo4j');
  }

  try {
    const startTime = Date.now();

    // Build coordinate filter condition
    const coordinateFilterCondition = buildCoordinateFilterCondition(coordinates);

    let results: RetrievalResult[] = [];
    const queryEmbedding: number[] | undefined = undefined;

    const wantsGraph = mode === 'graph_only' || mode === 'hybrid_rrf' || mode === 'hybrid_weighted';
    const wantsVector = mode === 'vector_only' || mode === 'hybrid_rrf' || mode === 'hybrid_weighted';

    // Map a graph-structure result (degree + keyword), preserving chunk fields.
    const toGraphRetrieval = (
      r: { node: NodeRef; score: number; isChunk?: boolean; chunkMetadata?: Record<string, unknown> },
      idx: number
    ): RetrievalResult => {
      const result: RetrievalResult = {
        node: r.node,
        score: r.score,
        graph_score: r.score,
        rank_position: idx,
        match_context: `Graph-structure match (degree score ${(r.score * 100).toFixed(1)}%)`,
      };
      if (r.isChunk && r.chunkMetadata) {
        result.chunk_uuid = r.chunkMetadata.chunk_uuid as string;
        result.parent_uuid = r.chunkMetadata.parent_uuid as string;
        result.sequence_num = r.chunkMetadata.sequence_num as number;
        result.chunk_content = r.chunkMetadata.raw_content as string;
        if (expandToParent) {
          result.parent_title = r.chunkMetadata.parent_title as string;
          result.parent_path = r.chunkMetadata.parent_path as string;
          if (r.chunkMetadata.surrounding_chunks) {
            result.surrounding_chunks = r.chunkMetadata.surrounding_chunks as { prev_chunk?: { uuid: string; sequence_num: number; content: string }; next_chunk?: { uuid: string; sequence_num: number; content: string } };
          }
        }
      }
      return result;
    };

    // Graph-structure results (degree + keyword), optionally chunk-aware.
    let graphResults: Array<{ node: NodeRef; score: number; isChunk?: boolean; chunkMetadata?: Record<string, unknown> }> = [];
    if (wantsGraph) {
      graphResults = searchChunks
        ? await performChunkAwareSearch(query, topK, connectionManager, coordinateFilterCondition, expandToParent)
        : (await performGraphSearch(query, topK, connectionManager, coordinateFilterCondition)).map(r => ({ node: r.node, score: r.score }));
    }

    // True vector similarity against the coord_embedding index (c_5_embedding).
    let vectorResults: Array<{ node: NodeRef; score: number }> = [];
    if (wantsVector) {
      if (mode === 'vector_only') {
        // Pure vector mode surfaces config/index errors to the caller.
        vectorResults = await performVectorSearch(query, topK, connectionManager);
      } else {
        try {
          vectorResults = await performVectorSearch(query, topK, connectionManager);
        } catch (err) {
          console.error('[graph_search] vector path unavailable, using graph ranking only:', err instanceof Error ? err.message : err);
        }
      }
    }

    if (mode === 'graph_only') {
      results = graphResults.map(toGraphRetrieval);
    } else if (mode === 'vector_only') {
      results = vectorResults.map((r, idx) => ({
        node: r.node,
        score: r.score,
        vector_score: r.score,
        rank_position: idx,
        match_context: `Vector similarity (cosine ${r.score.toFixed(3)})`,
      }));
    } else {
      results = rrfMerge(vectorResults, graphResults, topK);
    }

    // Sort by score and limit to topK
    results.sort((a, b) => b.score - a.score);
    results = results.slice(0, topK);

    // Update rank positions
    results.forEach((r, idx) => {
      r.rank_position = idx;
    });

    const executionTime = Date.now() - startTime;

    const result: GraphSearchOutput = {
      results,
      total_results: results.length,
      query_embedding: queryEmbedding,
      search_mode_used: mode,
      coordinate_filter_applied: coordinates,
      execution_time_ms: executionTime,
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Graph search failed for query "${query}": ${errorMessage}`);
  }
}

// =============================================================================
// Reranking API
// =============================================================================

/**
 * Rerank retrieved results for improved precision using cross-encoder models
 *
 * Implements the pattern: Retrieve N=50-100 → Rerank to K=5-10
 * Improves precision by applying a cross-encoder model to candidate list
 * and re-scoring based on semantic relevance to the original query.
 *
 * Supports multiple models with automatic fallback:
 * - Primary: mxbai-rerank-large-v2 (Apache 2.0, high accuracy)
 * - Fallback: FlashRank (CPU-friendly, low-latency)
 *
 * @param query Original search query
 * @param candidates Retrieved candidates (typically 50-100 results)
 * @param top_k Number of top results to return (typically 5-10)
 * @param model Which reranking model to use
 * @param use_cache Whether to cache results for repeated queries
 * @returns Promise of reranked results with improved precision
 * @throws Error if reranking fails
 */
export async function rerank(
  query: string,
  candidates: RetrievalResult[],
  top_k: number = 10,
  model: 'mxbai-rerank-large-v2' | 'flashrank' = 'mxbai-rerank-large-v2',
  _use_cache: boolean = true
): Promise<{
  results: Array<RetrievalResult & { original_score: number; rerank_score: number; combined_score: number }>;
  total_results: number;
  model_used: 'mxbai-rerank-large-v2' | 'flashrank';
  cache_hit: boolean;
  execution_time_ms: number;
}> {
  // Validate inputs
  if (!query || query.trim().length === 0) {
    throw new Error('query is required');
  }

  if (candidates.length === 0) {
    return {
      results: [],
      total_results: 0,
      model_used: model,
      cache_hit: false,
      execution_time_ms: 0,
    };
  }

  if (top_k < 1 || top_k > candidates.length) {
    throw new Error(`top_k must be between 1 and ${candidates.length}`);
  }

  try {
    const startTime = Date.now();

    // Import reranker module
    const { rerank: rerankCandidates } = await import('../reranking/reranker.js');

    // Perform reranking (note: use_cache is handled internally by the reranker module)
    const rankedResults = await rerankCandidates(query, candidates, top_k);

    const executionTime = Date.now() - startTime;

    const result = {
      results: rankedResults,
      total_results: rankedResults.length,
      model_used: model,
      cache_hit: false,
      execution_time_ms: executionTime,
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Reranking failed: ${errorMessage}`);
  }
}

// =============================================================================
// Progressive Disclosure API
// =============================================================================

/**
 * Provide progressive disclosure of entity information
 *
 * Returns information appropriate to the disclosure level, progressively
 * revealing more details as the level increases:
 *
 * - Level 0: uuid, title only (minimal identification)
 * - Level 1: + file_path, coordinates
 * - Level 2: + position_arrays, modes
 * - Level 3: + content_summary
 * - Level 4: + connected_entities (organized by position)
 * - Level 5: + full_context (complete information with depth layers)
 *
 * @param entityUuid UUID of the entity to disclose
 * @param level Disclosure level (0-5, default 0)
 * @returns DisclosureResult with progressively revealed information
 * @throws Error if entity not found or query fails
 */
export async function disclosure(
  entityUuid: string,
  level = 0
): Promise<DisclosureResult> {
  // Validate and clamp level to 0-5
  const clampedLevel = Math.max(0, Math.min(level, 5));

  const connectionManager = getNeo4jConnectionManager();
  if (!connectionManager.isConnected()) {
    throw new Error('Not connected to Neo4j');
  }

  try {
    const startTime = Date.now();

    // Query for the entity
    const entityQuery = `
      MATCH (n:Bimba)
      WHERE n.c_2_uuid = $uuid OR n.uuid = $uuid
      RETURN n
    `;

    const entityRecords = await connectionManager.executeRead<Record<string, unknown>>(
      entityQuery,
      { uuid: entityUuid }
    );

    if (entityRecords.length === 0) {
      return {
        entity_uuid: entityUuid,
        level: clampedLevel,
        max_level: 5,
        disclosed: { error: 'Entity not found' },
        retrieval_time_ms: Date.now() - startTime,
      };
    }

    const firstRecord = entityRecords[0];
    if (!firstRecord) {
      return {
        entity_uuid: entityUuid,
        level: clampedLevel,
        max_level: 5,
        disclosed: { error: 'Entity not found' },
        retrieval_time_ms: Date.now() - startTime,
      };
    }

    const nodeData = firstRecord['n'];
    if (!nodeData || typeof nodeData !== 'object') {
      return {
        entity_uuid: entityUuid,
        level: clampedLevel,
        max_level: 5,
        disclosed: { error: 'Invalid entity data' },
        retrieval_time_ms: Date.now() - startTime,
      };
    }

    const mapped = mapNeo4jNode(nodeData);
    if (!mapped) {
      return {
        entity_uuid: entityUuid,
        level: clampedLevel,
        max_level: 5,
        disclosed: { error: 'Invalid entity data' },
        retrieval_time_ms: Date.now() - startTime,
      };
    }

    const uuid = mapped.uuid;
    const title = typeof mapped.properties['title'] === 'string' ? mapped.properties['title'] : 'Untitled';
    const filePath = mapped.file_path;
    const coordinate = typeof mapped.properties['coordinate'] === 'string' ? mapped.properties['coordinate'] : undefined;
    const content = typeof mapped.properties['c_5_content'] === 'string' ? mapped.properties['c_5_content'] : (typeof mapped.properties['content'] === 'string' ? mapped.properties['content'] : '');
    const properties = mapped.properties;

    // Build disclosed information based on level
    const disclosed: Record<string, unknown> = {};

    // Level 0: Minimal identification
    disclosed['uuid'] = uuid;
    disclosed['title'] = title;

    // Level 1: Basic info + location + coordinates
    if (clampedLevel >= 1) {
      disclosed['file_path'] = filePath;
      if (coordinate) {
        disclosed['coordinates'] = coordinate;
      }
    }

    // Level 2: Standard + position arrays and modes
    if (clampedLevel >= 2) {
      // Extract position arrays (p0_*, p1_*, etc.)
      const positionArrays: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(properties)) {
        if (key.match(/^p\d+_/)) {
          positionArrays[key] = value;
        }
      }
      if (Object.keys(positionArrays).length > 0) {
        disclosed['position_arrays'] = positionArrays;
      }

      // Extract modes (m_mode, t_mode, l_mode if they exist)
      const modes: Record<string, unknown> = {};
      if (properties['m_mode'] !== undefined) {
        modes['M'] = properties['m_mode'];
      }
      if (properties['t_mode'] !== undefined) {
        modes['T'] = properties['t_mode'];
      }
      if (properties['l_mode'] !== undefined) {
        modes['L'] = properties['l_mode'];
      }
      if (Object.keys(modes).length > 0) {
        disclosed['modes'] = modes;
      }
    }

    // Level 3: Full + content summary
    if (clampedLevel >= 3) {
      if (content) {
        const contentSummaryLength = 500;
        disclosed['content_summary'] = content.length > contentSummaryLength
          ? content.substring(0, contentSummaryLength) + '...'
          : content;
      }
    }

    // Level 4: Extended + connected entities grouped by ACTUAL relationship type
    if (clampedLevel >= 4) {
      const connectedEntities = await getConnectedEntitiesByRelType(entityUuid, connectionManager, 5);
      if (Object.keys(connectedEntities).length > 0) {
        disclosed['connected_entities'] = connectedEntities;
      }
    }

    // Level 5: Complete + full context
    if (clampedLevel >= 5) {
      const contextInfo = await getFullContext(
        entityUuid,
        connectionManager
      );
      if (contextInfo) {
        disclosed['full_context'] = contextInfo;
      }
    }

    // Determine next level preview
    let nextLevelPreview: string | undefined;
    if (clampedLevel < 5) {
      const disclosureLevelNames = [
        'minimal (uuid, title)',
        'basic (+ file_path, coordinates)',
        'standard (+ position_arrays, modes)',
        'full (+ content_summary)',
        'extended (+ connected_entities)',
        'complete (+ full_context)'
      ];
      nextLevelPreview = `Next level adds: ${disclosureLevelNames[clampedLevel + 1]}`;
    }

    const result: DisclosureResult = {
      entity_uuid: uuid,
      level: clampedLevel,
      max_level: 5,
      disclosed,
      next_level_preview: nextLevelPreview,
      retrieval_time_ms: Date.now() - startTime,
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Progressive disclosure failed for entity "${entityUuid}": ${errorMessage}`);
  }
}

/**
 * Helper: Get connected entities grouped by ACTUAL relationship type.
 * Returns { [relType]: [{uuid, title}, ...] } capped at `limit` per type.
 */
async function getConnectedEntitiesByRelType(
  entityUuid: string,
  connectionManager: ReturnType<typeof getNeo4jConnectionManager>,
  limit: number
): Promise<Record<string, Array<{ uuid: string; title: string }>>> {
  try {
    const query = `
      MATCH (entity:Bimba)-[rel]-(connected:Bimba)
      WHERE entity.c_2_uuid = $uuid OR entity.uuid = $uuid
      WITH type(rel) AS rel_type, collect(DISTINCT {
        uuid: coalesce(connected.c_2_uuid, connected.uuid),
        title: coalesce(connected.c_1_name, connected.c_1_primary_designation, connected.title, connected.name, 'Untitled')
      }) AS ents
      RETURN rel_type, ents[0..$limit] AS entities
    `;

    const records = await connectionManager.executeRead<Record<string, unknown>>(
      query,
      { uuid: entityUuid, limit: neo4j.int(limit) }
    );

    const out: Record<string, Array<{ uuid: string; title: string }>> = {};
    for (const record of records) {
      const relType = typeof record['rel_type'] === 'string' ? record['rel_type'] : '';
      const entitiesRaw = Array.isArray(record['entities']) ? record['entities'] : [];
      const entities = entitiesRaw
        .map((e) => {
          const obj = (e ?? {}) as Record<string, unknown>;
          return {
            uuid: typeof obj['uuid'] === 'string' ? obj['uuid'] : '',
            title: typeof obj['title'] === 'string' ? obj['title'] : 'Untitled',
          };
        })
        .filter((item) => item.uuid.length > 0);
      if (relType && entities.length > 0) out[relType] = entities;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Helper: Get full context with depth layers
 */
async function getFullContext(
  entityUuid: string,
  connectionManager: ReturnType<typeof getNeo4jConnectionManager>
): Promise<Record<string, unknown> | undefined> {
  try {
    // Query for entities within 2 hops
    const query = `
      MATCH path = (start:Bimba)-[rel*1..2]-(target:Bimba)
      WHERE start.c_2_uuid = $uuid OR start.uuid = $uuid
      WITH target, min(length(path)) AS depth
      RETURN DISTINCT target, depth
      ORDER BY depth
      LIMIT 100
    `;

    const records = await connectionManager.executeRead<Record<string, unknown>>(
      query,
      { uuid: entityUuid }
    );

    // Organize by depth layer
    const depthLayers: Record<number, Array<{ uuid: string; title: string }>> = {};
    const positionsCovered = new Set<number>();

    records.forEach((record) => {
      const target = record['target'];
      const depth = record['depth'];

      const mappedTarget = mapNeo4jNode(target);
      if (!mappedTarget) return;

      const uuid = mappedTarget.uuid;
      const title = typeof mappedTarget.properties['title'] === 'string' ? mappedTarget.properties['title'] : 'Untitled';
      const depthNum = typeof depth === 'number' ? depth : 1;

      if (uuid && depthNum) {
        if (!depthLayers[depthNum]) {
          depthLayers[depthNum] = [];
        }
        depthLayers[depthNum].push({ uuid, title });

        // Track position if available
        const p = mappedTarget.properties['p_position'] ?? mappedTarget.properties['c_4_ql_position'];
        if (typeof p === 'number' && p >= 0 && p <= 5) {
          positionsCovered.add(p);
        }
      }
    });

    return {
      depth_layers: depthLayers,
      total_entities: records.length,
      positions_covered: Array.from(positionsCovered),
    };
  } catch {
    return undefined;
  }
}

// =============================================================================
// Embedding Operations
// =============================================================================

/**
 * Generate embedding for text using Gemini API
 *
 * Optionally stores the embedding in the Neo4j graph as a property on an entity.
 *
 * @param text - Text to embed
 * @param taskType - Task type for embedding optimization (default: SEMANTIC_SIMILARITY)
 * @param dimensions - Embedding dimensions: 768, 1536, or 3072 (default: 3072, matching the coord_embedding index)
 * @param storeFor - Optional entity UUID to store embedding in graph (written to c_5_embedding)
 * @returns EmbeddingResult with vector, metadata, and storage status
 */
export async function embed(
  text: string,
  taskType: TaskType = 'SEMANTIC_SIMILARITY',
  dimensions: 768 | 1536 | 3072 = 3072,
  storeFor?: string
): Promise<EmbeddingResult> {
  const startTime = performance.now();

  try {
    // Create embedding client
    const client = new GeminiEmbeddingClient();
    const model = client.getModelVersion();

    // Generate embedding
    const vector = await client.embedText(text, taskType, dimensions);

    const endTime = performance.now();
    const latencyMs = endTime - startTime;

    // Get cost info
    const costInfo = client.getCostInfo();

    let stored = false;
    let storeEntityUuid: string | undefined;

    // Store embedding in graph if entity UUID provided
    if (storeFor) {
      try {
        const connectionManager = getNeo4jConnectionManager();

        // Store the vector on the canonical c_5_embedding property as a NATIVE
        // float list (not a JSON string) so the coord_embedding vector index
        // picks it up. db.create.setNodeVectorProperty guarantees float encoding.
        const result = await connectionManager.executeWrite<Record<string, unknown>>(
          `
          MATCH (n:Bimba)
          WHERE n.c_2_uuid = $uuid OR n.uuid = $uuid
          WITH n LIMIT 1
          CALL db.create.setNodeVectorProperty(n, 'c_5_embedding', $embedding)
          SET n.c_5_embedding_model = $model,
              n.c_5_embedding_dimensions = $dimensions,
              n.c_5_embedding_task_type = $taskType,
              n.c_5_embedding_generated_at = datetime()
          RETURN coalesce(n.c_2_uuid, n.uuid) as uuid
          `,
          {
            uuid: storeFor,
            embedding: vector,
            dimensions: neo4j.int(dimensions),
            taskType,
            model,
          }
        );

        if (result.length > 0) {
          stored = true;
          storeEntityUuid = storeFor;
        }
      } catch (error) {
        // Log but don't fail the operation if storage fails
        console.error('Failed to store embedding in graph:', error);
      }
    }

    return {
      text,
      vector,
      dimensions,
      model,
      task_type: taskType,
      stored,
      store_entity_uuid: storeEntityUuid,
      latency_ms: latencyMs,
      cost_info: {
        estimatedInputCost: costInfo.estimatedInputCost,
        totalCost: costInfo.totalCost,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate embedding: ${errorMessage}`);
  }
}

/**
 * Batch embed multiple texts for efficiency
 *
 * Uses Gemini batch API endpoint for cost-effective batch embedding.
 * Supports optional storage of embeddings in graph with store_for UUID array.
 * When store_for is provided as array, must match texts array length exactly.
 *
 * @param texts - Array of texts to embed
 * @param taskType - Task type for embedding optimization (default: SEMANTIC_SIMILARITY)
 * @param dimensions - Embedding dimensions: 768, 1536, or 3072 (default: 768)
 * @param storeFor - Optional array of entity UUIDs to store embeddings (length must match texts)
 * @returns BatchEmbeddingResult with array of results and aggregated cost tracking
 * @throws Error if texts array empty, dimensions invalid, or storage fails for all entities
 */
export async function embedBatch(
  texts: string[],
  taskType: TaskType = 'SEMANTIC_SIMILARITY',
  dimensions: 768 | 1536 | 3072 = 3072,
  storeFor?: string[]
): Promise<BatchEmbeddingResult> {
  // Validation
  if (texts.length === 0) {
    throw new Error('Cannot embed empty texts array');
  }

  if (storeFor && storeFor.length !== texts.length) {
    throw new Error(`store_for array length (${storeFor.length}) must match texts array length (${texts.length})`);
  }

  const startTime = performance.now();

  try {
    // Create embedding client
    const client = new GeminiEmbeddingClient();
    const model = client.getModelVersion();

    // Generate batch embeddings
    const vectors = await client.embedBatch(texts, taskType, dimensions);

    const endTime = performance.now();
    const totalLatencyMs = endTime - startTime;

    // Get cost info
    const costInfo = client.getCostInfo();

    // Build individual embedding results
    const results: EmbeddingResult[] = [];
    for (let i = 0; i < texts.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const vector = vectors[i]!;
      const text = texts[i]!;

      let stored = false;
      let storeEntityUuid: string | undefined;

      // Store embedding in graph if UUID provided for this index
      if (storeFor?.[i]) {
        try {
          const connectionManager = getNeo4jConnectionManager();
          const result = await connectionManager.executeWrite<Record<string, unknown>>(
            `
            MATCH (n:Bimba)
            WHERE n.c_2_uuid = $uuid OR n.uuid = $uuid
            WITH n LIMIT 1
            CALL db.create.setNodeVectorProperty(n, 'c_5_embedding', $embedding)
            SET n.c_5_embedding_model = $model,
                n.c_5_embedding_dimensions = $dimensions,
                n.c_5_embedding_task_type = $taskType,
                n.c_5_embedding_generated_at = datetime()
            RETURN coalesce(n.c_2_uuid, n.uuid) as uuid
            `,
            {
              uuid: storeFor[i],
              embedding: vector,
              dimensions: neo4j.int(dimensions),
              taskType,
              model,
            }
          );

          if (result.length > 0) {
            stored = true;
            storeEntityUuid = storeFor[i];
          }
        } catch (error) {
          // Log but don't fail the batch operation if one storage fails
          console.error(`Failed to store embedding for entity ${storeFor[i]}:`, error);
        }
      }

      results.push({
        text,
        vector,
        dimensions,
        model,
        task_type: taskType,
        stored,
        store_entity_uuid: storeEntityUuid,
        latency_ms: totalLatencyMs / texts.length, // Distribute latency proportionally
        cost_info: {
          estimatedInputCost: costInfo.estimatedInputCost / texts.length,
          totalCost: costInfo.totalCost / texts.length,
        },
      });
    }

    return {
      results,
      batch_size: texts.length,
      total_latency_ms: totalLatencyMs,
      total_cost_info: {
        estimatedInputCost: costInfo.estimatedInputCost,
        totalCost: costInfo.totalCost,
      },
      batch_discount_applied: true, // Gemini applies batch discounts automatically
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate batch embeddings: ${errorMessage}`);
  }
}

// =============================================================================
// Graph Chunking
// =============================================================================

/**
 * Chunk a document and store chunks as graph nodes with parent relationships
 *
 * Creates chunk nodes with labels [:Chunk, :Content], stores with CONTAINS relationships
 * from parent document, inherits parent's coordinates, and generates embeddings via graph-embed.
 *
 * @param input Chunking input parameters
 * @returns GraphChunkResult with chunk_count, parent_uuid, and chunk_uuids
 * @throws Error if file not found, document node not found, or chunking fails
 */
export async function chunk(input: GraphChunkInput): Promise<GraphChunkResult> {
  const startTime = performance.now();
  const connectionManager = getNeo4jConnectionManager();

  // Find parent document by file_path first
  const documentResult = await connectionManager.executeRead<Record<string, unknown>>(
    `
    MATCH (doc:Bimba)
    WHERE doc.s_1_vault_path = $filePath OR doc.file_path = $filePath
    RETURN doc
    LIMIT 1
    `,
    { filePath: input.file_path }
  );

  if (documentResult.length === 0) {
    throw new Error(`Document not found for path: ${input.file_path}`);
  }

  const mappedDoc = mapNeo4jNode(documentResult[0]?.['doc']);
  if (!mappedDoc) {
    throw new Error(`Failed to map parent document for path: ${input.file_path}`);
  }

  const parentUuid = mappedDoc.uuid;
  const props = mappedDoc.properties;
  // Inherit the parent's canonical `coordinate` string onto each chunk. The live
  // schema has no raw C/P/M/S/T/L numeric props, so we propagate the one
  // authoritative coordinate field instead of fabricating per-family numbers.
  const parentCoordinate = typeof props['coordinate'] === 'string' ? (props['coordinate'] as string) : null;

  // Read file from vault
  const vaultPath = join(resolvePresentRoot(), input.file_path);

  let content: string;
  try {
    content = await readFile(vaultPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file: ${input.file_path}`);
  }

  // Chunk the document using contextual chunking
  const chunkResult = await chunkDocument(content, parentUuid, {
    chunkSize: input.chunk_size ?? 500,
    overlapPercent: input.overlap ?? 0.2,
    contextualizeChunks: input.generate_context ?? true,
  });

  let chunksCreated = 0;
  let chunksUpdated = 0;
  let relationshipsCreated = 0;

  // Store each chunk in Neo4j
  const chunkUuids: string[] = [];

  for (const chunk of chunkResult.chunks) {
    const chunkUuid = chunk.chunk_id;
    chunkUuids.push(chunkUuid);

    // Create or update chunk node using canonical :Bimba labels and c_2_uuid
    const chunkCreateResult = await connectionManager.executeWrite<{
      created: boolean;
    }>(
      `
      MERGE (c:Bimba:Chunk:Content {uuid: $uuid})
      ON CREATE SET
        c.c_2_uuid = $uuid,
        c.s_1_vault_path = $filePath,
        c.file_path = $filePath,
        c.parent_uuid = $parentUuid,
        c.sequence_num = $seqNum,
        c.c_5_content = $rawContent,
        c.raw_content = $rawContent,
        c.contextualized_content = $contextualizedContent,
        c.context = $context,
        c.char_offset = $charOffset,
        c.h1 = $h1,
        c.h2 = $h2,
        c.h3 = $h3,
        c.code_language = $codeLanguage,
        c.wikilinks = $wikilinks,
        c.coordinate = $parentCoordinate,
        c.created_at = datetime(),
        c.updated_at = datetime()
      ON MATCH SET
        c.c_5_content = $rawContent,
        c.raw_content = $rawContent,
        c.contextualized_content = $contextualizedContent,
        c.context = $context,
        c.char_offset = $charOffset,
        c.h1 = $h1,
        c.h2 = $h2,
        c.h3 = $h3,
        c.code_language = $codeLanguage,
        c.wikilinks = $wikilinks,
        c.updated_at = datetime()
      RETURN c.uuid as uuid
      `,
      {
        uuid: chunkUuid,
        filePath: input.file_path,
        parentUuid,
        seqNum: chunk.sequence_num,
        rawContent: chunk.raw_content,
        contextualizedContent: chunk.contextualized_content,
        context: chunk.context,
        charOffset: chunk.metadata.char_offset,
        h1: chunk.metadata.h1,
        h2: chunk.metadata.h2,
        h3: chunk.metadata.h3,
        codeLanguage: chunk.metadata.code_language,
        wikilinks: JSON.stringify(chunk.metadata.wikilinks),
        parentCoordinate,
      }
    );

    if (chunkCreateResult.length > 0) {
      chunksCreated++;
    } else {
      chunksUpdated++;
    }

    // Create CONTAINS relationship from parent to chunk
    const relResult = await connectionManager.executeWrite<Record<string, unknown>>(
      `
      MATCH (parent:Bimba)
      WHERE parent.c_2_uuid = $parentUuid OR parent.uuid = $parentUuid
      MATCH (child:Bimba)
      WHERE child.c_2_uuid = $childUuid OR child.uuid = $childUuid
      MERGE (parent)-[:CONTAINS]->(child)
      RETURN 1
      `,
      { parentUuid, childUuid: chunkUuid }
    );

    if (relResult.length > 0) {
      relationshipsCreated++;
    }
  }

  const endTime = performance.now();
  const latencyMs = endTime - startTime;

  return {
    chunk_count: chunkResult.chunks.length,
    parent_uuid: parentUuid,
    chunk_uuids: chunkUuids,
    chunks_created: chunksCreated,
    chunks_updated: chunksUpdated,
    relationships_created: relationshipsCreated,
    execution_time_ms: latencyMs,
  };
}

// =============================================================================
// Graph Validation
// =============================================================================

/**
 * Validate graph alignment and integrity
 *
 * Validates coordinate consistency, relationship types, and embedding presence
 * across the Neo4j knowledge graph.
 *
 * Scopes:
 * - 'full': All validation checks
 * - 'coordinates': Only coordinate consistency checks
 * - 'relationships': Only relationship type and integrity checks
 * - 'embeddings': Only embedding presence checks
 *
 * @param scope Validation scope (default: 'full')
 * @param coordinateFilter Optional filter for specific coordinates
 * @returns ValidationResult with comprehensive validation report
 * @throws Error if validation setup fails
 */
export async function validate(
  scope: 'full' | 'coordinates' | 'relationships' | 'embeddings' = 'full',
  coordinateFilter?: CoordinateFilter
): Promise<ValidationResult> {
  const validator = getAlignmentValidator();
  return validator.validate(scope, coordinateFilter);
}

// =============================================================================
// Batch Embedding (focused node sets / coordinate branches)
// =============================================================================

/**
 * Compose an embedding text from a node's resolved roles + rich string fields.
 * Prefix-agnostic: name + description first, then all string-valued {family}_{n}_
 * properties (excluding ids/timestamps/embeddings). The client truncates to its
 * canonical context limit.
 */
function composeEmbeddingText(coord: string, props: Record<string, unknown>): string {
  const roles = buildRoleView(props);
  const parts: string[] = [];
  if (coord) parts.push(`Coordinate: ${coord}`);
  if (typeof roles.name?.value === 'string') parts.push(`Name: ${roles.name.value}`);
  if (typeof roles.description?.value === 'string') parts.push(String(roles.description.value));

  const used = new Set<string>([roles.name?.key ?? '', roles.description?.key ?? '', 'coordinate']);
  for (const [k, v] of Object.entries(props)) {
    if (typeof v !== 'string' || v.length === 0 || used.has(k)) continue;
    if (!/^[cptlsm]_\d_/.test(k)) continue;
    if (k.endsWith('_embedding') || /uuid|notion_page_id|_updated_at|_last_updated|dataset/.test(k)) continue;
    parts.push(v);
  }
  return parts.join('\n\n');
}

export interface EmbedNodesInput {
  coordinatePrefix?: string;
  label?: string;
  onlyMissing?: boolean;
  limit?: number;
  dimensions?: 768 | 1536 | 3072;
  taskType?: TaskType;
}

export interface EmbedNodesResult {
  requested: number;
  embedded: number;
  failed: number;
  dimensions: number;
  model: string;
  task_type: TaskType;
  results: Array<{ coordinate: string; status: 'embedded' | 'failed'; error?: string }>;
  execution_time_ms: number;
}

/**
 * Batch-embed a focused set of :Bimba nodes into the canonical c_5_embedding
 * property (picked up by the coord_embedding vector index). Target by coordinate
 * branch (prefix), label, and/or only nodes missing an embedding.
 */
export async function embedNodes(input: EmbedNodesInput): Promise<EmbedNodesResult> {
  const start = Date.now();
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 500);
  const dimensions = input.dimensions ?? 3072;
  const taskType = input.taskType ?? 'SEMANTIC_SIMILARITY';
  const onlyMissing = input.onlyMissing ?? true;

  const cm = getNeo4jConnectionManager();
  await cm.connect();

  const conds: string[] = [];
  const params: Record<string, unknown> = { limit: neo4j.int(limit) };
  if (input.label) {
    conds.push(`n:\`${sanitizeIdentifier(input.label)}\``);
  }
  if (input.coordinatePrefix) {
    conds.push('n.coordinate STARTS WITH $prefix');
    params['prefix'] = input.coordinatePrefix;
  }
  if (onlyMissing) {
    conds.push('n.c_5_embedding IS NULL');
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const targets = await cm.executeRead<Record<string, unknown>>(
    `MATCH (n:Bimba) ${where} RETURN n.coordinate AS coord, properties(n) AS props LIMIT $limit`,
    params
  );

  const client = new GeminiEmbeddingClient();
  const model = client.getModelVersion();
  const results: Array<{ coordinate: string; status: 'embedded' | 'failed'; error?: string }> = [];
  let embedded = 0;
  let failed = 0;

  for (const rec of targets) {
    const coord = typeof rec['coord'] === 'string' ? rec['coord'] : '';
    const props = (rec['props'] ?? {}) as Record<string, unknown>;
    try {
      const text = composeEmbeddingText(coord, props);
      if (!text.trim()) {
        results.push({ coordinate: coord, status: 'failed', error: 'no embeddable text content' });
        failed++;
        continue;
      }
      const vector = await client.embedText(text, taskType, dimensions);
      await cm.executeWrite(
        `MATCH (n:Bimba {coordinate: $coord})
         WITH n LIMIT 1
         CALL db.create.setNodeVectorProperty(n, 'c_5_embedding', $embedding)
         SET n.c_5_embedding_model = $model,
             n.c_5_embedding_dimensions = $dimensions,
             n.c_5_embedding_task_type = $taskType,
             n.c_5_embedding_generated_at = datetime()
         RETURN n.coordinate AS coord`,
        { coord, embedding: vector, model, dimensions: neo4j.int(dimensions), taskType }
      );
      results.push({ coordinate: coord, status: 'embedded' });
      embedded++;
    } catch (e) {
      results.push({ coordinate: coord, status: 'failed', error: e instanceof Error ? e.message : String(e) });
      failed++;
    }
  }

  return {
    requested: targets.length,
    embedded,
    failed,
    dimensions,
    model,
    task_type: taskType,
    results,
    execution_time_ms: Date.now() - start,
  };
}

// =============================================================================
// Graph Admin Functions (MCP-023)
// =============================================================================

/**
 * Create a vector index for embeddings in the graph
 *
 * Creates a vector index on the embedding property for efficient
 * similarity search operations.
 *
 * @param indexName Name for the index
 * @param property Property to index (default: 'embedding')
 * @param dimensions Embedding dimensions (default: 768)
 * @returns Result with index creation status
 * @throws Error if index creation fails
 */
export async function createVectorIndex(
  indexName: string,
  property: string = 'c_5_embedding',
  dimensions: number = 3072
): Promise<{ success: boolean; index_name: string; message: string }> {
  const manager = getNeo4jConnectionManager();
  await manager.connect();

  try {
    // Check if index already exists
    const existingIndexes = await manager.executeRead<{ name: string }>(
      `SHOW INDEXES WHERE name = $indexName`,
      { indexName }
    );

    if (existingIndexes.length > 0) {
      return {
        success: false,
        index_name: indexName,
        message: `Index '${indexName}' already exists`,
      };
    }

    // Create vector index
    await manager.executeWrite<void>(
      `CREATE VECTOR INDEX ${indexName} FOR (n:Bimba) ON (n.${property}) OPTIONS {dimension: $dimensions, similarity_function: 'cosine'}`,
      { dimensions }
    );

    return {
      success: true,
      index_name: indexName,
      message: `Vector index '${indexName}' created successfully with dimension ${dimensions}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      index_name: indexName,
      message: `Failed to create index: ${message}`,
    };
  }
}

/**
 * Drop an index from the graph
 *
 * Removes the specified index. This is a destructive operation.
 *
 * @param indexName Name of the index to drop
 * @returns Result with index deletion status
 * @throws Error if index deletion fails
 */
export async function dropIndex(
  indexName: string
): Promise<{ success: boolean; index_name: string; message: string }> {
  const manager = getNeo4jConnectionManager();
  await manager.connect();

  try {
    // Check if index exists
    const existingIndexes = await manager.executeRead<{ name: string }>(
      `SHOW INDEXES WHERE name = $indexName`,
      { indexName }
    );

    if (existingIndexes.length === 0) {
      return {
        success: false,
        index_name: indexName,
        message: `Index '${indexName}' not found`,
      };
    }

    // Drop the index
    await manager.executeWrite<void>(
      `DROP INDEX ${indexName} IF EXISTS`
    );

    return {
      success: true,
      index_name: indexName,
      message: `Index '${indexName}' dropped successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      index_name: indexName,
      message: `Failed to drop index: ${message}`,
    };
  }
}

/**
 * List all indexes in the graph
 *
 * Returns information about all indexes including their state,
 * type, and properties.
 *
 * @returns Array of index information
 * @throws Error if query fails
 */
export async function listIndexes(): Promise<Array<{
  name: string;
  state: 'ONLINE' | 'POPULATING' | 'FAILED';
  type: 'BTREE' | 'TEXT' | 'VECTOR';
  properties: string[];
  labels?: string[];
}>> {
  const manager = getNeo4jConnectionManager();
  await manager.connect();

  try {
    const results = await manager.executeRead<any>(
      `SHOW INDEXES`
    );

    return results.map((index: any) => ({
      name: index.name || 'unknown',
      state: index.state || 'UNKNOWN',
      type: index.type || 'BTREE',
      properties: Array.isArray(index.properties) ? index.properties : [],
      labels: Array.isArray(index.labelsOrTypes) ? index.labelsOrTypes : undefined,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list indexes: ${message}`);
  }
}

/**
 * Get schema information about the graph
 *
 * Returns all node labels, relationship types, and property keys
 * used in the graph.
 *
 * @returns Schema information
 * @throws Error if query fails
 */
export async function getSchemaInfo(): Promise<{
  node_labels: string[];
  relationship_types: string[];
  property_keys: string[];
}> {
  const manager = getNeo4jConnectionManager();
  await manager.connect();

  try {
    // Get node labels
    const labels = await manager.executeRead<{ label: string }>(
      `CALL db.labels() YIELD label RETURN label ORDER BY label`
    );

    // Get relationship types
    const relTypes = await manager.executeRead<{ relationshipType: string }>(
      `CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType`
    );

    // Get property keys
    const keys = await manager.executeRead<{ propertyKey: string }>(
      `CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey`
    );

    return {
      node_labels: labels.map((r: any) => r.label || ''),
      relationship_types: relTypes.map((r: any) => r.relationshipType || ''),
      property_keys: keys.map((r: any) => r.propertyKey || ''),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get schema info: ${message}`);
  }
}

/**
 * Get statistics about the graph
 *
 * Returns node counts by label and relationship counts by type.
 *
 * @returns Graph statistics
 * @throws Error if query fails
 */
export async function getGraphStats(): Promise<{
  total_nodes: number;
  total_relationships: number;
  node_counts: Array<{ label: string; count: number }>;
  relationship_counts: Array<{ type: string; count: number }>;
}> {
  const manager = getNeo4jConnectionManager();
  await manager.connect();

  try {
    // Neo4j returns count() as an Integer object; convert to a JS number.
    const num = (v: unknown): number => (neo4j.isInt(v) ? (v as unknown as { toNumber(): number }).toNumber() : Number(v ?? 0));

    const totalNodesResult = await manager.executeRead<{ count: unknown }>(`MATCH (n) RETURN count(n) as count`);
    const totalNodes = num(totalNodesResult[0]?.count);

    const totalRelsResult = await manager.executeRead<{ count: unknown }>(`MATCH ()-[r]->() RETURN count(r) as count`);
    const totalRels = num(totalRelsResult[0]?.count);

    // Node counts by label (Cypher has no GROUP BY — grouping is implicit via the
    // non-aggregated key. UNWIND so multi-label nodes are counted per label.)
    const nodeCounts = await manager.executeRead<{ label: string; count: unknown }>(
      `MATCH (n) UNWIND labels(n) AS label RETURN label, count(*) as count ORDER BY count DESC`
    );

    // Relationship counts by type
    const relCounts = await manager.executeRead<{ type: string; count: unknown }>(
      `MATCH ()-[r]->() RETURN type(r) as type, count(*) as count ORDER BY count DESC`
    );

    return {
      total_nodes: totalNodes,
      total_relationships: totalRels,
      node_counts: nodeCounts.map((r) => ({
        label: r.label || 'unknown',
        count: num(r.count),
      })),
      relationship_counts: relCounts.map((r) => ({
        type: r.type || 'unknown',
        count: num(r.count),
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get graph stats: ${message}`);
  }
}

/**
 * Execute administrative operations on the graph
 *
 * Dispatches to appropriate operation handler based on the operation type.
 * Destructive operations (create_index, drop_index) should be gated by
 * admin flag in MCP configuration.
 *
 * @param input Admin operation with parameters
 * @returns Result of the operation
 * @throws Error if operation fails
 */
export async function admin(input: GraphAdminInput): Promise<GraphAdminOutput> {
  const { operation, params = {} } = input;

  switch (operation) {
    case 'create_index': {
      const result = await createVectorIndex(
        (params.index_name as string) || 'coord_embedding',
        (params.property as string) || 'c_5_embedding',
        (params.dimensions as number) || 3072
      );
      return {
        operation: 'create_index',
        success: result.success,
        index_name: result.index_name,
        message: result.message,
      };
    }

    case 'drop_index': {
      if (!params.index_name) {
        throw new Error('index_name parameter required for drop_index operation');
      }
      const result = await dropIndex(params.index_name as string);
      return {
        operation: 'drop_index',
        success: result.success,
        index_name: result.index_name,
        message: result.message,
      };
    }

    case 'list_indexes': {
      const indexes = await listIndexes();
      return {
        operation: 'list_indexes',
        indexes: indexes,
        total_count: indexes.length,
      };
    }

    case 'schema_info': {
      const schema = await getSchemaInfo();
      return {
        operation: 'schema_info',
        schema: {
          node_labels: schema.node_labels,
          relationship_types: schema.relationship_types,
          property_keys: schema.property_keys,
        },
      };
    }

    case 'stats': {
      const stats = await getGraphStats();
      return {
        operation: 'stats',
        stats: {
          total_nodes: stats.total_nodes,
          total_relationships: stats.total_relationships,
          node_counts: stats.node_counts,
          relationship_counts: stats.relationship_counts,
        },
      };
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
