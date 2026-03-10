/**
 * Zod schemas for GraphRAG data types
 *
 * These schemas define the structure of graph nodes, edges, paths, and results
 * used in Neo4j queries and returned by MCP tools.
 *
 * GraphRAG (Graph Retrieval Augmented Generation) provides structured graph
 * queries that return nodes, edges, and paths for knowledge graph operations.
 */

import { z } from 'zod';

// =============================================================================
// Coordinate Schema (defined locally to avoid circular imports)
// =============================================================================

/**
 * Bimba coordinate pattern following the canonical regex:
 * ^([CPMSLT])(\d+)(?:[-.](\d+))*(?:\.\([^)]+\))?(')?$
 */
const CoordinateSchema = z.string()
  .regex(
    /^[CPMSLT]\d+(?:[-.]\d+)*(?:\.\([^)]+\))?'?$/,
    'Invalid coordinate format. Must match pattern like P2, M2-5, S2.4, M1-3-4.(0000), S2\''
  )
  .describe('Bimba coordinate (e.g., P2, M2-5, S2.4, M1-3-4.(0000), S2\')');

// =============================================================================
// GraphRAG Node and Edge Types
// =============================================================================

/**
 * Reference to a node in the Neo4j graph
 *
 * Represents a node with its unique identifier, labels, and properties.
 * Labels typically include the coordinate type (P, C, M, S, T, L).
 */
export const NodeRefSchema = z.object({
  uuid: z.string()
    .uuid()
    .describe('Unique identifier for this node'),
  labels: z.array(z.string())
    .describe('Neo4j labels for this node (e.g., ["Position", "P2"])'),
  properties: z.record(z.unknown())
    .describe('Node properties including coordinate, title, description, etc.'),
  file_path: z.string()
    .optional()
    .describe('Optional file path if this node is backed by a file'),
});

export type NodeRef = z.infer<typeof NodeRefSchema>;

/**
 * Reference to an edge in the Neo4j graph
 *
 * Represents a directed relationship between two nodes with a relationship type
 * and associated properties.
 */
export const EdgeRefSchema = z.object({
  source_uuid: z.string()
    .uuid()
    .describe('UUID of the source node'),
  target_uuid: z.string()
    .uuid()
    .describe('UUID of the target node'),
  rel_type: z.string()
    .describe('Relationship type (e.g., "CONTAINS", "RELATES_TO", "PARENT")'),
  properties: z.record(z.unknown())
    .optional()
    .describe('Relationship properties'),
});

export type EdgeRef = z.infer<typeof EdgeRefSchema>;

// =============================================================================
// GraphRAG Path Result
// =============================================================================

/**
 * Path query result representing a traversal through the graph
 *
 * A path consists of alternating nodes and edges, with the total length
 * representing the number of relationships traversed.
 */
export const PathResultSchema = z.object({
  nodes: z.array(NodeRefSchema)
    .describe('Nodes in the path'),
  edges: z.array(EdgeRefSchema)
    .describe('Edges connecting the nodes in order'),
  length: z.number()
    .int()
    .nonnegative()
    .describe('Number of relationships in the path'),
  coordinate: CoordinateSchema
    .optional()
    .describe('Bimba coordinate of the primary node if applicable'),
});

export type PathResult = z.infer<typeof PathResultSchema>;

// =============================================================================
// GraphRAG Result
// =============================================================================

/**
 * Comprehensive graph query result
 *
 * Contains nodes and edges from a graph operation, with optional metadata
 * about the query, execution, and Bimba subsystem information.
 */
export const GraphResultSchema = z.object({
  nodes: z.array(NodeRefSchema)
    .describe('Nodes returned by the query'),
  edges: z.array(EdgeRefSchema)
    .describe('Edges between the nodes'),
  coordinate: CoordinateSchema
    .optional()
    .describe('Primary coordinate for the result'),
  path: PathResultSchema
    .optional()
    .describe('Optional path information if this is a path traversal'),
  sync_status: z.enum(['synced', 'pending', 'error'])
    .optional()
    .describe('Synchronization status of the data (synced, pending, or error)'),
  bimba_subsystem: z.enum(['S1', 'S2', 'S3', 'S4', 'S5'])
    .optional()
    .describe('Bimba subsystem this data belongs to'),
  query: z.string()
    .optional()
    .describe('Original Cypher query that produced this result'),
  execution_time_ms: z.number()
    .nonnegative()
    .optional()
    .describe('Query execution time in milliseconds'),
  error: z.string()
    .optional()
    .describe('Error message if the query failed'),
});

export type GraphResult = z.infer<typeof GraphResultSchema>;

// =============================================================================
// Coordinate Filter
// =============================================================================

/**
 * Flat dictionary representation of coordinate filters
 *
 * Used in API inputs to specify which coordinate types to include/exclude.
 * Each field represents a coordinate type and its filtering level (0-5).
 *
 * Example: { P: 2, M: 3, S: 0 } means include positions up to P2,
 * subsystems up to M3, and exclude stacks entirely.
 */
