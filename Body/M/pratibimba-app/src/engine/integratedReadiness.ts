/**
 * Coordinate: M' (integrated 1-2-3 cosmic engine — Wave-A readiness gate, 07.T7.1)
 * Actualises: the typed `profile_missing_field` blocked-state the integrated
 *   cosmic surface reports when a Wave-A profile pocket it renders from is
 *   absent — an honest blocker keyed to a declared marker, never a placeholder.
 * Provenance: contract cribbed 2026-07-11 from frozen
 *   `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/common/wave-a-markers.ts`
 *   (epi-theia is a frozen parts warehouse; readiness ids, marker names, and
 *   block shapes are LAW — the m-extension-runtime/contributor plumbing is not
 *   ported). Field paths are carrier-real, per the kernel-bridge readiness
 *   ledger (`plan.runs/wave-b-kernel-bridge-matrix.md`) and
 *   `kernel_bridge_runtime.rs` emission sites.
 * Does NOT own: composition-slot layout or pane rendering (later 7.x work);
 *   the profile transport (bridge/gatewayClient); kernel-side derivations.
 */

import type {
    KernelBridgeCachedProfile,
    MathemeHarmonicProfileBoundary
} from '../bridge/types';
import { buildPentadicOverlay, type PentadicOverlayState } from './cosmicPentadicOverlay';
import { pentadicTraceFromPayload } from '../panes/m3PentadicInspector';

/** LAW: stable blocker-id namespace so Wave-A blockers stay greppable across tracks. */
export const WAVE_A_BLOCKER_ID_PREFIX = 'wave-a.pending' as const;

/** LAW: the five canonical marker names as written in the tranche specs. */
export type WaveAMarkerName =
    | 'klein_flip'
    | 'resonance72'
    | 'six-axes-of-72 decoding'
    | 'audio_octet[8]'
    | 'nodal_quartet[4]';

/**
 * A single Wave-A pending marker.
 *
 * - `marker`       — LAW canonical name.
 * - `ownerTrack`   — the Wave-A tranche(s) that own the field's production.
 * - `profilePaths` — carrier-real payload paths (checked under
 *                    `payload.harmonicProfile` first, then the payload root —
 *                    the same two-level resolution every carrier pane uses).
 *                    `null` marks a derivation with no transported pocket
 *                    (LAW: the six-axes decode is an M2 derivation over
 *                    resonance72, not its own field — it can never block as
 *                    missing-field).
 * - `eventPaths`   — pockets on the M1' performance event, for markers whose
 *                    wire home is `harmonic.*` rather than the profile.
 * - `conditional`  — LAW: `true` when the field is aligned but expected only
 *                    once the M1' performance event has been seen.
 */
export interface WaveAPendingMarker {
    readonly marker: WaveAMarkerName;
    readonly ownerTrack: string;
    readonly profilePaths: readonly string[] | null;
    readonly eventPaths: readonly string[];
    readonly conditional: boolean;
    readonly conditionalOn: string | null;
}

/**
 * The Wave-A pending markers the integrated 1-2-3 surface consumes, ordered
 * M1 → kernel-bridge → M2 → M1' to mirror the cosmic-spine flow.
 *
 * Wire reality (readiness ledger + kernel_bridge_runtime.rs):
 * - `kleinFlip` — emitted at kernel_bridge_runtime.rs:1011 since Wave-A 02.2 /
 *   bridge 10.2 landed; also visible as `anandaVortex.kleinFlipAtThisTick`.
 * - `resonance72` — payload projection + `depositionAnchor.resonance72Index`.
 * - `audioOctet` / `nodalQuartet` — `harmonic.*` on the M1' performance event.
 */
