/**
 * Coordinate: M' M3' (pentadic inspector law — Tracks 36.3 + 04.T4.14)
 * Actualises: the 36.3 verification — the inspector renders 10+4+1, paired
 *   15+15, 24x15=360, 360+24=384, and the live trace fields FROM the profile
 *   payload; the altered-identity test fails any local recomputation table.
 */

import { describe, expect, it } from 'vitest';
import { buildPentadicInspectorView, pentadicTraceFromPayload } from './m3PentadicInspector';

const TRACE = {
    tick: 31,
    tick12: 7,
    helix: 1,
    position6: 1,
    sourceBinaryState: '0/1',
    wholeNumberEndpoint: 5,
    naturalNumberEndpoint: 6,
    familyBComplement: [1, 4],
    shemDegreeQuantum: 5,
    resonance72Index: 42,
    degree360: 210,
    m2ToM3Symbol: 37,
    mahamayaAddress64: 37,
    evolutionaryGap: 'm2-wholeness-gap',
    codonId: 37,
    codon: 'GTC',
    lineChangeOperator: 251,
    pairedMahamayaFifteens: [15, 15],
    backboneIdentity: '24x15=360',
    lineGraphIdentity: '360+24=384',
    qCosmicRef: 'q_cosmic://tick/31',
    provenance: ['portal_core::kernel/projections/pentadic_trace.rs::from_profile']
};

describe('m3 pentadic inspector view model (36.3 / 4.14)', () => {
    it('goes pending when the bus does not carry the trace — no sentinel fabrication', () => {
        const view = buildPentadicInspectorView({ payload: { tick12: 3 }, generation: 5 });
        expect(view.state).toBe('pending-anuttara-pentadic-trace');
        expect(view.trace).toBeNull();
    });

    it('rejects a malformed trace strictly (missing identity string)', () => {
        const { backboneIdentity: _dropped, ...partial } = TRACE;
        expect(pentadicTraceFromPayload({ anuttaraPentadicTrace: partial })).toBeNull();
    });

    it('renders the Maxwell witness as a labelled citation, never computed', () => {
        const view = buildPentadicInspectorView({ payload: {}, generation: 1 });
        expect(view.maxwell.label).toBe('15 = 10 + 4 + 1');
        expect(view.maxwell.parts.metricBody).toContain('10');
        expect(view.maxwell.parts.vectorConnection).toContain('4');
        expect(view.maxwell.parts.scalarFiber).toContain('1');
        expect(view.maxwell.provenance).toContain('register fact, not computed');
    });

    it('carries the paired fifteens + both identities + live fields verbatim from the payload', () => {
        const view = buildPentadicInspectorView({
            payload: { anuttaraPentadicTrace: TRACE },
            generation: 9
        });
        expect(view.state).toBe('ready');
        expect(view.trace?.pairedMahamayaFifteens).toEqual([15, 15]);
        expect(view.trace?.backboneIdentity).toBe('24x15=360');
        expect(view.trace?.lineGraphIdentity).toBe('360+24=384');
        expect(view.trace?.shemDegreeQuantum).toBe(5);
        expect(view.trace?.resonance72Index).toBe(42);
        expect(view.trace?.mahamayaAddress64).toBe(37);
        expect(view.trace?.codon).toBe('GTC');
        expect(view.trace?.qCosmicRef).toBe('q_cosmic://tick/31');
    });

    it('has NO local recomputation table: altered kernel identities render verbatim', () => {
        const altered = {
            ...TRACE,
            backboneIdentity: '24x15=360-ALTERED-BY-KERNEL',
            pairedMahamayaFifteens: [15, 16],
            m2ToM3Symbol: 99
        };
        const view = buildPentadicInspectorView({
            payload: { anuttaraPentadicTrace: altered },
            generation: 1
        });
        // The inspector is a window: whatever the kernel wrote is what shows.
        // (36.3: "tests fail on local recomputation tables" — a local table
        // would "correct" these values; the window must not.)
        expect(view.trace?.backboneIdentity).toBe('24x15=360-ALTERED-BY-KERNEL');
        expect(view.trace?.pairedMahamayaFifteens).toEqual([15, 16]);
        expect(view.trace?.m2ToM3Symbol).toBe(99);
    });

    it('unwraps the wire harmonicProfile nesting', () => {
        const view = buildPentadicInspectorView({
            payload: { harmonicProfile: { anuttaraPentadicTrace: TRACE } },
            generation: 1
        });
        expect(view.state).toBe('ready');
    });
});

describe('m3 pentadic inspector coupling-flow lane (4.14)', () => {
    it('shows the explicit pending chip while couplingFlowAlignment is not bussed', () => {
        const view = buildPentadicInspectorView({ payload: {}, generation: 1 });
        expect(view.couplingFlowState).toBe('pending-coupling-flow-alignment');
        expect(view.couplingFlow).toBeNull();
    });

    it('goes ready when the bus carries the projection (no local fabrication)', () => {
        const view = buildPentadicInspectorView({
            payload: { couplingFlowAlignment: { symbolicSkeletons: [] } },
            generation: 1
        });
        expect(view.couplingFlowState).toBe('ready');
    });
});
