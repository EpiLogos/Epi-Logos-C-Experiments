// 08.T2 verification suite. Proves:
//   (1) One bridge subscription is shared by both integrated plugins; late
//       subscribers receive the current generation with staleness metadata.
//   (2) Disconnect/reconnect/resync drives both plugin read models through
//       degraded states WITHOUT leaving stale profile claims.
//   (3) Renderer-local cadence never mutates authoritative profile / graph /
//       codon / review fields — the renderer only computes its own staleness
//       from an immutable IntegratedViewState.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SharedBridgeAdapter } = require('../m-extension-runtime/lib/common/shared-bridge.js');
const {
    IntegratedStateCoordinator,
    computeStaleness,
    PENDING_INTEGRATED_VIEW_STATE,
    INTEGRATED_OBSERVABILITY_KINDS
} = require('../integrated-composition/lib/common/index.js');

function makeRecordingBridge() {
    const profileListeners = new Set();
    const statusListeners = new Set();
    const readinessListeners = new Set();
    const observabilityListeners = new Set();
    let currentProfile = null;
    let upstreamProfileCalls = 0;
    let upstreamStatusCalls = 0;
    let upstreamObservabilityCalls = 0;

    return {
        bridge: {
            readCurrentProfile: async () => currentProfile,
            readPointerAnchor: async () => null,
            readReadiness: async () => ({
                fetchedAt: 1,
                state: 'degraded_but_readable',
                reason: 'stub',
                profileGeneration: currentProfile ? currentProfile.generation : null,
                bridgeReachable: true,
                blockerIds: []
            }),
            subscribeObservability: listener => {
                observabilityListeners.add(listener);
                return { dispose: () => observabilityListeners.delete(listener) };
            },
            invokeGatewayRpc: async () => null,
            depositKernelObservation: async () => {},
            requestReviewEvidence: async () => null,
            onMathemeHarmonicProfile: listener => {
                upstreamProfileCalls += 1;
                profileListeners.add(listener);
                return { dispose: () => profileListeners.delete(listener) };
            },
            onConnectionStatusChange: listener => {
                upstreamStatusCalls += 1;
                statusListeners.add(listener);
                return { dispose: () => statusListeners.delete(listener) };
            },
            onObservabilityEvent: listener => {
                upstreamObservabilityCalls += 1;
                observabilityListeners.add(listener);
                return { dispose: () => observabilityListeners.delete(listener) };
            }
        },
        upstream: {
            get profileCalls() { return upstreamProfileCalls; },
            get statusCalls() { return upstreamStatusCalls; },
            get observabilityCalls() { return upstreamObservabilityCalls; }
        },
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
        emitReadiness(snapshot) {
            for (const listener of readinessListeners) {
                listener(snapshot);
            }
        }
    };
}

test('IntegratedStateCoordinator shares one upstream subscription across both plugin consumers', async () => {
    const adapter = new SharedBridgeAdapter();
    const rec = makeRecordingBridge();
    adapter.attachBridge(rec.bridge);

    let clockTicks = 1000;
    const coord = new IntegratedStateCoordinator(adapter, {
        clockProvider: () => ++clockTicks
    });

    // Both plugins resolve the same singleton coordinator and subscribe.
    const plugin123 = [];
    const plugin450 = [];
    coord.onViewState(v => plugin123.push(v));
    coord.onViewState(v => plugin450.push(v));

    rec.emitProfile({
        generation: 7,
        pointerAnchor: 'pointer://t',
        capabilities: [],
        payload: {}
    });
    // Flush microtasks so readReadiness/readCurrentProfile promises resolve.
    await new Promise(resolve => setImmediate(resolve));

    // Both plugins must converge to the SAME final view-state — generation 7.
    // The exact notification count depends on async timing of attachBridge's
    // readReadiness/readCurrentProfile, which is not the property under test.
    assert.ok(plugin123.length >= 2, `plugin 123 received ${plugin123.length} notifications`);
    assert.equal(plugin123.length, plugin450.length,
        'both plugins must receive the same number of notifications');
    assert.equal(plugin123[plugin123.length - 1].profileGeneration, 7);
    assert.equal(plugin450[plugin450.length - 1].profileGeneration, 7);

    // Critical: only ONE upstream subscription per raw-bridge channel,
    // regardless of how many plugin consumers we register. The
    // SharedBridgeAdapter from 07.T1 already enforces this — 08.T2 inherits
    // that guarantee.
    assert.equal(rec.upstream.profileCalls, 1);
    assert.equal(rec.upstream.statusCalls, 1);
    assert.equal(rec.upstream.observabilityCalls, 1,
        'raw bridge observability channel must be subscribed exactly once');
    assert.equal(adapter.getUpstreamSubscriptionCount(), 1);
});

