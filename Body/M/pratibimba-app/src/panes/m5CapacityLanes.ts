/**
 * Coordinate: M' M5' (operational-capacity lanes model — Track 26.T26.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5' standalone-observatory operational-capacity affordance
 * Actualises: the pure per-capacity lane derivation the M5' EBM observatory
 *   surfaces (26.2). M5' scores across six operational capacities; this reads
 *   the ONLY honest per-capacity signal the substrate produces — the
 *   `s5'.improve.history` runs, grouped by capacity (dispatch count, human-gate
 *   count, newest `updated_at`). Each lane carries the subsystem vak coordinate
 *   the Pi-monitor (ACR, `agentic-control-room`) scopes to on click-through.
 * Public surface: CapacityLane, CAPACITY_COORDINATE, buildCapacityLanes.
 * Does NOT own: the improvement law (S5 substrate), the autoresearch candidate
 *   surface (autoresearchModel.ts / AutoresearchPane.tsx), the EBM scoring
 *   (m5Ebm.ts), or the cross-layout dispatch (crossLayoutIntent.ts).
 * Contract: [[M5'-SPEC]] §M5'.4 / m5-prime-surface-composition.md §1 (Surface 1).
 *
 * Honesty note (26.2): the spec's `s5'.epii.runtimeContext` capacity fields and
 * a per-capacity `MathemeHarmonicProfileBoundary` are frozen-Theia producers
 * that were never wired in the substrate — the only real per-capacity signal is
 * `s5'.improve.history`. The observatory therefore surfaces dispatch activity
 * from that and marks the harmonic boundary substrate-pending; it never
 * synthesises a per-capacity harmonic field.
 */

import { AutoresearchCandidate, M5_OPERATIONAL_CAPACITIES, M5OperationalCapacity } from './autoresearchModel';

/**
 * Each M5' operational capacity is Epii operating on a subsystem (M5'-SPEC
 * §M5'.4 + DR-MP-1). The vak coordinate is the subsystem the Pi-monitor scopes
 * its dispatch trace to when a lane is opened.
 */
export const CAPACITY_COORDINATE: Readonly<Record<M5OperationalCapacity, string>> = Object.freeze({
    'anuttara-construction': 'M0',
    'paramasiva-cpt-rag': 'M1',
    'parashakti-graph-relational-ml': 'M2',
    'mahamaya-process-reward-rl': 'M3',
    'nara-anima-dialogic': 'M4',
    'epii-self-referential': "M5'"
});

export interface CapacityLane {
    readonly id: M5OperationalCapacity;
    readonly label: string;
    /** Subsystem vak coordinate the Pi-monitor click-through pre-populates. */
    readonly coordinate: string;
    /** Runs attributed to this capacity in `s5'.improve.history`. */
    readonly dispatchCount: number;
    /** Runs whose `requires_human` gate is set (non-bypassable at the gateway). */
    readonly humanGateCount: number;
    /** Newest `updated_at` across this capacity's runs; null when idle. */
    readonly lastActivityMs: number | null;
}

/**
 * Derive the six operational-capacity lanes from the improve-history candidates.
 * Always returns all six lanes in canonical order — an idle capacity is a real
 * lane at zero, not an omission.
 */
export function buildCapacityLanes(
    candidates: readonly AutoresearchCandidate[]
): readonly CapacityLane[] {
    return Object.freeze(
        M5_OPERATIONAL_CAPACITIES.map(item => {
            const runs = candidates.filter(candidate => candidate.capacity === item.id);
            const lastActivityMs = runs.reduce<number | null>(
                (newest, run) => (newest === null ? run.updatedAt : Math.max(newest, run.updatedAt)),
                null
            );
            return Object.freeze({
                id: item.id,
                label: item.label,
                coordinate: CAPACITY_COORDINATE[item.id],
                dispatchCount: runs.length,
                humanGateCount: runs.filter(run => run.requiresHuman === true).length,
                lastActivityMs
            });
        })
    );
}