export const WAVE_A_PENDING_MARKERS: readonly WaveAPendingMarker[] = Object.freeze([
    Object.freeze({
        marker: 'klein_flip' as const,
        ownerTrack: 'M1 02.2 / kernel-bridge 10.2',
        profilePaths: Object.freeze([
            'kleinFlip',
            'klein_flip',
            'kleinFlipState',
            'klein_flip_state',
            'anandaVortex.kleinFlipAtThisTick'
        ]),
        eventPaths: Object.freeze([]),
        conditional: false,
        conditionalOn: null
    }),
    Object.freeze({
        marker: 'resonance72' as const,
        ownerTrack: 'kernel-bridge (Track 10 readiness ledger)',
        profilePaths: Object.freeze([
            'resonance72',
            'resonance72Index',
            'depositionAnchor.resonance72Index'
        ]),
        eventPaths: Object.freeze([]),
        conditional: false,
        conditionalOn: null
    }),
    Object.freeze({
        marker: 'six-axes-of-72 decoding' as const,
        ownerTrack: 'M2 03.3',
        // LAW: derivation over resonance72, not a transported pocket.
        profilePaths: null,
        eventPaths: Object.freeze([]),
        conditional: false,
        conditionalOn: null
    }),
    Object.freeze({
        marker: 'audio_octet[8]' as const,
        ownerTrack: "M1' performance event 02.4",
        profilePaths: Object.freeze(['audioOctet', 'audio_octet']),
        eventPaths: Object.freeze(['harmonic.audioOctet', 'harmonic.audio_octet']),
        conditional: true,
        conditionalOn: "M1' performance event 02.4"
    }),
    Object.freeze({
        marker: 'nodal_quartet[4]' as const,
        ownerTrack: "M1' performance event 02.4",
        profilePaths: Object.freeze(['nodalQuartet', 'nodal_quartet']),
        eventPaths: Object.freeze(['harmonic.nodalQuartet', 'harmonic.nodal_quartet']),
        conditional: true,
        conditionalOn: "M1' performance event 02.4"
    })
]);

/** LAW: build the stable blocker id for a Wave-A marker. */
export function waveABlockerId(marker: WaveAPendingMarker): string {
    return `${WAVE_A_BLOCKER_ID_PREFIX}:${marker.marker}`;
}

/**
 * LAW: the typed blocked-state. `state` is pinned to `profile_missing_field` —
 * the field-missing case of the readiness taxonomy — so a renderer can surface
 * the exact blocking markers instead of faking a placeholder.
 */
export interface IntegratedReadinessBlockedState {
    readonly state: 'profile_missing_field';
    readonly blockingMarkers: readonly WaveAPendingMarker[];
    readonly blockerIds: readonly string[];
}

export interface IntegratedReadinessReady {
    readonly state: 'ready';
    readonly blockingMarkers: readonly [];
    readonly blockerIds: readonly [];
}

export type IntegratedReadinessResult =
    (IntegratedReadinessBlockedState | IntegratedReadinessReady) & {
        /** Conditional markers whose gating event has not been seen — declared,
         *  not blocking (LAW: aligned-but-conditional is pending, not missing). */
        readonly conditionalPending: readonly WaveAPendingMarker[];
    };

/** LAW constructor: a typed blocked-state from the markers found unavailable. */
export function integratedReadinessBlockedBy(
    blockingMarkers: readonly WaveAPendingMarker[]
): IntegratedReadinessBlockedState {
    return Object.freeze({
        state: 'profile_missing_field' as const,
        blockingMarkers: Object.freeze([...blockingMarkers]),
        blockerIds: Object.freeze(blockingMarkers.map(waveABlockerId))
    });
}

/** Minimal slice of the M1' performance event the gate consumes. */
export interface PerformanceEventSlice {
    readonly harmonic?: Readonly<Record<string, unknown>>;
    readonly [key: string]: unknown;
}

/**
 * Evaluate the integrated 1-2-3 readiness gate against a profile generation.
 *
 * - No profile at all → every unconditional pocket marker blocks.
 * - Conditional markers block only once `performanceEvent` is provided (the
 *   M1' performance event has been seen) and their pocket is still absent on
 *   both the event and the profile; before that they are `conditionalPending`.
 * - Derivation markers (`profilePaths: null`) never block as missing-field.
 */
