/**
 * Coordinate: M' M4' (Mercurius signal-relay model — 25.T25.16)
 * Residency: Body/M/pratibimba-app/src/panes
 * Tests the pure relay reducer: kairos-enabled gating, honest-pending when
 * no/malformed signal, delta accumulation + pulse only on a genuine
 * planet-degree change, and last-refresh stamped from the profile cache time.
 */

import { describe, expect, it } from 'vitest';
import {
    deriveMercuriusRelayView,
    fingerprintPlanetDegrees,
    initialMercuriusRelayAccumulator,
    KAIROS_PLANET_COUNT,
    MERCURIUS_RELAY_VIEW_ID,
    reduceMercuriusRelay,
    type MercuriusRelayInput
} from './mercuriusRelay';

const degs = (base: number): number[] =>
    Array.from({ length: 10 }, (_, i) => (base + i * 3) % 360);

describe('mercuriusRelay model', () => {
    it('declares the new view id and the 10-planet kairos contract', () => {
        expect(MERCURIUS_RELAY_VIEW_ID).toBe('m4.nara.mercuriusRelay');
        expect(KAIROS_PLANET_COUNT).toBe(10);
    });

    it('fingerprints only a finite length-10 degree vector', () => {
        expect(fingerprintPlanetDegrees(null)).toBeNull();
        expect(fingerprintPlanetDegrees([1, 2, 3])).toBeNull();
        expect(fingerprintPlanetDegrees(Array(10).fill(Number.NaN))).toBeNull();
        expect(fingerprintPlanetDegrees(degs(0))).not.toBeNull();
        // stable + value-sensitive
        expect(fingerprintPlanetDegrees(degs(0))).toBe(fingerprintPlanetDegrees(degs(0)));
        expect(fingerprintPlanetDegrees(degs(0))).not.toBe(fingerprintPlanetDegrees(degs(30)));
    });

    it('disabled (FR-3): no accumulation, view is the grey stub', () => {
        const input: MercuriusRelayInput = {
            kairosEnabled: false,
            planetDegrees: degs(0),
            cachedAtMs: 1000
        };
        const acc = reduceMercuriusRelay(initialMercuriusRelayAccumulator, input);
        expect(acc.deltaCount).toBe(0);
        const view = deriveMercuriusRelayView(acc, input);
        expect(view.state).toBe('disabled');
        expect(view.deltaCount).toBe(0);
        expect(view.lastRefreshIso).toBeNull();
    });

    it('enabled but no signal yet renders honest-pending', () => {
        const input: MercuriusRelayInput = {
            kairosEnabled: true,
            planetDegrees: null,
            cachedAtMs: null
        };
        const view = deriveMercuriusRelayView(
            reduceMercuriusRelay(initialMercuriusRelayAccumulator, input),
            input
        );
        expect(view.state).toBe('pending');
        expect(view.reason).toBe('pending-kairos-signal');
        expect(view.deltaCount).toBe(0);
        expect(view.lastRefreshIso).toBeNull();
        expect(view.planetCount).toBeNull();
    });

    it('enabled with a wrong-length signal is malformed, never live', () => {
        const input: MercuriusRelayInput = {
            kairosEnabled: true,
            planetDegrees: [1, 2, 3],
            cachedAtMs: 5
        };
        const view = deriveMercuriusRelayView(
            reduceMercuriusRelay(initialMercuriusRelayAccumulator, input),
            input
        );
        expect(view.state).toBe('pending');
        expect(view.reason).toBe('kairos-signal-malformed');
        expect(view.planetCount).toBe(3);
    });

    it('first live signal: delta 1, one pulse, last-refresh from cachedAtMs', () => {
        const input: MercuriusRelayInput = {
            kairosEnabled: true,
            planetDegrees: degs(0),
            cachedAtMs: 1_700_000_000_000
        };
        const acc = reduceMercuriusRelay(initialMercuriusRelayAccumulator, input);
        expect(acc.deltaCount).toBe(1);
        expect(acc.pulseSeq).toBe(1);
        const view = deriveMercuriusRelayView(acc, input);
        expect(view.state).toBe('live');
        expect(view.deltaCount).toBe(1);
        expect(view.planetCount).toBe(10);
        expect(view.lastRefreshIso).toBe(new Date(1_700_000_000_000).toISOString());
    });

    it('an unchanged signal does not re-pulse or re-count', () => {
        const input: MercuriusRelayInput = {
            kairosEnabled: true,
            planetDegrees: degs(0),
            cachedAtMs: 1000
        };
        const a1 = reduceMercuriusRelay(initialMercuriusRelayAccumulator, input);
        const a2 = reduceMercuriusRelay(a1, { ...input, cachedAtMs: 2000 });
        expect(a2).toBe(a1);
        expect(a2.deltaCount).toBe(1);
        expect(a2.pulseSeq).toBe(1);
    });

    it('a changed signal counts, pulses, and re-stamps last-refresh', () => {
        const i1: MercuriusRelayInput = {
            kairosEnabled: true,
            planetDegrees: degs(0),
            cachedAtMs: 1000
        };
        const i2: MercuriusRelayInput = {
            kairosEnabled: true,
            planetDegrees: degs(30),
            cachedAtMs: 2000
        };
        const a2 = reduceMercuriusRelay(
            reduceMercuriusRelay(initialMercuriusRelayAccumulator, i1),
            i2
        );
        expect(a2.deltaCount).toBe(2);
        expect(a2.pulseSeq).toBe(2);
        expect(deriveMercuriusRelayView(a2, i2).lastRefreshIso).toBe(
            new Date(2000).toISOString()
        );
    });

    it('disabling after a live signal freezes counts and shows the stub', () => {
        const live: MercuriusRelayInput = {
            kairosEnabled: true,
            planetDegrees: degs(0),
            cachedAtMs: 1000
        };
        const off: MercuriusRelayInput = {
            kairosEnabled: false,
            planetDegrees: degs(30),
            cachedAtMs: 2000
        };
        const a2 = reduceMercuriusRelay(
            reduceMercuriusRelay(initialMercuriusRelayAccumulator, live),
            off
        );
        expect(a2.deltaCount).toBe(1);
        expect(deriveMercuriusRelayView(a2, off).state).toBe('disabled');
    });
});
