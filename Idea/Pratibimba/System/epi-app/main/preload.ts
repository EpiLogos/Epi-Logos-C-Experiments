import { contextBridge, ipcRenderer } from 'electron';

type EpiClawEventFrame = {
  type: 'event';
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: { presence: number; health: number };
};

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

// Expose a limited API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
});

// S' API - Stack Layer APIs
contextBridge.exposeInMainWorld('sPrime', {
  // S0: Terminal/Shell APIs
  s0: {
    shell: {
      openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    },
  },
  // S1: Obsidian/File APIs
  s1: {
    journal: {
      getTodayNote: () => ipcRenderer.invoke('journal:getTodayNote'),
      getDailyNote: (date: string) => ipcRenderer.invoke('journal:getDailyNote', date),
      listEntries: () => ipcRenderer.invoke('journal:listEntries'),
      getEntry: (entryPath: string) => ipcRenderer.invoke('journal:getEntry', entryPath),
      saveFlowEntry: (date: string, content: string, metadata: FlowMetadata) =>
        ipcRenderer.invoke('journal:saveFlowEntry', date, content, metadata),
      getFlowEntry: (date: string) => ipcRenderer.invoke('journal:getFlowEntry', date),
      listFlowVersions: (date: string) => ipcRenderer.invoke('journal:listFlowVersions', date),
      getFlowVersion: (date: string, version: number) =>
        ipcRenderer.invoke('journal:getFlowVersion', date, version),
    },
    files: {
      getFileTree: () => ipcRenderer.invoke('files:getFileTree'),
      getFileContent: (filePath: string) => ipcRenderer.invoke('files:getFileContent', filePath),
    },
    backlinks: {
      getBacklinks: (filePath: string) => ipcRenderer.invoke('backlinks:getBacklinks', filePath),
      resolveWikiLink: (linkText: string) => ipcRenderer.invoke('backlinks:resolveWikiLink', linkText),
    },
  },
  // S2: Neo4j Graph API
  s2: {
    graph: {
      getGraph: () => ipcRenderer.invoke('graph:getGraph'),
      getNodeById: (nodeId: string) => ipcRenderer.invoke('graph:getNodeById', nodeId),
    },
  },
  // S3': Gateway WebSocket (epi gate, port 18794)
  s3: {
    websocket: {
      isConnected: () => ipcRenderer.invoke('s3:isConnected'),
      send: (message: object) => ipcRenderer.invoke('s3:send', message),
      configure: (config: { url?: string; token?: string | null; password?: string | null; reconnect?: boolean }) =>
        ipcRenderer.invoke('s3:configure', config),
      onMessage: (callback: (message: unknown) => void) => {
        const handler = (_event: Electron.IpcRendererEvent, message: unknown) => callback(message);
        ipcRenderer.on('s3:message', handler);
        return () => ipcRenderer.removeListener('s3:message', handler);
      },
      onConnected: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on('s3:connected', handler);
        return () => ipcRenderer.removeListener('s3:connected', handler);
      },
      onDisconnected: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on('s3:disconnected', handler);
        return () => ipcRenderer.removeListener('s3:disconnected', handler);
      },
      onError: (callback: (error: string) => void) => {
        const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error);
        ipcRenderer.on('s3:error', handler);
        return () => ipcRenderer.removeListener('s3:error', handler);
      },
    },
  },
  // S4: Claude Code (placeholder)
  s4: {},
  // S5: Notion/Reflection (placeholder)
  s5: {},

  // Epi-Claw API - JSON-RPC 2.0 Gateway Client
  epiClaw: {
    // Connection status
    isConnected: () => ipcRenderer.invoke('epiclaws:isConnected'),
    getConnectionState: () => ipcRenderer.invoke('epiclaws:getConnectionState'),

    // JSON-RPC 2.0 request methods
    request: (method: string, params?: Record<string, unknown>) =>
      ipcRenderer.invoke('epiclaws:request', method, params),

    // Gateway method helpers
    agent: (message: string, sessionKey?: string) =>
      ipcRenderer.invoke('epiclaws:agent', message, sessionKey),

    sessionsList: () => ipcRenderer.invoke('epiclaws:sessionsList'),
    sessionsDelete: (sessionKey: string) => ipcRenderer.invoke('epiclaws:sessionsDelete', sessionKey),

    configGet: (key?: string) => ipcRenderer.invoke('epiclaws:configGet', key),
    configSet: (key: string, value: unknown) => ipcRenderer.invoke('epiclaws:configSet', key, value),

    // Event subscriptions
    subscribe: (event: string, callback: (frame: EpiClawEventFrame | unknown) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, frame: EpiClawEventFrame | unknown) => callback(frame);
      ipcRenderer.on(`epiclaws:event:${event}`, listener);
      void ipcRenderer.invoke('epiclaws:subscribe', event);
      return () => {
        ipcRenderer.removeListener(`epiclaws:event:${event}`, listener);
        void ipcRenderer.invoke('epiclaws:unsubscribe', event);
      };
    },
    unsubscribe: (event: string) => ipcRenderer.invoke('epiclaws:unsubscribe', event),

    // Connection events
    onConnected: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on('epiclaws:connected', handler);
      return () => ipcRenderer.removeListener('epiclaws:connected', handler);
    },

    onDisconnected: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on('epiclaws:disconnected', handler);
      return () => ipcRenderer.removeListener('epiclaws:disconnected', handler);
    },

    onError: (callback: (error: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error);
      ipcRenderer.on('epiclaws:error', handler);
      return () => ipcRenderer.removeListener('epiclaws:error', handler);
    },
  },
});