test('late subscribers receive the current view-state with computed staleness', () => {
    const adapter = new SharedBridgeAdapter();
    const rec = makeRecordingBridge();
    adapter.attachBridge(rec.bridge);
    const coord = new IntegratedStateCoordinator(adapter, { clockProvider: () => 1 });

    rec.emitProfile({
        generation: 12,
        pointerAnchor: null,
        capabilities: [],
        payload: {}
    });
    coord.advanceWorldClock(5);

    let seen = null;
    coord.onViewState(v => { seen = v; });
    assert.ok(seen);
    assert.equal(seen.profileGeneration, 12);
    assert.equal(seen.worldClockGeneration, 5);

    // The renderer reports it is currently DISPLAYING generation 10 / wc 3.
    // The coordinator never mutates these — the renderer just computes a
    // StalenessMeta from the immutable view.
    const staleness = computeStaleness(seen, 10, 3);
    assert.equal(staleness.displayedProfileGeneration, 10);
    assert.equal(staleness.authoritativeProfileGeneration, 12);
    assert.equal(staleness.profileBehindBy, 2);
    assert.equal(staleness.worldClockBehindBy, 2);
    assert.equal(staleness.isFresh, false);

    const freshStaleness = computeStaleness(seen, 12, 5);
    assert.equal(freshStaleness.isFresh, true);
});

test('disconnect-reconnect drives view state through degraded without stale profile', () => {
    const adapter = new SharedBridgeAdapter();
    const rec = makeRecordingBridge();
    adapter.attachBridge(rec.bridge);
    const coord = new IntegratedStateCoordinator(adapter, { clockProvider: () => 1 });

    // Initial happy state: connected, profile = 9.
    rec.emitStatus({ connected: true, mode: 'full', reason: 'connected' });
    rec.emitProfile({ generation: 9, pointerAnchor: null, capabilities: [], payload: {} });
    coord.advanceWorldClock(3);
    let v = coord.currentView();
    assert.equal(v.profileGeneration, 9);
    assert.equal(v.worldClockGeneration, 3);
    assert.equal(v.connection.mode, 'full');

    // Disconnect — both authoritative generations MUST be cleared so the
    // renderer cannot keep claiming "we are at generation 9" indefinitely.
    rec.emitStatus({ connected: false, mode: 'detached', reason: 'network drop' });
    v = coord.currentView();
    assert.equal(v.connection.mode, 'detached');
    assert.equal(v.profileGeneration, null,
        'profile generation must clear on disconnect — no stale claims');
    assert.equal(v.worldClockGeneration, null,
        'world-clock generation must clear on disconnect — no stale ticks');

    // Reconnect with a NEW generation simulates resync.
    rec.emitStatus({ connected: true, mode: 'full', reason: 'reconnected' });
    rec.emitProfile({ generation: 12, pointerAnchor: null, capabilities: [], payload: {} });
    coord.advanceWorldClock(4);
    v = coord.currentView();
    assert.equal(v.profileGeneration, 12, 'new generation after resync');
    assert.equal(v.worldClockGeneration, 4);
});

