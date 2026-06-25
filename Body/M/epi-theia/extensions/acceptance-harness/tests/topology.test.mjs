// Track 05 T9 — topology / service-list contract.
//
// Verifies the acceptance plan names the same services the runtime baseline
// JSON (Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json) listed
// as required for the IDE shell — gateway, SpaceTimeDB, Neo4j, Redis, S5
// persisted stores. The Theia process (Electron canonical + browser-mode
// for CI parity) is named explicitly.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    TRACK_05_T9_ACCEPTANCE_PLAN,
    requiredServiceIds,
    stepLayoutsAreCanonical,
    ACCEPTANCE_WIDGET_IDS,
    ACCEPTANCE_HANDLE_PREFIX,
    EXTENSION_ID
} = require('../lib/common/index.js');

// Tranche 29.10 — composition-state identity across both toggle classes.
// Imported from the integrated-composition build (15.7 composition-extension);
// the relative path avoids a workspace-dependency / project-reference edge.
const {
    BIMBA_PRATIBIMBA_UI_STATE_SPINE_FIELDS,
    COMPOSITION_STATE_FIELDS,
    COMPOSITION_TOGGLE_CLASSES,
    preserveCompositionStateAcrossToggle
} = require('../../integrated-composition/lib/common/workspace-persistence.js');
const {
    SharedBridgeAdapter
} = require('../../m-extension-runtime/lib/common/shared-bridge.js');
const {
    M1_DEEP_WIDGET_UI_STATE_FIELDS,
    M1_DEEP_WIDGET_TOGGLE_CLASSES,
    createM1DeepWidgetUiStateBridge,
    createM1StableMockProfile,
    m1PlayedTorusOrientationWithinTolerance
} = require('../../m1-paramasiva/lib/common/deep-widget-ui-state.js');

const {
    OMNIPANEL_WIDGET_ID,
    OMNIPANEL_TABS
} = require('../../omnipanel-shell/lib/common/omnipanel-types.js');
const {
    collapseOmniPanelManifest,
    createOmniPanelState,
    activateOmniPanelTab
} = require('../../omnipanel-shell/lib/common/omnipanel-runtime.js');
const {
    createOmniPanelDefaultState,
    normalizeOmniPanelSessionState
} = require('../../omnipanel-shell/lib/common/omnipanel-session-state.js');
const {
    intentTargetCommandId
} = require('../../pratibimba-layouts/lib/common/cross-layout-intent.js');
const {
    expectedActivityBarModes
} = require('../../pratibimba-layouts/lib/common/activity-bar-modes.js');
const {
    BRIDGE_READINESS_IDS
} = require('../../m-extension-runtime/lib/common/bridge-readiness.js');
const {
    REQUIRED_MEDIATED_EVIDENCE_FIELDS,
    buildMediatedRunEvidencePacket,
    enforceHumanGate
} = require('../../agentic-control-room/lib/common/run-model.js');
const {
    M2_BIMBA_PRATIBIMBA_STATE_FIELDS,
    M2_SIDE_STATE_FIELDS,
    M2_TOGGLE_CLASSES,
    M2_EMPTY_STATE,
    createM2BimbaPratibimbaSelector,
    createM2StableMockProfile
} = require('../../m2-parashakti/lib/browser/state/M2BimbaPratibimbaSelector.js');

test('every step targets one of the two canonical layouts (or any)', () => {
    assert.equal(stepLayoutsAreCanonical(TRACK_05_T9_ACCEPTANCE_PLAN), true);
});

test('plan names the required services from the runtime baseline', () => {
    const required = requiredServiceIds(TRACK_05_T9_ACCEPTANCE_PLAN);
    for (const id of ['gateway', 'spacetimedb', 'neo4j', 'redis', 's5_persisted_stores', 'theia_electron']) {
        assert.ok(
            required.includes(id),
            `expected required service "${id}" — Track 05 T0 runtime baseline`
        );
    }
});

test('browser-mode Theia is listed but NOT alwaysRequired (Electron is canonical)', () => {
    const browser = TRACK_05_T9_ACCEPTANCE_PLAN.services.find(s => s.id === 'theia_browser');
    assert.ok(browser !== undefined, 'theia_browser must be listed for CI/Docker parity');
    assert.equal(browser.alwaysRequired, false);
    const electron = TRACK_05_T9_ACCEPTANCE_PLAN.services.find(s => s.id === 'theia_electron');
    assert.ok(electron !== undefined);
    assert.equal(electron.alwaysRequired, true);
});

test('step ids cover the eight T9-mandated verification operations', () => {
    const stepIds = TRACK_05_T9_ACCEPTANCE_PLAN.steps.map(s => s.id);
    for (const required of [
        'boot.kernel-bridge',
        'layout.switch-to-deep-ide',
        'graph.open-s2-node',
        'review.open-s5-candidate',
        'evidence.deposit',
        'layout.switch-back-to-daily',
        'shutdown.clean'
    ]) {
        assert.ok(stepIds.includes(required), `expected step "${required}"`);
    }
});

test('layout switch round-trip produces a stable bridge subscription handle', () => {
    const switchToDeep = TRACK_05_T9_ACCEPTANCE_PLAN.steps.find(
        s => s.id === 'layout.switch-to-deep-ide'
    );
    const switchBack = TRACK_05_T9_ACCEPTANCE_PLAN.steps.find(
        s => s.id === 'layout.switch-back-to-daily'
    );
    assert.ok(switchToDeep !== undefined && switchBack !== undefined);
    assert.ok(
        switchToDeep.produces.includes('bridge-subscription-id:UNCHANGED'),
        'switch-to-deep must assert bridge subscription unchanged'
    );
    assert.ok(
        switchBack.produces.includes('bridge-subscription-id:STILL-UNCHANGED'),
        'switch-back must assert bridge subscription still unchanged'
    );
});

test('privacy audit walks every UI surface the IDE shell renders', () => {
    const surfaces = TRACK_05_T9_ACCEPTANCE_PLAN.privacyAuditSurfaces.join(' ');
    // Match by chrome widget name patterns from ide-shell-m0-m5.
    for (const fragment of [
        'Bimba graph viewer',
        'Canon Studio',
        'Agentic Control Room',
        'Coordinate Tree',
        'Logos Atelier',
        'Evidence Pane',
        'Review Pane',
        'Autoresearch Pane',
        'SpaceTimeDB',
        'Graph payloads',
        'S5 evidence'
    ]) {
        assert.ok(
            surfaces.includes(fragment),
            `privacy audit must cover "${fragment}"`
        );
    }
});

test('extension id + widget ids align with the pratibimba.acceptance.* namespace', () => {
    assert.equal(EXTENSION_ID, 'acceptance-harness');
    for (const id of Object.values(ACCEPTANCE_WIDGET_IDS)) {
        assert.ok(id.startsWith('pratibimba.acceptance.'));
    }
});

