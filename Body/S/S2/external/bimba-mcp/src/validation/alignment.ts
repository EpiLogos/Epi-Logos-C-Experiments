/**
 * AlignmentValidator - Validates graph alignment and integrity
 *
 * Checks coordinate consistency and embedding coverage across the canonical
 * :Bimba subgraph. Relationship types are an OPEN, named/correspondential
 * vocabulary (~1,400 types) — they are NOT validated against a fixed allowlist.
 */

import { getNeo4jConnectionManager } from '../db/neo4j.js';
import type { ValidationResult, ValidationDetail, CoordinateFilter } from '../schemas/graph.js';

// =============================================================================
// Validation Constants
// =============================================================================

// Valid leading characters for a coordinate: the six families plus the raw '#'
// archetype marker (e.g. "#", "#0"). Lowercase reflective coordinates (cpf, ct,
// …) are also accepted.
const VALID_COORDINATE_HEADS = ['#', 'C', 'P', 'M', 'S', 'T', 'L', 'c', 'p', 's', 't', 'm', 'l'];

// =============================================================================
// Helpers
// =============================================================================

/** Convert a Neo4j Integer (or plain number) to a JS number. */
function toNum(v: unknown): number {
  if (v && typeof v === 'object' && typeof (v as { toNumber?: () => number }).toNumber === 'function') {
    return (v as { toNumber: () => number }).toNumber();
  }
  return typeof v === 'number' ? v : Number(v ?? 0);
}

// =============================================================================
// AlignmentValidator Class
// =============================================================================

/**
 * Validates graph alignment and integrity with configurable scope
 */