export const CoordinateFilterSchema = z.object({
  C: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .describe('Category filter level (0-5, 0=exclude)'),
  C_is_prime: z.boolean()
    .optional()
    .describe('Filter Category coordinates by prime (Pratibimba) aspect'),
  P: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .describe('Position filter level (0-5, 0=exclude)'),
  P_is_prime: z.boolean()
    .optional()
    .describe('Filter Position coordinates by prime (Pratibimba) aspect'),
  M: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .describe('Subsystem filter level (0-5, 0=exclude)'),
  M_is_prime: z.boolean()
    .optional()
    .describe('Filter Subsystem coordinates by prime (Pratibimba) aspect'),
  S: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .describe('Stack filter level (0-5, 0=exclude)'),
  S_is_prime: z.boolean()
    .optional()
    .describe('Filter Stack coordinates by prime (Pratibimba) aspect'),
  T: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .describe('Thought filter level (0-5, 0=exclude)'),
  T_is_prime: z.boolean()
    .optional()
    .describe('Filter Thought coordinates by prime (Pratibimba) aspect'),
  L: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .describe('Lens filter level (0-5, 0=exclude)'),
  L_is_prime: z.boolean()
    .optional()
    .describe('Filter Lens coordinates by prime (Pratibimba) aspect'),
}).strict();

export type CoordinateFilter = z.infer<typeof CoordinateFilterSchema>;

/**
 * Convert flat CoordinateFilter dict to internal CoordinateFilter[] list
 *
 * Transforms { C: 2, P: 3, M: 0 } to [
 *   { type: 'C', level: 2 },
 *   { type: 'P', level: 3 }
 * ]
 *
 * Excludes entries with level 0 (which means "exclude this type").
 *
 * @param filter - Flat dictionary with coordinate type keys and level values
 * @returns Array of { type, level } objects, excluding level 0 entries
 */
export function convertCoordinateFilterToList(
  filter: CoordinateFilter
): Array<{ type: 'C' | 'P' | 'M' | 'S' | 'T' | 'L'; level: number }> {
  const coordinateTypes: Array<'C' | 'P' | 'M' | 'S' | 'T' | 'L'> = ['C', 'P', 'M', 'S', 'T', 'L'];

  return coordinateTypes
    .map((type) => {
      const level = filter[type];
      return level !== undefined && level > 0 ? { type, level } : null;
    })
    .filter((item): item is { type: 'C' | 'P' | 'M' | 'S' | 'T' | 'L'; level: number } => item !== null);
}

// =============================================================================
// QL Coordinate (6-Dimensional Coordinate String)
// =============================================================================

/**
 * Full Quaternal Logic (QL) coordinate with 6 dimensions
 *
 * A complete coordinate in the QL system includes all 6 types:
 * C (Category) - P (Position) - M (Subsystem) - S (Stack) - T (Thought) - L (Lens)
 *
 * Example: C1-P2-M3-S4-T2-L1
 * Each dimension is a number, and all dimensions must be specified.
 *
 * This differs from partial Bimba coordinates which may only include some types.
 */
export const QLCoordinateSchema = z.string()
  .regex(
    /^[CP]\d+(?:[-.]\d+){5}(?:\.\([^)]+\))?'?$/,
    'Invalid QL coordinate format. Must include all 6 dimensions: C-P-M-S-T-L (e.g., C1-P2-M3-S4-T2-L1)'
  )
  .describe('Full 6-coordinate QL string (C-P-M-S-T-L)');

export type QLCoordinate = z.infer<typeof QLCoordinateSchema>;

// =============================================================================
// Graph Traversal
// =============================================================================

/**
 * Input schema for graph_traverse tool
 *
 * Traverses the graph from a starting node, returning all paths up to max_depth.
 * Supports filtering by relationship types and traversal direction.
 */
export const GraphTraverseInputSchema = z.object({
  start_uuid: z.string()
    .uuid()
    .describe('UUID of the starting node for traversal'),
  max_depth: z.number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .default(3)
    .describe('Maximum traversal depth (1-5, default 3)'),
  rel_types: z.array(z.string())
    .optional()
    .describe('Filter by relationship types (e.g., ["POS0_LINKS_TO", "POS1_DEFINES"])'),
  direction: z.enum(['in', 'out', 'both'])
    .optional()
    .default('out')
    .describe('Traversal direction: in (incoming), out (outgoing), or both'),
});

export type GraphTraverseInput = z.infer<typeof GraphTraverseInputSchema>;

/**
 * Output schema for graph_traverse tool
 *
 * Returns array of PathResult objects representing all traversed paths from the start node.
 */
