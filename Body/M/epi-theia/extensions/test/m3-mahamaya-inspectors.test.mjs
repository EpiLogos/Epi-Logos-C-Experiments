import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
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
    FrontendApplicationConfigProvider.set({ applicationName: 'M3 Mahamaya inspectors node test' });
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

const { buildM3ProjectionSurface } = require('../m3-mahamaya/lib/common/index.js');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    M3SummonableInspectors,
    m3SummonableInspectorsFromProfilePayload
} = require('../m3-mahamaya/lib/browser/components/M3SummonableInspectors.js');
const {
    M3DepthViewModes,
    M3_DEPTH_VIEW_MODES
} = require('../m3-mahamaya/lib/browser/components/M3DepthViewModes.js');
const {
    M3CosmicWheelRenderService
} = require('../m3-mahamaya/lib/browser/components/M3CosmicWheelRenderService.js');
const {
    QuintessenceIndicator,
    quintessenceIndicatorModelFromSurface
} = require('../m3-mahamaya/lib/browser/components/QuintessenceIndicator.js');

const INSPECTORS_SOURCE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3SummonableInspectors.tsx';
const DEPTH_VIEW_SOURCE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3DepthViewModes.tsx';
const M3_BROWSER_SOURCE_DIR =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser';
const M1_LENS_CONSUMER_SOURCE = join(M3_BROWSER_SOURCE_DIR, 'components/M1ChromaticLensConsumer.tsx');
const M3_LENS_SWITCHER_SOURCE = join(M3_BROWSER_SOURCE_DIR, 'components/M3LensApertureSwitcher.tsx');
const QUINTESSENCE_INDICATOR_SOURCE = join(M3_BROWSER_SOURCE_DIR, 'components/QuintessenceIndicator.tsx');

function readiness(state = 'ready_public_current') {
    return Object.freeze({
        state,
        updatedAt: '2026-06-01T00:00:00.000Z',
        sources: Object.freeze([]),
        blockers: Object.freeze([]),
        blockerIds: Object.freeze([])
    });
}

function coordinateContext() {
    return Object.freeze({
        canonicalMCoordinate: "M3'",
        pointerAnchor: 'pointer://s0-baseline',
        profileGeneration: 23
    });
}

function boundary(generation, payload) {
    return Object.freeze({
        generation,
        pointerAnchor: 'profile:pointer:baseline',
        capabilities: Object.freeze(['profile.public-current']),
        payload
    });
}

function librarySummary() {
    return Object.freeze({
        provenanceHandle: Object.freeze({ source: 's2', handle: 's2://m3-library/summary/baseline', bodyAllowed: false }),
        nonDualCodonCount: 40,
        dualCodonCount: 24,
        nonDualRotationalSlots: 7,
        dualRotationalSlots: 8
    });
}

function worldClock() {
    return Object.freeze({
        provenanceHandle: Object.freeze({ source: 's3', handle: 's3://world-clock/baseline', bodyAllowed: false }),
        worldClockHandle: 's3://world-clock/2026-06-01T00:00:00Z',
        generation: 42,
        tick: baselineProfile.tick,
        degree720: baselineProfile.degree720,
        source: 's3.world_clock',
        subscriptionMode: 'native-websocket'
    });
}

