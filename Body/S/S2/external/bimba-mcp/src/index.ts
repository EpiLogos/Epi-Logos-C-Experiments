#!/usr/bin/env node

/**
 * Bimba MCP Server
 *
 * Model Context Protocol server for accessing the Bimba coordinate system
 * and Neo4j knowledge graph. Provides tools for coordinate resolution,
 * semantic search, and context retrieval.
 *
 * @see https://modelcontextprotocol.io
 */

import { createRequire } from 'module';
import { execFileSync } from 'node:child_process';
import neo4j from 'neo4j-driver';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import {
  ResolveCoordinateInputSchema,
  SemanticSearchInputSchema,
  GetContextInputSchema,
  ListCoordinatesInputSchema,
  TelegramSendMessageInputSchema,
  TelegramGetRecentMessagesInputSchema,
  TelegramReplyInputSchema,
  GraphQueryInputSchema,
  GraphTraverseInputSchema,
  GraphContextInputSchema,
  SpecRetrieveInputSchema,
  GraphSearchInputSchema,
  GraphDisclosureInputSchema,
  GraphEmbedInputSchema,
  GraphValidateInputSchema,
  GraphSyncInputSchema,
  GraphChunkInputSchema,
  GraphRerankInputSchema,
  type ResolveCoordinateOutput,
  type SemanticSearchOutput,
  type GetContextOutput,
  type ListCoordinatesOutput,
  type BimbaNode,
  type TelegramToolMessage,
  type TelegramGetRecentMessagesOutput,
  type GraphQueryOutput,
  type GraphSearchOutput,
  type EmbeddingResult,
  type BatchEmbeddingResult,
  type ValidationResult,
  type SyncResult,
  type GraphChunkResult,
  type GraphRerankOutput,
} from './schemas.js';
import type { GraphTraverseOutput, ContextResult, CoordinateFilter, DisclosureResult, GraphTraversePositionsOutput, GraphAdminOutput } from './schemas/graph.js';
import { GraphTraversePositionsInputSchema, GraphAdminInputSchema } from './schemas/graph.js';
import { isCanonicalCoordinateSyntax } from './coordinates/syntax.js';
import { parseCoordinate } from './coordinates/parser.js';

import { queryByCoordinate, traverse, traversePositions, context, search, disclosure, embed, embedBatch, embedNodes, validate, chunk, rerank, admin, mapNeo4jNode } from './api/graph.js';
import { GraphEmbedBatchInputSchema } from './schemas/graph.js';
import {
  runCypher,
  upsertNode,
  setProperty,
  setLabels,
  createRelationship,
  deleteRelationship,
  deleteNode,
  graphSchema,
} from './api/graph-crud.js';
import {
  GraphCypherInputSchema,
  GraphUpsertNodeInputSchema,
  GraphSetPropertyInputSchema,
  GraphLabelInputSchema,
  GraphCreateRelationshipInputSchema,
  GraphDeleteRelationshipInputSchema,
  GraphDeleteNodeInputSchema,
  GraphSchemaInputSchema,
} from './schemas/graph-crud.js';
import { sync } from './api/sync.js';
import { getNeo4jConnectionManager } from './db/neo4j.js';
import { loadTelegramConfig } from './telegram/config.js';
import { TelegramService } from './telegram/service.js';
import type { TelegramCachedMessage } from './telegram/types.js';
import { specRetrieveContentText } from './tools/spec-retrieve.js';

// =============================================================================
// Server Configuration
// =============================================================================

const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { name: string; version: string };

const SERVER_NAME = packageJson.name;
const SERVER_VERSION = packageJson.version;

// =============================================================================
// Tool Implementations (Stubs - to be implemented in later stories)
// =============================================================================

async function resolveCoordinate(
  coordinate: string,
  includeChildren: boolean,
  _depth: number
): Promise<ResolveCoordinateOutput> {
  const result = await queryByCoordinate(coordinate, true, 1);
  if (result.nodes.length === 0) {
    throw new Error(`Coordinate not found: ${coordinate}`);
  }

  const nodeRef = result.nodes[0]!;
  
  const bimbaNode: BimbaNode = {
    coordinate: nodeRef.properties['coordinate'] as string ?? coordinate,
    title: nodeRef.properties['title'] as string ?? `Node at ${coordinate}`,
    description: nodeRef.properties['description'] as string ?? nodeRef.properties['c_1_description'] as string ?? undefined,
    type: coordinate.charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
    properties: nodeRef.properties,
  };

  let children: BimbaNode[] | undefined;
  if (includeChildren) {
    const childrenResult = await queryByCoordinate(`${coordinate}-`, true, 100);
    children = childrenResult.nodes.map(n => ({
      coordinate: n.properties['coordinate'] as string,
      title: n.properties['title'] as string ?? `Node at ${n.properties['coordinate']}`,
      description: n.properties['description'] as string ?? n.properties['c_1_description'] as string ?? undefined,
      type: (n.properties['coordinate'] as string).charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
      properties: n.properties,
    })) as BimbaNode[];
  }

  const segments = coordinate.split('-');
  const path: string[] = [];
  let current = '';
  for (const segment of segments) {
    current = current ? `${current}-${segment}` : segment;
    path.push(current);
  }

  return {
    node: bimbaNode,
    children,
    path,
  };
}

function parseCoordinateFilter(coordinateStr: string): CoordinateFilter {
  const parsed = parseCoordinate(coordinateStr);
  if (!parsed) return {};
  
  const filter: CoordinateFilter = {};
  const segmentVal = parsed.segments[0];
  if (segmentVal !== undefined) {
    filter[parsed.type] = segmentVal;
  }
  if (parsed.isPrime) {
    filter[`${parsed.type}_is_prime` as keyof CoordinateFilter] = true as any;
  } else {
    filter[`${parsed.type}_is_prime` as keyof CoordinateFilter] = false as any;
  }
  return filter;
}

