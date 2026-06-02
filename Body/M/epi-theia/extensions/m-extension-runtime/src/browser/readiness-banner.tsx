import * as React from 'react';
import {
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    readinessSeverity
} from '../common/readiness';

/**
 * Shared visual shell — readiness banner, evidence handles, provenance badges,
 * and "open in M5 review" affordance. Every M-extension renders this at the
 * top of its first-slice view so the user sees the same blocked/degraded/ok
 * surface across all six.
 */
export interface ReadinessBannerProps {
    readonly extensionId: string;
    readonly extensionLabel: string;
    readonly snapshot: MExtensionReadinessSnapshot;
    readonly declaredBlockers: readonly string[];
    readonly evidenceHandles?: readonly string[];
    readonly provenance?: string;
    readonly onOpenInM5Review?: () => void;
}

export const ReadinessBanner: React.FC<ReadinessBannerProps> = ({
    extensionId,
    extensionLabel,
    snapshot,
    declaredBlockers,
    evidenceHandles = [],
    provenance,
    onOpenInM5Review
}) => {
    const view = snapshot ?? PENDING_M_READINESS;
    const severity = readinessSeverity(view.state);
    return (
        <section className={`mext-banner mext-banner-${severity}`} data-extension={extensionId}>
            <header className="mext-banner-header">
                <h2 className="mext-banner-title">{extensionLabel}</h2>
                <span className={`mext-banner-state mext-banner-state-${view.state}`}>
                    {view.state}
                </span>
            </header>
            <dl className="mext-banner-grid">
                <dt>Reason</dt>
                <dd>{view.reason}</dd>
                <dt>Bridge reachable</dt>
                <dd>{view.bridgeReachable ? 'yes' : 'no'}</dd>
                <dt>Profile generation</dt>
                <dd>{view.profileGeneration ?? '—'}</dd>
                <dt>Last fetched</dt>
                <dd>{view.fetchedAt === 0 ? 'never' : new Date(view.fetchedAt).toISOString()}</dd>
                {provenance ? (
                    <>
                        <dt>Provenance</dt>
                        <dd className="mext-banner-provenance">{provenance}</dd>
                    </>
                ) : null}
            </dl>
            {declaredBlockers.length > 0 && (
                <details className="mext-banner-blockers">
                    <summary>Declared blockers ({declaredBlockers.length})</summary>
                    <ul>
                        {declaredBlockers.map(id => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                </details>
            )}
            {view.blockerIds.length > 0 && (
                <details className="mext-banner-runtime-blockers">
                    <summary>Runtime-carried blockers ({view.blockerIds.length})</summary>
                    <ul>
                        {view.blockerIds.map(id => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                </details>
            )}
            {evidenceHandles.length > 0 && (
                <details className="mext-banner-evidence">
                    <summary>Evidence handles ({evidenceHandles.length})</summary>
                    <ul>
                        {evidenceHandles.map(h => (
                            <li key={h}>{h}</li>
                        ))}
                    </ul>
                </details>
            )}
            {onOpenInM5Review ? (
                <button
                    type="button"
                    className="theia-button mext-banner-m5-review"
                    onClick={() => onOpenInM5Review()}
                >
                    Open in M5 review
                </button>
            ) : null}
        </section>
    );
};
