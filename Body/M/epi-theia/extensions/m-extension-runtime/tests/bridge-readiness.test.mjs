import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const {
    BRIDGE_READINESS_IDS,
    BridgeReadinessBadge,
    classifyReadiness,
    isBridgeReadinessRed
} = require('../lib/common/bridge-readiness.js');

function snapshot(state, overrides = {}) {
    return {
        fetchedAt: 7,
        state,
        reason: `${state} reason`,
        profileGeneration: state === 'bridge_unavailable' ? null : 42,
        bridgeReachable: state !== 'bridge_unavailable',
        blockerIds: [`${state}.blocker`],
        ...overrides
    };
}

test('classifyReadiness preserves every 07-t0 readiness id for a binding', () => {
    assert.deepEqual([...BRIDGE_READINESS_IDS], [
        'bridge_unavailable',
        'profile_missing_field',
        's2_graph_blocked',
        's3_subscription_blocked',
        's5_review_blocked',
        'authority_payload_missing',
        'privacy_blocked',
        'degraded_but_readable',
        'ready_public_current'
    ]);

    for (const id of BRIDGE_READINESS_IDS) {
        const binding = classifyReadiness(snapshot(id), 's2.graph.node');
        assert.equal(binding.bindingKey, 's2.graph.node');
        assert.equal(binding.readinessId, id);
        assert.equal(binding.lastTickObserved, 7);
        assert.deepEqual(binding.blockers, [`${id}.blocker`, `${id} reason`]);
    }
});

test('BridgeReadinessBadge renders colour class, readiness text, and red blocked overlay', () => {
    for (const id of BRIDGE_READINESS_IDS) {
        const binding = classifyReadiness(snapshot(id), 's5.review.inbox');
        const html = renderToStaticMarkup(
            React.createElement(BridgeReadinessBadge, { bindingKey: 's5.review.inbox', readiness: binding })
        );
        assert.match(html, /bridge-readiness-badge/);
        assert.match(html, new RegExp(id));
        assert.match(html, /s5.review.inbox/);
        if (id === 'ready_public_current' || id === 'degraded_but_readable') {
            assert.match(html, /bridge-readiness-green/);
        } else if (id === 'bridge_unavailable' || id === 'privacy_blocked') {
            assert.match(html, /bridge-readiness-red/);
            assert.match(html, /bridge-readiness-blocked-overlay/);
            assert.equal(isBridgeReadinessRed(id), true);
        } else {
            assert.match(html, /bridge-readiness-amber/);
        }
    }
});
