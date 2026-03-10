/**
 * AlignmentValidator - Validates graph alignment and integrity
 *
 * Checks coordinate consistency, relationship types, and embedding presence
 * across the Neo4j knowledge graph.
 */

import { getNeo4jConnectionManager } from '../db/neo4j.js';
import type { ValidationResult, ValidationDetail, CoordinateFilter } from '../schemas/graph.js';

// =============================================================================
// Validation Constants
// =============================================================================

const VALID_COORDINATE_TYPES = ['C', 'P', 'M', 'S', 'T', 'L'];
const VALID_RELATIONSHIP_TYPES = [
  // Position relationships
  'POS0_LINKS_TO', 'POS1_LINKS_TO', 'POS2_LINKS_TO',
  'POS3_LINKS_TO', 'POS4_LINKS_TO', 'POS5_LINKS_TO',
  'POS0_DEFINES', 'POS1_DEFINES', 'POS2_DEFINES',
  'POS3_DEFINES', 'POS4_DEFINES', 'POS5_DEFINES',
  // Other relationship types
  'CONTAINS', 'RELATES_TO', 'PARENT', 'CHILD',
  'USES', 'IMPLEMENTS', 'REFERENCES', 'DEPENDS_ON',
];

// =============================================================================
// AlignmentValidator Class
// =============================================================================

/**
 * Validates graph alignment and integrity with configurable scope
 */
export class AlignmentValidator {
  /**
   * Validate the entire graph or a filtered subset
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
      // Build coordinate filter condition if provided
      const filterCondition = this.buildCoordinateFilterCondition(coordinateFilter);

      // Validate based on scope
      if (scope === 'full' || scope === 'coordinates') {
        const coordIssues = await this.validateCoordinates(filterCondition);
        details.push(...coordIssues);
      }

      if (scope === 'full' || scope === 'relationships') {
        const relIssues = await this.validateRelationships(filterCondition);
        details.push(...relIssues);
      }

      if (scope === 'full' || scope === 'embeddings') {
        const embedIssues = await this.validateEmbeddings(filterCondition);
        details.push(...embedIssues);
      }

      // Get summary statistics
      const stats = await this.getValidationStatistics(scope, filterCondition);

      // Categorize issues
      const errors = details.filter(d => d.severity === 'error');
      const warnings = details.filter(d => d.severity === 'warning');

      const result: ValidationResult = {
        passed: errors.length === 0,
        scope,
        total_nodes_checked: stats.totalNodes,
        total_edges_checked: stats.totalEdges,
        passed_count: stats.totalNodes - errors.length - warnings.length,
        failed_count: errors.length,
        warning_count: warnings.length,
        details,
        execution_time_ms: Date.now() - startTime,
      };

      // Add detailed statistics based on scope
      if (scope === 'full' || scope === 'coordinates') {
        result.coordinate_consistency = stats.coordinateStats;
      }
      if (scope === 'full' || scope === 'relationships') {
        result.relationship_integrity = stats.relationshipStats;
      }
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
        details: [{
          node_uuid: '00000000-0000-0000-0000-000000000000',
          node_title: 'Validation Error',
          issue_type: 'coordinate_invalid',
          severity: 'error',
          message: `Validation failed: ${message}`,
        }],
        execution_time_ms: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate coordinate consistency across the graph
   */
  private async validateCoordinates(filterCondition: string): Promise<ValidationDetail[]> {
    const details: ValidationDetail[] = [];
    const connectionManager = getNeo4jConnectionManager();

    try {
      const query = `
        MATCH (node)
        ${filterCondition ? `WHERE ${filterCondition}` : ''}
        RETURN node.uuid as uuid, node.title as title, node.coordinate as coordinate, labels(node) as labels
        LIMIT 10000
      `;

      const records = await connectionManager.executeRead<Record<string, unknown>>(query);

      for (const record of records) {
        const uuid = record['uuid'] as string | null;
        const title = record['title'] as string | null;
        const coordinate = record['coordinate'] as string | null;

        // Check if coordinate exists
        if (!coordinate) {
          details.push({
            node_uuid: uuid || 'unknown',
            node_title: title || 'Unknown',
            issue_type: 'coordinate_missing',
            severity: 'error',
            message: 'Node has no coordinate property',
          });
          continue;
        }

        // Validate coordinate format
        const coordMatch = coordinate.match(/^([CPMSLT])\d+/);
        if (!coordMatch || !coordMatch[1]) {
          details.push({
            node_uuid: uuid || 'unknown',
            node_title: title || 'Unknown',
            issue_type: 'coordinate_invalid',
            severity: 'error',
            message: `Invalid coordinate format: ${coordinate}`,
          });
          continue;
        }

        // Validate coordinate type
        const coordType = coordMatch[1];
        if (!VALID_COORDINATE_TYPES.includes(coordType)) {
          details.push({
            node_uuid: uuid || 'unknown',
            node_title: title || 'Unknown',
            issue_type: 'coordinate_invalid',
            severity: 'error',
            message: `Invalid coordinate type: ${coordType}`,
          });
        }
      }

      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [{
        node_uuid: '00000000-0000-0000-0000-000000000000',
        node_title: 'Coordinate Validation',
        issue_type: 'coordinate_invalid',
        severity: 'error',
        message: `Failed to validate coordinates: ${message}`,
      }];
    }
  }