async function semanticSearch(
  query: string,
  limit: number,
  coordinateFilter?: string
): Promise<SemanticSearchOutput> {
  const searchResult = await search(
    query,
    limit,
    coordinateFilter ? parseCoordinateFilter(coordinateFilter) : undefined,
    'hybrid_rrf',
    true,
    true
  );

  const results = searchResult.results.map(r => {
    const nodeRef = r.node;
    const bimbaNode: BimbaNode = {
      coordinate: nodeRef.properties['coordinate'] as string ?? `Node at ${nodeRef.uuid}`,
      title: nodeRef.properties['title'] as string ?? `Node at ${nodeRef.uuid}`,
      description: nodeRef.properties['description'] as string ?? nodeRef.properties['c_1_description'] as string ?? undefined,
      type: (nodeRef.properties['coordinate'] as string ?? 'M').charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
      properties: nodeRef.properties,
    };
    return {
      node: bimbaNode,
      score: r.score,
      snippet: r.chunk_content,
    };
  });

  return {
    results,
    total_count: results.length,
    query_coordinate: coordinateFilter,
  };
}

async function getContext(
  coordinate: string,
  contextType: 'structural' | 'semantic' | 'full'
): Promise<GetContextOutput> {
  const response: GetContextOutput = { coordinate };

  const connectionManager = getNeo4jConnectionManager();
  
  const nodeResult = await queryByCoordinate(coordinate, true, 1);
  if (nodeResult.nodes.length === 0) {
    throw new Error(`Coordinate not found: ${coordinate}`);
  }
  const mainNodeRef = nodeResult.nodes[0]!;

  if (contextType === 'structural' || contextType === 'full') {
    let parentNode: BimbaNode | undefined;
    const lastDash = coordinate.lastIndexOf('-');
    if (lastDash > 0) {
      const parentCoord = coordinate.substring(0, lastDash);
      const parentResult = await queryByCoordinate(parentCoord, true, 1);
      if (parentResult.nodes.length > 0) {
        const pn = parentResult.nodes[0]!;
        parentNode = {
          coordinate: pn.properties['coordinate'] as string ?? parentCoord,
          title: pn.properties['title'] as string ?? `Node at ${parentCoord}`,
          description: pn.properties['description'] as string ?? pn.properties['c_1_description'] as string ?? undefined,
          type: parentCoord.charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
          properties: pn.properties,
        };
      }
    }

    const childrenResult = await queryByCoordinate(`${coordinate}-`, true, 100);
    const children = childrenResult.nodes.map(n => ({
      coordinate: n.properties['coordinate'] as string,
      title: n.properties['title'] as string ?? `Node at ${n.properties['coordinate']}`,
      description: n.properties['description'] as string ?? n.properties['c_1_description'] as string ?? undefined,
      type: (n.properties['coordinate'] as string).charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
      properties: n.properties,
    })) as BimbaNode[];

    let siblings: BimbaNode[] = [];
    if (lastDash > 0) {
      const parentCoord = coordinate.substring(0, lastDash);
      const siblingsResult = await queryByCoordinate(`${parentCoord}-`, true, 100);
      siblings = siblingsResult.nodes
        .filter(n => n.properties['coordinate'] !== coordinate)
        .map(n => ({
          coordinate: n.properties['coordinate'] as string,
          title: n.properties['title'] as string ?? `Node at ${n.properties['coordinate']}`,
          description: n.properties['description'] as string ?? n.properties['c_1_description'] as string ?? undefined,
          type: (n.properties['coordinate'] as string).charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
          properties: n.properties,
        })) as BimbaNode[];
    }

    response.structural_context = {
      parent: parentNode,
      siblings,
      children,
    };
  }

  if (contextType === 'semantic' || contextType === 'full') {
    const relatedResult = await connectionManager.executeRead<Record<string, unknown>>(
      `
      MATCH (node:Bimba)-[r]-(related:Bimba)
      WHERE node.coordinate = $coordinate
      RETURN {
        node: {uuid: coalesce(related.c_2_uuid, related.uuid), labels: labels(related), properties: properties(related)},
        rel_type: type(r)
      } AS result
      LIMIT 50
      `,
      { coordinate }
    );

    const related = relatedResult.map(record => {
      const res = record['result'] as Record<string, unknown>;
      const nodeData = res['node'];
      const mapped = mapNeo4jNode(nodeData);
      if (!mapped) return null;
      return {
        coordinate: mapped.properties['coordinate'] as string ?? `Node at ${mapped.uuid}`,
        title: mapped.properties['title'] as string ?? `Node at ${mapped.uuid}`,
        description: mapped.properties['description'] as string ?? mapped.properties['c_1_description'] as string ?? undefined,
        type: (mapped.properties['coordinate'] as string ?? 'M').charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
        properties: mapped.properties,
      };
    }).filter((n): n is NonNullable<typeof n> => n !== null) as BimbaNode[];

    response.semantic_context = {
      related,
      tags: typeof mainNodeRef.properties['tags'] === 'string'
        ? [mainNodeRef.properties['tags']]
        : Array.isArray(mainNodeRef.properties['tags'])
          ? mainNodeRef.properties['tags'].map(t => String(t))
          : [],
    };
  }

  return response;
}

