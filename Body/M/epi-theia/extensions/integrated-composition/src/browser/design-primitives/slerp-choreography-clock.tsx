import * as React from 'react';

export interface SlerpChoreographyClockProps {
    readonly tick: number;
    readonly totalTicks: number;
    readonly label?: string;
    readonly className?: string;
}

export const SlerpChoreographyClock: React.FC<SlerpChoreographyClockProps> = ({
    tick,
    totalTicks,
    label,
    className
}) => {
    const denominator = Math.max(1, totalTicks);
    const progress = Math.max(0, Math.min(1, tick / denominator));

    return (
        <span
            className={className ? `epilogos-slerp-choreography-clock ${className}` : 'epilogos-slerp-choreography-clock'}
            data-slerp-progress={progress}
            role="meter"
            aria-valuemin={0}
            aria-valuemax={denominator}
            aria-valuenow={Math.max(0, Math.min(denominator, tick))}
            aria-label={label ?? 'Slerp choreography clock'}
            style={{
                display: 'inline-grid',
                gridTemplateColumns: '4rem auto',
                gap: '0.5rem',
                alignItems: 'center'
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    height: '0.35rem',
                    background: `linear-gradient(90deg, var(--theia-progressBar-background) ${progress * 100}%, var(--theia-editorWidget-border) ${progress * 100}%)`
                }}
            />
            <span>{label ?? `${tick}/${denominator}`}</span>
        </span>
    );
};
