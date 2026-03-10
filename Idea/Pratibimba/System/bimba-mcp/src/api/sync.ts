/**
 * SyncAPI - File synchronization between Obsidian vault and Neo4j graph
 *
 * Provides methods to synchronize files in the Obsidian vault with nodes in the
 * Neo4j knowledge graph. Supports one-way and bidirectional sync with conflict detection.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { getNeo4jConnectionManager } from '../db/neo4j.js';
import type { SyncResult, SyncStats, SyncDirection, Conflict } from '../schemas/sync.js';
import { resolveVaultRoot } from '../repo-paths.js';

// =============================================================================
// Types
// =============================================================================

interface FileEntry {
  filePath: string;
  fileName: string;
  lastModified: number;
}

// =============================================================================
// Sync Implementation
// =============================================================================

/**
 * Synchronize files between Obsidian vault and Neo4j graph
 *
 * Supports three sync directions:
 * - obsidian_to_neo4j: Create/update nodes from vault files (default)
 * - neo4j_to_obsidian: Create/update vault files from graph nodes
 * - bidirectional: Sync both directions with conflict detection
 *
 * @param vaultPath Relative path within vault, or 'all' for full vault
 * @param direction Sync direction (default: obsidian_to_neo4j)
 * @param coordinateFilter Optional coordinate filter (e.g., 'P2', 'M2-5')
 * @param dryRun If true, report changes without making them
 * @returns SyncResult with statistics and conflict information
 * @throws Error if vault path doesn't exist or sync fails
 */
export async function sync(
  vaultPath: string,
  direction: SyncDirection = 'obsidian_to_neo4j',
  coordinateFilter?: string,
  dryRun = false
): Promise<SyncResult> {
  const startTime = new Date();
  const startMs = Date.now();

  try {
    // Initialize result structure
    const result: SyncResult = {
      success: false,
      direction,
      start_time: startTime.toISOString(),
      end_time: new Date().toISOString(),
      execution_time_ms: 0,
      vault_to_graph: {
        processed: 0,
        created: 0,
        updated: 0,
        deleted: 0,
        failed: 0,
        skipped: 0,
      },
    };

    // Resolve vault path
    const vaultRoot = resolveVaultRoot();
    const targetPath = vaultPath === 'all' ? vaultRoot : join(vaultRoot, vaultPath);

    // Perform sync based on direction
    if (direction === 'obsidian_to_neo4j' || direction === 'bidirectional') {
      const vaultStats = await syncVaultToGraph(targetPath, coordinateFilter, dryRun);
      result.vault_to_graph = vaultStats;
    }

    if (direction === 'neo4j_to_obsidian' || direction === 'bidirectional') {
      const graphStats = await syncGraphToVault(targetPath, coordinateFilter, dryRun);
      result.graph_to_vault = graphStats;

      if (direction === 'bidirectional') {
        const conflicts = await detectConflicts(targetPath, coordinateFilter);
        if (conflicts.length > 0) {
          result.conflicts = conflicts;
        }
      }
    }

    result.success = true;
    result.end_time = new Date().toISOString();
    result.execution_time_ms = Date.now() - startMs;

    return result;
  } catch (error) {
    return {
      success: false,
      direction,
      start_time: startTime.toISOString(),
      end_time: new Date().toISOString(),
      execution_time_ms: Date.now() - startMs,
      vault_to_graph: { processed: 0, created: 0, updated: 0, deleted: 0, failed: 0, skipped: 0 },
      error_message: error instanceof Error ? error.message : 'Unknown error during sync',
    };
  }
}

// =============================================================================
// Vault to Graph Sync
// =============================================================================

/**
 * Synchronize vault files to Neo4j graph nodes
 *
 * Scans markdown files in the vault and creates/updates corresponding nodes in Neo4j.
 * Files with YAML frontmatter are converted to nodes with properties from the frontmatter.
 *
 * @param vaultPath Root path to scan
 * @param coordinateFilter Optional coordinate filter
 * @param dryRun If true, only report what would be changed
 * @returns SyncStats with processing summary
 */
