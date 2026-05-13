import { useEffect, Suspense, lazy } from 'react';
import { useUiStore, type ActiveWorkspace, type ViewDimension } from '@/stores/uiStore';
import { useGraphStore } from '@/stores/graphStore';
import { Map, Box } from 'lucide-react';
import { BimbaMap2D } from '@/domains/M0_Anuttara/BimbaMap2D';
import { NaraDashboard } from '@/domains/M4_Nara/NaraDashboard';
import { EpiiDashboard } from '@/domains/M5_Epii/EpiiDashboard';

const BimbaMap3D = lazy(() =>
  import('@/domains/M0_Anuttara/BimbaMap3D').then((m) => ({ default: m.BimbaMap3D })),
);

const M0_LABELS: Record<ViewDimension, string> = {
  '2d': 'Bimba Map 2D',
  '3d': 'Bimba Map 3D',
};

function WorkspaceHeader({ ws }: { ws: ActiveWorkspace }) {
  const { viewDimension, toggleDimension } = useUiStore();

  const config: Record<ActiveWorkspace, { label: string; coordinate: string; color: string }> = {
    M0: { label: 'Anuttara', coordinate: 'M0', color: '#a78bfa' },
    M4: { label: 'Nara', coordinate: 'M4', color: '#f59e0b' },
    M5: { label: 'Epii', coordinate: 'M5', color: '#3b82f6' },
  };

  const c = config[ws];

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${c.color}20`, color: c.color }}
        >
          {c.coordinate}
        </span>
        <span className="text-sm font-medium text-neutral-300">{c.label}</span>
        {ws === 'M0' && (
          <span className="text-xs text-neutral-600">{M0_LABELS[viewDimension]}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {ws === 'M0' && (
          <button
            onClick={toggleDimension}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            title="Toggle 2D/3D (⌘D)"
          >
            {viewDimension === '2d' ? <Map size={14} /> : <Box size={14} />}
            {viewDimension === '2d' ? '3D' : '2D'}
          </button>
        )}
      </div>
    </div>
  );
}


function M0Workspace() {
  const { viewDimension } = useUiStore();
  const { data, connected, connect, fetchGraph, selectedNode } = useGraphStore();

  useEffect(() => {
    if (!connected) {
      connect().then(() => fetchGraph());
    }
  }, [connect, connected, fetchGraph]);

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600">
        <div className="text-center">
          <Map size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Connecting to Neo4j...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600">
        <p className="text-sm">Loading graph...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {viewDimension === '2d' ? (
        <BimbaMap2D />
      ) : (
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm">
              Loading 3D...
            </div>
          }
        >
          <BimbaMap3D />
        </Suspense>
      )}

      {/* Selected node overlay */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/90 border border-neutral-700 rounded-lg px-3 py-2 backdrop-blur">
          <p className="text-xs font-mono text-violet-400">
            {selectedNode.coordinate ?? selectedNode.id}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            {selectedNode.labels.join(', ')} · {data.nodes.length} nodes, {data.edges.length} edges
          </p>
        </div>
      )}
    </div>
  );
}

function M4Workspace() {
  return <NaraDashboard />;
}

function M5Workspace() {
  return <EpiiDashboard />;
}

function WorkspaceContent({ ws }: { ws: ActiveWorkspace }) {
  switch (ws) {
    case 'M0':
      return <M0Workspace />;
    case 'M4':
      return <M4Workspace />;
    case 'M5':
      return <M5Workspace />;
  }
}

export function WorkspacePanel() {
  const { activeWorkspace } = useUiStore();

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <WorkspaceHeader ws={activeWorkspace} />
      <WorkspaceContent ws={activeWorkspace} />
    </div>
  );
}