async function listCoordinates(
  type?: 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
  parent?: string,
  limit?: number
): Promise<ListCoordinatesOutput> {
  const connectionManager = getNeo4jConnectionManager();
  
  let query = 'MATCH (node:Bimba) ';
  const conditions: string[] = [];
  // Neo4j needs an Integer for LIMIT (the JS driver marshals plain numbers as floats).
  const params: Record<string, unknown> = { limit: neo4j.int(limit ?? 20) };

  if (type) {
    conditions.push('node.coordinate STARTS WITH $type');
    params['type'] = type;
  }

  if (parent) {
    conditions.push('node.coordinate STARTS WITH $parent AND node.coordinate <> $parent');
    params['parent'] = parent;
  }

  if (conditions.length > 0) {
    query += `WHERE ${conditions.join(' AND ')} `;
  }

  query += 'RETURN {uuid: coalesce(node.c_2_uuid, node.uuid), labels: labels(node), properties: properties(node)} AS result LIMIT $limit';

  const records = await connectionManager.executeRead<Record<string, unknown>>(query, params);

  const coordinates = records.map(record => {
    const res = record['result'];
    const mapped = mapNeo4jNode(res);
    if (!mapped) return null;
    return {
      coordinate: mapped.properties['coordinate'] as string ?? `Node at ${mapped.uuid}`,
      title: mapped.properties['title'] as string ?? `Node at ${mapped.uuid}`,
      description: mapped.properties['description'] as string ?? mapped.properties['c_1_description'] as string ?? undefined,
      type: (mapped.properties['coordinate'] as string ?? 'M').charAt(0) as 'P' | 'C' | 'M' | 'S' | 'T' | 'L',
      properties: mapped.properties,
    };
  }).filter((n): n is NonNullable<typeof n> => n !== null) as BimbaNode[];

  let countQuery = 'MATCH (node:Bimba) ';
  if (conditions.length > 0) {
    countQuery += `WHERE ${conditions.join(' AND ')} `;
  }
  countQuery += 'RETURN count(node) as count';

  const countRecords = await connectionManager.executeRead<{ count: number }>(countQuery, params);
  const total_count = typeof countRecords[0]?.['count'] === 'number' ? countRecords[0]['count'] : coordinates.length;

  return {
    coordinates,
    total_count,
    has_more: total_count > coordinates.length,
  };
}

async function graphQuery(
  coordinate: string,
  includeNested: boolean,
  limit: number
): Promise<GraphQueryOutput> {
  return queryByCoordinate(coordinate, includeNested, limit);
}

async function graphTraverse(
  start_uuid: string,
  max_depth: number,
  rel_types?: string[],
  direction?: 'in' | 'out' | 'both'
): Promise<GraphTraverseOutput> {
  return traverse(start_uuid, max_depth, rel_types, direction);
}

async function graphTraversePositions(
  start_uuid: string,
  rel_type_sequence: string[],
  max_per_position?: number
): Promise<GraphTraversePositionsOutput> {
  return traversePositions(start_uuid, rel_type_sequence, max_per_position);
}

async function graphContext(
  entity_uuid: string,
  depth?: number,
  mode?: 'narrow' | 'balanced' | 'wide',
  rel_types?: string[]
): Promise<ContextResult> {
  return context(entity_uuid, depth, mode, rel_types);
}

async function graphSearch(
  query: string,
  top_k?: number,
  coordinates?: CoordinateFilter,
  mode?: 'vector_only' | 'graph_only' | 'hybrid_rrf' | 'hybrid_weighted',
  search_chunks?: boolean,
  expand_to_parent?: boolean
): Promise<GraphSearchOutput> {
  return search(query, top_k, coordinates, mode, search_chunks, expand_to_parent);
}

async function graphDisclosure(
  entity_uuid: string,
  level?: number
): Promise<DisclosureResult> {
  return disclosure(entity_uuid, level ?? 0);
}

// =============================================================================
// Coordinate Validation
// =============================================================================

function isValidCoordinate(coordinate: string): boolean {
  return isCanonicalCoordinateSyntax(coordinate);
}