test('acceptance handle prefix matches the documented stdout pattern', () => {
    // The Node-driven script greps stdout for the prefix; ensure it's the
    // canonical token.
    assert.equal(ACCEPTANCE_HANDLE_PREFIX, '[ACCEPTANCE:');
});

test('composition-state-identity: every named field survives both toggle classes', () => {
    // 15.7 composition-extension: a layout/face toggle is an intra-process view
    // change — it must never mutate the persisted composition state. Assert
    // field-level identity for both canonical toggle classes (15.5 + 15.7).
    assert.deepEqual(
        [...COMPOSITION_STATE_FIELDS],
        [
            'compositionId',
            'pinnedMatrixFamily',
            'pinnedTorusView',
            'cosmicSelectedCoordinate',
            'cosmicKleinToPersonalHinge',
            'pinnedRecognitionSlot',
            'personalSelectedDayId',
            'personalReviewQueueFilter',
            'personalKleinToCosmicHinge'
        ],
        'composition persisted-state fields must match the current codec contract'
    );
    assert.deepEqual(
        [...COMPOSITION_TOGGLE_CLASSES],
        ['layout:daily-0-1<->ide-deep', 'face:cosmic<->personal-0/1'],
        'both toggle classes (daily-0-1<->ide-deep, cosmic<->personal 0/1) covered'
    );

    const fixtures = [
        {
            compositionId: 'cosmic-engine.integrated',
            pinnedMatrixFamily: 2,
            pinnedTorusView: 'tick-choreography',
            cosmicSelectedCoordinate: 'M2.5',
            cosmicKleinToPersonalHinge: true,
            pinnedRecognitionSlot: '5',
            personalSelectedDayId: '2026-06-11',
            personalReviewQueueFilter: 'unread',
            personalKleinToCosmicHinge: false
        },
        {
            compositionId: 'jiva-siva.integrated',
            pinnedMatrixFamily: null,
            pinnedTorusView: 'k2-surface',
            cosmicSelectedCoordinate: null,
            cosmicKleinToPersonalHinge: false,
            pinnedRecognitionSlot: null,
            personalSelectedDayId: null,
            personalReviewQueueFilter: 'all',
            personalKleinToCosmicHinge: true
        }
    ];

    for (const state of fixtures) {
        for (const toggle of COMPOSITION_TOGGLE_CLASSES) {
            const after = preserveCompositionStateAcrossToggle(state, toggle);
            for (const field of COMPOSITION_STATE_FIELDS) {
                assert.deepEqual(
                    after[field],
                    state[field],
                    `field "${field}" must survive toggle "${toggle}" for ${state.compositionId}`
                );
            }
        }
    }
});

test('m1-deep-widget-walk-navigator-survives-toggle', () => {
    const harness = createM1DeepWidgetHarness();
    const before = harness.writeWidgetState('walkNavigator', {
        tick: 7,
        paused: true
    });
    const after = harness.toggleAndReadWidgetState('walkNavigator');

    assertM1DeepWidgetUiStateSubrecord(before.uiState);
    assert.deepEqual(after.widgetState, { tick: 7, paused: true });
    assert.deepEqual(after.uiState, before.uiState);
});

test('m1-deep-widget-cl42-inspector-survives-toggle', () => {
    const harness = createM1DeepWidgetHarness();
    const before = harness.writeWidgetState('cl42Inspector', {
        activePosition: 3,
        devModeEnabled: true
    });
    const after = harness.toggleAndReadWidgetState('cl42Inspector');

    assertM1DeepWidgetUiStateSubrecord(before.uiState);
    assert.deepEqual(after.widgetState, { activePosition: 3, devModeEnabled: true });
    assert.deepEqual(after.uiState, before.uiState);
});

test('m1-deep-widget-klein-event-strip-survives-toggle', () => {
    const harness = createM1DeepWidgetHarness();
    const before = harness.writeWidgetState('kleinEventStrip', {
        scrollPosition: 144,
        filterKind: 'M1TritoneCrossing'
    });
    const after = harness.toggleAndReadWidgetState('kleinEventStrip');

    assertM1DeepWidgetUiStateSubrecord(before.uiState);
    assert.deepEqual(after.widgetState, {
        scrollPosition: 144,
        filterKind: 'M1TritoneCrossing'
    });
    assert.deepEqual(after.uiState, before.uiState);
});

test('m1-deep-widget-vortex-browser-survives-toggle', () => {
    const harness = createM1DeepWidgetHarness();
    const before = harness.writeWidgetState('vortexBrowser', {
        pinnedFamily: 'Pratibimba',
        faceMode: 'raw'
    });
    const after = harness.toggleAndReadWidgetState('vortexBrowser');

    assertM1DeepWidgetUiStateSubrecord(before.uiState);
    assert.deepEqual(after.widgetState, {
        pinnedFamily: 'Pratibimba',
        faceMode: 'raw'
    });
    assert.deepEqual(after.uiState, before.uiState);
});

test('m1-deep-widget-audio-bus-inspector-survives-toggle', () => {
    const harness = createM1DeepWidgetHarness();
    const before = harness.writeWidgetState('audioBusInspector', {
        subsection: 'audio_octet[8]',
        sort: 'hz-desc'
    });
    const after = harness.toggleAndReadWidgetState('audioBusInspector');

    assertM1DeepWidgetUiStateSubrecord(before.uiState);
    assert.deepEqual(after.widgetState, {
        subsection: 'audio_octet[8]',
        sort: 'hz-desc'
    });
    assert.deepEqual(after.uiState, before.uiState);
});

test('m1-played-torus-orientation-survives-toggle', () => {
    const harness = createM1DeepWidgetHarness();
    const expected = {
        tick12: 3.5,
        orientationQuaternion: [
            0.9238795325112867,
            0,
            0.3826834323650898,
            0
        ],
        slerpT: 0.5
    };
    const before = harness.writeWidgetState('playedTorusOrientation', expected);
    const after = harness.toggleAndReadWidgetState('playedTorusOrientation');

    assertM1DeepWidgetUiStateSubrecord(before.uiState);
    assert.equal(after.widgetState.tick12, 3.5);
    assert.equal(after.widgetState.slerpT, 0.5);
    assert.ok(
        m1PlayedTorusOrientationWithinTolerance(
            after.widgetState.orientationQuaternion,
            expected.orientationQuaternion,
            1e-12
        ),
        'K2 orientation quaternion survives toggle within fp tolerance'
    );
    assert.deepEqual(after.uiState, before.uiState);
});

