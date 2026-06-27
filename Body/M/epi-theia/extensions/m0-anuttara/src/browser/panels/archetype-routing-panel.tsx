import * as React from 'react';
import type { M0ArchetypeRoutingProjection } from '../../common/m0-inspector';
import { m0ArchetypeRoutingLutLabel } from '../../common/m0-inspector';

export interface M0ArchetypeRoutingPanelProps {
    readonly projection: M0ArchetypeRoutingProjection;
    readonly placement?: 'language-subtab' | 'top-level';
}

export function M0ArchetypeRoutingPanel(
    props: M0ArchetypeRoutingPanelProps
): React.ReactElement | null {
    const { projection } = props;
    const lutLabel = m0ArchetypeRoutingLutLabel(projection);

    if (projection.routedSubTable === 'NONE' || projection.syntaxLayer === null) {
        return (
            <section
                className="m0-archetype-routing-panel"
                data-widget-id="pratibimba.m0-anuttara:archetype-routing-reader"
                data-placement={props.placement ?? 'language-subtab'}
                data-provenance-state={projection.state}
                data-routed-sub-table="NONE"
                aria-label="Archetype routing reader"
                style={panelStyle}
            >
                <h3 style={titleStyle}>Archetype routing reader</h3>
                <p className="mext-widget-empty" style={emptyStyle}>
                    Select archetype 3, 5, 7, or 9 to read the routed M0 sub-table.
                </p>
            </section>
        );
    }

    const title = `Archetype ${projection.archetypeIndex} - ${
        projection.archetypeLabel ?? projection.routedSubTable
    } / ${lutLabel ?? projection.routedSubTable}`;

    return (
        <section
            className="m0-archetype-routing-panel"
            data-widget-id="pratibimba.m0-anuttara:archetype-routing-reader"
            data-placement={props.placement ?? 'language-subtab'}
            data-active-archetype={projection.archetypeIndex ?? ''}
            data-routed-sub-table={projection.routedSubTable}
            data-syntax-layer={projection.syntaxLayer}
            data-provenance-state={projection.state}
            aria-label="Archetype routing reader"
            style={panelStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>{title}</h3>
                    <p style={subtitleStyle}>
                        Kernel-bridge routing snapshot; no direct backend LUT import.
                    </p>
                </div>
                <span
                    className="m0-archetype-routing-syntax-pill"
                    data-syntax-layer={projection.syntaxLayer}
                    style={pillStyle}
                >
                    {projection.syntaxLayer}
                </span>
            </header>
            <div style={crossLinkStyle} aria-label="Reader cross-links">
                <span data-cross-link="21.13">21.13 syntax-layer reader</span>
                <span data-cross-link="21.16">21.16 parity bridge reader</span>
            </div>
            {projection.subTableRows.length ? (
                <ol
                    className="m0-archetype-routing-rows"
                    data-sub-table={projection.routedSubTable}
                    aria-label={`${projection.routedSubTable} rows`}
                    style={rowListStyle}
                >
                    {projection.subTableRows.map(row => (
                        <li
                            key={row.id}
                            data-routing-row-id={row.id}
                            data-mono-poly-state={row.monoPolyState ?? undefined}
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
            ) : (
                <p className="mext-widget-empty" style={emptyStyle}>
                    Routing snapshot is present, but this archetype has no projected rows.
                </p>
            )}
        </section>
    );
}

export function shouldRenderM0ArchetypeRoutingTopSection(
    projection: M0ArchetypeRoutingProjection
): boolean {
    return projection.routedSubTable !== 'NONE' && projection.syntaxLayer !== null;
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
    alignItems: 'start'
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.3
};

const subtitleStyle: React.CSSProperties = {
    margin: '3px 0 0',
    opacity: 0.72,
    fontSize: 12
};

const pillStyle: React.CSSProperties = {
    border: '1px solid var(--theia-border-color, #3b3b3b)',
    borderRadius: 999,
    padding: '3px 8px',
    fontSize: 11,
    whiteSpace: 'nowrap'
};

const crossLinkStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 11,
    opacity: 0.78
};

const rowListStyle: React.CSSProperties = {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'grid',
    gap: 6,
    maxHeight: 220,
    overflowY: 'auto'
};

const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2.5rem minmax(0, 1fr)',
    gap: 8,
    alignItems: 'start',
    borderTop: '1px solid var(--theia-border-color, #3b3b3b)',
    paddingTop: 6
};

const rowIndexStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-ui-font-family)',
    opacity: 0.72
};

const rowBodyStyle: React.CSSProperties = {
    display: 'grid',
    gap: 3,
    minWidth: 0
};

const rowLabelStyle: React.CSSProperties = {
    overflowWrap: 'anywhere'
};

const rowSymbolStyle: React.CSSProperties = {
    width: 'fit-content',
    maxWidth: '100%',
    overflowWrap: 'anywhere'
};

const emptyStyle: React.CSSProperties = {
    margin: 0
};
