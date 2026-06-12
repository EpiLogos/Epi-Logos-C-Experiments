import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    buildM1ProfileClockModel,
    buildM1RelationWalkStep,
    buildM1KleinTopologyView
} = require('../m1-paramasiva/lib/common/clock-instrument.js');
const {
    M1Cl42SignatureInspector
} = require('../m1-paramasiva/lib/browser/m1-cl42-signature-inspector.js');
const {
    M1KleinFlipEventStrip
} = require('../m1-paramasiva/lib/browser/m1-klein-flip-event-strip.js');

const baselineProfile = JSON.parse(
    readFileSync(
        '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/contract-inventory/baseline-profile.json',
        'utf8'
    )
);

const SOURCE_ROOT =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m1-paramasiva/src';
const CONTRACT_PATH =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json';
const M1_HEADER_PATH =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-lib/include/m1.h';

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

test('m1.paramasiva.kleinTopology view wires bridge topology invariants (doubleCoverDeg=720, torusGenus=1)', () => {
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
    const view = buildM1KleinTopologyView({
        profile: boundary(20, profileWithTopology),
        context,
        emittedAt: 999
    });

    assert.equal(view.topology.doubleCoverDeg, 720);
    assert.equal(view.topology.torusGenus, 1);
    assert.equal(view.topology.hopfIdentity, 'S3 -> S2 -> S1 Hopf identity');
    assert.equal(view.topology.source, 'kernel/profile topology payload');
    assert.match(view.topology.parentAttribution, /M1-5 is the \+1 parent/);
});

test('m1.paramasiva.kleinTopology stays quiet when klein_flip is None', () => {
    const view = buildM1KleinTopologyView({
        profile: boundary(21),
        context,
        emittedAt: 999
    });

    assert.equal(baselineProfile.kleinFlip, null);
    assert.equal(view.kleinFlip.present, false);
    assert.deepEqual(view.observabilityEvents, []);
});

test('m1.klein_flip.source observability event fires on a synthetic profile with klein_flip=Some(...)', () => {
    const profileWithFlip = {
        ...baselineProfile,
        kleinFlip: {
            fromLens: 0,
            toLens: 3,
            tritone: true,
            reasonCode: 'tritone_mirror'
        },
        m1Topology: {
            doubleCoverDeg: 720,
            torusGenus: 1,
            hopfIdentity: 'S3 -> S2 -> S1 Hopf identity',
            k2TritoneCrossing: 'Lens N to Lens N+3 tritone crossing',
            m1OriginKleinFlip: 'M1-origin Klein flip signal'
        },
        anandaVortex: {
            ...baselineProfile.anandaVortex,
            kleinFlipAtThisTick: true
        }
    };
    const view = buildM1KleinTopologyView({
        profile: boundary(22, profileWithFlip),
        context,
        emittedAt: 424242
    });

    assert.equal(view.kleinFlip.present, true);
    assert.equal(view.kleinFlip.tickFlip, true);
    assert.equal(view.observabilityEvents.length, 1);
    const event = view.observabilityEvents[0];
    assert.equal(event.type, 'm1.klein_flip.source');
    assert.equal(event.extensionId, 'm1-paramasiva');
    assert.equal(event.emittedAt, 424242);
    assert.equal(event.payload.m1Origin, true);
    assert.equal(event.payload.privacyClass, 'public_current_audio_metadata_only');
    assert.equal(event.payload.doubleCoverDeg, 720);
    assert.equal(event.payload.torusGenus, 1);
    assert.deepEqual(event.payload.kleinFlip, profileWithFlip.kleinFlip);
});

test('m1.paramasiva.cl42SignatureInspector renders six canonical QL trig positions and signatures', () => {
    const html = renderInspector({
        ...baselineProfile,
        anandaVortex: {
            ...baselineProfile.anandaVortex,
            qlTrigTable: canonicalQlTrigTable()
        }
    });

    for (const row of canonicalQlTrigTable()) {
        assert.match(html, new RegExp(`data-test="m1-cl42-position-${row.position}"`));
        assert.match(html, new RegExp(`P${row.position}`));
        assert.match(html, new RegExp(`>${row.name}<`));
        assert.match(html, new RegExp(`signature-${row.cl42Signature}`));
    }
    assert.match(html, />tan</);
    assert.match(html, /\[0\]\/\[5\]/);
});

