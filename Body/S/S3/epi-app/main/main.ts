import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { readFile, readdir, writeFile } from 'fs/promises';
import Store from 'electron-store';
import matter from 'gray-matter';
import * as yaml from 'js-yaml';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { S3GatewayClient } from './s3-gateway-client.js';
import { EpiClawClient } from './epi-claw-client.js';
import type { EventFrame } from './epi-claw-rpc.js';
import { resolveIdeaRoot, resolvePresentRoot } from './repo-paths';

// Vault path - configurable in the future
const VAULT_PATH = resolveIdeaRoot();
const PRESENT_PATH = resolvePresentRoot();

interface FlowHighlight {
  id: string;
  category: 'daily-note' | 'oracle' | 'dream' | 'expand' | string;
  from: number;
  to: number;
  text: string;
  timestamp: number;
  label?: string;
  color?: string;
}

interface FlowMetadata {
  date: string;
  created: string;
  updated: string;
  version: number;
  highlights: FlowHighlight[];
  wordCount: number;
}

interface FlowEntry {
  content: string;
  metadata: FlowMetadata | null;
}

function getFlowPath(date: string, version?: number): string {
  const baseName = version !== undefined ? `FLOW-${date}-v${version}.md` : `FLOW-${date}.md`;
  return path.join(PRESENT_PATH, baseName);
}

function serializeFlow(content: string, metadata: FlowMetadata): string {
  const frontmatter = yaml.dump(metadata, { lineWidth: -1 });
  return `---\n${frontmatter}---\n\n${content}`;
}

function parseFlow(text: string): FlowEntry {
  const match = text.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (!match) {
    return { content: text, metadata: null };
  }
  const metadata = yaml.load(match[1]) as FlowMetadata;
  return { content: match[2], metadata };
}

// Neo4j connection configuration
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

// S3' Gateway WebSocket URL (epi gate default port)
const S3_GATEWAY_URL = process.env.S3_GATEWAY_URL || 'ws://127.0.0.1:18794';
const S3_GATEWAY_TOKEN =
  process.env.S3_GATEWAY_TOKEN || process.env.OPENCLAW_GATEWAY_TOKEN || undefined;
const S3_GATEWAY_PASSWORD =
  process.env.S3_GATEWAY_PASSWORD || process.env.OPENCLAW_GATEWAY_PASSWORD || undefined;

// Neo4j driver instance
let neo4jDriver: Driver | null = null;

// S3' Gateway client instance
let s3GatewayClient: S3GatewayClient | null = null;

// Epi-Claw WebSocket client instance (JSON-RPC 2.0)
let epiClawClient: EpiClawClient | null = null;
const epiClawSubscribedEvents = new Set<string>();
const epiClawEventForwarders = new Map<string, (eventFrame: EventFrame) => void>();

function getNeo4jDriver(): Driver {
  if (!neo4jDriver) {
    neo4jDriver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  }
  return neo4jDriver;
}

async function closeNeo4jDriver(): Promise<void> {
  if (neo4jDriver) {
    await neo4jDriver.close();
    neo4jDriver = null;
  }
}

function getS3GatewayClient(): S3GatewayClient {
  if (!s3GatewayClient) {
    s3GatewayClient = new S3GatewayClient({
      url: S3_GATEWAY_URL,
      token: S3_GATEWAY_TOKEN,
      password: S3_GATEWAY_PASSWORD,
    });
  }
  return s3GatewayClient;
}

function closeS3GatewayClient(): void {
  if (s3GatewayClient) {
    s3GatewayClient.disconnect();
    s3GatewayClient = null;
  }
}

function getEpiClawClient(): EpiClawClient {
  if (!epiClawClient) {
    // EpiClawClient shares the S3' Gateway WebSocket connection
    // instead of creating its own (avoids auth issues)
    epiClawClient = new EpiClawClient({
      getWebSocket: () => {
        const gw = getS3GatewayClient();
        return gw ? gw.getWebSocket() : null;
      },
    });

    // Wire S3' gateway client to forward messages to EpiClaw
    const gw = getS3GatewayClient();
    if (gw) {
      gw.setEpiClawClient(epiClawClient);
    }
  }
  return epiClawClient;
}