export class AlignmentValidator {
  /**
   * Validate the canonical :Bimba subgraph (or a filtered subset)
   *
   * @param scope Scope of validation: 'full', 'coordinates', 'relationships', 'embeddings'
   * @param coordinateFilter Optional filter for specific coordinates
   * @returns ValidationResult with comprehensive report
   */
  async validate(
    scope: 'full' | 'coordinates' | 'relationships' | 'embeddings' = 'full',
    coordinateFilter?: CoordinateFilter
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const details: ValidationDetail[] = [];

    try {
      const filterCondition = this.buildCoordinateFilterCondition(coordinateFilter);

      if (scope === 'full' || scope === 'coordinates') {
        details.push(...(await this.validateCoordinates(filterCondition)));
      }

      if (scope === 'full' || scope === 'relationships') {
        details.push(...(await this.validateRelationships()));
      }

      if (scope === 'full' || scope === 'embeddings') {
        details.push(...(await this.validateEmbeddings(filterCondition)));
      }

      const stats = await this.getValidationStatistics(scope, filterCondition);

      const errors = details.filter((d) => d.severity === 'error');
      const warnings = details.filter((d) => d.severity === 'warning');

      const result: ValidationResult = {
        passed: errors.length === 0,
        scope,
        total_nodes_checked: stats.totalNodes,
        total_edges_checked: stats.totalEdges,
        passed_count: Math.max(0, stats.totalNodes - errors.length - warnings.length),
        failed_count: errors.length,
        warning_count: warnings.length,
        details,
        execution_time_ms: Date.now() - startTime,
      };

      if (scope === 'full' || scope === 'embeddings') {
        result.embedding_coverage = stats.embeddingStats;
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        scope,
        total_nodes_checked: 0,
        total_edges_checked: 0,
        passed_count: 0,
        failed_count: 1,
        warning_count: 0,
        details: [
          {
            node_uuid: '00000000-0000-0000-0000-000000000000',
            node_title: 'Validation Error',
            issue_type: 'coordinate_invalid',
            severity: 'error',
            message: `Validation failed: ${message}`,
          },
        ],
        execution_time_ms: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate coordinate consistency across the canonical :Bimba subgraph.
   */
  private async validateCoordinates(filterCondition: string): Promise<ValidationDetail[]> {
    const details: ValidationDetail[] = [];
    const connectionManager = getNeo4jConnectionManager();

    try {
      const query = `
        MATCH (node:Bimba)
        ${filterCondition ? `WHERE ${filterCondition}` : ''}
        RETURN coalesce(node.c_2_uuid, node.uuid) as uuid,
               coalesce(node.c_1_name, node.c_1_primary_designation, node.title, node.name) as title,
               node.coordinate as coordinate
        LIMIT 10000
      `;

      const records = await connectionManager.executeRead<Record<string, unknown>>(query);

      for (const record of records) {
        const uuid = (record['uuid'] as string | null) || 'unknown';
        const title = (record['title'] as string | null) || 'Untitled';
        const coordinate = record['coordinate'] as string | null;

        if (!coordinate) {
          details.push({
            node_uuid: uuid,
            node_title: title,
            issue_type: 'coordinate_missing',
            severity: 'error',
            message: 'Bimba node has no coordinate property',
          });
          continue;
        }

        // A coordinate must begin with a known family head or the '#' marker, OR
        // be a canonical structural node (Family_* containers, Weave_* memory arena).
        const head = coordinate.charAt(0);
        const isStructural = coordinate.startsWith('Family_') || coordinate.startsWith('Weave_');
        if (!isStructural && !VALID_COORDINATE_HEADS.includes(head)) {
          details.push({
            node_uuid: uuid,
            node_title: title,
            issue_type: 'coordinate_invalid',
            severity: 'warning',
            message: `Unrecognized coordinate head "${head}" in "${coordinate}"`,
          });
        }
      }

      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [
        {
          node_uuid: '00000000-0000-0000-0000-000000000000',
          node_title: 'Coordinate Validation',
          issue_type: 'coordinate_invalid',
          severity: 'error',
          message: `Failed to validate coordinates: ${message}`,
        },
      ];
    }
  }

  /**
   * Validate relationship integrity within the canonical :Bimba subgraph.
   *
   * Neo4j relationships always connect existing nodes (they cannot dangle), and
   * the relationship-type vocabulary is intentionally OPEN (named/correspondential
   * types), so there is nothing to flag as an error here. We surface, at most, an
   * informational note about :Bimba nodes that participate in no relationships.
   */
  private async validateRelationships(): Promise<ValidationDetail[]> {
    const details: ValidationDetail[] = [];
    const connectionManager = getNeo4jConnectionManager();

    try {
      const query = `
        MATCH (node:Bimba)
        WHERE NOT (node)--()
        RETURN coalesce(node.c_2_uuid, node.uuid) as uuid,
               coalesce(node.c_1_name, node.c_1_primary_designation, node.title, node.name) as title,
               node.coordinate as coordinate
        LIMIT 1000
      `;

      const records = await connectionManager.executeRead<Record<string, unknown>>(query);

      for (const record of records) {
        details.push({
          node_uuid: (record['uuid'] as string | null) || 'unknown',
          node_title: (record['title'] as string | null) || 'Untitled',
          issue_type: 'relationship_type_invalid',
          severity: 'info',
          message: `Orphan node (no relationships): ${(record['coordinate'] as string | null) ?? 'unknown coordinate'}`,
        });
      }

      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [
        {
          node_uuid: '00000000-0000-0000-0000-000000000000',
          node_title: 'Relationship Validation',
          issue_type: 'relationship_type_invalid',
          severity: 'error',
          message: `Failed to validate relationships: ${message}`,
        },
      ];
    }
  }

  /**
   * Summarize embedding coverage across the canonical :Bimba subgraph.
   *
   * Emits a SINGLE info row (not one per node) to avoid flooding the report when
   * embeddings are absent. The precise numbers live in `result.embedding_coverage`.
   */
  private async validateEmbeddings(filterCondition: string): Promise<ValidationDetail[]> {
    const connectionManager = getNeo4jConnectionManager();

    try {
      const query = `
        MATCH (node:Bimba)
        ${filterCondition ? `WHERE ${filterCondition}` : ''}
        RETURN count(node) as total, count(node.embedding) as embedded
      `;
      const records = await connectionManager.executeRead<Record<string, unknown>>(query);
      const total = toNum(records[0]?.['total']);
      const embedded = toNum(records[0]?.['embedded']);
      const missing = total - embedded;

      if (missing > 0) {
        const pct = total > 0 ? ((embedded / total) * 100).toFixed(1) : '0.0';
        return [
          {
            node_uuid: '00000000-0000-0000-0000-000000000000',
            node_title: 'Embedding coverage',
            issue_type: 'embedding_missing',
            severity: 'info',
            message: `${missing} of ${total} :Bimba nodes have no embedding (${pct}% coverage)`,
          },
        ];
      }
      return [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [
        {
          node_uuid: '00000000-0000-0000-0000-000000000000',
          node_title: 'Embedding Validation',
          issue_type: 'embedding_missing',
          severity: 'error',
          message: `Failed to validate embeddings: ${message}`,
        },
      ];
    }
  }

  /**
   * Get validation statistics for the canonical :Bimba subgraph.
   */
  private async getValidationStatistics(
    scope: string,
    filterCondition: string
  ): Promise<{
    totalNodes: number;
    totalEdges: number;
    embeddingStats?: { total_nodes: number; embedded_count: number; missing_count: number; coverage_percent: number };
  }> {
    const connectionManager = getNeo4jConnectionManager();

    try {
      const nodeCountQuery = `MATCH (node:Bimba) ${filterCondition ? `WHERE ${filterCondition}` : ''} RETURN count(node) as count`;
      const nodeCountResult = await connectionManager.executeRead<Record<string, unknown>>(nodeCountQuery);
      const totalNodes = toNum(nodeCountResult[0]?.['count']);

      const edgeCountQuery = `MATCH (:Bimba)-[rel]->(:Bimba) RETURN count(rel) as count`;
      const edgeCountResult = await connectionManager.executeRead<Record<string, unknown>>(edgeCountQuery);
      const totalEdges = toNum(edgeCountResult[0]?.['count']);

      let embeddingStats:
        | { total_nodes: number; embedded_count: number; missing_count: number; coverage_percent: number }
        | undefined;
      if (scope === 'full' || scope === 'embeddings') {
        const embeddedCountQuery = `MATCH (node:Bimba) WHERE ${filterCondition ? `(${filterCondition}) AND ` : ''}node.embedding IS NOT NULL RETURN count(node) as count`;
        const embeddedCountResult = await connectionManager.executeRead<Record<string, unknown>>(embeddedCountQuery);
        const embeddedCount = toNum(embeddedCountResult[0]?.['count']);

        embeddingStats = {
          total_nodes: totalNodes,
          embedded_count: embeddedCount,
          missing_count: totalNodes - embeddedCount,
          coverage_percent: totalNodes > 0 ? (embeddedCount / totalNodes) * 100 : 0,
        };
      }

      return { totalNodes, totalEdges, embeddingStats };
    } catch {
      return { totalNodes: 0, totalEdges: 0 };
    }
  }

  /**
   * Build a Cypher WHERE condition from a coordinate filter. Only the six fixed
   * family letters are interpolated (no user input), so this is injection-safe.
   */
  private buildCoordinateFilterCondition(filter?: CoordinateFilter): string {
    if (!filter) {
      return '';
    }

    const conditions: string[] = [];
    const coordTypes = ['C', 'P', 'M', 'S', 'T', 'L'] as const;

    for (const type of coordTypes) {
      const level = filter[type as keyof CoordinateFilter] as number | undefined;
      const isPrime = filter[`${type}_is_prime` as keyof CoordinateFilter] as boolean | undefined;

      if (level !== undefined && level > 0) {
        let cond = `node.coordinate STARTS WITH '${type}'`;
        if (isPrime !== undefined) {
          cond += isPrime ? ` AND node.coordinate ENDS WITH "'"` : ` AND NOT (node.coordinate ENDS WITH "'")`;
        }
        conditions.push(`(${cond})`);
      }
    }

    return conditions.length > 0 ? conditions.join(' OR ') : '';
  }
}

/**
 * Singleton instance of AlignmentValidator
 */
let validatorInstance: AlignmentValidator | null = null;

/**
 * Get or create the AlignmentValidator singleton
 */
export function getAlignmentValidator(): AlignmentValidator {
  if (!validatorInstance) {
    validatorInstance = new AlignmentValidator();
  }
  return validatorInstance;
}
