import * as React from 'react';

export type PrimitiveReadinessState = 'ready' | 'pending' | 'blocked' | 'unknown';

export interface ReadinessIndicatorProps {
    readonly state: PrimitiveReadinessState;
    readonly label?: string;
    readonly className?: string;
}

const READINESS_COLOURS: Readonly<Record<PrimitiveReadinessState, string>> = Object.freeze({
    ready: 'var(--theia-charts-green)',
    pending: 'var(--theia-charts-yellow)',
    blocked: 'var(--theia-errorForeground)',
    unknown: 'var(--theia-descriptionForeground)'
});

export const ReadinessIndicator: React.FC<ReadinessIndicatorProps> = ({ state, label, className }) => {
    const colour = READINESS_COLOURS[state];

    return (
        <span
            className={className ? `epilogos-readiness-indicator ${className}` : 'epilogos-readiness-indicator'}
            data-readiness-state={state}
            role="status"
            aria-label={label ?? `Readiness ${state}`}
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
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    background: colour
                }}
            />
            {label ?? state}
        </span>
    );
};
