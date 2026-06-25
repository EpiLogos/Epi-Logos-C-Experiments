import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};
        setAttribute() {
            return undefined;
        }
        removeAttribute() {
            return undefined;
        }
        matches() {
            return false;
        }
    };
}
if (!globalThis.document) {
    globalThis.document = {
        documentElement: new globalThis.Element(),
        createElement: () => new globalThis.Element(),
        querySelectorAll: () => [],
        queryCommandSupported: () => false
    };
}
if (!globalThis.window) {
    globalThis.window = {
        WebAssembly: globalThis.WebAssembly,
        navigator: { userAgent: 'node-test' },
        document: globalThis.document,
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
try {
    const { FrontendApplicationConfigProvider } = require('@theia/core/lib/browser/frontend-application-config-provider');
    FrontendApplicationConfigProvider.set({ applicationName: 'M3 Mahamaya node test' });
} catch (err) {
    if (!String(err?.message ?? err).includes('already set')) {
        throw err;
    }
}
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
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    ThirdSpandaMathemeProofPanel,
    couplingFlowAlignmentFromProfilePayload
} = require('../m3-mahamaya/lib/browser/components/ThirdSpandaMathemeProofPanel.js');
const {
    M3PentadicRelationInspector,
    pentadicRelationModelFromProfilePayload
} = require('../m3-mahamaya/lib/browser/components/M3PentadicRelationInspector.js');
const {
    M3CosmicWheelRenderService,
    fibonacciGroundModelFromProfilePayload
} = require('../m3-mahamaya/lib/browser/components/M3CosmicWheelRenderService.js');
const {
    profileTickFromProfile
} = require('../m3-mahamaya/lib/browser/context/M3ProfileTickContext.js');
const {
    M3PentadicTraceService
} = require('../m3-mahamaya/lib/browser/services/m3-pentadic-trace-service.js');
const {
    buildM3CodonRotationProjectionForLensRing
} = require('../m3-mahamaya/lib/browser/composition/M3CodonRotationProjectionForLensRing.js');

const SOURCE_FILE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/common/codon-wheel.ts';
const THIRD_SPANDA_PANEL_SOURCE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/ThirdSpandaMathemeProofPanel.tsx';
const PENTADIC_RELATION_INSPECTOR_SOURCE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3PentadicRelationInspector.tsx';
const COSMIC_WHEEL_SOURCE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3CosmicWheelRenderService.tsx';

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

test('M3 lens-ring projection is a pure read-only descriptor export', () => {
    const model = surface();
    const first = buildM3CodonRotationProjectionForLensRing(model);
    const second = buildM3CodonRotationProjectionForLensRing(model);

    assert.deepEqual(first, second);
    assert.equal(first.activeRingIndex, 0);
    assert.equal(first.rotationPhase, 0);
    assert.deepEqual(first.cells, [
        {
            ringIndex: 0,
            cellIndex: 0,
            positionLabel: 'P0/dipyramid-north',
            codonTriple: 'AAA',
            aminoAcid: undefined,
            colourHsla: 'hsla(210, 72%, 52%, 0.92)'
        }
    ]);
    assert.equal(Object.isFrozen(first), true);
    assert.equal(Object.isFrozen(first.cells), true);
    assert.equal(Object.isFrozen(first.cells[0]), true);
    assert.throws(() => first.cells.push(first.cells[0]), TypeError);
    assert.throws(() => {
        first.cells[0].ringIndex = 8;
    }, TypeError);

    const unready = surface({
        worldClock: Object.freeze({
            ...worldClock(),
            tick: baselineProfile.tick + 1
        })
    });
    assert.throws(
        () => buildM3CodonRotationProjectionForLensRing(unready),
        /requires a ready M3 projection surface/
    );
});

test('K2LensRingCellDescriptor source declares the required readonly fields', () => {
    const source = readFileSync(
        '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/composition/M3CodonRotationProjectionForLensRing.ts',
        'utf8'
    );
    for (const field of [
        'readonly ringIndex: number',
        'readonly cellIndex: number',
        'readonly positionLabel: string',
        'readonly codonTriple?: string',
        'readonly aminoAcid?: string',
        'readonly colourHsla: string'
    ]) {
        assert.match(source, new RegExp(field.replace(/[?:]/g, '\\$&')));
    }
    assert.match(source, /export interface M3CodonRotationProjectionForLensRing\s*\{/);
    assert.match(source, /readonly cells: readonly K2LensRingCellDescriptor\[\]/);
    assert.match(source, /readonly activeRingIndex: number/);
    assert.match(source, /readonly rotationPhase: number/);
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

test('oracle frame packet renders a single-card CP point as one declared position', () => {
    const model = surfaceWithPacket(
        transcriptionalPacket({
            packetId: 'tcp:single',
            oracleFrame: oracleFrame({
                frameId: 'frame:single:P2',
                spreadScale: 'single-card',
                positions: [position('P2', 0, 'CP4.2')]
            }),
            cpPositionRef: 'CP4.2'
        })
    );

    assert.equal(model.oracleFrameSummary.spreadScale, 'single-card');
    assert.equal(model.oracleFrameSummary.positionCount, 1);
    assert.deepEqual(model.oracleFrameSummary.positions.map(position => position.cpPositionRef), ['CP4.2']);
    assert.equal(model.transcriptionalClockPacket.cpPositionRef, 'CP4.2');
});

test('oracle frame packet preserves a compressed three-card CP-set cardinality', () => {
    const model = surfaceWithPacket(
        transcriptionalPacket({
            packetId: 'tcp:triad',
            oracleFrame: oracleFrame({
                frameId: 'frame:triad:P1-P3',
                spreadScale: 'compressed-triad',
                positions: [
                    position('P1', 0, 'CP4.1'),
                    position('P2', 1, 'CP4.2'),
                    position('P3', 2, 'CP4.3')
                ]
            }),
            cpPositionRef: 'CP4.2'
        })
    );

    assert.equal(model.oracleFrameSummary.spreadScale, 'compressed-triad');
    assert.equal(model.oracleFrameSummary.positionCount, 3);
    assert.deepEqual(model.oracleFrameSummary.positions.map(position => position.key), ['P1', 'P2', 'P3']);
});

test('oracle frame packet computes sixfold complements only from declared pairs', () => {
    const model = surfaceWithPacket(
        transcriptionalPacket({
            packetId: 'tcp:sixfold',
            oracleFrame: oracleFrame({
                frameId: 'frame:sixfold:P0-P5',
                spreadScale: 'sixfold-ql-traverse',
                positions: [
                    position('P0', 0, 'CP4.0'),
                    position('P1', 1, 'CP4.1'),
                    position('P2', 2, 'CP4.2'),
                    position('P3', 3, 'CP4.3'),
                    position('P4', 4, 'CP4.4'),
                    position('P5', 5, 'CP4.5')
                ],
                complementaryPairs: [
                    ['P0', 'P5'],
                    ['P1', 'P4'],
                    ['P2', 'P3']
                ]
            }),
            cpPositionRef: 'CP4.0'
        })
    );

    assert.equal(model.oracleFrameSummary.positionCount, 6);
    assert.deepEqual(model.oracleFrameSummary.complementaryPairs, [
        ['P0', 'P5'],
        ['P1', 'P4'],
        ['P2', 'P3']
    ]);
});

test("oracle frame packet preserves Night' inverse pass order and declared complement law", () => {
    const model = surfaceWithPacket(
        transcriptionalPacket({
            packetId: 'tcp:night-prime',
            oracleFrame: oracleFrame({
                frameId: 'frame:night-prime:P5-P0',
                spreadScale: 'night-inverse-pass',
                traversalDirection: 'night-prime',
                positions: [
                    position('P5', 0, 'CP4.5'),
                    position('P4', 1, 'CP4.4'),
                    position('P3', 2, 'CP4.3'),
                    position('P2', 3, 'CP4.2'),
                    position('P1', 4, 'CP4.1'),
                    position('P0', 5, 'CP4.0')
                ],
                complementaryPairs: [['P5', 'P0']]
            }),
            cpPositionRef: 'CP4.5'
        })
    );

    assert.equal(model.oracleFrameSummary.spreadScale, 'night-inverse-pass');
    assert.equal(model.oracleFrameSummary.traversalDirection, 'night-prime');
    assert.deepEqual(model.oracleFrameSummary.positions.map(position => position.key), [
        'P5',
        'P4',
        'P3',
        'P2',
        'P1',
        'P0'
    ]);
    assert.deepEqual(model.oracleFrameSummary.complementaryPairs, [['P5', 'P0']]);
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

test('coupling-flow inspector renders four lanes and five Third Spanda canonical forms', () => {
    const model = surface();
    const alignment = couplingFlowAlignmentFromProfilePayload(Object.freeze({
        couplingFlowAlignment: Object.freeze({
            skeletonEventsActive: Object.freeze([
                'Additive137',
                'MersenneM7Ground',
                'SpandaCrownBifurcation'
            ]),
            recognitionContextWarrant: 'recognition_context Nara handoff state: current packet link only'
        })
    }));
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ThirdSpandaMathemeProofPanel, {
            surface: model,
            couplingFlowAlignment: alignment
        })
    );

    for (const lane of ['symbolic_skeleton', 'physics_descent', 'measurement_face', 'recognition_context']) {
        assert.match(html, new RegExp(`data-lane="${lane}"`));
    }
    for (const form of ['mersenne', 'binary', 'octave-field', 'spanda-bridge', 'm-stack']) {
        assert.match(html, new RegExp(`data-canonical-form="${form}"`));
    }
    assert.equal((html.match(/data-canonical-form=/g) ?? []).length, 5);
    assert.match(html, /137 = \(2\^7 - 1\) \+ 1 \+ 9/);
    assert.match(html, /137 = 128 \+ 9/);
    assert.match(html, /137 = 8\(17\) \+ 1/);
    assert.match(html, /137 = 64 \+ 2\(36\) \+ 1/);
    assert.match(html, /9_M2 = 8_M3 \+ 1_M1/);
    assert.match(html, /127 = 2\^7 - 1/);
    assert.match(html, /data-trace-highlight="SpandaCrownBifurcation"/);
    assert.match(html, /9_\{M_2\} = 8_\{M_3\} \+ 1_\{M_1\}/);
    assert.match(html, /9_M2 = 8_M3 \+ 1_M1/);
    assert.match(html, /7 \(action\/generator\)/);
    assert.match(html, /137\.035999\.\.\./);
    assert.match(html, /source-warrant/);
});

test('coupling-flow inspector renderer contains no physical-constant computation hooks', () => {
    const source = readFileSync(THIRD_SPANDA_PANEL_SOURCE, 'utf8');
    assert.doesNotMatch(source, /QL derives alpha/);
    assert.doesNotMatch(source, /electroweak mixing computed/);
    assert.doesNotMatch(source, /Math\./);
    assert.doesNotMatch(source, /parseFloat|parseInt|Number\(/);
    assert.doesNotMatch(source, /fineStructureConstant|computeRG|electroweakMixing|qcdCorrection|CODATA|NIST/);
    assert.doesNotMatch(source, /137\.035999177|0\.007297|1\s*\/\s*137/);
    assert.match(source, /source-warrant/);
    assert.match(source, /measurement-face/);
    assert.match(source, /symbolic skeleton/);
});

test('pentadic relation inspector renders Maxwell 15 beside Mahamaya paired fifteens from profile payload', () => {
    const profilePayload = profilePayloadWithPentadicTrace();
    const model = pentadicRelationModelFromProfilePayload(profilePayload, readiness());
    assert.equal(model.ready, true);
    assert.equal(model.maxwell?.total, 15);
    assert.equal(model.maxwell?.decomposition, '10+4+1');
    assert.deepEqual(model.trace?.pairedMahamayaFifteens, [15, 15]);
    assert.equal(model.trace?.substrateHinge, '0/1 -> 5');
    assert.equal(model.trace?.wholeNumberEndpoint, 5);
    assert.equal(model.trace?.naturalNumberEndpoint, 6);
    assert.equal(model.trace?.resonance72Index, 64);
    assert.equal(model.trace?.backboneIdentity, '24*15=360');
    assert.equal(model.trace?.shemIdentity, '72*5=360');
    assert.equal(model.trace?.lineGraphIdentity, '360+24=384');
    assert.equal(model.trace?.qCosmicRef, 'profile.qCosmic:codon-42');

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3PentadicRelationInspector, {
            profilePayload,
            readiness: readiness()
        })
    );

    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:pentadic-relation-inspector"/);
    assert.match(html, /data-relation-lane="maxwell-kaluza-klein"/);
    assert.match(html, /data-relation-lane="mahamaya-paired-fifteens"/);
    assert.match(html, /data-relation-row="substrate-hinge"/);
    assert.match(html, /0\/1 -&gt; 5/);
    assert.match(html, /whole 5/);
    assert.match(html, /natural 6/);
    assert.match(html, /15 = 10\+4\+1/);
    assert.match(html, /4D metric body/);
    assert.match(html, /4-vector connection field/);
    assert.match(html, /scalar\/fiber condition/);
    assert.match(html, /15\+15/);
    assert.match(html, /DNA AAA/);
    assert.match(html, /trigram 0\/0/);
    assert.match(html, /Pauli sigma0/);
    assert.match(html, /DNA CCC/);
    assert.match(html, /trigram 7\/7/);
    assert.match(html, /Pauli sigma3/);
    assert.match(html, /24\*15=360/);
    assert.match(html, /72\*5=360/);
    assert.match(html, /360\+24=384/);
    assert.match(html, /resonance72 64/);
    assert.match(html, /address64 42/);
    assert.match(html, /codon CCC/);
    assert.match(html, /line-change 256/);
    assert.match(html, /profile\.qCosmic:codon-42/);
});

test('pentadic relation inspector routes unavailable trace fields through readiness-ledger chips', () => {
    const sparsePayload = Object.freeze({
        ...baselineProfile,
        coupling_flow_alignment: profilePayloadWithPentadicTrace().coupling_flow_alignment,
        anuttara_pentadic_trace: Object.freeze({
            ...profilePayloadWithPentadicTrace().anuttara_pentadic_trace,
            qCosmicRef: undefined
        })
    });
    const ledger = readiness('profile_missing_field');
    const readinessWithBlocker = Object.freeze({
        ...ledger,
        blockerIds: Object.freeze([
            'profile.anuttara_pentadic_trace.qCosmicRef',
            'track10.profile-field.anuttara_pentadic_trace'
        ])
    });
    const model = pentadicRelationModelFromProfilePayload(sparsePayload, readinessWithBlocker);
    assert.equal(model.ready, false);
    assert.ok(model.pendingFields.includes('profile.anuttara_pentadic_trace.qCosmicRef'));

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3PentadicRelationInspector, {
            profilePayload: sparsePayload,
            readiness: readinessWithBlocker
        })
    );

    assert.match(html, /data-pending-field="profile\.anuttara_pentadic_trace\.qCosmicRef"/);
    assert.match(html, /data-ledger-state="profile_missing_field"/);
    assert.match(html, /profile\.anuttara_pentadic_trace\.qCosmicRef/);
    assert.match(html, /Track-10 readiness ledger/);
});

test('pentadic trace service consumes only the shared bridge profile and readiness stream', () => {
    const payload = profilePayloadWithPentadicTrace();
    const fakeBridge = bridgeFixture();
    const service = new M3PentadicTraceService(fakeBridge);
    const snapshots = [];
    const sub = service.onDidChange(snapshot => snapshots.push(snapshot));

    fakeBridge.emitReadiness(readiness('profile_missing_field'));
    fakeBridge.emitProfile(boundary(23, payload));

    assert.equal(service.snapshot().profileGeneration, 23);
    assert.equal(service.snapshot().model.ready, true);
    assert.equal(service.snapshot().model.trace.resonance72Index, 64);
    assert.equal(service.snapshot().model.trace.mahamayaAddress64, 42);
    assert.equal(fakeBridge.invokeCapabilityCalls, 0);
    assert.equal(fakeBridge.invokeGatewayRpcCalls, 0);
    assert.equal(fakeBridge.parashaktiCorrespondencesCalls, 0);
    assert.ok(snapshots.length >= 2);

    sub.dispose();
    service.dispose();
    assert.equal(fakeBridge.profileListeners.size, 0);
    assert.equal(fakeBridge.readinessListeners.size, 0);
});

test('cosmic wheel full mode embeds the pentadic inspector and mini-view renders a single hinge badge', () => {
    const payload = profilePayloadWithPentadicTrace();
    const model = surface({ profile: boundary(23, payload) });

    const fullHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3CosmicWheelRenderService, {
            mode: 'full',
            surface: model,
            profilePayload: payload,
            readiness: readiness()
        })
    );
    assert.match(fullHtml, /data-widget-id="pratibimba\.m3-mahamaya:pentadic-relation-inspector"/);
    assert.match(fullHtml, /data-relation-row="shem-degree-runtick"/);

    const miniHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3CosmicWheelRenderService, {
            mode: 'mini-view',
            surface: model,
            profilePayload: payload,
            readiness: readiness()
        })
    );
    assert.match(miniHtml, /data-widget-id="pratibimba\.m3-mahamaya:pentadic-hinge-badge"/);
    assert.match(miniHtml, /data-readiness-state="ready"/);
    assert.match(miniHtml, /0\/1 -&gt; 5/);
    assert.doesNotMatch(miniHtml, /data-widget-id="pratibimba\.m3-mahamaya:pentadic-relation-inspector"/);
});

