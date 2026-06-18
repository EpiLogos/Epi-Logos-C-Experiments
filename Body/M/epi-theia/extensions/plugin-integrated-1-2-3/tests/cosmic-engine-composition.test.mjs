import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { installBrowserShim } from '../../test/browser-shim.mjs';

const require = createRequire(import.meta.url);
installBrowserShim('cosmic-engine-composition-test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    CosmicEngineComposition,
    buildCosmicCompositionModel
} = require('../lib/browser/cosmic-engine-composition.js');

function completeProfile(overrides = {}) {
    return Object.freeze({
        generation: 137,
        pointerAnchor: 'profile://cosmic/137',
        capabilities: Object.freeze([]),
        payload: Object.freeze({
            k2SurfaceHandle: Object.freeze({
                handle: 'k2://played-torus/live-surface'
            }),
            anandaVortexMatrix: Object.freeze({
                familyHandle: 'm1://ananda/vortex-matrix'
            }),
            compositionMountPoint: Object.freeze({
                handle: 'm2://composition/cymatic-mount'
            }),
            resonance72: Object.freeze({
                lensAnchorIndex: 17
            }),
            audioOctet: Object.freeze([144, 162, 180, 216, 243, 270, 324, 360]),
            nodalQuartet: Object.freeze([
                Object.freeze({ m: 1, n: 2 }),
                Object.freeze({ m: 2, n: 3 }),
                Object.freeze({ m: 3, n: 5 }),
                Object.freeze({ m: 5, n: 8 })
            ]),
            m3CodonRotationProjectionForLensRing: Object.freeze({
                cells: Object.freeze([
                    Object.freeze({
                        ringIndex: 4,
                        cellIndex: 21,
                        positionLabel: 'P4/equator-south',
                        codonTriple: 'ATG',
                        colourHsla: 'hsla(210, 72%, 52%, 0.92)'
                    })
                ]),
                activeRingIndex: 4,
                rotationPhase: Math.PI / 3
            }),
            ...overrides
        })
    });
}

function count(haystack, needle) {
    return (haystack.match(new RegExp(needle, 'g')) ?? []).length;
}

test('renders one primary editor surface instead of the old three-pane editor juxtaposition', () => {
    const html = renderToStaticMarkup(
        React.createElement(CosmicEngineComposition, { profile: completeProfile() })
    );

    assert.equal(count(html, 'data-test="cosmic-engine-editor-surface"'), 1);
    assert.doesNotMatch(html, /cosmic-engine-layout/);
    assert.match(html, /data-editor-surface="cosmic-engine-composition"/);
    assert.match(html, /data-test="matheme-overlay-137"/);
});

test('occupies surface texture and cell-state slots with the M1 M2 M3 contributors', () => {
    const model = buildCosmicCompositionModel(completeProfile());

    assert.deepEqual(model.blockers, []);
    assert.deepEqual(
        model.slotOccupants.map(slot => [
            slot.geometricSlot,
            slot.extensionId,
            slot.handleClass
        ]),
        [
            ['surface', 'm1-paramasiva-played-torus', 'k2-surface-handle'],
            ['texture', 'm2-parashakti', 'cymatic-mount-point'],
            ['cell-state', 'm3-mahamaya', 'codon-rotation-export']
        ]
    );
    assert.deepEqual(
        model.geometricClaims.map(claim => [
            claim.geometricSlot,
            claim.extensionId,
            claim.handleClass
        ]),
        [
            ['surface', 'm1-paramasiva-played-torus', 'k2-surface-handle'],
            ['texture', 'm2-parashakti', 'cymatic-mount-point'],
            ['cell-state', 'm3-mahamaya', 'codon-rotation-export']
        ]
    );
    assert.equal(model.cymaticFrame?.sampleCount, 72);
    assert.equal(model.codonProjection?.cells[0]?.codonTriple, 'ATG');
});

test('keeps composition mounted and renders IntegratedEmptyState for pending K2 surface', () => {
    const html = renderToStaticMarkup(
        React.createElement(CosmicEngineComposition, {
            profile: completeProfile({ k2SurfaceHandle: undefined })
        })
    );

    assert.equal(count(html, 'data-test="cosmic-engine-editor-surface"'), 1);
    assert.match(html, /integrated-empty-state/);
    assert.match(html, /pending-k2-surface/);
    assert.match(html, /Track 22\.2/);
});
