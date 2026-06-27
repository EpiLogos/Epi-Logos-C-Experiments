// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 (Parashakti vibrational web) reading the Archetype-5
//                   wave-behaviour states through the M0 MonoPoly dialectic
//                   (#0-3-8) — the mono↔poly oscillation that decides whether the
//                   live 72-fold resonance stands as a single antinode or breaks
//                   into a polymodal Chladni lattice.
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser component)
//   Position (#20): 23.20 — Cymatic MonoPoly engine (drives CymaticChladniSurface
//                   23.4 behaviour-state from the live 72-fold resonance).
//   Actualises:     a profile-tick-driven wave-behaviour classifier. The live
//                   `address72` (from the profile bus) is projected through the
//                   kernel-bridge into the DET codon (M2_TO_M3_CYMATIC_PROJECTION)
//                   and its causal resonance fan-out (M2_CAUSAL_RESONANCE_MASKS);
//                   the published behaviour state classifies the plate into one
//                   of four Track-37 MonoPoly states, mapped onto the six-cell
//                   Archetype-5 visual ribbon (#0..#5),
//                   which is then stamped onto CymaticChladniSurface as its
//                   behaviour-state.
//   Public surface: CymaticMonoPolyEngine, buildCymaticMonoPolyModel, the
//                   WAVE_BEHAVIOUR_STATES table, the CymaticMonoPolyStateProjection /
//                   M2CymaticMonoPolyStateProjector / M2MonoPolyBridge typed contract,
//                   the WaveBehaviourState / MonoPolyClassification / Cymatic
//                   MonoPolyModel view model, and the layout invariants.
//   Does NOT own:   the projection law. M2_TO_M3_CYMATIC_PROJECTION[72] (the 72→64
//                   DET) and M2_CAUSAL_RESONANCE_MASKS[36] (the O(1) cross-weave)
//                   live in C (m2.h / m2.c) and are surfaced ONLY through
//                   `kernelBridge.m2.cymaticMonoPolyState(address72)`. This engine
//                   NEVER recomputes the projection or the resonance state; it
//                   reads the published projection and folds breadth into a state.
//                   It also does NOT own the plate render itself — that is
//                   CymaticChladniSurface (23.4); this engine only drives its
//                   behaviour-state.
//   Cross-links:    CymaticChladniSurface (23.4), CymaticTransport (tick cache),
//                   EpogdoonBridgeEngine (the 72→64 descent), MefGrid72Component
//                   (the 84-state MEF landscape), m2.h DET + causal-resonance.
//   Contract:       kernelBridge.m2.cymaticMonoPolyState(address72) →
//                   { behaviourState, activeToneCount, mutualResonance,
//                     projection64 }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { MonoPolyState } from '../../../../../shared/mono-poly-state';
import type { M2CymaticFrame, M2PrimeMeaningPacket } from '../../common/meaning-packet';
import type { M2KleinFlipPhase as M2MonoPolyKleinFlipPhase } from './klein-phase';
import { CymaticChladniSurface } from './CymaticChladniSurface';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from './ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every M2 vibrational address resolves here. */
export const MONOPOLY_M2_ADDRESS_COUNT = 72;

/** The 36 base MEF conditions carried by the causal-resonance cross-weave. */
export const MONOPOLY_RESONANCE_CONDITION_COUNT = 36;

/** The Mahamaya 64-Invariant — the uint64_t codon space the DET projects into. */
export const MONOPOLY_M3_CODON_COUNT = 64;

/**
 * Each `M2_CAUSAL_RESONANCE_MASKS[k]` resonates with exactly six conditions
 * (popcount 6 — the position repeated across all six QL slots). This is the
 * maximum poly-modal fan-out of the live resonance, hence the dialectic's span.
 */
export const MONOPOLY_RESONANCE_FANOUT = 6;

/** Six Archetype-5 wave-behaviour states (#0..#5) — the MonoPoly dialectic arc. */
export const WAVE_BEHAVIOUR_STATE_COUNT = 6;

/** The M0 MonoPoly dialectic coordinate — the mono↔poly oscillation's ground. */
export const MONOPOLY_DIALECTIC_COORDINATE = '#0-3-8' as const;

