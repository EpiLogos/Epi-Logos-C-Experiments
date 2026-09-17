import * as React from 'react';
import {
    ReadinessSnapshotLike,
    ReadinessSubscriptionSource,
    blockedOverlayActionFor,
    readinessCssVar,
    readinessIdOf,
    readinessIdTokenPath,
    readinessSeverityCssVar,
    readinessSeverityOf,
    readinessTooltip,
    useReadinessSnapshot
} from './readiness-state-grammar';

export interface BlockedOverlayProps {
    readonly reason?: string;
    readonly children?: React.ReactNode;
    readonly className?: string;
    readonly readiness?: ReadinessSnapshotLike;
    readonly bridge?: ReadinessSubscriptionSource | null;
    readonly onAction?: (action: ReturnType<typeof blockedOverlayActionFor>) => void;
}

export const BlockedOverlay: React.FC<BlockedOverlayProps> = ({
    reason,
    children,
    className,
    readiness,
    bridge,
    onAction
}) => {
    const snapshot = useReadinessSnapshot(readiness, bridge);
    const readinessId = readinessIdOf(snapshot);
    const severity = readinessSeverityOf(snapshot);
    const colour = readinessCssVar(readinessId);
    const action = blockedOverlayActionFor(snapshot);
    const displayReason = reason ?? snapshot.reason;

    return (
        <div
            className={className ? `epilogos-blocked-overlay ${className}` : 'epilogos-blocked-overlay'}
            data-provenance-state="blocked"
            data-readiness-id={readinessId}
            data-readiness-severity={severity}
            data-readiness-token={readinessIdTokenPath(readinessId)}
            data-deep-link={action.deepLink}
            role="status"
            aria-label={`Blocked: ${displayReason}`}
            title={readinessTooltip(snapshot, readinessId)}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                display: 'grid',
                gap: '0.75rem',
                alignContent: 'center',
                justifyItems: 'start',
                minHeight: '2.5rem',
                padding: 'var(--epilogos-spacing-composition-surface-margin, 1rem)',
                border: `1px solid ${colour}`,
                background: `color-mix(in srgb, ${readinessSeverityCssVar('blocked')} 22%, transparent)`,
                color: colour
            }}
        >
            {children}
            <strong>{displayReason}</strong>
            <button
                type="button"
                data-command={action.command}
                data-command-argument={action.argument}
                data-deep-link={action.deepLink}
                onClick={() => onAction?.(action)}
                style={{
                    border: `1px solid ${colour}`,
                    color: 'var(--theia-button-foreground)',
                    background: 'var(--theia-button-background)',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '0.25rem'
                }}
            >
                {action.label}
            </button>
        </div>
    );
};

export { blockedOverlayActionFor };
