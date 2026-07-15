/**
 * Coordinate: M' M5' (Autoresearch disclosure model - 28.T28.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5-4' governed autoresearch surface
 * Actualises: strict `s5'.improve.status` / `.history` consumption, the six
 *   operational-capacity filters, and an honest Mobius lifecycle projection.
 * Public surface: parsers, capacity vocabulary, AutoresearchSnapshot.
 * Does NOT own: S5 improvement law, promotion, review decisions, or a clock.
 */

export const IMPROVE_STATUS_METHOD = "s5'.improve.status";
export const IMPROVE_HISTORY_METHOD = "s5'.improve.history";

export const M5_OPERATIONAL_CAPACITIES = [
    { id: 'anuttara-construction', label: 'M0 - Anuttara construction' },
    { id: 'paramasiva-cpt-rag', label: 'M1 - Paramasiva CPT/RAG' },
    { id: 'parashakti-graph-relational-ml', label: 'M2 - Parashakti graph relational ML' },
    { id: 'mahamaya-process-reward-rl', label: 'M3 - Mahamaya process reward RL' },
    { id: 'nara-anima-dialogic', label: 'M4 - Nara Anima dialogic' },
    { id: 'epii-self-referential', label: "M5' - Epii self-referential" }
] as const;

export type M5OperationalCapacity = (typeof M5_OPERATIONAL_CAPACITIES)[number]['id'];
export type ImproveLoopState = 'idle' | 'hypothesis' | 'evaluating' | 'deciding';
export type MobiusStage = 'Surface' | 'Route' | 'Orchestrate' | 'Integrate';

export const MOBIUS_STAGES: readonly MobiusStage[] = ['Surface', 'Route', 'Orchestrate', 'Integrate'];

export interface AutoresearchStatus {
    readonly loopState: ImproveLoopState;
    readonly activeStage: MobiusStage;
    readonly activeVectorCount: number;
    readonly totalRuns: number;
    readonly keepCount: number;
    readonly discardCount: number;
    readonly kernelEvidenceCount: number;
    readonly lastRun: number | null;
    /** The gateway does not project a recompose-pass ordinal today. */
    readonly recomposePass: null;
    /** S5 promotion rejects non-dry-run requests; this is contract law, not wire data. */
    readonly dryRunEnforced: true;
}
export interface AutoresearchCandidate {
    readonly id: string;
    readonly title: string;
    readonly targetCoordinate: string;
    readonly loopState: ImproveLoopState;
    readonly decision: 'keep' | 'discard' | null;
    readonly capacity: M5OperationalCapacity | null;
    readonly requiresHuman: true | null;
    readonly reviewId: string | null;
    readonly updatedAt: number;
}

export interface AutoresearchSnapshot {
    readonly status: AutoresearchStatus;
    readonly candidates: readonly AutoresearchCandidate[];
}

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
}

function finiteInteger(value: unknown, label: string): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative safe integer`);
    }
    return value;
}

function nonBlank(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${label} must be a non-blank string`);
    }
    return value;
}

function loopState(value: unknown, label: string): ImproveLoopState {
    if (value === 'idle' || value === 'hypothesis' || value === 'evaluating' || value === 'deciding') {
        return value;
    }
    throw new Error(`${label} is not a supported improvement loop state`);
}

function nullableDecision(value: unknown): 'keep' | 'discard' | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (value === 'keep' || value === 'discard') {
        return value;
    }
    throw new Error('improvement run decision must be keep, discard, or null');
}

export function loopStateToMobiusStage(state: ImproveLoopState): MobiusStage {
    switch (state) {
        case 'idle':
            return 'Surface';
        case 'hypothesis':
            return 'Route';
        case 'evaluating':
            return 'Orchestrate';
        case 'deciding':
            return 'Integrate';
    }
}

export function parseImproveStatus(value: unknown): AutoresearchStatus {
    const raw = record(value, 'improve status');
    const state = loopState(raw.loop_state, 'improve status loop_state');
    if (!Array.isArray(raw.active_vectors)) {
        throw new Error('improve status active_vectors must be an array');
    }
    const lastRun = raw.last_run === null ? null : finiteInteger(raw.last_run, 'improve status last_run');
    return Object.freeze({
        loopState: state,
        activeStage: loopStateToMobiusStage(state),
        activeVectorCount: raw.active_vectors.length,
        totalRuns: finiteInteger(raw.total_runs, 'improve status total_runs'),
        keepCount: finiteInteger(raw.keep_count, 'improve status keep_count'),
        discardCount: finiteInteger(raw.discard_count, 'improve status discard_count'),
        kernelEvidenceCount: finiteInteger(raw.kernel_evidence_count, 'improve status kernel_evidence_count'),
        lastRun,
        recomposePass: null,
        dryRunEnforced: true
    });
}

const CAPACITY_IDS = new Set<string>(M5_OPERATIONAL_CAPACITIES.map(item => item.id));
const SUBSYSTEM_CAPACITY: Readonly<Record<string, M5OperationalCapacity>> = Object.freeze({
    anuttara: 'anuttara-construction',
    paramasiva: 'paramasiva-cpt-rag',
    parashakti: 'parashakti-graph-relational-ml',
    mahamaya: 'mahamaya-process-reward-rl',
    nara: 'nara-anima-dialogic',
    epii: 'epii-self-referential'
});

function candidateCapacity(run: Record<string, unknown>): M5OperationalCapacity | null {
    if (typeof run.capacity === 'string' && CAPACITY_IDS.has(run.capacity)) {
        return run.capacity as M5OperationalCapacity;
    }
    const typed = run.typed_candidate;
    if (typed && typeof typed === 'object' && !Array.isArray(typed)) {
        const subsystem = (typed as Record<string, unknown>).target_subsystem;
        if (typeof subsystem === 'string') {
            return SUBSYSTEM_CAPACITY[subsystem.toLowerCase()] ?? null;
        }
    }
    return typeof run.target_family === 'string' && CAPACITY_IDS.has(run.target_family)
        ? (run.target_family as M5OperationalCapacity)
        : null;
}

function candidateRequiresHuman(run: Record<string, unknown>): true | null {
    if (run.requires_human === true) {
        return true;
    }
    const typed = run.typed_candidate;
    if (
        typed &&
        typeof typed === 'object' &&
        !Array.isArray(typed) &&
        (typed as Record<string, unknown>).requires_human === true
    ) {
        return true;
    }
    return null;
}

export function parseImproveHistory(value: unknown): readonly AutoresearchCandidate[] {
    const raw = record(value, 'improve history');
    if (!Array.isArray(raw.runs)) {
        throw new Error('improve history runs must be an array');
    }
    return Object.freeze(
        raw.runs.map((entry, index) => {
            const run = record(entry, `improve history run ${index}`);
            const reviewId =
                run.source_review_item_id === null || run.source_review_item_id === undefined
                    ? null
                    : nonBlank(run.source_review_item_id, `improve history run ${index} source_review_item_id`);
            return Object.freeze({
                id: nonBlank(run.run_id, `improve history run ${index} run_id`),
                title: nonBlank(run.direction, `improve history run ${index} direction`),
                targetCoordinate: nonBlank(
                    run.target_coordinate,
                    `improve history run ${index} target_coordinate`
                ),
                loopState: loopState(run.loop_state, `improve history run ${index} loop_state`),
                decision: nullableDecision(run.decision),
                capacity: candidateCapacity(run),
                requiresHuman: candidateRequiresHuman(run),
                reviewId,
                updatedAt: finiteInteger(run.updated_at, `improve history run ${index} updated_at`)
            });
        })
    );
}
