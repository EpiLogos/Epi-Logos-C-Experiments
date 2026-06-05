/**
 * Zod schemas for Bimba MCP tool inputs and outputs
 *
 * These schemas define the structure of data exchanged between
 * Claude and the Bimba MCP server.
 */

import { z } from 'zod';
import type { GraphResult } from './schemas/graph.js';
import { isCanonicalCoordinateSyntax } from './coordinates/syntax.js';

// Re-export graph schemas for convenience
export * from './schemas/graph.js';
export { GraphContextInputSchema, SpecRetrieveInputSchema, GraphSearchInputSchema, GraphDisclosureInputSchema, GraphEmbedInputSchema, GraphValidateInputSchema, GraphChunkInputSchema, GraphChunkOutputSchema } from './schemas/graph.js';
export type { ContextResult, SpecResult, GraphSearchInput, GraphSearchOutput, RetrievalResult, GraphDisclosureInput, DisclosureResult, GraphEmbedInput, EmbeddingResult, GraphValidateInput, ValidationResult, ValidationDetail, GraphChunkInput, GraphChunkResult } from './schemas/graph.js';

// Re-export sync schemas for convenience
export { GraphSyncInputSchema, SyncDirectionSchema, SyncResultSchema, SyncStatsSchema, ConflictSchema } from './schemas/sync.js';
export type { GraphSyncInput, SyncDirection, SyncResult, SyncStats, Conflict } from './schemas/sync.js';

// Re-export reranking schemas for convenience
export { GraphRerankInputSchema, RankedResultSchema, GraphRerankOutputSchema, RerankStatsSchema } from './schemas/reranking.js';
export type { GraphRerankInput, RankedResult, GraphRerankOutput, RerankStats } from './schemas/reranking.js';

// =============================================================================
// Coordinate System Schemas
// =============================================================================

/**
 * Valid coordinate type prefixes per coordinate-syntax.md
 * P = Position, C = Category, M = Subsystem, S = Stack, T = Thought, L = Lens
 */
export const CoordinateTypeSchema = z.enum(['P', 'C', 'M', 'S', 'T', 'L']);

/**
 * Bimba coordinate syntax:
 * - '-' for ordinary branch descent
 * - '.' only after a 4 segment
 * - parenthesized context frames limited to canonical CF literals
 */
export const CoordinateSchema = z.string()
  .refine(
    isCanonicalCoordinateSyntax,
    'Invalid coordinate format. Must match canonical syntax like P2, M2-5, S2-4, M1-3-4.(00/00), S2\''
  )
  .describe('Bimba coordinate (e.g., P2, M2-5, S2-4, M1-3-4.(00/00), S2\')');

// =============================================================================
// Tool Input Schemas
// =============================================================================

/**
 * Input schema for resolve_coordinate tool
 */
export const ResolveCoordinateInputSchema = z.object({
  coordinate: CoordinateSchema,
  include_children: z.boolean()
    .optional()
    .default(false)
    .describe('Whether to include child nodes in the response'),
  depth: z.number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .default(1)
    .describe('Traversal depth for related nodes (0-5)')
});

export type ResolveCoordinateInput = z.infer<typeof ResolveCoordinateInputSchema>;

/**
 * Input schema for semantic_search tool
 */
export const SemanticSearchInputSchema = z.object({
  query: z.string()
    .min(1)
    .max(500)
    .describe('Natural language search query'),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .describe('Maximum number of results to return'),
  coordinate_filter: CoordinateSchema
    .optional()
    .describe('Filter results to descendants of this coordinate')
});

export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;

/**
 * Input schema for get_context tool
 */
export const GetContextInputSchema = z.object({
  coordinate: CoordinateSchema,
  context_type: z.enum(['structural', 'semantic', 'full'])
    .optional()
    .default('structural')
    .describe('Type of context to retrieve')
});

export type GetContextInput = z.infer<typeof GetContextInputSchema>;

/**
 * Input schema for list_coordinates tool
 */
