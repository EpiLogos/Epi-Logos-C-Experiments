/**
 * Zod schemas for graph synchronization between Obsidian vault and Neo4j
 *
 * Defines input/output schemas for the graph-sync MCP tool which handles
 * bidirectional synchronization of files and graph nodes.
 */

import { z } from 'zod';

// =============================================================================
// Sync Direction and Configuration
// =============================================================================

/**
 * Direction of synchronization
 *
 * - obsidian_to_neo4j: Vault files → Neo4j nodes (default)
 * - neo4j_to_obsidian: Neo4j nodes → Vault files
 * - bidirectional: Sync both directions and detect conflicts
 */
export const SyncDirectionSchema = z.enum([
  'obsidian_to_neo4j',
  'neo4j_to_obsidian',
  'bidirectional',
]);

export type SyncDirection = z.infer<typeof SyncDirectionSchema>;

// =============================================================================
// Sync Statistics
// =============================================================================

/**
 * Statistics for one direction of sync (e.g., vault→graph operations)
 */
export const SyncStatsSchema = z.object({
  processed: z.number()
    .int()
    .nonnegative()
    .describe('Total items processed'),
  created: z.number()
    .int()
    .nonnegative()
    .describe('New items created'),
  updated: z.number()
    .int()
    .nonnegative()
    .describe('Existing items updated'),
  deleted: z.number()
    .int()
    .nonnegative()
    .describe('Items deleted'),
  failed: z.number()
    .int()
    .nonnegative()
    .describe('Items that failed to sync'),
  skipped: z.number()
    .int()
    .nonnegative()
    .describe('Items skipped (no changes)'),
});

export type SyncStats = z.infer<typeof SyncStatsSchema>;

// =============================================================================
// Conflict Detection
// =============================================================================

/**
 * Represents a conflict detected during bidirectional sync
 */
export const ConflictSchema = z.object({
  item_id: z.string()
    .describe('UUID or file path of the conflicting item'),
  item_type: z.enum(['file', 'node'])
    .describe('Whether conflict is in vault file or Neo4j node'),
  last_modified_vault: z.string()
    .datetime()
    .optional()
    .describe('Last modification timestamp in vault'),
  last_modified_graph: z.string()
    .datetime()
    .optional()
    .describe('Last modification timestamp in graph'),
  conflict_type: z.enum(['diverged_changes', 'deletion_mismatch', 'content_mismatch'])
    .describe('Type of conflict detected'),
  recommendation: z.string()
    .describe('Suggested resolution strategy'),
});

export type Conflict = z.infer<typeof ConflictSchema>;

// =============================================================================
// Sync Result
// =============================================================================

/**
 * Complete result of a sync operation
 *
 * Includes statistics for each direction of sync and any detected conflicts.
 */
export const SyncResultSchema = z.object({
  success: z.boolean()
    .describe('Whether sync completed without errors'),
  direction: SyncDirectionSchema
    .describe('Direction(s) that were synced'),
  start_time: z.string()
    .datetime()
    .describe('ISO 8601 timestamp when sync started'),
  end_time: z.string()
    .datetime()
    .describe('ISO 8601 timestamp when sync completed'),
  execution_time_ms: z.number()
    .nonnegative()
    .describe('Total execution time in milliseconds'),

  // Statistics for vault-to-graph direction
  vault_to_graph: SyncStatsSchema
    .describe('Statistics for syncing vault files to Neo4j nodes'),

  // Statistics for graph-to-vault direction (only for neo4j_to_obsidian or bidirectional)
  graph_to_vault: SyncStatsSchema
    .optional()
    .describe('Statistics for syncing Neo4j nodes to vault files'),

  // Conflict information (only for bidirectional sync)
  conflicts: z.array(ConflictSchema)
    .optional()
    .describe('Conflicts detected during bidirectional sync'),

  // Additional metadata
  files_processed: z.array(z.string())
    .optional()
    .describe('List of file paths that were processed'),

  error_message: z.string()
    .optional()
    .describe('Error message if sync failed'),
});

export type SyncResult = z.infer<typeof SyncResultSchema>;

// =============================================================================
// Input Schema for graph-sync tool
// =============================================================================

/**
 * Input schema for graph-sync MCP tool
 *
 * Controls which direction to sync and optional filtering by coordinate or path.
 */
export const GraphSyncInputSchema = z.object({
  path: z.string()
    .refine(
      (val) => val === 'all' || val.length > 0,
      'path must be "all" or a valid vault path'
    )
    .describe('Relative path within vault (e.g., "Idea/Pratibimba/Self") or "all" for full sync'),

  direction: SyncDirectionSchema
    .optional()
    .default('obsidian_to_neo4j')
    .describe('Direction of sync: obsidian_to_neo4j (default), neo4j_to_obsidian, or bidirectional'),

  dry_run: z.boolean()
    .optional()
    .default(false)
    .describe('If true, report what would be synced without making changes'),

  coordinate_filter: z.string()
    .optional()
    .describe('Optional coordinate filter (e.g., "P2", "M2-5") to sync only matching nodes'),
});

export type GraphSyncInput = z.infer<typeof GraphSyncInputSchema>;