export const GraphTraverseOutputSchema = z.object({
  start_uuid: z.string()
    .uuid()
    .describe('UUID of the starting node'),
  paths: z.array(PathResultSchema)
    .describe('All traversed paths from the start node'),
  total_paths: z.number()
    .int()
    .nonnegative()
    .describe('Total number of paths found'),
  total_nodes: z.number()
    .int()
    .nonnegative()
    .describe('Total unique nodes encountered'),
  max_depth_reached: z.number()
    .int()
    .nonnegative()
    .describe('Maximum depth actually reached in traversal'),
  execution_time_ms: z.number()
    .nonnegative()
    .optional()
    .describe('Query execution time in milliseconds'),
});

export type GraphTraverseOutput = z.infer<typeof GraphTraverseOutputSchema>;

/**
 * Input schema for graph_traverse_positions tool
 *
 * Traverses the graph following a specific sequence of QL positions,
 * starting from a root entity and following P0->P1->P2->... paths
 * through relationships organized by position level.
 *
 * Example: position_sequence [0, 2, 5] traverses:
 *   Ground (P0) -> Operation (P2) -> Integration (P5)
 */
export const GraphTraversePositionsInputSchema = z.object({
  start_uuid: z.string()
    .uuid()
    .describe('UUID of the starting node for traversal'),
  position_sequence: z.array(z.number().int().min(0).max(5))
    .min(1)
    .describe('Sequence of position levels to follow (0-5). Each element represents a position level: 0=ground, 1=definition, 2=operation, 3=pattern, 4=context, 5=integration'),
  max_per_position: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Maximum number of entities to return per position level (default 10)'),
});

export type GraphTraversePositionsInput = z.infer<typeof GraphTraversePositionsInputSchema>;

/**
 * Entities found at a specific position during position-sequence traversal
 *
 * Contains all entities reachable at this position level from the previous level
 */
export const PositionEntitiesSchema = z.object({
  position: z.number()
    .int()
    .min(0)
    .max(5)
    .describe('Position level (0=ground, 1=definition, 2=operation, 3=pattern, 4=context, 5=integration)'),
  position_name: z.string()
    .describe('Human-readable position name (e.g., "Ground", "Definition", "Operation")'),
  entities: z.array(NodeRefSchema)
    .describe('Entities at this position level'),
  connection_count: z.number()
    .int()
    .nonnegative()
    .describe('Total number of connections from previous position'),
  execution_time_ms: z.number()
    .nonnegative()
    .optional()
    .describe('Query time for this position level in milliseconds'),
});

export type PositionEntities = z.infer<typeof PositionEntitiesSchema>;

/**
 * Output schema for graph_traverse_positions tool
 *
 * Returns paths through the graph organized by position sequence,
 * with entities found at each position level.
 */
export const GraphTraversePositionsOutputSchema = z.object({
  start_uuid: z.string()
    .uuid()
    .describe('UUID of the starting node'),
  start_node: NodeRefSchema
    .optional()
    .describe('Metadata about the starting node'),
  position_sequence: z.array(z.number().int().min(0).max(5))
    .describe('The position sequence that was traversed'),
  paths_by_position: z.array(PositionEntitiesSchema)
    .describe('Entities organized by position level in the sequence'),
  total_paths: z.number()
    .int()
    .nonnegative()
    .describe('Total number of distinct paths found'),
  total_entities: z.number()
    .int()
    .nonnegative()
    .describe('Total unique entities across all positions'),
  execution_time_ms: z.number()
    .nonnegative()
    .optional()
    .describe('Total query execution time in milliseconds'),
});

export type GraphTraversePositionsOutput = z.infer<typeof GraphTraversePositionsOutputSchema>;

// =============================================================================
// Graph Context
// =============================================================================

/**
 * Input schema for graph_context tool
 *
 * Retrieves context around an entity, gathering neighbors and connections
 * based on traversal depth and mode (narrow/balanced/wide).
 *
 * Supports filtering by position coordinates for targeted context gathering.
 */
export const GraphContextInputSchema = z.object({
  entity_uuid: z.string()
    .uuid()
    .describe('UUID of the entity to gather context around'),
  depth: z.number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .default(2)
    .describe('Context gathering depth (1-5, default 2)'),
  mode: z.enum(['narrow', 'balanced', 'wide'])
    .optional()
    .default('balanced')
    .describe('Context breadth mode: narrow=1-hop, balanced=2-hop, wide=3+-hop'),
  positions: z.array(z.number().int().min(0).max(5))
    .optional()
    .describe('Filter by position levels (0-5): grounds, definitions, operations, patterns, contexts, integrations'),
});

export type GraphContextInput = z.infer<typeof GraphContextInputSchema>;

/**
 * Position-organized connections for entity context
 *
 * Organizes connections by their position coordinate level for clarity.
 * Each position represents a semantic layer in the knowledge graph.
 *
 * Position levels:
 * - P0: Grounds (foundational connections)
 * - P1: Definitions (definitional connections)
 * - P2: Operations (operational connections)
 * - P3: Patterns (pattern connections)
 * - P4: Contexts (contextual connections)
 * - P5: Integrations (integrative connections)
 */
