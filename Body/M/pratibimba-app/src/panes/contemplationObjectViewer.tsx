/**
 * Coordinate: M' M5' (contemplation-object reader, rerun 26.T26.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5 protected session-close projection viewer
 * Actualises: the active-carrier reader for the PASU-scoped, aggregate-only
 *   contemplation projection returned by `nara.session_close.contemplation.read`.
 * Public surface: ContemplationObjectViewer, readContemplationObjectProjection.
 * Does NOT own: session-close persistence, S3 contemplation composition, or
 *   raw contemplation evidence.
 * Contract: [[M5'-SPEC]] + [[S0-SPEC]] + rerun [[26-m5-epii-frontend-deep]] 26.12.
 */

const TOP_LEVEL_KEYS = new Set([
    'session_id',
    'close_ref',
    'contemplation_ref',
    'triplet',
    'provenance'
]);
const TRIPLET_KEYS = new Set(['llm', 'ebm', 'verifier']);
const LLM_KEYS = new Set([
    'position',
    'loaded_agent_count',
    'psyche_anchor_coherent',
    'matched_anchor_codon_count'
]);
const EBM_KEYS = new Set(['position', 'gradient_magnitude', 'gauge_trio_coherent', 'coherence_scores']);
const COHERENCE_KEYS = new Set(['square_0_5', 'square_1_4', 'square_2_3']);
const VERIFIER_KEYS = new Set([
    'position',
    'virtue_witness_vector',
    'coherence_score',
    'arch9_wholeness',
    'syntax_layers_witnessed'
]);
const PROVENANCE_KEYS = new Set([
    'privacy_class',
    'source_method',
    'persisted_at',
    'persisted_at_ms',
    'pasu_scoped'
]);
const FORBIDDEN_KEYS = new Set([
    'q_nara',
    'trajectory',
    'actual_resonance',
    'unsatisfied_constraints',
    'recognition_state',
    'wisdom_delta',
    'symbolic_round_trips',
    'graphiti_relation',
    'body',
    'protein_handle'
]);

export type ContemplationObjectProjectionRead =
    | {
          readonly state: 'ready';
          readonly sessionId: string;
          readonly closeRef: string;
          readonly contemplationRef: string;
          readonly llm: {
              readonly position: string;
              readonly loadedAgentCount: number;
              readonly psycheAnchorCoherent: boolean;
              readonly matchedAnchorCodonCount: number;
          };
          readonly ebm: {
              readonly position: string;
              readonly gradientMagnitude: number;
              readonly gaugeTrioCoherent: boolean;
              readonly coherenceScores: readonly [number, number, number];
          };
          readonly verifier: {
              readonly position: string;
              readonly witnessBits: readonly boolean[];
              readonly witnessCount: number;
              readonly coherenceScore: number;
              readonly arch9Wholeness: boolean;
              readonly syntaxLayersWitnessed: boolean;
          };
          readonly persistedAt: string;
      }
    | { readonly state: 'blocked'; readonly reason: string };

function objectValue(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function rejectsUnknownKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>, label: string): string | null {
    const key = Object.keys(value).find(candidate => !allowed.has(candidate));
    return key ? `unexpected ${label} field ${key}` : null;
}

function finiteUnit(value: unknown, label: string): number | string {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
        ? value
        : `${label} must be a finite value from 0 to 1`;
}

function position(value: unknown, label: string): string | string {
    return typeof value === 'string' && /^[0-5]'$/.test(value)
        ? value
        : `${label} must be a canonical prime position`;
}

function boundedCount(value: unknown, label: string): number | string {
    return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= 65535
        ? (value as number)
        : `${label} must be a bounded unsigned count`;
}

