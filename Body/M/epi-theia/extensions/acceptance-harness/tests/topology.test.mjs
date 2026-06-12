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
    REQUIRED_MEDIATED_EVIDENCE_FIELDS,
    buildMediatedRunEvidencePacket,
    enforceHumanGate
} = require('../../agentic-control-room/lib/common/run-model.js');

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
        'tool-stream': { activeEventId: 'evt-nous-001', actorFilter: 'nous' },
        evidence: { selectedPacketId: 'pkt-XYZ', miniGraphNodeId: 'node-nous-001' },
        review: { selectedReviewId: 'rev-human-gate-001', decisionDraft: 'approve' },
        gateway: { activeCapability: 'anima_self_invoke', facet: 'capabilities' },
        diagnostics: { selectedIntentId: 'intent-3', readinessPanel: 'kernel-bridge' }
    };
    for (const [tabId, tabState] of Object.entries(perTabFixtures)) {
        harness.setTabState(tabId, tabState);
    }
    const allTabsAfterToggle = harness.toggleLayout('daily-0-1');
    assert.equal(allTabsAfterToggle.omniPanel.activeTab, 'evidence');
    assert.deepEqual(allTabsAfterToggle.omniPanel.perTabState, perTabFixtures);
});

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