function closeEpiClawClient(): void {
  if (epiClawClient) {
    epiClawClient.disconnect();
    epiClawClient = null;
  }
}

function getEpiClawEventForwarder(event: string): (eventFrame: EventFrame) => void {
  const existing = epiClawEventForwarders.get(event);
  if (existing) return existing;
  const forwarder = (eventFrame: EventFrame) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send(`epiclaws:event:${event}`, eventFrame);
    });
  };
  epiClawEventForwarders.set(event, forwarder);
  return forwarder;
}

async function ensureEpiClawEventSubscriptions(): Promise<void> {
  const client = getEpiClawClient();
  if (!client.isConnected()) return;
  for (const event of epiClawSubscribedEvents) {
    const forwarder = getEpiClawEventForwarder(event);
    try {
      await client.subscribe(event, forwarder);
    } catch (error) {
      console.error(`[EpiClaw] Failed to subscribe to ${event}:`, error);
    }
  }
}

// Window state persistence
interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

const store = new Store<{ windowState: WindowState }>();

function getWindowState(): WindowState {
  const defaultState: WindowState = {
    width: 1200,
    height: 800,
    isMaximized: false,
  };
  return store.get('windowState', defaultState);
}

function saveWindowState(win: BrowserWindow): void {
  const isMaximized = win.isMaximized();
  if (!isMaximized) {
    const bounds = win.getBounds();
    store.set('windowState', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: false,
    });
  } else {
    const current = store.get('windowState');
    if (current) {
      store.set('windowState', { ...current, isMaximized: true });
    }
  }
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const windowState = getWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    // Transparency & Vibrancy Support
    transparent: true,
    vibrancy: 'under-window', // macOS Glass Effect
    visualEffectState: 'active',
    backgroundColor: '#00000000', // Fully transparent
    trafficLightPosition: { x: 20, y: 12 }, // Fine-tune traffic lights
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Save window state on resize/move
  mainWindow.on('resize', () => {
    if (mainWindow) saveWindowState(mainWindow);
  });
  mainWindow.on('move', () => {
    if (mainWindow) saveWindowState(mainWindow);
  });
  mainWindow.on('maximize', () => {
    if (mainWindow) saveWindowState(mainWindow);
  });
  mainWindow.on('unmaximize', () => {
    if (mainWindow) saveWindowState(mainWindow);
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for S' API (placeholders for US-001)
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getPlatform', () => {
  return process.platform;
});

// Journal S1 API - Daily Note Operations
ipcMain.handle('journal:getTodayNote', async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return getDailyNote(today);
});

ipcMain.handle('journal:getDailyNote', async (_event, date: string) => {
  return getDailyNote(date);
});

ipcMain.handle('journal:listEntries', async () => {
  try {
    console.log('[Main] journal:listEntries called');
    return listEntries();
  } catch (err) {
    console.error('[Main] Error in journal:listEntries:', err);
    throw err;
  }
});

ipcMain.handle('journal:getEntry', async (_event, entryPath: string) => {
  return getEntry(entryPath);
});

ipcMain.handle('journal:saveFlowEntry', async (_event, date: string, content: string, metadata: FlowMetadata) => {
  const filePath = getFlowPath(date);
  let version = 1;

  try {
    const existing = await readFile(filePath, 'utf-8');
    const existingData = parseFlow(existing);
    version = (existingData.metadata?.version || 0) + 1;

    const previousWords = existingData.metadata?.wordCount || 0;
    const currentWords = content.split(/\s+/).filter(Boolean).length;
    if (Math.abs(currentWords - previousWords) > 50) {
      const backupPath = getFlowPath(date, existingData.metadata?.version || 1);
      await writeFile(backupPath, existing, 'utf-8');
    }
  } catch {
    // New file; start at v1
  }

  const updatedMetadata: FlowMetadata = {
    ...metadata,
    version,
    updated: new Date().toISOString(),
  };

  await writeFile(filePath, serializeFlow(content, updatedMetadata), 'utf-8');
});

ipcMain.handle('journal:getFlowEntry', async (_event, date: string) => {
  try {
    const content = await readFile(getFlowPath(date), 'utf-8');
    return parseFlow(content);
  } catch {
    return null;
  }
});

