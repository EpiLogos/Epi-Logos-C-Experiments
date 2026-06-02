import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    buildM1ProfileClockModel,
    buildM1RelationWalkStep
} = require('../m1-paramasiva/lib/common/clock-instrument.js');

const baselineProfile = JSON.parse(
    readFileSync(
        '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/contract-inventory/baseline-profile.json',
        'utf8'
    )
);

const SOURCE_ROOT =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m1-paramasiva/src';

function boundary(generation, payload = baselineProfile) {
    return {
        generation,
        pointerAnchor: 'S0/QL-meta',
        capabilities: ['readCurrentProfile'],
        payload
    };
}

function readiness(state = 'ready_public_current') {
    return {
        fetchedAt: Date.now(),
        state,
        reason: 'test',
        profileGeneration: 1,
        bridgeReachable: true,
        blockerIds: []
    };
}

const context = {
    selectedCoordinate: 'M1',
    hashInput: '#1',
    canonicalMCoordinate: 'M1',
    profileGeneration: 1,
    pointerAnchor: 'S0/QL-meta',
    dayNowSessionHandle: null,
    privacyClass: 'public_current_audio_metadata_only',
    provenance: { source: 'test', generation: 1, notes: [] }
};

test('M1 clock model displays profile fields from the real MathemeHarmonicProfile fixture', () => {
    const model = buildM1ProfileClockModel({
        profile: boundary(1),
        readiness: readiness(),
        context,
        relationDescriptors: [typedDescriptor()]
    });

    assert.equal(model.tick12, baselineProfile.tick12);
    assert.equal(model.degree720, baselineProfile.degree720);
    assert.equal(model.su2Layer, baselineProfile.su2Layer);
    assert.equal(model.phase, baselineProfile.phase);
    assert.equal(model.helix, baselineProfile.helix);
    assert.equal(model.position6, baselineProfile.position6);
    assert.equal(model.ratioRole, baselineProfile.ratioRole);
    assert.equal(model.lensMode.lens, baselineProfile.lensMode.lens);
    assert.equal(model.lensMode.mode, baselineProfile.lensMode.mode);
    assert.equal(model.cfVakProjection.contextFrame, baselineProfile.contextFrames.activeFrame);
    assert.equal(model.cfVakProjection.contextAgent, baselineProfile.contextFrames.activeAgent);
    assert.equal(model.cfVakProjection.vakRegister, baselineProfile.diatonic.vakRegister);
});

test('M1 84-state surface is built from profile ring/frame counts and has no duplicate cells', () => {
    const model = buildM1ProfileClockModel({
        profile: boundary(2),
        readiness: readiness(),
        context,
        relationDescriptors: [typedDescriptor()]
    });

    assert.equal(model.landscape.lensCount, baselineProfile.pointerAnchor.lensRingSize);
    assert.equal(model.landscape.modeCount, baselineProfile.contextFrames.frameCount);
    assert.equal(model.landscape.totalCells, 84);
    assert.equal(model.landscape.cells.length, 84);
    assert.equal(new Set(model.landscape.cells.map(cell => `${cell.lens}:${cell.mode}`)).size, 84);
    assert.equal(model.landscape.cells.filter(cell => cell.active).length, 1);
});

test('M1 consumes audioOctet and nodalQuartet exactly from the kernel profile', () => {
    const model = buildM1ProfileClockModel({
        profile: boundary(3),
        readiness: readiness(),
        context,
        relationDescriptors: [typedDescriptor()]
    });

    assert.deepEqual(model.audioBus.audioOctetHz, baselineProfile.audioOctet);
    assert.deepEqual(model.audioBus.nodalQuartet, baselineProfile.nodalQuartet);
    assert.equal(model.audioBus.exactProfileSource, true);
    assert.equal(model.audioBus.authority, 'S0/S2 profile bus');
});