export const PositionConnectionsSchema = z.object({
  position: z.number().int().min(0).max(5)
    .describe('Position level (0-5)'),
  label: z.enum(['grounds', 'definitions', 'operations', 'patterns', 'contexts', 'integrations'])
    .describe('Human-readable position label'),
  connections: z.array(z.object({
    node: NodeRefSchema,
    rel_type: z.string(),
    properties: z.record(z.unknown()).optional(),
  }))
    .describe('Connections at this position level'),
});

export type PositionConnections = z.infer<typeof PositionConnectionsSchema>;

/**
 * Output schema for graph_context tool
 *
 * Returns comprehensive context around an entity including neighbors,
 * paths, and position-organized connections.
 */
export const ContextResultSchema = z.object({
  entity: NodeRefSchema
    .describe('The central entity being contextualized'),
  neighbors: z.array(NodeRefSchema)
    .describe('All unique neighbor nodes found within depth'),
  paths: z.array(PathResultSchema)
    .describe('Paths from entity to neighbors'),
  position_connections: z.array(PositionConnectionsSchema)
    .describe('Connections organized by position level'),
  depth_used: z.number().int().nonnegative()
    .describe('Actual depth reached in traversal'),
  mode_used: z.enum(['narrow', 'balanced', 'wide'])
    .describe('Context mode that was used'),
  total_nodes: z.number().int().nonnegative()
    .describe('Total unique nodes in context'),
  total_edges: z.number().int().nonnegative()
    .describe('Total unique edges in context'),
  execution_time_ms: z.number().nonnegative()
    .optional()
    .describe('Query execution time in milliseconds'),
});

export type ContextResult = z.infer<typeof ContextResultSchema>;

// =============================================================================
// Spec Retrieve
// =============================================================================

/**
 * Input schema for spec_retrieve tool
 *
 * Retrieves the full specification of an entity including its coordinates,
 * file path, content summary, and connected entities organized by position.
 *
 * The entity can be looked up by either its title or canonical_id (UUID).
 */
export const SpecRetrieveInputSchema = z.object({
  entity_name: z.string()
    .min(1)
    .max(500)
    .describe('Entity title or canonical_id (UUID) to look up specification for'),
  include_connected: z.boolean()
    .optional()
    .default(true)
    .describe('Whether to traverse wiki-links ([[...]]) and include connected entities (default: true)'),
  max_connected_per_position: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Maximum number of connected entities to return per position (default: 10)'),
});

export type SpecRetrieveInput = z.infer<typeof SpecRetrieveInputSchema>;

/**
 * Connected entity reference with relationship type
 *
 * Represents a single entity connected to the main entity through a specific relationship.
 */
export const ConnectedEntitySchema = z.object({
  node: NodeRefSchema,
  rel_type: z.string()
    .describe('Relationship type (e.g., POS0_LINKS_TO, POS1_DEFINES)'),
  properties: z.record(z.unknown())
    .optional()
    .describe('Relationship properties'),
});

export type ConnectedEntity = z.infer<typeof ConnectedEntitySchema>;

/**
 * Position-organized connected entities
 *
 * Groups connected entities by their position level for semantic clarity.
 */
export const PositionConnectedEntitiesSchema = z.object({
  position: z.number().int().min(0).max(5)
    .describe('Position level (0-5)'),
  label: z.enum(['grounds', 'definitions', 'operations', 'patterns', 'contexts', 'integrations'])
    .describe('Human-readable position label'),
  entities: z.array(ConnectedEntitySchema)
    .describe('Connected entities at this position level'),
});

export type PositionConnectedEntities = z.infer<typeof PositionConnectedEntitiesSchema>;

/**
 * Coordinate specification
 *
 * Represents the 6-dimensional QL coordinate for an entity, with each dimension
 * optionally specified (category, position, subsystem, stack, thought, lens).
 */
export const CoordinateSpecSchema = z.object({
  C: z.number().int().optional()
    .describe('Category coordinate'),
  P: z.number().int().optional()
    .describe('Position coordinate'),
  M: z.number().int().optional()
    .describe('Subsystem coordinate'),
  S: z.number().int().optional()
    .describe('Stack coordinate'),
  T: z.number().int().optional()
    .describe('Thought coordinate'),
  L: z.number().int().optional()
    .describe('Lens coordinate'),
});

export type CoordinateSpec = z.infer<typeof CoordinateSpecSchema>;

/**
 * Complete entity specification
 *
 * Contains all information about an entity including its identity, coordinates,
 * content summary, and connected entities organized by position.
 */
