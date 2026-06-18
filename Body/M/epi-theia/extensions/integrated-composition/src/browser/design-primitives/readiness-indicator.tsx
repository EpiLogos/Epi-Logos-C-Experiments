import * as React from 'react';
import {
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

export type PrimitiveReadinessState = 'ready' | 'pending' | 'blocked' | 'unknown';
export type ReadinessIndicatorMode = 'dot' | 'icon';

export interface ReadinessIndicatorProps {
    readonly state?: PrimitiveReadinessState;
    readonly label?: string;
    readonly className?: string;
    readonly readiness?: ReadinessSnapshotLike;
    readonly bridge?: ReadinessSubscriptionSource | null;
    readonly mode?: ReadinessIndicatorMode;
}

const READINESS_COLOURS: Readonly<Record<PrimitiveReadinessState, string>> = Object.freeze({
    ready: 'var(--theia-charts-green)',
    pending: 'var(--theia-charts-yellow)',
    blocked: 'var(--theia-errorForeground)',
    unknown: 'var(--theia-descriptionForeground)'
});

export const ReadinessIndicator: React.FC<ReadinessIndicatorProps> = ({
    state,
    label,
    className,
    readiness,
    bridge,
    mode = 'dot'
}) => {
    const snapshot = useReadinessSnapshot(readiness, bridge);
    const readinessId = readinessIdOf(snapshot);
    const severity = readinessSeverityOf(snapshot);
    const legacyState = state ?? (severity === 'ready' ? 'ready' : severity === 'degraded' ? 'pending' : 'blocked');
    const colour = readiness ? readinessCssVar(readinessId) : READINESS_COLOURS[legacyState];
    const size = mode === 'icon' ? '1rem' : '0.5rem';
    const text = label ?? (readiness ? readinessLabel(snapshot, readinessId) : legacyState);

    return (
        <span
            className={className ? `epilogos-readiness-indicator ${className}` : 'epilogos-readiness-indicator'}
            data-readiness-state={legacyState}
            data-readiness-id={readinessId}
            data-readiness-severity={severity}
            data-readiness-token={readinessIdTokenPath(readinessId)}
            data-readiness-mode={mode}
            role="status"
            aria-label={text}
            title={readinessTooltip(snapshot, readinessId)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: colour,
                fontSize: 'var(--theia-ui-font-size0)',
                fontFamily: 'var(--theia-ui-font-family)'
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: colour,
                    boxShadow: mode === 'icon' ? `inset 0 0 0 0.2rem color-mix(in srgb, ${colour} 35%, transparent)` : undefined
                }}
            />
            {text}
        </span>
    );
};