test('M1 relation walk stays blocked until S2 typed harmonic descriptors are present', () => {
    const model = buildM1ProfileClockModel({
        profile: boundary(4),
        readiness: readiness(),
        context
    });

    assert.equal(model.readiness.relationWalkReady, false);
    assert.equal(model.readiness.state, 's2_graph_blocked');
    assert.deepEqual(model.readiness.blockers, [
        'Track 02 typed harmonic pointer relation descriptors missing'
    ]);
});

test('M1 relation walk event preserves exact profile Hz and emits Klein source event on tritone flip', () => {
    const step = buildM1RelationWalkStep({
        previousProfile: boundary(10),
        currentProfile: boundary(11),
        descriptor: typedDescriptor({ kleinFlip: true, sourceHz: baselineProfile.audioOctet[3] }),
        emittedAt: 123456
    });

    assert.equal(step.previousProfileGeneration, 10);
    assert.equal(step.currentProfileGeneration, 11);
    assert.equal(step.sourceHz, baselineProfile.audioOctet[3]);
    assert.deepEqual(step.audioOctetHz, baselineProfile.audioOctet);
    assert.deepEqual(step.nodalQuartet, baselineProfile.nodalQuartet);
    assert.deepEqual(
        step.observabilityEvents.map(event => event.type),
        ['m1.walk.step', 'm1.klein_flip.source']
    );
    assert.equal(step.observabilityEvents[0].payload.privacyClass, 'public_current_audio_metadata_only');
});

test('M1 topology inspector reads substrate values from profile payload and keeps M0/M3 boundaries explicit', () => {
    const profileWithTopology = {
        ...baselineProfile,
        m1Topology: {
            doubleCoverDeg: 720,
            torusGenus: 1,
            hopfIdentity: 'S3 -> S2 -> S1 Hopf identity',
            k2TritoneCrossing: 'Lens N to Lens N+3 tritone crossing',
            m1OriginKleinFlip: 'M1-origin Klein flip signal'
        }
    };
    const model = buildM1ProfileClockModel({
        profile: boundary(5, profileWithTopology),
        readiness: readiness(),
        context,
        relationDescriptors: [typedDescriptor()]
    });

    assert.equal(model.topology.doubleCoverDeg, 720);
    assert.equal(model.topology.torusGenus, 1);
    assert.match(model.topology.parentAttribution, /M1-5 is the \+1 parent/);
    assert.match(model.topology.priorGround, /M0 is the prior 0\/1 ground/);
    assert.match(model.topology.downstreamDoubleTorus, /M3-5/);
    assert.equal(model.topology.source, 'kernel/profile topology payload');
});

test('m1-paramasiva source does not define frontend substrate-law numeric constants', () => {
    const offenses = [];
    for (const file of walk(SOURCE_ROOT)) {
        const content = readFileSync(file, 'utf8');
        if (/\b(?:DOUBLE_COVER_DEG|TORUS_GENUS)\s*(?:=|:)\s*(?:720|1)\b/.test(content)) {
            offenses.push(file);
        }
        if (/\bconst\s+(?:AUDIO_OCTET|NODAL_QUARTET|RING_QUATERNION_LUT|QL_TRIG_TABLE)\b/.test(content)) {
            offenses.push(file);
        }
    }
    assert.deepEqual(offenses, []);
});

function typedDescriptor(overrides = {}) {
    return {
        edgeId: 'edge://m1/test',
        fromCoordinate: 'M1-0',
        toCoordinate: 'M1-5',
        reasonCode: 'tritone_mirror_candidate',
        relationLaw: 'Lens N ↔ Lens N+3',
        sourceHz: baselineProfile.audioOctet[0],
        privacyPolicy: 'public-current audio metadata only',
        depositionPolicy: 'defer-to-session-governance',
        kleinFlip: false,
        ...overrides
    };
}

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stats = statSync(full);
        if (stats.isDirectory()) {
            if (entry !== 'lib' && entry !== 'node_modules') out.push(...walk(full));
        } else if (['.ts', '.tsx', '.mjs', '.js'].includes(extname(entry))) {
            out.push(full);
        }
    }
    return out;
}
