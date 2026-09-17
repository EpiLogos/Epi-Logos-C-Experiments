import * as React from 'react';
import {
    ReadinessId,
    ReadinessSnapshotLike,
    ReadinessSubscriptionSource,
    readinessCssVar,
    readinessIdOf,
    readinessIdTokenPath,
    readinessLabel,
    readinessSeverityOf,
    readinessTooltip,
    useReadinessSnapshot
} from './readiness-state-grammar';

export interface PendingBadgeProps {
    readonly label?: string;
    readonly className?: string;
    readonly readiness?: ReadinessSnapshotLike;
    readonly bridge?: ReadinessSubscriptionSource | null;
    readonly pendingId?: ReadinessId | string;
}

export const PendingBadge: React.FC<PendingBadgeProps> = ({
    label,
    className,
    readiness,
    bridge,
    pendingId
}) => {
    const snapshot = useReadinessSnapshot(readiness, bridge);
    const readinessId = pendingId ?? readinessIdOf(snapshot);
    const colour = readinessCssVar(readinessId);
    const severity = readinessSeverityOf(snapshot);
    const text = label ?? readinessLabel(snapshot, readinessId);

    return (
        <span
            className={className ? `epilogos-pending-badge ${className}` : 'epilogos-pending-badge'}
            data-provenance-state="pending"
            data-readiness-id={readinessId}
            data-readiness-severity={severity}
            data-readiness-token={readinessIdTokenPath(readinessId)}
            title={readinessTooltip(snapshot, readinessId)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '1.25rem',
                padding: '0 0.45rem',
                border: `1px solid ${colour}`,
                color: colour,
                borderRadius: '0.25rem',
                fontSize: 'var(--theia-ui-font-size0)',
                fontFamily: 'var(--theia-ui-font-family)'
            }}
        >
            {text}
        </span>
    );
};
