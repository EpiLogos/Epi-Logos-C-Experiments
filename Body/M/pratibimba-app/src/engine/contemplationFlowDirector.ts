/**
 * Coordinate: M'/29 :: the contemplation flow director (29.T29.9)
 * Residency: Body/M/pratibimba-app/src/engine
 * Position (#n): #5 — Integration; the 4'-5'-0' close read across the personal
 *   composition's three carried slots.
 * Actualises: 29.T29.9 / closes the 19.6 + 19.7 composition path — the
 *   `contemplate_session_close(ContemplationObject) -> wisdom_delta` triplet
 *   read as a DIRECTIVE over the personal 4-5-0 composition: the LLM-Nara
 *   reading on 4'/LEFT, the EBM evaluation on 5'/RIGHT, and the Verifier
 *   R-virtue witness on the 0'/UNDER-LAYER.
 * Public surface: CONTEMPLATION_FLOW_RPCS, CONTEMPLATION_SLOT_POSITIONS,
 *   CONTEMPLATION_UNAVAILABLE, CONTEMPLATION_LIVE_ONLY, ContemplationCloseRead,
 *   ContemplationFlowDirective, readContemplateSessionCloseResponse,
 *   buildContemplationFlowDirective,
 *   buildContemplationFlowDirectiveFromProjection, contemplationSlotsLanded,
 *   emitContemplationComplete, formatContemplationReading.
 * Does NOT own: the contemplation COMPOSITION (S3 `dispatch.rs` composes the
 *   triplet, scores the squares and routes the symbolic questions — all of it
 *   is read verbatim here, never recomputed), the virtue vocabulary
 *   (`panes/m0VirtueWitness.ts`), the highlight vocabulary
 *   (`ui/highlightCategoryRegistry.ts`), the persisted-projection reader
 *   (`panes/m4SessionCloseCeremony.ts`), the three slot renderers
 *   (NaraCanvasEditor / M5RecognitionLayer + M5EbmObservatoryPane /
 *   M0VirtueWitnessPanel), or the event vocabulary
 *   (`composition/compositionEvents.ts`).
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.9.
 *
 * # Not event-mounted, because the event does not exist
 *
 * The brief mounts this flow on an `m5.session.contemplation.complete`
 * observability event "fired by gateway per Track 19.7". No gateway fires it:
 * `EVENT_NAMES` (S3 gateway-contract `protocol.rs`) is
 * `["agent","chat","tick","health","heartbeat"]`, `PORTAL_EVENT_NAMES` carries
 * no contemplation channel, and every occurrence of that literal in the
 * repository sits inside the FROZEN epi-theia tree. The C `m5_execute_mobius_return`
 * cited as its trigger emits nothing at all and is reachable only from two C
 * unit tests. 25.T25.19 already met this same gap on the session-close ceremony
 * and ruled: read the close, do not subscribe to a ceremony that never fires.
 * This follows that ruling — the directive is built from a contemplation
 * RESPONSE, and `composition.contemplation.complete` is what this composition
 * EMITS once its three slots land, not what it waits on.
 *
 * # Which half of this module production actually calls
 *
 * Stated plainly because the file does not make it obvious: production imports
 * `useContemplationFlowDirective` and `formatContemplationReading` only. The
 * LIVE-response half — `readContemplateSessionCloseResponse`,
 * `buildContemplationFlowDirective`, `CONTEMPLATION_FLOW_RPCS.live` — has no
 * production caller, because the carrier has no producer of a
 * `ContemplationObject` to call it with; the loopback close path owns that, and
 * inventing a trajectory app-side to reach the method would be fabricating the
 * session it claims to contemplate. It is not dead code: it is the parser for
 * the response 19.6 actually returns, proven against a REAL spawned gateway in
 * `bridge/gatewayClient.live.test.ts`, and it is what a carrier-side close path
 * would consume the day one exists. Anything else would leave 19.6's own wire
 * unread by the tranche that closes its composition path.
 *
 * # Read verbatim, never re-scored
 *
 * Every number here is the gateway's. The three tritone-square coherences, the
 * gauge-trio verdict, the gradient magnitude and `arch9_wholeness` are all
 * composed in S3 and copied through. 26.1 fixed that law for the EBM surface —
 * square coherence is kernel-owned, read verbatim or pending, never scored
 * locally — and re-deriving `arch9_wholeness` here would be the same mistake
 * the frozen epi-theia director made when it read the Parameśvara witness off
 * `virtueBits[0]` (Love/Peace) while the gateway reads bit 8 (Reality —
 * Completion, VIRTUE_LUT index 8, r_factor 5).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { emitCompositionEvent, type CompositionEvent } from '../composition/compositionEvents';
import type { IntegratedCompositionId } from '../composition/compositionState';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { highlightCategory } from '../ui/highlightCategoryRegistry';
import { M0_VIRTUE_LABELS } from '../panes/m0VirtueWitness';
import { readNaraContemplationObject, type M4ContemplationRead } from '../panes/m4SessionCloseCeremony';
import { useProvenanceStore, useSessionStore } from '../state/stores';

/**
 * The two wire methods that carry a contemplation, and what each can serve.
 *
 * `live` is the full triplet. `persisted` is the PASU-scoped aggregate the
 * close path stores; it deliberately drops `wisdom_delta`, `recognition_state`,
 * `loaded_agents`, `unsatisfied_constraints` and `symbolic_round_trips`, so the
 * fields this directive marks `live-only` are unreachable through it. That is a
 * privacy boundary, not an omission — widening it is an Architect decision.
 */