ipcMain.handle('journal:listFlowVersions', async (_event, date: string) => {
  try {
    const files = await readdir(PRESENT_PATH);
    return files
      .filter((file) => file.startsWith(`FLOW-${date}-v`) && file.endsWith('.md'))
      .map((file) => {
        const match = file.match(/-v(\d+)\.md$/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })
      .filter(Boolean)
      .sort((a, b) => b - a);
  } catch {
    return [];
  }
});

ipcMain.handle('journal:getFlowVersion', async (_event, date: string, version: number) => {
  try {
    const content = await readFile(getFlowPath(date, version), 'utf-8');
    return parseFlow(content);
  } catch {
    return null;
  }
});

// Files S1 API - File Tree Operations
ipcMain.handle('files:getFileTree', async () => {
  return getFileTree();
});

ipcMain.handle('files:getFileContent', async (_event, filePath: string) => {
  return getFileContent(filePath);
});

// Graph S2 API - Neo4j Operations
ipcMain.handle('graph:getGraph', async () => {
  try {
    console.log('[Main] graph:getGraph called');
    return getGraph();
  } catch (err) {
    console.error('[Main] Error in graph:getGraph:', err);
    throw err;
  }
});

ipcMain.handle('graph:getNodeById', async (_event, nodeId: string) => {
  return getNodeById(nodeId);
});

// Shell S0 API - Open external links
ipcMain.handle('shell:openExternal', async (_event, url: string) => {
  return shell.openExternal(url);
});

// Backlinks S1 API - Find incoming references
ipcMain.handle('backlinks:getBacklinks', async (_event, filePath: string) => {
  return getBacklinks(filePath);
});

ipcMain.handle('backlinks:resolveWikiLink', async (_event, linkText: string) => {
  return resolveWikiLink(linkText);
});

function getDailyNote(date: string): { content: string; path: string } | null {
  // Check both folder format (2026-01-24/2026-01-24.md) and flat format (2026-01-24.md)
  const folderPath = path.join(PRESENT_PATH, date, `${date}.md`);
  const flatPath = path.join(PRESENT_PATH, `${date}.md`);

  let notePath: string | null = null;

  if (fs.existsSync(folderPath)) {
    notePath = folderPath;
  } else if (fs.existsSync(flatPath)) {
    notePath = flatPath;
  }

  if (notePath) {
    try {
      const content = fs.readFileSync(notePath, 'utf-8');
      return { content, path: notePath };
    } catch {
      return null;
    }
  }

  return null;
}

// Entry metadata type (matches shared/types.ts)
interface EntryMetadata {
  id: string;
  entryId: string;
  title: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'unknown';
  created: string;
  path: string;
  contextPath: string;
}

// Find all Entry-XXX folders across all date folders
function listEntries(): EntryMetadata[] {
  const entries: EntryMetadata[] = [];

  try {
    // Get all items in Present folder
    const presentItems = fs.readdirSync(PRESENT_PATH);

    for (const item of presentItems) {
      const itemPath = path.join(PRESENT_PATH, item);
      const stat = fs.statSync(itemPath);

      // Check if it's a date folder (YYYY-MM-DD format)
      if (stat.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(item)) {
        const date = item;
        // Look for p0-idx or similar folders containing Entry-XXX
        const dateFolderItems = fs.readdirSync(itemPath);

        for (const subItem of dateFolderItems) {
          const subPath = path.join(itemPath, subItem);
          const subStat = fs.statSync(subPath);

          if (subStat.isDirectory()) {
            // Check for Entry-XXX folders in this subfolder
            if (subItem.startsWith('Entry-')) {
              // Entry folder directly in date folder
              const entryMeta = parseEntryFolder(subPath, date);
              if (entryMeta) entries.push(entryMeta);
            } else {
              // Check inside p0-idx type folders
              const entryFolders = fs.readdirSync(subPath).filter(
                f => f.startsWith('Entry-') && fs.statSync(path.join(subPath, f)).isDirectory()
              );
              for (const entryFolder of entryFolders) {
                const entryPath = path.join(subPath, entryFolder);
                const entryMeta = parseEntryFolder(entryPath, date);
                if (entryMeta) entries.push(entryMeta);
              }
            }
          }
        }
      }
    }

    // Sort by date (newest first), then by entry number
    entries.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      // Extract entry number for secondary sort
      const aNum = parseInt(a.id.replace('Entry-', ''), 10) || 0;
      const bNum = parseInt(b.id.replace('Entry-', ''), 10) || 0;
      return bNum - aNum;
    });

  } catch (err) {
    console.error('Error listing entries:', err);
  }

  return entries;
}