  /**
   * Validate relationship types and integrity
   */
  private async validateRelationships(filterCondition: string): Promise<ValidationDetail[]> {
    const details: ValidationDetail[] = [];
    const connectionManager = getNeo4jConnectionManager();

    try {
      const query = `
        MATCH (source)-[rel]->(target)
        ${filterCondition ? `WHERE ${filterCondition}` : ''}
        RETURN source.uuid as source_uuid, source.title as source_title,
               type(rel) as rel_type, target.uuid as target_uuid, target.title as target_title
        LIMIT 50000
      `;

      const records = await connectionManager.executeRead<Record<string, unknown>>(query);

      for (const record of records) {
        const relType = record['rel_type'] as string | null;
        const sourceTitle = record['source_title'] as string | null;
        const sourceUuid = record['source_uuid'] as string | null;
        const targetUuid = record['target_uuid'] as string | null;

        // Check if relationship type is recognized
        if (relType && !VALID_RELATIONSHIP_TYPES.includes(relType)) {
          details.push({
            node_uuid: sourceUuid || 'unknown',
            node_title: sourceTitle || 'Unknown',
            issue_type: 'relationship_type_invalid',
            severity: 'warning',
            message: `Unrecognized relationship type: ${relType}`,
          });
        }

        // Check for dangling relationships (broken references)
        if (!targetUuid) {
          details.push({
            node_uuid: sourceUuid || 'unknown',
            node_title: sourceTitle || 'Unknown',
            issue_type: 'relationship_type_invalid',
            severity: 'error',
            message: 'Dangling relationship: target node has no UUID',
          });
        }
      }

      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [{
        node_uuid: '00000000-0000-0000-0000-000000000000',
        node_title: 'Relationship Validation',
        issue_type: 'relationship_type_invalid',
        severity: 'error',
        message: `Failed to validate relationships: ${message}`,
      }];
    }
  }

  /**
   * Validate embedding presence and coverage
   */
  private async validateEmbeddings(filterCondition: string): Promise<ValidationDetail[]> {
    const details: ValidationDetail[] = [];
    const connectionManager = getNeo4jConnectionManager();

    try {
      const query = `
        MATCH (node)
        ${filterCondition ? `WHERE ${filterCondition}` : ''}
        RETURN node.uuid as uuid, node.title as title,
               EXISTS(node.embedding) as has_embedding
        LIMIT 10000
      `;

      const records = await connectionManager.executeRead<Record<string, unknown>>(query);

      for (const record of records) {
        const hasEmbedding = record['has_embedding'] as boolean | null;
        const uuid = record['uuid'] as string | null;
        const title = record['title'] as string | null;

        // Check if embedding is missing (warning, not error)
        if (!hasEmbedding) {
          details.push({
            node_uuid: uuid || 'unknown',
            node_title: title || 'Unknown',
            issue_type: 'embedding_missing',
            severity: 'info',
            message: 'Node has no embedding generated',
          });
        }
      }

      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [{
        node_uuid: '00000000-0000-0000-0000-000000000000',
        node_title: 'Embedding Validation',
        issue_type: 'embedding_missing',
        severity: 'error',
        message: `Failed to validate embeddings: ${message}`,
      }];
    }
  }

