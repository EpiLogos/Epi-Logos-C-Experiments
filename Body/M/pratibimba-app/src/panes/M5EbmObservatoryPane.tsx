/**
 * Coordinate: M' M5' (EBM observatory pane — Track 26.T26.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the M5'-as-EBM observatory surface — identity narrative
 *   ("M5' does not talk. It scores." — the observatory is the mental
 *   pole's scoring face; the OmniPanel Pi tab is the M4' LLM voice, never
 *   collapsed), checkpoint badge, the 12×6 resonance grid with the three
 *   Klein-V₄ tritone-square overlays (A indigo / B amber / C emerald),
 *   energy + gradient + Möbius-descent readouts — every value from the
 *   view model's bus windows (m5Ebm.ts). No checkpoint on the bus →
 *   narrative + pending banner only; grid/energy/gradient suppressed.
 * Does NOT own: EBM law (m5Ebm.ts view model + kernel/S5 substrate), the
 *   profile cache, the six operational-capacity views (26.2's lane).
 * Composition role: Surface 1 (standalone EBM observatory) of the three M5'
 *   surfaces — see contracts/m5-prime-surface-composition.md §1/§3 (why the
 *   scoring face is never conflated with the OmniPanel M4' Pi voice).
 */

import { useMemo } from 'react';
import { useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/primitives';
import {
    inkDim,
    ringLit,
    tritoneSquareA,
    tritoneSquareB,
    tritoneSquareC,
    wheelUnlit
} from '../ui/tokens';
import { buildResonanceEbmSurface, TritoneSquareLabel } from './m5Ebm';

const SQUARE_TOKENS: Record<TritoneSquareLabel, string> = {
    'A:(0,5)': tritoneSquareA,
    'B:(1,4)': tritoneSquareB,
    'C:(2,3)': tritoneSquareC
};

const CELL = 26;
const GAP = 4;
const LEFT = 30;
const TOP = 18;

export function M5EbmObservatoryPane() {
    const cached = useTickStore(s => s.profile);

    const surface = useMemo(
        () =>
            buildResonanceEbmSurface({
                payload: (cached?.profile as Record<string, unknown> | null) ?? {},
                generation: cached?.generation ?? 0
            }),
        [cached]
    );

    const width = LEFT + 6 * (CELL + GAP) + 12;
    const height = TOP + 12 * (CELL + GAP) + 8;

    return (
        <section
            className="mext-widget-detail"
            data-testid="m5-ebm-observatory"
            data-state={surface.state}
            data-generation={surface.generation}
        >
            <h3>M5′ EBM observatory</h3>
            <p data-testid="m5-ebm-narrative">
                M5′ does not talk. It scores. This observatory renders the mental
                pole's energy landscape — the 72-fold resonance target, its learned
                predictor, and the Möbius-descent step — while the OmniPanel Pi tab
                stays the M4′ LLM voice. Two surfaces of one triplet, never collapsed.
            </p>

            {surface.state === 'pending-checkpoint' ? (
                <p
                    className="mext-widget-empty"
                    data-testid="m5-ebm-pending"
                    data-reason="pending-checkpoint"
                >
                    <ProvenanceBadge state="pending" reason="pending-checkpoint" />
                    pending: no checkpoint loaded — bootstrap Phase 1. The grid, energy,
                    and gradient render when the bus carries
                    mathemeResonance72Projection.learned_predictor_checkpoint_ref (10.M5);
                    nothing is synthesised here.
                </p>
            ) : (
                <>
                    <p data-testid="m5-ebm-checkpoint-badge">
                        checkpoint: <strong>{surface.checkpointRef}</strong>
                    </p>
                    <svg
                        data-testid="m5-ebm-resonance-grid"
                        viewBox={`0 0 ${width} ${height}`}
                        width={width}
                        height={height}
                        role="img"
                        aria-label="72-dim resonance grid — 12 lenses by 6 positions"
                    >
                        {Array.from({ length: 12 }, (_, lens) =>
                            Array.from({ length: 6 }, (_, position) => {
                                const value = surface.predicted72?.[lens * 6 + position] ?? 0;
                                const target = surface.target72?.[lens * 6 + position] ?? null;
                                const magnitude = Math.min(1, Math.abs(value));
                                return (
                                    <rect
                                        key={`${lens}-${position}`}
                                        data-testid={`m5-ebm-cell-${lens}-${position}`}
                                        x={LEFT + position * (CELL + GAP)}
                                        y={TOP + lens * (CELL + GAP)}
                                        width={CELL}
                                        height={CELL}
                                        fill={ringLit}
                                        fillOpacity={0.15 + magnitude * 0.85}
                                        stroke={target === null ? wheelUnlit : inkDim}
                                        strokeWidth={target === null ? 1 : 1.5}
                                    />
                                );
                            })
                        )}
                        {surface.tritoneSquares.map(square => (
                            <g
                                key={square.squareLabel}
                                data-testid={`m5-ebm-tritone-${square.squareLabel[0]}`}
                                data-coherence={square.coherenceScore ?? 'pending'}
                            >
                                {square.positions.map(position => (
                                    <rect
                                        key={position}
                                        x={LEFT + position * (CELL + GAP) - 2}
                                        y={TOP - 2}
                                        width={CELL + 4}
                                        height={12 * (CELL + GAP) - GAP + 4}
                                        fill="none"
                                        stroke={SQUARE_TOKENS[square.squareLabel]}
                                        strokeWidth={2}
                                        opacity={0.85}
                                    />
                                ))}
                            </g>
                        ))}
                    </svg>
                    <dl>
                        <dt>Energy</dt>
                        <dd data-testid="m5-ebm-energy">
                            E = ‖target₇₂ − predicted₇₂‖² ={' '}
                            {surface.energy !== null ? surface.energy.toFixed(6) : '— (pending-target)'}
                        </dd>
                        <dt>Gradient ∇q_p E</dt>
                        <dd data-testid="m5-ebm-gradient">
                            {surface.gradient
                                ? `[${surface.gradient.map(g => g.toFixed(4)).join(', ')}]`
                                : 'pending-gradient (kernel-owned, not yet bussed)'}
                        </dd>
                        <dt>Möbius descent −log(9/8)·∇E</dt>
                        <dd data-testid="m5-ebm-mobius-step">
                            {surface.mobiusDescentStep
                                ? `[${surface.mobiusDescentStep.map(g => g.toFixed(4)).join(', ')}]`
                                : 'pending-gradient'}
                        </dd>
                        <dt>Tritone coherence</dt>
                        <dd data-testid="m5-ebm-coherence">
                            {surface.tritoneSquares
                                .map(square =>
                                    square.coherenceScore !== null
                                        ? `${square.squareLabel} ${square.coherenceScore.toFixed(3)}`
                                        : `${square.squareLabel} pending`
                                )
                                .join(' · ')}
                        </dd>
                    </dl>
                </>
            )}
        </section>
    );
}