// Parse an Entry folder to extract metadata from CONTEXT.md
function parseEntryFolder(entryPath: string, date: string): EntryMetadata | null {
  const contextPath = path.join(entryPath, 'CONTEXT.md');

  if (!fs.existsSync(contextPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(contextPath, 'utf-8');
    const { data } = matter(content);

    // Extract title from frontmatter or first heading
    let title = data.title as string || '';
    if (!title) {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        title = headingMatch[1].trim();
      }
    }

    // Extract entry ID from folder name
    const id = path.basename(entryPath);

    // Normalize status
    const rawStatus = (data.status as string || '').toLowerCase();
    let status: EntryMetadata['status'] = 'unknown';
    if (rawStatus === 'pending') status = 'pending';
    else if (rawStatus === 'processing' || rawStatus === 'in_progress' || rawStatus === 'in-progress') status = 'processing';
    else if (rawStatus === 'completed' || rawStatus === 'complete' || rawStatus === 'done') status = 'completed';

    return {
      id,
      entryId: data.entry_id as string || `^${id.toLowerCase().replace('-', '')}`,
      title: title || id,
      date,
      status,
      created: data.created as string || `${date}T00:00:00`,
      path: entryPath,
      contextPath,
    };
  } catch (err) {
    console.error(`Error parsing entry at ${entryPath}:`, err);
    return null;
  }
}

// Get full content of an entry's CONTEXT.md
function getEntry(entryPath: string): { metadata: EntryMetadata; content: string } | null {
  // Extract date from path (assumes structure like .../2026-01-23/p0-idx/Entry-001)
  const pathParts = entryPath.split(path.sep);
  let date = '';
  for (const part of pathParts) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
      date = part;
      break;
    }
  }

  const metadata = parseEntryFolder(entryPath, date);
  if (!metadata) return null;

  try {
    const content = fs.readFileSync(metadata.contextPath, 'utf-8');
    return { metadata, content };
  } catch {
    return null;
  }
}

// File tree node type (matches shared/types.ts)
interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  section?: 'bimba' | 'pratibimba' | 'empty' | 'other';
  children?: FileTreeNode[];
}

// Determine vault section from path
function getVaultSection(itemPath: string): FileTreeNode['section'] {
  const relativePath = itemPath.replace(VAULT_PATH, '').toLowerCase();
  if (relativePath.startsWith('/bimba') || relativePath.startsWith('bimba')) {
    return 'bimba';
  } else if (relativePath.startsWith('/pratibimba') || relativePath.startsWith('pratibimba')) {
    return 'pratibimba';
  } else if (relativePath.startsWith('/empty') || relativePath.startsWith('empty')) {
    return 'empty';
  }
  return 'other';
}

// Get file extension from filename
function getFileExtension(filename: string): string | undefined {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return undefined;
}

// Build file tree recursively (max depth to prevent excessive recursion)
function buildFileTree(dirPath: string, maxDepth: number = 5, currentDepth: number = 0): FileTreeNode[] {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const nodes: FileTreeNode[] = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      // Skip hidden files and common non-content items
      if (item.startsWith('.') || item === 'node_modules' || item === '__pycache__') {
        continue;
      }

      const itemPath = path.join(dirPath, item);
      let stat: fs.Stats;

      try {
        stat = fs.statSync(itemPath);
      } catch {
        continue; // Skip items we cannot stat
      }

      const section = getVaultSection(itemPath);

      if (stat.isDirectory()) {
        const children = buildFileTree(itemPath, maxDepth, currentDepth + 1);
        nodes.push({
          name: item,
          path: itemPath,
          type: 'directory',
          section,
          children,
        });
      } else if (stat.isFile()) {
        nodes.push({
          name: item,
          path: itemPath,
          type: 'file',
          extension: getFileExtension(item),
          section,
        });
      }
    }

    // Sort: directories first, then files, both alphabetically
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
  }

  return nodes;
}

