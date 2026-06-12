import * as React from 'react';

export interface LemniscateTransitionProps {
    readonly from: string;
    readonly to: string;
    readonly phase: number;
    readonly className?: string;
}

export const LemniscateTransition: React.FC<LemniscateTransitionProps> = ({ from, to, phase, className }) => {
    const boundedPhase = Math.max(0, Math.min(1, phase));

    return (
        <span
            className={className ? `epilogos-lemniscate-transition ${className}` : 'epilogos-lemniscate-transition'}
            data-transition-from={from}
            data-transition-to={to}
            data-transition-phase={boundedPhase}
            aria-label={`${from} to ${to}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--theia-foreground)'
            }}
        >
            <span>{from}</span>
            <span aria-hidden="true" style={{ opacity: 0.45 + boundedPhase * 0.55 }}>
                infinity
            </span>
            <span>{to}</span>
        </span>
    );
};
