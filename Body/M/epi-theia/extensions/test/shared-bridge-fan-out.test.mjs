// Verifies the 07.T1 verification rule:
// "Tests prove only one bridge subscription source fans out to six extensions."
//
// Loads the compiled SharedBridgeAdapter from m-extension-runtime/lib, attaches
// a single recording bridge stub, registers six subscribers (one per
// M-extension), drives a profile event, and asserts each subscriber sees the
// same generation exactly once while the upstream bridge sees exactly ONE
// subscription per bridge channel.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SharedBridgeAdapter } = require(
    '../m-extension-runtime/lib/common/shared-bridge.js'
);

function makeRecordingBridge() {
    const calls = {
        readCurrentProfile: 0,
        readReadiness: 0,
        onMathemeHarmonicProfile: 0,
        onConnectionStatusChange: 0,
        onObservabilityEvent: 0,
        depositKernelObservation: 0
    };
    const profileListeners = new Set();
    const statusListeners = new Set();
    const observabilityListeners = new Set();
    let currentProfile = null;

    const bridge = {
        readCurrentProfile: async () => {
            calls.readCurrentProfile += 1;
            return currentProfile;
        },
        readPointerAnchor: async () => null,
        readReadiness: async () => {
            calls.readReadiness += 1;
            return {
                fetchedAt: 1,
                state: 'degraded_but_readable',
                reason: 'stub readiness',
                profileGeneration: currentProfile ? currentProfile.generation : null,
                bridgeReachable: true,
                blockerIds: []
            };
        },
        subscribeObservability: listener => {
            observabilityListeners.add(listener);
            return { dispose: () => observabilityListeners.delete(listener) };
        },
        invokeGatewayRpc: async () => null,
        depositKernelObservation: async () => {
            calls.depositKernelObservation += 1;
        },
        requestReviewEvidence: async () => null,
        onMathemeHarmonicProfile: listener => {
            calls.onMathemeHarmonicProfile += 1;
            profileListeners.add(listener);
            return { dispose: () => profileListeners.delete(listener) };
        },
        onConnectionStatusChange: listener => {
            calls.onConnectionStatusChange += 1;
            statusListeners.add(listener);
            return { dispose: () => statusListeners.delete(listener) };
        },
        onObservabilityEvent: listener => {
            calls.onObservabilityEvent += 1;
            observabilityListeners.add(listener);
            return { dispose: () => observabilityListeners.delete(listener) };
        }
    };

    return {
        bridge,
        calls,
        emitProfile(profile) {
            currentProfile = profile;
            for (const listener of profileListeners) {
                listener(profile);
            }
        },
        emitStatus(status) {
            for (const listener of statusListeners) {
                listener(status);
            }
        },
        emitObservability(event) {
            for (const listener of observabilityListeners) {
                listener(event);
            }
        },
        listenerCounts() {
            return {
                profile: profileListeners.size,
                status: statusListeners.size,
                observability: observabilityListeners.size
            };
        }
    };
}

const M_EXTENSION_IDS = [
    'm0-anuttara',
    'm1-paramasiva',
    'm2-parashakti',
    'm3-mahamaya',
    'm4-nara',
    'm5-epii'
];

test('single SharedBridgeAdapter fans out one upstream subscription to six extensions', async () => {
    const adapter = new SharedBridgeAdapter();
    const recording = makeRecordingBridge();

    // Six extensions subscribe BEFORE the bridge attaches — exercising the
    // late-subscriber cache path. Each one records every snapshot it sees.
    const seen = new Map();
    for (const id of M_EXTENSION_IDS) {
        seen.set(id, { profileGenerations: [], statusModes: [] });
        adapter.onProfile(profile => {
            seen.get(id).profileGenerations.push(profile ? profile.generation : null);
        });
        adapter.onConnectionStatus(status => {
            seen.get(id).statusModes.push(status.mode);
        });
    }

    adapter.attachBridge(recording.bridge);
    // Allow microtasks for the readiness/profile promises to resolve.
    await new Promise(resolve => setImmediate(resolve));

    // Each upstream channel was subscribed exactly once.
    assert.equal(
        recording.calls.onMathemeHarmonicProfile,
        1,
        'profile channel must be subscribed exactly once by the shared adapter'
    );
    assert.equal(recording.calls.onConnectionStatusChange, 1);
    assert.equal(recording.calls.onObservabilityEvent, 1);
    assert.deepEqual(recording.listenerCounts(), {
        profile: 1,
        status: 1,
        observability: 1
    });

    // Drive a single profile event — every extension must observe the same
    // generation id.
    const generation = 42;
    recording.emitProfile({
        generation,
        pointerAnchor: 'pointer://test',
        capabilities: ['readCurrentProfile'],
        payload: {}
    });

    for (const id of M_EXTENSION_IDS) {
        const observed = seen.get(id).profileGenerations.filter(g => g === generation);
        assert.equal(
            observed.length,
            1,
            `${id} must observe profile generation ${generation} exactly once`
        );
    }

    // Drive a status change too.
    recording.emitStatus({ connected: true, mode: 'full', reason: 'connected' });
    for (const id of M_EXTENSION_IDS) {
        assert.ok(
            seen.get(id).statusModes.includes('full'),
            `${id} must observe the connection status change`
        );
    }

    assert.equal(adapter.getUpstreamSubscriptionCount(), 1);
});

test('observability publish propagates through one fan-out point', () => {
    const adapter = new SharedBridgeAdapter();
    const recording = makeRecordingBridge();
    adapter.attachBridge(recording.bridge);

    const received = new Map();
    for (const id of M_EXTENSION_IDS) {
        received.set(id, []);
        adapter.onObservabilityEvent(event => received.get(id).push(event.type));
    }

    const event = {
        type: 'm0.graph.provenance',
        extensionId: 'm0-anuttara',
        emittedAt: 1,
        payload: { ok: true }
    };
    adapter.publish(event);

    for (const id of M_EXTENSION_IDS) {
        assert.deepEqual(received.get(id), ['m0.graph.provenance']);
    }
    assert.equal(recording.calls.depositKernelObservation, 1);
});
