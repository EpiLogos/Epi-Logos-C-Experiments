// M' Domain definitions - the 6 consciousness domains
export interface MPrimeDomain {
  id: string;
  coordinate: string;
  name: string;
  sanskritName: string;
  description: string;
  icon: string;
  color: string;
}

export const MPRIME_DOMAINS: MPrimeDomain[] = [
  {
    id: 'm0',
    coordinate: "M0'",
    name: 'Anuttara',
    sanskritName: 'Proto-Logos',
    description: 'The First/Before - Graph',
    icon: '🌐',
    color: '#6366f1', // indigo
  },
  {
    id: 'm1',
    coordinate: "M1'",
    name: 'Paramasiva',
    sanskritName: 'Pro-Logos',
    description: 'The Forward/Definition - Topology',
    icon: '🔮',
    color: '#8b5cf6', // violet
  },
  {
    id: 'm2',
    coordinate: "M2'",
    name: 'Parashakti',
    sanskritName: 'Co-Logos',
    description: 'The With/Operation - Cymatics',
    icon: '🌊',
    color: '#ec4899', // pink
  },
  {
    id: 'm3',
    coordinate: "M3'",
    name: 'Mahamaya',
    sanskritName: 'Axio-Logos',
    description: 'The Value/Pattern - Clock',
    icon: '🕐',
    color: '#f59e0b', // amber
  },
  {
    id: 'm4',
    coordinate: "M4'",
    name: 'Nara',
    sanskritName: 'Dia-Logos',
    description: 'The Through/Context - Journal',
    icon: '📓',
    color: '#10b981', // emerald
  },
  {
    id: 'm5',
    coordinate: "M5'",
    name: 'Epii',
    sanskritName: 'Epi-Logos',
    description: 'The Over/Integration - System',
    icon: '⚙️',
    color: '#06b6d4', // cyan
  },
];

// Electron API types
export interface ElectronAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
}

// Daily note data returned from main process
export interface DailyNoteData {
  content: string;
  path: string;
}

// Entry metadata
export interface EntryMetadata {
  id: string;           // Entry-001, Entry-002, etc.
  entryId: string;      // ^entry1, ^entry2, etc.
  title: string;        // Extracted from CONTEXT.md
  date: string;         // YYYY-MM-DD from parent date folder
  status: 'pending' | 'processing' | 'completed' | 'unknown';
  created: string;      // ISO timestamp
  path: string;         // Full path to Entry folder
  contextPath: string;  // Full path to CONTEXT.md
}

// Entry content data
export interface EntryData {
  metadata: EntryMetadata;
  content: string;      // CONTEXT.md content
}

export type FlowHighlightCategory = 'daily-note' | 'oracle' | 'dream' | 'expand';

export interface FlowHighlight {
  id: string;
  category: FlowHighlightCategory | string;
  from: number;
  to: number;
  text: string;
  timestamp: number;
  label?: string;
  color?: string;
}

export interface FlowMetadata {
  date: string;
  created: string;
  updated: string;
  version: number;
  highlights: FlowHighlight[];
  wordCount: number;
}

export interface FlowEntry {
  content: string;
  metadata: FlowMetadata | null;
}

// File tree node for system browser
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;      // For files: md, json, ts, etc.
  section?: 'bimba' | 'pratibimba' | 'empty' | 'other';  // Vault section for color-coding
  children?: FileTreeNode[];
}

// File content data
export interface FileContentData {
  path: string;
  content: string;
  extension: string;
}

// QL Position colors for graph visualization
export const QL_POSITION_COLORS: Record<string, string> = {
  p0: '#ef4444', // red - Ground/Presence
  p1: '#f59e0b', // amber - Definition/Form
  p2: '#10b981', // emerald - Operation/Process
  p3: '#06b6d4', // cyan - Pattern/Symbol
  p4: '#8b5cf6', // violet - Context/Embodiment
  p5: '#ec4899', // pink - Integration/Synthesis
};

// Graph node from Neo4j
export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
  // Extracted QL fields
  qlPosition?: string;   // p0, p1, p2, p3, p4, p5
  title?: string;
  coordinate?: string;
}