export const SpecResultSchema = z.object({
  uuid: z.string()
    .uuid()
    .describe('Unique identifier for the entity'),
  title: z.string()
    .describe('Entity title'),
  file_path: z.string()
    .optional()
    .describe('Optional file path if this entity is backed by a file'),
  coordinates: CoordinateSpecSchema
    .describe('QL coordinates (C, P, M, S, T, L)'),
  position_arrays: z.record(z.array(z.string()))
    .optional()
    .describe('Links by position (p0_*, p1_*, etc.)'),
  content_summary: z.string()
    .describe('Summary or excerpt of entity content'),
  connected_by_position: z.array(PositionConnectedEntitiesSchema)
    .describe('Connected entities organized by position level'),
  total_connected: z.number().int().nonnegative()
    .describe('Total number of connected entities'),
  execution_time_ms: z.number().nonnegative()
    .optional()
    .describe('Query execution time in milliseconds'),
});

export type SpecResult = z.infer<typeof SpecResultSchema>;

// =============================================================================
// Hybrid Search (Vector + Graph)
// =============================================================================

/**
 * Input schema for graph_search tool
 *
 * Performs hybrid search combining vector similarity and graph structure.
 * Supports multiple search modes: vector-only, graph-only, or hybrid fusion methods.
 *
 * The query is natural language text that gets embedded for vector similarity,
 * while graph structure uses relationship distance and position levels.
 */
export const GraphSearchInputSchema = z.object({
  query: z.string()
    .min(1)
    .max(500)
    .describe('Natural language search query'),
  top_k: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Number of top results to return (1-100, default 10)'),
  coordinates: CoordinateFilterSchema
    .optional()
    .describe('Filter results to specific coordinate ranges (C, P, M, S, T, L levels)'),
  mode: z.enum(['vector_only', 'graph_only', 'hybrid_rrf', 'hybrid_weighted'])
    .optional()
    .default('hybrid_rrf')
    .describe('Search mode: vector_only, graph_only, hybrid_rrf (Reciprocal Rank Fusion), hybrid_weighted (default: hybrid_rrf)'),
  search_chunks: z.boolean()
    .optional()
    .default(true)
    .describe('Include chunk nodes in search results (default true)'),
  expand_to_parent: z.boolean()
    .optional()
    .default(false)
    .describe('For chunk results, include parent document info and surrounding chunks (default false)'),
});

export type GraphSearchInput = z.infer<typeof GraphSearchInputSchema>;

/**
 * Single search result with score and entity information
 *
 * Combines vector similarity score and graph metrics for hybrid ranking.
 */
export const RetrievalResultSchema = z.object({
  node: NodeRefSchema
    .describe('The retrieved node'),
  score: z.number()
    .min(0)
    .max(1)
    .describe('Combined relevance score (0-1)'),
  vector_score: z.number()
    .min(0)
    .max(1)
    .optional()
    .describe('Vector similarity score'),
  graph_score: z.number()
    .min(0)
    .max(1)
    .optional()
    .describe('Graph structure score'),
  rank_position: z.number()
    .int()
    .nonnegative()
    .describe('Rank position in results (0-indexed)'),
  match_context: z.string()
    .optional()
    .describe('Snippet or explanation of why this matches'),
  // Chunk-specific fields (present when result is a chunk)
  chunk_uuid: z.string()
    .uuid()
    .optional()
    .describe('UUID of the chunk node (if result is a chunk)'),
  parent_uuid: z.string()
    .uuid()
    .optional()
    .describe('UUID of the parent document node (if result is a chunk)'),
  sequence_num: z.number()
    .int()
    .nonnegative()
    .optional()
    .describe('Sequence number of chunk within parent document (if result is a chunk)'),
  chunk_content: z.string()
    .optional()
    .describe('Raw chunk content text (if result is a chunk)'),
  parent_title: z.string()
    .optional()
    .describe('Title of parent document (if result is a chunk and expand_to_parent=true)'),
  parent_path: z.string()
    .optional()
    .describe('File path of parent document (if result is a chunk and expand_to_parent=true)'),
  surrounding_chunks: z.object({
    prev_chunk: z.object({
      uuid: z.string().uuid(),
      sequence_num: z.number().int(),
      content: z.string(),
    }).optional(),
    next_chunk: z.object({
      uuid: z.string().uuid(),
      sequence_num: z.number().int(),
      content: z.string(),
    }).optional(),
  }).optional()
    .describe('Previous and next chunks for context expansion (if expand_to_parent=true)'),
});

export type RetrievalResult = z.infer<typeof RetrievalResultSchema>;

/**
 * Output schema for graph_search tool
 *
 * Returns ranked list of relevant entities from hybrid search combining
 * vector embeddings and graph structure.
 */
export const GraphSearchOutputSchema = z.object({
  results: z.array(RetrievalResultSchema)
    .describe('Ranked list of retrieval results'),
  total_results: z.number()
    .int()
    .nonnegative()
    .describe('Total number of results (may exceed top_k)'),
  query_embedding: z.array(z.number())
    .optional()
    .describe('The query embedding vector (if mode includes vector search)'),
  search_mode_used: z.enum(['vector_only', 'graph_only', 'hybrid_rrf', 'hybrid_weighted'])
    .describe('The search mode that was actually used'),
  coordinate_filter_applied: CoordinateFilterSchema
    .optional()
    .describe('Coordinate filter that was applied'),
  execution_time_ms: z.number()
    .nonnegative()
    .optional()
    .describe('Query execution time in milliseconds'),
});

