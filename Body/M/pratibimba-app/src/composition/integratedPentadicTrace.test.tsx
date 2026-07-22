/**
 * Coordinate: M' integrated pentadic-trace overlay + advance-event law (29.T29.15)
 * Actualises: the 29.15 verification — the typed envelope binds trace +
 *   generation (trace tick) + readiness + slots off ONE profile payload, and
 *   the advance hook emits `composition.pentadic_trace.advance` ONLY when the
 *   trace generation really changes (first appearance or a new tick), never on
 *   an unchanged re-render, never while the trace is absent.
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useEventsStore } from '../state/eventsStore';
import {
    compositionEventsFromEntries,
    useCompositionPentadicTraceEvents
} from './compositionEvents';
import {
    buildIntegratedPentadicTraceOverlay,
    INTEGRATED_PENTADIC_COSMIC_SLOTS,
    INTEGRATED_PENTADIC_PERSONAL_SLOTS,
    type IntegratedPentadicTraceOverlay
} from './integratedPentadicTrace';

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
    codonId: 37,
    codon: 'GTC',
    lineChangeOperator: 251,
    pairedMahamayaFifteens: [15, 15],
    backboneIdentity: '24x15=360',
    lineGraphIdentity: '360+24=384',
    qCosmicRef: 'q_cosmic://tick/31',
    thirdSpanda: {
        m1: {
            priorGround: 'M0 is the prior 0/1 ground',
            parentAttribution: 'M1-5 is the +1 parent',
            degree720: 420,
            hopfFiber: 1,
            ringQuaternion: [-0.8660254, -0.5, 0, 0],
            advancementAddress64: 35
        },
        m2: {
            address72: 42,
            axisViews: {
                mef: { lens: 7, position: 0, isInverted: true, lFamilyLink: 1 },
                tattva: { tattvaIndex: 21, phase: 0 },
                decan: { elementId: 0, sign: 1, decan: 0, face: 0, rulingPlanet: 3 },
                shem: { shemIdx: 42, choir: 4, position: 6, elementId: 2, decanLink: 42 },
                maqam: { index72: 42, family: 5, modeInFamily: 5, planetRuler: 3 },
                det: { index72: 42, compressed64: 37, det64: 137438953472 }
            }
        },
        epogdoon: {
            ratioNumerator: 9,
            ratioDenominator: 8,
            sourceAddress72: 42,
            blockIndex: 4,
            blockPhase: 6,
            compressedAddress64: 37,
            expandedAddress72: 41,
            roundTripExact: false,
            roundTripLoss: 1,
            collision: null,
            cardinality: {
                blockSize: 9,
                blockCount: 8,
                collisionPairCount: 8,
                exactRoundTripCount: 8,
                nonExactRoundTripCount: 64
            }
        },
        m3: {
            detReceptionAddress64: 37,
            worldClockAddress64: 37,
            codonId: 37,
            codon: 'GTC',
            codonRotation: {
                lens: 7,
                mode: 0,
                lensLabel: "L1'",
                modeName: 'Ionian',
                surfaceIndex: 394,
                codonId: 53,
                codon: 'TCC',
                codonClass: 'non-dual',
                rotation: 2,
                rotationalStateCount: 7,
                rotationDegrees: 90,
                reverseLens: 7,
                reverseMode: 0,
                datasetLutState: 'materialized-kernel-lut',
                provenance: 'portal-core::codon_rotation_projection 84↔472 surface LUT'
            },
            transcriptionState: 'compressed-nonexact-round-trip',
            lineChangeOperator: 251
        }
    },
    provenance: ['portal_core::pentadic_trace::from_profile']
};

/** A live profile payload whose kernel tick matches its trace tick (ready). */
function payloadAtTick(tick: number): Record<string, unknown> {
    return { tick, anuttaraPentadicTrace: { ...TRACE, tick } };
}

function advanceEvents() {
    return compositionEventsFromEntries(useEventsStore.getState().events).filter(
        event => event.type === 'composition.pentadic_trace.advance'
    );
}