test('omnipanel-tab-traversal: end-to-end click-through and state identity contract', () => {
    const harness = createOmniPanelTraversalHarness();
    const required = requiredServiceIds(TRACK_05_T9_ACCEPTANCE_PLAN);

    assert.deepEqual(
        harness.bootRealStack(required),
        ['gateway', 'spacetimedb', 'neo4j', 'redis', 's5_persisted_stores'],
        'boot real stack contract must cover gateway, SpaceTimeDB, Neo4j, Redis, and S5'
    );

    for (const layout of ['daily-0-1', 'ide-deep']) {
        assert.equal(harness.isOmniPanelMounted(layout), true, `OmniPanel mounted in ${layout}`);
        assert.equal(harness.visibleTabs(layout).length, 8, `${layout} exposes exactly 8 tabs`);
        assert.deepEqual(
            harness.visibleTabs(layout).map(tab => tab.id),
            OMNIPANEL_TABS.map(tab => tab.id),
            `${layout} visible tabs follow OMNIPANEL_TABS order`
        );
    }

    const dispatchRender = harness.sendPiChatCommand('/dispatch nous');
    assert.deepEqual(harness.runtimeCalls, [
        { route: 'anima_self_invoke', payload: { target: 'nous' } }
    ]);
    assert.equal(harness.activeTab(), 'dispatch-trace');
    assert.ok(dispatchRender.visibleNodeIds.includes('node-nous-001'));

    const linkedTrace = harness.clickToolStreamEvent('evt-nous-001');
    assert.equal(harness.activeTab(), 'dispatch-trace');
    assert.equal(linkedTrace.highlightedNodeId, 'node-nous-001');

    const packet = buildOmniPanelEvidencePacket('pkt-XYZ');
    const evidenceView = harness.clickEvidencePacket(packet);
    assert.equal(harness.activeTab(), 'evidence');
    assert.equal(evidenceView.component, 'EvidencePacketView');
    assert.equal(evidenceView.privacyBadge.component, 'PrivacyClassBadge');
    assert.equal(evidenceView.privacyBadge.privacyClass, 'protected-local-synthetic-fixture');
    for (const field of REQUIRED_MEDIATED_EVIDENCE_FIELDS) {
        assert.notEqual(evidenceView.fields[field], undefined, `EvidencePacketView renders ${field}`);
    }

    const humanRequiredReview = {
        id: 'rev-human-gate-001',
        packetId: packet.candidateId,
        humanRequired: true,
        iod17Parity: { inParity: true }
    };
    const blockedApproval = harness.attemptApprove(humanRequiredReview, { actorIsHuman: false });
    assert.equal(blockedApproval.controls.approve.disabled, true);
    assert.match(blockedApproval.controls.approve.tooltip, /human-gate enforced/);
    assert.equal(harness.reviewRpcCalls.filter(call => call.method === "s5'.review.submit").length, 0);

    const parityViolationReview = {
        id: 'rev-iod17-001',
        packetId: packet.candidateId,
        humanRequired: false,
        iod17Parity: { inParity: false }
    };
    const parityView = harness.renderReviewItem(parityViolationReview);
    assert.equal(parityView.banner.text, 'IOD-17 parity violated');
    assert.equal(parityView.banner.tone, 'red');
    assert.deepEqual(
        Object.values(parityView.controls).map(control => control.disabled),
        [true, true, true, true],
        'IOD-17 parity disables every review action control'
    );

    const capabilityList = harness.renderCapabilityList();
    assert.equal(capabilityList.component, 'CapabilityListView');
    assert.equal(capabilityList.sourceRpc, "s4'.mediation.capabilities.list");
    assert.deepEqual(capabilityList.capabilities.map(capability => capability.name), [
        'anima_self_invoke',
        "s1.vault.read_file",
        "s5'.review.submit"
    ]);

    const intents = [
        buildCrossLayoutIntent('intent-1', 'daily-0-1', 'pi-chat'),
        buildCrossLayoutIntent('intent-2', 'ide-deep', 'dispatch-trace'),
        buildCrossLayoutIntent('intent-3', 'daily-0-1', 'evidence')
    ];
    for (const intent of intents) {
        harness.fireCrossLayoutIntent(intent);
    }
    assert.deepEqual(
        harness.renderCrossLayoutIntentLog().entries.map(entry => entry.id),
        ['intent-1', 'intent-2', 'intent-3'],
        'CrossLayoutIntentLog rolling buffer preserves insertion order'
    );

    harness.selectEvidencePacket('pkt-XYZ');
    const evidenceStateAfterToggle = harness.toggleLayout('ide-deep');
    assert.equal(evidenceStateAfterToggle.activeLayout, 'ide-deep');
    assert.equal(evidenceStateAfterToggle.omniPanel.activeTab, 'evidence');
    assert.equal(
        evidenceStateAfterToggle.omniPanel.perTabState.evidence.selectedPacketId,
        'pkt-XYZ'
    );

    const perTabFixtures = {
        'pi-chat': { scrollOffset: 11, draftCommand: '/dispatch nous' },
        sessions: { selectedSessionKey: 'agent:epii:main', dayNowAnchor: '2026-06-11' },
        'dispatch-trace': { selectedNodeId: 'node-nous-001', expandedNodeIds: ['node-nous-001'] },
        'tool-stream': {
            filters: { actor: 'nous' },
            selectedEventId: 'evt-nous-001',
            scrollOffset: 4,
            live: false
        },
        evidence: {
            filters: { miniGraphNodeId: 'node-nous-001' },
            selectedPacketId: 'pkt-XYZ',
            scrollOffset: 8,
            depositFormOpen: true
        },
        review: { selectedReviewId: 'rev-human-gate-001', decisionDraft: 'approve' },
        gateway: { activeSubView: 'capabilities', selectedCapabilityName: 'anima_self_invoke' },
        diagnostics: { activeSubSection: 'kernel-bridge', intentLogScrollOffset: 3 }
    };
    for (const [tabId, tabState] of Object.entries(perTabFixtures)) {
        harness.setTabState(tabId, tabState);
    }
    const allTabsAfterToggle = harness.toggleLayout('daily-0-1');
    assert.equal(allTabsAfterToggle.omniPanel.activeTab, 'evidence');
    assert.deepEqual(allTabsAfterToggle.omniPanel.perTabState, perTabFixtures);
});

test('OmniPanel intent promotes daily-0-1 to ide-deep with M3 codon preserved', () => {
    const harness = createOmniPanelTraversalHarness();
    const dailyIntent = buildM3CodonCrossLayoutIntent({
        id: 'intent-m3-daily-anchor',
        requestedLayout: 'daily-0-1',
        reason: 'anchor from daily surface before deep promotion'
    });
    const deepIntent = buildM3CodonCrossLayoutIntent({
        id: 'intent-m3-deep-codon',
        requestedLayout: 'ide-deep',
        reason: 'promote to M3 codon wheel'
    });

    const dailyRoute = harness.routeCrossLayoutIntent(dailyIntent);
    assert.equal(dailyRoute.activeLayout, 'daily-0-1');
    assert.equal(dailyRoute.session.selectedCoordinate, 'M3-1-0-13');
    assert.equal(dailyRoute.session.profileGeneration, 472);

    const deepRoute = harness.routeCrossLayoutIntent(deepIntent);
    assert.equal(deepRoute.activeLayout, 'ide-deep');
    assert.equal(deepRoute.targetCommandId, 'pratibimba.m3-mahamaya.codon.open');
    assert.deepEqual(deepRoute.consumedIntent, {
        requestedExtensionId: 'm3-mahamaya',
        requestedContributionId: 'codon',
        coordinate: 'M3-1-0-13',
        profileGeneration: 472
    });
    assert.deepEqual(
        harness.renderCrossLayoutIntentLog().entries.map(entry => entry.id),
        ['intent-m3-daily-anchor', 'intent-m3-deep-codon']
    );
});