export type GraphSearchOutput = z.infer<typeof GraphSearchOutputSchema>;

// =============================================================================
// Progressive Disclosure
// =============================================================================

/**
 * Input schema for graph_disclosure tool
 *
 * Provides progressive disclosure of entity information, progressively revealing
 * more details as the disclosure level increases (0-5).
 */
export const GraphDisclosureInputSchema = z.object({
  entity_uuid: z.string()
    .uuid()
    .describe('UUID of the entity to disclose information about'),
  level: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .default(0)
    .describe('Disclosure level (0-5): L0=minimal, L5=complete'),
});

export type GraphDisclosureInput = z.infer<typeof GraphDisclosureInputSchema>;

/**
 * Output schema for graph_disclosure tool
 *
 * Returns entity information progressively revealed based on level:
 * - L0: uuid, title
 * - L1: + file_path, coordinates
 * - L2: + position_arrays, modes
 * - L3: + content_summary
 * - L4: + connected_entities (by position)
 * - L5: + full_context (with depth layers)
 */
export const DisclosureResultSchema = z.object({
  entity_uuid: z.string()
    .uuid()
    .describe('UUID of the disclosed entity'),
  level: z.number()
    .int()
    .min(0)
    .max(5)
    .describe('Disclosure level provided'),
  max_level: z.number()
    .int()
    .describe('Maximum disclosure level available (always 5)'),
  disclosed: z.record(z.unknown())
    .describe('Disclosed information based on level'),
  next_level_preview: z.string()
    .optional()
    .describe('Preview of what becomes available at next disclosure level'),
  retrieval_time_ms: z.number()
    .nonnegative()
    .describe('Time spent retrieving entity information in milliseconds'),
});

export type DisclosureResult = z.infer<typeof DisclosureResultSchema>;

// =============================================================================
// Graph Embed - Embedding Generation and Storage
// =============================================================================

/**
 * Input schema for graph-embed MCP tool
 *
 * Generates embeddings using Gemini API with optional storage in Neo4j graph.
 */
export const GraphEmbedInputSchema = z.object({
  text: z.string()
    .min(1)
    .optional()
    .describe('Text to embed (use either text or texts)'),
  texts: z.array(z.string().min(1))
    .optional()
    .describe('Array of texts to embed in batch (use either text or texts)'),
  task_type: z.enum([
    'RETRIEVAL_QUERY',
    'RETRIEVAL_DOCUMENT',
    'SEMANTIC_SIMILARITY',
    'CLASSIFICATION',
    'CLUSTERING',
    'QUESTION_ANSWERING',
  ])
    .optional()
    .default('SEMANTIC_SIMILARITY')
    .describe('Task type for embedding optimization (default: SEMANTIC_SIMILARITY)'),
  dimensions: z.union([z.literal(768), z.literal(1536), z.literal(3072)])
    .optional()
    .default(768)
    .describe('Embedding dimensions: 768, 1536, or 3072 (default: 768)'),
  store_for: z.union([
    z.string().uuid(),
    z.array(z.string().uuid()),
  ])
    .optional()
    .describe('Optional entity UUID(s) to store embeddings in graph. For batch mode (texts[]), provide array matching texts[] length'),
});

export type GraphEmbedInput = z.infer<typeof GraphEmbedInputSchema>;

/**
 * Embedding result with vector and metadata
 */
export const EmbeddingResultSchema = z.object({
  text: z.string()
    .describe('Original text that was embedded'),
  vector: z.array(z.number())
    .describe('Embedding vector'),
  dimensions: z.number()
    .int()
    .positive()
    .describe('Number of dimensions in the vector'),
  model: z.string()
    .describe('Model used for embedding generation'),
  task_type: z.string()
    .describe('Task type used for optimization'),
  stored: z.boolean()
    .describe('Whether embedding was stored in graph'),
  store_entity_uuid: z.string()
    .uuid()
    .optional()
    .describe('UUID of entity where embedding was stored'),
  latency_ms: z.number()
    .nonnegative()
    .describe('Time to generate embedding in milliseconds'),
  cost_info: z.object({
    estimatedInputCost: z.number().nonnegative(),
    totalCost: z.number().nonnegative(),
  })
    .describe('Cost tracking information'),
});

export type EmbeddingResult = z.infer<typeof EmbeddingResultSchema>;

/**
 * Batch embedding results with array of embeddings
 */
export const BatchEmbeddingResultSchema = z.object({
  results: z.array(EmbeddingResultSchema)
    .describe('Array of embedding results, one per input text'),
  batch_size: z.number()
    .int()
    .positive()
    .describe('Number of texts in batch'),
  total_latency_ms: z.number()
    .nonnegative()
    .describe('Total time to generate all embeddings in milliseconds'),
  total_cost_info: z.object({
    estimatedInputCost: z.number().nonnegative(),
    totalCost: z.number().nonnegative(),
  })
    .describe('Aggregated cost tracking for entire batch'),
  batch_discount_applied: z.boolean()
    .describe('Whether batch API discount was applied'),
});

