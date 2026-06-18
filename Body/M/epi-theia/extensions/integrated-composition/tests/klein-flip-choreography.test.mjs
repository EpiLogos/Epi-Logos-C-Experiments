import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const { SharedBridgeAdapter } = require('../../m-extension-runtime/lib/common/shared-bridge.js');
const {
    KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS,
    openChoreographyDirector
} = require('../lib/common/klein-flip-choreography.js');

function recordingBridge() {
    const profileListeners = new Set();
    const statusListeners = new Set();
    const observabilityListeners = new Set();
    const deposited = [];

    const bridge = {
        readCurrentProfile: async () => null,
        readPointerAnchor: async () => null,
        readReadiness: async () => ({
            fetchedAt: 1,
            state: 'ready_public_current',
            reason: 'ready',
            profileGeneration: null,
            bridgeReachable: true,
            blockerIds: []
        }),
        subscribeObservability: listener => {
            observabilityListeners.add(listener);
            return { dispose: () => observabilityListeners.delete(listener) };
        },
        invokeGatewayRpc: async () => null,
        depositKernelObservation: async event => {
            deposited.push(event);
        },
        requestReviewEvidence: async () => null,
        parashaktiCorrespondences: async () => null,
        onMathemeHarmonicProfile: listener => {
            profileListeners.add(listener);
            return { dispose: () => profileListeners.delete(listener) };
        },
        onConnectionStatusChange: listener => {
            statusListeners.add(listener);
            return { dispose: () => statusListeners.delete(listener) };
        },
        onObservabilityEvent: listener => {
            observabilityListeners.add(listener);
            return { dispose: () => observabilityListeners.delete(listener) };
        }
    };

    return {
        bridge,
        deposited,
        emitProfile(profile) {
            for (const listener of profileListeners) {
                listener(profile);
            }
        },
        emitObservability(event) {
            for (const listener of observabilityListeners) {
                listener(event);
            }
        }
    };
}

function callRecorder(methodName) {
    const calls = [];
    return {
        calls,
        handle: {
            [methodName](input) {
                calls.push({ input, at: performance.now() });
            }
        }
    };
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('synthetic KleinFlipEvent dispatches all three composition handles in one microtask', async () => {
    const bridge = new SharedBridgeAdapter();
    const recording = recordingBridge();
    bridge.attachBridge(recording.bridge);

    const k2 = callRecorder('requestFold');
    const cymatic = callRecorder('requestValenceInvert');
    const codon = callRecorder('requestAxisFlip');
    const observed = [];
    bridge.onObservabilityEvent(event => observed.push(event));

    const director = openChoreographyDirector(bridge);
    director.registerK2Handle(k2.handle);
    director.registerCymaticMount(cymatic.handle);
    director.registerCodonRotation(codon.handle);

    const busAt = Date.now();
    recording.emitProfile({
        generation: 87,
        pointerAnchor: null,
        capabilities: [],
        payload: {
            tick12: 6,
            position6: 0,
            kleinFlip: {
                kind: 'M3CodonRotationCross',
                fromTick: 5,
                toTick: 6,
                codonBefore: 21,
                codonAfter: 42
            }
        }
    });

    assert.equal(k2.calls.length, 0, 'dispatch waits for the choreography microtask');
    await Promise.resolve();

    assert.deepEqual(k2.calls.map(call => call.input), [
        { durationMs: KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS }
    ]);
    assert.deepEqual(cymatic.calls.map(call => call.input), [
        { durationMs: KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS }
    ]);
    assert.deepEqual(codon.calls.map(call => call.input), [
        { durationMs: KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS }
    ]);

    const callTimes = [k2.calls[0].at, cymatic.calls[0].at, codon.calls[0].at];
    assert.ok(
        Math.max(...callTimes) - Math.min(...callTimes) < 1,
        'all three animation requests should be issued in the same microtask'
    );

    const startEvent = observed.find(
        event => event.type === 'composition.kleinflip.choreography.start'
    );
    assert.ok(startEvent, 'start observability event must be emitted');
    assert.ok(
        Math.abs(startEvent.emittedAt - busAt) <= 1,
        `start event emittedAt ${startEvent.emittedAt} must stay within 1ms of bus event ${busAt}`
    );
    assert.equal(startEvent.payload.profileGeneration, 87);
    assert.equal(startEvent.payload.kleinFlipVariant, 'M3CodonRotationCross');

    assert.equal(
        observed.some(event => event.type === 'composition.kleinflip.choreography.end'),
        false,
        'end event must wait for the choreography duration'
    );

    await wait(KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS + 25);

    const endEvent = observed.find(
        event => event.type === 'composition.kleinflip.choreography.end'
    );
    assert.ok(endEvent, 'end observability event must be emitted after duration');
    assert.ok(
        endEvent.emittedAt - startEvent.emittedAt >= KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS,
        'end event emittedAt must be at least the 200ms choreography duration after start'
    );
    assert.equal(endEvent.payload.kleinFlipVariant, 'M3CodonRotationCross');

    director.dispose();
});