export const ListCoordinatesInputSchema = z.object({
  type: CoordinateTypeSchema
    .optional()
    .describe('Filter by coordinate type (P, C, M, S, T, L)'),
  parent: CoordinateSchema
    .optional()
    .describe('Filter to children of this coordinate'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Maximum number of coordinates to return')
});

export type ListCoordinatesInput = z.infer<typeof ListCoordinatesInputSchema>;

/**
 * Input schema for telegram_send_message tool
 */
export const TelegramSendMessageInputSchema = z.object({
  chat_id: z.number()
    .int()
    .optional()
    .describe('Telegram chat ID. Optional when TELEGRAM_DEFAULT_CHAT_ID is configured'),
  text: z.string()
    .min(1)
    .max(4096)
    .describe('Message body text'),
  thread_id: z.number()
    .int()
    .optional()
    .describe('Optional Telegram thread/topic ID for supergroups')
});

export type TelegramSendMessageInput = z.infer<typeof TelegramSendMessageInputSchema>;

/**
 * Input schema for telegram_get_recent_messages tool
 */
export const TelegramGetRecentMessagesInputSchema = z.object({
  chat_id: z.number()
    .int()
    .optional()
    .describe('Telegram chat ID. Optional when TELEGRAM_DEFAULT_CHAT_ID is configured'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Number of most recent messages to return')
});

export type TelegramGetRecentMessagesInput = z.infer<typeof TelegramGetRecentMessagesInputSchema>;

/**
 * Input schema for telegram_reply tool
 */
export const TelegramReplyInputSchema = z.object({
  chat_id: z.number()
    .int()
    .optional()
    .describe('Telegram chat ID. Optional when TELEGRAM_DEFAULT_CHAT_ID is configured'),
  message_id: z.number()
    .int()
    .describe('Message ID to reply to'),
  text: z.string()
    .min(1)
    .max(4096)
    .describe('Reply body text')
});

export type TelegramReplyInput = z.infer<typeof TelegramReplyInputSchema>;

/**
 * Input schema for graph_query tool
 *
 * Accepts coordinates in multiple formats:
 * - '#' - wildcard for all nodes
 * - Single: 'P2', 'M3', 'C1', etc.
 * - Range: 'M2-5' (M2 through M5)
 * - Inner position: 'M4.4'
 * - Full QL: 'C3-P2-M1-S2-T1-L0'
 * - With wildcards: 'C3-P2-*-*-*-*'
 */
export const GraphQueryInputSchema = z.object({
  coordinate: z.string()
    .refine(
      (val) => val === '#' || /^[CPMSLT][\d\-\.]*(\*)?$/.test(val),
      'Invalid coordinate format. Use # (wildcard), or coordinate like P2, M2-5, C3-P2-M*'
    )
    .describe('Bimba coordinate pattern to query (# for all, PN, PN-M, C-P-M-S-T-L, etc.)'),
  include_nested: z.boolean()
    .optional()
    .default(false)
    .describe('Include nested position arrays (p0_*, p1_*, etc.) in results'),
  limit: z.number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .default(100)
    .describe('Maximum number of nodes to return (1-1000)')
});

export type GraphQueryInput = z.infer<typeof GraphQueryInputSchema>;

// =============================================================================
// Tool Output Schemas
// =============================================================================

/**
 * Node data structure from Neo4j
 */
export const BimbaNodeSchema = z.object({
  coordinate: CoordinateSchema,
  title: z.string().describe('Human-readable title'),
  description: z.string().optional().describe('Detailed description'),
  type: CoordinateTypeSchema,
  properties: z.record(z.unknown()).optional().describe('Additional node properties')
});

export type BimbaNode = z.infer<typeof BimbaNodeSchema>;

/**
 * Output schema for resolve_coordinate tool
 */
export const ResolveCoordinateOutputSchema = z.object({
  node: BimbaNodeSchema,
  children: z.array(BimbaNodeSchema).optional(),
  path: z.array(CoordinateSchema).describe('Path from root to this node')
});

export type ResolveCoordinateOutput = z.infer<typeof ResolveCoordinateOutputSchema>;

/**
 * Search result item
 */
export const SearchResultSchema = z.object({
  node: BimbaNodeSchema,
  score: z.number().min(0).max(1).describe('Relevance score'),
  snippet: z.string().optional().describe('Matching text snippet')
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * Output schema for semantic_search tool
 */
export const SemanticSearchOutputSchema = z.object({
  results: z.array(SearchResultSchema),
  total_count: z.number().int().describe('Total matching results before limit'),
  query_coordinate: CoordinateSchema.optional()
});

export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;

/**
 * Output schema for get_context tool
 */
export const GetContextOutputSchema = z.object({
  coordinate: CoordinateSchema,
  structural_context: z.object({
    parent: BimbaNodeSchema.optional(),
    siblings: z.array(BimbaNodeSchema),
    children: z.array(BimbaNodeSchema)
  }).optional(),
  semantic_context: z.object({
    related: z.array(BimbaNodeSchema),
    tags: z.array(z.string())
  }).optional()
});

export type GetContextOutput = z.infer<typeof GetContextOutputSchema>;

/**
 * Output schema for list_coordinates tool
 */
export const ListCoordinatesOutputSchema = z.object({
  coordinates: z.array(BimbaNodeSchema),
  total_count: z.number().int(),
  has_more: z.boolean()
});

export type ListCoordinatesOutput = z.infer<typeof ListCoordinatesOutputSchema>;

/**
 * Telegram message shape returned by telegram tools
 */
export const TelegramToolMessageSchema = z.object({
  update_id: z.number().int().describe('Telegram update ID (or 0 for outbound-only events)'),
  chat_id: z.number().int(),
  chat_title: z.string().nullable(),
  message_id: z.number().int(),
  from_user_id: z.number().int().nullable(),
  from_username: z.string().nullable(),
  text: z.string(),
  timestamp: z.string().describe('ISO-8601 timestamp')
});

export type TelegramToolMessage = z.infer<typeof TelegramToolMessageSchema>;

export const TelegramGetRecentMessagesOutputSchema = z.object({
  chat_id: z.number().int(),
  count: z.number().int(),
  messages: z.array(TelegramToolMessageSchema)
});

export type TelegramGetRecentMessagesOutput = z.infer<typeof TelegramGetRecentMessagesOutputSchema>;

// =============================================================================
// Error Schemas
// =============================================================================

/**
 * Output schema for graph_query tool
 *
 * Returns a GraphResult containing matched nodes and edges from the Neo4j graph
 */
export type GraphQueryOutput = GraphResult;

/**
 * Standard error response
 */
export const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
