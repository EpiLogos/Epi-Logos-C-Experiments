import * as React from 'react';
import {
    flavourOf,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    readinessFlavourGrammarOf,
    readinessGrammarOf,
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
    const stateGrammar = readinessGrammarOf(view.state);
    const flavour = flavourOf(view.state, view);
    const flavourGrammar = flavour ? readinessFlavourGrammarOf(flavour) : undefined;
    const bannerClassName = [
        'mext-banner',
        `mext-banner-${severity}`,
        `mext-banner-state-${view.state}`,
        flavour ? `mext-banner-flavour-${flavour}` : undefined
    ].filter(Boolean).join(' ');

    return (
        <section
            className={bannerClassName}
            data-extension={extensionId}
            data-readiness-state={view.state}
            data-readiness-flavour={flavour ?? undefined}
        >
            <header className="mext-banner-header">
                <h2 className="mext-banner-title">{extensionLabel}</h2>
                <span className={`mext-banner-state mext-banner-state-${view.state}`} data-presentation={stateGrammar.uxResponse.presentation}>
                    {stateGrammar.uxResponse.label}
                </span>
                {flavour && flavourGrammar ? (
                    <span
                        className={`mext-banner-flavour-chip mext-banner-flavour-${flavour}`}
                        data-presentation={flavourGrammar.uxResponse.presentation}
                    >
                        {flavourGrammar.uxResponse.label}
                    </span>
                ) : null}
            </header>
            <dl className="mext-banner-grid">
                <dt>UX response</dt>
                <dd>{flavourGrammar?.uxResponse.detail ?? stateGrammar.uxResponse.detail}</dd>
                <dt>Reason</dt>
                <dd>{view.reason}</dd>
                <dt>Bridge reachable</dt>
                <dd>{view.bridgeReachable ? 'yes' : 'no'}</dd>
                <dt>Profile generation</dt>
                <dd>{view.profileGeneration ?? '—'}</dd>
                {view.missingDataset ? (
                    <>
                        <dt>Pending dataset</dt>
                        <dd className="mext-banner-pending-dataset">{view.missingDataset}</dd>
                    </>
                ) : null}
                {view.payloadOwner ? (
                    <>
                        <dt>Payload owner</dt>
                        <dd className="mext-banner-payload-owner">{view.payloadOwner}</dd>
                    </>
                ) : null}
                {view.privacyClass ? (
                    <>
                        <dt>Privacy class</dt>
                        <dd className="mext-banner-privacy-class">{view.privacyClass}</dd>
                    </>
                ) : null}
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
