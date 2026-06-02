import { invoke } from './invoke';
import type {
  DailyNote,
  EntryMetadata,
  FlowEntry,
  FlowMetadata,
  FileTreeNode,
  BacklinksData,
} from './types';

export const vaultClient = {
  getTodayNote: () => invoke<DailyNote | null>('vault_get_today_note'),
  getDailyNote: (date: string) => invoke<DailyNote | null>('vault_get_daily_note', { date }),
  listEntries: () => invoke<EntryMetadata[]>('vault_list_entries'),
  getEntry: (entryPath: string) => invoke<string | null>('vault_get_entry', { entryPath }),
  saveFlow: (date: string, content: string, metadata: FlowMetadata) =>
    invoke<void>('vault_save_flow_entry', { date, content, metadata }),
  getFlow: (date: string) => invoke<FlowEntry | null>('vault_get_flow_entry', { date }),
  listFlowVersions: (date: string) => invoke<number[]>('vault_list_flow_versions', { date }),
  getFlowVersion: (date: string, version: number) =>
    invoke<FlowEntry | null>('vault_get_flow_version', { date, version }),
  getFileTree: () => invoke<FileTreeNode[]>('vault_get_file_tree'),
  getFileContent: (path: string) => invoke<string | null>('vault_get_file_content', { path }),
  getBacklinks: (path: string) => invoke<BacklinksData>('vault_get_backlinks', { path }),
  resolveWikilink: (linkText: string) => invoke<string | null>('vault_resolve_wikilink', { linkText }),
  validateFrontmatter: (content: string) => invoke<void>('vault_validate_frontmatter', { content }),
};
