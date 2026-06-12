import * as React from 'react';

export interface EmptyStateProps {
    readonly title: string;
    readonly detail?: string;
    readonly action?: React.ReactNode;
    readonly className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, detail, action, className }) => (
    <section
        className={className ? `epilogos-empty-state ${className}` : 'epilogos-empty-state'}
        aria-label={title}
        style={{
            display: 'grid',
            gap: '0.5rem',
            alignContent: 'center',
            minHeight: '8rem',
            color: 'var(--theia-descriptionForeground)'
        }}
    >
        <strong style={{ color: 'var(--theia-foreground)', fontSize: 'var(--theia-ui-font-size1)' }}>
            {title}
        </strong>
        {detail && <span>{detail}</span>}
        {action}
    </section>
);
