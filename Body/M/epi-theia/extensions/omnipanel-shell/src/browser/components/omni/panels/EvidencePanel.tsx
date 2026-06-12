import { useMemo, useState, type ReactNode } from 'react';
import type { MediatedRunEvidencePacket } from '@pratibimba/integrated-composition';
import type {
  DispatchGenealogyEvent,
  DispatchGenealogyEvidenceRef,
  DispatchGenealogyNode,
  DispatchGenealogySelection,
  DispatchGenealogySnapshot
} from '../../../../common/dispatch-genealogy';
import {
  findDispatchGenealogyNode,
  flattenDispatchGenealogyEvents,
  selectDispatchGenealogyNode
} from '../../../../common/dispatch-genealogy';
import { formatTs } from './panelUtils';

export type EvidenceArtifactType = 'log' | 'diff' | 'snapshot' | 'test-output' | 'metric';
export type EvidenceVerificationState = 'verified' | 'pending' | 'failed';
export type EvidencePrivacyClass = 'public' | 'protected' | 'protected-local' | 'private' | string;

export type EvidenceTabState = {
  readonly selectedPacketId: string | null;
  readonly filters: Record<string, unknown>;
  readonly scrollOffset: number;
  readonly depositFormOpen: boolean;
  readonly depositFormDraft?: Record<string, unknown>;
};

export type EvidenceArtifact = {
  readonly id: string;
  readonly type: EvidenceArtifactType;
  readonly label: string;
  readonly timestampMs: number | null;
  readonly sizeBytes: number | null;
  readonly value: unknown;
  readonly dispatchNodeId: string | null;
  readonly expanded: boolean;
};

export type EvidencePacketViewModel = {
  readonly packet: MediatedRunEvidencePacket;
  readonly packetId: string;
  readonly runId: string;
  readonly actor: string;
  readonly title: string;
  readonly summary: string;
  readonly confidence: number | null;
  readonly verifiability: string;
  readonly privacyClass: EvidencePrivacyClass;
  readonly startedAtMs: number | null;
  readonly endedAtMs: number | null;
  readonly verificationState: EvidenceVerificationState;
  readonly artifacts: readonly EvidenceArtifact[];
  readonly dispatchNodeId: string | null;
  readonly toolEventIds: readonly string[];
  readonly sourcePaths: readonly string[];
};

type EvidencePanelProps = {
  snapshot: DispatchGenealogySnapshot;
  selectedNodeId: string | null;
  packets?: readonly MediatedRunEvidencePacket[];
  initialState?: Partial<EvidenceTabState>;
  onStateChange?: (state: EvidenceTabState) => void;
  onActivateDispatchTrace: (selection: DispatchGenealogySelection) => void;
  onOpenSource: (selection: DispatchGenealogySelection) => void;
};

const DEFAULT_EVIDENCE_TAB_STATE: EvidenceTabState = Object.freeze({
  selectedPacketId: null,
  filters: Object.freeze({}),
  scrollOffset: 0,
  depositFormOpen: false
});

