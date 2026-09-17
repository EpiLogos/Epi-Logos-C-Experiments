// 21.16 verification suite - M0/M2 Parity Bridge Reader (WC-M0-19).
// Uses captured kernel-bridge-shaped profile payload rows; renderer reads the
// shared profile projection and never imports backend LUT headers directly.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    M0ParityBridgeReader,
    readM0ParityBridgeProjection,
    rowsForActiveArchetype,
    parityBridgeIntentForRow
} = require('../m0-anuttara/lib/browser/panels/parity-bridge-reader.js');

const capturedProjection = Object.freeze({
    state: 'canonical',
    zodiacalBridge: Object.freeze(
        Array.from({ length: 12 }, (_, index) =>
            Object.freeze({
                vakSymbol: `VAK-${index}`,
                m0ResonanceIdx: index,
                m0Successor: (index + 1) % 12,
                element: index % 2 === 0 ? 'Fire' : 'Earth',
                mode: index % 3 === 0 ? 'cardinal' : index % 3 === 1 ? 'fixed' : 'mutable',
                m2SignIdx: index,
                decanPlanets: Object.freeze(['Mars', 'Sun', 'Venus']),
                firstDecanIdx72: index * 6
            })
        )
    ),
    psychoidPlanetary: Object.freeze([
        Object.freeze({ lensCoordinate: '#0-4-0', lensName: 'Moon lens', planetName: 'Moon', planetId: 0 }),
        Object.freeze({ lensCoordinate: '#0-4-1', lensName: 'Mercury lens', planetName: 'Mercury', planetId: 1 }),
        Object.freeze({ lensCoordinate: '#0-4-2', lensName: 'Venus lens', planetName: 'Venus', planetId: 2 }),
        Object.freeze({ lensCoordinate: '#0-4-3', lensName: 'Sun lens', planetName: 'Sun', planetId: 3 }),
        Object.freeze({ lensCoordinate: '#0-4-4', lensName: 'Mars lens', planetName: 'Mars', planetId: 4 }),
        Object.freeze({ lensCoordinate: '#0-4-5', lensName: 'Jupiter lens', planetName: 'Jupiter', planetId: 5 }),
        Object.freeze({ lensCoordinate: '#0-4-6', lensName: 'Saturn lens', planetName: 'Saturn', planetId: 6 })
    ]),
    alchemicalToTattvic: Object.freeze([
        Object.freeze({ alchemicalName: 'Aether', tattvicName: 'Akasha', mElemId: 0, cyclePoint: 'prima_materia' }),
        Object.freeze({ alchemicalName: 'Earth', tattvicName: 'Prithvi', mElemId: 1, cyclePoint: 'intermediate' }),
        Object.freeze({ alchemicalName: 'Water', tattvicName: 'Apas', mElemId: 2, cyclePoint: 'intermediate' }),
        Object.freeze({ alchemicalName: 'Air', tattvicName: 'Vayu', mElemId: 3, cyclePoint: 'intermediate' }),
        Object.freeze({ alchemicalName: 'Fire', tattvicName: 'Tejas', mElemId: 4, cyclePoint: 'intermediate' }),
        Object.freeze({ alchemicalName: 'Salt', tattvicName: 'Gandha', mElemId: 5, cyclePoint: 'ultima_materia' })
    ])
});

function profile() {
    return Object.freeze({
        generation: 19,
        pointerAnchor: 'pointer://m0/parity',
        capabilities: Object.freeze(['m0.m2.parity']),
        payload: Object.freeze({
            m0_m2_parity_bridges: capturedProjection
        })
    });
}

test('profile.payload.m0_m2_parity_bridges parses into the parity bridge projection', () => {
    const projection = readM0ParityBridgeProjection(profile());

    assert.ok(projection);
    assert.equal(projection.state, 'canonical');
    assert.equal(projection.zodiacalBridge.length, 12);
    assert.equal(projection.psychoidPlanetary.length, 7);
    assert.equal(projection.alchemicalToTattvic.length, 6);
});

test('Arch 5 input renders seven psychoid planetary rows with Saturn at index 6', () => {
    const projection = readM0ParityBridgeProjection(profile());
    const rows = rowsForActiveArchetype(projection, 5);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M0ParityBridgeReader, {
            profile: profile(),
            activeArchetype: 5
        })
    );

    assert.equal(rows.length, 7);
    assert.equal(rows[6].planetName, 'Saturn');
    assert.equal(rows[6].planetId, 6);
    assert.match(markup, /data-active-archetype="5"/);
    assert.match(markup, /PSYCHOID_PLANETARY_CORRESPONDENCE\[7\]/);
    assert.match(markup, /data-row-index="6"[^>]*data-planet-id="6"/);
    assert.match(markup, /Saturn/);

    const intent = parityBridgeIntentForRow(rows[6], 5);
    assert.equal(intent.requestedExtensionId, 'm2-parashakti');
    assert.equal(intent.requestedContributionId, 'correspondenceTree');
    assert.equal(intent.coordinate, 'M2:planet:6');
});

test("Arch 7 input renders six alchemical rows with mElemId 5 named Salt and never Mineral", () => {
    const projection = readM0ParityBridgeProjection(profile());
    const rows = rowsForActiveArchetype(projection, 7);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M0ParityBridgeReader, {
            profile: profile(),
            activeArchetype: 7
        })
    );

    assert.equal(rows.length, 6);
    assert.equal(rows[5].mElemId, 5);
    assert.equal(rows[5].alchemicalName, 'Salt');
    assert.match(markup, /ALCHEMICAL_TO_TATTVIC\[6\]/);
    assert.match(markup, /data-row-index="5"[^>]*data-m-elem-id="5"/);
    assert.match(markup, /Salt/);
    assert.doesNotMatch(markup, /Mineral/);

    const intent = parityBridgeIntentForRow(rows[5], 7);
    assert.equal(intent.coordinate, 'M2:element:5');
});