function validateCoordinate(coordinate: string): void {
  if (!isValidCoordinate(coordinate)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid Bimba coordinate format: "${coordinate}". Expected canonical syntax like M2, S2-3, S4.0, or M1-3-4.(00/00)`
    );
  }
}

// =============================================================================
// Server Setup
// =============================================================================

/**
 * Best-effort: pull selected vars from the user's LOGIN+INTERACTIVE shell so the
 * server picks up secrets (e.g. GEMINI_API_KEY) exported in ~/.zshrc / ~/.zprofile.
 * GUI launchers like Claude Desktop do NOT inherit the interactive shell env, so
 * without this the key set in your zsh would be invisible to the MCP. Anything
 * already present in process.env (e.g. passed via the MCP config) always wins.
 */
function hydrateEnvFromLoginShell(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length === 0) return;
  try {
    const shell = process.env['SHELL'] || '/bin/zsh';
    // NUL-delimited KEY=VALUE pairs survive newlines/quotes in values.
    const script = missing.map((v) => `printf '%s=%s\\0' '${v}' "$${v}"`).join('; ');
    const out = execFileSync(shell, ['-lic', script], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 4000,
    });
    for (const pair of out.split('\0')) {
      const eq = pair.indexOf('=');
      if (eq <= 0) continue;
      const key = pair.slice(0, eq);
      const val = pair.slice(eq + 1).trim();
      if (val && !process.env[key]) process.env[key] = val;
    }
  } catch {
    // Best-effort only; embedding tools surface a clear error if the key is absent.
  }
}

async function main(): Promise<void> {
  // Resolve cloud embedding creds from the user's shell if the launcher didn't pass them.
  hydrateEnvFromLoginShell(['GEMINI_API_KEY', 'GEMINI_EMBEDDING_MODEL', 'GEMINI_EMBEDDING_OPT_IN']);
  // A present API key is treated as opt-in for this standalone server.
  if (process.env['GEMINI_API_KEY'] && process.env['GEMINI_EMBEDDING_OPT_IN'] === undefined) {
    process.env['GEMINI_EMBEDDING_OPT_IN'] = 'true';
  }
  if (process.env['GEMINI_API_KEY']) {
    console.error(
      `[bimba-mcp] Gemini embedding ready (model: ${process.env['GEMINI_EMBEDDING_MODEL'] ?? 'UNSET — export GEMINI_EMBEDDING_MODEL'})`
    );
  } else {
    console.error('[bimba-mcp] No GEMINI_API_KEY found; embedding tools will error until one is set.');
  }

  const telegramConfig = loadTelegramConfig();
  const telegramService = telegramConfig.enabled
    ? new TelegramService(telegramConfig)
    : null;

  const server = new McpServer(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {
          listChanged: true,
        },
        resources: {
          subscribe: false,
          listChanged: true,
        },
      },
    }
  );

  // ---------------------------------------------------------------------------
  // Register Resources (Health Check)
  // ---------------------------------------------------------------------------

  server.resource(
    'health',
    'bimba://health',
    {
      description: 'Health check endpoint for the Bimba MCP server',
      mimeType: 'application/json',
    },
    async () => ({
      contents: [
        {
          uri: 'bimba://health',
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              status: 'healthy',
              server: SERVER_NAME,
              version: SERVER_VERSION,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // ---------------------------------------------------------------------------
  // Register Schema Resources
  // ---------------------------------------------------------------------------

  server.resource(
    'schema/coordinates',
    'bimba://schema/coordinates',
    {
      description: 'Complete 6-coordinate system documentation for agent introspection',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'bimba://schema/coordinates',
          mimeType: 'text/markdown',
          text: `# Bimba 6-Coordinate System

## Overview
The Bimba system uses six coordinate types (C, P, M, S, T, L) to semantically position entities in a knowledge graph. Each coordinate carries meaning through its position number (0-5), with additional inversion modes (Day/Night and Prime/Unprime) for refined expression.

## C-Coordinate (Category)
Defines the ontological category or type of an entity.

- **C0: Ground/Source** - Pure potential, unmanifest being
- **C1: Presence/Form** - Essential nature, the thing itself
- **C2: Entity/Unit** - Concrete, discrete entities
- **C3: Process/Flow** - Transformation, operations, changes
- **C4: Type/Pattern** - Formal structures, archetypes, templates
- **C5: Integration/Reflection** - Synthesis, unified wholes

## P-Coordinate (Position)
Defines the semantic level or layer of meaning.

- **P0: Ground** - Foundations, raw connections, direct adjacency
- **P1: Definition** - Materials, substances, boundaries, intrinsic properties
- **P2: Operation** - Processes, methods, mechanisms, how things work
- **P3: Pattern** - Structures, recurring shapes, archetypal forms
- **P4: Context** - Situations, temporal/spatial placement, environment
- **P5: Integration** - Synthesis, wholeness, emergent outcomes

## M-Coordinate (Subsystem)
Defines which metaphysical or computational domain an entity belongs to.

- **M0: Anuttara** - The unsurpassable ground, proto-logical foundation
- **M1: Paramasiva** - Definition engine, quaternal logic systems
- **M2: Parashakti** - Operation/vibration, cosmic imagination (GraphRAG home)
- **M3: Mahamaya** - Symbolic transcription, universal language
- **M4: Nara** - Personal interface, embodied context
- **M5: Epii** - Synthesis orchestration, integration coordination

## S-Coordinate (Stack)
Defines which technological or infrastructural layer an entity exists within.

- **S0: Source/Data** - Raw data layer, unprocessed models
- **S1: Content** - File system, Obsidian vault, persistent storage
- **S2: Graph** - Neo4j, GraphRAG (where Moirai agents dwell)
- **S3: Plugin** - PAI infrastructure, Claude Code plugins
- **S4: Session** - Runtime context, conversation state
- **S5: Cloud** - Distributed deployment, messaging platforms

## T-Coordinate (Thought)
Defines the epistemic stance or inquiry mode.

- **T0: Questions/Assumptions** - Inquiry, what we don't know
- **T1: Traces/Lacunae** - Evidence, gaps, what's missing
- **T2: Challenges/Affordances** - Problems, opportunities
- **T3: Patterns/Anomalies** - Regularities, exceptions
- **T4: Discovery/Concealment** - Findings, what's hidden
- **T5: Insight/Integration** - Understanding, synthesis

## L-Coordinate (Lens)
Defines the perceptual or analytical lens applied.

- **L0: Naive/Direct** - Unfiltered perception
- **L1: Analytical/Structural** - Decomposition, structural analysis
- **L2: Operational/Procedural** - How-to, methods, sequences
- **L3: Archetypal/Symbolic** - Patterns, deeper meanings, myths
- **L4: Contextual/Situated** - Environment, circumstances, history
- **L5: Integrative/Holistic** - Unified view, comprehensive synthesis

## Inversion Modes

### Day/Night Mode (M, T, L coordinates)
- **Day Mode** (default): Outward, manifest, explicit, active
- **Night Mode**: Inward, potential, implicit, receptive

### Prime (') Inversion (all coordinates)
- **Unprime** (default, no '): Bimba aspect - canonical, original, source truth
- **Prime** ('): Pratibimba aspect - reflected, instantiated, operational instance

## Examples

- **C3-P2-M2-S3-T5-L5**: A process in operation at plugin layer with holistic understanding
- **S2'**: The active graph layer (operational instance)
- **M2': Operational Parashakti** (the imagination actively generating)

## Syntax Rules

- Valid: P2, M2-5, C3-P2-M2, S2', C3-P2-M2'-S2
- Coordinates use letters C, P, M, S, T, L (no # prefix)
- Separators: hyphen (-) or dot (.) allowed
- Context frames: Use parentheses for extended notation M1-3-4.(0000)
`,
        },
      ],
    })
  );

  server.resource(
    'schema/positions',
    'bimba://schema/positions',
    {
      description: 'P0-P5 position semantics and meaning layers',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'bimba://schema/positions',
          mimeType: 'text/markdown',
          text: `# Position Semantics (P0-P5)

The Position coordinate defines the semantic level or layer of an entity's meaning, progressing from ground truth to integrated understanding.

## P0: Ground
**Foundations, raw connections, adjacency**

Direct, unmediated proximity or reference. The basic substrate of connection; what two things relate to without interpretation. The foundational level of raw connectivity.

- Use case: Basic relationships, direct links, pure adjacency
- In queries: Finding immediate neighbors, direct connections
- Implication: Most primitive level of understanding

## P1: Definition
**Materials, substances, boundaries, what something IS**

The intrinsic properties, components, and boundaries that constitute the entity. Material definition of the essential nature. What constitutes the entity's being.

- Use case: Entity composition, properties, constraints, materials
- In queries: Understanding what something is made of, its components
- Implication: Structural knowledge, intrinsic characteristics

## P2: Operation
**Processes, methods, how something WORKS**

The operational logic, procedures, affordances, and mechanisms. How the entity functions, transforms, or enables actions. The procedural dimension.

- Use case: Methods, algorithms, operations, transformations
- In queries: Finding how to do something, operation sequences
- Implication: Functional knowledge, capability understanding

## P3: Pattern
**Structures, archetypes, formal templates**

The recurring patterns, shapes, and formal structures that the entity embodies. What templates or archetypal forms it instantiates. Structural templates and universal patterns.

- Use case: Archetypal knowledge, formal schemas, design patterns
- In queries: Finding similar structures, pattern matching
- Implication: Formal knowledge, structural understanding

## P4: Context
**Situations, temporal/spatial placement, environment**

The surrounding circumstances, temporal location, spatial placement, and environmental factors that situate the entity. Situational and circumstantial understanding.

- Use case: Historical context, spatial relationships, temporal placement
- In queries: Understanding circumstances, environment, timing
- Implication: Contextual knowledge, situational awareness

## P5: Integration
**Synthesis, wholeness, outcomes**

The unified perspective that integrates all other positions; results, emergent properties, and holistic understanding. The comprehensive view that brings everything together.

- Use case: Outcomes, emergent properties, wholeness, synthesis
- In queries: Finding comprehensive understanding, complete picture
- Implication: Integrated knowledge, holistic understanding

## Position Progressions

### Ground to Integrated (P0 → P5)
Building complete understanding by progressively adding layers:
- P0: Raw facts
- P1: What they are
- P2: How they work
- P3: Their patterns
- P4: Their context
- P5: Their integrated meaning

### Query Strategy by Position
- **Narrow queries**: Use lower positions (P0-P1) for specific facts
- **Operational queries**: Use P2-P3 for how and patterns
- **Contextual queries**: Use P4 for surrounding understanding
- **Comprehensive queries**: Use P5 for complete integrated knowledge
`,
        },
      ],
    })
  );

  server.resource(
    'schema/subsystems',
    'bimba://schema/subsystems',
    {
      description: 'M0-M5 subsystem domains and metaphysical organization',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'bimba://schema/subsystems',
          mimeType: 'text/markdown',
          text: `# Subsystem Domains (M0-M5)

The Subsystem coordinate defines which metaphysical or computational domain an entity belongs to—the system architecture that organizes knowledge and operation.

## M0: Anuttara
**The unsurpassable ground, proto-logical foundation**

The deepest logical foundation; the irreducible ground from which all logical systems derive. The unsurpassable base of being, the source of all logical structure.

- Domain: Proto-logic, foundational being
- Role: Provides ultimate grounding for all systems
- Entities: First principles, fundamental axioms
- Operation: Generates logical consistency

## M1: Paramasiva
**Definition engine, quaternal logic**

The system responsible for defining, naming, and establishing formal structures. Logic systems that establish boundaries and categories. The definitive/naming dimension.

- Domain: Ontology, taxonomy, categorization
- Role: Establishes definitions, creates formal structures
- Entities: Classifications, formal definitions, categories
- Operation: Defines and distinguishes entities

## M2: Parashakti (⭐ GraphRAG Home)
**Operation/vibration, cosmic imagination**

The dynamic, operational domain where ideas, queries, and transformations live. The imagination that generates possibilities through graph structure. The primary dwelling place of Moirai agents.

- Domain: Operations, transformations, possibilities
- Role: Generates operational possibilities, enables change
- Entities: Processes, operations, transformations, relationships
- Operation: Enables and coordinates all dynamic activity

## M3: Mahamaya
**Symbolic transcription, universal language**

The system of symbols, language, representation, and transcription that makes thought communicable and shareable. The symbolic and linguistic dimension.

- Domain: Symbols, language, representation
- Role: Makes knowledge communicable and shareable
- Entities: Symbols, words, representations, languages
- Operation: Transcribes and represents knowledge

## M4: Nara
**Personal interface, embodied context**

The individual, localized perspective; personal context, embodied experience, and user-specific frames. The subjective and personal dimension.

- Domain: Individual experience, user context, embodied knowledge
- Role: Localizes knowledge for individual users
- Entities: Personal notes, user preferences, embodied understanding
- Operation: Personalizes and localizes operations

## M5: Epii
**Synthesis orchestration, integration**

The orchestration layer that coordinates across all subsystems; brings disparate elements into unified action and deployment. The integrative and orchestrative dimension.

- Domain: Integration, orchestration, deployment
- Role: Coordinates across all subsystems
- Entities: Workflows, orchestrations, integrated systems
- Operation: Enables system-wide coordination

## Subsystem Interactions

### M0 ← M1 ← M2 ← M3 ← M4 ← M5
Progressive layers of operational specificity:
- M0: What is logically possible
- M1: How categories organize possibility
- M2: What dynamically manifests from M1 definitions
- M3: How M2 operations become communicable
- M4: How M3 symbols become personalized experience
- M5: How M0-M4 layers orchestrate together

### Day/Night Modes in Subsystems
- **Day Mode**: Subsystem actively operating, generating, manifesting
- **Night Mode**: Subsystem receptive, at rest, in potential

### Query Strategy by Subsystem
- **M0/M1 queries**: For foundational understanding, logical consistency
- **M2 queries**: For operational understanding, graph navigation (MOIRAI HOME)
- **M3 queries**: For meaning, interpretation, communication
- **M4 queries**: For personal context, user-specific understanding
- **M5 queries**: For integrated workflows, system-wide effects
`,
        },
      ],
    })
  );

  server.resource(
    'schema/relationships',
    'bimba://schema/relationships',
    {
      description: 'Relationship type documentation for graph navigation',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'bimba://schema/relationships',
          mimeType: 'text/markdown',
          text: `# Relationship Type Documentation

Relationships in the Bimba knowledge graph are **named and correspondential** — there is no positional \`POSn_*\` taxonomy. Do NOT request POS0_LINKS_TO / POS1_DEFINES / … : those types do not exist in the graph (the legacy positional scheme is retired per the S2 graph-schema canon).

**Always call \`graph_schema\` to get the live, authoritative list** of relationship types and their counts. The catalogue below is descriptive, not exhaustive (the graph carries ~1,400 distinct types, dominated by domain-specific correspondential edges).

## Relationship families (from S2 canon: graph-schema RELATIONSHIP_TYPE_SPECS)

### Seed-topology (the coordinate engine's own relations)
- **MANIFESTS** — an archetype manifests as a coordinate/family member
- **BEDROCK** — grounding to the raw archetype layer
- **FAMILY_CONTAINS** — a family contains its member coordinates
- **INVERTS_TO** — the # inversion act (X → X')
- **MOBIUS_RETURN** — #5 → #0 closure
- **GENERATES / ENTANGLES / INTERLEAVES / ANCHORED_TO** — seed weave relations

### Structural
- **CONTAINS / PART_OF / REFERENCES / SOURCES** — hierarchy and provenance

### LLM-inferred (semantic)
- **OPERATES_IN / REFLECTS_AS / ELABORATES / CONTRASTS / IMPLEMENTS / SUPPORTS / CRITIQUES / DERIVES_FROM**

### Sync
- **PROMOTES_TO / SYNCED_FROM**

### Correspondential (deep-dataset; the bulk of live edges)
Domain-specific edges emitted by dataset importers, e.g. **HAS_INTERNAL_COMPONENT**, **LINE_CHANGE**, **GOVERNS_DEGREE_ARC**, **FLOWS_CLOCKWISE**, **POLAR_OPPOSITE**, **CAUSAL_RESONANCE**, **YIELDS_CODON**, **HAS_DECAN**, **TRIKA_PRAKASA_VIMARSA**, **QUATERNAL_POLAR_COMPLEMENT**, and hundreds more. Discover these with \`graph_schema\` then traverse by the exact type.

## Filtering and traversal

- **graph_context** accepts \`rel_types: ["MANIFESTS","OPERATES_IN"]\` to restrict neighbors to those connecting relationship types; its output groups neighbors by actual \`type(rel)\`.
- **graph_traverse_positions** follows a \`rel_type_sequence\` hop by hop, e.g. \`["FAMILY_CONTAINS","MANIFESTS"]\`.
- **graph_traverse** accepts a \`rel_types\` filter of real types.
- **graph_cypher** can match any pattern directly, e.g. \`MATCH (n:Bimba {coordinate:$c})-[r]->(m) RETURN type(r), m.coordinate\`.

## Workflow

1. \`graph_schema\` → list the real relationship types (+ counts) and property-key prefixes.
2. Pick the exact type(s) you need.
3. Traverse with \`graph_context\` / \`graph_traverse\` / \`graph_traverse_positions\` / \`graph_cypher\`.
`,
        },
      ],
    })
  );

  // ---------------------------------------------------------------------------
  // Register Tools
  // ---------------------------------------------------------------------------

  server.tool(
    'resolve_coordinate',
    'Resolve a Bimba coordinate to its node data, optionally including children',
    ResolveCoordinateInputSchema.shape,
    async (args) => {
      validateCoordinate(args.coordinate);
      const result = await resolveCoordinate(
        args.coordinate,
        args.include_children ?? false,
        args.depth ?? 1
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'semantic_search',
    'Search the Bimba knowledge graph by natural language. NOTE: ranking is currently graph-structure (node degree) + keyword matching on names/content — true vector similarity is pending embedding generation (none stored yet). For precise lookups prefer resolve_coordinate / graph_cypher.',
    SemanticSearchInputSchema.shape,
    async (args) => {
      if (args.coordinate_filter) {
        validateCoordinate(args.coordinate_filter);
      }
      const result = await semanticSearch(
        args.query,
        args.limit ?? 10,
        args.coordinate_filter
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'get_context',
    'Get structural and/or semantic context for a coordinate',
    GetContextInputSchema.shape,
    async (args) => {
      validateCoordinate(args.coordinate);
      const result = await getContext(
        args.coordinate,
        args.context_type ?? 'structural'
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'list_coordinates',
    'List coordinates in the Bimba system, optionally filtered by type or parent',
    ListCoordinatesInputSchema.shape,
    async (args) => {
      if (args.parent) {
        validateCoordinate(args.parent);
      }
      const result = await listCoordinates(
        args.type,
        args.parent,
        args.limit ?? 20
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_query',
    'Query the Bimba knowledge graph by QL coordinate',
    GraphQueryInputSchema.shape,
    async (args) => {
      const result = await graphQuery(
        args.coordinate,
        args.include_nested ?? false,
        args.limit ?? 100
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_traverse',
    'Traverse the knowledge graph from a starting node, returning all connected paths',
    GraphTraverseInputSchema.shape,
    async (args) => {
      const result = await graphTraverse(
        args.start_uuid,
        args.max_depth ?? 3,
        args.rel_types,
        args.direction ?? 'out'
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_traverse_positions',
    'Traverse the knowledge graph following a sequence of real relationship types hop by hop (e.g. ["FAMILY_CONTAINS","MANIFESTS"]). Call graph_schema for the relationship-type vocabulary. (The legacy positional POSn_* scheme is retired — it exists nowhere in the graph.)',
    GraphTraversePositionsInputSchema.shape,
    async (args) => {
      const result = await graphTraversePositions(
        args.start_uuid,
        args.rel_type_sequence,
        args.max_per_position ?? 10
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_context',
    'Gather context around an entity by retrieving its neighborhood and organized connections',
    GraphContextInputSchema.shape,
    async (args) => {
      const result = await graphContext(
        args.entity_uuid,
        args.depth ?? 2,
        args.mode ?? 'balanced',
        args.rel_types
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'spec_retrieve',
    'Retrieve the canon-engine coordinate payload as a byte-identical MCP wire mirror of epi canon coord',
    SpecRetrieveInputSchema.shape,
    async (args) => {
      const result = await specRetrieveContentText(args);
      return {
        content: [{ type: 'text', text: result }],
      };
    }
  );

  server.tool(
    'graph_search',
    'Hybrid search over the graph. NOTE: vector modes currently fall back to graph-structure (degree) + keyword ranking — no embeddings are stored yet, so vector_only/hybrid behave as graph-ranked. Chunk-aware search returns nothing until the chunk pipeline is populated.',
    GraphSearchInputSchema.shape,
    async (args) => {
      const result = await graphSearch(
        args.query,
        args.top_k ?? 10,
        args.coordinates,
        args.mode ?? 'hybrid_rrf',
        args.search_chunks ?? true,
        args.expand_to_parent ?? false
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_disclosure',
    'Provide progressive disclosure of entity information at specified level (0-5), wrapping GraphRAGRetriever.progressive_disclosure()',
    GraphDisclosureInputSchema.shape,
    async (args) => {
      const result = await graphDisclosure(
        args.entity_uuid,
        args.level ?? 0
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_embed',
    'Generate embeddings using Gemini API with optional storage in Neo4j graph. Supports single text or batch mode (texts[]) for efficient processing. Supports task type optimization and configurable dimensions.',
    GraphEmbedInputSchema.shape,
    async (args: unknown) => {
      const input = args as {
        text?: string;
        texts?: string[];
        task_type?: string;
        dimensions?: number;
        store_for?: string | string[];
      };

      // Validate: either text or texts must be provided, but not both
      const hasText = input.text !== undefined && input.text !== '';
      const hasTexts = input.texts !== undefined && input.texts.length > 0;

      if (!hasText && !hasTexts) {
        throw new Error('Either text or texts must be provided');
      }

      if (hasText && hasTexts) {
        throw new Error('Cannot provide both text and texts');
      }

      // Validate: if store_for is array, texts must be provided with matching length
      if (Array.isArray(input.store_for) && input.texts) {
        if (input.store_for.length !== input.texts.length) {
          throw new Error(`store_for array length (${input.store_for.length}) must match texts array length (${input.texts.length})`);
        }
      }

      // Batch mode: when texts[] is provided
      if (input.texts && input.texts.length > 0) {
        const result: BatchEmbeddingResult = await embedBatch(
          input.texts,
          (input.task_type ?? 'SEMANTIC_SIMILARITY') as any,
          (input.dimensions ?? 3072) as any,
          Array.isArray(input.store_for) ? input.store_for : undefined
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      // Single mode: when text is provided
      if (input.text) {
        const result: EmbeddingResult = await embed(
          input.text,
          (input.task_type ?? 'SEMANTIC_SIMILARITY') as any,
          (input.dimensions ?? 3072) as any,
          typeof input.store_for === 'string' ? input.store_for : undefined
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      // Should not reach here
      throw new Error('Invalid input: either text or texts must be provided');
    }
  );

  server.tool(
    'graph_embed_batch',
    'Batch-embed a focused set of :Bimba nodes into c_5_embedding (3072-d) so they become vector-searchable — target by coordinate branch (coordinate_prefix, e.g. "M1"), by label, and/or only_missing nodes. Composes embedding text from each node\'s name/description/rich fields. Requires GEMINI_API_KEY + GEMINI_EMBEDDING_MODEL (auto-detected from your shell at startup). Re-run to continue large branches. Returns per-node status.',
    GraphEmbedBatchInputSchema.shape,
    async (args) => {
      const input = GraphEmbedBatchInputSchema.parse(args);
      const result = await embedNodes({
        coordinatePrefix: input.coordinate_prefix,
        label: input.label,
        onlyMissing: input.only_missing,
        limit: input.limit,
        dimensions: input.dimensions,
        taskType: input.task_type,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_validate',
    'Validate graph alignment and integrity, checking coordinate consistency, relationship types, and embedding presence',
    GraphValidateInputSchema.shape,
    async (args) => {
      const result: ValidationResult = await validate(
        args.scope ?? 'full',
        args.coordinate_filter
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_sync',
    'Synchronize files between Obsidian vault and Neo4j graph, supporting one-way and bidirectional sync with conflict detection',
    GraphSyncInputSchema.shape,
    async (args) => {
      const result: SyncResult = await sync(
        args.path,
        args.direction ?? 'obsidian_to_neo4j',
        args.coordinate_filter,
        args.dry_run ?? false
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_chunk',
    'Chunk documents and store chunks as graph nodes with parent relationships, inheriting parent coordinates and generating embeddings',
    GraphChunkInputSchema.shape,
    async (args) => {
      const result: GraphChunkResult = await chunk({
        file_path: args.file_path,
        chunk_size: args.chunk_size,
        overlap: args.overlap,
        generate_context: args.generate_context,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_rerank',
    'Rerank retrieved results using cross-encoder models (mxbai-rerank-large-v2 primary, FlashRank fallback) to improve precision from N=50-100 to K=5-10',
    GraphRerankInputSchema.shape,
    async (args) => {
      const result: GraphRerankOutput = await rerank(
        args.query,
        args.candidates,
        args.top_k ?? 10,
        args.model ?? 'mxbai-rerank-large-v2',
        args.use_cache ?? true
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'telegram_send_message',
    'Send a message to an allowlisted Telegram group chat',
    TelegramSendMessageInputSchema.shape,
    async (args) => {
      if (!telegramService) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Telegram MCP is disabled. Set TELEGRAM_MCP_ENABLED=true and required TELEGRAM_* env vars.'
        );
      }

      const chatId = telegramService.resolveChatId(args.chat_id);
      const sent = await telegramService.sendMessage(chatId, args.text, args.thread_id);
      const result = toTelegramToolMessage(sent);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'telegram_get_recent_messages',
    'Get recently observed messages from an allowlisted Telegram group chat',
    TelegramGetRecentMessagesInputSchema.shape,
    async (args) => {
      if (!telegramService) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Telegram MCP is disabled. Set TELEGRAM_MCP_ENABLED=true and required TELEGRAM_* env vars.'
        );
      }

      const chatId = telegramService.resolveChatId(args.chat_id);
      const messages = telegramService.getRecentMessages(chatId, args.limit ?? 20)
        .map(toTelegramToolMessage);
      const result: TelegramGetRecentMessagesOutput = {
        chat_id: chatId,
        count: messages.length,
        messages,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'telegram_reply',
    'Reply to a message in an allowlisted Telegram group chat',
    TelegramReplyInputSchema.shape,
    async (args) => {
      if (!telegramService) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Telegram MCP is disabled. Set TELEGRAM_MCP_ENABLED=true and required TELEGRAM_* env vars.'
        );
      }

      const chatId = telegramService.resolveChatId(args.chat_id);
      const sent = await telegramService.reply(chatId, args.message_id, args.text);
      const result = toTelegramToolMessage(sent);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_admin',
    'Administrative operations: create/drop vector indexes, list indexes, retrieve schema information, and get graph statistics. Destructive operations (create_index, drop_index) should be restricted by admin flag in MCP configuration.',
    GraphAdminInputSchema.shape,
    async (args) => {
      const result: GraphAdminOutput = await admin(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ---------------------------------------------------------------------------
  // Raw Cypher + CRUD + introspection (open-schema escape hatch)
  // Use the curated tools (graph_query, graph_context, resolve_coordinate,
  // spec_retrieve) for shaped, known-coordinate reads. Use these to explore the
  // REAL schema, reach properties/labels/relationships the curated tools don't
  // model, or mutate the graph. Run graph_schema first to discover the actual
  // labels, relationship types, and property-key prefixes before guessing.
  // ---------------------------------------------------------------------------

  server.tool(
    'graph_cypher',
    'Execute an arbitrary parametrized Cypher statement against the Bimba Neo4j graph. Read-only by default (rejects CREATE/MERGE/SET/DELETE/REMOVE and uses a READ session); set write:true for mutations. ALWAYS use $params for values — never interpolate values into the query string. Single statement only. Run graph_schema first to discover real labels/relationship-types/property-keys.',
    GraphCypherInputSchema.shape,
    async (args) => {
      const result = await runCypher(GraphCypherInputSchema.parse(args));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_schema',
    'Introspect the live graph: node labels, relationship types, property keys, property-key prefix inventory ({family}_{n}_), and per-label/type counts. Discover the real schema instead of guessing. Note: relationships are named/correspondential (MANIFESTS, OPERATES_IN, HAS_INTERNAL_COMPONENT…), NOT positional POSn_*.',
    GraphSchemaInputSchema.shape,
    async (args) => {
      const result = await graphSchema(GraphSchemaInputSchema.parse(args));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_upsert_node',
    'MERGE a node on an anchor key (coordinate by default, or uuid/match_key) and SET arbitrary properties + labels. ANY property key is allowed, prefixed or not (e.g. {"coordinate":"M2-5","c_1_name":"X","custom_flag":true}). Idempotent.',
    GraphUpsertNodeInputSchema.shape,
    async (args) => {
      const result = await upsertNode(GraphUpsertNodeInputSchema.parse(args));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_set_property',
    'SET and/or REMOVE individual properties on a located node (located by coordinate, uuid, or match_key/value). Any property key allowed, prefixed or not.',
    GraphSetPropertyInputSchema.shape,
    async (args) => {
      const result = await setProperty(GraphSetPropertyInputSchema.parse(args));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_add_label',
    'Add one or more labels to a located node.',
    GraphLabelInputSchema.shape,
    async (args) => {
      const result = await setLabels(GraphLabelInputSchema.parse(args), 'add');
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_remove_label',
    'Remove one or more labels from a located node.',
    GraphLabelInputSchema.shape,
    async (args) => {
      const result = await setLabels(GraphLabelInputSchema.parse(args), 'remove');
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_create_relationship',
    'MERGE (idempotent, default) or CREATE a typed relationship between two located nodes. rel_type is any valid type (e.g. MANIFESTS, INVERTS_TO, GENERATES). Both endpoints located by coordinate, uuid, or match_key/value.',
    GraphCreateRelationshipInputSchema.shape,
    async (args) => {
      const result = await createRelationship(GraphCreateRelationshipInputSchema.parse(args));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_delete_relationship',
    'Delete relationship(s) between two located nodes. If rel_type is omitted, deletes relationships of ANY type. direction: out (default) | in | both.',
    GraphDeleteRelationshipInputSchema.shape,
    async (args) => {
      const result = await deleteRelationship(GraphDeleteRelationshipInputSchema.parse(args));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'graph_delete_node',
    'Delete a located node. detach:false (default) fails if relationships exist; detach:true removes the node AND its relationships. Requires confirm:true.',
    GraphDeleteNodeInputSchema.shape,
    async (args) => {
      const result = await deleteNode(GraphDeleteNodeInputSchema.parse(args));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ---------------------------------------------------------------------------
  // Start Server
  // ---------------------------------------------------------------------------

  // Establish the Neo4j connection BEFORE serving requests. Without this the
  // singleton driver stays null, isConnected() returns false, and every tool
  // throws "Not connected to Neo4j". We do not let a DB failure abort startup —
  // the server still registers its tools so Claude Desktop sees them, and the
  // per-call connection guards surface a clear error instead of a silent hang.
  const connectionManager = getNeo4jConnectionManager();
  try {
    await connectionManager.connect();
    const { uri } = connectionManager.getConfig();
    console.error(`[bimba-mcp] Connected to Neo4j at ${uri}`);
  } catch (error) {
    console.error(
      '[bimba-mcp] WARNING: Neo4j connection failed at startup; tool calls will error until the database is reachable:',
      error instanceof Error ? error.message : String(error)
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  telegramService?.start();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    telegramService?.stop();
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    telegramService?.stop();
    await server.close();
    process.exit(0);
  });
}

function toTelegramToolMessage(message: TelegramCachedMessage): TelegramToolMessage {
  return {
    update_id: message.updateId,
    chat_id: message.chatId,
    chat_title: message.chatTitle,
    message_id: message.messageId,
    from_user_id: message.fromUserId,
    from_username: message.fromUsername,
    text: message.text,
    timestamp: message.timestamp,
  };
}

main().catch((error: unknown) => {
  console.error('Failed to start Bimba MCP server:', error);
  process.exit(1);
});
