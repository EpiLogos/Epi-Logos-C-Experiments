import * as React from 'react';

export interface LoadingPulseProps {
    readonly label: string;
    readonly className?: string;
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({ label, className }) => (
    <span
        className={className ? `epilogos-loading-pulse ${className}` : 'epilogos-loading-pulse'}
        role="status"
        aria-label={label}
        data-loading-state="loading"
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--theia-descriptionForeground)'
        }}
    >
        <span
            aria-hidden="true"
            style={{
                width: '0.65rem',
                height: '0.65rem',
                borderRadius: '50%',
                background: 'var(--theia-progressBar-background)'
            }}
        />
        {label}
    </span>
);