test('cosmic wheel renders Level 0 Fibonacci Ground from backend payload without fallback ring', () => {
    const payload = profilePayloadWithFibonacciGround();
    const model = surface({ profile: boundary(23, payload) });
    const ground = fibonacciGroundModelFromProfilePayload(payload);
    assert.equal(ground.ready, true);
    assert.equal(ground.wedges.length, 60);
    assert.equal(ground.cardinalAnchors.length, 4);
    assert.equal(ground.zodiacalAnchors.length, 8);
    assert.equal(ground.backboneTicks.length, 24);
    assert.equal(ground.natalSunPosition, 15);
    assert.equal(ground.liveSunPosition, 23);

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3CosmicWheelRenderService, {
            mode: 'mini-view',
            surface: model,
            profilePayload: payload,
            readiness: readiness()
        })
    );

    assert.match(html, /data-fibonacci-ground-readiness="ready"/);
    assert.equal((html.match(/data-fibonacci-wedge="/g) ?? []).length, 60);
    assert.equal((html.match(/data-cardinal-anchor="/g) ?? []).length, 4);
    assert.equal((html.match(/data-zodiacal-anchor="/g) ?? []).length, 8);
    assert.equal((html.match(/data-backbone-tick="/g) ?? []).length, 24);
    assert.match(html, /data-sun-marker="natal"/);
    assert.match(html, /data-fibonacci-position="15"/);
    assert.match(html, /data-sun-marker="live"/);
    assert.match(html, /data-fibonacci-position="23"/);
    assert.match(html, /data-layer-order="fibonacci-ground,backbone-ticks,sixteen-lens-annular-sectors,nine-walk-overlay,torus-core"/);
});

test('Fibonacci Ground remains honestly pending when backend ground payload is absent', () => {
    const model = surface();
    const ground = fibonacciGroundModelFromProfilePayload(baselineProfile);
    assert.equal(ground.ready, false);
    assert.deepEqual(ground.pendingFields, ['profile.fibonacciGround']);

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3CosmicWheelRenderService, {
            mode: 'mini-view',
            surface: model,
            profilePayload: baselineProfile,
            readiness: readiness()
        })
    );

    assert.match(html, /data-fibonacci-ground-readiness="pending"/);
    assert.match(html, /ground pending/);
    assert.equal((html.match(/data-fibonacci-wedge="/g) ?? []).length, 0);
    assert.equal((html.match(/data-backbone-tick="/g) ?? []).length, 0);
    assert.doesNotMatch(html, /data-sun-marker="natal"/);
    assert.doesNotMatch(html, /data-sun-marker="live"/);
});

test('profile tick subscription carries backend-projected Fibonacci Sun markers', () => {
    const snapshot = profileTickFromProfile(boundary(24, profilePayloadWithFibonacciGround({
        natalSunFibonacciPosition: 2,
        liveSunFibonacciPosition: 47
    })));
    assert.deepEqual(snapshot.fibonacciGround, {
        natalSunPosition: 2,
        liveSunPosition: 47
    });
});

test('Fibonacci Ground renderer reads backend fields and embeds no local derivation table', () => {
    const source = readFileSync(COSMIC_WHEEL_SOURCE, 'utf8');
    assert.doesNotMatch(source, /60\s*\*\s*6/);
    assert.doesNotMatch(source, /(?:PISANO|FIBONACCI)_DIGITS\s*=/);
    assert.doesNotMatch(source, /pisano_digit_lut\s*:\s*\[/);
    assert.match(source, /ground\.pisano_digit_lut/);
    assert.match(source, /profile\.fibonacciGround/);
});

test('pentadic relation inspector does not reconstruct missing trace or local arithmetic identities', () => {
    const model = pentadicRelationModelFromProfilePayload(baselineProfile, readiness('profile_missing_field'));
    assert.equal(model.ready, false);
    assert.ok(model.pendingFields.includes('profile.anuttara_pentadic_trace'));
    assert.equal(model.trace, null);

    const source = readFileSync(PENTADIC_RELATION_INSPECTOR_SOURCE, 'utf8');
    assert.doesNotMatch(source, /Math\.floor|Math\.round|parseFloat|parseInt|Number\(/);
    assert.doesNotMatch(source, /72\s*\*\s*5|24\s*\*\s*15|360\s*\+\s*24/);
    assert.doesNotMatch(source, /const\s+(?:CODON|TRIGRAM|PAULI|DNA)_/);
});

function surfaceWithPacket(packet) {
    return surface({
        profile: boundary(23, Object.freeze({
            ...baselineProfile,
            transcriptionalClockPacket: Object.freeze(packet)
        }))
    });
}

function position(key, ordinal, cpPositionRef) {
    return Object.freeze({
        key,
        ordinal,
        cpPositionRef,
        vak: sampleVakAddress()
    });
}

function oracleFrame(overrides = {}) {
    return Object.freeze({
        frameId: 'frame:single:P0',
        spreadScale: 'single-card',
        positions: Object.freeze([position('P0', 0, 'CP4.0')]),
        complementaryPairs: Object.freeze([]),
        ...overrides
    });
}

function transcriptionalPacket(overrides = {}) {
    return Object.freeze({
        packetId: 'tcp:test',
        profileGeneration: 23,
        vak: sampleVakAddress(),
        oracleFrame: oracleFrame(),
        cpPositionRef: 'CP4.0',
        provenanceHandles: Object.freeze(['profile:generation:23']),
        ...overrides
    });
}

function sampleVakAddress() {
    return Object.freeze({
        cpf: '(04/04.T4.11)',
        ct: 'CT2',
        cp: '4.2',
        cf: '(0/1/2)',
        cfp: "M3' kernel-bridge oracle-frame",
        cs: 'positions[] authoritative'
    });
}

function profilePayloadWithPentadicTrace() {
    return Object.freeze({
        ...baselineProfile,
        coupling_flow_alignment: Object.freeze({
            maxwellKaluzaKleinWitness: Object.freeze({
                total: 15,
                decomposition: '10+4+1',
                metricBody: '4D metric body',
                connectionField: '4-vector connection field',
                scalarFiberCondition: 'scalar/fiber condition'
            })
        }),
        anuttara_pentadic_trace: Object.freeze({
            tick: 8,
            tick12: 8,
            helix: 0,
            position6: 4,
            sourceBinaryState: '0/1',
            wholeNumberEndpoint: 5,
            naturalNumberEndpoint: 6,
            familyBComplement: Object.freeze([4, 2]),
            shemDegreeQuantum: 5,
            shemIdentity: '72*5=360',
            resonance72Index: 64,
            degree360: 240,
            m2ToM3Symbol: 56,
            mahamayaAddress64: 42,
            evolutionaryGap: 'm2-wholeness-gap',
            codonId: 42,
            codon: 'CCC',
            lineChangeOperator: 256,
            pairedMahamayaFifteens: Object.freeze([15, 15]),
            pairedMahamayaFifteenWitnesses: Object.freeze([
                Object.freeze({
                    label: 'left relation fifteen',
                    total: 15,
                    combinations: Object.freeze([
                        Object.freeze({ dnaCode: 'DNA AAA', trigram: 'trigram 0/0', pauliMatrix: 'Pauli sigma0' })
                    ])
                }),
                Object.freeze({
                    label: 'right relation fifteen',
                    total: 15,
                    combinations: Object.freeze([
                        Object.freeze({ dnaCode: 'DNA CCC', trigram: 'trigram 7/7', pauliMatrix: 'Pauli sigma3' })
                    ])
                })
            ]),
            backboneIdentity: '24*15=360',
            lineGraphIdentity: '360+24=384',
            qCosmicRef: 'profile.qCosmic:codon-42',
            provenance: Object.freeze(['kernel-bridge:buildPentadicTrace'])
        })
    });
}

function profilePayloadWithFibonacciGround(markerOverrides = {}) {
    const markers = Object.freeze({
        natalSunFibonacciPosition: 15,
        liveSunFibonacciPosition: 23,
        ...markerOverrides
    });
    return Object.freeze({
        ...baselineProfile,
        fibonacciGround: Object.freeze({
            pisano_digit_lut: Object.freeze([
                0, 1, 1, 2, 3, 5, 8, 3, 1, 4,
                5, 9, 4, 3, 7, 0, 7, 7, 4, 1,
                5, 6, 1, 7, 8, 5, 3, 8, 1, 9,
                0, 9, 9, 8, 7, 5, 2, 7, 9, 6,
                5, 1, 6, 7, 3, 0, 3, 3, 6, 9,
                5, 4, 9, 3, 2, 5, 7, 2, 9, 1
            ]),
            clockBackbone: Object.freeze(
                Array.from({ length: 24 }, (_, index) =>
                    Object.freeze({
                        backboneIndex: index,
                        degree: index * 15
                    })
                )
            ),
            ...markers
        })
    });
}

function bridgeFixture() {
    return {
        profileListeners: new Set(),
        readinessListeners: new Set(),
        invokeCapabilityCalls: 0,
        invokeGatewayRpcCalls: 0,
        parashaktiCorrespondencesCalls: 0,
        onProfile(listener) {
            this.profileListeners.add(listener);
            listener(null);
            return { dispose: () => this.profileListeners.delete(listener) };
        },
        onReadiness(listener) {
            this.readinessListeners.add(listener);
            listener(readiness('profile_missing_field'));
            return { dispose: () => this.readinessListeners.delete(listener) };
        },
        emitProfile(profile) {
            for (const listener of this.profileListeners) {
                listener(profile);
            }
        },
        emitReadiness(snapshot) {
            for (const listener of this.readinessListeners) {
                listener(snapshot);
            }
        },
        invokeCapability() {
            this.invokeCapabilityCalls += 1;
            return Promise.resolve(null);
        },
        invokeGatewayRpc() {
            this.invokeGatewayRpcCalls += 1;
            return Promise.resolve(null);
        },
        parashaktiCorrespondences() {
            this.parashaktiCorrespondencesCalls += 1;
            return Promise.resolve(null);
        }
    };
}
