import * as React from 'react';
import { VIRTUE_WITNESS_LUT } from '../virtue-witness-panel';
import {
    M0VirtueWitnessProjection,
    SyntaxLayerFrame,
    SyntaxLayerPanelProps
} from './shared';

export const Arch9CompletionPanel: React.FC<SyntaxLayerPanelProps> = props => (
    <SyntaxLayerFrame
        {...props}
        layer="completion"
        title="Archetype 9 - Paramesvara syntax of completion"
        subtitle="VIRTUE_LUT routed rows"
        tableLabel="VIRTUE_LUT"
        expectedRowCount={9}
    >
        <VirtueWitnessInline virtueWitness={props.virtueWitness} />
    </SyntaxLayerFrame>
);

function VirtueWitnessInline(props: {
    readonly virtueWitness: M0VirtueWitnessProjection | null;
}): React.ReactElement {
    const witness = props.virtueWitness;
    return (
        <section
            className="m0-syntax-layer-witness"
            data-cross-link="21.10"
            aria-label="21.10 Virtue Witness inline projection"
            style={witnessPanelStyle}
        >
            <header style={witnessHeaderStyle}>
                <h4 style={witnessTitleStyle}>Virtue Witness</h4>
                <span data-provenance-state={witness?.state ?? 'blocked'} style={witnessStateStyle}>
                    21.10
                </span>
            </header>
            <ol style={witnessListStyle}>
                {VIRTUE_WITNESS_LUT.map(entry => {
                    const label =
                        witness?.virtueLabels[entry.position] ?? entry.name.split(' - ')[0];
                    const witnessed = witness?.witnessBits[entry.position] ?? false;
                    return (
                        <li
                            key={entry.position}
                            data-witness-row={entry.position}
                            data-witness-state={witnessed ? 'witnessed' : 'unwitnessed'}
                            style={witnessRowStyle}
                        >
                            <span aria-hidden="true" style={witnessGlyphStyle}>
                                {witnessed ? '+' : '-'}
                            </span>
                            <span>{label}</span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

const witnessPanelStyle: React.CSSProperties = {
    borderTop: '1px solid var(--theia-border-color, #3b3b3b)',
    paddingTop: 10,
    display: 'grid',
    gap: 8
};

const witnessHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center'
};

const witnessTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 13
};

const witnessStateStyle: React.CSSProperties = {
    fontSize: 11,
    opacity: 0.72
};

const witnessListStyle: React.CSSProperties = {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'grid',
    gap: 4
};

const witnessRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1.25rem minmax(0, 1fr)',
    gap: 6,
    fontSize: 12,
    lineHeight: 1.35
};

const witnessGlyphStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-ui-font-family)',
    textAlign: 'center'
};

export type { M0VirtueWitnessProjection, SyntaxLayerPanelProps };
