/**
 * Coordinate: M' M0-0' (syntax-layer reader core, 21.T21.13)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): lazy Archetype Routing Reader sub-panel body.
 * Actualises: a strict presentation of routed syntax-table rows, the bussed
 *   contemplation prompt affordance, and the Arch 9 witness cross-read.
 * Public surface: SyntaxLayerPanelProps, M0SyntaxLayerReader.
 * Does NOT own: routing LUTs, prompt text, witness computation, or navigation.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.13.
 */

import type { M0SubTableRow, M0SyntaxLayer } from './m0ArchetypeRouting';
import type { M0VirtueWitnessRead } from './m0VirtueWitness';

export interface SyntaxLayerPanelProps {
    readonly subTableRows: readonly M0SubTableRow[];
    readonly contemplationPrompt: string | null;
    readonly virtueWitness: M0VirtueWitnessRead | null;
    readonly onSeekContemplation: () => void;
}

interface M0SyntaxLayerReaderProps extends SyntaxLayerPanelProps {
    readonly heading: string;
    readonly syntaxLayer: Exclude<M0SyntaxLayer, null>;
    readonly expectedRowCount: number;
    readonly showVirtueWitness?: boolean;
}

export function M0SyntaxLayerReader({
    heading,
    syntaxLayer,
    expectedRowCount,
    subTableRows,
    contemplationPrompt,
    virtueWitness,
    onSeekContemplation,
    showVirtueWitness = false
}: M0SyntaxLayerReaderProps) {
    const complete = subTableRows.length === expectedRowCount;
    const witness = showVirtueWitness && virtueWitness?.state === 'ready' ? virtueWitness : null;
    const witnessed = witness?.witnessBits.filter(Boolean).length ?? 0;

    return (
        <section
            className="m0-syntax-layer-reader"
            data-testid="m0-syntax-layer-reader"
            data-syntax-layer={syntaxLayer}
            data-provenance={complete ? 'canonical' : 'blocked'}
        >
            <header className="m0-syntax-layer-reader-header">
                <h5>{heading}</h5>
                <button
                    type="button"
                    className="m0-syntax-contemplation-link"
                    disabled={!contemplationPrompt}
                    title={
                        contemplationPrompt ?? 'The contemplation prompt has not been emitted for this archetype.'
                    }
                    onClick={onSeekContemplation}
                >
                    Why this question right now?
                </button>
            </header>
            {complete ? null : (
                <p className="m0-syntax-layer-status">
                    Routed table is incomplete: expected {expectedRowCount} rows, received {subTableRows.length}.
                </p>
            )}
            <ol className="m0-syntax-layer-rows" data-testid="m0-syntax-layer-rows">
                {subTableRows.map(row => (
                    <li key={row.id} data-provenance={row.provenance}>
                        <span>{row.label}</span>
                        {row.symbol ? <code>{row.symbol}</code> : null}
                    </li>
                ))}
            </ol>
            {showVirtueWitness ? (
                <div
                    className="m0-syntax-layer-witness"
                    data-testid="m0-syntax-layer-witness"
                    data-witnessed={witnessed}
                    data-state={witness ? 'ready' : virtueWitness?.state ?? 'pending'}
                >
                    {witness ? (
                        <ol>
                            {witness.virtueLabels.map((label, index) => (
                                <li key={label} data-witnessed={witness.witnessBits[index] ? 'true' : 'false'}>
                                    <span>{label}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <span>Virtue witness pending.</span>
                    )}
                </div>
            ) : null}
        </section>
    );
}
