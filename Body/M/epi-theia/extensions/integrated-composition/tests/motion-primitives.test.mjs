import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    LEMNISCATE_TRANSITION_DURATION_MS,
    LEMNISCATE_TRANSITION_REDUCED_DURATION_MS,
    RING_QUATERNION_LUT,
    SLERP_ANGULAR_STEP_DEG,
    SLERP_KLEIN_BOUNDARY_TICK,
    SlerpChoreographyClock,
    LemniscateTransition,
    resolveLemniscateTransitionDurationMs,
    slerpClockFromProfileTickEvent
} = require('../lib/browser/design-primitives/index.js');

test('design-primitives export the motion grammar primitives from the compiled package surface', () => {
    assert.equal(typeof LemniscateTransition, 'function');
    assert.equal(typeof SlerpChoreographyClock, 'function');
    assert.equal(resolveLemniscateTransitionDurationMs(false), LEMNISCATE_TRANSITION_DURATION_MS);
    assert.equal(resolveLemniscateTransitionDurationMs(true), LEMNISCATE_TRANSITION_REDUCED_DURATION_MS);
});

test('slerp choreography derives six-ring position and Hopf boundary flags from profile-tick events', () => {
    assert.equal(SLERP_ANGULAR_STEP_DEG, 30);
    assert.equal(SLERP_KLEIN_BOUNDARY_TICK, 5);
    assert.equal(RING_QUATERNION_LUT.length, 12);

    const beforeBoundary = slerpClockFromProfileTickEvent({ tick12: 5, slerpFraction: 0.5 });
    assert.deepEqual(beforeBoundary, {
        tick12: 5,
        position6: 5,
        slerpFraction: 0.5,
        kleinAtBoundary: true,
        hopfFlagFlipped: false
    });

    const afterBoundary = slerpClockFromProfileTickEvent({ tick12: 6 });
    assert.deepEqual(afterBoundary, {
        tick12: 6,
        position6: 0,
        slerpFraction: 0,
        kleinAtBoundary: false,
        hopfFlagFlipped: true
    });
});

test('lemniscate transition snaps the moving stroke under reduced-motion preference', () => {
    const previousWindow = globalThis.window;
    globalThis.window = {
        matchMedia: query => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            addEventListener() {},
            removeEventListener() {}
        })
    };

    try {
        const html = renderToStaticMarkup(
            React.createElement(
                LemniscateTransition,
                { phase: 0.42 },
                React.createElement('span', null, 'composition surface')
            )
        );

        assert.match(html, /data-reduced-motion="true"/);
        assert.match(html, /transition:opacity 100ms cubic-bezier\(0\.4, 0\.0, 0\.2, 1\)/);
        assert.match(html, /stroke-dashoffset:0/);
    } finally {
        if (previousWindow === undefined) {
            delete globalThis.window;
        } else {
            globalThis.window = previousWindow;
        }
    }
});