export function evaluateIntegratedReadiness(
    profile: MathemeHarmonicProfileBoundary | null,
    opts?: { readonly performanceEvent?: PerformanceEventSlice | null }
): IntegratedReadinessResult {
    const performanceEvent = opts?.performanceEvent ?? null;
    const blocking: WaveAPendingMarker[] = [];
    const conditionalPending: WaveAPendingMarker[] = [];
    for (const marker of WAVE_A_PENDING_MARKERS) {
        if (marker.profilePaths === null) {
            continue; // derivation — no pocket to miss
        }
        const onProfile = hasAnyProfileValue(profile, marker.profilePaths);
        const onEvent = performanceEvent !== null
            && marker.eventPaths.some(path => isPresent(readPath(performanceEvent, path)));
        if (onProfile || onEvent) {
            continue;
        }
        if (marker.conditional && performanceEvent === null) {
            conditionalPending.push(marker);
            continue;
        }
        blocking.push(marker);
    }
    const frozenPending = Object.freeze(conditionalPending);
    if (blocking.length > 0) {
        return Object.freeze({
            ...integratedReadinessBlockedBy(blocking),
            conditionalPending: frozenPending
        });
    }
    return Object.freeze({
        state: 'ready' as const,
        blockingMarkers: Object.freeze([]) as readonly [],
        blockerIds: Object.freeze([]) as readonly [],
        conditionalPending: frozenPending
    });
}

/**
 * Adapt the actual profile cache emitted by the gateway to the readiness
 * boundary. The bridge normally stores the raw harmonic payload, but accepts
 * an already-boundary-shaped payload too so the carrier never needs a second
 * profile store or an invented transport wrapper.
 */
export function evaluateCachedProfileIntegratedReadiness(
    cached: KernelBridgeCachedProfile | null,
    opts?: { readonly performanceEvent?: PerformanceEventSlice | null }
): IntegratedReadinessResult {
    const rawProfile = recordValue(cached?.profile);
    if (cached === null || rawProfile === null) {
        return evaluateIntegratedReadiness(null, opts);
    }
    const boundaryPayload = recordValue(rawProfile.payload);
    const capabilities = Array.isArray(rawProfile.capabilities)
        ? rawProfile.capabilities.filter((capability): capability is string => typeof capability === 'string')
        : [];
    const boundary: MathemeHarmonicProfileBoundary = {
        generation: numberValue(rawProfile.generation) ?? cached.generation,
        pointerAnchor: stringValue(rawProfile.pointerAnchor),
        capabilities,
        payload: boundaryPayload ?? rawProfile
    };
    return evaluateIntegratedReadiness(boundary, opts);
}

/** Human-readable status for both integrated faces; marker ids remain in data attributes. */
export function formatIntegratedReadiness(result: IntegratedReadinessResult): string {
    if (result.state === 'profile_missing_field') {
        return `Wave A blocked: ${result.blockingMarkers.map(marker => marker.marker).join(', ')}`;
    }
    if (result.conditionalPending.length > 0) {
        return `Wave A ready; event pending: ${result.conditionalPending.map(marker => marker.marker).join(', ')}`;
    }
    return 'Wave A ready';
}

/**
 * Carrier two-level resolution: every pane resolves fields under
 * `payload.harmonicProfile` falling back to the payload root — the gate does
 * the same at both levels so a field is found wherever the bridge nests it.
 */
function hasAnyProfileValue(
    profile: MathemeHarmonicProfileBoundary | null,
    paths: readonly string[]
): boolean {
    if (!profile) {
        return false;
    }
    const roots: Readonly<Record<string, unknown>>[] = [profile.payload];
    const nested = profile.payload['harmonicProfile'];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        roots.unshift(nested as Readonly<Record<string, unknown>>);
    }
    return paths.some(path => roots.some(root => isPresent(readPath(root, path))));
}

/** Present = defined and non-null; an empty array is an absent pocket (an
 *  empty octet cannot drive deterministic replay — faking it is forbidden). */
function isPresent(value: unknown): boolean {
    if (value === undefined || value === null) {
        return false;
    }
    return !(Array.isArray(value) && value.length === 0);
}

