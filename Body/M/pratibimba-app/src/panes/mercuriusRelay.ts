/**
 * Coordinate: M' M4' (Mercurius signal-relay model — 25.T25.16)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): CF(0/1/2/3) kairos-signal chrome, strict profile-tick consumer
 * Actualises: the pure relay model behind M4MercuriusRelayChip — kairos
 *   enablement gating (FR-3), honest-pending when the profile-tick carries no
 *   (or a malformed) live-sky vector, and mount-local delta/pulse accumulation
 *   driven ONLY by a genuine change in the bussed planet-degree vector. The
 *   last-refresh stamp is the profile cache time, never a local clock read.
 * Public surface: MERCURIUS_RELAY_VIEW_ID, KAIROS_PLANET_COUNT,
 *   MercuriusRelayInput, MercuriusRelayAccumulator, MercuriusRelayView,
 *   initialMercuriusRelayAccumulator, fingerprintPlanetDegrees,
 *   reduceMercuriusRelay, deriveMercuriusRelayView.
 * Does NOT own: Kerykeion, the kairos populator, planet computation, or the
 *   profile bus (nara.kairos.* + portal-core own the signal; this only reads
 *   harmonicProfile.planetDegrees off the tick and reflects it).
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]]. Content-law port of the frozen
 *   epi-theia mercurius-relay-indicator: the dead SharedBridgeAdapter
 *   `subscribeObservability({kind:'mercurius.kairos.delta'})` transport is
 *   retargeted to the profile-tick spine per DR-FACE-7 (the arena-bus event is
 *   never relayed by the gateway; planetDegrees presence/change IS the signal).
 */

export const MERCURIUS_RELAY_VIEW_ID = 'm4.nara.mercuriusRelay';

/** The kairos live-sky vector is the ten mod-10 bodies populated by
 *  nara.kairos.sync; a vector of any other arity is malformed, not live. */
export const KAIROS_PLANET_COUNT = 10;

export interface MercuriusRelayInput {
    /** epi-logos.privacy.kairos-enabled (FR-3 default-off). */
    readonly kairosEnabled: boolean;
    /** harmonicProfile.planetDegrees off the current profile-tick, or null when
     *  the wire carries no live-sky vector (honest-pending). */
    readonly planetDegrees: readonly number[] | null;
    /** KernelBridgeCachedProfile.cachedAtMs — when the substrate cached the
     *  profile the signal arrived on. Null when unknown. */
    readonly cachedAtMs: number | null;
}

export interface MercuriusRelayAccumulator {
    /** The last live vector fingerprint (null before any live signal). */
    readonly fingerprint: string | null;
    /** Genuine kairos deltas observed since this accumulator was created
     *  (mount-scoped; never persisted, never crosses layouts — DR widget law). */
    readonly deltaCount: number;
    /** cachedAtMs of the profile the last delta arrived on. */
    readonly lastRefreshMs: number | null;
    /** Monotone pulse trigger — increments once per delta so the view can
     *  animate a single pulse per genuine signal. */
    readonly pulseSeq: number;
}

export type MercuriusRelayState = 'disabled' | 'pending' | 'live';

export interface MercuriusRelayView {
    readonly state: MercuriusRelayState;
    readonly lastRefreshIso: string | null;
    readonly deltaCount: number;
    readonly pulseSeq: number;
    /** Arity of the current vector (10 when live, actual when malformed, null
     *  when absent) — surfaced so the chip shows the honest shape. */
    readonly planetCount: number | null;
    /** Non-null only for the pending state, naming the honest gap. */
    readonly reason: string | null;
}

export const initialMercuriusRelayAccumulator: MercuriusRelayAccumulator = Object.freeze({
    fingerprint: null,
    deltaCount: 0,
    lastRefreshMs: null,
    pulseSeq: 0
});

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

/** Stable fingerprint of a valid live-sky vector, or null when the vector is
 *  absent, the wrong arity, or carries a non-finite entry. */
export function fingerprintPlanetDegrees(
    planetDegrees: readonly number[] | null
): string | null {
    if (!Array.isArray(planetDegrees) || planetDegrees.length !== KAIROS_PLANET_COUNT) {
        return null;
    }
    if (!planetDegrees.every(isFiniteNumber)) {
        return null;
    }
    // Normalise -0 to 0 so a numerically identical vector always matches.
    return planetDegrees.map(degree => (degree === 0 ? 0 : degree)).join(',');
}

/** Fold one profile-tick observation into the relay accumulator. Disabled and
 *  signal-free ticks are inert; only a genuine change in the live vector counts
 *  as a delta (and pulses once). Returns the prior accumulator unchanged when
 *  nothing moved, so identity comparison is a valid no-op test. */
export function reduceMercuriusRelay(
    prev: MercuriusRelayAccumulator,
    input: MercuriusRelayInput
): MercuriusRelayAccumulator {
    if (!input.kairosEnabled) {
        return prev;
    }
    const fingerprint = fingerprintPlanetDegrees(input.planetDegrees);
    if (fingerprint === null || fingerprint === prev.fingerprint) {
        return prev;
    }
    return Object.freeze({
        fingerprint,
        deltaCount: prev.deltaCount + 1,
        lastRefreshMs: input.cachedAtMs ?? prev.lastRefreshMs,
        pulseSeq: prev.pulseSeq + 1
    });
}

function isoFromMs(ms: number | null): string | null {
    if (ms === null || !Number.isFinite(ms)) {
        return null;
    }
    const at = new Date(ms);
    return Number.isNaN(at.getTime()) ? null : at.toISOString();
}

/** Project the accumulator + the current observation into the render view. */
export function deriveMercuriusRelayView(
    accumulator: MercuriusRelayAccumulator,
    input: MercuriusRelayInput
): MercuriusRelayView {
    const planetCount = Array.isArray(input.planetDegrees) ? input.planetDegrees.length : null;

    if (!input.kairosEnabled) {
        return Object.freeze({
            state: 'disabled',
            lastRefreshIso: null,
            deltaCount: 0,
            pulseSeq: accumulator.pulseSeq,
            planetCount: null,
            reason: null
        });
    }

    const fingerprint = fingerprintPlanetDegrees(input.planetDegrees);
    if (fingerprint === null) {
        return Object.freeze({
            state: 'pending',
            lastRefreshIso: isoFromMs(accumulator.lastRefreshMs),
            deltaCount: accumulator.deltaCount,
            pulseSeq: accumulator.pulseSeq,
            planetCount,
            reason:
                input.planetDegrees === null ? 'pending-kairos-signal' : 'kairos-signal-malformed'
        });
    }

    return Object.freeze({
        state: 'live',
        lastRefreshIso: isoFromMs(accumulator.lastRefreshMs),
        deltaCount: accumulator.deltaCount,
        pulseSeq: accumulator.pulseSeq,
        planetCount,
        reason: null
    });
}
