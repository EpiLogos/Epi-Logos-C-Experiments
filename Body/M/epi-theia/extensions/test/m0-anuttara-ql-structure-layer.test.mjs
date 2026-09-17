// 21.3 verification suite - QL-Structure Layer Reader panel (M0-1', WC-M0-03).
// Reads the QL-structure projection from the same s2.graph.node payload the other
// M0' layers consume and renders the <dl> + Coordinate Tree deep-link. The reader
// never duplicates the ide-shell coordinate tree widget; it routes a cross-layout
// intent instead.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    QlStructureLayerPanel,
    buildM0QlStructureTreeIntent,
    readM0QlStructureProjection
} = require('../m0-anuttara/lib/browser/panels/ql-structure-layer-panel.js');
const {
    buildM0InspectorModel,
    readM0QlStructureProjection: readFromInspector
} = require('../m0-anuttara/lib/common/m0-inspector.js');

const readiness = Object.freeze({
    fetchedAt: 1,
    state: 'ready_public_current',
    reason: 'captured S2 graph payload available',
    profileGeneration: 21,
    bridgeReachable: true,
    blockerIds: []
});

const context = Object.freeze({
    selectedCoordinate: '#4',
    hashInput: '#4',
    canonicalMCoordinate: 'M4',
    profileGeneration: 21,
    pointerAnchor: 'pointer://m0/anuttara',
    dayNowSessionHandle: '2026-06-18/session',
    privacyClass: 'public_current',
    provenance: { source: 'captured-s2-graph', generation: 21, notes: [] }
});

// Captured s2.graph.node payload: c_1_ql_position 4 (#4 Lemniscate), mod6 variant,
// a structural FAMILY_CONTAINS parent edge, a MIRROR_CHILDREN row, and two
// ANCHORED_TO edges. A correspondential RESONATES_WITH edge is included to prove
// the Track 01.9 c_1_relation_family discriminator filters it out.
const capturedQlNode = Object.freeze({
    coordinate: 'M0',
    properties: Object.freeze({
        canonical_coordinate: 'M0',
        c_1_ql_position: 4,
        c_1_ql_variant: 'mod6'
    }),
    relations: Object.freeze([
        Object.freeze({
            type: 'FAMILY_CONTAINS',
            target: 'M0',
            properties: Object.freeze({ c_1_relation_family: 'structural' })
        }),
        Object.freeze({
            type: 'MIRROR_CHILDREN',
            properties: Object.freeze({
                c_1_relation_family: 'structural',
                child: "M0'",
                inverse: '#0'
            })
        }),
        Object.freeze({
            type: 'ANCHORED_TO',
            target: 'M1',
            properties: Object.freeze({ c_1_relation_family: 'structural' })
        }),
        Object.freeze({
            type: 'ANCHORED_TO',
            target: 'M5',
            properties: Object.freeze({ c_1_relation_family: 'structural' })
        }),
        Object.freeze({
            type: 'FAMILY_CONTAINS',
            target: 'M2:correspondence',
            properties: Object.freeze({ c_1_relation_family: 'correspondential' })
        })
    ])
});

test('selector is re-exported from the panel and the inspector common module', () => {
    assert.equal(typeof readM0QlStructureProjection, 'function');
    assert.equal(readM0QlStructureProjection, readFromInspector);
});

test('c_1_ql_position 4 + mod6 + FAMILY_CONTAINS parent yields a canonical projection', () => {
    const projection = readM0QlStructureProjection(capturedQlNode);

    assert.equal(projection.state, 'canonical');
    assert.equal(projection.position, 4);
    assert.equal(projection.qlVariant, 'mod6');
    assert.equal(projection.familyContainsParent, 'M0');
    assert.deepEqual(projection.mirror, { child: "M0'", inverse: '#0' });
    // Correspondential FAMILY_CONTAINS edge filtered by the Track 01.9 discriminator.
    assert.deepEqual([...projection.anchoredTo], ['M1', 'M5']);
});

test('inspector model exposes the same qlStructure projection', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#4',
        graphNode: capturedQlNode,
        profile: null,
        readiness,
        context
    });

    assert.equal(model.qlStructure.state, 'canonical');
    assert.equal(model.qlStructure.position, 4);
    assert.equal(model.qlStructure.qlVariant, 'mod6');
    assert.equal(model.qlStructure.familyContainsParent, 'M0');
});

test('panel renders all three fields with canonical provenance and the deep-link', () => {
    const projection = readM0QlStructureProjection(capturedQlNode);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(QlStructureLayerPanel, {
            projection,
            coordinate: 'M0',
            commands: { executeCommand: () => undefined }
        })
    );

    assert.match(markup, /data-ql-field-key="c_1_ql_position"[^>]*data-provenance-state="canonical"/);
    assert.match(markup, /data-ql-field-key="c_1_ql_variant"[^>]*data-provenance-state="canonical"/);
    assert.match(markup, /data-ql-field-key="FAMILY_CONTAINS"[^>]*data-provenance-state="canonical"/);
    assert.match(markup, /data-ql-field-key="MIRROR_CHILDREN"[^>]*data-provenance-state="canonical"/);
    assert.match(markup, /data-ql-field-key="ANCHORED_TO"[^>]*data-provenance-state="canonical"/);
    assert.match(markup, /mod6/);
    assert.match(markup, /data-contribution-id="coordinateTree"/);
    assert.match(markup, /Open in Coordinate Tree/);
});

test('missing payload falls back to canonical_absent', () => {
    const projection = readM0QlStructureProjection(null);

    assert.equal(projection.state, 'canonical_absent');
    assert.equal(projection.position, null);
    assert.equal(projection.qlVariant, null);
    assert.equal(projection.familyContainsParent, null);
    assert.deepEqual(projection.mirror, { child: null, inverse: null });
    assert.deepEqual([...projection.anchoredTo], []);

    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(QlStructureLayerPanel, {
            projection,
            coordinate: null,
            commands: { executeCommand: () => undefined }
        })
    );
    assert.match(markup, /data-provenance-state="canonical_absent"/);
});

test('Coordinate Tree intent routes through ide-shell-m0-m5 without duplicating the tree', () => {
    assert.deepEqual(buildM0QlStructureTreeIntent('M0'), {
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: 'coordinateTree',
        coordinate: 'M0',
        source: 'm0-anuttara:ql-structure-layer-panel'
    });
});