/** Provenance source-field for the MonoPoly classification (routes to DET authority). */
export const M2_MONOPOLY_PROVENANCE_FIELD = 'detEvidence.cymaticMonoPoly';

/** The single authority this engine reads through — never a local computation. */
export const MONOPOLY_RESONANCE_SOURCE = 'kernelBridge.m2.cymaticMonoPolyState(address72)' as const;

/** Saturating reference (Hz) mapping `audio_octet[0]` magnitude → bounded coherence. */
export const MONOPOLY_COHERENCE_SATURATION_HZ = 128;

// ── Bridge contract (the ONLY typed projection this engine consumes) ─────────

/**
 * The typed projection returned by `kernelBridge.m2.cymaticMonoPolyState(address72)`.
 * Mirrors the kernel bridge's C-LUT-backed surface: the four-state MonoPoly
 * behaviour vocabulary, active tone count, normalised mutual resonance, and DET
 * codon projection.
 */
export type CymaticMonoPolyBehaviourState = MonoPolyState;

export interface CymaticMonoPolyStateProjection {
    readonly behaviourState: CymaticMonoPolyBehaviourState;
    readonly activeToneCount: number;
    readonly mutualResonance: number;
    readonly projection64: number;
}

/** A function projecting a 72-address into the typed resonance projection. */
export type M2CymaticMonoPolyStateProjector = (address72: number) => CymaticMonoPolyStateProjection;

/** The slice of the kernel-bridge this engine depends on. */
export interface M2MonoPolyBridge {
    readonly m2: {
        readonly cymaticMonoPolyState: M2CymaticMonoPolyStateProjector;
    };
}

// ── Wave-behaviour states (the Archetype-5 dialectic table; pure constants) ──

/** One Archetype-5 wave-behaviour state along the mono↔poly dialectic. */
export interface WaveBehaviourState {
    /** State index 0..5 — the QL position #0..#5. */
    readonly index: number;
    /** Raw archetype the state actualises (#0..#5). */
    readonly archetype: string;
    /** Stable slug — stamped onto CymaticChladniSurface as its behaviour-state. */
    readonly key: string;
    /** Human label. */
    readonly label: string;
    /** Pole of the dialectic this state sits at. */
    readonly pole: 'mono' | 'bipolar' | 'poly';
    /** Short glyph rendered in the dialectic ribbon. */
    readonly glyph: string;
    /** State hue — warm (mono) → cool (poly) across the arc. */
    readonly hue: string;
    /** One-line description of the plate's wave behaviour in this state. */
    readonly behaviour: string;
}

/**
 * The six wave-behaviour states. Breadth of superposed codons (1..6) classifies
 * the live resonance: a single codon is the pure monopole ground (#0); the
 * fan-out peaks at the #4 lemniscate turbulence before the #5 Klein/Möbius
 * integral closure folds the whole plate into one coherent resonance.
 */
export const WAVE_BEHAVIOUR_STATES: readonly WaveBehaviourState[] = Object.freeze([
    Object.freeze({
        index: 0,
        archetype: '#0',
        key: 'monopole-ground',
        label: 'Monopole ground',
        pole: 'mono',
        glyph: '•',
        hue: '#c5564b',
        behaviour: 'a single quiescent antinode — the seed monopole'
    }),
    Object.freeze({
        index: 1,
        archetype: '#1',
        key: 'mono-standing',
        label: 'Mono standing wave',
        pole: 'mono',
        glyph: '◍',
        hue: '#cf7a55',
        behaviour: 'one established standing mode, a clean nodal ring'
    }),
    Object.freeze({
        index: 2,
        archetype: '#2',
        key: 'bipolar-beat',
        label: 'Bipolar beat',
        pole: 'bipolar',
        glyph: '∾',
        hue: '#c9a14e',
        behaviour: 'two poles beating — interference between two modes'
    }),
    Object.freeze({
        index: 3,
        archetype: '#3',
        key: 'poly-lattice',
        label: 'Poly lattice',
        pole: 'poly',
        glyph: '⊞',
        hue: '#7fae6a',
        behaviour: 'a stable poly-modal Chladni lattice of nodal lines'
    }),
    Object.freeze({
        index: 4,
        archetype: '#4',
        key: 'turbulent-fold',
        label: 'Turbulent fold',
        pole: 'poly',
        glyph: '∞',
        hue: '#5fa9b8',
        behaviour: 'lemniscate turbulence — chaotic poly-modal superposition'
    }),
    Object.freeze({
        index: 5,
        archetype: '#5',
        key: 'integral-resonance',
        label: 'Integral resonance',
        pole: 'poly',
        glyph: '◉',
        hue: '#6f7ec8',
        behaviour: 'whole-plate coherent resonance — the Klein/Möbius closure'
    })
]);