export function readContemplationObjectProjection(raw: unknown): ContemplationObjectProjectionRead {
    const projection = objectValue(raw);
    if (!projection) return { state: 'blocked', reason: 'contemplation projection must be an object' };
    for (const key of Object.keys(projection)) {
        if (FORBIDDEN_KEYS.has(key)) {
            return { state: 'blocked', reason: `forbidden contemplation payload field ${key}` };
        }
    }
    const unknownTopLevel = rejectsUnknownKeys(projection, TOP_LEVEL_KEYS, 'contemplation projection');
    if (unknownTopLevel) return { state: 'blocked', reason: unknownTopLevel };
    if (typeof projection.session_id !== 'string' || projection.session_id.trim().length === 0) {
        return { state: 'blocked', reason: 'session_id must be a non-empty string' };
    }
    if (typeof projection.close_ref !== 'string' || !/^close-[A-Za-z0-9_-]+$/.test(projection.close_ref)) {
        return { state: 'blocked', reason: 'close_ref must be an opaque close reference' };
    }
    if (
        typeof projection.contemplation_ref !== 'string' ||
        !/^contemplation-[A-Za-z0-9_-]+$/.test(projection.contemplation_ref)
    ) {
        return { state: 'blocked', reason: 'contemplation_ref must be an opaque contemplation reference' };
    }

    const triplet = objectValue(projection.triplet);
    if (!triplet) return { state: 'blocked', reason: 'triplet must be an object' };
    const unknownTriplet = rejectsUnknownKeys(triplet, TRIPLET_KEYS, 'triplet');
    if (unknownTriplet) return { state: 'blocked', reason: unknownTriplet };
    const llm = objectValue(triplet.llm);
    const ebm = objectValue(triplet.ebm);
    const verifier = objectValue(triplet.verifier);
    if (!llm || !ebm || !verifier) return { state: 'blocked', reason: 'triplet must include llm, ebm, and verifier' };
    const unknownLlm = rejectsUnknownKeys(llm, LLM_KEYS, 'llm');
    const unknownEbm = rejectsUnknownKeys(ebm, EBM_KEYS, 'ebm');
    const unknownVerifier = rejectsUnknownKeys(verifier, VERIFIER_KEYS, 'verifier');
    if (unknownLlm ?? unknownEbm ?? unknownVerifier) {
        return { state: 'blocked', reason: unknownLlm ?? unknownEbm ?? unknownVerifier ?? 'invalid triplet' };
    }
    const llmPosition = position(llm.position, 'llm.position');
    const ebmPosition = position(ebm.position, 'ebm.position');
    const verifierPosition = position(verifier.position, 'verifier.position');
    const loadedAgentCount = boundedCount(llm.loaded_agent_count, 'llm.loaded_agent_count');
    const codonCount = boundedCount(llm.matched_anchor_codon_count, 'llm.matched_anchor_codon_count');
    if (
        typeof llmPosition === 'string' && llmPosition.startsWith('llm.') ||
        typeof ebmPosition === 'string' && ebmPosition.startsWith('ebm.') ||
        typeof verifierPosition === 'string' && verifierPosition.startsWith('verifier.') ||
        typeof loadedAgentCount === 'string' ||
        typeof codonCount === 'string' ||
        typeof llm.psyche_anchor_coherent !== 'boolean'
    ) {
        return {
            state: 'blocked',
            reason: typeof llmPosition === 'string' && llmPosition.startsWith('llm.')
                ? llmPosition
                : typeof ebmPosition === 'string' && ebmPosition.startsWith('ebm.')
                    ? ebmPosition
                    : typeof verifierPosition === 'string' && verifierPosition.startsWith('verifier.')
                        ? verifierPosition
                        : typeof loadedAgentCount === 'string'
                            ? loadedAgentCount
                            : typeof codonCount === 'string'
                                ? codonCount
                                : 'llm.psyche_anchor_coherent must be boolean'
        };
    }

    const coherence = objectValue(ebm.coherence_scores);
    if (!coherence) return { state: 'blocked', reason: 'ebm.coherence_scores must be an object' };
    const unknownCoherence = rejectsUnknownKeys(coherence, COHERENCE_KEYS, 'ebm.coherence_scores');
    if (unknownCoherence) return { state: 'blocked', reason: unknownCoherence };
    const gradientMagnitude = ebm.gradient_magnitude;
    if (typeof gradientMagnitude !== 'number' || !Number.isFinite(gradientMagnitude) || gradientMagnitude < 0) {
        return { state: 'blocked', reason: 'ebm.gradient_magnitude must be finite and non-negative' };
    }
    if (typeof ebm.gauge_trio_coherent !== 'boolean') {
        return { state: 'blocked', reason: 'ebm.gauge_trio_coherent must be boolean' };
    }
    const scores = [
        finiteUnit(coherence.square_0_5, 'ebm.coherence_scores.square_0_5'),
        finiteUnit(coherence.square_1_4, 'ebm.coherence_scores.square_1_4'),
        finiteUnit(coherence.square_2_3, 'ebm.coherence_scores.square_2_3')
    ];
    if (scores.some(score => typeof score === 'string')) {
        return { state: 'blocked', reason: scores.find(score => typeof score === 'string') as string };
    }
    if (!Array.isArray(verifier.virtue_witness_vector) || verifier.virtue_witness_vector.length !== 9 || verifier.virtue_witness_vector.some(value => typeof value !== 'boolean')) {
        return { state: 'blocked', reason: 'verifier.virtue_witness_vector must be a nine-position boolean array' };
    }
    const coherenceScore = finiteUnit(verifier.coherence_score, 'verifier.coherence_score');
    if (typeof coherenceScore === 'string' || typeof verifier.arch9_wholeness !== 'boolean' || typeof verifier.syntax_layers_witnessed !== 'boolean') {
        return { state: 'blocked', reason: typeof coherenceScore === 'string' ? coherenceScore : 'verifier flags must be boolean' };
    }
    const provenance = objectValue(projection.provenance);
    if (!provenance || rejectsUnknownKeys(provenance, PROVENANCE_KEYS, 'provenance')) {
        return { state: 'blocked', reason: 'provenance must be a known protected-local record' };
    }
    if (
        provenance.privacy_class !== 'protected_local' ||
        provenance.source_method !== 'nara.session_close' ||
        provenance.pasu_scoped !== true ||
        typeof provenance.persisted_at !== 'string' ||
        Number.isNaN(Date.parse(provenance.persisted_at)) ||
        !Number.isSafeInteger(provenance.persisted_at_ms)
    ) {
        return { state: 'blocked', reason: 'provenance must prove protected-local PASU-scoped persistence' };
    }
    const witnessBits = Object.freeze([...verifier.virtue_witness_vector] as boolean[]);
    return {
        state: 'ready',
        sessionId: projection.session_id,
        closeRef: projection.close_ref,
        contemplationRef: projection.contemplation_ref,
        llm: {
            position: llmPosition,
            loadedAgentCount,
            psycheAnchorCoherent: llm.psyche_anchor_coherent,
            matchedAnchorCodonCount: codonCount
        },
        ebm: {
            position: ebmPosition,
            gradientMagnitude,
            gaugeTrioCoherent: ebm.gauge_trio_coherent,
            coherenceScores: scores as [number, number, number]
        },
        verifier: {
            position: verifierPosition,
            witnessBits,
            witnessCount: witnessBits.filter(Boolean).length,
            coherenceScore,
            arch9Wholeness: verifier.arch9_wholeness,
            syntaxLayersWitnessed: verifier.syntax_layers_witnessed
        },
        persistedAt: provenance.persisted_at
    };
}