test('m1.paramasiva.cl42SignatureInspector halo swatch follows active Cl(4,2) signature', () => {
    for (const position6 of [0, 5]) {
        const html = renderInspector(profileWithCl42Position(position6));
        assert.match(
            html,
            new RegExp(`data-test="m1-cl42-halo-${position6}"[^>]*m1-cl42-halo-indigo`)
        );
        assert.match(
            html,
            new RegExp(`data-test="m1-cl42-position-${position6}"[^>]*m1-cl42-position-active`)
        );
    }

    for (const position6 of [1, 2, 3, 4]) {
        const html = renderInspector(profileWithCl42Position(position6));
        assert.match(
            html,
            new RegExp(`data-test="m1-cl42-halo-${position6}"[^>]*m1-cl42-halo-warm`)
        );
        assert.match(
            html,
            new RegExp(`data-test="m1-cl42-position-${position6}"[^>]*m1-cl42-position-active`)
        );
    }
});

test('m1.paramasiva.cl42SignatureInspector renders 9/8 derivation and tick12 highlight', () => {
    const html = renderInspector({
        ...baselineProfile,
        tick12: 7,
        anandaVortex: {
            ...baselineProfile.anandaVortex,
            qlTrigTable: canonicalQlTrigTable()
        }
    });

    assert.match(html, /\(4\/3\) × \(3\/2\) = 2\/1/);
    assert.match(html, /\(3\/2\) ÷ \(4\/3\) = 9\/8/);
    assert.match(html, /epogdoon-tick/);
    assert.match(html, /data-test="m1-cl42-tick-7"[^>]*m1-cl42-tick-active/);
});

test('m1.paramasiva.kleinFlipEventStrip renders a horizontal scroll-strip with time axis', () => {
    const html = renderKleinFlipStrip(kleinFlipStripPayload());

    assert.match(html, /data-test="m1-klein-flip-scroll-strip"/);
    assert.match(html, /data-test="m1-klein-flip-time-axis"/);
    assert.match(html, />past</);
    assert.match(html, />current</);
    assert.match(html, />future-projected</);
});

test('m1.paramasiva.kleinFlipEventStrip renders event bar tick index and flipped from-to labels', () => {
    const html = renderKleinFlipStrip(kleinFlipStripPayload());

    assert.match(html, /data-test="m1-klein-flip-event-bar"/);
    assert.match(html, /data-test="m1-klein-flip-tick-index"[^>]*>tick 6</);
    assert.match(html, /data-test="m1-klein-flip-from-to"[^>]*>lens 0 -&gt; lens 6</);
});