// Graph relationship from Neo4j
export interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, unknown>;
}

// Graph data for visualization
export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

// Force graph node (for react-force-graph)
export interface ForceGraphNode {
  id: string;
  labels: string[];
  title?: string;
  coordinate?: string;
  qlPosition?: string;
  color: string;
  properties: Record<string, unknown>;
}

// Force graph link (for react-force-graph)
export interface ForceGraphLink {
  source: string;
  target: string;
  type: string;
  id: string;
  properties: Record<string, unknown>;
}

// S1 Journal API
export interface S1JournalAPI {
  getTodayNote: () => Promise<DailyNoteData | null>;
  getDailyNote: (date: string) => Promise<DailyNoteData | null>;
  listEntries: () => Promise<EntryMetadata[]>;
  getEntry: (entryPath: string) => Promise<EntryData | null>;
  saveFlowEntry: (date: string, content: string, metadata: FlowMetadata) => Promise<void>;
  getFlowEntry: (date: string) => Promise<FlowEntry | null>;
  listFlowVersions: (date: string) => Promise<number[]>;
  getFlowVersion: (date: string, version: number) => Promise<FlowEntry | null>;
}

// S1 Files API - File tree operations
export interface S1FilesAPI {
  getFileTree: () => Promise<FileTreeNode[]>;
  getFileContent: (filePath: string) => Promise<FileContentData | null>;
}

// S2 Graph API - Neo4j operations
export interface S2GraphAPI {
  getGraph: () => Promise<GraphData | null>;
  getNodeById: (nodeId: string) => Promise<GraphNode | null>;
}

// Link types for cross-domain linking
export type LinkType = 'wiki' | 'coordinate' | 'external' | 'file';

// Parsed link result
export interface ParsedLink {
  type: LinkType;
  raw: string;           // Original link text
  target: string;        // Resolved target (file path, coordinate, URL)
  display?: string;      // Display text (for [[link|display]] syntax)
  domainId?: string;     // Target domain ID for coordinate links
  filePath?: string;     // Resolved file path for wiki-links
}

// Backlink reference - incoming link from another file
export interface BacklinkReference {
  sourcePath: string;    // Path to the file containing the link
  sourceTitle: string;   // Title of the source file
  context: string;       // Surrounding text context
  lineNumber: number;    // Line number where the link appears
}

// Backlinks data for a file
export interface BacklinksData {
  targetPath: string;    // Path to the target file
  targetTitle: string;   // Title of the target file
  backlinks: BacklinkReference[];
}

// S1 Backlinks API - Find incoming references
export interface S1BacklinksAPI {
  getBacklinks: (filePath: string) => Promise<BacklinksData | null>;
  resolveWikiLink: (linkText: string) => Promise<string | null>;
}

// S0 Shell API - System operations
export interface S0ShellAPI {
  openExternal: (url: string) => Promise<void>;
}

// S3' Gateway WebSocket API - Real-time observable events (port 18794)
export interface S3GatewayAPI {
  isConnected: () => Promise<boolean>;
  send: (message: object) => Promise<void>;
  configure: (config: {
    url?: string;
    token?: string | null;
    password?: string | null;
    reconnect?: boolean;
  }) => Promise<{ success: boolean }>;
  onMessage: (callback: (message: unknown) => void) => () => void;
  onConnected: (callback: () => void) => () => void;
  onDisconnected: (callback: () => void) => () => void;
  onError: (callback: (error: string) => void) => () => void;
}

// S' API Layer types
export interface SPrimeAPI {
  s0: {
    shell: S0ShellAPI;
  };
  s1: {
    journal: S1JournalAPI;
    files: S1FilesAPI;
    backlinks: S1BacklinksAPI;
  };
  s2: {
    graph: S2GraphAPI;
  };
  s3: {
    websocket: S3GatewayAPI;
  };
  s4: Record<string, unknown>;
  s5: Record<string, unknown>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    sPrime: SPrimeAPI;
  }
}
