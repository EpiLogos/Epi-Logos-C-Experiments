import { useMemo, useState, type ReactNode } from 'react';
import {
  type IOD17Parity,
  type ReviewDecision,
  type ReviewHistoryEntry,
  type ReviewInboxFilter,
  type ReviewItem,
  type ReviewItemDeep,
  type ReviewSessionTabState
} from '../../../../common/omnipanel-runtime';
import {
  IOD17ParityReadout,
  IOD17ParityStatusBadge
} from '../review/IOD17ParityReadout';
import { ReviewActionControls } from '../review/ReviewActionControls';
import { ReviewHistoryList } from '../review/ReviewHistoryList';

// Track 27 T27.6 — the human-required gate landing surface.
//
// The Review tab is the OmniPanel projection of the S5 `s5'.review.*`
// mediation surface. It is a *landing surface*, NOT an overlay: outstanding
// review items are inboxed inline and selected into a right-pane detail view
// with the IOD-17 parity readout, the embedded evidence packet (Tranche 27.5),
// the dispatch genealogy (Tranche 27.3), the action controls, and the
// transition history. There are no overlay/popup affordances anywhere on this
// surface — the gate is resolved in place.
//
// Cross-layout sync: the inbox rows are structurally compatible with the
// ide-shell-m0-m5 `ReviewPaneWidget.ReviewItem`, so an item highlighted in one
// layout addresses the same item here.

export type ReviewPanelProps = {
  items: readonly ReviewItem[];
  selectedItem: ReviewItemDeep | null;
  history: readonly ReviewHistoryEntry[];
  /** Whether the acting principal is a human (M5 review surface) or an agent. */
  actorIsHuman: boolean;
  loading?: boolean;
  error?: string | null;
  initialState?: Partial<ReviewSessionTabState>;
  /** Deterministic clock for age rendering (defaults to wall-clock). */
  nowMs?: number;
  onSelectItem: (reviewId: string) => void;
  onDecision: (reviewId: string, decision: ReviewDecision, reason: string) => void;
  onAnnotate: (reviewId: string, text: string) => void;
  onStateChange?: (state: ReviewSessionTabState) => void;
  onOpenDispatchTrace?: (dispatchNodeId: string) => void;
  onOpenEvidence?: (evidencePacketRef: string) => void;
};

const DEFAULT_REVIEW_TAB_STATE: ReviewSessionTabState = Object.freeze({
  selectedReviewId: null,
  filters: Object.freeze({}),
  scrollOffset: 0,
  reviseFormOpen: false
});