export function EvidencePanel({
  snapshot,
  selectedNodeId,
  packets,
  initialState,
  onStateChange,
  onActivateDispatchTrace,
  onOpenSource
}: EvidencePanelProps) {
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(
    initialState?.selectedPacketId ?? null
  );
  const [scrollOffset, setScrollOffset] = useState(initialState?.scrollOffset ?? 0);
  const [depositFormOpen, setDepositFormOpen] = useState(
    initialState?.depositFormOpen ?? DEFAULT_EVIDENCE_TAB_STATE.depositFormOpen
  );
  const filters = initialState?.filters ?? DEFAULT_EVIDENCE_TAB_STATE.filters;
  const models = useMemo(
    () => evidencePacketsFromSnapshot(snapshot, packets),
    [snapshot, packets]
  );
  const selectedFromNode = selectedNodeId
    ? models.find((model) => model.dispatchNodeId === selectedNodeId)?.packetId ?? null
    : null;
  const selectedPacket =
    models.find((model) => model.packetId === (selectedPacketId ?? selectedFromNode)) ??
    models[0] ??
    null;

  const persist = (patch: Partial<EvidenceTabState>) => {
    onStateChange?.({
      ...DEFAULT_EVIDENCE_TAB_STATE,
      selectedPacketId,
      filters,
      scrollOffset,
      depositFormOpen,
      ...patch
    });
  };

  const selectPacket = (packetId: string) => {
    setSelectedPacketId(packetId);
    persist({ selectedPacketId: packetId });
  };

  const selectArtifactDispatch = (artifact: EvidenceArtifact) => {
    const selection = resolveEvidenceDispatchSelection(snapshot, artifact.dispatchNodeId);
    if (selection) {
      onActivateDispatchTrace(selection);
    }
  };

  const openSource = (model: EvidencePacketViewModel) => {
    const selection = resolveEvidenceDispatchSelection(snapshot, model.dispatchNodeId);
    if (selection) {
      onOpenSource(selection);
    }
  };

  return (
    <div className="p-6 space-y-4" data-test="evidence-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Evidence</h3>
          <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
            MediatedRunEvidencePacket · {snapshot.sessionKey ?? 'no-session'}
          </div>
        </div>
        <button
          type="button"
          className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
          onClick={() => {
            setDepositFormOpen((current) => {
              const next = !current;
              persist({ depositFormOpen: next });
              return next;
            });
          }}
        >
          Deposit new
        </button>
      </div>

      {depositFormOpen && (
        <section data-test="evidence-deposit-form" className="p-3 border border-[var(--border-subtle)] bg-white/5">
          <div className="text-xs font-semibold">EvidenceDepositForm</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">
            Gateway deposition is pending the s5.epii.deposit runtime endpoint.
          </div>
        </section>
      )}

      {models.length === 0 ? (
        <div className="text-xs text-[var(--text-tertiary)] italic">No mediated evidence packets resolved.</div>
      ) : (
        <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-4">
          <EvidencePacketList
            packets={models}
            selectedPacketId={selectedPacket?.packetId ?? null}
            scrollOffset={scrollOffset}
            onScrollOffsetChange={(nextOffset) => {
              setScrollOffset(nextOffset);
              persist({ scrollOffset: nextOffset });
            }}
            onSelectPacket={selectPacket}
          />
          {selectedPacket && (
            <EvidencePacketView
              model={selectedPacket}
              onSelectArtifactDispatch={selectArtifactDispatch}
              onOpenDispatchTrace={() => {
                const selection = resolveEvidenceDispatchSelection(snapshot, selectedPacket.dispatchNodeId);
                if (selection) {
                  onActivateDispatchTrace(selection);
                }
              }}
              onOpenSource={() => openSource(selectedPacket)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function EvidencePacketList({
  packets,
  selectedPacketId,
  scrollOffset,
  onScrollOffsetChange,
  onSelectPacket
}: {
  packets: readonly EvidencePacketViewModel[];
  selectedPacketId: string | null;
  scrollOffset: number;
  onScrollOffsetChange: (scrollOffset: number) => void;
  onSelectPacket: (packetId: string) => void;
}) {
  const rowHeight = 68;
  const height = 430;
  const startIndex = Math.max(0, Math.floor(scrollOffset / rowHeight) - 3);
  const visiblePackets = packets.slice(startIndex, startIndex + Math.ceil(height / rowHeight) + 6);

  return (
    <div
      data-test="evidence-packet-list"
      style={{ height, overflowY: 'auto' }}
      onScroll={(event) => onScrollOffsetChange(event.currentTarget.scrollTop)}
    >
      <div style={{ height: packets.length * rowHeight, position: 'relative' }}>
        {visiblePackets.map((packet, offset) => {
          const index = startIndex + offset;
          const selected = packet.packetId === selectedPacketId;
          return (
            <button
              key={packet.packetId}
              type="button"
              data-test={`evidence-packet-row-${packet.packetId}`}
              data-selected={selected ? 'true' : 'false'}
              className={`absolute left-0 right-0 p-2 text-left rounded border ${
                selected
                  ? 'border-[var(--color-m5)]/70 bg-[var(--color-m5)]/15'
                  : 'border-[var(--border-subtle)] bg-white/5 hover:bg-white/10'
              }`}
              style={{ top: index * rowHeight, height: rowHeight - 6 }}
              onClick={() => onSelectPacket(packet.packetId)}
            >
              <div className="text-xs font-semibold truncate">{packet.title}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">{packet.packetId}</div>
              <div className="mt-1 flex gap-1">
                <Badge>{packet.actor}</Badge>
                <Badge>{packet.privacyClass}</Badge>
                <Badge>{packet.verificationState}</Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EvidencePacketView({
  model,
  onSelectArtifactDispatch,
  onOpenDispatchTrace,
  onOpenSource
}: {
  model: EvidencePacketViewModel;
  onSelectArtifactDispatch: (artifact: EvidenceArtifact) => void;
  onOpenDispatchTrace: () => void;
  onOpenSource: () => void;
}) {
  return (
    <article
      className="min-w-0 space-y-4"
      data-test="evidence-packet-view"
      data-packet-id={model.packetId}
      data-privacy-class={normalizeEvidencePrivacyClass(model.privacyClass)}
    >
      <EvidencePacketHeader model={model} />
      <EvidencePacketSummary model={model} />
      <EvidenceVerificationStatus state={model.verificationState} />
      <EvidenceArtifactList
        model={model}
        onSelectArtifactDispatch={onSelectArtifactDispatch}
      />
      <EvidenceCrossReferences
        model={model}
        onOpenDispatchTrace={onOpenDispatchTrace}
        onOpenSource={onOpenSource}
      />
    </article>
  );
}

export function EvidencePacketHeader({ model }: { model: EvidencePacketViewModel }) {
  return (
    <header className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-bold truncate">{model.title}</h4>
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] truncate">
            packet {model.packetId} · run {model.runId}
          </div>
        </div>
        <Badge>{model.privacyClass}</Badge>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        <EvidenceField label="actor" value={model.actor} />
        <EvidenceField label="start" value={formatTs(model.startedAtMs)} />
        <EvidenceField label="end" value={formatTs(model.endedAtMs)} />
      </dl>
    </header>
  );
}

export function EvidencePacketSummary({ model }: { model: EvidencePacketViewModel }) {
  return (
    <section className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
      <div className="text-xs">{model.summary}</div>
      <div className="mt-2 flex gap-2">
        <Badge>{model.confidence === null ? 'confidence n/a' : `confidence ${Math.round(model.confidence * 100)}%`}</Badge>
        <Badge>{model.verifiability}</Badge>
      </div>
    </section>
  );
}

export function EvidenceArtifactList({
  model,
  onSelectArtifactDispatch
}: {
  model: EvidencePacketViewModel;
  onSelectArtifactDispatch: (artifact: EvidenceArtifact) => void;
}) {
  const height = 220;
  const rowHeight = 54;
  const artifacts = model.artifacts.slice(0, Math.ceil(height / rowHeight) + 4);
  const privacyClass = normalizeEvidencePrivacyClass(model.privacyClass);

  return (
    <section className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
      <div className="mb-2 text-xs font-semibold">Artifacts</div>
      {privacyClass === 'private' && (
        <div className="mb-2 text-xs text-red-300" data-test="evidence-private-redacted-banner">
          private evidence redacted
        </div>
      )}
      <div data-test="evidence-artifact-virtual-list" style={{ height, overflowY: 'auto' }}>
        <div style={{ height: Math.max(height, model.artifacts.length * rowHeight), position: 'relative' }}>
          {artifacts.map((artifact, index) => (
            <button
              key={artifact.id}
              type="button"
              data-test={`evidence-artifact-row-${artifact.id}`}
              data-open-dispatch-node-id={artifact.dispatchNodeId ?? ''}
              className="absolute left-0 right-0 px-2 py-1 text-left rounded border border-[var(--border-subtle)] bg-black/10 hover:bg-white/10"
              style={{ top: index * rowHeight, height: rowHeight - 6 }}
              onClick={() => onSelectArtifactDispatch(artifact)}
            >
              <div className="grid grid-cols-[78px_minmax(0,1fr)_80px_64px] gap-2 items-center">
                <Badge>{artifact.type}</Badge>
                <span className="text-xs truncate" title={safeArtifactLabel(artifact.value, privacyClass)}>
                  {safeArtifactLabel(artifact.value, privacyClass)}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] truncate">{formatTs(artifact.timestampMs)}</span>
                <span className="text-[10px] text-[var(--text-tertiary)] truncate">{formatSize(artifact.sizeBytes)}</span>
              </div>
              {artifact.expanded && privacyClass === 'public' && (
                <pre className="mt-1 text-[10px] whitespace-pre-wrap">{formatPublicArtifact(artifact.value)}</pre>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EvidenceCrossReferences({
  model,
  onOpenDispatchTrace,
  onOpenSource
}: {
  model: EvidencePacketViewModel;
  onOpenDispatchTrace: () => void;
  onOpenSource: () => void;
}) {
  return (
    <section className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
      <div className="mb-2 text-xs font-semibold">Cross References</div>
      <div className="flex flex-wrap gap-2">
        <button type="button" data-test="evidence-open-dispatch-trace" onClick={onOpenDispatchTrace}>
          Dispatch Trace: {model.dispatchNodeId ?? 'n/a'}
        </button>
        {model.toolEventIds.map((eventId) => (
          <Badge key={eventId}>tool {eventId}</Badge>
        ))}
        <button type="button" data-test="evidence-open-source" onClick={onOpenSource}>
          Source
        </button>
      </div>
      <div className="mt-2 space-y-1">
        {model.sourcePaths.map((path) => (
          <div key={path} className="text-[10px] font-mono text-[var(--text-tertiary)] truncate" title={path}>
            {path}
          </div>
        ))}
      </div>
    </section>
  );
}

export function EvidenceVerificationStatus({ state }: { state: EvidenceVerificationState }) {
  const label = state === 'verified' ? 'green checkmark verified' : state === 'pending' ? 'yellow clock pending' : 'red x failed';
  return (
    <section
      className="p-3 rounded border border-[var(--border-subtle)] bg-white/5"
      data-test="evidence-verification-status"
      data-verification-state={state}
    >
      <span>{label}</span>
    </section>
  );
}

export function evidencePacketsFromSnapshot(
  snapshot: DispatchGenealogySnapshot,
  packets?: readonly MediatedRunEvidencePacket[]
): readonly EvidencePacketViewModel[] {
  const nodes = flattenNodes(snapshot.nodes);
  const events = flattenDispatchGenealogyEvents(snapshot);
  const packetInputs = packets && packets.length > 0
    ? packets
    : nodes
        .filter((node) => node.evidenceRef)
        .map((node) => packetFromNode(node, snapshot.sessionKey));

  return Object.freeze(packetInputs.map((packet, index) => {
    const packetId = packetIdOf(packet, index);
    const node = nodeForPacket(nodes, packet, packetId) ?? nodes[index] ?? null;
    const dispatchNodeId = stringFromUnknown(field(packet, 'dispatchNodeId')) ?? node?.id ?? null;
    const packetEvents = events.filter((event) =>
      event.evidencePacketRef === packetId ||
      event.evidenceRef?.id === packetId ||
      event.dispatchNodeId === dispatchNodeId ||
      event.nodeId === dispatchNodeId
    );
    const privacyClass =
      stringFromUnknown(field(packet, 'privacyClass')) ??
      stringFromUnknown(field(packet, 'privacy')) ??
      packetEvents.map((event) => event.privacyClass).find(Boolean) ??
      'public';

    return Object.freeze({
      packet,
      packetId,
      runId: packet.runId,
      actor: stringFromUnknown(field(packet, 'actor')) ?? packet.mediator,
      title: stringFromUnknown(field(packet, 'title')) ?? node?.evidenceRef?.label ?? packet.taskId,
      summary: summaryForPacket(packet),
      confidence: numberFromUnknown(field(packet, 'confidenceScore') ?? field(packet, 'confidence')),
      verifiability: packet.verdict === 'PASS' ? 'verifiable' : packet.verdict === 'REVIEW' ? 'needs review' : 'not verified',
      privacyClass,
      startedAtMs: numberFromUnknown(field(packet, 'startedAtMs')) ?? node?.startedAtMs ?? packet.timestamp,
      endedAtMs: numberFromUnknown(field(packet, 'endedAtMs')) ?? node?.endedAtMs ?? packet.timestamp,
      verificationState: verificationStateForPacket(packet),
      artifacts: artifactsForPacket(packet, node?.evidenceRef ?? null, packetEvents, dispatchNodeId),
      dispatchNodeId,
      toolEventIds: Object.freeze(packetEvents.map((event) => event.id)),
      sourcePaths: Object.freeze(sourcePathsForPacket(packet, node, packetEvents))
    } satisfies EvidencePacketViewModel);
  }));
}

export function resolveEvidenceDispatchSelection(
  snapshot: DispatchGenealogySnapshot,
  dispatchNodeId: string | null | undefined
): DispatchGenealogySelection | null {
  if (!dispatchNodeId) {
    return null;
  }
  return selectDispatchGenealogyNode(snapshot, dispatchNodeId);
}

function packetFromNode(
  node: DispatchGenealogyNode,
  sessionKey: string | null
): MediatedRunEvidencePacket {
  const evidenceRef = node.evidenceRef as DispatchGenealogyEvidenceRef;
  return Object.freeze({
    runId: node.invocationId ?? node.provenance.sessionKey ?? sessionKey ?? node.id,
    taskId: evidenceRef.id,
    mediator: mediatorFromAgent(node.agentId),
    verdict: node.status === 'failed' || node.status === 'error' ? 'FAIL' : node.status === 'completed' ? 'PASS' : 'REVIEW',
    evidence: Object.freeze([
      evidenceRef.artifactUri,
      evidenceRef.sourceAnchor
    ].filter(Boolean) as string[]),
    acceptanceCriteria: Object.freeze(['dispatch evidence resolved']),
    passedCriteria: Object.freeze(node.status === 'completed' ? ['dispatch evidence resolved'] : []),
    timestamp: node.endedAtMs ?? node.startedAtMs ?? Date.now(),
    provenance: node.provenance.sessionKey ?? sessionKey ?? 'dispatch-genealogy'
  });
}

function artifactsForPacket(
  packet: MediatedRunEvidencePacket,
  evidenceRef: DispatchGenealogyEvidenceRef | null,
  events: readonly DispatchGenealogyEvent[],
  dispatchNodeId: string | null
): readonly EvidenceArtifact[] {
  const explicitArtifacts = arrayFromUnknown(field(packet, 'artifacts'));
  const artifactValues = explicitArtifacts.length > 0
    ? explicitArtifacts
    : [
        ...packet.evidence,
        ...events.map((event) => event.payload ?? event.result ?? event.args),
        evidenceRef?.artifactUri
      ].filter((value) => value !== undefined && value !== null);

  return Object.freeze(artifactValues.map((value, index) => {
    const record = recordFromUnknown(value);
    const rawType = stringFromUnknown(record?.type) ?? stringFromUnknown(record?.kind);
    return Object.freeze({
      id: stringFromUnknown(record?.id) ?? `${packetIdOf(packet, 0)}:artifact:${index}`,
      type: normalizeArtifactType(rawType ?? String(value)),
      label: stringFromUnknown(record?.label) ?? stringFromUnknown(record?.title) ?? `artifact ${index + 1}`,
      timestampMs: numberFromUnknown(record?.timestampMs ?? record?.timestamp ?? record?.emittedAtMs) ?? packet.timestamp,
      sizeBytes: numberFromUnknown(record?.sizeBytes ?? record?.size) ?? sizeOf(value),
      value,
      dispatchNodeId: stringFromUnknown(record?.dispatchNodeId) ?? dispatchNodeId,
      expanded: Boolean(record?.expanded)
    } satisfies EvidenceArtifact);
  }));
}

function sourcePathsForPacket(
  packet: MediatedRunEvidencePacket,
  node: DispatchGenealogyNode | null,
  events: readonly DispatchGenealogyEvent[]
): readonly string[] {
  const values = [
    field(packet, 'sourceAnchor'),
    field(packet, 'artifactUri'),
    field(packet, 'codeAnchor'),
    field(packet, 'testAnchor'),
    node?.sourceRef?.sourceAnchor,
    node?.evidenceRef?.sourceAnchor,
    ...events.map((event) => event.sourceRef?.sourceAnchor)
  ];
  return Object.freeze(
    [...new Set(values.map(stringFromUnknown).filter(Boolean) as string[])]
  );
}

function nodeForPacket(
  nodes: readonly DispatchGenealogyNode[],
  packet: MediatedRunEvidencePacket,
  packetId: string
): DispatchGenealogyNode | null {
  const dispatchNodeId = stringFromUnknown(field(packet, 'dispatchNodeId'));
  if (dispatchNodeId) {
    return nodes.find((node) => node.id === dispatchNodeId) ?? null;
  }
  return nodes.find((node) =>
    node.evidenceRef?.id === packetId ||
    node.evidenceRef?.id === packet.taskId ||
    node.invocationId === packet.runId
  ) ?? null;
}

function flattenNodes(nodes: readonly DispatchGenealogyNode[]): readonly DispatchGenealogyNode[] {
  const out: DispatchGenealogyNode[] = [];
  const visit = (node: DispatchGenealogyNode) => {
    out.push(node);
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return Object.freeze(out);
}

function summaryForPacket(packet: MediatedRunEvidencePacket): string {
  const explicit = stringFromUnknown(field(packet, 'summary'));
  if (explicit) {
    return explicit;
  }
  return `${packet.mediator} recorded ${packet.verdict.toLowerCase()} evidence for ${packet.taskId}.`;
}

function verificationStateForPacket(packet: MediatedRunEvidencePacket): EvidenceVerificationState {
  if (packet.verdict === 'PASS') {
    return 'verified';
  }
  if (packet.verdict === 'FAIL' || packet.verdict === 'BLOCKED') {
    return 'failed';
  }
  return 'pending';
}

function mediatorFromAgent(agentId: string): MediatedRunEvidencePacket['mediator'] {
  if (agentId === 'claude') {
    return 'claude';
  }
  if (agentId === 'hermes') {
    return 'hermes';
  }
  if (agentId === 'fable-5') {
    return 'fable-5';
  }
  return 'codex';
}

function normalizeArtifactType(value: string): EvidenceArtifactType {
  const lowered = value.toLowerCase();
  if (lowered.includes('diff') || lowered.endsWith('.patch')) {
    return 'diff';
  }
  if (lowered.includes('snapshot') || lowered.endsWith('.png') || lowered.endsWith('.json')) {
    return 'snapshot';
  }
  if (lowered.includes('test') || lowered.includes('tap') || lowered.includes('junit')) {
    return 'test-output';
  }
  if (lowered.includes('metric') || lowered.includes('latency')) {
    return 'metric';
  }
  return 'log';
}

function safeArtifactLabel(value: unknown, privacyClass: string): string {
  if (privacyClass === 'private') {
    return 'private - not displayed';
  }
  if (privacyClass === 'protected' || privacyClass === 'protected-local') {
    const record = recordFromUnknown(value);
    return [
      stringFromUnknown(record?.handle) ?? stringFromUnknown(value) ?? 'protected handle',
      stringFromUnknown(record?.namespace),
      stringFromUnknown(record?.summary)
    ].filter(Boolean).join(' · ');
  }
  return stringFromUnknown(value) ?? formatPublicArtifact(value);
}

function formatPublicArtifact(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatSize(value: number | null): string {
  if (value === null) {
    return 'n/a';
  }
  if (value < 1024) {
    return `${value}b`;
  }
  return `${Math.round(value / 1024)}kb`;
}

function sizeOf(value: unknown): number | null {
  const rendered = typeof value === 'string' ? value : formatPublicArtifact(value);
  return rendered.length;
}

function normalizeEvidencePrivacyClass(value: unknown): string {
  const raw = typeof value === 'string' && value.trim().length > 0 ? value.trim().toLowerCase() : 'public';
  return raw === 'protected-local' ? 'protected-local' : raw;
}

function packetIdOf(packet: MediatedRunEvidencePacket, index: number): string {
  return stringFromUnknown(field(packet, 'id')) ?? stringFromUnknown(field(packet, 'packetId')) ?? `${packet.taskId}:${packet.runId}:${index}`;
}

function arrayFromUnknown(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function recordFromUnknown(value: unknown): Record<string, unknown> | null {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function field(value: unknown, key: string): unknown {
  return recordFromUnknown(value)?.[key];
}

function stringFromUnknown(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return null;
}

function numberFromUnknown(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function EvidenceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] uppercase text-[var(--text-tertiary)]">{label}</dt>
      <dd className="text-[10px] font-mono truncate" title={value}>{value}</dd>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] truncate">
      {children}
    </span>
  );
}
