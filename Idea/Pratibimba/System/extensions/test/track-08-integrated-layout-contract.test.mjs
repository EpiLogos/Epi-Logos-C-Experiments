import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const runtime = require('../m-extension-runtime/lib/common/index.js');
const composition = require('../integrated-composition/lib/common/index.js');
const oneTwoThree = require('../plugin-integrated-1-2-3/lib/common/index.js');
const fourFiveZero = require('../plugin-integrated-4-5-0/lib/common/index.js');

test('Track 08 integrated packages expose command and named-layout contracts from package roots', () => {
  assert.deepEqual(composition.ALL_INTEGRATED_COMMANDS, [
    'epi.integrated.openCosmicEngine',
    'epi.integrated.openJivaSiva',
    'epi.integrated.toggleMiniInspectors',
    'epi.integrated.openEvidencePanel',
    'epi.integrated.copyEvidenceHandle'
  ]);

  assert.equal(oneTwoThree.PLUGIN_ID, 'plugin-integrated-1-2-3');
  assert.equal(oneTwoThree.NAMED_LAYOUT_ID, 'cosmic-engine.integrated');
  assert.equal(oneTwoThree.PRIMARY_COMMAND_ID, composition.COMMAND_OPEN_COSMIC_ENGINE);
  assert.deepEqual(oneTwoThree.CONTRIBUTOR_IDS, [
    'm1-paramasiva',
    'm2-parashakti',
    'm3-mahamaya'
  ]);

  assert.equal(fourFiveZero.PLUGIN_ID, 'plugin-integrated-4-5-0');
  assert.equal(fourFiveZero.NAMED_LAYOUT_ID, 'jiva-siva.integrated');
  assert.equal(fourFiveZero.PRIMARY_COMMAND_ID, composition.COMMAND_OPEN_JIVA_SIVA);
  assert.deepEqual(fourFiveZero.CONTRIBUTOR_IDS, [
    'm4-nara',
    'm5-epii',
    'm0-anuttara'
  ]);
});

test('layout arbitration grants named owners and routes overlap to mini-mode without silent winners', () => {
  const coordinator = new composition.CompositionCoordinator(
    composition.findNamedLayout('plugin-integrated-1-2-3')
  );
  const records = [
    contributor('m1-paramasiva', 'center-stage', 10, 'lens-walk'),
    contributor('m2-parashakti', 'center-stage', 9, 'meaning-packet'),
    contributor('m3-mahamaya', 'side-panel', 8, 'codon-provenance')
  ];

  const resolved = coordinator.resolveClaims(records);
  assert.equal(
    resolutionFor(resolved, 'm1-paramasiva', 'center-stage').resolution,
    'granted'
  );
  const m2Center = resolutionFor(resolved, 'm2-parashakti', 'center-stage');
  assert.equal(m2Center.resolution, 'mini-mode');
  assert.equal(m2Center.grantedMiniMode.id, 'meaning-packet');
  assert.match(m2Center.conflictReason, /center-stage owned by m1-paramasiva/);
  assert.equal(
    resolutionFor(resolved, 'm3-mahamaya', 'side-panel').resolution,
    'granted'
  );
});

test('layout arbitration blocks equal-priority singleton conflicts instead of inventing authority', () => {
  const layout = {
    ...composition.findNamedLayout('plugin-integrated-1-2-3'),
    centerStageOwner: 'm0-anuttara'
  };
  const coordinator = new composition.CompositionCoordinator(layout);
  const records = [
    contributor('m1-paramasiva', 'center-stage', 10, 'lens-walk'),
    contributor('m2-parashakti', 'center-stage', 10, 'meaning-packet')
  ];

  const blocked = resolutionFor(
    coordinator.resolveClaims(records),
    'm1-paramasiva',
    'center-stage'
  );
  assert.equal(blocked.resolution, 'blocked-conflict');
  assert.match(blocked.conflictReason, /equal-priority claims/);
});

