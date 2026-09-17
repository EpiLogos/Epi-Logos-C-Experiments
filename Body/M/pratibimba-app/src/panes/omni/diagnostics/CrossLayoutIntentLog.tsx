/**
 * Coordinate: M' `/` membrane (cross-layout intent log view — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's intent-log surface (27.8; 11.2).
 * Actualises: the spec's <CrossLayoutIntentLog /> — renders the rolling buffer
 *   of the last 32 CrossLayoutIntent dispatches from the crossLayoutIntentLog
 *   store (newest first), each row showing the dispatch time, the routed
 *   target, and the settle outcome, with a per-entry expandable envelope
 *   detail. When the buffer is empty it states so honestly — it never
 *   back-fills synthetic intents.
 * Public surface: CrossLayoutIntentLog.
 * Does NOT own: the buffer law (state/crossLayoutIntentLog), the intent
 *   envelope contract (commands/crossLayoutIntent), the dispatch seam.
 */

import { useMemo } from 'react';
import { useCrossLayoutIntentLogStore } from '../../../state/crossLayoutIntentLog';
import type { CrossLayoutIntentLogEntry } from '../../../state/crossLayoutIntentLog';

function formatAt(at: number): string {
    return Number.isFinite(at) ? new Date(at).toISOString() : String(at);
}

function targetLabel(entry: CrossLayoutIntentLogEntry): string {
    const { requestedExtensionId, requestedContributionId } = entry.intent;
    return `${requestedExtensionId}/${requestedContributionId}`;
}

export function CrossLayoutIntentLog() {
    const entries = useCrossLayoutIntentLogStore(s => s.entries);
    // Newest first for reading; the store holds insertion order (oldest → newest).
    const ordered = useMemo(() => [...entries].reverse(), [entries]);

    return (
        <section className="cross-layout-intent-log" data-testid="cross-layout-intent-log">
            <header className="cross-layout-intent-log-header">
                <h4 className="diagnostics-section-title">Cross-layout intent log</h4>
                <span className="cross-layout-intent-count" data-testid="intent-log-count">
                    {entries.length} of 32
                </span>
            </header>
            {ordered.length === 0 ? (
                <p className="diagnostics-empty" data-testid="intent-log-empty">
                    no cross-layout intents dispatched yet
                </p>
            ) : (
                <ol className="cross-layout-intent-entries" role="list">
                    {ordered.map((entry, index) => (
                        <li key={`${entry.at}-${index}`} className="cross-layout-intent-item">
                            <details className="intent-log-entry" data-testid="intent-log-entry">
                                <summary className="intent-log-summary">
                                    <span className="intent-log-at" data-testid="intent-log-at">
                                        {formatAt(entry.at)}
                                    </span>
                                    <span className="intent-log-target" data-testid="intent-log-target">
                                        → {targetLabel(entry)}
                                    </span>
                                    <span
                                        className={`intent-log-outcome intent-log-outcome-${entry.outcome ?? 'pending'}`}
                                        data-testid="intent-log-outcome"
                                    >
                                        {entry.outcome ?? 'pending'}
                                    </span>
                                </summary>
                                <dl className="intent-log-detail" data-testid="intent-log-detail">
                                    <dt>coordinate</dt>
                                    <dd>{entry.intent.coordinate ?? '—'}</dd>
                                    <dt>artifactUri</dt>
                                    <dd>{entry.intent.artifactUri ?? '—'}</dd>
                                    <dt>reviewId</dt>
                                    <dd>{entry.intent.reviewId ?? '—'}</dd>
                                    <dt>dayNow</dt>
                                    <dd>{entry.intent.dayNow ?? '—'}</dd>
                                    <dt>sessionKey</dt>
                                    <dd>{entry.intent.sessionKey ?? '—'}</dd>
                                    <dt>profileGeneration</dt>
                                    <dd>
                                        {entry.intent.profileGeneration === null
                                            ? '—'
                                            : entry.intent.profileGeneration}
                                    </dd>
                                    <dt>privacyClass</dt>
                                    <dd>{entry.intent.privacyClass ?? '—'}</dd>
                                    <dt>requestedExtensionId</dt>
                                    <dd>{entry.intent.requestedExtensionId}</dd>
                                    <dt>requestedContributionId</dt>
                                    <dd>{entry.intent.requestedContributionId}</dd>
                                </dl>
                            </details>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
