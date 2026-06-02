import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const baselineProfile = JSON.parse(
    readFileSync(
        '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/contract-inventory/baseline-profile.json',
        'utf8'
    )
);
const {
    buildM3ProjectionSurface,
    resolveM3ScalarOracleRef,
    validateM3LibrarySummary,
    M3_EXPECTED_ROTATIONAL_STATES
} = require('../m3-mahamaya/lib/common/index.js');

const SOURCE_FILE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/common/codon-wheel.ts';

function boundary(generation, payload = baselineProfile) {
    return Object.freeze({
        generation,
        pointerAnchor: 'profile:pointer:baseline',
        capabilities: Object.freeze(['profile.public-current']),
        payload
    });
}

function readiness(state = 'ready_public_current') {
    return Object.freeze({
        state,
        updatedAt: '2026-06-01T00:00:00.000Z',
        sources: Object.freeze([]),
        blockers: Object.freeze([])
    });
}

function coordinateContext() {
    return Object.freeze({
        canonicalMCoordinate: "M3'",
        pointerAnchor: 'pointer://s0-baseline',
        profileGeneration: 23
    });
}

function librarySummary(extra = {}) {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's2',
            handle: 's2://m3-library/summary/baseline',
            bodyAllowed: false
        }),
        nonDualCodonCount: 40,
        dualCodonCount: 24,
        nonDualRotationalSlots: 7,
        dualRotationalSlots: 8,
        scalarRefDetails: Object.freeze({
            'codon:AAA': Object.freeze({
                codon: 'AAA',
                hexagram: 'H01',
                detailSource: 'S2 canonical M3 library'
            }),
            'tarot:minor:00': Object.freeze({
                tarotRef: 'tarot:minor:00',
                detailSource: 'S2 canonical M3 library'
            })
        }),
        ...extra
    });
}

function worldClock() {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's3',
            handle: 's3://world-clock/baseline',
            bodyAllowed: false
        }),
        worldClockHandle: 's3://world-clock/2026-06-01T00:00:00Z',
        generation: 42,
        tick: baselineProfile.tick,
        degree720: baselineProfile.degree720,
        source: 's3.world_clock',
        subscriptionMode: 'native-websocket'
    });
}

function kernelTraceHandle() {
    return Object.freeze({
        source: 'profile',
        handle: 'profile://kernel-trace/baseline',
        bodyAllowed: true
    });
}

function surface(overrides = {}) {
    return buildM3ProjectionSurface({
        profile: boundary(23),
        readiness: readiness(),
        context: coordinateContext(),
        emittedAt: 1_771_000_000_000,
        library: librarySummary(),
        worldClock: worldClock(),
        kernelTraceHandle: kernelTraceHandle(),
        ...overrides
    });
}

test('M3 library summary proves 40 non-dual x 7 plus 24 dual x 8 equals 472', () => {
    const summary = validateM3LibrarySummary(librarySummary());
    assert.equal(summary.nonDualStates, 280);
    assert.equal(summary.dualStates, 192);
    assert.equal(summary.totalRotationalStates, M3_EXPECTED_ROTATIONAL_STATES);
    assert.equal(summary.matchesM3Spec, true);

    const bad = validateM3LibrarySummary(librarySummary({ dualCodonCount: 23 }));
    assert.equal(bad.matchesM3Spec, false);
});

test('same profile input renders the same backend-provided lens-mode to codon projection', () => {
    const first = surface();
    const second = surface();
    assert.deepEqual(first.activeProjection, second.activeProjection);
    assert.equal(first.activeProjection.lens, baselineProfile.codonRotationProjection.lens);
    assert.equal(first.activeProjection.mode, baselineProfile.codonRotationProjection.mode);
    assert.equal(first.activeProjection.codonId, baselineProfile.codonRotationProjection.codonId);
    assert.equal(first.activeProjection.rotation, baselineProfile.codonRotationProjection.rotation);
    assert.equal(first.activeProjection.rotationalStateCount, baselineProfile.codonRotationProjection.rotationalStateCount);
    assert.equal(first.wheelSummary.totalRotationalStates, 472);
});