test('empty states name upstream owners and missing contributors without demo payloads', () => {
  const layout = composition.findNamedLayout('plugin-integrated-4-5-0');
  const coordinator = new composition.CompositionCoordinator(layout);
  const records = [
    contributor('m4-nara', 'center-stage', 10, 'field-summary', {
      state: 'privacy_blocked',
      reason: 'protected-local consent is absent'
    }),
    contributor('m5-epii', 'evidence-panel', 8, 'review-queue', {
      state: 's5_review_blocked',
      reason: 'S5 review DTO unavailable'
    })
  ];
  const view = composition.buildEmptyState(
    layout,
    coordinator.aggregateReadiness(records),
    fourFiveZero.CONTRIBUTOR_IDS,
    records.map(record => record.extensionId)
  );

  assert.equal(view.pluginId, 'plugin-integrated-4-5-0');
  assert.equal(view.overall, 'privacy_blocked');
  assert.deepEqual(view.missingContributors, ['m0-anuttara']);
  assert.ok(view.reasons.some(reason => reason.ownerTrack === 'Track 04 consent'));
  assert.ok(
    view.reasons.some(reason => reason.blockerId === 'track-07.contribution-missing')
  );
  assert.equal(JSON.stringify(view).includes('demo'), false);
  assert.equal(JSON.stringify(view).includes('placeholder'), false);
});

test('bridge gate installs only after the shared kernel bridge reports attached status', async () => {
  const adapter = new runtime.SharedBridgeAdapter();
  const gate = new composition.IntegratedBridgeGate(adapter);
  const states = [];
  gate.onChange(attached => states.push(attached));

  const recording = recordingBridge();
  adapter.attachBridge(recording.bridge);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(gate.isAttached(), false);

  recording.emitStatus({ connected: true, mode: 'full', reason: 'native-websocket' });
  assert.equal(gate.isAttached(), true);
  recording.emitStatus({ connected: false, mode: 'detached', reason: 'connection-lost' });
  assert.equal(gate.isAttached(), false);
  assert.deepEqual(states, [false, true, false]);
  gate.dispose();
});

function contributor(extensionId, slot, priority, miniModeId, readiness = null) {
  const contribution = {
    extensionId,
    compactViews: [],
    selectionHandlers: [],
    currentStateSelectors: [],
    evidenceSerializers: [],
    miniModes: [{ id: miniModeId, label: miniModeId }],
    routeContracts: [],
    observabilityEvents: [],
    compositionBoundary: {
      bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER',
      track08Owns: [],
      track07Owns: [],
      forbiddenImports: []
    },
    track08Exports: []
  };
  return {
    extensionId,
    contribution,
    readiness: readiness ?? {
      state: 'ready_public_current',
      reason: 'ready'
    },
    claims: [{
      extensionId,
      slot,
      priority,
      miniModeFallback: contribution.miniModes[0],
      privacyClass: 'public_current_with_graph_provenance',
      reason: `${extensionId} claims ${slot}`
    }]
  };
}

function resolutionFor(resolved, extensionId, slot) {
  return resolved.find(
    item => item.claim.extensionId === extensionId && item.claim.slot === slot
  );
}

function recordingBridge() {
  const statusListeners = new Set();
  const bridge = {
    readCurrentProfile: async () => null,
    readPointerAnchor: async () => null,
    readReadiness: async () => ({
      fetchedAt: 1,
      state: 'bridge_unavailable',
      reason: 'not attached',
      profileGeneration: null,
      bridgeReachable: false,
      blockerIds: ['track-01.kernel-bridge']
    }),
    subscribeObservability: () => ({ dispose() {} }),
    invokeGatewayRpc: async () => null,
    depositKernelObservation: async () => {},
    requestReviewEvidence: async () => null,
    onMathemeHarmonicProfile: () => ({ dispose() {} }),
    onConnectionStatusChange: listener => {
      statusListeners.add(listener);
      return { dispose: () => statusListeners.delete(listener) };
    },
    onObservabilityEvent: () => ({ dispose() {} })
  };
  return {
    bridge,
    emitStatus(status) {
      for (const listener of statusListeners) {
        listener(status);
      }
    }
  };
}