function fullProfilePayload() {
    return Object.freeze({
        ...baselineProfile,
        chargeQuaternion: Object.freeze({
            pp: 27,
            mm: -9,
            mp: 9,
            pm: 9,
            outerValue: 9,
            fourX: 36
        }),
        elementalQuintessence: Object.freeze({
            fire: 12,
            air: 6,
            water: 18,
            earth: 0,
            akasha: 999
        }),
        dinucleotideMatrix: Object.freeze(
            Array.from({ length: 16 }, (_, index) =>
                Object.freeze({ pair: `pair-${index}`, sumValue: index, differenceValue: -index })
            )
        ),
        twentyFourSpokeLattice: Object.freeze(
            Array.from({ length: 24 }, (_, index) =>
                Object.freeze({ spokeIndex: index, degree: index * 15, backbone: true })
            )
        ),
        degree720RingBuffer: Object.freeze([0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660]),
        activeSpokeIndex: 3,
        majorArcanaChromosome: Object.freeze(
            Array.from({ length: 22 }, (_, index) =>
                Object.freeze({ cardId: index, name: `arcana-${index}`, chromosomePair: index + 1, aminoAcidIndex: index % 21 })
            )
        ),
        perSuitIntegral: Object.freeze({ cups: 84, wands: 96, pentacles: 88, swords: 92, total: 360 }),
        m3LensStack: Object.freeze({ namespaceResolved: true, segmentCount: 16, activeSegmentIndex: 4 }),
        mahamayaLensStack: Object.freeze({ namespaceResolved: true, activeLensId: 4 }),
        toroidalWorld: Object.freeze({
            k2GeometryHandle: 'm1-5://k2/geometry/baseline',
            inscriptionCircleParam: 0,
            lensCircleParam: 0.25,
            coFoliationState: 'co-foliated'
        }),
        hopfIdentity: Object.freeze({
            hopfFiberHandle: 'm1-2://hopf/fiber/baseline',
            phaseShadowRingState: 'shadow-ring',
            identityReturned: true
        }),
        mahamaya: Object.freeze({
            ...baselineProfile.mahamaya,
            activeDinucleotide: 'pair-3',
            activeMajorArcanaId: 7
        })
    });
}

function surfaceWith(payload) {
    return buildM3ProjectionSurface({
        profile: boundary(23, payload),
        readiness: readiness(),
        context: coordinateContext(),
        emittedAt: 1_771_000_000_000,
        library: librarySummary(),
        worldClock: worldClock()
    });
}

test('summonable inspectors expose the six canonical inspector ids from the profile bus', () => {
    const model = m3SummonableInspectorsFromProfilePayload(fullProfilePayload(), readiness());
    assert.deepEqual(
        model.inspectors.map(inspector => inspector.id),
        [
            'dinucleotide-matrix',
            'charge-quaternion',
            'twenty-four-spoke-ring-buffer',
            'major-arcana-chromosome',
            'dna-rna-phase',
            'per-suit-integral'
        ]
    );
    assert.equal(model.ready, true);
    assert.equal(model.pendingFields.length, 0);
});

test('charge-quaternion inspector audits pp+mm+mp+pm=4X from backend components', () => {
    const model = m3SummonableInspectorsFromProfilePayload(fullProfilePayload(), readiness());
    const charge = model.inspectors.find(inspector => inspector.id === 'charge-quaternion').chargeQuaternion;
    assert.equal(charge.auditSum, 36);
    assert.equal(charge.fourX, 36);
    assert.equal(charge.auditHolds, true);
    assert.deepEqual([charge.pp, charge.mm, charge.mp, charge.pm], [27, -9, 9, 9]);
});

test('per-suit integral inspector audits 84+96+88+92=360 from backend integers', () => {
    const model = m3SummonableInspectorsFromProfilePayload(fullProfilePayload(), readiness());
    const suit = model.inspectors.find(inspector => inspector.id === 'per-suit-integral').perSuitIntegral;
    assert.equal(suit.auditSum, 360);
    assert.equal(suit.total, 360);
    assert.equal(suit.auditHolds, true);
});