  /**
   * Get validation statistics for the graph
   */
  private async getValidationStatistics(
    scope: string,
    filterCondition: string
  ): Promise<{
    totalNodes: number;
    totalEdges: number;
    coordinateStats?: { valid_count: number; invalid_count: number; missing_count: number };
    relationshipStats?: { valid_count: number; invalid_type_count: number; dangling_count: number };
    embeddingStats?: { total_nodes: number; embedded_count: number; missing_count: number; coverage_percent: number };
  }> {
    const connectionManager = getNeo4jConnectionManager();

    try {
      // Count nodes
      const nodeCountQuery = `MATCH (node) ${filterCondition ? `WHERE ${filterCondition}` : ''} RETURN count(node) as count`;
      const nodeCountResult = await connectionManager.executeRead<Record<string, unknown>>(nodeCountQuery);
      const totalNodes = (nodeCountResult[0]?.['count'] as number) ?? 0;

      // Count edges
      const edgeCountQuery = `MATCH ()-[rel]->() ${filterCondition ? `WHERE ${filterCondition}` : ''} RETURN count(rel) as count`;
      const edgeCountResult = await connectionManager.executeRead<Record<string, unknown>>(edgeCountQuery);
      const totalEdges = (edgeCountResult[0]?.['count'] as number) ?? 0;

      // Count embeddings if needed
      let embeddingStats: { total_nodes: number; embedded_count: number; missing_count: number; coverage_percent: number } | undefined;
      if (scope === 'full' || scope === 'embeddings') {
        const embeddedCountQuery = `MATCH (node) ${filterCondition ? `WHERE ${filterCondition}` : ''} AND EXISTS(node.embedding) RETURN count(node) as count`;
        const embeddedCountResult = await connectionManager.executeRead<Record<string, unknown>>(embeddedCountQuery);
        const embeddedCount = (embeddedCountResult[0]?.['count'] as number) ?? 0;

        embeddingStats = {
          total_nodes: totalNodes,
          embedded_count: embeddedCount,
          missing_count: totalNodes - embeddedCount,
          coverage_percent: totalNodes > 0 ? (embeddedCount / totalNodes) * 100 : 0,
        };
      }

      return {
        totalNodes,
        totalEdges,
        embeddingStats,
      };
    } catch (error) {
      return {
        totalNodes: 0,
        totalEdges: 0,
      };
    }
  }

  /**
   * Build Cypher WHERE condition from coordinate filter
   */
  private buildCoordinateFilterCondition(filter?: CoordinateFilter): string {
    if (!filter) {
      return '';
    }

    const conditions: string[] = [];

    // Add coordinate type filters
    const coordTypes = ['C', 'P', 'M', 'S', 'T', 'L'] as const;
    for (const type of coordTypes) {
      const levelKey = type as keyof CoordinateFilter;
      const primeKey = `${type}_is_prime` as keyof CoordinateFilter;

      const level = filter[levelKey] as number | undefined;
      const isPrime = filter[primeKey] as boolean | undefined;

      if (level !== undefined && level > 0) {
        conditions.push(`node.coordinate STARTS WITH '${type}'`);

        if (isPrime !== undefined) {
          if (isPrime) {
            conditions.push(`node.coordinate ENDS WITH "'"`)
          } else {
            conditions.push(`NOT (node.coordinate ENDS WITH "'")`)
          }
        }
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
