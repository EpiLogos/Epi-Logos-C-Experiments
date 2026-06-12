import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    VoidStructureRing,
    contextForVoidLensSelection,
    readM0VoidStructureProjection,
    selectM0VoidLens
} = require('../m0-anuttara/lib/browser/components/void-structure-ring.js');

const context = Object.freeze({
    selectedCoordinate: '#0',
    hashInput: '#0',
    canonicalMCoordinate: 'M0',
    profileGeneration: 15,
    pointerAnchor: 'pointer://m0/anuttara',
    dayNowSessionHandle: '2026-06-01/session',
    privacyClass: 'public_current',
    provenance: {
        source: 'captured-s2-graph',
        generation: 15,
        notes: []
    }
});

function lens(index, state = 'canonical') {
    return Object.freeze({
        lensIndex: index,
        coordinate: `#0-4-${index}`,
        label: `Void lens ${index}`,
        state
    });
}

function lenses() {
    return Object.freeze(Array.from({ length: 16 }, (_, index) =>
        lens(index, index === 7 ? 'canonical_absent' : index === 12 ? 'blocked' : 'canonical')
    ));
}

function projection() {
    return Object.freeze({
        lenses: lenses(),
        state: 'blocked'
    });
}

test('m0_void_structure_ring payload parses only a real sixteen-lens projection', () => {
    const parsed = readM0VoidStructureProjection({
        payload: {
            m0_void_structure_ring: lenses()
        }
    });

    assert.ok(parsed);
    assert.equal(parsed.lenses.length, 16);
    assert.equal(parsed.lenses[0].coordinate, '#0-4-0');
    assert.equal(parsed.lenses[7].state, 'canonical_absent');
    assert.equal(parsed.state, 'blocked');
    assert.equal(readM0VoidStructureProjection({ payload: { m0_void_structure_ring: lenses().slice(0, 15) } }), null);
    assert.equal(readM0VoidStructureProjection({ payload: { m0_void_structure_ring: [{ lensIndex: 0 }] } }), null);
});

test('VoidStructureRing renders sixteen coordinate-labelled SVG arc paths', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(VoidStructureRing, {
            projection: projection(),
            onLensClick: () => undefined
        })
    );

    assert.equal((markup.match(/m0-void-structure-ring__arc/g) ?? []).length, 16);
    assert.match(markup, /aria-label="#0-4-0 Void lens 0 provenance canonical"/);
    assert.match(markup, /aria-label="#0-4-7 Void lens 7 provenance canonical_absent"/);
    assert.match(markup, /data-provenance-state="blocked"/);
    assert.match(markup, /data-conjugation-axis="0"/);
});

test('clicking arc seven can update selectedCoordinate through CoordinateContext', () => {
    let received = null;
    const bridge = {
        updateCoordinateContext(value) {
            received = value;
        }
    };
    const ring = VoidStructureRing({
        projection: projection(),
        onLensClick: selected => {
            selectM0VoidLens(bridge, context, selected);
        }
    });
    const svg = ring.props.children;
    const arcComponents = React.Children.toArray(svg.props.children).filter(child =>
        typeof child.type === 'function'
    );
    const arcSevenGroup = arcComponents[7].type(arcComponents[7].props);
    const arcSevenPath = React.Children.toArray(arcSevenGroup.props.children)[0];

    arcSevenPath.props.onClick();

    assert.ok(received);
    assert.equal(received.selectedCoordinate, '#0-4-7');
    assert.equal(received.hashInput, '#0-4-7');
    assert.equal(received.canonicalMCoordinate, 'M0');
    assert.equal(received.provenance.source, 'm0-anuttara:void-structure-ring');
    assert.match(received.provenance.notes.join(' '), /lensIndex=7/);

    const direct = contextForVoidLensSelection(context, lens(8));
    assert.equal(direct.selectedCoordinate, '#0-4-8');
    assert.match(direct.provenance.notes.join(' '), /conjugationAxis=0/);
});