function readPath(root: Readonly<Record<string, unknown>>, path: string): unknown {
    let current: unknown = root;
    for (const segment of path.split('.')) {
        if (!current || typeof current !== 'object' || Array.isArray(current)
            || !(segment in (current as Record<string, unknown>))) {
            return undefined;
        }
        current = (current as Readonly<Record<string, unknown>>)[segment];
    }
    return current;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

// ============================================================================
// 29.T29.15 — composition-level pentadic-trace readiness aggregation.
//
// A SECOND, orthogonal concern to the Wave-A marker gate above: whether the
// kernel `AnuttaraPentadicRuntimeTrace` is live, absent, or stale across BOTH
// composition slots (cosmic 1-2-3 + personal 4-5-0). It reuses the existing
// `PentadicOverlayState` taxonomy (`ready | pending-anuttara-pentadic-trace |
// stale-trace-generation`, defined in cosmicPentadicOverlay) and the same
// `buildPentadicOverlay` reader — no forked taxonomy, no second trace parser.
// ============================================================================

/** LAW: the pentadic-trace readiness states are exactly the overlay states —
 *  one taxonomy shared with the 36.4 render overlay, never a fork. */
export type IntegratedPentadicReadinessState = PentadicOverlayState;

/** Per-slot readiness: the overlay state + the kernel trace generation
 *  (`trace.tick`) that slot read (null when the trace is absent — never
 *  fabricated). */
export interface IntegratedPentadicSlotReadiness {
    readonly state: IntegratedPentadicReadinessState;
    readonly traceGeneration: number | null;
}

/**
 * The composition-level aggregate across both slots. `state` is `ready` only
 * when both slots are `ready` AND agree on the trace generation; any per-slot
 * `stale-trace-generation` OR a cross-slot generation disagreement (mixed
 * generations — exactly the failure the 36.4 cosmic rule guards) reports
 * `stale-trace-generation`; otherwise `pending-anuttara-pentadic-trace`.
 */
export interface IntegratedReadinessAggregate {
    readonly state: IntegratedPentadicReadinessState;
    readonly cosmic: IntegratedPentadicSlotReadiness;
    readonly personal: IntegratedPentadicSlotReadiness;
    readonly generationsAgree: boolean;
}

function pentadicSlotReadiness(
    payload: Readonly<Record<string, unknown>> | null
): IntegratedPentadicSlotReadiness {
    if (payload === null) {
        return Object.freeze({
            state: 'pending-anuttara-pentadic-trace' as const,
            traceGeneration: null
        });
    }
    // Reuse the real overlay reader for the state (incl. its stale guard) and
    // the same strict trace reader for the generation — one parser, no fork.
    const state = buildPentadicOverlay(payload).state;
    const trace = pentadicTraceFromPayload(payload);
    return Object.freeze({
        state,
        traceGeneration: trace ? trace.tick : null
    });
}

/**
 * Aggregate the pentadic-trace readiness across the cosmic (1-2-3) and personal
 * (4-5-0) slots. Both slots read from the SAME cached profile in the running
 * app; the two payload params keep the "across BOTH slots" contract honest and
 * let the aggregate catch a mixed-generation split if one ever occurs. Keyed to
 * the real `profile.anuttaraPentadicTrace` field via the shared trace reader.
 */
export function aggregatePentadicTraceReadiness(
    cosmicPayload: Readonly<Record<string, unknown>> | null,
    personalPayload: Readonly<Record<string, unknown>> | null
): IntegratedReadinessAggregate {
    const cosmic = pentadicSlotReadiness(cosmicPayload);
    const personal = pentadicSlotReadiness(personalPayload);
    const bothReady = cosmic.state === 'ready' && personal.state === 'ready';
    const generationsAgree =
        bothReady &&
        cosmic.traceGeneration !== null &&
        cosmic.traceGeneration === personal.traceGeneration;
    let state: IntegratedPentadicReadinessState;
    if (bothReady && generationsAgree) {
        state = 'ready';
    } else if (
        cosmic.state === 'stale-trace-generation' ||
        personal.state === 'stale-trace-generation' ||
        (bothReady && !generationsAgree)
    ) {
        state = 'stale-trace-generation';
    } else {
        state = 'pending-anuttara-pentadic-trace';
    }
    return Object.freeze({ state, cosmic, personal, generationsAgree });
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
