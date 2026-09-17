/**
 * Coordinate: M' M0' (Virtue Witness panel, rerun 21.T21.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-0' in-widget verifier panel
 * Actualises: the live 9-bit witness as a labelled 3x3 indicator grid,
 *   threshold-banded coherence badge, and routed open-question list.
 * Public surface: M0VirtueWitnessPanel, M0VirtueWitnessPanelProps.
 * Does NOT own: witness computation, a local clock, canon mutation, or the
 *   question-console implementation owned by 21.T21.11.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.10.
 */

import { useMemo } from 'react';
import { useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { m0VirtueCoherenceBand, readM0VirtueWitness } from './m0VirtueWitness';

export interface M0VirtueWitnessPanelProps {
    readonly onQuestionSelect?: (question: string) => void;
}

export function M0VirtueWitnessPanel({ onQuestionSelect }: M0VirtueWitnessPanelProps) {
    const cached = useTickStore(state => state.profile);
    const witness = useMemo(() => readM0VirtueWitness(cached), [cached]);

    if (witness.state !== 'ready') {
        return (
            <section
                className="m0-virtue-witness m0-virtue-witness-status"
                data-testid={`m0-virtue-witness-${witness.state}`}
                data-generation={witness.generation ?? 'none'}
            >
                <ProvenanceBadge state={witness.state} reason={witness.reason} />
                <span>
                    {witness.state === 'pending'
                        ? 'Virtue witness not emitted on the current profile.'
                        : `Virtue witness blocked: ${witness.reason}`}
                </span>
            </section>
        );
    }

    const band = m0VirtueCoherenceBand(witness.coherenceScore);
    const filled = witness.witnessBits.filter(Boolean).length;
    return (
        <section
            className="m0-virtue-witness"
            data-testid="m0-virtue-witness-panel"
            data-generation={witness.generation}
        >
            <header className="m0-virtue-witness-header">
                <h3>Virtue witness</h3>
                <span
                    className={`m0-virtue-coherence m0-virtue-coherence-${band}`}
                    data-testid="m0-virtue-coherence"
                    data-band={band}
                    title="Verifier coherence"
                >
                    {witness.coherenceScore.toFixed(2)}
                </span>
            </header>
            <ol
                className="m0-virtue-witness-grid"
                data-testid="m0-virtue-witness-grid"
                data-filled={filled}
            >
                {witness.virtueLabels.map((label, index) => (
                    <li
                        key={label}
                        data-testid="m0-virtue-witness-cell"
                        data-witnessed={witness.witnessBits[index] ? 'true' : 'false'}
                    >
                        <span className="m0-virtue-indicator" aria-hidden="true" />
                        <span>{label}</span>
                    </li>
                ))}
            </ol>
            {witness.unsatisfiedConstraints.length > 0 ? (
                <div className="m0-virtue-questions" data-testid="m0-virtue-questions">
                    {witness.unsatisfiedConstraints.map(question => (
                        <button
                            key={question}
                            type="button"
                            disabled={!onQuestionSelect}
                            data-console-state={onQuestionSelect ? 'ready' : 'pending-tranche-21.11'}
                            title={
                                onQuestionSelect
                                    ? 'Open in Symbolic-Coordinate Question Console'
                                    : 'Question Console pending tranche 21.11'
                            }
                            onClick={() => onQuestionSelect?.(question)}
                        >
                            {question}
                        </button>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