// Get the file tree starting from /Idea/
function getFileTree(): FileTreeNode[] {
  return buildFileTree(VAULT_PATH);
}

// Get content of a specific file
function getFileContent(filePath: string): { path: string; content: string; extension: string } | null {
  // Security check: ensure path is within vault
  if (!filePath.startsWith(VAULT_PATH)) {
    console.error('Attempted to access file outside vault:', filePath);
    return null;
  }

  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const extension = getFileExtension(path.basename(filePath)) || '';

    return { path: filePath, content, extension };
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

// Graph node type (matches shared/types.ts)
interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
  qlPosition?: string;
  title?: string;
  coordinate?: string;
}

// Graph relationship type (matches shared/types.ts)
interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, unknown>;
}

// Graph data type
interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

// Extract QL position from node properties
function extractQLPosition(properties: Record<string, unknown>): string | undefined {
  // Check common property names for QL position
  const posKeys = ['ql_position', 'qlPosition', 'position', 'p_position', 'm_primary'];
  for (const key of posKeys) {
    const val = properties[key];
    if (typeof val === 'string' && /^p[0-5]$/.test(val)) {
      return val;
    }
    // Handle numeric position
    if (typeof val === 'number' && val >= 0 && val <= 5) {
      return `p${val}`;
    }
  }
  // Check for coordinate with position encoded (e.g., "#2.1" -> p2)
  const coord = properties['coordinate'] || properties['coord'];
  if (typeof coord === 'string') {
    const match = coord.match(/#(\d)/);
    if (match && parseInt(match[1], 10) <= 5) {
      return `p${match[1]}`;
    }
  }
  return undefined;
}

// Get all nodes and relationships from Neo4j
async function getGraph(): Promise<GraphData | null> {
  let session: Session | null = null;
  try {
    const driver = getNeo4jDriver();
    session = driver.session();

    // Get all nodes
    const nodesResult = await session.run('MATCH (n) RETURN n LIMIT 500');
    const nodes: GraphNode[] = nodesResult.records.map(record => {
      const node = record.get('n');
      const props = node.properties as Record<string, unknown>;
      return {
        id: node.elementId,
        labels: node.labels,
        properties: props,
        qlPosition: extractQLPosition(props),
        title: (props.title || props.name || props.p1_title) as string | undefined,
        coordinate: (props.coordinate || props.coord) as string | undefined,
      };
    });

    // Get all relationships
    const relsResult = await session.run(
      'MATCH (a)-[r]->(b) RETURN r, elementId(a) as startId, elementId(b) as endId LIMIT 1000'
    );
    const relationships: GraphRelationship[] = relsResult.records.map(record => {
      const rel = record.get('r');
      return {
        id: rel.elementId,
        type: rel.type,
        startNodeId: record.get('startId'),
        endNodeId: record.get('endId'),
        properties: rel.properties as Record<string, unknown>,
      };
    });

    return { nodes, relationships };
  } catch (err) {
    console.error('Error fetching graph from Neo4j:', err);
    return null;
  } finally {
    if (session) {
      await session.close();
    }
  }
}

// Get a single node by ID
async function getNodeById(nodeId: string): Promise<GraphNode | null> {
  let session: Session | null = null;
  try {
    const driver = getNeo4jDriver();
    session = driver.session();

    const result = await session.run(
      'MATCH (n) WHERE elementId(n) = $nodeId RETURN n',
      { nodeId }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('n');
    const props = node.properties as Record<string, unknown>;
    return {
      id: node.elementId,
      labels: node.labels,
      properties: props,
      qlPosition: extractQLPosition(props),
      title: (props.title || props.name || props.p1_title) as string | undefined,
      coordinate: (props.coordinate || props.coord) as string | undefined,
    };
  } catch (err) {
    console.error('Error fetching node from Neo4j:', err);
    return null;
  } finally {
    if (session) {
      await session.close();
    }
  }
}


// Backlink reference type
interface BacklinkReference {
  sourcePath: string;
  sourceTitle: string;
  context: string;
  lineNumber: number;
}

// Backlinks data type
interface BacklinksData {
  targetPath: string;
  targetTitle: string;
  backlinks: BacklinkReference[];
}

// Get title from markdown file
function getTitleFromFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Try frontmatter title first
    const { data } = matter(content);
    if (data.title) return data.title;
    if (data.name) return data.name;

    // Try first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) return headingMatch[1].trim();

    // Fall back to filename
    return path.basename(filePath, path.extname(filePath));
  } catch {
    return path.basename(filePath, path.extname(filePath));
  }
}

