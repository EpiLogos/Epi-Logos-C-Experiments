/**
 * Coordinate: M' `/` membrane (Evidence tail — verifier-R virtue-witness vector, 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Position (#n): the `<VerifierRVirtueWitnessVector />` sub-fold of EvidencePacketView.
 * Actualises: the 9-bit virtue-witness bit-grid for a packet's wisdom-delta
 *   trace (spec 27.5: reads via `contemplate.fetch_wisdom_delta`, gated on
 *   19.6/19.9/26.13). The MediatedRunEvidencePacket schema (26.10) carries no
 *   `wisdomDeltaTraceRef` yet and the fetch method is not on the carrier wire,
 *   so with no witness vector this renders the honest ReadinessBanner. When a
 *   real 9-bit vector IS supplied it renders the LSB-first 3x3 grid with the
 *   action-7 / octave-8 / wholeness-9 register labels — nothing is synthesised.
 * Public surface: VerifierRVirtueWitnessVector.
 * Does NOT own: the wisdom-delta feed (S5'/contemplate), the packet schema.
 */

import { ReadinessBanner } from '../../../ui/ReadinessBanner';

const FETCH_WISDOM_DELTA_METHOD = 'contemplate.fetch_wisdom_delta';

/** The three virtue registers over the 9-bit witness (spec 27.5). */
const REGISTER_LABELS: readonly string[] = ['action-7', 'octave-8', 'wholeness-9'];

function bits(vector: number): readonly boolean[] {
    // LSB-first, nine bits (mirrors m0VirtueWitness ordering).
    return Array.from({ length: 9 }, (_, i) => ((vector >> i) & 1) === 1);
}

export function VerifierRVirtueWitnessVector({
    wisdomDeltaTraceRef,
    witnessVector
}: {
    /** Present only when the packet links a wisdom-delta trace (feed-gated). */
    readonly wisdomDeltaTraceRef?: string;
    /** The resolved 9-bit witness vector, when the fetch feed has returned one. */
    readonly witnessVector?: number;
}) {
    if (witnessVector === undefined) {
        return (
            <section className="evidence-virtue-witness" data-testid="evidence-virtue-witness">
                <span className="evidence-list-label">verifier-R virtue witness</span>
                <ReadinessBanner
                    state="degraded_but_readable"
                    reason={
                        wisdomDeltaTraceRef
                            ? `${FETCH_WISDOM_DELTA_METHOD} is not on the carrier wire — witness vector for ${wisdomDeltaTraceRef} pending`
                            : 'no wisdom-delta trace linked to this packet (26.13 feed-gated)'
                    }
                />
            </section>
        );
    }

    const grid = bits(witnessVector);
    return (
        <section className="evidence-virtue-witness" data-testid="evidence-virtue-witness" data-vector={witnessVector}>
            <span className="evidence-list-label">verifier-R virtue witness</span>
            <div className="virtue-witness-grid" data-testid="virtue-witness-grid" role="img" aria-label="9-bit virtue witness">
                {[0, 1, 2].map(row => (
                    <div key={row} className="virtue-witness-row" data-register={REGISTER_LABELS[row]}>
                        <span className="virtue-witness-register">{REGISTER_LABELS[row]}</span>
                        {[0, 1, 2].map(col => {
                            const idx = row * 3 + col;
                            return (
                                <span
                                    key={col}
                                    className={`virtue-witness-bit${grid[idx] ? ' set' : ''}`}
                                    data-bit={idx}
                                    data-set={grid[idx]}
                                    aria-label={`bit ${idx} ${grid[idx] ? 'set' : 'unset'}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </section>
    );
}