test('summonable inspectors route absent backend fields through readiness-ledger pending chips', () => {
    const model = m3SummonableInspectorsFromProfilePayload(baselineProfile, readiness('profile_missing_field'));
    assert.equal(model.ready, false);
    assert.ok(model.pendingFields.includes('profile.dinucleotideMatrix'));
    assert.ok(model.pendingFields.includes('profile.chargeQuaternion'));
    assert.ok(model.pendingFields.includes('profile.twentyFourSpokeLattice'));
    assert.ok(model.pendingFields.includes('profile.majorArcanaChromosome'));
    assert.ok(model.pendingFields.includes('profile.perSuitIntegral'));

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3SummonableInspectors, {
            profilePayload: baselineProfile,
            readiness: readiness('profile_missing_field')
        })
    );
    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:summonable-inspectors"/);
    assert.match(html, /data-inspector="dinucleotide-matrix"/);
    assert.match(html, /data-inspector="charge-quaternion"/);
    assert.match(html, /data-inspector="twenty-four-spoke-ring-buffer"/);
    assert.match(html, /data-inspector="major-arcana-chromosome"/);
    assert.match(html, /data-inspector="dna-rna-phase"/);
    assert.match(html, /data-inspector="per-suit-integral"/);
    assert.match(html, /data-pending-field="profile\.dinucleotideMatrix"/);
    assert.match(html, /Track-10 readiness ledger/);
});

test('dna/rna toggle inspector reads the landed mahamaya.dnaRnaPhase field', () => {
    const model = m3SummonableInspectorsFromProfilePayload(fullProfilePayload(), readiness());
    const phase = model.inspectors.find(inspector => inspector.id === 'dna-rna-phase').dnaRnaPhase;
    assert.equal(phase.dnaRnaPhase, baselineProfile.mahamaya.dnaRnaPhase);
});

test('depth-view modes expose the four canonical modes over the projection surface', () => {
    const surface = surfaceWith(fullProfilePayload());
    assert.deepEqual(
        M3_DEPTH_VIEW_MODES.map(mode => mode.id),
        ['flat-clock-debug', 'lens-annulus', 'toroidal-world-clock', 'hopf-identity']
    );
    assert.equal(surface.depthViews.flatClockDebug.viewMode, 'flat-clock-debug');
    assert.equal(surface.depthViews.lensAnnulus.viewMode, 'lens-annulus');
    assert.equal(surface.depthViews.lensAnnulus.namespaceResolved, true);
    assert.equal(surface.depthViews.lensAnnulus.segmentCount, 16);
    assert.equal(surface.depthViews.toroidalWorld.viewMode, 'toroidal-world-clock');
    assert.equal(surface.depthViews.toroidalWorld.k2GeometryHandle, 'm1-5://k2/geometry/baseline');
    assert.equal(surface.depthViews.hopfIdentity.viewMode, 'hopf-identity');
    assert.equal(surface.depthViews.hopfIdentity.identityReturned, true);

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3DepthViewModes, { surface })
    );
    for (const mode of ['flat-clock-debug', 'lens-annulus', 'toroidal-world-clock', 'hopf-identity']) {
        assert.match(html, new RegExp(`data-depth-view-mode="${mode}"`));
    }
});

test('lens annulus depth view stays namespace-pending when profile.m3LensStack is absent', () => {
    const surface = surfaceWith(baselineProfile);
    assert.equal(surface.depthViews.lensAnnulus.namespaceResolved, false);
    assert.equal(surface.depthViews.lensAnnulus.provenanceOverlay, 'pending-m3-lens-stack-namespace');
    assert.equal(surface.depthViews.toroidalWorld.k2GeometryHandle, 'pending-m1-5-k2-geometry-handle');
    assert.equal(surface.depthViews.hopfIdentity.hopfFiberHandle, 'pending-m1-2-hopf-fiber-handle');
});

test('legacy depth-view aliases remain available for existing Track-08 consumers', () => {
    const surface = surfaceWith(fullProfilePayload());
    assert.equal(surface.depthViews.flatClock.viewMode, 'flat-clock-debug');
    assert.equal(surface.depthViews.doubleTorusWorldClock.viewMode, 'm3-5-double-torus-world-clock');
    assert.equal(surface.depthViews.janusOverlay.viewMode, 'janus-bidirectional-read-only');
});