// Helper: Recursively scan directory for markdown files containing wiki-links to target
function scanDirectoryForBacklinks(
  dirPath: string,
  targetPath: string,
  targetName: string,
  targetTitle: string,
  backlinks: BacklinkReference[],
  depth: number = 0
): void {
  if (depth > 5) return; // Limit recursion depth

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules' || item === '__pycache__') {
        continue;
      }

      const itemPath = path.join(dirPath, item);
      let stat: fs.Stats;

      try {
        stat = fs.statSync(itemPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        scanDirectoryForBacklinks(itemPath, targetPath, targetName, targetTitle, backlinks, depth + 1);
      } else if (stat.isFile() && item.endsWith('.md')) {
        // Skip the target file itself
        if (itemPath === targetPath) continue;

        // Scan for wiki-links
        try {
          const content = fs.readFileSync(itemPath, 'utf-8');
          const lines = content.split('\n');

          lines.forEach((line, idx) => {
            // Match wiki-links: [[target]] or [[target|alias]]
            const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
            let match;

            while ((match = wikiLinkRegex.exec(line)) !== null) {
              const linkTarget = match[1].toLowerCase().trim();

              // Check if this link points to our target
              if (linkTarget === targetName ||
                linkTarget === targetTitle.toLowerCase() ||
                linkTarget.endsWith('/' + targetName)) {

                // Extract context (surrounding text)
                const contextStart = Math.max(0, match.index - 40);
                const contextEnd = Math.min(line.length, match.index + match[0].length + 40);
                let context = line.substring(contextStart, contextEnd);
                if (contextStart > 0) context = '...' + context;
                if (contextEnd < line.length) context = context + '...';

                backlinks.push({
                  sourcePath: itemPath,
                  sourceTitle: getTitleFromFile(itemPath),
                  context: context.trim(),
                  lineNumber: idx + 1,
                });
              }
            }
          });
        } catch {
          // Skip files we can't read
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }
}

// Scan markdown files for wiki-links pointing to target
function getBacklinks(targetPath: string): BacklinksData | null {
  try {
    // Normalize target for matching
    const targetName = path.basename(targetPath, path.extname(targetPath)).toLowerCase();
    const targetTitle = getTitleFromFile(targetPath);

    const backlinks: BacklinkReference[] = [];

    // Scan the vault
    scanDirectoryForBacklinks(VAULT_PATH, targetPath, targetName, targetTitle, backlinks);

    return {
      targetPath,
      targetTitle,
      backlinks,
    };
  } catch (err) {
    console.error('Error getting backlinks:', err);
    return null;
  }
}

// Helper: Recursively search directory for file matching name
function findFileByName(dirPath: string, targetName: string, depth: number = 0): string | null {
  if (depth > 5) return null;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules' || item === '__pycache__') {
        continue;
      }

      const itemPath = path.join(dirPath, item);
      let stat: fs.Stats;

      try {
        stat = fs.statSync(itemPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        const found = findFileByName(itemPath, targetName, depth + 1);
        if (found) return found;
      } else if (stat.isFile()) {
        const baseName = path.basename(item, path.extname(item)).toLowerCase();
        if (baseName === targetName) {
          return itemPath;
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return null;
}

// Resolve a wiki-link to a file path
function resolveWikiLink(linkText: string): string | null {
  // Normalize link text
  const targetName = linkText.trim().toLowerCase();
  return findFileByName(VAULT_PATH, targetName);
}

// S3' Gateway WebSocket IPC Handlers
ipcMain.handle('s3:isConnected', () => {
  const client = getS3GatewayClient();
  return client.isConnected();
});

ipcMain.handle('s3:send', (_event, message: object) => {
  const client = getS3GatewayClient();
  client.send(message);
});

ipcMain.handle(
  's3:configure',
  async (
    _event,
    config?: { url?: string; token?: string | null; password?: string | null; reconnect?: boolean }
  ) => {
    const client = getS3GatewayClient();
    client.configure({
      url: config?.url,
      token: config?.token,
      password: config?.password,
    });
    if (config?.reconnect) {
      client.disconnect();
      client.connect();
    }
    return { success: true };
  }
);

// S3' Gateway message forwarding to renderer
function setupS3MessageForwarding(): void {
  const client = getS3GatewayClient();

  client.onMessage((message) => {
    // Forward S3' gateway messages to all renderer windows
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('s3:message', message);
    });
  });

  client.onOpen(() => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('s3:connected');
    });
  });

  client.onClose(() => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('s3:disconnected');
    });
  });

  client.onError((error) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('s3:error', error.message);
    });
  });
}