async function syncVaultToGraph(
  vaultPath: string,
  coordinateFilter?: string,
  dryRun = false
): Promise<SyncStats> {
  const stats: SyncStats = {
    processed: 0,
    created: 0,
    updated: 0,
    deleted: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    // Scan vault for markdown files
    const files = await scanVaultFiles(vaultPath);

    for (const file of files) {
      stats.processed += 1;

      try {
        // Read file content and parse frontmatter
        const content = await readFile(file.filePath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);

        const uuid = frontmatter['uuid'] as string | undefined;
        const coord = frontmatter['coordinate'] as string | undefined;

        if (!uuid) {
          stats.skipped += 1;
          continue;
        }

        // Apply coordinate filter if specified
        if (coordinateFilter && coord) {
          if (!matchesCoordinateFilter(coord, coordinateFilter)) {
            stats.skipped += 1;
            continue;
          }
        }

        // Check if node exists in graph
        const existingNode = await getNodeByUUID(uuid);

        if (!dryRun) {
          if (existingNode) {
            // Update existing node
            await updateGraphNode(uuid, frontmatter, body);
            stats.updated += 1;
          } else {
            // Create new node
            await createGraphNode(frontmatter, body);
            stats.created += 1;
          }

          // Create relationships from wiki-links in content
          await createRelationshipsFromLinks(uuid, body);
        } else {
          // Dry run: just count what would be done
          if (existingNode) {
            stats.updated += 1;
          } else {
            stats.created += 1;
          }
        }
      } catch (error) {
        stats.failed += 1;
      }
    }
  } catch (error) {
    throw new Error(`Failed to sync vault to graph: ${error instanceof Error ? error.message : String(error)}`);
  }

  return stats;
}

// =============================================================================
// Graph to Vault Sync
// =============================================================================

/**
 * Synchronize Neo4j graph nodes to vault files
 *
 * Scans the graph for nodes and creates/updates corresponding markdown files
 * in the vault with frontmatter derived from node properties.
 *
 * @param vaultPath Root path to write files to
 * @param coordinateFilter Optional coordinate filter
 * @param dryRun If true, only report what would be changed
 * @returns SyncStats with processing summary
 */
async function syncGraphToVault(
  vaultPath: string,
  coordinateFilter?: string,
  dryRun = false
): Promise<SyncStats> {
  const stats: SyncStats = {
    processed: 0,
    created: 0,
    updated: 0,
    deleted: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    // Query all nodes from Neo4j
    const connectionManager = getNeo4jConnectionManager();
    const baseQuery = 'MATCH (node) RETURN node.uuid as uuid, node.title as title, node.file_path as file_path, node.updated_at as updated_at LIMIT 1000';
    let query: string = baseQuery;

    if (coordinateFilter) {
      query = `MATCH (node) WHERE node.coordinate STARTS WITH $coordinatePrefix RETURN node.uuid as uuid, node.title as title, node.file_path as file_path, node.updated_at as updated_at LIMIT 1000`;
    }

    const records = await connectionManager.executeRead<Record<string, unknown>>(
      query,
      coordinateFilter ? { coordinatePrefix: coordinateFilter } : {}
    );

    for (const record of records) {
      stats.processed += 1;

      try {
        const nodeData = {
          uuid: record['uuid'] as string,
          title: record['title'] as string,
          file_path: record['file_path'] as string | undefined,
          updated_at: record['updated_at'] as string | undefined,
        };

        if (!nodeData.uuid || !nodeData.title) {
          stats.skipped += 1;
          continue;
        }

        // Get full node from Neo4j
        const fullNode = await getNodeByUUID(nodeData.uuid);
        if (!fullNode) {
          stats.skipped += 1;
          continue;
        }

        // Determine file path
        const filePath = nodeData.file_path ? join(vaultPath, nodeData.file_path) : determineFilePath(vaultPath, nodeData.uuid);

        if (!dryRun) {
          // Check if file exists
          let fileExists = false;
          try {
            await readFile(filePath, 'utf-8');
            fileExists = true;
          } catch {
            fileExists = false;
          }

          // Convert node to markdown with frontmatter
          const nodeRecord: Record<string, unknown> = fullNode;
          const markdown = nodeToMarkdown(nodeRecord);
          await writeFile(filePath, markdown, 'utf-8');

          if (fileExists) {
            stats.updated += 1;
          } else {
            stats.created += 1;
          }
        } else {
          // Dry run: just count
          try {
            await readFile(filePath, 'utf-8');
            stats.updated += 1;
          } catch {
            stats.created += 1;
          }
        }
      } catch (error) {
        stats.failed += 1;
      }
    }
  } catch (error) {
    throw new Error(`Failed to sync graph to vault: ${error instanceof Error ? error.message : String(error)}`);
  }

  return stats;
}