// ── View model ───────────────────────────────────────────────────────────────

/** The classified wave-behaviour for the live (or focused) 72-address. */
export interface MonoPolyClassification {
    /** Source M2 vibrational address (0..71). */
    readonly address72: number;
    /** Track-37 four-state vocabulary. */
    readonly behaviourState: CymaticMonoPolyBehaviourState;
    /** DET codon (0..63) for the address. */
    readonly projection64: number;
    /** Active tones reported by the kernel bridge (1..fan-out). */
    readonly activeToneCount: number;
    /** Kernel-reported mutual resonance (0..1). */
    readonly mutualResonance: number;
    /** Effective wave-behaviour state index after any Klein inversion (0..5). */
    readonly stateIndex: number;
    /** The wave-behaviour state descriptor. */
    readonly state: WaveBehaviourState;
    /** Normalised poly-ratio (0 = pure mono, 1 = full poly). */
    readonly polyRatio: number;
    /** Coherence (0..1) from `audio_octet[0]` — how hard the state is driven. */
    readonly coherence: number;
    /** True when the Klein-flip inverted the dialectic (mono↔poly reflected). */
    readonly kleinInverted: boolean;
}

export interface CymaticMonoPolyModel {
    /** The classification for the live/focused address, or null when bridge-down. */
    readonly classification: MonoPolyClassification | null;
    /** The six wave-behaviour states (for the dialectic ribbon). */
    readonly states: readonly WaveBehaviourState[];
    /** The live descending M2 address under the current profile-tick. */
    readonly activeAddress72: number;
    /** The active wave-behaviour state index, or null when bridge-down. */
    readonly activeStateIndex: number | null;
    /** The effective Klein-flip phase driving the mono↔poly inversion. */
    readonly kleinFlipPhase: M2MonoPolyKleinFlipPhase;
    /** True once the bridge surfaced a well-formed resonance projection. */
    readonly bridgeReady: boolean;
    /** The profile-tick that produced this classification, if known. */
    readonly tick: number | null;
}

export interface CymaticMonoPolyEngineProps {
    /** The kernel-bridge slice. When absent the engine renders a bridge-down state. */
    readonly kernelBridge?: M2MonoPolyBridge | null;
    /** Meaning packet — supplies the live cymatic frame + provenance + address. */
    readonly packet?: Pick<
        M2PrimeMeaningPacket,
        'cymaticSignature' | 'address72' | 'meaningPacketProvenanceFor'
    > | null;
    /** The live M2 address (overrides the packet address when provided). */
    readonly activeAddress72?: number | null;
    /** Live `audio_octet[0]` magnitude driving the coherence reading. */
    readonly audioOctet0?: number | null;
    /** The Klein-flip phase reflecting the mono↔poly dialectic. */
    readonly kleinFlipPhase?: M2MonoPolyKleinFlipPhase | null;
    /** Live profile-tick driving the classification (falls back to the address). */
    readonly tick?: number | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    /** Optional render size for the driven CymaticChladniSurface. */
    readonly surfaceWidth?: number;
    readonly surfaceHeight?: number;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected resonance projection) ───────

