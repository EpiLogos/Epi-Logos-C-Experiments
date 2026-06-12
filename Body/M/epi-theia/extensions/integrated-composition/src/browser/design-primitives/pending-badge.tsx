import * as React from 'react';

export interface PendingBadgeProps {
    readonly label?: string;
    readonly className?: string;
}

export const PendingBadge: React.FC<PendingBadgeProps> = ({ label = 'Pending', className }) => (
    <span
        className={className ? `epilogos-pending-badge ${className}` : 'epilogos-pending-badge'}
        data-provenance-state="pending"
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '1.25rem',
            padding: '0 0.45rem',
            border: '1px solid var(--theia-charts-yellow)',
            color: 'var(--theia-charts-yellow)',
            borderRadius: '0.25rem',
            fontSize: 'var(--theia-ui-font-size0)',
            fontFamily: 'var(--theia-ui-font-family)'
        }}
    >
        {label}
    </span>
);
