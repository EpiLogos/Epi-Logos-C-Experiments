import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildM3ProjectionSurface,
    M3_TCT_NINE_OF_WANDS_CODON_ID,
    M3_TCT_NINE_OF_WANDS_ROTATIONAL_STATE_COUNT
} from '../src/common/codon-wheel';

// Minimal profile payload exercising only the fields buildM3ProjectionSurface
// reads. `codonId` and `rotationalStateCount` drive the TCT / Nine-of-Wands
// renderer-side surfacing rule under test here.
function payload(codonId: number, rotationalStateCount: number): Record<string, unknown> {
    return {
        tick: 0,
        degree720: 0,
        qCosmic: [0, 0, 0, 0],
        codonRotationProjection: {
            lens: 0,
            mode: 0,
            surfaceIndex: 0,
            codonId,
            codon: 'NNN',
            codonClass: 'non-dual',
            rotation: 0,
            rotationalStateCount,
            rotationDegrees: 0
        },
        mahamaya: {
            codonId,
            rotationalStateCount,
            datasetLutState: 'materialized'
        }
    };
}

function boundary(payloadValue: Record<string, unknown>): any {
    return Object.freeze({
        generation: 23,
        pointerAnchor: 'profile:pointer:tct',
        capabilities: Object.freeze(['profile.public-current']),
        payload: payloadValue
    });
}

function readiness(): any {
    return Object.freeze({
        state: 'ready_public_current',
        updatedAt: '2026-06-01T00:00:00.000Z',
        sources: Object.freeze([]),
        blockers: Object.freeze([])
    });
}

function coordinateContext(): any {
    return Object.freeze({
        canonicalMCoordinate: "M3'",
        pointerAnchor: 'pointer://s0-baseline',
        profileGeneration: 23
    });
}

function librarySummary(): any {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's2',
            handle: 's2://m3-library/summary/tct',
            bodyAllowed: false
        }),
        nonDualCodonCount: 40,
        dualCodonCount: 24,
        nonDualRotationalSlots: 7,
        dualRotationalSlots: 8
    });
}

function worldClock(): any {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's3',
            handle: 's3://world-clock/tct',
            bodyAllowed: false
        }),
        worldClockHandle: 's3://world-clock/2026-06-01T00:00:00Z',
        generation: 42,
        tick: 0,
        degree720: 0,
        source: 's3.world_clock',
        subscriptionMode: 'native-websocket'
    });
}

function kernelTraceHandle(): any {
    return Object.freeze({
        source: 'profile',
        handle: 'profile://kernel-trace/tct',
        bodyAllowed: true
    });
}

function surfaceFor(codonId: number, rotationalStateCount: number) {
    return buildM3ProjectionSurface({
        profile: boundary(payload(codonId, rotationalStateCount)),
        readiness: readiness(),
        context: coordinateContext(),
        emittedAt: 1_771_000_000_000,
        library: librarySummary(),
        worldClock: worldClock(),
        kernelTraceHandle: kernelTraceHandle()
    });
}

test('Nine-of-Wands codon 0x35 with rotationalStateCount 7 surfaces without the TCT blocker', () => {
    const surface = surfaceFor(M3_TCT_NINE_OF_WANDS_CODON_ID, M3_TCT_NINE_OF_WANDS_ROTATIONAL_STATE_COUNT);
    assert.equal(surface.activeProjection.codonId, 0x35);
    assert.equal(surface.activeProjection.rotationalStateCount, 7);
    assert.equal(surface.readiness.blockers.includes('tct-rotational-state-count-mismatch'), false);
    assert.equal(surface.readiness.surfaceReady, true);
});

test('Nine-of-Wands codon 0x35 with a non-7 rotationalStateCount blocks the surface', () => {
    const surface = surfaceFor(M3_TCT_NINE_OF_WANDS_CODON_ID, 5);
    assert.equal(surface.activeProjection.codonId, 0x35);
    assert.equal(surface.activeProjection.rotationalStateCount, 5);
    assert.equal(surface.readiness.blockers.includes('tct-rotational-state-count-mismatch'), true);
    assert.equal(surface.readiness.surfaceReady, false);
});

test('TCT rule only applies to codon 0x35 — other codons with non-7 counts do not trip it', () => {
    const surface = surfaceFor(0x00, 5);
    assert.equal(surface.activeProjection.codonId, 0x00);
    assert.equal(surface.readiness.blockers.includes('tct-rotational-state-count-mismatch'), false);
});

test('TCT constants pin the Nine-of-Wands codon id and required count', () => {
    assert.equal(M3_TCT_NINE_OF_WANDS_CODON_ID, 0x35);
    assert.equal(M3_TCT_NINE_OF_WANDS_ROTATIONAL_STATE_COUNT, 7);
});