test('M0 active-layer state survives daily-0-1 and ide-deep layout toggles', () => {
    const harness = createOmniPanelTraversalHarness();
    const dailyIntent = buildM0SurfaceCrossLayoutIntent({
        id: 'intent-m0-daily-relations',
        requestedLayout: 'daily-0-1'
    });
    const deepIntent = buildM0SurfaceCrossLayoutIntent({
        id: 'intent-m0-deep-relations',
        requestedLayout: 'ide-deep'
    });
    const returnIntent = buildM0SurfaceCrossLayoutIntent({
        id: 'intent-m0-return-relations',
        requestedLayout: 'daily-0-1'
    });

    for (const route of [
        harness.routeCrossLayoutIntent(dailyIntent),
        harness.routeCrossLayoutIntent(deepIntent),
        harness.routeCrossLayoutIntent(returnIntent)
    ]) {
        assert.equal(route.session.selectedCoordinate, 'M0-2-relations');
        assert.equal(route.session.lens, 'void-structure-ring');
        assert.equal(route.session.mode, 'authoring');
        assert.equal(route.session.profileGeneration, 472);
        assert.equal(route.session.sessionKey, 'agent:epii:m0');
        assert.equal(route.session.dayNow, '2026-06-17');
        assert.equal(route.session.m0_active_layer, 'relations');
        assert.equal(route.session.m0_implicate_explicate, 'explicate');
        assert.equal(route.session.m0_mode, 'authoring');
    }
});

test('ide-shell state-identity: active-coordinate preserved while toggling daily-0-1 <-> ide-deep', () => {
    const harness = createIdeShellStateIdentityHarness();
    const sampleCoordinate = 'M3-1-0-13';
    const canonUri = 'vault://Idea/Bimba/Seeds/M/M3/mahamaya-codon-13.md';
    const logosTerm = 'M3 codon 13';
    const evidenceRecordId = 'evidence://acceptance/M3-1-0-13/proof-001';
    const reviewItemId = 'review://acceptance/M3-1-0-13/item-001';
    const vakFields = {
        cpf: '(00/00)',
        ct: 'CT2',
        cp: '4.2',
        cf: '(0/1/2)',
        cfp: 'M3-1-0-13',
        cs: 'acceptance-state-identity'
    };
    const autoresearchFilter = {
        capacity: 's5.review.evidence-distillation',
        privacyClass: 'protected-local'
    };

    harness.openLayout('daily-0-1');
    harness.selectCoordinate(sampleCoordinate);
    harness.activateSession('acceptance-test-session-001', 42);
    harness.activateActivityBarMode('coordinate-tree');
    harness.openBimbaGraphViewerAndSelectCoordinate(sampleCoordinate);
    harness.openCanonStudioFile(canonUri);
    harness.setLogosTerm(logosTerm);
    harness.selectEvidenceRecord(evidenceRecordId);
    harness.selectReviewItem(reviewItemId);
    harness.populateAcrVakFields(vakFields);
    harness.setAutoresearchCapacityFilter(autoresearchFilter);

    const beforeToggle = harness.identitySnapshot();
    const deepToggle = harness.toggleLayout('ide-deep');
    const backToDaily = harness.toggleLayout('daily-0-1');

    assert.equal(deepToggle.activeLayout, 'ide-deep');
    assert.equal(backToDaily.activeLayout, 'daily-0-1');
    assertIdeShellIdentityPreserved(beforeToggle, deepToggle, 'toggling daily-0-1 to ide-deep');
    assertIdeShellIdentityPreserved(beforeToggle, backToDaily, 'toggling daily-0-1 back from ide-deep');

    assert.equal(
        backToDaily.widgets.coordinateTree.highlightedCoordinate,
        sampleCoordinate,
        'active-coordinate highlight preserved for Coordinate Tree'
    );
    assert.equal(backToDaily.widgets.bimbaGraphViewer.selectedCoordinate, sampleCoordinate);
    assert.equal(backToDaily.widgets.canonStudio.openUri, canonUri);
    assert.equal(backToDaily.widgets.logosAtelier.currentTerm, logosTerm);
    assert.equal(backToDaily.widgets.evidencePane.selectedRecordId, evidenceRecordId);
    assert.equal(backToDaily.widgets.reviewPane.selectedItemId, reviewItemId);
    assert.deepEqual(backToDaily.widgets.acr.vakFields, vakFields);
    assert.deepEqual(backToDaily.widgets.autoresearchPane.capacityFilter, autoresearchFilter);
    assert.equal(
        backToDaily.activeActivityBarModeId,
        'pratibimba.activity-bar.coordinate-tree'
    );
    assert.deepEqual(backToDaily.bridgeGate, {
        bindingKey: 'ide-shell.bridge',
        readinessId: 'ready_public_current',
        blockers: [],
        lastTickObserved: 42,
        profileGeneration: 42
    });
    assert.deepEqual(backToDaily.session, {
        sessionId: 'acceptance-test-session-001',
        profileGeneration: 42
    });
});

