import * as React from 'react';

export interface BlockedOverlayProps {
    readonly reason: string;
    readonly children?: React.ReactNode;
    readonly className?: string;
}

export const BlockedOverlay: React.FC<BlockedOverlayProps> = ({ reason, children, className }) => (
    <div
        className={className ? `epilogos-blocked-overlay ${className}` : 'epilogos-blocked-overlay'}
        data-provenance-state="blocked"
        role="status"
        aria-label={`Blocked: ${reason}`}
        style={{
            position: 'relative',
            minHeight: '2.5rem',
            padding: '0.75rem',
            border: '1px solid var(--theia-errorForeground)',
            background: 'color-mix(in srgb, var(--theia-errorForeground) 10%, transparent)',
            color: 'var(--theia-errorForeground)'
        }}
    >
        {children}
        <strong>{reason}</strong>
    </div>
);
