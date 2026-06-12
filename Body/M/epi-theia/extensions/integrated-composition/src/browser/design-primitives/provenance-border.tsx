import * as React from 'react';

export type ProvenanceBorderState = 'ready' | 'pending' | 'blocked' | 'unknown';

export interface ProvenanceBorderProps {
    readonly state: ProvenanceBorderState;
    readonly label: string;
    readonly children: React.ReactNode;
    readonly className?: string;
}

const PROVENANCE_COLOURS: Readonly<Record<ProvenanceBorderState, string>> = Object.freeze({
    ready: 'var(--theia-charts-green)',
    pending: 'var(--theia-charts-yellow)',
    blocked: 'var(--theia-errorForeground)',
    unknown: 'var(--theia-descriptionForeground)'
});

export const ProvenanceBorder: React.FC<ProvenanceBorderProps> = ({ state, label, children, className }) => (
    <section
        className={className ? `epilogos-provenance-border ${className}` : 'epilogos-provenance-border'}
        data-provenance-state={state}
        aria-label={label}
        style={{
            borderInlineStart: `3px solid ${PROVENANCE_COLOURS[state]}`,
            paddingInlineStart: '0.75rem'
        }}
    >
        {children}
    </section>
);