test('M2 Bimba-Pratibimba state: every M2-side field survives both the 0/1 face-switch AND the layout switch', () => {
    // 23.15 — the M2-side state slice the typed selector publishes into the
    // shared BimbaPratibimbaUiState. The eleven-field persistence contract is
    // the six core profile coordinates (profileGeneration, lens_mode, tick12,
    // position6, address72, kleinFlip.surfaceValence) plus the layer / routing
    // / view fields, with the 23.6 planetaryViewMode and 23.8 epogdoonProofMode
    // appended. The full persisted record is the six-field cross-layout spine
    // plus this M2-side slice.
    assert.deepEqual(
        [...M2_BIMBA_PRATIBIMBA_STATE_FIELDS],
        [
            'coordinate', 'lens', 'mode', 'profileGeneration',
            'sessionKey', 'dayNow',
            'lens_mode', 'tick12', 'position6', 'address72',
            'kleinFlipSurfaceValence', 'layerAActiveCell', 'layerBCardScroll',
            'layerCSurfaceVariant', 'layerCZoom', 'lastRoutingTrace',
            'correspondenceTreeAxisFilter', 'correspondenceTreeSonicOverlay',
            'planetaryViewMode', 'epogdoonProofMode'
        ],
        'M2 BimbaPratibimba state fields must match the typed selector contract'
    );

    // The M2-side slice (everything beyond the cross-layout spine) carries the
    // spec-enumerated fields — the eleven-field contract plus the appended
    // 23.6 / 23.8 view modes.
    for (const field of [
        'lens_mode', 'tick12', 'position6', 'address72', 'kleinFlipSurfaceValence',
        'layerAActiveCell', 'layerBCardScroll', 'layerCSurfaceVariant', 'layerCZoom',
        'lastRoutingTrace', 'correspondenceTreeAxisFilter',
        'correspondenceTreeSonicOverlay', 'planetaryViewMode', 'epogdoonProofMode'
    ]) {
        assert.ok(
            M2_SIDE_STATE_FIELDS.includes(field),
            `M2-side state slice must declare "${field}"`
        );
    }

    assert.deepEqual(
        [...M2_TOGGLE_CLASSES],
        ['layout:daily-0-1<->ide-deep', 'face:cosmic<->personal-0/1'],
        'M2 state must survive both toggle classes (layout switch AND 0/1 face-switch)'
    );

    const harness = createM2StatePersistenceHarness();

    // Fixture state with non-default values for every field, typed per spec.
    const m2State = {
        coordinate: 'M2.5',
        lens: "M2'",
        mode: 'parashakti',
        profileGeneration: 528,
        sessionKey: 'acceptance:m2-parashakti',
        dayNow: '2026-06-19',
        lens_mode: "M2':parashakti",
        tick12: 7,
        position6: 4,
        address72: 53,
        kleinFlipSurfaceValence: 'transitioning',
        layerAActiveCell: { lens: 3, position: 5 },
        layerBCardScroll: 12,
        layerCSurfaceVariant: 'spheres',
        layerCZoom: 1.75,
        lastRoutingTrace: {
            traceId: 'trace-m2-001',
            route: 'm2.meaning_packet',
            address72: 53,
            hopCount: 3,
            capturedAtTick12: 7
        },
        // canonical axis-chip order (subset of AXIS_NAMES)
        correspondenceTreeAxisFilter: ['tattva-phase', 'asma'],
        correspondenceTreeSonicOverlay: 'asma',
        planetaryViewMode: 'psychoid',
        epogdoonProofMode: true
    };

    // The selector normalises on write; that normalised record is the identity
    // a toggle must preserve.
    const written = harness.writeState(m2State);
    for (const field of M2_BIMBA_PRATIBIMBA_STATE_FIELDS) {
        assert.deepEqual(
            written[field],
            m2State[field],
            `M2 field "${field}" round-trips writeState unchanged`
        );
    }

    // Each toggle class independently — state must survive identically.
    for (const toggle of M2_TOGGLE_CLASSES) {
        const fresh = createM2StatePersistenceHarness();
        fresh.writeState(m2State);
        const after = fresh.toggleAndRead(toggle);
        assert.deepEqual(after, written, `whole M2 state survives toggle "${toggle}"`);
        for (const field of M2_BIMBA_PRATIBIMBA_STATE_FIELDS) {
            assert.deepEqual(
                after[field],
                written[field],
                `M2 field "${field}" must survive toggle "${toggle}"`
            );
        }
    }

    // Both toggles applied in sequence (layout switch then 0/1 face-switch and
    // back) — the round trip is still an identity on every field.
    harness.toggleAndRead('layout:daily-0-1<->ide-deep');
    harness.toggleAndRead('face:cosmic<->personal-0/1');
    harness.toggleAndRead('layout:daily-0-1<->ide-deep');
    const afterSequence = harness.toggleAndRead('face:cosmic<->personal-0/1');
    assert.deepEqual(
        afterSequence,
        written,
        'M2 state survives the combined layout + face toggle sequence'
    );

    // Round-trip from an empty (null-profile) start: write, then toggle.
    const emptyHarness = createM2StatePersistenceHarnessWithProfile(null);
    assert.deepEqual(
        emptyHarness.readState(),
        M2_EMPTY_STATE,
        'fresh harness with null profile returns empty state'
    );
    const writtenFromEmpty = emptyHarness.writeState(m2State);
    const afterEmptyToggle = emptyHarness.toggleAndRead('face:cosmic<->personal-0/1');
    for (const field of M2_BIMBA_PRATIBIMBA_STATE_FIELDS) {
        assert.deepEqual(
            afterEmptyToggle[field],
            writtenFromEmpty[field],
            `M2 field "${field}" survives toggle from an empty start`
        );
    }
});

test('M2 Bimba-Pratibimba state: stable mock profile seeds every M2-side field', () => {
    // The bridge-derived initial state (no writes) already carries the M2-side
    // slice from the stable acceptance profile, and that profile-seeded state
    // also survives both toggles.
    const harness = createM2StatePersistenceHarness();
    const seeded = harness.readState();

    assert.equal(seeded.coordinate, 'M2.5');
    assert.equal(seeded.lens, "M2'");
    assert.equal(seeded.profileGeneration, 528);
    assert.equal(seeded.planetaryViewMode, 'psychoid');
    assert.equal(seeded.epogdoonProofMode, true);
    assert.equal(seeded.correspondenceTreeSonicOverlay, 'mantra');
    assert.deepEqual(seeded.layerAActiveCell, { lens: 2, position: 4 });
    assert.deepEqual(seeded.correspondenceTreeAxisFilter, ['decan-face', 'asma']);
    assert.equal(seeded.lastRoutingTrace.traceId, 'trace-m2-001');

    for (const toggle of M2_TOGGLE_CLASSES) {
        const fresh = createM2StatePersistenceHarness();
        const after = fresh.toggleAndRead(toggle);
        assert.deepEqual(
            after,
            seeded,
            `profile-seeded M2 state survives toggle "${toggle}"`
        );
    }
});

function createM2StatePersistenceHarness() {
    return createM2StatePersistenceHarnessWithProfile(createM2StableMockProfile());
}

function createM2StatePersistenceHarnessWithProfile(profile) {
    const bridge = createM2StableBridgeSource(profile);
    const selector = createM2BimbaPratibimbaSelector(bridge);

    return {
        readState() {
            return selector.readState();
        },
        writeState(patch) {
            return selector.writeState(patch);
        },
        toggleAndRead(toggle) {
            selector.toggleLayout(toggle);
            return selector.readState();
        }
    };
}

function createM2StableBridgeSource(profile) {
    const generation = profile?.generation ?? 0;
    const snapshot = {
        profile,
        context: {
            canonicalMCoordinate: profile ? 'M2.5' : null,
            profileGeneration: generation,
            dayNowSessionHandle: profile ? '2026-06-19' : null,
            sessionKey: profile ? 'acceptance:m2-parashakti' : null
        }
    };
    return {
        currentSnapshot() {
            return snapshot;
        }
    };
}