// Epi-Claw JSON-RPC 2.0 IPC Handlers
ipcMain.handle('epiclaws:isConnected', () => {
  const client = getEpiClawClient();
  return client.isConnected();
});

ipcMain.handle('epiclaws:getConnectionState', () => {
  const client = getEpiClawClient();
  return client.getConnectionState();
});

ipcMain.handle('epiclaws:request', async (_event, method: string, params?: Record<string, unknown>) => {
  const client = getEpiClawClient();
  try {
    const result = await client.request(method, params);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('epiclaws:agent', async (_event, message: string, sessionKey?: string) => {
  const client = getEpiClawClient();
  try {
    const params: Record<string, unknown> = { message };
    const resolvedSessionKey = await client.resolveDefaultSessionKey(sessionKey);
    if (resolvedSessionKey) {
      params.sessionKey = resolvedSessionKey;
    }
    const result = await client.request('agent', params);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('epiclaws:sessionsList', async () => {
  const client = getEpiClawClient();
  try {
    const result = await client.request('sessions.list', {});
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('epiclaws:sessionsDelete', async (_event, sessionKey: string) => {
  const client = getEpiClawClient();
  try {
    const result = await client.request('sessions.delete', { sessionKey });
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('epiclaws:configGet', async (_event, key?: string) => {
  const client = getEpiClawClient();
  try {
    const result = await client.request('config', key ? { key } : {});
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('epiclaws:configSet', async (_event, key: string, value: unknown) => {
  const client = getEpiClawClient();
  try {
    const result = await client.request('config', { key, value });
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('epiclaws:subscribe', async (_event, event: string) => {
  const client = getEpiClawClient();
  try {
    epiClawSubscribedEvents.add(event);
    const forwarder = getEpiClawEventForwarder(event);
    if (client.isConnected()) {
      await client.subscribe(event, forwarder);
      return { success: true };
    }
    // Not connected yet - keep event queued and subscribe on next open.
    return { success: true, pending: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('epiclaws:unsubscribe', async (_event, event: string) => {
  const client = getEpiClawClient();
  try {
    epiClawSubscribedEvents.delete(event);
    const forwarder = epiClawEventForwarders.get(event);
    if (forwarder) {
      await client.unsubscribe(event, forwarder);
      epiClawEventForwarders.delete(event);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Epi-Claw event forwarding to renderer
function setupEpiClawEventForwarding(): void {
  const client = getEpiClawClient();

  client.onOpen(() => {
    void ensureEpiClawEventSubscriptions();
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('epiclaws:connected');
    });
  });

  client.onClose(() => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('epiclaws:disconnected');
    });
  });

  client.onError((error) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('epiclaws:error', error.message);
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  // Register forwarding handlers before connecting to avoid missing early open events.
  setupS3MessageForwarding();
  setupEpiClawEventForwarding();

  // Initialize S3' Gateway connection (EpiClaw shares this connection)
  const client = getS3GatewayClient();
  const epiClaw = getEpiClawClient();

  // Keep EpiClaw state in sync with S3' gateway socket lifecycle.
  client.onOpen(() => {
    epiClaw.connect();
  });
  client.onClose(() => {
    epiClaw.disconnect();
  });

  client.connect();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up Neo4j driver, S3' Gateway client, and Epi-Claw client on quit
app.on('will-quit', async () => {
  closeS3GatewayClient();
  closeEpiClawClient();
  await closeNeo4jDriver();
});