test('cosmic wheel renders M1 chromatic chip and M3 aperture switcher as separate widgets', () => {
    const payload = fullProfilePayload();
    const surface = surfaceWith(payload);
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3CosmicWheelRenderService, {
            mode: 'full',
            surface,
            profilePayload: payload,
            readiness: readiness()
        })
    );

    assert.match(html, /data-inspector-zone="m1-m3-lens-namespace"/);
    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:m1-chromatic-lens-consumer"/);
    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:m3-lens-stack-aperture"/);
    assert.match(html, /M1&#x27; chromatic lens \(12\)/);
    assert.match(html, /M3 lens-stack aperture \(16\+1\)/);
});

test('quintessence indicator renders four elemental contributions and emergent Akasha sum', () => {
    const payload = fullProfilePayload();
    const surface = surfaceWith(payload);
    assert.deepEqual(surface.activeProjection.elementalQuintessence, payload.elementalQuintessence);

    const model = quintessenceIndicatorModelFromSurface(surface);
    assert.equal(model.ready, true);
    assert.deepEqual(model.elements.map(element => element.key), ['fire', 'air', 'water', 'earth']);
    assert.deepEqual(model.elements.map(element => element.value), [12, 6, 18, 0]);
    assert.equal(model.akashaSum, 36);
    assert.equal(model.rotationIndex, baselineProfile.codonRotationProjection.rotation);
    assert.equal(model.rotationalStateCount, 7);

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(QuintessenceIndicator, { surface })
    );
    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:quintessence-indicator"/);
    assert.equal((html.match(/data-element-bar="/g) ?? []).length, 4);
    assert.match(html, /data-akasha-sum="36"/);
    assert.match(html, /Emergent balance — Akasha\/Quintessence is the sum, not a fifth measure/);
    assert.match(
        html,
        new RegExp(`data-tct-rotational-state="${baselineProfile.codonRotationProjection.rotation}\\/7"`)
    );
});

test('renderer lens namespace fields are consumed only by their dedicated components', () => {
    const violations = [];
    for (const file of sourceFiles(M3_BROWSER_SOURCE_DIR)) {
        const source = readFileSync(file, 'utf8');
        if (file !== M1_LENS_CONSUMER_SOURCE && /codonRotationProjection\.lens/.test(source)) {
            violations.push(`${file}: codonRotationProjection.lens`);
        }
        if (file !== M3_LENS_SWITCHER_SOURCE && /(?:payload|profilePayload)\??\.mahamayaLensStack/.test(source)) {
            violations.push(`${file}: mahamayaLensStack`);
        }
    }

    assert.deepEqual(violations, []);
});

test('quintessence indicator source consumes the projection surface without a fifth measurement', () => {
    const source = readFileSync(QUINTESSENCE_INDICATOR_SOURCE, 'utf8');
    assert.match(source, /activeProjection\.elementalQuintessence/);
    assert.match(source, /Akasha\/Quintessence is the sum, not a fifth measure/);
    assert.doesNotMatch(source, /akasha\s*:\s*number/i);
});

test('inspector and depth-view sources embed no hardcoded codon/hexagram/tarot mapping tables', () => {
    for (const file of [INSPECTORS_SOURCE, DEPTH_VIEW_SOURCE]) {
        const source = readFileSync(file, 'utf8');
        assert.doesNotMatch(source, /(?:CODON|TAROT|I_CHING|HEXAGRAM|PLANETARY|REWARD)_LUT/);
        assert.doesNotMatch(source, /codonTable|tarotDeck|hexagramTable|planetaryTable|majorArcanaTable/);
        assert.doesNotMatch(source, /const\s+(?:CODON|TRIGRAM|PAULI|DNA|TAROT|HEXAGRAM|MAJOR_ARCANA)_/);
        assert.doesNotMatch(source, /\[\s*(?:-?\d+(?:\.\d+)?\s*,\s*){8,}-?\d+(?:\.\d+)?\s*\]/);
    }
});

function sourceFiles(root) {
    return readdirSync(root)
        .flatMap(name => {
            const path = join(root, name);
            if (statSync(path).isDirectory()) {
                return sourceFiles(path);
            }
            return /\.(?:ts|tsx)$/.test(path) ? [path] : [];
        });
}
