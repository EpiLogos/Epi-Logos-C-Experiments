/**
 * Coordinate: M' M0-0' (archetype routing reader panel, 21.T21.8)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0 language-panel routing sub-section
 * Actualises: the selected coordinate's bussed archetype sub-table read with
 *   syntax-layer and provenance disclosure.
 * Public surface: M0ArchetypeRoutingPanel, M0ArchetypeRoutingPanelProps.
 * Does NOT own: kernel LUT data, route derivation, profile transport, or graph reads.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.8.
 */

import { useEffect, useState } from 'react';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import {
    m0ArchetypeRoutingLutLabel,
    type M0ArchetypeRoutingProjection
} from './m0ArchetypeRouting';
import type { M0VirtueWitnessRead } from './m0VirtueWitness';
import { Arch3SpeechPanel } from './arch3SpeechPanel';
import { Arch5RelationshipPanel } from './arch5RelationshipPanel';
import { Arch7ActionPanel } from './arch7ActionPanel';
import { Arch9CompletionPanel } from './arch9CompletionPanel';

export interface M0ArchetypeRoutingPanelProps {
    readonly projection: M0ArchetypeRoutingProjection;
    readonly contemplationPrompt?: string | null;
    readonly virtueWitness?: M0VirtueWitnessRead | null;
    readonly onSeekContemplation?: () => void;
}

export function M0ArchetypeRoutingPanel({
    projection,
    contemplationPrompt = null,
    virtueWitness = null,
    onSeekContemplation = () => undefined
}: M0ArchetypeRoutingPanelProps) {
    const lutLabel = m0ArchetypeRoutingLutLabel(projection);
    const routed = projection.routedSubTable !== 'NONE' && projection.syntaxLayer !== null;
    const [syntaxLayerOpen, setSyntaxLayerOpen] = useState(false);
    useEffect(() => setSyntaxLayerOpen(false), [projection.archetypeIndex]);
    const syntaxProps = {
        subTableRows: projection.subTableRows,
        contemplationPrompt,
        virtueWitness,
        onSeekContemplation
    };

    return (
        <section
            className="m0-archetype-routing-reader"
            data-testid="m0-archetype-routing-reader"
            data-routed-sub-table={projection.routedSubTable}
            data-syntax-layer={projection.syntaxLayer ?? undefined}
            data-provenance={projection.state}
        >
            <header className="m0-archetype-routing-header">
                <div>
                    <h4>Archetype routing</h4>
                    {routed ? (
                        <p>
                            Archetype {projection.archetypeIndex} - {projection.archetypeLabel} / {lutLabel}
                        </p>
                    ) : (
                        <p>Select archetype 3, 5, 7, or 9 to read a routed M0 sub-table.</p>
                    )}
                </div>
                <ProvenanceBadge
                    state={projection.state}
                    reason={
                        projection.state === 'blocked'
                            ? 'm0_routing_lut_snapshot has not emitted rows for this archetype'
                            : undefined
                    }
                />
            </header>
            {routed ? (
                <>
                    <span className="m0-archetype-routing-syntax" data-testid="m0-archetype-routing-syntax">
                        {projection.syntaxLayer}
                    </span>
                    <div className="m0-archetype-routing-links">
                        <button
                            type="button"
                            aria-expanded={syntaxLayerOpen}
                            disabled={projection.subTableRows.length === 0}
                            onClick={() => setSyntaxLayerOpen(open => !open)}
                        >
                            Syntax layer
                        </button>
                        <span>Parity bridge reader</span>
                    </div>
                </>
            ) : null}
            {routed && projection.subTableRows.length > 0 ? (
                <ol className="m0-archetype-routing-rows" data-testid="m0-archetype-routing-rows">
                    {projection.subTableRows.map(row => (
                        <li key={row.id} data-provenance={row.provenance}>
                            <span>{row.id}</span>
                            <span>{row.label}</span>
                            {row.symbol ? <code>{row.symbol}</code> : null}
                        </li>
                    ))}
                </ol>
            ) : routed ? (
                <p>
                    {projection.state === 'blocked'
                        ? 'Routing snapshot unavailable for this archetype.'
                        : 'No routed rows are present for this archetype.'}
                </p>
            ) : null}
            {routed && syntaxLayerOpen ? (
                <>
                    {projection.archetypeIndex === 3 ? <Arch3SpeechPanel {...syntaxProps} /> : null}
                    {projection.archetypeIndex === 5 ? <Arch5RelationshipPanel {...syntaxProps} /> : null}
                    {projection.archetypeIndex === 7 ? <Arch7ActionPanel {...syntaxProps} /> : null}
                    {projection.archetypeIndex === 9 ? <Arch9CompletionPanel {...syntaxProps} /> : null}
                </>
            ) : null}
        </section>
    );
}
