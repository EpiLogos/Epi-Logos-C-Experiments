import type {
  DispatchGenealogyNode,
  DispatchGenealogySelection,
  DispatchGenealogySnapshot
} from '../../../../common/dispatch-genealogy';
import {
  buildCanonicalDispatchGenealogy,
  findDispatchGenealogyNode,
  selectDispatchGenealogyNode
} from '../../../../common/dispatch-genealogy';
import { formatTs } from './panelUtils';

// Canonical Pi → Anima → 6 Aletheia techne-guardian reference topology, shown
// when no live session genealogy has resolved. Built once with a fixed stamp
// so it stays referentially stable across renders.
const CANONICAL_SNAPSHOT = buildCanonicalDispatchGenealogy(0);

type DispatchTracePanelProps = {
  snapshot: DispatchGenealogySnapshot;
  selectedNodeId: string | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectNode: (selection: DispatchGenealogySelection) => void;
  onOpenEvidence: (selection: DispatchGenealogySelection) => void;
  onOpenSource: (selection: DispatchGenealogySelection) => void;
};

export function DispatchTracePanel({
  snapshot,
  selectedNodeId,
  loading,
  error,
  onRefresh,
  onSelectNode,
  onOpenEvidence,
  onOpenSource,
}: DispatchTracePanelProps) {
  const isCanonicalFallback = snapshot.nodes.length === 0;
  const activeSnapshot = isCanonicalFallback ? CANONICAL_SNAPSHOT : snapshot;
  const selectedNode = findDispatchGenealogyNode(activeSnapshot, selectedNodeId);

  const selectNode = (nodeId: string) => {
    const selection = selectDispatchGenealogyNode(activeSnapshot, nodeId);
    if (selection) {
      onSelectNode(selection);
    }
  };

  return (
    <div className="p-6 space-y-4" data-test="dispatch-genealogy-trace-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Dispatch Trace</h3>
          <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
            {activeSnapshot.sessionKey ?? 'no-session'} · {activeSnapshot.source}
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      {error && <div className="text-xs text-red-300">{error}</div>}

      {isCanonicalFallback && (
        <div
          className="text-[10px] text-[var(--text-tertiary)] italic"
          data-test="dispatch-genealogy-canonical-fallback"
        >
          No live dispatch genealogy resolved — showing the canonical
          Pi → Anima → Aletheia techne-guardian reference topology.
        </div>
      )}

      <div className="space-y-2" data-test="dispatch-genealogy-tree">
        {activeSnapshot.nodes.map((node) => (
          <DispatchTraceNode
            key={node.id}
            node={node}
            depth={0}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
          />
        ))}
      </div>

      {selectedNode && (
        <div
          className="p-3 rounded border border-[var(--border-subtle)] bg-black/20 space-y-2"
          data-test="dispatch-genealogy-selected-node"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold">{selectedNode.label}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
                {selectedNode.id}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
                onClick={() => {
                  const selection = selectDispatchGenealogyNode(activeSnapshot, selectedNode.id);
                  if (selection) {
                    onOpenEvidence(selection);
                  }
                }}
              >
                Evidence
              </button>
              <button
                type="button"
                className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
                disabled={!selectedNode.sourceRef}
                onClick={() => {
                  const selection = selectDispatchGenealogyNode(activeSnapshot, selectedNode.id);
                  if (selection) {
                    onOpenSource(selection);
                  }
                }}
              >
                Source
              </button>
            </div>
          </div>
          <TraceMetadata node={selectedNode} />
        </div>
      )}
    </div>
  );
}

type DispatchTraceNodeProps = {
  node: DispatchGenealogyNode;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
};

function DispatchTraceNode({ node, depth, selectedNodeId, onSelectNode }: DispatchTraceNodeProps) {
  const selected = node.id === selectedNodeId;
  const hasChildren = node.children.length > 0;
  const body = (
    <div
      className={`p-3 rounded border ${
        selected
          ? 'border-[var(--color-m5)]/70 bg-[var(--color-m5)]/15'
          : 'border-[var(--border-subtle)] bg-white/5'
      }`}
      style={{ marginLeft: `${depth * 18}px` }}
      data-test={`dispatch-genealogy-node-${node.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 text-left"
          onClick={() => onSelectNode(node.id)}
        >
          <div className="text-xs font-semibold truncate">
            {node.role} · {node.agentId}
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
            {node.toolName ?? 'dispatch'} · {formatTraceTime(node.startedAtMs, node.endedAtMs)}
          </div>
        </button>
        <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
          {node.status}
        </span>
      </div>
      <GateRow node={node} />
      <TraceMetadata node={node} compact />
    </div>
  );

  if (!hasChildren) {
    return body;
  }

  return (
    <details open className="space-y-2">
      <summary className="list-none cursor-pointer">{body}</summary>
      <div className="space-y-2 mt-2">
        {node.children.map((child) => (
          <DispatchTraceNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </details>
  );
}

function GateRow({ node }: { node: DispatchGenealogyNode }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2" data-test={`dispatch-genealogy-gates-${node.id}`}>
      {node.capabilityGates.map((gate) => (
        <span
          key={gate.id}
          title={gate.reason ?? gate.label}
          className={`text-[10px] px-2 py-0.5 rounded border ${gateClass(gate.status)}`}
        >
          {gate.label}: {gate.status}
        </span>
      ))}
    </div>
  );
}

function TraceMetadata({ node, compact = false }: { node: DispatchGenealogyNode; compact?: boolean }) {
  const provenance = node.provenance;
  const fields = [
    ['session', provenance.sessionKey],
    ['day', provenance.dayId],
    ['team', provenance.teamId],
    ['role', provenance.teamRole],
    ['source', provenance.sourceSessionKey],
    ['evidence', node.evidenceRef?.id],
    ['sourceAnchor', node.sourceRef?.sourceAnchor],
  ].filter(([, value]) => Boolean(value));

  if (fields.length === 0) {
    return null;
  }

  return (
    <dl className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} gap-2 mt-2`}>
      {fields.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[9px] uppercase text-[var(--text-tertiary)]">{label}</dt>
          <dd className="text-[10px] font-mono truncate" title={String(value)}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatTraceTime(startedAtMs: number | null, endedAtMs?: number | null): string {
  const started = formatTs(startedAtMs);
  if (!endedAtMs || !startedAtMs) {
    return started;
  }
  return `${started} +${Math.max(0, endedAtMs - startedAtMs)}ms`;
}

function gateClass(status: string): string {
  if (status === 'allowed') {
    return 'border-emerald-400/40 text-emerald-200';
  }
  if (status === 'blocked') {
    return 'border-red-400/40 text-red-200';
  }
  if (status === 'required') {
    return 'border-amber-400/40 text-amber-200';
  }
  return 'border-[var(--border-subtle)] text-[var(--text-tertiary)]';
}