export function buildCymaticMonoPolyModel(input: {
    readonly kernelBridge?: M2MonoPolyBridge | null;
    readonly activeAddress72?: number | null;
    readonly audioOctet0?: number | null;
    readonly kleinFlipPhase?: M2MonoPolyKleinFlipPhase | null;
    readonly tick?: number | null;
}): CymaticMonoPolyModel {
    const tick = normalizeTick(input.tick);
    const activeAddress72 = resolveActiveAddress(input.activeAddress72, tick);
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const inverted = kleinFlipPhase === 'inverted';
    const coherence = coherenceFromAudio(input.audioOctet0);
    const projector = input.kernelBridge?.m2?.cymaticMonoPolyState ?? null;

    const projection = projector ? safeProject(projector, activeAddress72) : null;
    if (!projection) {
        return Object.freeze({
            classification: null,
            states: WAVE_BEHAVIOUR_STATES,
            activeAddress72,
            activeStateIndex: null,
            kleinFlipPhase,
            bridgeReady: false,
            tick
        });
    }

    const classification = classifyResonance(projection, activeAddress72, {
        coherence,
        inverted
    });

    return Object.freeze({
        classification,
        states: WAVE_BEHAVIOUR_STATES,
        activeAddress72,
        activeStateIndex: classification.stateIndex,
        kleinFlipPhase,
        bridgeReady: true,
        tick
    });
}

/**
 * Fold the published resonance projection into a wave-behaviour state. The breadth
 * of distinct superposed codons (1..fan-out) is the mono↔poly axis; a Klein-flip
 * reflects the dialectic (mono↔poly turned inside-out). No projection arithmetic
 * happens here — only counting of what the bridge already published.
 */