function createOmniPanelTraversalHarness() {
    const manifest = collapseOmniPanelManifest();
    const mountedByLayout = {
        'daily-0-1': [OMNIPANEL_WIDGET_ID],
        'ide-deep': [OMNIPANEL_WIDGET_ID]
    };
    const runtimeCalls = [];
    const reviewRpcCalls = [];
    const runNodes = [];
    const toolEvents = [];
    const evidencePackets = new Map();
    const capabilityRpc = {
        method: "s4'.mediation.capabilities.list",
        capabilities: [
            { name: 'anima_self_invoke', actor: 'anima', allowed: true },
            { name: "s1.vault.read_file", actor: 'pi', allowed: true },
            { name: "s5'.review.submit", actor: 'human', allowed: true }
        ]
    };
    const crossLayoutIntentLog = [];
    const routeSession = {
        selectedCoordinate: null,
        lens: null,
        mode: null,
        sessionKey: null,
        dayNow: null,
        profileGeneration: null,
        privacyClass: null,
        m0_active_layer: null,
        m0_implicate_explicate: null,
        m0_mode: null
    };

    let omniPanelState = createOmniPanelState(manifest);
    let sessionState = createOmniPanelDefaultState();
    let activeLayout = 'daily-0-1';

    const replaceSessionState = update => {
        sessionState = normalizeOmniPanelSessionState({
            ...sessionState,
            ...update,
            perTabState: {
                ...sessionState.perTabState,
                ...(update.perTabState ?? {})
            }
        });
        return sessionState;
    };
    const activateTab = tabId => {
        omniPanelState = activateOmniPanelTab(omniPanelState, manifest, tabId);
        replaceSessionState({ activeTab: tabId });
    };

    return {
        runtimeCalls,
        reviewRpcCalls,
        bootRealStack(requiredServices) {
            return ['gateway', 'spacetimedb', 'neo4j', 'redis', 's5_persisted_stores'].filter(id =>
                requiredServices.includes(id)
            );
        },
        isOmniPanelMounted(layout) {
            return mountedByLayout[layout]?.includes(OMNIPANEL_WIDGET_ID) ?? false;
        },
        visibleTabs(layout) {
            assert.ok(mountedByLayout[layout], `unknown layout ${layout}`);
            return manifest.tabs;
        },
        activeTab() {
            return sessionState.activeTab;
        },
        sendPiChatCommand(command) {
            assert.equal(command, '/dispatch nous');
            runtimeCalls.push({ route: 'anima_self_invoke', payload: { target: 'nous' } });
            runNodes.push({
                id: 'node-nous-001',
                route: 'anima_self_invoke',
                target: 'nous',
                status: 'running'
            });
            toolEvents.push({
                id: 'evt-nous-001',
                nodeId: 'node-nous-001',
                route: 'anima_self_invoke',
                actor: 'nous'
            });
            activateTab('dispatch-trace');
            replaceSessionState({
                perTabState: {
                    'dispatch-trace': { selectedNodeId: 'node-nous-001' }
                }
            });
            return renderDispatchTrace(runNodes, sessionState);
        },
        clickToolStreamEvent(eventId) {
            const event = toolEvents.find(candidate => candidate.id === eventId);
            assert.ok(event, `expected Tool Stream event ${eventId}`);
            activateTab('dispatch-trace');
            replaceSessionState({
                perTabState: {
                    'dispatch-trace': { selectedNodeId: event.nodeId }
                }
            });
            return renderDispatchTrace(runNodes, sessionState);
        },
        clickEvidencePacket(packet) {
            evidencePackets.set(packet.candidateId, packet);
            activateTab('evidence');
            replaceSessionState({
                perTabState: {
                    evidence: { selectedPacketId: packet.candidateId }
                }
            });
            return renderEvidencePacketView(packet);
        },
        attemptApprove(reviewItem, actor) {
            const view = renderReviewItemWithGate(reviewItem, actor, reviewRpcCalls);
            return view;
        },
        renderReviewItem(reviewItem) {
            return renderReviewItemWithGate(reviewItem, { actorIsHuman: true }, reviewRpcCalls);
        },
        renderCapabilityList() {
            return {
                component: 'CapabilityListView',
                sourceRpc: capabilityRpc.method,
                capabilities: capabilityRpc.capabilities
            };
        },
        fireCrossLayoutIntent(intent) {
            crossLayoutIntentLog.push(intent);
        },
        routeCrossLayoutIntent(intent) {
            crossLayoutIntentLog.push(intent);
            activeLayout = intent.requestedLayout;
            if (intent.coordinate !== null) {
                routeSession.selectedCoordinate = intent.coordinate;
            }
            if (intent.sessionKey !== null) {
                routeSession.sessionKey = intent.sessionKey;
            }
            if (intent.dayNow !== null) {
                routeSession.dayNow = intent.dayNow;
            }
            if (intent.profileGeneration !== null) {
                routeSession.profileGeneration = intent.profileGeneration;
            }
            if (intent.privacyClass !== null) {
                routeSession.privacyClass = intent.privacyClass;
            }
            if (intent.lens !== undefined && intent.lens !== null) {
                routeSession.lens = intent.lens;
            }
            if (intent.mode !== undefined && intent.mode !== null) {
                routeSession.mode = intent.mode;
            }
            if (intent.m0_active_layer !== undefined && intent.m0_active_layer !== null) {
                routeSession.m0_active_layer = intent.m0_active_layer;
            }
            if (
                intent.m0_implicate_explicate !== undefined &&
                intent.m0_implicate_explicate !== null
            ) {
                routeSession.m0_implicate_explicate = intent.m0_implicate_explicate;
            }
            if (intent.m0_mode !== undefined && intent.m0_mode !== null) {
                routeSession.m0_mode = intent.m0_mode;
            }
            return {
                activeLayout,
                targetCommandId: intentTargetCommandId(intent),
                session: { ...routeSession },
                consumedIntent: withoutUndefinedFields({
                    requestedExtensionId: intent.requestedExtensionId,
                    requestedContributionId: intent.requestedContributionId,
                    coordinate: intent.coordinate,
                    profileGeneration: intent.profileGeneration,
                    lens: intent.lens,
                    mode: intent.mode,
                    m0_active_layer: intent.m0_active_layer,
                    m0_implicate_explicate: intent.m0_implicate_explicate,
                    m0_mode: intent.m0_mode
                })
            };
        },
        renderCrossLayoutIntentLog() {
            return {
                component: 'CrossLayoutIntentLog',
                entries: [...crossLayoutIntentLog]
            };
        },
        selectEvidencePacket(packetId) {
            activateTab('evidence');
            replaceSessionState({
                perTabState: {
                    evidence: { selectedPacketId: packetId }
                }
            });
        },
        setTabState(tabId, tabState) {
            replaceSessionState({
                perTabState: {
                    [tabId]: tabState
                }
            });
        },
        toggleLayout(nextLayout) {
            assert.ok(mountedByLayout[nextLayout], `unknown layout ${nextLayout}`);
            activeLayout = nextLayout;
            sessionState = normalizeOmniPanelSessionState(sessionState);
            return {
                activeLayout,
                omniPanel: sessionState
            };
        }
    };
}