describe('buildIntegratedPentadicTraceOverlay (29.15 envelope)', () => {
    it('is null when there is no payload or no trace — never a fabricated generation', () => {
        expect(buildIntegratedPentadicTraceOverlay(null)).toBeNull();
        expect(buildIntegratedPentadicTraceOverlay({ tick: 31 })).toBeNull();
    });

    it('binds the verbatim trace, the trace tick as generation, ready readiness, and fixed slots', () => {
        const overlay = buildIntegratedPentadicTraceOverlay(payloadAtTick(31));
        expect(overlay).not.toBeNull();
        expect(overlay!.generation).toBe(31);
        expect(overlay!.trace.tick).toBe(31);
        expect(overlay!.trace.codon).toBe('GTC');
        expect(overlay!.readiness.state).toBe('ready');
        expect(overlay!.readiness.generationsAgree).toBe(true);
        expect(overlay!.cosmicSlots).toBe(INTEGRATED_PENTADIC_COSMIC_SLOTS);
        expect(overlay!.personalSlots).toBe(INTEGRATED_PENTADIC_PERSONAL_SLOTS);
        expect(overlay!.cosmicSlots.tickSurface).toBe('m1-paramasiva-played-torus');
        expect(overlay!.personalSlots.recognitionConsumer).toBe('m5-epii');
    });

    it('reports a stale readiness when the profile tick disagrees with the trace tick', () => {
        const overlay = buildIntegratedPentadicTraceOverlay({
            tick: 32,
            anuttaraPentadicTrace: { ...TRACE, tick: 31 }
        });
        // the trace is present (generation reads the trace's own tick) but the
        // profile generation disagrees — the aggregate flags it stale, verbatim.
        expect(overlay).not.toBeNull();
        expect(overlay!.generation).toBe(31);
        expect(overlay!.readiness.state).toBe('stale-trace-generation');
    });
});

describe('useCompositionPentadicTraceEvents (29.15 advance emission)', () => {
    beforeEach(() => useEventsStore.setState({ events: [] }));

    it('emits only on a real trace-generation change, never on an unchanged re-render or an absent trace', () => {
        const overlay31 = buildIntegratedPentadicTraceOverlay(payloadAtTick(31));
        const { rerender } = renderHook(
            (props: { overlay: IntegratedPentadicTraceOverlay | null; generation: number | null }) =>
                useCompositionPentadicTraceEvents('cosmic-engine.integrated', props.overlay, props.generation),
            { initialProps: { overlay: overlay31, generation: 31 } }
        );

        // first appearance of the trace IS an advance (null -> 31)
        expect(advanceEvents()).toHaveLength(1);
        expect(advanceEvents()[0].payload).toEqual({ traceGeneration: 31, previousGeneration: null });

        // an unchanged re-render (same overlay generation) does NOT re-emit.
        // RED-PROOF: change this to `toHaveLength(2)` and the test fails — the
        // hook does not fire when the generation is unchanged.
        rerender({ overlay: overlay31, generation: 31 });
        expect(advanceEvents()).toHaveLength(1);

        // a new trace generation DOES emit, carrying the delta
        const overlay32 = buildIntegratedPentadicTraceOverlay(payloadAtTick(32));
        rerender({ overlay: overlay32, generation: 32 });
        expect(advanceEvents()).toHaveLength(2);
        expect(advanceEvents()[1].payload).toEqual({ traceGeneration: 32, previousGeneration: 31 });
        expect(advanceEvents()[1].compositionId).toBe('cosmic-engine.integrated');

        // the trace going absent emits nothing (never on an absent trace)
        rerender({ overlay: null, generation: 33 });
        expect(advanceEvents()).toHaveLength(2);
    });

    it('carries the profile generation on the observability record', () => {
        const overlay = buildIntegratedPentadicTraceOverlay(payloadAtTick(31));
        renderHook(() =>
            useCompositionPentadicTraceEvents('jiva-siva.integrated', overlay, 99)
        );
        const [event] = advanceEvents();
        expect(event.compositionId).toBe('jiva-siva.integrated');
        expect(event.profileGeneration).toBe(99);
    });
});