export function classifyResonance(
    projection: CymaticMonoPolyStateProjection,
    address72: number,
    options: { readonly coherence: number; readonly inverted: boolean }
): MonoPolyClassification {
    const projection64 = clampCodon(projection.projection64);
    const activeToneCount = clampToneCount(projection.activeToneCount);
    const mutualResonance = clampUnit(projection.mutualResonance);

    // Breadth 1..fan-out → raw state index 0..5; a Klein-flip reflects it.
    const rawIndex = clampStateIndex(activeToneCount - 1);
    const stateIndex = options.inverted ? WAVE_BEHAVIOUR_STATE_COUNT - 1 - rawIndex : rawIndex;
    const state = WAVE_BEHAVIOUR_STATES[stateIndex];
    const polyRatio = mutualResonance;

    return Object.freeze({
        address72: clampAddress72(address72),
        behaviourState: normalizeBehaviourState(projection.behaviourState),
        projection64,
        activeToneCount,
        mutualResonance,
        stateIndex,
        state,
        polyRatio: options.inverted ? 1 - polyRatio : polyRatio,
        coherence: clampUnit(options.coherence),
        kleinInverted: options.inverted
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function CymaticMonoPolyEngine(props: CymaticMonoPolyEngineProps): React.ReactElement {
    const resolvedAddress =
        props.activeAddress72 ?? props.packet?.address72 ?? null;

    const model = React.useMemo(
        () =>
            buildCymaticMonoPolyModel({
                kernelBridge: props.kernelBridge ?? null,
                activeAddress72: resolvedAddress,
                audioOctet0: props.audioOctet0 ?? null,
                kleinFlipPhase: props.kleinFlipPhase ?? null,
                tick: props.tick ?? null
            }),
        [props.kernelBridge, resolvedAddress, props.audioOctet0, props.kleinFlipPhase, props.tick]
    );

    // Interactive inspection — the focused state defaults to the live classification
    // but the user may pin any state in the dialectic ribbon to read its behaviour.
    const [pinnedStateIndex, setPinnedStateIndex] = React.useState<number | null>(null);
    const focusedStateIndex = pinnedStateIndex ?? model.activeStateIndex ?? 0;
    const focusedState = model.states[focusedStateIndex] ?? null;

    const frame: M2CymaticFrame | null = props.packet?.cymaticSignature ?? null;
    const className = ['m2-cymatic-monopoly-engine', props.className].filter(Boolean).join(' ');

    if (!model.bridgeReady) {
        return (
            <section
                className={className}
                aria-label="Cymatic MonoPoly engine"
                data-cymatic-monopoly-engine
                data-bridge-state="bridge-unavailable"
                data-active-address72={model.activeAddress72}
            >
                <p className="mext-widget-empty" data-pending-field={MONOPOLY_RESONANCE_SOURCE}>
                    The MonoPoly engine is waiting for {MONOPOLY_RESONANCE_SOURCE}.
                </p>
            </section>
        );
    }

    const classification = model.classification as MonoPolyClassification;

    return (
        <section
            className={className}
            aria-label="Cymatic MonoPoly engine"
            data-cymatic-monopoly-engine
            data-bridge-state="ready"
            data-dialectic-coordinate={MONOPOLY_DIALECTIC_COORDINATE}
            data-active-address72={model.activeAddress72}
            data-active-tick={model.tick ?? ''}
            data-klein-phase={model.kleinFlipPhase}
            data-wave-behaviour={classification.state.key}
            data-state-index={classification.stateIndex}
            data-poly-ratio={classification.polyRatio.toFixed(4)}
        >
            <header className="m2-cymatic-monopoly-engine__header">
                <h4>MonoPoly engine — wave behaviour</h4>
                <span className="m2-cymatic-monopoly-engine__dialectic">{MONOPOLY_DIALECTIC_COORDINATE} mono ↔ poly</span>
                <span
                    className="m2-cymatic-monopoly-engine__state-tag"
                    data-wave-behaviour={classification.state.key}
                    data-pole={classification.state.pole}
                >
                    {classification.state.archetype} {classification.state.label}
                </span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_MONOPOLY_PROVENANCE_FIELD}
                        readiness={props.readiness ?? 'ready_public_current'}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_MONOPOLY_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            <DialecticRibbon
                states={model.states}
                activeStateIndex={model.activeStateIndex}
                focusedStateIndex={focusedStateIndex}
                onSelect={setPinnedStateIndex}
            />

            {frame && (
                <div
                    className="m2-cymatic-monopoly-engine__surface"
                    data-driven-surface
                    data-wave-behaviour={classification.state.key}
                    data-state-index={classification.stateIndex}
                    data-coherence={classification.coherence.toFixed(4)}
                >
                    <CymaticChladniSurface
                        frame={frame}
                        tick={model.tick}
                        width={props.surfaceWidth}
                        height={props.surfaceHeight}
                        className={`m2-cymatic-monopoly-surface--${classification.state.key}`}
                    />
                </div>
            )}

            <MonoPolyInspector
                classification={classification}
                focusedState={focusedState}
                pinned={pinnedStateIndex !== null}
                onClear={() => setPinnedStateIndex(null)}
            />
        </section>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function DialecticRibbon({
    states,
    activeStateIndex,
    focusedStateIndex,
    onSelect
}: {
    readonly states: readonly WaveBehaviourState[];
    readonly activeStateIndex: number | null;
    readonly focusedStateIndex: number;
    readonly onSelect: (index: number) => void;
}): React.ReactElement {
    return (
        <ol
            className="m2-cymatic-monopoly-engine__ribbon"
            aria-label="Archetype-5 wave-behaviour states (mono ↔ poly dialectic)"
            data-dialectic-ribbon
        >
            {states.map(state => {
                const isActive = state.index === activeStateIndex;
                return (
                    <li
                        key={state.key}
                        className="m2-cymatic-monopoly-engine__ribbon-cell"
                        data-state-cell
                        data-state-index={state.index}
                        data-wave-behaviour={state.key}
                        data-pole={state.pole}
                        data-active={isActive ? 'true' : 'false'}
                    >
                        <button
                            type="button"
                            className="m2-cymatic-monopoly-engine__ribbon-button"
                            aria-pressed={state.index === focusedStateIndex}
                            aria-label={`${state.archetype} ${state.label} — ${state.behaviour}`}
                            onClick={() => onSelect(state.index)}
                            style={{
                                borderColor: isActive ? state.hue : 'transparent',
                                color: isActive ? '#f8fafc' : '#9aa6b2'
                            }}
                        >
                            <span className="m2-cymatic-monopoly-engine__ribbon-glyph" aria-hidden="true">
                                {state.glyph}
                            </span>
                            <span className="m2-cymatic-monopoly-engine__ribbon-archetype">{state.archetype}</span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}

function MonoPolyInspector({
    classification,
    focusedState,
    pinned,
    onClear
}: {
    readonly classification: MonoPolyClassification;
    readonly focusedState: WaveBehaviourState | null;
    readonly pinned: boolean;
    readonly onClear: () => void;
}): React.ReactElement {
    const state = focusedState ?? classification.state;
    const showingLive = state.index === classification.stateIndex;
    return (
        <dl
            className="m2-cymatic-monopoly-engine__inspector"
            data-monopoly-inspector
            data-state-index={state.index}
            data-wave-behaviour={state.key}
            data-showing-live={showingLive ? 'true' : 'false'}
        >
            <dt>Wave behaviour</dt>
            <dd>
                {state.archetype} {state.label} — {state.behaviour}
            </dd>
            <dt>M2 vibrational address</dt>
            <dd>#2·{classification.address72}</dd>
            <dt>DET codon</dt>
            <dd>#3·{classification.projection64}</dd>
            <dt>Causal resonance</dt>
            <dd>
                {classification.behaviourState} · {classification.activeToneCount} active tones ·{' '}
                {(classification.mutualResonance * 100).toFixed(0)}% mutual
            </dd>
            <dt>Mono ↔ poly</dt>
            <dd>
                {(classification.polyRatio * 100).toFixed(0)}% poly
                {classification.kleinInverted ? ' (Klein-inverted)' : ''}
            </dd>
            <dt>Coherence (audio_octet[0])</dt>
            <dd>{(classification.coherence * 100).toFixed(0)}%</dd>
            <dt>Projection source</dt>
            <dd>{MONOPOLY_RESONANCE_SOURCE}</dd>
            {pinned && (
                <dd>
                    <button
                        type="button"
                        className="m2-cymatic-monopoly-engine__inspector-clear"
                        onClick={onClear}
                        aria-label="Resume following the live wave behaviour"
                    >
                        Follow live behaviour
                    </button>
                </dd>
            )}
        </dl>
    );
}

// ── Normalisers (bounds + counting only; no projection arithmetic) ───────────

function safeProject(
    projector: M2CymaticMonoPolyStateProjector,
    address72: number
): CymaticMonoPolyStateProjection | null {
    try {
        const projection = projector(address72);
        if (
            !projection ||
            typeof projection.behaviourState !== 'string' ||
            typeof projection.activeToneCount !== 'number' ||
            typeof projection.mutualResonance !== 'number' ||
            typeof projection.projection64 !== 'number'
        ) {
            return null;
        }
        return projection;
    } catch {
        return null;
    }
}

function resolveActiveAddress(activeAddress72: number | null | undefined, tick: number | null): number {
    if (typeof activeAddress72 === 'number' && Number.isFinite(activeAddress72)) {
        return clampAddress72(activeAddress72);
    }
    if (tick !== null) {
        return clampAddress72(tick);
    }
    return 0;
}

function coherenceFromAudio(audioOctet0: number | null | undefined): number {
    if (typeof audioOctet0 !== 'number' || !Number.isFinite(audioOctet0)) {
        return 0;
    }
    const magnitude = Math.abs(audioOctet0);
    // Saturating curve → bounded 0..1; deterministic and scale-tolerant.
    return clampUnit(magnitude / (magnitude + MONOPOLY_COHERENCE_SATURATION_HZ));
}

function normalizeKleinPhase(phase: M2MonoPolyKleinFlipPhase | null | undefined): M2MonoPolyKleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function normalizeTick(tick: number | null | undefined): number | null {
    return typeof tick === 'number' && Number.isFinite(tick) ? Math.trunc(tick) : null;
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % MONOPOLY_M2_ADDRESS_COUNT) + MONOPOLY_M2_ADDRESS_COUNT) % MONOPOLY_M2_ADDRESS_COUNT;
}

function clampCodon(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % MONOPOLY_M3_CODON_COUNT) + MONOPOLY_M3_CODON_COUNT) % MONOPOLY_M3_CODON_COUNT;
}

function clampToneCount(value: number): number {
    if (!Number.isFinite(value)) {
        return 1;
    }
    return Math.min(MONOPOLY_RESONANCE_FANOUT, Math.max(1, Math.trunc(value)));
}

function clampStateIndex(value: number): number {
    const rounded = Math.trunc(value);
    return Math.min(WAVE_BEHAVIOUR_STATE_COUNT - 1, Math.max(0, rounded));
}

function clampUnit(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, value));
}

function normalizeBehaviourState(value: string): CymaticMonoPolyBehaviourState {
    return value === 'mono' ||
        value === 'actually-many' ||
        value === 'actualising-one' ||
        value === 'monopoly'
        ? value
        : 'mono';
}

export default CymaticMonoPolyEngine;