export const CONTEMPLATION_FLOW_RPCS = Object.freeze({
    live: 'nara.contemplate_session_close',
    persisted: 'nara.session_close.contemplation.read'
} as const);

/** The exact slot positions S3 stamps on each reading. */
export const CONTEMPLATION_SLOT_POSITIONS = Object.freeze({
    llm: "4'",
    ebm: "5'",
    verifier: "0'"
} as const);

/**
 * What tranche 29.9 asks for that no wire carries.
 *
 * Named rather than rendered. Each of these is a spec-ahead requirement written
 * against a surface that was never built; fabricating a hex tape from a prose
 * sentence, or a coverage fraction from a boolean, would put a number on screen
 * that nothing measured.
 */
export const CONTEMPLATION_UNAVAILABLE = Object.freeze([
    Object.freeze({
        ask: 'wisdom-delta-byte-tape',
        reason:
            'wisdom_delta is a composed PROSE string on the wire; the kernel uint64 (m4.h wisdom_delta) reaches no gateway surface, so there is no 16-byte tape to fold'
    }),
    Object.freeze({
        ask: 'gauge-trio-coverage-fractions',
        reason:
            'the wire carries gauge_trio_coherent as one BOOLEAN over COMP/MOVE/RES; no per-gauge coverage fraction exists to fill three bars'
    }),
    Object.freeze({
        ask: 'four-charge-balance',
        reason:
            'pp + nn + np + pn = 4·outer lives in C (M5_ArchNineChargeState) and is never serialised onto this response; the M3 lens projection carries the charges, the verifier reading does not'
    }),
    Object.freeze({
        ask: 'resonance-72-overlay',
        reason:
            'predicted_72 / target_72 and E = ||target_72 - predicted_72||^2 belong to the 26.1 EBM observatory off the profile bus; this response carries per_tick_energy over the request’s own arity'
    }),
    Object.freeze({
        ask: 'mobius-quaternion-arrow',
        reason:
            'the descent step arrives as a scalar gradient_magnitude plus a per-tick gradient, not as a quaternion over an S³ shadow'
    }),
    Object.freeze({
        ask: 'canvas-inscription-write',
        reason:
            'khora_write_highlighted_inscription is a PI extension tool, not a gateway method; the carrier has no wire path to write the reading into the day canvas'
    })
] as const);

export interface ContemplationAnchorCard {
    readonly card: string | null;
    readonly codon: string | null;
    readonly matched: boolean;
}

export interface ContemplationSymbolicQuestion {
    readonly raw: string;
    readonly coordinate: string;
    readonly tranche: string;
    readonly status: string;
    readonly parserSkill: string;
    readonly llmResponse: string;
    readonly reverificationRoute: string;
    readonly routedBackThroughAnima: boolean;
}

