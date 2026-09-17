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
    FrontendApplicationConfigProvider.set({ applicationName: 'M3 Mahamaya clock-field overlay node test' });
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
const {
    M3ClockFieldEdgeOverlay,
    clockFieldEdgeModelFromSurface
} = require('../m3-mahamaya/lib/browser/components/M3ClockFieldEdgeOverlay.js');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const OVERLAY_SOURCE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3ClockFieldEdgeOverlay.tsx';

function boundary(generation, payload) {
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

function librarySummary() {
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's2',
            handle: 's2://m3-library/summary/baseline',
            bodyAllowed: false
        }),
        nonDualCodonCount: 40,
        dualCodonCount: 24,
        nonDualRotationalSlots: 7,
        dualRotationalSlots: 8
    });
}

function kernelTraceHandle() {
    return Object.freeze({
        source: 'profile',
        handle: 'profile://kernel-trace/baseline',
        bodyAllowed: true
    });
}

// Builds a fully-ready M3 projection surface for a given clock tick. The S3
// world_clock handle is pinned to the same tick/degree720 so the surface is
// not blocked by drift — the overlay then reads the active clock position.
function surfaceAtTick({ tick, degree720, hexagramId, lineIndex, lineChangeOperatorAddress }) {
    const payload = Object.freeze({
        ...baselineProfile,
        tick,
        tick12: tick,
        degree720,
        mahamaya: Object.freeze({
            ...baselineProfile.mahamaya,
            hexagramId,
            lineIndex,
            lineChangeOperatorAddress
        })
    });
    return buildM3ProjectionSurface({
        profile: boundary(23, payload),
        readiness: readiness(),
        context: coordinateContext(),
        emittedAt: 1_771_000_000_000,
        library: librarySummary(),
        worldClock: Object.freeze({
            provenanceHandle: Object.freeze({
                source: 's3',
                handle: 's3://world-clock/baseline',
                bodyAllowed: false
            }),
            worldClockHandle: `s3://world-clock/tick-${tick}`,
            generation: 42,
            tick,
            degree720,
            source: 's3.world_clock',
            subscriptionMode: 'native-websocket'
        }),
        kernelTraceHandle: kernelTraceHandle()
    });
}

const TICK_0 = surfaceAtTick({
    tick: 0,
    degree720: 0,
    hexagramId: 0,
    lineIndex: 0,
    lineChangeOperatorAddress: 0
});
const TICK_3 = surfaceAtTick({
    tick: 3,
    degree720: 240,
    hexagramId: 21,
    lineIndex: 2,
    lineChangeOperatorAddress: 128
});

test('clock-field edge model derives spoke lattice, five aspect edges, and six line-change hops', () => {
    const model = clockFieldEdgeModelFromSurface(TICK_3);
    assert.equal(model.ready, true);

    // spokeLattice = the 12-tick spoke ring.
    assert.equal(model.spokeLattice.length, 12);
    assert.deepEqual(
        model.spokeLattice.map(spoke => spoke.index),
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    );
    assert.equal(model.spokeLattice.filter(spoke => spoke.active).length, 1);
    assert.equal(model.spokeLattice.find(spoke => spoke.active).index, 3);

    // aspectEdges = opposition + two trines + two squares.
    assert.deepEqual(
        model.aspectEdges.map(edge => edge.kind),
        ['opposition', 'trine', 'trine', 'square', 'square']
    );
    const opposition = model.aspectEdges.find(edge => edge.kind === 'opposition');
    // degree720=240 -> visual angle 120; opposition lands 180° away at 300.
    assert.equal(model.activeAngleDeg, 120);
    assert.equal(opposition.angleDeg, 300);

    // hopGraph = six single-line-flip hops along the 384-node line-change graph.
    assert.equal(model.hopGraph.nodeCount, 384);
    assert.equal(model.hopGraph.activeNode, 128);
    assert.equal(model.hopGraph.lineChangeEdges.length, 6);
    assert.deepEqual(
        model.hopGraph.lineChangeEdges.map(edge => edge.line),
        [0, 1, 2, 3, 4, 5]
    );
    // Line flip i is XOR (1<<i) on hexagram 21 (0b010101): line 0 -> 20, line 1 -> 23.
    assert.equal(model.hopGraph.lineChangeEdges[0].neighborHexagramId, 20);
    assert.equal(model.hopGraph.lineChangeEdges[1].neighborHexagramId, 23);
    assert.equal(model.hopGraph.lineChangeEdges[0].toNode, 20 * 6 + 2);
});

test('clock-field overlay renders all three edge lanes with backend-provided geometry', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3ClockFieldEdgeOverlay, { surface: TICK_3 })
    );
    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:clock-field-edge-overlay"/);
    assert.match(html, /data-ready="true"/);
    assert.match(html, /data-overlay-lane="spoke-lattice"/);
    assert.match(html, /data-overlay-lane="aspect-edges"/);
    assert.match(html, /data-overlay-lane="hop-graph"/);

    assert.match(html, /data-aspect="opposition"/);
    assert.match(html, /data-aspect="trine"/);
    assert.match(html, /data-aspect="square"/);

    // Six rendered line-change hop edges.
    assert.equal((html.match(/data-line-change-edge="/g) ?? []).length, 6);
    // Twelve rendered spokes.
    assert.equal((html.match(/data-spoke-index="/g) ?? []).length, 12);
    assert.match(html, /data-active-line-change-node="128"/);
});

test('codon wheel perturbs with tick advance — overlay redraws between ticks', () => {
    const modelA = clockFieldEdgeModelFromSurface(TICK_0);
    const modelB = clockFieldEdgeModelFromSurface(TICK_3);

    // The spoke lattice rotates with tick advance (perturbation differs).
    assert.notEqual(modelA.perturbationDeg, modelB.perturbationDeg);
    assert.notEqual(modelA.activeAngleDeg, modelB.activeAngleDeg);
    assert.notDeepEqual(
        modelA.spokeLattice.map(spoke => spoke.angleDeg),
        modelB.spokeLattice.map(spoke => spoke.angleDeg)
    );

    const htmlA = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3ClockFieldEdgeOverlay, { surface: TICK_0 })
    );
    const htmlB = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3ClockFieldEdgeOverlay, { surface: TICK_3 })
    );
    assert.notEqual(htmlA, htmlB);
    assert.match(htmlA, /data-tick="0"/);
    assert.match(htmlB, /data-tick="3"/);
    assert.match(htmlA, /data-perturbation-deg="0"/);
    assert.match(htmlB, /data-perturbation-deg="90"/);
});

test('clock-field overlay is renderer-only and embeds no ontological LUT tables', () => {
    const source = readFileSync(OVERLAY_SOURCE, 'utf8');
    assert.doesNotMatch(source, /(?:CODON|TAROT|I_CHING|HEXAGRAM|PLANETARY|REWARD)_LUT/);
    assert.doesNotMatch(source, /codonTable|tarotDeck|hexagramTable|planetaryTable/);
    // No long embedded numeric arrays (geometry is computed, not tabulated).
    assert.doesNotMatch(source, /\[\s*(?:-?\d+(?:\.\d+)?\s*,\s*){8,}-?\d+(?:\.\d+)?\s*\]/);
    // The landed substrate is referenced, never forked.
    assert.match(source, /m3_clock_lut\.c/);
    assert.match(source, /RENDERER OVERLAY ONLY/);
});