export function ContemplationObjectViewer({
    contemplation
}: {
    readonly contemplation: Extract<ContemplationObjectProjectionRead, { state: 'ready' }>;
}) {
    return (
        <section
            className="contemplation-object-viewer"
            data-testid="contemplation-object-viewer"
            data-close-ref={contemplation.closeRef}
            data-contemplation-ref={contemplation.contemplationRef}
        >
            <header>
                <div>
                    <h3>Contemplation object</h3>
                    <p data-testid="contemplation-object-ref">{contemplation.contemplationRef}</p>
                </div>
                <p>{contemplation.persistedAt}</p>
            </header>
            <div className="contemplation-object-grid">
                <article>
                    <h4>{contemplation.llm.position} LLM</h4>
                    <p data-testid="contemplation-object-agent-count">{contemplation.llm.loadedAgentCount} agents</p>
                    <p>{contemplation.llm.psycheAnchorCoherent ? 'Psyche anchor coherent' : 'Psyche anchor unresolved'}</p>
                    <p>{contemplation.llm.matchedAnchorCodonCount} matched codons</p>
                </article>
                <article>
                    <h4>{contemplation.ebm.position} EBM</h4>
                    <p data-testid="contemplation-object-gauge">
                        Gauge trio {contemplation.ebm.gaugeTrioCoherent ? 'coherent' : 'incomplete'}
                    </p>
                    <p>Gradient {contemplation.ebm.gradientMagnitude.toFixed(3)}</p>
                    <p>{contemplation.ebm.coherenceScores.map(score => score.toFixed(2)).join(' | ')}</p>
                </article>
                <article>
                    <h4>{contemplation.verifier.position} Verifier</h4>
                    <p data-testid="contemplation-object-virtue-count">
                        {contemplation.verifier.witnessCount}/9 virtue witnesses
                    </p>
                    <p>{Math.round(contemplation.verifier.coherenceScore * 100)}% coherence</p>
                    <p>{contemplation.verifier.arch9Wholeness ? 'Arch-9 whole' : 'Arch-9 open'}</p>
                </article>
            </div>
        </section>
    );
}
