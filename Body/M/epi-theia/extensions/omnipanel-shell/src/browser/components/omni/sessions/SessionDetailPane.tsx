import type { SessionManagerRow } from './sessionManagerModel';
import { PrivacyClassBadge } from './SessionList';

type SessionDetailPaneProps = {
  session: SessionManagerRow | null;
  formatTime: (ts: number | null | undefined) => string;
};

export function SessionDetailPane({ session, formatTime }: SessionDetailPaneProps) {
  if (!session) {
    return <div className="rounded border border-[var(--border-subtle)] bg-white/5 p-4 text-xs text-[var(--text-tertiary)]">Select a session to inspect its metadata.</div>;
  }

  return (
    <div className="rounded border border-[var(--border-subtle)] bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text-primary)]">{session.displayName || session.label || session.key}</div>
          <div className="mt-1 break-all font-mono text-[10px] text-[var(--text-tertiary)]">{session.nowWikilink}</div>
        </div>
        <PrivacyClassBadge privacyClass={session.privacyClass} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <KairosAtOpenStrip kairosAtOpen={session.kairosAtOpen} openedAt={session.openedAt} formatTime={formatTime} />
        <TarotPsycheAnchorStrip anchor={session.tarotPsycheAnchor} />
        <ActiveCoordinateDisplay coordinate={session.activeCoordinate} />
        <DispatchSummary dispatchCount={session.dispatchCount} />
        <EvidenceSummary evidenceCount={session.evidenceCount} />
        <ReviewSummary reviewCount={session.reviewCount} />
      </div>
    </div>
  );
}

export function KairosAtOpenStrip({
  kairosAtOpen,
  openedAt,
  formatTime,
}: {
  kairosAtOpen: Record<string, unknown> | null;
  openedAt: number | null;
  formatTime: (ts: number | null | undefined) => string;
}) {
  return <MetadataStrip title="kairos_at_open" value={kairosAtOpen ? entries(kairosAtOpen) : formatTime(openedAt)} />;
}

export function TarotPsycheAnchorStrip({ anchor }: { anchor: Record<string, unknown> | string | null }) {
  return <MetadataStrip title="tarot psyche anchor" value={typeof anchor === 'string' ? anchor : anchor ? entries(anchor) : 'readiness pending'} />;
}

export function ActiveCoordinateDisplay({ coordinate }: { coordinate: string | null }) {
  return <MetadataStrip title="active coordinate" value={coordinate ?? 'pending'} />;
}

export function DispatchSummary({ dispatchCount }: { dispatchCount: number | null }) {
  return <MetadataStrip title="dispatch summary" value={`${dispatchCount ?? 0} dispatches`} />;
}

export function EvidenceSummary({ evidenceCount }: { evidenceCount: number | null }) {
  return <MetadataStrip title="evidence summary" value={`${evidenceCount ?? 0} handles`} />;
}

export function ReviewSummary({ reviewCount }: { reviewCount: number | null }) {
  return <MetadataStrip title="review summary" value={`${reviewCount ?? 0} reviews`} />;
}

function MetadataStrip({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded border border-[var(--border-subtle)] bg-white/5 p-3">
      <div className="text-[10px] uppercase text-[var(--text-tertiary)]">{title}</div>
      <div className="mt-1 break-words text-xs text-[var(--text-secondary)]">{value}</div>
    </div>
  );
}

function entries(record: Record<string, unknown>): string {
  const pairs = Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (pairs.length === 0) {
    return 'pending';
  }
  return pairs.map(([key, value]) => `${key}: ${String(value)}`).join(' | ');
}