test('publish enforces the declared observability kind set', () => {
    const adapter = new SharedBridgeAdapter();
    const rec = makeRecordingBridge();
    adapter.attachBridge(rec.bridge);
    const coord = new IntegratedStateCoordinator(adapter, { clockProvider: () => 1 });

    const events = [];
    coord.onIntegratedEvent(ev => events.push(ev));

    coord.publish({
        kind: 'integrated.activation',
        pluginId: 'plugin-integrated-1-2-3',
        emittedAt: 1,
        profileGeneration: null,
        worldClockGeneration: null,
        payload: { ok: true }
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].kind, 'integrated.activation');

    assert.throws(
        () =>
            coord.publish({
                kind: 'integrated.fabricated-kind',
                pluginId: 'plugin-integrated-1-2-3',
                emittedAt: 1,
                profileGeneration: null,
                worldClockGeneration: null,
                payload: {}
            }),
        /cannot publish undeclared kind/
    );

    // All six declared kinds publish without throwing.
    for (const kind of INTEGRATED_OBSERVABILITY_KINDS) {
        coord.publish({
            kind,
            pluginId: 'plugin-integrated-4-5-0',
            emittedAt: 1,
            profileGeneration: null,
            worldClockGeneration: null,
            payload: {}
        });
    }
    assert.equal(events.length, 1 + INTEGRATED_OBSERVABILITY_KINDS.length);
});

test('view-state snapshots are frozen and renderer cannot mutate authoritative fields', () => {
    const adapter = new SharedBridgeAdapter();
    const rec = makeRecordingBridge();
    adapter.attachBridge(rec.bridge);
    const coord = new IntegratedStateCoordinator(adapter, { clockProvider: () => 1 });
    rec.emitProfile({ generation: 1, pointerAnchor: null, capabilities: [], payload: {} });

    const v = coord.currentView();
    assert.equal(Object.isFrozen(v), true);
    // Attempting to mutate must throw in strict mode (node:test runs in
    // module strict mode by default).
    assert.throws(() => {
        v.profileGeneration = 999;
    });
    // The pending view is also frozen — never accidentally a mutable
    // singleton.
    assert.equal(Object.isFrozen(PENDING_INTEGRATED_VIEW_STATE), true);
});

test('readiness snapshot maps state-specific blocks to the right track', () => {
    const adapter = new SharedBridgeAdapter();
    const rec = makeRecordingBridge();
    adapter.attachBridge(rec.bridge);
    const coord = new IntegratedStateCoordinator(adapter, { clockProvider: () => 1 });

    // Drive a readiness snapshot through the bridge — we mimic the bridge
    // calling its onReadiness handler directly. The SharedBridgeAdapter calls
    // readReadiness() during attach; we want to drive a SPECIFIC state.
    // The simplest route: call adapter's private handler via injecting a
    // readiness through the bridge stub's readReadiness — but easier is to
    // construct a fresh adapter+coordinator with a stub that hands back
    // s2_graph_blocked and a connected status, then check the mapping.
    const adapter2 = new SharedBridgeAdapter();
    const rec2 = {
        readCurrentProfile: async () => null,
        readPointerAnchor: async () => null,
        readReadiness: async () => ({
            fetchedAt: 1,
            state: 's2_graph_blocked',
            reason: 'no S2 yet',
            profileGeneration: null,
            bridgeReachable: true,
            blockerIds: ['IOD-07']
        }),
        subscribeObservability: () => ({ dispose: () => {} }),
        invokeGatewayRpc: async () => null,
        depositKernelObservation: async () => {},
        requestReviewEvidence: async () => null,
        onMathemeHarmonicProfile: () => ({ dispose: () => {} }),
        onConnectionStatusChange: () => ({ dispose: () => {} }),
        onObservabilityEvent: () => ({ dispose: () => {} })
    };
    adapter2.attachBridge(rec2);
    const coord2 = new IntegratedStateCoordinator(adapter2, { clockProvider: () => 1 });

    return new Promise(resolve => setImmediate(() => {
        const v = coord2.currentView();
        assert.equal(v.bridgeReadiness.state, 's2_graph_blocked');
        assert.equal(v.s2GraphReadiness, 'blocked');
        // S3 and S5 should not be blocked just because S2 is.
        assert.notEqual(v.s3StreamReadiness, 'blocked');
        assert.notEqual(v.s5ReviewReadiness, 'blocked');
        resolve();
    }));
});
