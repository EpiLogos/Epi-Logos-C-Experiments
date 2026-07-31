/**
 * Coordinate: M' M5' (Autoresearch disclosure model - 28.T28.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5-4' governed autoresearch surface
 * Actualises: strict `s5'.improve.status` / `.history` / `.q_review.latest`
 *   consumption, the six operational-capacity filters, and an honest Mobius
 *   lifecycle projection.
 * Public surface: parsers, capacity vocabulary, AutoresearchSnapshot, the
 *   `capacity:<id>` cross-layout contribution-id codec (26.T26.6).
 * Does NOT own: S5 improvement law, promotion, review decisions, or a clock.
 */

export const IMPROVE_STATUS_METHOD = "s5'.improve.status";
export const IMPROVE_HISTORY_METHOD = "s5'.improve.history";
export const Q_REVIEW_LATEST_METHOD = "s5'.improve.q_review.latest";
export const REVIEW_SUBMIT_METHOD = "s5'.review.submit";
export const REVIEW_RESOLVE_METHOD = "s5'.review.resolve";
export const Q_ARTICULATION_ACCEPT_METHOD = "s1'.q_articulation.accept";

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

export interface QReviewEntry {
    readonly targetCoordinate: string;
    readonly qKey: string;
    readonly reasonClass: string;
    readonly priority: number;
    readonly sourceDetector: string;
    readonly vakCf: string;
    readonly vakCp: string;
    readonly pairCompositionAction: string;
    readonly evidenceCount: number;
    readonly evidenceRefs: readonly QReviewEvidenceRef[];
}

export interface QReviewEvidenceRef {
    readonly kind: string;
    readonly uri: string;
    readonly coordinate: string;
    readonly summary: string;
}

export interface QReviewQueue {
    readonly dayId: string;
    readonly graphRevision: number;
    readonly generatedBy: string;
    readonly entries: readonly QReviewEntry[];
}

export interface AutoresearchSnapshot {
    readonly status: AutoresearchStatus;
    readonly candidates: readonly AutoresearchCandidate[];
    readonly qReviewEntries: readonly QReviewEntry[];
    readonly qReviewGraphRevision: number | null;
}

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
}

/** Read the active CF from the profile wire without manufacturing one. */
export function profileVakCf(value: unknown): string | null {
    const root = value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
    if (!root) {
        return null;
    }
    const profile = root.harmonicProfile ?? root.harmonic_profile ?? root;
    const profileRecord = profile && typeof profile === 'object' && !Array.isArray(profile)
        ? (profile as Record<string, unknown>)
        : null;
    const vak = profileRecord?.vakAddress ?? profileRecord?.vak_address;
    if (!vak || typeof vak !== 'object' || Array.isArray(vak)) {
        return null;
    }
    const cf = (vak as Record<string, unknown>).cf;
    return typeof cf === 'string' && cf.trim().length > 0 ? cf : null;
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

/**
 * 26.T26.6 — the `requestedContributionId` prefix `intentTarget()` aliases onto
 * `ide-shell-m0-m5/autoresearch-pane` (`commands/crossLayoutIntent.ts`). The
 * alias and its App-side decode both predate this tranche; NOTHING dispatched
 * one, so the per-capacity entry into this pane existed only as a dropdown the
 * user had to find. The producer now lives on the 26.2 capacity lanes and both
 * ends read this one pair, so the prefix cannot drift apart across the seam.
 */
export const CAPACITY_INTENT_PREFIX = 'capacity:';

/** Compose the contribution id that opens this pane scoped to one capacity. */
export function capacityIntentContributionId(capacity: M5OperationalCapacity): string {
    return `${CAPACITY_INTENT_PREFIX}${capacity}`;
}

/**
 * Decode a `capacity:<id>` contribution id back to a capacity, or null when the
 * id is not a capacity request or names one this vocabulary does not carry. The
 * membership test reads `M5_OPERATIONAL_CAPACITIES`, so a seventh capacity is
 * routable the moment it joins the vocabulary — no second list to update.
 */
export function capacityFromIntentContributionId(
    contributionId: string | null | undefined
): M5OperationalCapacity | null {
    if (typeof contributionId !== 'string' || !contributionId.startsWith(CAPACITY_INTENT_PREFIX)) {
        return null;
    }
    const candidate = contributionId.slice(CAPACITY_INTENT_PREFIX.length);
    return CAPACITY_IDS.has(candidate) ? (candidate as M5OperationalCapacity) : null;
}

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

export function parseQReviewQueue(value: unknown): QReviewQueue {
    const raw = record(value, 'QReview queue');
    if (!Array.isArray(raw.entries)) {
        throw new Error('QReview queue entries must be an array');
    }
    return Object.freeze({
        dayId: nonBlank(raw.day_id, 'QReview queue day_id'),
        graphRevision: finiteInteger(raw.graph_revision, 'QReview queue graph_revision'),
        generatedBy: nonBlank(raw.generated_by, 'QReview queue generated_by'),
        entries: Object.freeze(
            raw.entries.map((value, index) => {
                const entry = record(value, `QReview queue entry ${index}`);
                if (!Array.isArray(entry.evidence_refs)) {
                    throw new Error(`QReview queue entry ${index} evidence_refs must be an array`);
                }
                const surface = record(entry.review_surface, `QReview queue entry ${index} review_surface`);
                const evidenceRefs = Object.freeze(
                    entry.evidence_refs.map((evidence, evidenceIndex) => {
                        const item = record(evidence, `QReview queue entry ${index} evidence ref ${evidenceIndex}`);
                        return Object.freeze({
                            kind: nonBlank(item.kind, `QReview queue entry ${index} evidence ref ${evidenceIndex} kind`),
                            uri: nonBlank(item.uri, `QReview queue entry ${index} evidence ref ${evidenceIndex} uri`),
                            coordinate: nonBlank(
                                item.coordinate,
                                `QReview queue entry ${index} evidence ref ${evidenceIndex} coordinate`
                            ),
                            summary: nonBlank(
                                item.summary,
                                `QReview queue entry ${index} evidence ref ${evidenceIndex} summary`
                            )
                        });
                    })
                );
                return Object.freeze({
                    targetCoordinate: nonBlank(entry.target_coordinate, `QReview queue entry ${index} target_coordinate`),
                    qKey: nonBlank(entry.q_key, `QReview queue entry ${index} q_key`),
                    reasonClass: nonBlank(entry.reason_class, `QReview queue entry ${index} reason_class`),
                    priority: finiteInteger(entry.priority, `QReview queue entry ${index} priority`),
                    sourceDetector: nonBlank(entry.source_detector, `QReview queue entry ${index} source_detector`),
                    vakCf: nonBlank(surface.vak_cf, `QReview queue entry ${index} review_surface vak_cf`),
                    vakCp: nonBlank(surface.vak_cp, `QReview queue entry ${index} review_surface vak_cp`),
                    pairCompositionAction: nonBlank(
                        surface.pair_composition_action,
                        `QReview queue entry ${index} review_surface pair_composition_action`
                    ),
                    evidenceCount: evidenceRefs.length,
                    evidenceRefs
                });
            })
        )
    });
}