export type BatchEmbeddingResult = z.infer<typeof BatchEmbeddingResultSchema>;

// =============================================================================
// Graph Validation
// =============================================================================

/**
 * Input schema for graph_validate tool
 *
 * Validates graph alignment and integrity, checking coordinate consistency,
 * relationship types, and embedding presence.
 */
export const GraphValidateInputSchema = z.object({
  scope: z.enum(['full', 'coordinates', 'relationships', 'embeddings'])
    .optional()
    .default('full')
    .describe('Validation scope: full (all checks), coordinates (C-P-M-S-T-L consistency), relationships (relationship types), embeddings (embedding presence)'),
  coordinate_filter: CoordinateFilterSchema
    .optional()
    .describe('Optional filter to validate specific coordinates'),
});

export type GraphValidateInput = z.infer<typeof GraphValidateInputSchema>;

/**
 * Validation detail with issue information
 */
export const ValidationDetailSchema = z.object({
  node_uuid: z.string()
    .uuid()
    .describe('UUID of node with validation issue'),
  node_title: z.string()
    .describe('Title of node with validation issue'),
  issue_type: z.enum([
    'coordinate_missing',
    'coordinate_invalid',
    'coordinate_inconsistent',
    'relationship_type_invalid',
    'embedding_missing',
    'embedding_invalid',
    'label_mismatch',
  ])
    .describe('Type of validation issue'),
  severity: z.enum(['error', 'warning', 'info'])
    .describe('Severity level of the issue'),
  message: z.string()
    .describe('Human-readable issue description'),
});

export type ValidationDetail = z.infer<typeof ValidationDetailSchema>;

/**
 * Validation result with comprehensive report
 */