export function ReviewPanel({
  items,
  selectedItem,
  history,
  actorIsHuman,
  loading = false,
  error = null,
  initialState,
  nowMs,
  onSelectItem,
  onDecision,
  onAnnotate,
  onStateChange,
  onOpenDispatchTrace,
  onOpenEvidence
}: ReviewPanelProps) {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(
    initialState?.selectedReviewId ?? null
  );
  const [scrollOffset, setScrollOffset] = useState(initialState?.scrollOffset ?? 0);
  const [reviseFormOpen, setReviseFormOpen] = useState(initialState?.reviseFormOpen ?? false);
  const [annotateDraft, setAnnotateDraft] = useState(initialState?.annotateDraft ?? '');
  const [filters, setFilters] = useState<ReviewInboxFilter>(initialState?.filters ?? {});

  const filtered = useMemo(() => applyReviewFilters(items, filters), [items, filters]);
  const outstanding = useMemo(() => filtered.filter(isOutstanding), [filtered]);
  const overallParity = useMemo(() => aggregateParity(items), [items]);

  const activeReviewId = selectedItem?.id ?? selectedReviewId;

  const persist = (patch: Partial<ReviewSessionTabState>) => {
    onStateChange?.({
      ...DEFAULT_REVIEW_TAB_STATE,
      selectedReviewId,
      filters,
      scrollOffset,
      reviseFormOpen,
      ...(annotateDraft ? { annotateDraft } : {}),
      ...patch
    });
  };

  const selectItem = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setReviseFormOpen(false);
    setAnnotateDraft('');
    persist({ selectedReviewId: reviewId, reviseFormOpen: false, annotateDraft: '' });
    onSelectItem(reviewId);
  };

  const changeFilters = (next: ReviewInboxFilter) => {
    setFilters(next);
    persist({ filters: next });
  };

  return (
    <div className="p-6 space-y-4" data-test="review-panel">
      <ReviewHeader
        filters={filters}
        outstandingCount={outstanding.length}
        totalCount={filtered.length}
        overallParity={overallParity}
        onChangeFilters={changeFilters}
      />

      {error && (
        <div className="text-xs text-red-300" data-test="review-panel-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-4">
        <ReviewInbox
          items={filtered}
          selectedReviewId={activeReviewId}
          scrollOffset={scrollOffset}
          loading={loading}
          nowMs={nowMs ?? wallClock()}
          onScrollOffsetChange={(nextOffset) => {
            setScrollOffset(nextOffset);
            persist({ scrollOffset: nextOffset });
          }}
          onSelectItem={selectItem}
        />

        {selectedItem ? (
          <ReviewItemView
            item={selectedItem}
            history={history}
            actorIsHuman={actorIsHuman}
            reviseFormOpen={reviseFormOpen}
            annotateDraft={annotateDraft}
            onDecision={(decision, reason) => onDecision(selectedItem.id, decision, reason)}
            onToggleReviseForm={(open) => {
              setReviseFormOpen(open);
              persist({ reviseFormOpen: open });
            }}
            onAnnotateDraftChange={(text) => {
              setAnnotateDraft(text);
              persist({ annotateDraft: text });
            }}
            onAnnotate={() => {
              if (annotateDraft.trim()) {
                onAnnotate(selectedItem.id, annotateDraft.trim());
              }
            }}
            onOpenDispatchTrace={onOpenDispatchTrace}
            onOpenEvidence={onOpenEvidence}
          />
        ) : (
          <div
            className="text-xs italic text-[var(--text-tertiary)] p-3"
            data-test="review-item-view-empty"
          >
            Select a pending review item to resolve its human-required gate.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function ReviewHeader({
  filters,
  outstandingCount,
  totalCount,
  overallParity,
  onChangeFilters
}: {
  filters: ReviewInboxFilter;
  outstandingCount: number;
  totalCount: number;
  overallParity: IOD17Parity;
  onChangeFilters: (next: ReviewInboxFilter) => void;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3" data-test="review-header">
      <div>
        <h3 className="text-lg font-bold">Review</h3>
        <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
          s5&apos;.review.inbox · human-required gate landing surface
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)]">session</span>
          <input
            type="text"
            data-test="review-filter-session"
            className="text-xs px-2 py-1 rounded border border-[var(--border-subtle)] bg-black/20"
            value={filters.sessionKey ?? ''}
            placeholder="all sessions"
            onChange={(event) =>
              onChangeFilters({ ...filters, sessionKey: event.currentTarget.value || null })
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)]">mediator</span>
          <input
            type="text"
            data-test="review-filter-mediator"
            className="text-xs px-2 py-1 rounded border border-[var(--border-subtle)] bg-black/20"
            value={filters.mediator ?? ''}
            placeholder="all mediators"
            onChange={(event) =>
              onChangeFilters({ ...filters, mediator: event.currentTarget.value || null })
            }
          />
        </label>

        <label className="flex items-center gap-1 text-[11px]">
          <input
            type="checkbox"
            data-test="review-filter-outstanding"
            checked={filters.outstandingOnly === true}
            onChange={(event) =>
              onChangeFilters({ ...filters, outstandingOnly: event.currentTarget.checked })
            }
          />
          outstanding only
        </label>

        <span
          className="text-[10px] px-2 py-0.5 rounded-full border border-amber-400/50 text-amber-100"
          data-test="review-outstanding-count"
          data-outstanding={outstandingCount}
        >
          {outstandingCount} outstanding / {totalCount}
        </span>

        <IOD17ParityStatusBadge parity={overallParity} />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Inbox (virtualized)
// ---------------------------------------------------------------------------

function ReviewInbox({
  items,
  selectedReviewId,
  scrollOffset,
  loading,
  nowMs,
  onScrollOffsetChange,
  onSelectItem
}: {
  items: readonly ReviewItem[];
  selectedReviewId: string | null;
  scrollOffset: number;
  loading: boolean;
  nowMs: number;
  onScrollOffsetChange: (scrollOffset: number) => void;
  onSelectItem: (reviewId: string) => void;
}) {
  const rowHeight = 96;
  const height = 460;
  const startIndex = Math.max(0, Math.floor(scrollOffset / rowHeight) - 3);
  const visible = items.slice(startIndex, startIndex + Math.ceil(height / rowHeight) + 6);

  if (loading && items.length === 0) {
    return (
      <div className="text-xs italic text-[var(--text-tertiary)]" data-test="review-inbox-loading">
        Loading review inbox…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-xs italic text-[var(--text-tertiary)]" data-test="review-inbox-empty">
        No review items match the current filters.
      </div>
    );
  }

  return (
    <div
      data-test="review-inbox"
      data-virtualized="true"
      style={{ height, overflowY: 'auto' }}
      onScroll={(event) => onScrollOffsetChange(event.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * rowHeight, position: 'relative' }}>
        {visible.map((item, offset) => {
          const index = startIndex + offset;
          const selected = item.id === selectedReviewId;
          return (
            <button
              key={item.id}
              type="button"
              data-test={`review-inbox-row-${item.id}`}
              data-selected={selected ? 'true' : 'false'}
              data-human-required={item.humanRequired ? 'true' : 'false'}
              data-in-parity={item.iod17Parity?.inParity === false ? 'false' : 'true'}
              className={`absolute left-0 right-0 p-2 text-left rounded border ${
                selected
                  ? 'border-[var(--color-m5)]/70 bg-[var(--color-m5)]/15'
                  : 'border-[var(--border-subtle)] bg-white/5 hover:bg-white/10'
              }`}
              style={{ top: index * rowHeight, height: rowHeight - 8 }}
              onClick={() => onSelectItem(item.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold truncate">{item.title}</span>
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] shrink-0">
                  {formatAge(item.depositedAtMs ?? null, nowMs)}
                </span>
              </div>
              <div className="text-[9px] font-mono text-[var(--text-tertiary)] truncate">{item.id}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge
                  tone="dispatch"
                  test={`review-row-dispatch-${item.id}`}
                >
                  ⇄ {item.originatingDispatchNodeId ?? 'no-node'}
                </Badge>
                {item.evidencePacketRef && (
                  <Badge tone="evidence" test={`review-row-evidence-${item.id}`}>
                    ▤ {item.evidencePacketRef}
                  </Badge>
                )}
                {(item.reviewerRequired || item.humanRequired) && (
                  <Badge tone="human" test={`review-row-reviewer-required-${item.id}`}>
                    reviewer-required
                  </Badge>
                )}
                <Badge
                  tone={item.iod17Parity?.inParity === false ? 'drift' : 'parity'}
                  test={`review-row-parity-${item.id}`}
                >
                  IOD-17 {item.iod17Parity?.inParity === false ? 'drift' : 'parity'}
                </Badge>
                <Badge tone="privacy" test={`review-row-privacy-${item.id}`}>
                  {item.privacyClass ?? 'public'}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right pane: ReviewItemView
// ---------------------------------------------------------------------------

function ReviewItemView({
  item,
  history,
  actorIsHuman,
  reviseFormOpen,
  annotateDraft,
  onDecision,
  onToggleReviseForm,
  onAnnotateDraftChange,
  onAnnotate,
  onOpenDispatchTrace,
  onOpenEvidence
}: {
  item: ReviewItemDeep;
  history: readonly ReviewHistoryEntry[];
  actorIsHuman: boolean;
  reviseFormOpen: boolean;
  annotateDraft: string;
  onDecision: (decision: ReviewDecision, reason: string) => void;
  onToggleReviseForm: (open: boolean) => void;
  onAnnotateDraftChange: (text: string) => void;
  onAnnotate: () => void;
  onOpenDispatchTrace?: (dispatchNodeId: string) => void;
  onOpenEvidence?: (evidencePacketRef: string) => void;
}) {
  const itemHistory = history.filter((entry) => entry.reviewId === item.id);
  return (
    <article className="min-w-0 space-y-4" data-test="review-item-view" data-review-id={item.id}>
      <ReviewItemHeader item={item} />
      <IOD17ParityReadout parity={item.iod17Parity} />
      <ReviewItemEvidenceEmbed item={item} onOpenEvidence={onOpenEvidence} />
      <DispatchGenealogyEmbed item={item} onOpenDispatchTrace={onOpenDispatchTrace} />
      <ReviewActionControls
        item={item}
        actorIsHuman={actorIsHuman}
        reviseFormOpen={reviseFormOpen}
        annotateDraft={annotateDraft}
        onDecision={(decision, reason) => {
          if (decision === 'annotate') {
            onAnnotate();
            return;
          }
          onDecision(decision, reason);
        }}
        onToggleReviseForm={onToggleReviseForm}
        onAnnotateDraftChange={onAnnotateDraftChange}
      />
      <ReviewHistoryList entries={itemHistory} />
    </article>
  );
}

export function ReviewItemHeader({ item }: { item: ReviewItemDeep }) {
  return (
    <header
      className="p-3 rounded border border-[var(--border-subtle)] bg-white/5"
      data-test="review-item-header"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-bold truncate">{item.title}</h4>
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] truncate">
            {item.id} · status {item.status}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {item.humanRequired && (
            <span
              className="text-[10px] px-2 py-0.5 rounded border border-red-400/50 text-red-200"
              data-test="review-item-human-required"
            >
              human-required
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
            {item.privacyClass}
          </span>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        <Field label="mediator" value={item.mediator ?? item.actor ?? 'n/a'} />
        <Field label="session" value={item.sessionKey ?? 'n/a'} />
        <Field label="day/now" value={item.dayNowContext ?? 'n/a'} />
      </dl>
      {item.summary && <p className="mt-2 text-xs">{item.summary}</p>}
    </header>
  );
}

/** Embedded EvidencePacketView projection (Tranche 27.5). */
export function ReviewItemEvidenceEmbed({
  item,
  onOpenEvidence
}: {
  item: ReviewItemDeep;
  onOpenEvidence?: (evidencePacketRef: string) => void;
}) {
  const evidence = item.evidence ?? null;
  const packetRef = evidence?.packetRef ?? item.evidencePacketRef ?? null;
  return (
    <section
      className="p-3 rounded border border-[var(--border-subtle)] bg-white/5"
      data-test="review-evidence-embed"
      data-evidence-packet-view="true"
      data-packet-ref={packetRef ?? ''}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold">Evidence</div>
        {packetRef && (
          <button
            type="button"
            data-test="review-open-evidence"
            className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] hover:bg-white/10"
            onClick={() => onOpenEvidence?.(packetRef)}
          >
            Open in Evidence tab
          </button>
        )}
      </div>
      {evidence ? (
        <div className="mt-2 space-y-1">
          <div className="flex flex-wrap gap-1">
            <Badge tone="evidence">{packetRef ?? 'no-packet'}</Badge>
            {evidence.verdict && <Badge tone="parity">{evidence.verdict}</Badge>}
            {evidence.verificationState && <Badge tone="dispatch">{evidence.verificationState}</Badge>}
            <Badge tone="privacy">{evidence.privacyClass ?? item.privacyClass}</Badge>
          </div>
          {evidence.summary && <div className="text-[11px]">{evidence.summary}</div>}
          {(evidence.sourcePaths ?? []).map((path) => (
            <div
              key={path}
              className="text-[10px] font-mono text-[var(--text-tertiary)] truncate"
              title={path}
            >
              {path}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-1 text-[11px] italic text-[var(--text-tertiary)]">
          {packetRef ? `Evidence packet ${packetRef} (not yet resolved).` : 'No evidence packet anchored.'}
        </div>
      )}
    </section>
  );
}

/** Embedded DispatchTraceMiniGraph projection (Tranche 27.3). */
export function DispatchGenealogyEmbed({
  item,
  onOpenDispatchTrace
}: {
  item: ReviewItemDeep;
  onOpenDispatchTrace?: (dispatchNodeId: string) => void;
}) {
  const genealogy = item.genealogy ?? null;
  const originating = genealogy?.originatingNodeId ?? item.originatingDispatchNodeId ?? null;
  const chain = genealogy?.chain ?? [];
  return (
    <section
      className="p-3 rounded border border-[var(--border-subtle)] bg-white/5"
      data-test="review-dispatch-genealogy-embed"
      data-dispatch-trace-mini-graph="true"
      data-originating-node-id={originating ?? ''}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold">Dispatch Genealogy</div>
        {originating && (
          <button
            type="button"
            data-test="review-open-dispatch-trace"
            className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] hover:bg-white/10"
            onClick={() => onOpenDispatchTrace?.(originating)}
          >
            Open in Dispatch Trace
          </button>
        )}
      </div>
      {chain.length > 0 ? (
        <ol className="mt-2 flex flex-wrap items-center gap-1">
          {chain.map((node, index) => (
            <li key={node.id} className="flex items-center gap-1" data-test={`review-genealogy-node-${node.id}`}>
              {index > 0 && <span className="text-[10px] text-[var(--text-tertiary)]">→</span>}
              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  node.id === originating
                    ? 'border-[var(--color-m5)]/60 bg-[var(--color-m5)]/15'
                    : 'border-[var(--border-subtle)]'
                }`}
                title={node.status ?? undefined}
              >
                {node.role ? `${node.role} · ` : ''}
                {node.label}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-1 text-[11px] italic text-[var(--text-tertiary)]">
          {originating ? `Originating dispatch node ${originating}.` : 'No dispatch genealogy anchored.'}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type BadgeTone = 'dispatch' | 'evidence' | 'human' | 'parity' | 'drift' | 'privacy';

function Badge({ children, tone = 'privacy', test }: { children: ReactNode; tone?: BadgeTone; test?: string }) {
  const toneClass: Record<BadgeTone, string> = {
    dispatch: 'border-sky-400/40 text-sky-200',
    evidence: 'border-violet-400/40 text-violet-200',
    human: 'border-red-400/50 text-red-200',
    parity: 'border-emerald-400/40 text-emerald-200',
    drift: 'border-red-400/60 text-red-200',
    privacy: 'border-[var(--border-subtle)] text-[var(--text-tertiary)]'
  };
  return (
    <span
      className={`text-[9px] px-2 py-0.5 rounded border truncate ${toneClass[tone]}`}
      data-test={test}
    >
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] uppercase text-[var(--text-tertiary)]">{label}</dt>
      <dd className="text-[10px] font-mono truncate" title={value}>
        {value}
      </dd>
    </div>
  );
}

export function applyReviewFilters(
  items: readonly ReviewItem[],
  filters: ReviewInboxFilter
): readonly ReviewItem[] {
  return items.filter((item) => {
    if (filters.sessionKey && item.sessionKey !== filters.sessionKey) {
      return false;
    }
    if (filters.mediator && (item.mediator ?? item.actor) !== filters.mediator) {
      return false;
    }
    if (filters.status && item.status !== filters.status) {
      return false;
    }
    if (filters.outstandingOnly && !isOutstanding(item)) {
      return false;
    }
    return true;
  });
}

export function isOutstanding(item: ReviewItem): boolean {
  return item.status === 'pending' || item.status === 'in-review' || item.status === 'deferred';
}

export function aggregateParity(items: readonly ReviewItem[]): IOD17Parity {
  const drifted = items.filter((item) => item.iod17Parity?.inParity === false);
  if (drifted.length === 0) {
    return Object.freeze({
      inParity: true,
      capabilityMatrixState: 'in-sync',
      agentContractState: 'in-sync',
      widgetState: 'in-sync'
    });
  }
  return Object.freeze({
    inParity: false,
    capabilityMatrixState: 'drift',
    agentContractState: 'drift',
    widgetState: 'drift',
    drift: Object.freeze(drifted.map((item) => `${item.id}: IOD-17 drift`))
  });
}

function formatAge(depositedAtMs: number | null, nowMs: number): string {
  if (depositedAtMs === null || !Number.isFinite(depositedAtMs)) {
    return '—';
  }
  const deltaMs = Math.max(0, nowMs - depositedAtMs);
  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

function wallClock(): number {
  return typeof Date !== 'undefined' ? Date.now() : 0;
}
