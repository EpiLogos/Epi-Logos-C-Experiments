import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    Matheme137Overlay,
    deriveMatheme137OverlayState,
    MATHEME_137_PARENT_ATTRIBUTION
} = require('../../lib/browser/matheme-137-overlay.js');

function surfaceHandle() {
    return Object.freeze({
        handleClass: 'k2-surface-handle',
        extensionId: 'm1-paramasiva-played-torus',
        handle: 'k2://surface/137',
        renderer: 'played-torus',
        privacyClass: 'public_current',
        generation: 137
    });
}

function profile(events = []) {
    return Object.freeze({
        generation: 137,
        pointerAnchor: 'profile://cosmic/137',
        capabilities: Object.freeze([]),
        payload: Object.freeze({
            m1_2_skeleton_events_fired: Object.freeze(events)
        })
    });
}

test('matheme 137 overlay renders surface-bound canonical hover forms and bridge attribution', () => {
    const html = renderToStaticMarkup(
        React.createElement(Matheme137Overlay, {
            surfaceHandle: surfaceHandle(),
            profile: profile()
        })
    );

    assert.match(html, /data-test="matheme-137-overlay"/);
    assert.match(html, /data-surface-handle="k2:\/\/surface\/137"/);
    assert.match(html, /64 = M3 codons/);
    assert.match(html, /72 = M2 invariant/);
    assert.match(html, /137 = 64 \+ 72 \+ 1/);
    assert.match(html, /137 = 64 \+ 2\(36\) \+ 1/);
    assert.match(html, /137 = 128 \+ 8 \+ 1/);
    assert.match(html, /137 = \(2\^7 - 1\) \+ 1 \+ 9/);
    assert.equal(MATHEME_137_PARENT_ATTRIBUTION, 'M1-5');
    assert.match(html, /data-parent-attribution="M1-5"/);
    assert.match(html, /9_\{M_2\} = 8_\{M_3\} \+ 1_\{M_1\}/);
});

test('matheme 137 overlay consumes Additive137 from profile events for pulse and 7-8-9 orbits', () => {
    const state = deriveMatheme137OverlayState(profile(['Additive137']));
    const html = renderToStaticMarkup(
        React.createElement(Matheme137Overlay, {
            surfaceHandle: surfaceHandle(),
            profile: profile(['Additive137'])
        })
    );

    assert.equal(state.additive137PulseActive, true);
    assert.match(html, /data-equation-pulse="true"/);
    assert.match(html, /data-test="matheme-137-orbit-7"/);
    assert.match(html, /data-test="matheme-137-orbit-8"/);
    assert.match(html, /data-test="matheme-137-orbit-9"/);
});

test('matheme 137 overlay hides Mersenne annotation by default and shows it in proof mode', () => {
    const defaultHtml = renderToStaticMarkup(
        React.createElement(Matheme137Overlay, {
            surfaceHandle: surfaceHandle(),
            profile: profile(['Additive137'])
        })
    );
    const proofHtml = renderToStaticMarkup(
        React.createElement(Matheme137Overlay, {
            surfaceHandle: surfaceHandle(),
            profile: profile(['Additive137']),
            proofMode: true
        })
    );

    assert.doesNotMatch(defaultHtml, /127 = 2\^7 - 1 = M_7/);
    assert.match(proofHtml, /127 = 2\^7 - 1 = M_7/);
});

test('matheme 137 overlay consumes KaprekarPedagogyHit and links the seed chip', () => {
    const state = deriveMatheme137OverlayState(profile(['KaprekarPedagogyHit']));
    const html = renderToStaticMarkup(
        React.createElement(Matheme137Overlay, {
            surfaceHandle: surfaceHandle(),
            profile: profile(['KaprekarPedagogyHit'])
        })
    );

    assert.equal(state.kaprekarChipActive, true);
    assert.match(html, /data-test="kaprekar-6174-chip"/);
    assert.match(html, /Kaprekar 6174/);
    assert.match(html, /Idea\/Bimba\/Seeds\/M\/M1&#x27;\/m1-prime-kaprekar-pedagogy\.md/);
});