export const ValidationResultSchema = z.object({
  passed: z.boolean()
    .describe('Whether all validations passed'),
  scope: z.enum(['full', 'coordinates', 'relationships', 'embeddings'])
    .describe('Scope of validation performed'),
  total_nodes_checked: z.number()
    .int()
    .nonnegative()
    .describe('Total number of nodes validated'),
  total_edges_checked: z.number()
    .int()
    .nonnegative()
    .describe('Total number of relationships validated'),
  passed_count: z.number()
    .int()
    .nonnegative()
    .describe('Number of entities passing validation'),
  failed_count: z.number()
    .int()
    .nonnegative()
    .describe('Number of entities failing validation'),
  warning_count: z.number()
    .int()
    .nonnegative()
    .describe('Number of entities with warnings'),
  details: z.array(ValidationDetailSchema)
    .describe('List of validation issues found'),
  coordinate_consistency: z.object({
    valid_count: z.number().int().nonnegative(),
    invalid_count: z.number().int().nonnegative(),
    missing_count: z.number().int().nonnegative(),
  })
    .optional()
    .describe('Coordinate validation statistics'),
  relationship_integrity: z.object({
    valid_count: z.number().int().nonnegative(),
    invalid_type_count: z.number().int().nonnegative(),
    dangling_count: z.number().int().nonnegative(),
  })
    .optional()
    .describe('Relationship validation statistics'),
  embedding_coverage: z.object({
    total_nodes: z.number().int().nonnegative(),
    embedded_count: z.number().int().nonnegative(),
    missing_count: z.number().int().nonnegative(),
    coverage_percent: z.number().min(0).max(100),
  })
    .optional()
    .describe('Embedding coverage statistics'),
  execution_time_ms: z.number()
    .nonnegative()
    .describe('Time spent validating in milliseconds'),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// =============================================================================
// Graph Chunk Schemas
// =============================================================================

/**
 * Input schema for graph_chunk tool
 *
 * Chunks a document and stores chunks as graph nodes with parent relationships
 */
export const GraphChunkInputSchema = z.object({
  file_path: z.string()
    .min(1)
    .describe('Relative path to file within vault'),
  chunk_size: z.number()
    .int()
    .min(400)
    .max(800)
    .optional()
    .default(500)
    .describe('Target chunk size in tokens (400-800, default 500)'),
  overlap: z.number()
    .min(0)
    .max(0.5)
    .optional()
    .default(0.2)
    .describe('Overlap between chunks as decimal (0.0-0.5, default 0.2 = 20%)'),
  generate_context: z.boolean()
    .optional()
    .default(true)
    .describe('Generate LLM context for each chunk (default true)'),
});

export type GraphChunkInput = z.infer<typeof GraphChunkInputSchema>;

/**
 * Output schema for graph_chunk tool
 */
export const GraphChunkOutputSchema = z.object({
  chunk_count: z.number()
    .int()
    .nonnegative()
    .describe('Total number of chunks created'),
  parent_uuid: z.string()
    .uuid()
    .describe('UUID of parent document node'),
  chunk_uuids: z.array(z.string().uuid())
    .describe('Array of created chunk UUIDs'),
  chunks_created: z.number()
    .int()
    .nonnegative()
    .describe('Number of new chunk nodes created'),
  chunks_updated: z.number()
    .int()
    .nonnegative()
    .describe('Number of existing chunks updated'),
  relationships_created: z.number()
    .int()
    .nonnegative()
    .describe('Number of CONTAINS relationships created'),
  execution_time_ms: z.number()
    .nonnegative()
    .describe('Time spent chunking and storing in milliseconds'),
});

export type GraphChunkResult = z.infer<typeof GraphChunkOutputSchema>;

// =============================================================================
// Graph Admin Schemas (MCP-023)
// =============================================================================

/**
 * Input schema for graph_admin tool
 *
 * Supports administrative operations: create_index, drop_index, list_indexes,
 * schema_info, stats. Destructive operations require admin flag in MCP config.
 */
export const GraphAdminInputSchema = z.object({
  operation: z.enum(['create_index', 'drop_index', 'list_indexes', 'schema_info', 'stats'])
    .describe('Admin operation to perform: create_index (vector index), drop_index (remove index), list_indexes (all indexes), schema_info (labels/types), stats (counts)'),
  params: z.record(z.unknown())
    .optional()
    .describe('Operation-specific parameters (index_name for drop_index, property for create_index, etc.)'),
});

export type GraphAdminInput = z.infer<typeof GraphAdminInputSchema>;

/**
 * Index information schema
 */
export const IndexInfoSchema = z.object({
  name: z.string()
    .describe('Index name'),
  state: z.enum(['ONLINE', 'POPULATING', 'FAILED'])
    .describe('Current index state'),
  type: z.enum(['BTREE', 'TEXT', 'VECTOR'])
    .describe('Index type'),
  properties: z.array(z.string())
    .describe('Properties indexed'),
  labels: z.array(z.string())
    .optional()
    .describe('Node labels for this index'),
});

export type IndexInfo = z.infer<typeof IndexInfoSchema>;

/**
 * Schema information schema
 */
export const SchemaInfoSchema = z.object({
  node_labels: z.array(z.string())
    .describe('All node labels in the graph'),
  relationship_types: z.array(z.string())
    .describe('All relationship types in the graph'),
  property_keys: z.array(z.string())
    .describe('All property keys used in the graph'),
});

export type SchemaInfo = z.infer<typeof SchemaInfoSchema>;

/**
 * Node count by label
 */
export const NodeCountSchema = z.object({
  label: z.string()
    .describe('Node label'),
  count: z.number()
    .int()
    .nonnegative()
    .describe('Number of nodes with this label'),
});

export type NodeCount = z.infer<typeof NodeCountSchema>;

/**
 * Relationship count by type
 */
export const RelationshipCountSchema = z.object({
  type: z.string()
    .describe('Relationship type'),
  count: z.number()
    .int()
    .nonnegative()
    .describe('Number of relationships of this type'),
});

export type RelationshipCount = z.infer<typeof RelationshipCountSchema>;

/**
 * Graph statistics schema
 */
export const GraphStatsSchema = z.object({
  total_nodes: z.number()
    .int()
    .nonnegative()
    .describe('Total number of nodes'),
  total_relationships: z.number()
    .int()
    .nonnegative()
    .describe('Total number of relationships'),
  node_counts: z.array(NodeCountSchema)
    .describe('Count of nodes by label'),
  relationship_counts: z.array(RelationshipCountSchema)
    .describe('Count of relationships by type'),
});

export type GraphStats = z.infer<typeof GraphStatsSchema>;

/**
 * Output schema for graph_admin tool
 */
export const GraphAdminOutputSchema = z.union([
  z.object({
    operation: z.literal('create_index'),
    success: z.boolean()
      .describe('Whether index creation was successful'),
    index_name: z.string()
      .describe('Name of created index'),
    message: z.string()
      .describe('Status message'),
  }),
  z.object({
    operation: z.literal('drop_index'),
    success: z.boolean()
      .describe('Whether index deletion was successful'),
    index_name: z.string()
      .describe('Name of deleted index'),
    message: z.string()
      .describe('Status message'),
  }),
  z.object({
    operation: z.literal('list_indexes'),
    indexes: z.array(IndexInfoSchema)
      .describe('All graph indexes'),
    total_count: z.number()
      .int()
      .nonnegative()
      .describe('Total number of indexes'),
  }),
  z.object({
    operation: z.literal('schema_info'),
    schema: SchemaInfoSchema
      .describe('Schema information'),
  }),
  z.object({
    operation: z.literal('stats'),
    stats: GraphStatsSchema
      .describe('Graph statistics'),
  }),
]);

export type GraphAdminOutput = z.infer<typeof GraphAdminOutputSchema>;