export type ContemplationCloseRead =
    | {
          readonly state: 'ready';
          readonly sessionId: string;
          /** Composed prose, per `compose_wisdom_delta`. Not bytes. */
          readonly wisdomDelta: string;
          readonly llm: {
              readonly position: string;
              readonly piInstanceId: string;
              readonly loadedAgents: readonly string[];
              readonly recognitionState: string;
              readonly psycheAnchorCoherent: boolean;
              readonly matchedAnchorCodons: readonly string[];
              readonly anchorCardReadings: readonly ContemplationAnchorCard[];
          };
          readonly ebm: {
              readonly position: string;
              readonly perTickEnergy: readonly number[];
              readonly gradient: readonly number[];
              readonly gradientMagnitude: number;
              readonly gaugeTrioCoherent: boolean;
              readonly coherenceScores: readonly [number, number, number];
          };
          readonly verifier: {
              readonly position: string;
              readonly witnessBits: readonly boolean[];
              readonly unsatisfiedConstraints: readonly string[];
              readonly coherenceScore: number;
              readonly arch9Wholeness: boolean;
              readonly syntaxLayersWitnessed: boolean;
          };
          readonly symbolicRoundTrips: readonly ContemplationSymbolicQuestion[];
      }
    | { readonly state: 'blocked'; readonly reason: string };

const TOP_LEVEL_KEYS = new Set(['method', 'session_id', 'wisdom_delta', 'triplet', 'symbolic_round_trips']);
const TRIPLET_KEYS = new Set(['llm', 'ebm', 'verifier']);
const LLM_KEYS = new Set([
    'position',
    'pi_instance_id',
    'loaded_agents',
    'recognition_state',
    'psyche_anchor_coherent',
    'matched_anchor_codons',
    'anchor_card_readings'
]);
const EBM_KEYS = new Set([
    'position',
    'per_tick_energy',
    'gradient',
    'gradient_magnitude',
    'gauge_trio_coherent',
    'coherence_scores'
]);
const COHERENCE_KEYS = new Set(['square_0_5', 'square_1_4', 'square_2_3']);
const VERIFIER_KEYS = new Set([
    'position',
    'virtue_witness_vector',
    'unsatisfied_constraints',
    'coherence_score',
    'arch9_wholeness',
    'syntax_layers_witnessed'
]);
const ANCHOR_CARD_KEYS = new Set(['card', 'codon', 'matched']);
const ROUND_TRIP_KEYS = new Set([
    'raw',
    'parsed',
    'parser_skill',
    'llm_response',
    'anima_reverification_route',
    'routed_back_through_anima'
]);
const PARSED_QUESTION_KEYS = new Set(['coordinate', 'tranche', 'status']);

/** The nine-bit witness is a fixed width; a longer vector is a contract breach. */
const WITNESS_BITS = M0_VIRTUE_LABELS.length;

