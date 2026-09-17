import * as React from 'react';

export type SyntaxLayerKind = 'speech' | 'relationship' | 'action' | 'completion';

export interface M0SubTableRow {
    readonly id: number;
    readonly label: string;
    readonly symbol: string | null;
    readonly provenance: string;
}

export type M0VirtueLabels = readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
];

export interface M0VirtueWitnessProjection {
    readonly witnessBits: readonly [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean
    ];
    readonly virtueLabels: M0VirtueLabels;
    readonly coherenceScore: number | null;
    readonly unsatisfiedConstraints: readonly string[];
    readonly state: string;
}

export interface SyntaxLayerPanelProps {
    readonly subTableRows: readonly M0SubTableRow[];
    readonly contemplationPrompt: string | null;
    readonly virtueWitness: M0VirtueWitnessProjection | null;
    readonly onSeekContemplation: () => void;
}

export interface SyntaxLayerFrameProps extends SyntaxLayerPanelProps {
    readonly layer: SyntaxLayerKind;
    readonly title: string;
    readonly subtitle: string;
    readonly tableLabel: string;
    readonly expectedRowCount: number;
    readonly children?: React.ReactNode;
}

export function SyntaxLayerFrame(props: SyntaxLayerFrameProps): React.ReactElement {
    const {
        layer,
        title,
        subtitle,
        tableLabel,
        expectedRowCount,
        subTableRows,
        contemplationPrompt,
        onSeekContemplation,
        children
    } = props;

    return (
        <section
            className={`m0-syntax-layer-panel m0-syntax-layer-panel-${layer}`}
            data-syntax-layer={layer}
            data-expected-row-count={expectedRowCount}
            aria-label={title}
            style={panelStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>{title}</h3>
                    <p style={subtitleStyle}>{subtitle}</p>
                </div>
                <button
                    type="button"
                    title={contemplationPrompt ?? 'Contemplation Prompt footer pending'}
                    aria-controls="m0-contemplation-prompt-footer"
                    data-cross-link="21.9"
                    onClick={onSeekContemplation}
                    style={promptButtonStyle}
                >
                    Why this question right now?
                </button>
            </header>
            {contemplationPrompt ? (
                <p
                    id={`${layer}-contemplation-preview`}
                    data-cross-link="21.9"
                    style={promptStyle}
                >
                    {contemplationPrompt}
                </p>
            ) : null}
            <ol
                className="m0-syntax-layer-rows"
                data-sub-table={tableLabel}
                aria-label={tableLabel}
                style={listStyle}
            >
                {subTableRows.map(row => (
                    <li
                        key={row.id}
                        data-syntax-row-id={row.id}
                        data-provenance={row.provenance}
                        style={rowStyle}
                    >
                        <span style={rowIndexStyle}>{row.id}</span>
                        <span style={rowBodyStyle}>
                            <span style={rowLabelStyle}>{row.label}</span>
                            {row.symbol ? <code style={rowSymbolStyle}>{row.symbol}</code> : null}
                        </span>
                    </li>
                ))}
            </ol>
            {children}
        </section>
    );
}

const panelStyle: React.CSSProperties = {
    border: '1px solid var(--theia-border-color, #3b3b3b)',
    borderRadius: 6,
    padding: 12,
    display: 'grid',
    gap: 10
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start'
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.3
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    fontSize: 12,
    opacity: 0.78
};

const promptButtonStyle: React.CSSProperties = {
    border: '1px solid var(--theia-button-border, transparent)',
    borderRadius: 4,
    padding: '4px 8px',
    color: 'var(--theia-button-foreground)',
    background: 'var(--theia-button-background)',
    cursor: 'pointer',
    whiteSpace: 'normal',
    maxWidth: 180,
    textAlign: 'left'
};

const promptStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 12,
    color: 'var(--theia-descriptionForeground)'
};

const listStyle: React.CSSProperties = {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'grid',
    gap: 6,
    maxHeight: 260,
    overflowY: 'auto'
};

const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2rem minmax(0, 1fr)',
    gap: 8,
    alignItems: 'start',
    border: '1px solid var(--theia-editorWidget-border, #4a4a4a)',
    borderRadius: 4,
    padding: 8
};

const rowIndexStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-ui-font-family)',
    fontSize: 12,
    opacity: 0.72
};

const rowBodyStyle: React.CSSProperties = {
    minWidth: 0,
    display: 'grid',
    gap: 4
};

const rowLabelStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: 1.35
};

const rowSymbolStyle: React.CSSProperties = {
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    fontSize: 12
};
