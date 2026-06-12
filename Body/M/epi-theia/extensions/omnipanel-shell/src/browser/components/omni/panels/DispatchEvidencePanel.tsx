import type {
  DispatchGenealogySelection,
  DispatchGenealogySnapshot
} from '../../../../common/dispatch-genealogy';
import {
  findDispatchGenealogyNode,
  selectDispatchGenealogyNode
} from '../../../../common/dispatch-genealogy';

type DispatchEvidencePanelProps = {
  snapshot: DispatchGenealogySnapshot;
  selectedNodeId: string | null;
  onOpenSource: (selection: DispatchGenealogySelection) => void;
};

export function DispatchEvidencePanel({
  snapshot,
  selectedNodeId,
  onOpenSource,
}: DispatchEvidencePanelProps) {
  const selectedNode = findDispatchGenealogyNode(snapshot, selectedNodeId) ?? firstEvidenceNode(snapshot);

  return (
    <div className="p-6 space-y-4" data-test="dispatch-genealogy-evidence-panel">
      <div>
        <h3 className="text-lg font-bold">Evidence</h3>
        <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
          dispatch-genealogy · {snapshot.sessionKey ?? 'no-session'}
        </div>
      </div>

      {!selectedNode ? (
        <div className="text-xs text-[var(--text-tertiary)] italic">No dispatch evidence selected.</div>
      ) : (
        <div
          className="p-3 rounded border border-[var(--border-subtle)] bg-white/5 space-y-3"
          data-test="dispatch-genealogy-evidence-selected"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold">{selectedNode.evidenceRef?.label ?? selectedNode.label}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
                {selectedNode.evidenceRef?.id ?? selectedNode.id}
              </div>
            </div>
            <button
              type="button"
              disabled={!selectedNode.sourceRef}
              className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
              onClick={() => {
                const selection = selectDispatchGenealogyNode(snapshot, selectedNode.id);
                if (selection) {
                  onOpenSource(selection);
                }
              }}
            >
              Source
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-2">
            <EvidenceField label="node" value={selectedNode.id} />
            <EvidenceField label="coordinate" value={selectedNode.evidenceRef?.coordinate} />
            <EvidenceField label="artifact" value={selectedNode.evidenceRef?.artifactUri} />
            <EvidenceField label="review" value={selectedNode.evidenceRef?.reviewId} />
            <EvidenceField label="sourceAnchor" value={selectedNode.sourceRef?.sourceAnchor} />
            <EvidenceField label="session" value={selectedNode.provenance.sessionKey} />
          </dl>
        </div>
      )}
    </div>
  );
}

function EvidenceField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] uppercase text-[var(--text-tertiary)]">{label}</dt>
      <dd className="text-[10px] font-mono truncate" title={value ?? 'n/a'}>{value ?? 'n/a'}</dd>
    </div>
  );
}

function firstEvidenceNode(snapshot: DispatchGenealogySnapshot) {
  const stack = [...snapshot.nodes];
  while (stack.length > 0) {
    const node = stack.shift();
    if (!node) {
      continue;
    }
    if (node.evidenceRef) {
      return node;
    }
    stack.push(...node.children);
  }
  return null;
}