function objectValue(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function strayKey(value: Record<string, unknown>, allowed: ReadonlySet<string>, label: string): string | null {
    const key = Object.keys(value).find(candidate => !allowed.has(candidate));
    return key ? `unexpected ${label} field ${key}` : null;
}

function stringList(value: unknown): readonly string[] | null {
    return Array.isArray(value) && value.every(entry => typeof entry === 'string')
        ? Object.freeze([...(value as string[])])
        : null;
}

function finiteList(value: unknown): readonly number[] | null {
    return Array.isArray(value) && value.every(entry => typeof entry === 'number' && Number.isFinite(entry))
        ? Object.freeze([...(value as number[])])
        : null;
}

function unitScore(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function nullableString(value: unknown): string | null | undefined {
    if (value === null || value === undefined) return null;
    return typeof value === 'string' ? value : undefined;
}

function blocked(reason: string): ContemplationCloseRead {
    return { state: 'blocked', reason };
}

/**
 * Strict-parse a LIVE `nara.contemplate_session_close` response.
 *
 * Deliberately NOT an extension of `readContemplationObjectProjection`: that
 * reader holds `wisdom_delta`, `recognition_state`, `unsatisfied_constraints`
 * and `symbolic_round_trips` in its FORBIDDEN_KEYS because the PERSISTED
 * projection must never carry them. They are exactly the fields this response
 * does carry, so the two shapes cannot share one parser without one of them
 * lying about its own boundary.
 */
export function readContemplateSessionCloseResponse(raw: unknown): ContemplationCloseRead {
    const response = objectValue(raw);
    if (!response) return blocked('contemplation response must be an object');

    const stray = strayKey(response, TOP_LEVEL_KEYS, 'contemplation');
    if (stray) return blocked(stray);

    if (response.method !== CONTEMPLATION_FLOW_RPCS.live) {
        return blocked(`contemplation response must name ${CONTEMPLATION_FLOW_RPCS.live}`);
    }

    const sessionId = typeof response.session_id === 'string' ? response.session_id : '';
    if (!sessionId) return blocked('contemplation response must carry a session_id');

    const wisdomDelta = typeof response.wisdom_delta === 'string' ? response.wisdom_delta : '';
    if (!wisdomDelta) return blocked('contemplation response must carry a wisdom_delta');

    const triplet = objectValue(response.triplet);
    if (!triplet) return blocked('contemplation triplet must be an object');
    const strayTriplet = strayKey(triplet, TRIPLET_KEYS, 'triplet');
    if (strayTriplet) return blocked(strayTriplet);

    const llm = objectValue(triplet.llm);
    const ebm = objectValue(triplet.ebm);
    const verifier = objectValue(triplet.verifier);
    if (!llm || !ebm || !verifier) return blocked('contemplation triplet must carry llm, ebm and verifier');

    for (const [slot, value, allowed] of [
        ['triplet.llm', llm, LLM_KEYS],
        ['triplet.ebm', ebm, EBM_KEYS],
        ['triplet.verifier', verifier, VERIFIER_KEYS]
    ] as const) {
        const straySlot = strayKey(value, allowed, slot);
        if (straySlot) return blocked(straySlot);
    }

    // The positions are the composition's whole claim: this triplet IS the
    // 4'-5'-0' reading. A response that stamped them differently is describing
    // some other geometry and must not be rendered into these slots.
    if (llm.position !== CONTEMPLATION_SLOT_POSITIONS.llm) {
        return blocked(`llm reading must sit at ${CONTEMPLATION_SLOT_POSITIONS.llm}`);
    }
    if (ebm.position !== CONTEMPLATION_SLOT_POSITIONS.ebm) {
        return blocked(`ebm reading must sit at ${CONTEMPLATION_SLOT_POSITIONS.ebm}`);
    }
    if (verifier.position !== CONTEMPLATION_SLOT_POSITIONS.verifier) {
        return blocked(`verifier reading must sit at ${CONTEMPLATION_SLOT_POSITIONS.verifier}`);
    }

    const loadedAgents = stringList(llm.loaded_agents);
    const matchedAnchorCodons = stringList(llm.matched_anchor_codons);
    if (!loadedAgents || !matchedAnchorCodons) return blocked('llm reading must carry string lists');
    if (typeof llm.pi_instance_id !== 'string' || !llm.pi_instance_id) {
        return blocked('llm reading must carry a pi_instance_id');
    }
    if (typeof llm.recognition_state !== 'string' || !llm.recognition_state) {
        return blocked('llm reading must carry a recognition_state');
    }
    if (typeof llm.psyche_anchor_coherent !== 'boolean') {
        return blocked('llm reading must carry psyche_anchor_coherent');
    }

    const rawCards = llm.anchor_card_readings === undefined ? [] : llm.anchor_card_readings;
    if (!Array.isArray(rawCards)) return blocked('anchor_card_readings must be a list');
    const anchorCardReadings: ContemplationAnchorCard[] = [];
    for (const entry of rawCards) {
        const card = objectValue(entry);
        if (!card) return blocked('each anchor card reading must be an object');
        const strayCard = strayKey(card, ANCHOR_CARD_KEYS, 'anchor card');
        if (strayCard) return blocked(strayCard);
        const name = nullableString(card.card);
        const codon = nullableString(card.codon);
        if (name === undefined || codon === undefined) {
            return blocked('anchor card and codon must be strings or null');
        }
        if (typeof card.matched !== 'boolean') return blocked('anchor card must carry matched');
        anchorCardReadings.push(Object.freeze({ card: name, codon, matched: card.matched }));
    }

    const perTickEnergy = finiteList(ebm.per_tick_energy);
    const gradient = finiteList(ebm.gradient);
    if (!perTickEnergy || !gradient) return blocked('ebm reading must carry finite energy and gradient lists');
    if (typeof ebm.gradient_magnitude !== 'number' || !Number.isFinite(ebm.gradient_magnitude)) {
        return blocked('ebm reading must carry a finite gradient_magnitude');
    }
    if (typeof ebm.gauge_trio_coherent !== 'boolean') {
        return blocked('ebm reading must carry gauge_trio_coherent');
    }

    const scores = objectValue(ebm.coherence_scores);
    if (!scores) return blocked('ebm coherence_scores must be an object');
    const strayScores = strayKey(scores, COHERENCE_KEYS, 'coherence_scores');
    if (strayScores) return blocked(strayScores);
    const square05 = unitScore(scores.square_0_5);
    const square14 = unitScore(scores.square_1_4);
    const square23 = unitScore(scores.square_2_3);
    if (square05 === null || square14 === null || square23 === null) {
        return blocked('each tritone square coherence must be a finite value from 0 to 1');
    }

    const witnessRaw = verifier.virtue_witness_vector;
    if (
        !Array.isArray(witnessRaw) ||
        witnessRaw.length !== WITNESS_BITS ||
        !witnessRaw.every(bit => typeof bit === 'boolean')
    ) {
        return blocked(`virtue_witness_vector must be ${WITNESS_BITS} booleans`);
    }
    const unsatisfiedConstraints = stringList(verifier.unsatisfied_constraints);
    if (!unsatisfiedConstraints) return blocked('unsatisfied_constraints must be a string list');
    const coherenceScore = unitScore(verifier.coherence_score);
    if (coherenceScore === null) {
        return blocked('verifier coherence_score must be a finite value from 0 to 1');
    }
    if (
        typeof verifier.arch9_wholeness !== 'boolean' ||
        typeof verifier.syntax_layers_witnessed !== 'boolean'
    ) {
        return blocked('verifier reading must carry arch9_wholeness and syntax_layers_witnessed');
    }

    const rawTrips = response.symbolic_round_trips === undefined ? [] : response.symbolic_round_trips;
    if (!Array.isArray(rawTrips)) return blocked('symbolic_round_trips must be a list');
    const symbolicRoundTrips: ContemplationSymbolicQuestion[] = [];
    for (const entry of rawTrips) {
        const trip = objectValue(entry);
        if (!trip) return blocked('each symbolic round trip must be an object');
        const strayTrip = strayKey(trip, ROUND_TRIP_KEYS, 'symbolic round trip');
        if (strayTrip) return blocked(strayTrip);
        const parsed = objectValue(trip.parsed);
        if (!parsed) return blocked('symbolic round trip must carry a parsed question');
        const strayParsed = strayKey(parsed, PARSED_QUESTION_KEYS, 'parsed question');
        if (strayParsed) return blocked(strayParsed);
        if (
            typeof trip.raw !== 'string' ||
            typeof trip.parser_skill !== 'string' ||
            typeof trip.llm_response !== 'string' ||
            typeof trip.anima_reverification_route !== 'string' ||
            typeof trip.routed_back_through_anima !== 'boolean' ||
            typeof parsed.coordinate !== 'string' ||
            typeof parsed.tranche !== 'string' ||
            typeof parsed.status !== 'string'
        ) {
            return blocked('symbolic round trip fields must be well typed');
        }
        symbolicRoundTrips.push(
            Object.freeze({
                raw: trip.raw,
                coordinate: parsed.coordinate,
                tranche: parsed.tranche,
                status: parsed.status,
                parserSkill: trip.parser_skill,
                llmResponse: trip.llm_response,
                reverificationRoute: trip.anima_reverification_route,
                routedBackThroughAnima: trip.routed_back_through_anima
            })
        );
    }

    return {
        state: 'ready',
        sessionId,
        wisdomDelta,
        llm: Object.freeze({
            position: llm.position,
            piInstanceId: llm.pi_instance_id,
            loadedAgents,
            recognitionState: llm.recognition_state,
            psycheAnchorCoherent: llm.psyche_anchor_coherent,
            matchedAnchorCodons,
            anchorCardReadings: Object.freeze(anchorCardReadings)
        }),
        ebm: Object.freeze({
            position: ebm.position,
            perTickEnergy,
            gradient,
            gradientMagnitude: ebm.gradient_magnitude,
            gaugeTrioCoherent: ebm.gauge_trio_coherent,
            coherenceScores: Object.freeze([square05, square14, square23]) as readonly [
                number,
                number,
                number
            ]
        }),
        verifier: Object.freeze({
            position: verifier.position,
            witnessBits: Object.freeze([...(witnessRaw as boolean[])]),
            unsatisfiedConstraints,
            coherenceScore,
            arch9Wholeness: verifier.arch9_wholeness,
            syntaxLayersWitnessed: verifier.syntax_layers_witnessed
        }),
        symbolicRoundTrips: Object.freeze(symbolicRoundTrips)
    };
}

/** One of the nine R-virtue lamps on the 0'/UNDER-LAYER. */
export interface ContemplationVirtueLamp {
    readonly index: number;
    readonly label: string;
    readonly lit: boolean;
}

/**
 * What only the LIVE response carries.
 *
 * The persisted projection is the aggregate the close path stores, and it drops
 * these on purpose — a protected-local boundary, not an oversight. A directive
 * built from it says which readings it cannot show rather than showing an empty
 * one as though it were absent.
 */
export const CONTEMPLATION_LIVE_ONLY = Object.freeze([
    'wisdom-delta',
    'recognition-state',
    'loaded-agents',
    'unsatisfied-constraints',
    'symbolic-round-trips'
] as const);

export interface ContemplationFlowDirective {
    readonly state: 'ready' | 'awaiting-close' | 'blocked';
    /** Which wire the reading came from; `none` before any close. */
    readonly source: 'live' | 'persisted' | 'none';
    readonly reason: string | null;
    readonly sessionId: string | null;
    /** Readings this source cannot serve — empty when the source is `live`. */
    readonly liveOnlyPending: readonly string[];
    /** Composed prose from the gateway. Rendered as the sentence it is. */
    readonly wisdomDelta: string | null;
    /** 4'/LEFT — the LLM-Nara reading and its tarot psyche-anchor ribbon. */
    readonly left: {
        readonly position: string;
        readonly reading: string | null;
        /** The highlight register row this reading is an inscription OF (11.11 / 19.11). */
        readonly highlightCategory: string;
        readonly authoredBy: string | null;
        readonly ribbon: readonly ContemplationAnchorCard[];
        readonly anchorCoherent: boolean;
        readonly landed: boolean;
    };
    /** 5'/RIGHT — the EBM evaluation, read verbatim. */
    readonly right: {
        readonly position: string;
        readonly perTickEnergy: readonly number[];
        readonly gradientMagnitude: number | null;
        readonly gaugeTrioCoherent: boolean | null;
        /** ((0,5), (1,4), (2,3)) — the Klein-V4 tritone squares, kernel-scored. */
        readonly squareCoherence: readonly number[];
        readonly landed: boolean;
    };
    /** 0'/UNDER-LAYER — the Verifier R-virtue witness. */
    readonly under: {
        readonly position: string;
        readonly lamps: readonly ContemplationVirtueLamp[];
        readonly questions: readonly ContemplationSymbolicQuestion[];
        readonly coherenceScore: number | null;
        readonly arch9Wholeness: boolean | null;
        readonly syntaxLayersWitnessed: boolean | null;
        readonly landed: boolean;
    };
    /** The spec-ahead asks with no wire source, named rather than rendered. */
    readonly unavailable: readonly string[];
}

const NO_CARDS: readonly ContemplationAnchorCard[] = Object.freeze([]);
const NO_QUESTIONS: readonly ContemplationSymbolicQuestion[] = Object.freeze([]);
const NO_NUMBERS: readonly number[] = Object.freeze([]);
const UNAVAILABLE_ASKS: readonly string[] = Object.freeze(
    CONTEMPLATION_UNAVAILABLE.map(entry => entry.ask)
);
const NO_PENDING: readonly string[] = Object.freeze([]);
const LIVE_ONLY_PENDING: readonly string[] = Object.freeze([...CONTEMPLATION_LIVE_ONLY]);

/** The nine lamps, dim until the witness says otherwise. */
function lamps(bits: readonly boolean[] | null): readonly ContemplationVirtueLamp[] {
    return Object.freeze(
        M0_VIRTUE_LABELS.map((label, index) =>
            Object.freeze({ index, label, lit: bits?.[index] === true })
        )
    );
}

function emptyDirective(state: 'awaiting-close' | 'blocked', reason: string | null): ContemplationFlowDirective {
    return Object.freeze({
        state,
        source: 'none' as const,
        reason,
        sessionId: null,
        liveOnlyPending: NO_PENDING,
        wisdomDelta: null,
        left: Object.freeze({
            position: CONTEMPLATION_SLOT_POSITIONS.llm,
            reading: null,
            highlightCategory: highlightCategory('recognition').id,
            authoredBy: null,
            ribbon: NO_CARDS,
            anchorCoherent: false,
            landed: false
        }),
        right: Object.freeze({
            position: CONTEMPLATION_SLOT_POSITIONS.ebm,
            perTickEnergy: NO_NUMBERS,
            gradientMagnitude: null,
            gaugeTrioCoherent: null,
            squareCoherence: NO_NUMBERS,
            landed: false
        }),
        under: Object.freeze({
            position: CONTEMPLATION_SLOT_POSITIONS.verifier,
            lamps: lamps(null),
            questions: NO_QUESTIONS,
            coherenceScore: null,
            arch9Wholeness: null,
            syntaxLayersWitnessed: null,
            landed: false
        }),
        unavailable: UNAVAILABLE_ASKS
    });
}

/**
 * Build the tri-slot directive for the personal 4-5-0 composition.
 *
 * `null` is the honest state before any close has been contemplated — the app
 * never originates a `ContemplationObject` (the close path does), so an empty
 * surface is a real reading, not a failure.
 */
export function buildContemplationFlowDirective(
    read: ContemplationCloseRead | null
): ContemplationFlowDirective {
    if (read === null) return emptyDirective('awaiting-close', null);
    if (read.state === 'blocked') return emptyDirective('blocked', read.reason);

    return Object.freeze({
        state: 'ready' as const,
        source: 'live' as const,
        reason: null,
        sessionId: read.sessionId,
        liveOnlyPending: NO_PENDING,
        wisdomDelta: read.wisdomDelta,
        left: Object.freeze({
            position: read.llm.position,
            reading: read.llm.recognitionState,
            // Composed from the register, not restated: 11.11's `recognition`
            // row is what a 19.11 `immediate` response orbit inscribes, and its
            // gold lives with the row rather than in this module.
            highlightCategory: highlightCategory('recognition').id,
            authoredBy: read.llm.piInstanceId,
            ribbon: read.llm.anchorCardReadings,
            anchorCoherent: read.llm.psycheAnchorCoherent,
            landed: true
        }),
        right: Object.freeze({
            position: read.ebm.position,
            perTickEnergy: read.ebm.perTickEnergy,
            gradientMagnitude: read.ebm.gradientMagnitude,
            gaugeTrioCoherent: read.ebm.gaugeTrioCoherent,
            squareCoherence: read.ebm.coherenceScores,
            landed: true
        }),
        under: Object.freeze({
            position: read.verifier.position,
            lamps: lamps(read.verifier.witnessBits),
            // The chips ARE the round trips: S3 already parsed each unsatisfied
            // constraint through `anuttara-symbolic-parse` and carries the LLM
            // response back with it, so there is no second RPC to make — and no
            // `anuttara-symbolic-parse` gateway method exists to make it to.
            questions: read.symbolicRoundTrips,
            coherenceScore: read.verifier.coherenceScore,
            arch9Wholeness: read.verifier.arch9Wholeness,
            syntaxLayersWitnessed: read.verifier.syntaxLayersWitnessed,
            landed: true
        }),
        unavailable: UNAVAILABLE_ASKS
    });
}

/**
 * Build the directive from the PERSISTED close projection.
 *
 * This is the source the carrier can actually reach unprompted: the app never
 * originates a `ContemplationObject` — the loopback close path does — so what a
 * mounted composition has to show is the close that was already stored. The
 * projection serves the ribbon, the squares, the gauge verdict and all nine
 * lamps; the five readings it drops are named in `liveOnlyPending` rather than
 * rendered as absent.
 *
 * The projection is parsed by `readNaraContemplationObject`, not by a third
 * reader of the same method — 26.12 and 25.20 already disagreed once about
 * whether `anchor_cards` was allowed, and a third copy is a third opinion.
 */
export function buildContemplationFlowDirectiveFromProjection(
    read: M4ContemplationRead | null
): ContemplationFlowDirective {
    if (read === null) return emptyDirective('awaiting-close', null);
    if (read.state === 'blocked') return emptyDirective('blocked', read.reason);

    return Object.freeze({
        state: 'ready' as const,
        source: 'persisted' as const,
        reason: null,
        sessionId: read.sessionId,
        liveOnlyPending: LIVE_ONLY_PENDING,
        wisdomDelta: null,
        left: Object.freeze({
            position: read.llm.position,
            // The composed reading is live-only; the ribbon beneath it is not.
            reading: null,
            highlightCategory: highlightCategory('recognition').id,
            authoredBy: null,
            ribbon: read.llm.anchorCards,
            anchorCoherent: read.llm.psycheAnchorCoherent,
            landed: true
        }),
        right: Object.freeze({
            position: read.ebm.position,
            perTickEnergy: NO_NUMBERS,
            gradientMagnitude: read.ebm.gradientMagnitude,
            gaugeTrioCoherent: read.ebm.gaugeTrioCoherent,
            squareCoherence: Object.freeze(read.ebm.coherenceSquares.map(square => square.score)),
            landed: true
        }),
        under: Object.freeze({
            position: read.verifier.position,
            lamps: lamps(read.verifier.witnessBits),
            questions: NO_QUESTIONS,
            coherenceScore: read.verifier.coherenceScore,
            arch9Wholeness: read.verifier.arch9Wholeness,
            syntaxLayersWitnessed: read.verifier.syntaxLayersWitnessed,
            landed: true
        }),
        unavailable: UNAVAILABLE_ASKS
    });
}

/** True once all three geometric slots carry their reading. */
export function contemplationSlotsLanded(directive: ContemplationFlowDirective): boolean {
    return directive.left.landed && directive.right.landed && directive.under.landed;
}

/**
 * Emit `composition.contemplation.complete` once the three slot updates land.
 *
 * Returns whether it fired, so a caller can guard against re-emitting for the
 * same close. The emitter is injectable for the same reason 29.7's klein-flip
 * carrier makes it injectable: a test can watch the call without mocking the
 * module the whole composition shares.
 */
export function emitContemplationComplete(
    compositionId: IntegratedCompositionId,
    directive: ContemplationFlowDirective,
    profileGeneration: number | null,
    timestamp: string,
    emit: (event: CompositionEvent) => void = emitCompositionEvent
): boolean {
    if (directive.state !== 'ready' || !contemplationSlotsLanded(directive)) return false;
    emit({
        type: 'composition.contemplation.complete',
        compositionId,
        timestamp,
        profileGeneration,
        payload: Object.freeze({
            sessionId: directive.sessionId,
            slots: Object.freeze([
                directive.left.position,
                directive.right.position,
                directive.under.position
            ]),
            lampsLit: directive.under.lamps.filter(lamp => lamp.lit).length,
            questions: directive.under.questions.length,
            arch9Wholeness: directive.under.arch9Wholeness,
            unavailable: directive.unavailable
        })
    });
    return true;
}

/**
 * The composition's own read of the latest persisted close.
 *
 * Demand-driven, per the 25.T25.19 ruling: there is no
 * `m5.session.contemplation.complete` on the wire to subscribe to, so the
 * composition reads the close that exists rather than waiting on a ceremony
 * that never fires. It emits `composition.contemplation.complete` once per
 * session whose three slots land — the same once-per-change guard
 * `useCompositionPentadicTraceEvents` uses, so a re-render does not re-fire it.
 */
export function useContemplationFlowDirective(
    compositionId: IntegratedCompositionId,
    profileGeneration: number | null
): ContemplationFlowDirective {
    const connected = useProvenanceStore(state => state.connection.connected);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const [read, setRead] = useState<M4ContemplationRead | null>(null);

    useEffect(() => {
        if (!connected || !sessionKey || !gatewayReady()) {
            setRead(null);
            return;
        }
        let disposed = false;
        gateway()
            .invoke(CONTEMPLATION_FLOW_RPCS.persisted, { session_id: sessionKey, latest: true })
            .then(receipt => {
                if (!disposed) setRead(readNaraContemplationObject(receipt.artifact));
            })
            .catch(() => {
                // A session that never closed has no contemplation. That is an
                // honest absence, and `awaiting-close` is what it reads as.
                if (!disposed) setRead(null);
            });
        return () => {
            disposed = true;
        };
    }, [connected, sessionKey]);

    const directive = useMemo(() => buildContemplationFlowDirectiveFromProjection(read), [read]);

    const emittedFor = useRef<string | null>(null);
    useEffect(() => {
        if (directive.state !== 'ready' || directive.sessionId === null) return;
        if (emittedFor.current === directive.sessionId) return;
        if (emitContemplationComplete(compositionId, directive, profileGeneration, new Date().toISOString())) {
            emittedFor.current = directive.sessionId;
        }
    }, [compositionId, directive, profileGeneration]);

    return directive;
}

/** Hover text for the composition's contemplation chip. */
export function formatContemplationReading(directive: ContemplationFlowDirective): string {
    if (directive.state !== 'ready') {
        return directive.reason ?? 'no session close has been contemplated yet';
    }
    const lit = directive.under.lamps.filter(lamp => lamp.lit).length;
    return [
        directive.wisdomDelta ?? '',
        `${directive.left.position} ${directive.left.reading ?? 'pending'}`,
        `${directive.right.position} gauge-trio ${directive.right.gaugeTrioCoherent ? 'coherent' : 'incomplete'} · squares ${directive.right.squareCoherence.join(' / ')}`,
        `${directive.under.position} ${lit}/${directive.under.lamps.length} virtues witnessed · ${directive.under.questions.length} question(s)`,
        `not on this wire: ${directive.unavailable.join(', ')}`
    ]
        .filter(line => line.length > 0)
        .join('\n');
}