test('M3-0 provenance strip renders backend 72-index, DET result, 64-address, and gap state only', () => {
    const model = surface();
    const source72 = baselineProfile.mahamaya.m2VibrationIndex;
    assert.equal(model.m30ProvenanceStrip.m2SourceIndex72, source72);
    assert.equal(model.m30ProvenanceStrip.detResult64, Math.floor(source72 * 8 / 9));
    assert.equal(model.m30ProvenanceStrip.mahamayaAddress64, baselineProfile.mahamaya.mahamayaAddress64);
    assert.equal(model.m30ProvenanceStrip.gapState, 'no-gap');
    assert.equal(model.m30ProvenanceStrip.privatePlanetaryChakralInterpretation, 'not-rendered');
    assert.equal('planetaryChakralMeaning' in model.m30ProvenanceStrip, false);
});

test('flat wheel, double-torus world-clock, and Janus views share one active tick/codon/lens state', () => {
    const model = surface();
    const flat = model.depthViews.flatClock;
    const torus = model.depthViews.doubleTorusWorldClock;
    const janus = model.depthViews.janusOverlay;
    for (const key of ['tick', 'degree720', 'codonId', 'codon', 'rotation', 'lens', 'mode']) {
        assert.equal(flat[key], torus[key], `${key} diverged between flat and torus`);
        assert.equal(flat[key], janus[key], `${key} diverged between flat and janus`);
    }
    assert.equal(torus.worldClockHandle, 's3://world-clock/2026-06-01T00:00:00Z');
    assert.equal(torus.worldClockGeneration, 42);
    assert.equal(torus.worldClockSource, 's3.world_clock');
    assert.equal(torus.subscriptionMode, 'native-websocket');
    assert.equal(torus.tickMatchesProfile, true);
    assert.equal(torus.degree720MatchesProfile, true);
});

test('primary M3 surface binds S3 world_clock generation and blocks drift from kernel profile', () => {
    const model = surface();
    const projectionEvent = model.observabilityEvents.find(event => event.type === 'm3.codon_projection');
    assert.equal(projectionEvent.payload.worldClock.state, 's3_world_clock_bound');
    assert.equal(projectionEvent.payload.worldClock.generation, 42);
    assert.equal(projectionEvent.payload.worldClock.worldClockHandle, 's3://world-clock/2026-06-01T00:00:00Z');
    assert.equal(projectionEvent.payload.worldClock.source, 's3.world_clock');
    assert.equal(projectionEvent.payload.worldClock.subscriptionMode, 'native-websocket');
    assert.equal(projectionEvent.payload.worldClock.tickMatchesProfile, true);
    assert.equal(projectionEvent.payload.worldClock.degree720MatchesProfile, true);

    const drifted = surface({
        worldClock: Object.freeze({
            ...worldClock(),
            tick: baselineProfile.tick + 1
        })
    });
    assert.equal(drifted.readiness.surfaceReady, false);
    assert.equal(drifted.readiness.state, 'authority_payload_missing');
    assert.match(
        drifted.readiness.blockers.join('\n'),
        /world_clock tick does not match current kernel profile tick/
    );
});

test('m3-mahamaya source contains no frontend codon, tarot, I-Ching, planetary, or reward authority tables', () => {
    const source = readFileSync(SOURCE_FILE, 'utf8');
    assert.doesNotMatch(source, /(?:CODON|TAROT|I_CHING|HEXAGRAM|PLANETARY|REWARD)_LUT/);
    assert.doesNotMatch(source, /codonTable|tarotDeck|hexagramTable|planetaryTable|rewardTrainingTable/);
    assert.doesNotMatch(source, /\[\s*(?:-?\d+(?:\.\d+)?\s*,\s*){8,}-?\d+(?:\.\d+)?\s*\]/);
});

test('oracle scalar resolver uses safe S2 details and rejects protected artifact bodies', () => {
    const resolved = resolveM3ScalarOracleRef({
        ref: Object.freeze({
            refKind: 'codon',
            scalarRef: 'codon:AAA',
            protectedArtifactHandle: 'm4://nara/artifact/opaque-123'
        }),
        library: librarySummary()
    });
    assert.equal(resolved.protectedArtifactBodyLoaded, false);
    assert.equal(resolved.detail.codon, 'AAA');
    assert.equal(resolved.detailState, 'resolved-from-s2-library');

    assert.throws(
        () =>
            resolveM3ScalarOracleRef({
                ref: Object.freeze({
                    refKind: 'tarot',
                    scalarRef: 'tarot:minor:00',
                    protectedArtifactHandle: 'm4://nara/artifact/opaque-456',
                    protectedArtifactBody: 'private reading body must not enter M3'
                }),
                library: librarySummary()
            }),
        /must not receive protected-local artifact bodies/
    );
});
