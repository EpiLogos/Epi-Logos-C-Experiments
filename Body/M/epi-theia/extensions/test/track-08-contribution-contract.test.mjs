import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const runtime = require('../m-extension-runtime/lib/common/index.js');

const extensionModules = [
    require('../m0-anuttara/lib/common/index.js'),
    require('../m1-paramasiva/lib/common/index.js'),
    require('../m2-parashakti/lib/common/index.js'),
    require('../m3-mahamaya/lib/common/index.js'),
    require('../m4-nara/lib/common/index.js'),
    require('../m5-epii/lib/common/index.js')
];

const expectedRouteChain = [
    'm0.coordinate-to-m1.walk',
    'm1.walk-to-m2.meaning-packet',
    'm2.det-evidence-to-m3.codon-projection',
    'm3.scalar-oracle-to-m4.artifact-inspector',
    'm4.reviewed-insight-to-m5.review-item'
];

const requiredEventFields = [
    'sourceExtension',
    'coordinateContext',
    'profileGeneration',
    'privacyClass',
    'evidenceHandles',
    'provenanceHandles'
];

test('Track 08 imports public contribution contracts from package roots only', () => {
    for (const mod of extensionModules) {
        const contribution = mod.TRACK_08_CONTRIBUTION;
        assert.equal(contribution.extensionId, mod.EXTENSION_ID);
        assert.deepEqual(contribution.track08Exports, mod.TRACK_08_EXPORTS);
        assert.ok(contribution.compactViews.length >= 1);
        assert.ok(contribution.selectionHandlers.length >= 1);
        assert.ok(contribution.currentStateSelectors.length >= 2);
        assert.ok(contribution.evidenceSerializers.length >= 1);
        assert.ok(contribution.miniModes.length >= 1);
        assert.equal(
            contribution.compositionBoundary.bridgeAdapterSymbol,
            'SHARED_BRIDGE_ADAPTER'
        );
        assert.ok(
            contribution.compositionBoundary.track08Owns.includes(
                'multi-extension choreography'
            )
        );
        assert.ok(
            contribution.compositionBoundary.track07Owns.includes(
                'bridge-mediated current-state selectors'
            )
        );
        assert.ok(
            contribution.compositionBoundary.forbiddenImports.some(fragment =>
                fragment.startsWith('Body/S/S')
            )
        );
    }
});

test('cross-extension route contracts encode the M0 to M5 handoff chain', () => {
    assert.deepEqual(
        runtime.CROSS_EXTENSION_ROUTE_CONTRACTS.map(contract => contract.id),
        expectedRouteChain
    );

    const exportedRoutes = extensionModules.flatMap(mod =>
        mod.TRACK_08_CONTRIBUTION.routeContracts.map(contract => contract.id)
    );
    assert.deepEqual(exportedRoutes, expectedRouteChain);

    const [first, second, third, fourth, fifth] = runtime.CROSS_EXTENSION_ROUTE_CONTRACTS;
    assert.equal(first.fromExtensionId, 'm0-anuttara');
    assert.equal(first.toExtensionId, 'm1-paramasiva');
    assert.equal(second.inputKind, 'm1.lens-mode.walk');
    assert.equal(third.outputKind, 'm3.codon-projection.request');
    assert.equal(fourth.outputKind, 'm4.protected-artifact.inspect');
    assert.equal(fifth.outputKind, 'm5.review-item.request');
});

test('observability contracts require coordinate, profile, privacy, evidence, and provenance fields', () => {
    for (const mod of extensionModules) {
        const contribution = mod.TRACK_08_CONTRIBUTION;
        assert.deepEqual(
            contribution.observabilityEvents.map(event => event.type),
            [...mod.OBSERVABILITY_EVENT_TYPES]
        );

        for (const eventContract of contribution.observabilityEvents) {
            assert.deepEqual(eventContract.requiredFields, requiredEventFields);
            assert.equal(eventContract.sourceExtensionId, mod.EXTENSION_ID);
            assert.equal(eventContract.evidenceHandleRequired, true);
            assert.equal(eventContract.provenanceHandleRequired, true);

            const event = {
                type: eventContract.type,
                extensionId: mod.EXTENSION_ID,
                emittedAt: 1,
                payload: {
                    sourceExtension: mod.EXTENSION_ID,
                    coordinateContext: { selectedCoordinate: 'M2' },
                    profileGeneration: 7,
                    privacyClass: eventContract.privacyClass,
                    evidenceHandles: ['evidence:test'],
                    provenanceHandles: ['provenance:test']
                }
            };
            assert.doesNotThrow(() =>
                runtime.validateContributionEvent(contribution, event)
            );

            const missingField = {
                ...event,
                payload: { ...event.payload }
            };
            delete missingField.payload.provenanceHandles;
            assert.throws(
                () => runtime.validateContributionEvent(contribution, missingField),
                /missing required payload field provenanceHandles/
            );
        }
    }
});

test('stand-alone and composition runtimes read the same SharedBridgeAdapter instance', async () => {
    const adapter = new runtime.SharedBridgeAdapter();
    const recording = makeRecordingBridge();
    const runtimes = extensionModules.map(mod =>
        runtime.createMExtensionContributionRuntime(mod.TRACK_08_CONTRIBUTION, adapter)
    );

    adapter.attachBridge(recording.bridge);
    await new Promise(resolve => setImmediate(resolve));

    const profile = {
        generation: 77,
        pointerAnchor: 'pointer://track-08/shared',
        capabilities: ['readCurrentProfile', 'readReadiness'],
        payload: {}
    };
    recording.emitProfile(profile);
    adapter.updateCoordinateContext({
        selectedCoordinate: 'M2',
        hashInput: '#2',
        canonicalMCoordinate: 'M2',
        profileGeneration: 77,
        pointerAnchor: 'pointer://track-08/shared',
        dayNowSessionHandle: 'day:20260601/session:test',
        privacyClass: 'public_current_with_graph_provenance',
        provenance: {
            source: 'track-08-contract-test',
            generation: 77,
            notes: ['shared adapter fan-out']
        }
    });

    for (const contributionRuntime of runtimes) {
        assert.equal(contributionRuntime.bridge, adapter);
        const snapshot = contributionRuntime.snapshot();
        assert.equal(snapshot.profile.generation, 77);
        assert.equal(snapshot.coordinateContext.canonicalMCoordinate, 'M2');
        assert.equal(snapshot.coordinateContext.pointerAnchor, 'pointer://track-08/shared');
        assert.equal(snapshot.readiness.state, 'degraded_but_readable');
    }
    assert.equal(recording.calls.onMathemeHarmonicProfile, 1);
    assert.equal(recording.calls.onConnectionStatusChange, 1);
    assert.equal(recording.calls.onObservabilityEvent, 1);
});

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
        readPointerAnchor: async () => 'pointer://track-08/shared',
        readReadiness: async () => {
            calls.readReadiness += 1;
            return {
                fetchedAt: 1,
                state: 'degraded_but_readable',
                reason: 'test readiness',
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
        }
    };
}
