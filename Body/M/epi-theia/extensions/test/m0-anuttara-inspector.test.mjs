// 07.T3 verification suite. Uses a captured-real-shaped S2 graph payload:
// node identity and family are properties, not labels; OWL/SHACL/GDS facts are
// payload facts with provenance states; M5 hooks are gateway envelopes only.

import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    buildM0InspectorModel,
    normalizeM0CoordinateInput
} = require('../m0-anuttara/lib/common/index.js');

const readiness = Object.freeze({
    fetchedAt: 1,
    state: 'ready_public_current',
    reason: 'captured S2 graph payload available',
    profileGeneration: 12,
    bridgeReachable: true,
    blockerIds: []
});

const context = Object.freeze({
    selectedCoordinate: '#0',
    hashInput: '#0',
    canonicalMCoordinate: 'M0',
    profileGeneration: 12,
    pointerAnchor: 'pointer://m0/anuttara',
    dayNowSessionHandle: '2026-06-01/session',
    privacyClass: 'public_current',
    provenance: {
        source: 'captured-s2-graph',
        generation: 12,
        notes: []
    }
});

const capturedS2GraphNode = Object.freeze({
    coordinate: 'M0',
    canonicalCoordinate: 'M0',
    label: 'Anuttara prior ground',
    labels: ['BimbaCoordinate', 'MCoordinate'],
    namespace: 'bimba',
    properties: {
        canonical_coordinate: 'M0',
        symbol: '0/1',
        formulation_type: 'prior-ground-boundary',
        complete_formulation: 'Anuttara as the prior 0/1 ground received by M1.',
        c_0_family: 'anuttara',
        graph_namespace: 'bimba',
        anchors: {
            source: 'Idea/Bimba/Seeds/M/M0/M0-SPEC.md',
            spec: 'Idea/Bimba/Seeds/M/M0/M0-SPEC.md',
            code: 'Body/M/epi-theia/extensions/m0-anuttara',
            test: 'Body/M/epi-theia/extensions/test/m0-anuttara-inspector.test.mjs'
        },
        pointer_web: {
            summary: 'M0 anchors the prior field before M1 receives the +1 parent.'
        }
    },
    relations: [
        {
            type: 'RECEIVED_BY',
            properties: {
                family: 'm0-to-m1-prior-ground'
            }
        }
    ],
    readiness: {
        owl: {
            state: 'inferred',
            summary: 'n10s import available as inferred readiness.',
            provenance: 'S2 ontology_bridge_contract'
        },
        shacl: {
            state: 'review_pending',
            summary: 'SHACL report captured; not promoted to canon.',
            provenance: 'S2 SHACL validation report'
        },
        gds: {
            state: 'blocked',
            summary: 'GDS overlay handle unavailable in current runtime.',
            provenance: 'S2 GDS overlay contract'
        },
        kernel_core: {
            state: 'canonical',
            summary: 'Kernel-core relation audit passed.',
            provenance: 'S2 kernel relation audit'
        }
    }
});

const profile = Object.freeze({
    generation: 12,
    pointerAnchor: 'pointer://m0/anuttara',
    capabilities: ['s2.graph.node', 's5.review.submit'],
    payload: {
        m0_graph_node: capturedS2GraphNode
    }
});

test('legacy # input and M-family input resolve to the same canonical branch', () => {
    assert.deepEqual(normalizeM0CoordinateInput('#0'), {
        input: '#0',
        canonicalMCoordinate: 'M0',
        hashCompatible: true
    });
    assert.equal(normalizeM0CoordinateInput('M0').canonicalMCoordinate, 'M0');
    assert.equal(normalizeM0CoordinateInput("M0'").canonicalMCoordinate, 'M0');
});

test('captured S2 payload renders within budget and keeps family identity in properties', () => {
    const started = performance.now();
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });
    const elapsed = performance.now() - started;

    assert.ok(elapsed < model.renderBudgetMs, `model build took ${elapsed}ms`);
    assert.equal(model.query.canonicalMCoordinate, 'M0');
    assert.equal(model.node.label, 'Anuttara prior ground');
    assert.deepEqual(model.node.badges, ['namespace:bimba', 'BimbaCoordinate', 'MCoordinate']);
    assert.equal(
        model.relationFamilies.find(field => field.key === 'c_0_family')?.value,
        'anuttara'
    );
    assert.equal(
        model.relationFamilies.find(field => field.key === 'relation:RECEIVED_BY')?.value,
        'm0-to-m1-prior-ground'
    );
});

test('missing Anuttara syntax fields render as canonical absence, not placeholders', () => {
    const sparse = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: { coordinate: 'M0', properties: { c_0_family: 'anuttara' } },
        profile: null,
        readiness,
        context
    });

    for (const field of sparse.languageFields) {
        assert.equal(field.value, null);
        assert.equal(field.state, 'canonical_absent');
        assert.match(field.provenance, /Canonical absence/);
        assert.doesNotMatch(field.provenance, /placeholder/i);
    }
});

test('OWL SHACL GDS facts preserve inferred/review-pending/blocked status', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.equal(model.readinessFacts.find(fact => fact.id === 'owl')?.state, 'inferred');
    assert.equal(model.readinessFacts.find(fact => fact.id === 'shacl')?.state, 'review_pending');
    assert.equal(model.readinessFacts.find(fact => fact.id === 'gds')?.state, 'blocked');
    assert.equal(model.readinessFacts.find(fact => fact.id === 'kernel-core')?.canonical, true);
});

test('M5 action hooks are gateway-shaped requests and cannot write graph canon', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.deepEqual(
        model.actions.map(action => action.method),
        ["s5'.improve.propose", 's5.episodic.deposit', "s5'.review.submit"]
    );
    for (const action of model.actions) {
        assert.equal(action.mutatesGraphCanon, false);
        assert.equal(action.params.mutatesGraphCanon, false);
        assert.equal(action.params.coordinate, 'M0');
        assert.equal(action.params.privacyClass, 'public_current_with_graph_provenance');
    }
});

test('M0 pedagogy keeps prior-ground boundary and routes +1 parent away from M0', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.match(model.pedagogy.priorGroundBoundary, /prior 0\/1 ground/);
    assert.match(model.pedagogy.parentAttribution, /M1\/M2\/M3/);
    assert.match(model.pedagogy.contradiction, /DCC-01/);
});