test('m1.paramasiva.kleinFlipEventStrip highlights the active event at current position6', () => {
    const html = renderKleinFlipStrip(kleinFlipStripPayload({ position6: 3 }));

    assert.match(html, /data-test="m1-klein-flip-event-bar"[^>]*data-active="true"/);
    assert.match(html, /data-test="m1-klein-flip-current-tick"[^>]*>tick12=6 · position6=3/);
    assert.match(html, /title="[^"]*dipyramid-face 3 -&gt; 0[^"]*torus_genus=1[^"]*720-step=720 -&gt; 360[^"]*trigger=m1TritoneCrossing/);
});

test('m1.paramasiva.cl42SignatureInspector is registered in common view ids and contract preflight', () => {
    const commonSource = readFileSync(join(SOURCE_ROOT, 'common/index.ts'), 'utf8');
    const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8'));
    const m1 = contract.extensions.find(extension => extension.id === 'm1-paramasiva');

    assert.match(commonSource, /m1\.paramasiva\.cl42SignatureInspector/);
    assert.ok(m1.viewIds.includes('m1.paramasiva.cl42SignatureInspector'));
});

test('m1.paramasiva.kleinFlipEventStrip is registered in common view ids and contract preflight', () => {
    const commonSource = readFileSync(join(SOURCE_ROOT, 'common/index.ts'), 'utf8');
    const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8'));
    const m1 = contract.extensions.find(extension => extension.id === 'm1-paramasiva');

    assert.match(commonSource, /m1\.paramasiva\.kleinFlipEventStrip/);
    assert.ok(m1.viewIds.includes('m1.paramasiva.kleinFlipEventStrip'));
});

test('m1-paramasiva source does not define frontend substrate-law numeric constants', () => {
    const offenses = [];
    for (const file of walk(SOURCE_ROOT)) {
        const content = readFileSync(file, 'utf8');
        if (/\bconst\s+(?:DOUBLE_COVER_DEG|TORUS_GENUS)\s*(?:=|:)\s*(?:720|1)\b/.test(content)) {
            offenses.push(file);
        }
        if (/\bconst\s+(?:AUDIO_OCTET|NODAL_QUARTET|RING_QUATERNION_LUT|QL_TRIG_TABLE)\b/.test(content)) {
            offenses.push(file);
        }
        if (
            file.endsWith('m1-cl42-signature-inspector.tsx') &&
            /CL42_BASIS\s*=\s*\[|QL_TRIG_TABLE\s*=\s*\[/.test(content)
        ) {
            offenses.push(file);
        }
    }
    assert.deepEqual(offenses, []);
});

function renderInspector(payload) {
    return renderToStaticMarkup(
        React.createElement(M1Cl42SignatureInspector, {
            profile: boundary(42, payload),
            readiness: readiness(),
            context
        })
    );
}

function renderKleinFlipStrip(payload) {
    return renderToStaticMarkup(
        React.createElement(M1KleinFlipEventStrip, {
            profile: boundary(72, payload)
        })
    );
}

function kleinFlipStripPayload(overrides = {}) {
    const position6 = overrides.position6 ?? 3;
    return {
        ...baselineProfile,
        tick12: 6,
        degree720: 360,
        position6,
        kleinFlip: {
            kind: 'm1TritoneCrossing',
            tick12: 6,
            lens_pair: [0, 6],
            triggerSource: 'm1TritoneCrossing'
        },
        m1Topology: {
            doubleCoverDeg: 720,
            torusGenus: 1,
            hopfIdentity: 'S3 -> S2 -> S1 Hopf identity',
            k2TritoneCrossing: 'Lens N to Lens N+3 tritone crossing',
            m1OriginKleinFlip: 'M1-origin Klein flip signal'
        },
        ananda_vortex: {
            ...baselineProfile.anandaVortex,
            active_cell_value: {
                ...baselineProfile.anandaVortex.activeCellValue,
                position_p: position6
            },
            klein_flip_at_this_tick: true
        }
    };
}

function profileWithCl42Position(position6) {
    const row = canonicalQlTrigTable()[position6];
    return {
        ...baselineProfile,
        position6,
        anandaVortex: {
            ...baselineProfile.anandaVortex,
            cl42SignatureAtPosition: row.cl42Signature,
            qlTrigTable: canonicalQlTrigTable()
        }
    };
}

function canonicalQlTrigTable() {
    const content = readFileSync(M1_HEADER_PATH, 'utf8');
    return Array.from(
        content.matchAll(
            /\[(\d)\]\s*=\s*\{\s*"([^"]+)",\s*"([^"]+)",\s*([^,]+),\s*([^,]+),\s*([+-]?\d)\s*\}/g
        ),
        match => ({
            position: Number(match[1]),
            name: match[2],
            formula: match[3],
            numeratorPos: match[4].trim() === 'TRIG_UNITY' ? 6 : Number(match[4]),
            denominatorPos: match[5].trim() === 'TRIG_UNITY' ? 6 : Number(match[5]),
            cl42Signature: Number(match[6])
        })
    );
}

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
