/**
 * 02.T2.14 / DR-M1-5 — the carrier mirror of the spanda anchor block.
 * The anchor rides the wire; these tests pin the LOCAL evaluation semantics
 * (the dissolved slerpFraction) against the Rust anchor's behavior.
 */
import { describe, expect, it } from 'vitest';
import {
    PORTAL_SPANDA_TRANSPORT_EVENT,
    readSpandaAnchor,
    SpandaAnchorBoundary,
    spandaFractionAt,
    spandaPhaseAt,
    spandaTick12At
} from './types';

const RATE_HZ = 2.5;
const STEP_MS = 400; // one epogdoon-step at 2.5 steps/sec

function flowing(overrides: Partial<SpandaAnchorBoundary> = {}): SpandaAnchorBoundary {
    return {
        epochMs: 0,
        phase0: 0,
        rateHz: RATE_HZ,
        mode: 'flowing',
        direction: 'forward',
        tick12: 0,
        ...overrides
    };
}

describe('readSpandaAnchor', () => {
    it('reads the spanda block off a profile.update payload', () => {
        const anchor = readSpandaAnchor({
            generation: 7,
            spanda: {
                epochMs: 100,
                phase0: 1.5,
                rateHz: 2.5,
                mode: 'held',
                direction: 'forward',
                tick12: 4
            }
        });
        expect(anchor).not.toBeNull();
        expect(anchor?.mode).toBe('held');
        expect(anchor?.tick12).toBe(4);
    });

    it('reads a flat transport-event payload (portal.spanda_transport)', () => {
        expect(PORTAL_SPANDA_TRANSPORT_EVENT).toBe('portal.spanda_transport');
        const anchor = readSpandaAnchor({
            act: 'm1.spanda.hold',
            epochMs: 5,
            phase0: 0.2,
            rateHz: 2.5,
            mode: 'held',
            direction: 'forward',
            tick12: 0
        });
        expect(anchor?.mode).toBe('held');
    });

    it('refuses malformed blocks instead of fabricating one', () => {
        expect(readSpandaAnchor(null)).toBeNull();
        expect(readSpandaAnchor({ spanda: { mode: 'held' } })).toBeNull();
        expect(readSpandaAnchor({ spanda: { epochMs: 1, phase0: 0, rateHz: 2.5, mode: 'melting', direction: 'forward' } })).toBeNull();
    });
});

describe('local anchor evaluation (the dissolved slerpFraction)', () => {
    it('flowing: one tick per beat, mirroring the kernel readout', () => {
        const anchor = flowing();
        expect(spandaTick12At(anchor, STEP_MS / 2)).toBe(0);
        expect(spandaTick12At(anchor, STEP_MS + STEP_MS / 2)).toBe(1);
        expect(spandaTick12At(anchor, 5 * STEP_MS + STEP_MS / 2)).toBe(5);
        expect(spandaTick12At(anchor, 12 * STEP_MS + STEP_MS / 2)).toBe(0);
    });

    it('held: constant at any instant, fraction frozen too', () => {
        const held = flowing({ mode: 'held', phase0: (2 * Math.PI * 3.5) / 12 });
        for (const later of [0, 1_000, 3_600_000]) {
            expect(spandaTick12At(held, later)).toBe(3);
            expect(spandaFractionAt(held, later)).toBeCloseTo(0.5, 10);
        }
    });

    it('fraction sweeps 0→1 within one step and resets', () => {
        const anchor = flowing();
        expect(spandaFractionAt(anchor, 0)).toBeCloseTo(0, 10);
        expect(spandaFractionAt(anchor, STEP_MS / 4)).toBeCloseTo(0.25, 10);
        expect(spandaFractionAt(anchor, (3 * STEP_MS) / 4)).toBeCloseTo(0.75, 10);
        expect(spandaFractionAt(anchor, STEP_MS)).toBeCloseTo(0, 10);
    });

    it('reflected flow descends the ring', () => {
        const anchor = flowing({
            direction: 'reflected',
            phase0: (2 * Math.PI * 6.5) / 12
        });
        expect(spandaTick12At(anchor, 0)).toBe(6);
        expect(spandaTick12At(anchor, STEP_MS)).toBe(5);
    });

    it('never extrapolates before the epoch', () => {
        const anchor = flowing({ epochMs: 10_000 });
        expect(spandaPhaseAt(anchor, 5_000)).toBe(spandaPhaseAt(anchor, 10_000));
    });
});
