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
import type { GraphTraverseOutput, ContextResult, SpecResult, CoordinateFilter, DisclosureResult, GraphTraversePositionsOutput, GraphAdminOutput } from './schemas/graph.js';
import { GraphTraversePositionsInputSchema, GraphAdminInputSchema } from './schemas/graph.js';
import { isCanonicalCoordinateSyntax } from './coordinates/syntax.js';
import { parseCoordinate } from './coordinates/parser.js';

import { queryByCoordinate, traverse, traversePositions, context, spec, search, disclosure, embed, embedBatch, validate, chunk, rerank, admin, mapNeo4jNode } from './api/graph.js';
import { sync } from './api/sync.js';
import { getNeo4jConnectionManager } from './db/neo4j.js';
import { loadTelegramConfig } from './telegram/config.js';
import { TelegramService } from './telegram/service.js';
import type { TelegramCachedMessage } from './telegram/types.js';

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
  const params: Record<string, unknown> = { limit: limit ?? 20 };

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
  position_sequence: number[],
  max_per_position?: number
): Promise<GraphTraversePositionsOutput> {
  return traversePositions(start_uuid, position_sequence, max_per_position);
}

async function graphContext(
  entity_uuid: string,
  depth?: number,
  mode?: 'narrow' | 'balanced' | 'wide',
  positions?: number[]
): Promise<ContextResult> {
  return context(entity_uuid, depth, mode, positions);
}

async function specRetrieve(
  entity_name: string,
  include_connected?: boolean,
  max_connected_per_position?: number
): Promise<SpecResult> {
  return spec(entity_name, include_connected, max_connected_per_position);
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

async function main(): Promise<void> {
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

Relationships in the Bimba knowledge graph encode both structural and semantic meaning. Relationship types follow position-based naming conventions and carry specific traversal semantics.

## Position-Based Relationships

Relationships named with position patterns (e.g., POS0_LINKS_TO, POS1_DEFINES) indicate the semantic level at which the relationship operates.

### POS0 Relationships (Ground Level)
**Raw connections, basic adjacency**

- **POS0_LINKS_TO**: Direct reference without semantic interpretation
- **POS0_REFERENCES**: Basic connection between entities
- Semantic level: Bare fact of relatedness
- Traversal: Broadest possible scope, most connections

### POS1 Relationships (Definition Level)
**Material composition, constituents**

- **POS1_DEFINES**: X is part of what makes Y
- **POS1_CONTAINS**: X contains Y as a component
- **POS1_COMPOSED_OF**: X is composed of Y elements
- Semantic level: Structural composition
- Traversal: Finding components and constituents

### POS2 Relationships (Operation Level)
**Processes, methods, operations**

- **POS2_ENABLES**: X enables/allows Y to happen
- **POS2_REQUIRES**: X requires Y to operate
- **POS2_TRANSFORMS**: X transforms into Y
- **POS2_IMPLEMENTS**: X implements method/process Y
- Semantic level: Operational causality
- Traversal: Finding operations and methods

### POS3 Relationships (Pattern Level)
**Recurring structures, templates**

- **POS3_INSTANTIATES**: X is an instance of pattern Y
- **POS3_EXEMPLIFIES**: X exemplifies structure Y
- **POS3_FOLLOWS**: X follows template Y
- Semantic level: Pattern matching
- Traversal: Finding archetypal relationships

### POS4 Relationships (Context Level)
**Temporal, spatial, circumstantial**

- **POS4_PRECEDES**: X temporally precedes Y
- **POS4_INFLUENCES**: X influences Y in context
- **POS4_LOCATED_IN**: X is located in context Y
- **POS4_DURING**: X occurs during period Y
- Semantic level: Contextual situation
- Traversal: Finding temporal and spatial relations

### POS5 Relationships (Integration Level)
**Synthesis, wholeness**

- **POS5_INTEGRATES**: X is integrated with Y
- **POS5_SYNTHESIZES**: X synthesizes Y elements
- **POS5_COMPLETES**: X completes/fulfills Y
- Semantic level: Holistic coherence
- Traversal: Finding comprehensive connections

## General Relationships

### Structural
- **CONTAINS**: Hierarchical containment (parent-child)
- **REFERENCES**: General reference relationship
- **RELATED_TO**: Generic relationship

### Semantic
- **DESCRIBES**: X describes Y
- **EXPLAINS**: X explains Y
- **INTERPRETS**: X provides interpretation of Y

### Graph-Specific
- **CHUNK_OF**: Relationship from chunk to parent document (chunking module)
- **LENS_VIEW**: Relationship through a particular lens (L-coordinate perspective)

## Relationship Filtering in Queries

When traversing the graph, you can filter by relationship types:

    
traverse(start_node, rel_types: ["POS0_LINKS_TO", "POS1_DEFINES"], max_depth: 2)


This finds only entities connected through the specified relationship types.

## Relationship Interpretation Rules

1. **Position determines semantics**: POS2_ENABLES is about operations, not raw facts
2. **Day/Night mode affects meaning**: Same relationship in night mode might be receptive vs. active
3. **Prime aspect matters**: POS2 (canonical operation) vs. POS2' (operational instance)
4. **Directionality**: Relationships can be traversed in/out or in specific directions
5. **Combinatoric meaning**: Paths of multiple relationships create richer meaning

## Common Traversal Patterns

### "What is X made of?" (P1 level)
Use POS1 relationships: DEFINES, CONTAINS, COMPOSED_OF

### "How does X work?" (P2 level)
Use POS2 relationships: ENABLES, REQUIRES, TRANSFORMS, IMPLEMENTS

### "What pattern does X follow?" (P3 level)
Use POS3 relationships: INSTANTIATES, EXEMPLIFIES, FOLLOWS

### "What is X's context?" (P4 level)
Use POS4 relationships: PRECEDES, INFLUENCES, LOCATED_IN, DURING

### "What does X integrate with?" (P5 level)
Use POS5 relationships: INTEGRATES, SYNTHESIZES, COMPLETES
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
    'Search the Bimba knowledge graph using natural language',
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
    'Traverse the knowledge graph following a specific sequence of QL position levels (P0-P5)',
    GraphTraversePositionsInputSchema.shape,
    async (args) => {
      const result = await graphTraversePositions(
        args.start_uuid,
        args.position_sequence,
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
        args.positions
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'spec_retrieve',
    'Retrieve entity specification including coordinates, content, and connected entities organized by position',
    SpecRetrieveInputSchema.shape,
    async (args) => {
      const result = await specRetrieve(
        args.entity_name,
        args.include_connected ?? true,
        args.max_connected_per_position ?? 10
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'graph_search',
    'Perform hybrid search combining vector similarity and graph structure, with optional chunk-aware search and parent document expansion',
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
          (input.dimensions ?? 768) as any,
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
          (input.dimensions ?? 768) as any,
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
  // Start Server
  // ---------------------------------------------------------------------------

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