function createM1DeepWidgetHarness() {
    const profile = createM1StableMockProfile();
    const bridge = new SharedBridgeAdapter();
    bridge.attachBridge(createStableKernelBridgeApi(profile));
    const stateBridge = createM1DeepWidgetUiStateBridge(bridge);

    return {
        writeWidgetState(widgetId, widgetState) {
            return stateBridge.writeWidgetState(widgetId, widgetState);
        },
        toggleAndReadWidgetState(widgetId) {
            stateBridge.toggleLayout('layout:daily-0-1<->ide-deep');
            return stateBridge.readWidgetState(widgetId);
        }
    };
}

function createStableKernelBridgeApi(profile) {
    const status = Object.freeze({
        connected: true,
        mode: 'full',
        reason: 'stable M1 deep-widget acceptance profile'
    });
    const readiness = Object.freeze({
        fetchedAt: 0,
        state: 'ready_public_current',
        reason: 'stable M1 deep-widget acceptance profile',
        profileGeneration: profile.generation,
        bridgeReachable: true,
        blockerIds: Object.freeze([])
    });
    return {
        readCurrentProfile: async () => profile,
        readPointerAnchor: async () => 'M1-2/Pratibimba',
        readReadiness: async () => readiness,
        subscribeObservability: () => ({ dispose() {} }),
        invokeGatewayRpc: async () => ({}),
        depositKernelObservation: async () => undefined,
        requestReviewEvidence: async () => ({}),
        parashaktiCorrespondences: async () => ({}),
        onMathemeHarmonicProfile(listener) {
            listener(profile);
            return { dispose() {} };
        },
        onConnectionStatusChange(listener) {
            listener(status);
            return { dispose() {} };
        },
        onObservabilityEvent() {
            return { dispose() {} };
        }
    };
}

function assertM1DeepWidgetUiStateSubrecord(uiState) {
    assert.deepEqual(
        [...M1_DEEP_WIDGET_UI_STATE_FIELDS],
        [...BIMBA_PRATIBIMBA_UI_STATE_SPINE_FIELDS],
        'M1DeepWidgetUiState field spine must remain a typed sub-record of BimbaPratibimbaUiState'
    );
    assert.deepEqual(
        [...M1_DEEP_WIDGET_TOGGLE_CLASSES],
        ['layout:daily-0-1<->ide-deep'],
        'M1 deep-widget state is only mutated through layout toggle identity'
    );
    for (const field of M1_DEEP_WIDGET_UI_STATE_FIELDS) {
        assert.notEqual(uiState[field], undefined, `M1 UI-state sub-record includes ${field}`);
    }
    assert.equal(uiState.coordinate, 'M1-2/Pratibimba');
    assert.equal(uiState.lens, "M1'");
    assert.equal(uiState.mode, 'deep-widget');
    assert.equal(uiState.profileGeneration, 314);
    assert.equal(uiState.sessionKey, 'acceptance:m1-deep-widget');
    assert.equal(uiState.dayNow, '2026-06-11');
}

function renderDispatchTrace(runNodes, sessionState) {
    return {
        component: 'DispatchTracePanel',
        visibleNodeIds: runNodes.map(node => node.id),
        highlightedNodeId: sessionState.perTabState['dispatch-trace'].selectedNodeId ?? null
    };
}

function renderEvidencePacketView(packet) {
    return {
        component: 'EvidencePacketView',
        fields: { ...packet },
        privacyBadge: {
            component: 'PrivacyClassBadge',
            privacyClass: packet.privacyClass
        }
    };
}

function renderReviewItemWithGate(reviewItem, actor, reviewRpcCalls) {
    const parityBlocked = reviewItem.iod17Parity?.inParity === false;
    const gate = enforceHumanGate({
        decision: 'approve',
        humanRequired: reviewItem.humanRequired,
        actorIsHuman: actor.actorIsHuman,
        actor: actor.actor ?? 'anima'
    });
    const approveDisabled = parityBlocked || !gate.ok;
    if (!approveDisabled) {
        reviewRpcCalls.push({ method: "s5'.review.submit", reviewId: reviewItem.id, decision: 'approve' });
    }

    return {
        component: 'ReviewActionControls',
        banner: parityBlocked ? { text: 'IOD-17 parity violated', tone: 'red' } : null,
        controls: {
            approve: {
                disabled: approveDisabled,
                tooltip: gate.ok ? null : gate.reason
            },
            reject: { disabled: parityBlocked },
            defer: { disabled: parityBlocked },
            annotate: { disabled: parityBlocked }
        }
    };
}

function buildOmniPanelEvidencePacket(candidateId) {
    return buildMediatedRunEvidencePacket({
        candidateId,
        coordinate: 'M5-4.omnipanel',
        currentProfile: {
            source: 's0.current_profile',
            generation: 108,
            readiness: { bridge: 'ready', profile: 'live' },
            profileHandle: 's0://profile/108'
        },
        graphContext: {
            source: 's2.graph_services',
            namespace: 'bimba',
            coordinate: 'M5-4.omnipanel',
            graphAnchor: 's2://bimba/M5-4.omnipanel',
            relationRefs: ['s2://rel/omnipanel-tab-traversal/001']
        },
        sessionRuntime: {
            source: 's3.gateway',
            sessionKey: 'agent:epii:main',
            dayId: '2026-06-11',
            nowPath: 'Idea/Empty/Present/11-06-2026/20260611-172519-27T27.13/now.md',
            gatewayRunRef: 's3://runs/omnipanel-tab-traversal',
            runtimeRefs: ['spacetimedb://session/agent:epii:main/world_clock/108']
        },
        graphitiProtectedHandles: [
            {
                handle: 'graphiti://protected/episode/omnipanel-tab-traversal',
                namespace: 'pratibimba',
                privacyClass: 'protected-local-synthetic-fixture',
                summary: 'synthetic protected handle for OmniPanel traversal acceptance'
            }
        ],
        vaultRefs: [
            {
                method: "s1.vault.read_file",
                uri: 'vault://Idea/Bimba/Seeds/M/Legacy/plans/27-omnipanel-tabs-deep.md',
                capability: "s1.vault.read_file",
                governance: 'read_only'
            }
        ],
        semanticCandidates: {
            source: 's1.semantic.suggest_links',
            responseType: 'LinkCandidateResponse',
            requestRef: 's1://semantic/request/omnipanel-tab-traversal',
            candidates: [
                {
                    target: '[[OmniPanel]]',
                    score: 0.93,
                    sourceBlock: 'block://surface-contracts/omnipanel-eight-tabs',
                    reason: 'same event is rendered through Dispatch Trace, Tool Stream, and Evidence'
                }
            ]
        },
        s5Refs: {
            source: 's5.persisted_store',
            candidateRef: `s5://candidate/${candidateId}`,
            reviewRef: 's5://review/rev-human-gate-001',
            improvementRef: 's5://improve/omnipanel-tab-traversal',
            persistedStoreDtoRef: 's5://fixtures/omnipanel-tab-traversal/pkt-XYZ'
        },
        privacyClass: 'protected-local-synthetic-fixture'
    });
}