// =============================================================================
// Conflict Detection
// =============================================================================

/**
 * Detect conflicts between vault and graph during bidirectional sync
 *
 * @param vaultPath Vault root path
 * @param coordinateFilter Optional coordinate filter
 * @returns Array of detected conflicts
 */
async function detectConflicts(
  vaultPath: string,
  coordinateFilter?: string
): Promise<Conflict[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void coordinateFilter;

  const conflicts: Conflict[] = [];

  try {
    // Scan vault files
    const vaultFiles = await scanVaultFiles(vaultPath);
    const connectionManager = getNeo4jConnectionManager();

    for (const file of vaultFiles) {
      const content = await readFile(file.filePath, 'utf-8');
      const { frontmatter } = parseFrontmatter(content);

      const uuid = frontmatter['uuid'] as string | undefined;
      if (!uuid) continue;

      // Check if node exists and compare timestamps
      const nodeResult = await connectionManager.executeRead<Record<string, unknown>>(
        'MATCH (node {uuid: $uuid}) RETURN node.updated_at as updated_at',
        { uuid }
      );

      if (nodeResult.length > 0) {
        const nodeUpdated = nodeResult[0]?.['updated_at'] as string | undefined;
        const fileModified = new Date(file.lastModified).toISOString();

        if (nodeUpdated && nodeUpdated !== fileModified) {
          conflicts.push({
            item_id: uuid,
            item_type: 'file',
            last_modified_vault: fileModified,
            last_modified_graph: nodeUpdated,
            conflict_type: 'diverged_changes',
            recommendation: 'Review both versions and manually resolve the differences',
          });
        }
      }
    }
  } catch (error) {
    // Return empty array on error - conflicts are informational
  }

  return conflicts;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Scan vault directory for markdown files
 */
async function scanVaultFiles(dirPath: string): Promise<FileEntry[]> {
  const files: FileEntry[] = [];

  async function scanDir(path: string): Promise<void> {
    try {
      const items = await readdir(path, { withFileTypes: true });

      for (const item of items) {
        const fullPath = join(path, item.name);

        // Skip hidden and system directories
        if (item.name.startsWith('.') || item.name === 'node_modules') {
          continue;
        }

        if (item.isDirectory()) {
          await scanDir(fullPath);
        } else if (item.isFile() && extname(item.name) === '.md') {
          const stats = await readFile(fullPath, 'utf-8')
            .then(() => ({ mtime: Date.now() }))
            .catch(() => ({ mtime: Date.now() }));

          files.push({
            filePath: fullPath,
            fileName: item.name,
            lastModified: stats.mtime,
          });
        }
      }
    } catch (error) {
      // Continue on read errors
    }
  }

  await scanDir(dirPath);
  return files;
}

/**
 * Parse YAML frontmatter and body from markdown content
 */
function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match || !match[1] || !match[2]) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterStr = match[1];
  const body = match[2];

  // Simple YAML parsing for basic key: value format
  const frontmatter: Record<string, unknown> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key) {
        if (value.startsWith('"') && value.endsWith('"')) {
          frontmatter[key] = value.slice(1, -1);
        } else if (value === 'true') {
          frontmatter[key] = true;
        } else if (value === 'false') {
          frontmatter[key] = false;
        } else {
          frontmatter[key] = value;
        }
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Match coordinate against filter pattern
 */
function matchesCoordinateFilter(coordinate: string, filter: string): boolean {
  if (filter === '#') return true;

  // Simple prefix matching
  if (coordinate.startsWith(filter)) {
    return true;
  }

  // Check for range patterns like M2-5
  const rangeMatch = filter.match(/^([A-Z])(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, type, startStr, endStr] = rangeMatch;
    const coordMatch = coordinate.match(/^([A-Z])(\d+)/);
    if (coordMatch && coordMatch[1] === type) {
      const num = parseInt(coordMatch[2] ?? '0', 10);
      const start = parseInt(startStr ?? '0', 10);
      const end = parseInt(endStr ?? '0', 10);
      return num >= start && num <= end;
    }
  }

  return false;
}

/**
 * Get node from Neo4j by UUID
 */
async function getNodeByUUID(uuid: string): Promise<Record<string, unknown> | null> {
  const connectionManager = getNeo4jConnectionManager();
  const records = await connectionManager.executeRead<Record<string, unknown>>(
    'MATCH (node {uuid: $uuid}) RETURN node',
    { uuid }
  );

  if (records.length === 0) return null;

  const nodeData = records[0]?.['node'] as Record<string, unknown> | undefined;
  if (!nodeData) return null;

  return nodeData;
}

/**
 * Create a new node in Neo4j from vault file frontmatter
 */
async function createGraphNode(
  frontmatter: Record<string, unknown>,
  body: string
): Promise<void> {
  const connectionManager = getNeo4jConnectionManager();
  const uuid = frontmatter['uuid'] as string;
  const title = frontmatter['title'] as string;
  const coordinate = frontmatter['coordinate'] as string | undefined;

  const query = `
    CREATE (node {
      uuid: $uuid,
      title: $title,
      coordinate: $coordinate,
      content: $body,
      created_at: datetime(),
      updated_at: datetime()
    })
    RETURN node
  `;

  await connectionManager.executeWrite(
    query,
    {
      uuid,
      title,
      coordinate: coordinate || '',
      body,
    }
  );
}

/**
 * Update an existing node in Neo4j
 */
async function updateGraphNode(
  uuid: string,
  frontmatter: Record<string, unknown>,
  body: string
): Promise<void> {
  const connectionManager = getNeo4jConnectionManager();
  const title = frontmatter['title'] as string;
  const coordinate = frontmatter['coordinate'] as string | undefined;

  const query = `
    MATCH (node {uuid: $uuid})
    SET node.title = $title,
        node.coordinate = $coordinate,
        node.content = $body,
        node.updated_at = datetime()
    RETURN node
  `;

  await connectionManager.executeWrite(
    query,
    {
      uuid,
      title,
      coordinate: coordinate || '',
      body,
    }
  );
}

/**
 * Create relationships from wiki-links in markdown content
 * Wiki links format: [[Node Title]] or [[Node Title|Display Text]]
 */
async function createRelationshipsFromLinks(sourceUuid: string, body: string): Promise<void> {
  const connectionManager = getNeo4jConnectionManager();
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

  let match;
  while ((match = wikiLinkRegex.exec(body)) !== null) {
    const targetTitle = match[1];
    if (targetTitle) {
      // Find target node by title
      const records = await connectionManager.executeRead<Record<string, unknown>>(
        'MATCH (node {title: $title}) RETURN node.uuid as uuid LIMIT 1',
        { title: targetTitle }
      );

      if (records.length > 0) {
        const targetUuid = records[0]?.['uuid'] as string;
        if (targetUuid) {
          // Create REFERENCES relationship
          await connectionManager.executeWrite(
            `
            MATCH (source {uuid: $sourceUuid})
            MATCH (target {uuid: $targetUuid})
            MERGE (source)-[rel:REFERENCES]->(target)
            SET rel.created_at = datetime()
            RETURN rel
            `,
            { sourceUuid, targetUuid }
          );
        }
      }
    }
  }
}

/**
 * Convert Neo4j node to markdown with frontmatter
 */
function nodeToMarkdown(node: Record<string, unknown>): string {
  const frontmatter: Record<string, unknown> = {
    uuid: node['uuid'],
    title: node['title'],
    coordinate: node['coordinate'] || '',
  };

  const frontmatterStr: string = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: "${value}"`)
    .join('\n');

  const body = (node['content'] as string) || '';

  return `---\n${frontmatterStr}\n---\n\n${body}`;
}

/**
 * Determine file path for a node based on its properties
 */
function determineFilePath(vaultPath: string, uuid: string): string {
  // Use UUID as filename with .md extension
  const fileName = `${uuid.substring(0, 8)}.md`;
  return join(vaultPath, fileName ?? 'unknown.md');
}