function buildCrossLayoutIntent(id, requestedLayout, requestedContributionId) {
    return {
        id,
        coordinate: 'M5-4.omnipanel',
        artifactUri: null,
        reviewId: null,
        dayNow: '2026-06-11',
        sessionKey: 'agent:epii:main',
        profileGeneration: 108,
        privacyClass: 'protected',
        requestedLayout,
        requestedExtensionId: '@pratibimba/omnipanel-shell',
        requestedContributionId
    };
}

function buildM3CodonCrossLayoutIntent(overrides = {}) {
    return {
        id: 'intent-m3-codon',
        coordinate: 'M3-1-0-13',
        artifactUri: null,
        reviewId: null,
        dayNow: '2026-06-17',
        sessionKey: 'agent:epii:main',
        profileGeneration: 472,
        privacyClass: 'public',
        requestedLayout: 'ide-deep',
        requestedExtensionId: 'm3-mahamaya',
        requestedContributionId: 'codon',
        ...overrides
    };
}

function buildM0SurfaceCrossLayoutIntent(overrides = {}) {
    return {
        id: 'intent-m0-relations',
        coordinate: 'M0-2-relations',
        artifactUri: null,
        reviewId: null,
        dayNow: '2026-06-17',
        sessionKey: 'agent:epii:m0',
        profileGeneration: 472,
        privacyClass: 'public',
        lens: 'void-structure-ring',
        mode: 'authoring',
        m0_active_layer: 'relations',
        m0_implicate_explicate: 'explicate',
        m0_mode: 'authoring',
        requestedLayout: 'ide-deep',
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: 'relations',
        ...overrides
    };
}

function createIdeShellStateIdentityHarness() {
    const state = {
        activeLayout: null,
        activeActivityBarModeId: null,
        session: {
            sessionId: null,
            profileGeneration: null
        },
        bridgeGate: {
            bindingKey: 'ide-shell.bridge',
            readinessId: 'bridge_unavailable',
            blockers: ['s0.kernel-bridge.unavailable'],
            lastTickObserved: 0,
            profileGeneration: null
        },
        widgets: {
            coordinateTree: {
                activeCoordinate: null,
                highlightedCoordinate: null
            },
            bimbaGraphViewer: {
                selectedCoordinate: null
            },
            canonStudio: {
                openUri: null
            },
            logosAtelier: {
                currentTerm: null
            },
            evidencePane: {
                selectedRecordId: null
            },
            reviewPane: {
                selectedItemId: null
            },
            acr: {
                vakFields: null
            },
            autoresearchPane: {
                capacityFilter: null
            }
        }
    };

    const assertLayoutSupportsMode = (layout, modeId) => {
        const modes = expectedActivityBarModes[layout] ?? [];
        assert.ok(
            modes.some(mode => mode.modeId === modeId),
            `${layout} must support activity-bar mode ${modeId}`
        );
    };

    const snapshot = () => structuredClone(state);

    return {
        openLayout(layout) {
            assert.ok(expectedActivityBarModes[layout], `unknown layout ${layout}`);
            state.activeLayout = layout;
        },
        selectCoordinate(coordinate) {
            state.widgets.coordinateTree.activeCoordinate = coordinate;
            state.widgets.coordinateTree.highlightedCoordinate = coordinate;
        },
        activateSession(sessionId, profileGeneration) {
            assert.ok(BRIDGE_READINESS_IDS.includes('ready_public_current'));
            state.session = { sessionId, profileGeneration };
            state.bridgeGate = {
                bindingKey: 'ide-shell.bridge',
                readinessId: 'ready_public_current',
                blockers: [],
                lastTickObserved: profileGeneration,
                profileGeneration
            };
        },
        activateActivityBarMode(shortName) {
            const modeId = `pratibimba.activity-bar.${shortName}`;
            assertLayoutSupportsMode(state.activeLayout, modeId);
            state.activeActivityBarModeId = modeId;
        },
        openBimbaGraphViewerAndSelectCoordinate(coordinate) {
            state.widgets.bimbaGraphViewer.selectedCoordinate = coordinate;
        },
        openCanonStudioFile(openUri) {
            state.widgets.canonStudio.openUri = openUri;
        },
        setLogosTerm(currentTerm) {
            state.widgets.logosAtelier.currentTerm = currentTerm;
        },
        selectEvidenceRecord(selectedRecordId) {
            state.widgets.evidencePane.selectedRecordId = selectedRecordId;
        },
        selectReviewItem(selectedItemId) {
            state.widgets.reviewPane.selectedItemId = selectedItemId;
        },
        populateAcrVakFields(vakFields) {
            state.widgets.acr.vakFields = structuredClone(vakFields);
        },
        setAutoresearchCapacityFilter(capacityFilter) {
            state.widgets.autoresearchPane.capacityFilter = structuredClone(capacityFilter);
        },
        toggleLayout(nextLayout) {
            assert.ok(expectedActivityBarModes[nextLayout], `unknown layout ${nextLayout}`);
            if (state.activeActivityBarModeId !== null) {
                assertLayoutSupportsMode(nextLayout, state.activeActivityBarModeId);
            }
            state.activeLayout = nextLayout;
            return snapshot();
        },
        identitySnapshot() {
            return snapshot();
        }
    };
}

function assertIdeShellIdentityPreserved(expected, actual, context) {
    assert.deepEqual(actual.session, expected.session, `${context}: session identity preserved`);
    assert.deepEqual(
        actual.bridgeGate,
        expected.bridgeGate,
        `${context}: bridge-gate readiness binding preserved`
    );
    assert.equal(
        actual.activeActivityBarModeId,
        expected.activeActivityBarModeId,
        `${context}: active activity-bar mode preserved`
    );
    assert.deepEqual(
        actual.widgets.coordinateTree,
        expected.widgets.coordinateTree,
        `${context}: active-coordinate state preserved`
    );
    assert.deepEqual(actual.widgets.bimbaGraphViewer, expected.widgets.bimbaGraphViewer);
    assert.deepEqual(actual.widgets.canonStudio, expected.widgets.canonStudio);
    assert.deepEqual(actual.widgets.logosAtelier, expected.widgets.logosAtelier);
    assert.deepEqual(actual.widgets.evidencePane, expected.widgets.evidencePane);
    assert.deepEqual(actual.widgets.reviewPane, expected.widgets.reviewPane);
    assert.deepEqual(actual.widgets.acr, expected.widgets.acr);
    assert.deepEqual(actual.widgets.autoresearchPane, expected.widgets.autoresearchPane);
}

function withoutUndefinedFields(record) {
    return Object.fromEntries(
        Object.entries(record).filter(([, value]) => value !== undefined)
    );
}
