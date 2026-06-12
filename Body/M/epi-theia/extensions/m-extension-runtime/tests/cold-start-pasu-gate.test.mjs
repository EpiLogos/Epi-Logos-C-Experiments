// Task 32.2 — end-to-end PASU-absence orchestration through the REAL
// ColdStartOrchestrator (32.1) wired to the REAL identity gate (32.2).
//
// Proves, against the actual state machine (not a mock of it):
//   (1) On readiness-clear the orchestrator fires the pre-stage-6 gate, which
//       suspends stage 6 synchronously → the splash holds at 'pasu-identity'.
//   (2) PASU absent → the wizard command is dispatched; stage 6 stays suspended.
//   (3) Full-wizard skip → resumeStage6('fr3-stub') advances into stage 6.
//   (4) PASU found → the wizard never opens; the orchestrator advances straight
//       into stage 6 ('kairos-enablement', the FR-3 default-off kairos branch).

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ColdStartOrchestrator } = require('../lib/browser/cold-start-orchestrator.js');
const wiz = require('../../m4-nara/lib/browser/onboarding/identity-wizard.js');

const flush = () => new Promise(resolve => setImmediate(resolve));

/** A ready, connected, non-blocked snapshot with no profile yet (stage 5 entry). */
function readySnapshot() {
    return {
        profile: null,
        status: { connected: true },
        readiness: { state: 'ready_public_current', bridgeReachable: true }
    };
}

/** Minimal adapter the orchestrator subscribes to; snapshot is read on reconcile. */
function makeAdapter(snapshot) {
    return {
        snapshot,
        onReadiness() { return { dispose() {} }; },
        onConnectionStatus() { return { dispose() {} }; },
        onProfile() { return { dispose() {} }; },
        currentSnapshot() { return this.snapshot; },
        invokeGatewayRpc() { return Promise.resolve(); }
    };
}

/** Construct an orchestrator with injected stubs and start it manually. */
function bootOrchestrator() {
    const orch = new ColdStartOrchestrator();
    orch.adapter = makeAdapter(readySnapshot());
    orch.preferences = { get: (_key, fallback) => fallback };
    return orch;
}

test('PASU absent: orchestrator holds at pasu-identity and fires the wizard command', async () => {
    const orch = bootOrchestrator();
    const wizardOpened = [];

    orch.registerStage6Gate(
        wiz.createPasuIdentityGate({
            invokeGatewayRpc: async () => 'not_found',
            suspendStage6: () => orch.suspendStage6(),
            resumeStage6: mode => orch.resumeStage6(mode),
            openWizard: mode => wizardOpened.push(mode)
        })
    );

    orch.start();

    // Gate suspended stage 6 synchronously — the splash holds at the PASU stage.
    assert.equal(orch.currentStage(), 'pasu-identity');
    assert.equal(orch.isStage6Suspended(), true);

    await flush();

    // The absent probe dispatched the wizard; stage 6 is still suspended.
    assert.deepEqual(wizardOpened, ['full']);
    assert.equal(orch.currentStage(), 'pasu-identity');

    // (3) Full-wizard skip advances into stage 6 (FR-3 default-off kairos branch).
    orch.resumeStage6('fr3-stub');
    assert.equal(orch.isStage6Suspended(), false);
    assert.equal(orch.stage6ResolvedAs(), 'fr3-stub');
    assert.equal(orch.currentStage(), 'kairos-enablement');
});

test('PASU found: orchestrator skips the wizard and advances straight into stage 6', async () => {
    const orch = bootOrchestrator();
    const wizardOpened = [];

    orch.registerStage6Gate(
        wiz.createPasuIdentityGate({
            invokeGatewayRpc: async () => ({ c_0_natal_chart_path: '/natal.json' }),
            suspendStage6: () => orch.suspendStage6(),
            resumeStage6: mode => orch.resumeStage6(mode),
            openWizard: mode => wizardOpened.push(mode)
        })
    );

    orch.start();
    // Suspended synchronously while the probe is in flight.
    assert.equal(orch.currentStage(), 'pasu-identity');

    await flush();

    // PASU present → wizard never opened, stage 6 resumed and reached.
    assert.deepEqual(wizardOpened, []);
    assert.equal(orch.stage6ResolvedAs(), 'pasu-present');
    assert.equal(orch.currentStage(), 'kairos-enablement');
});

test('no gate registered: the pipeline flows into stage 6 unchanged', () => {
    const orch = bootOrchestrator();
    orch.start();
    // With no identity gate, stage 5 is a pass-through; kairos default-off lands
    // on the enablement branch exactly as before task 32.2.
    assert.equal(orch.currentStage(), 'kairos-enablement');
    assert.equal(orch.isStage6Suspended(), false);
});

test("'pasu-identity' is ordered between readiness and kairos in the stage list", () => {
    const order = require('../lib/browser/cold-start-orchestrator.js').COLD_START_STAGE_ORDER;
    const i = order.indexOf('pasu-identity');
    assert.ok(i > order.indexOf('awaiting-readiness'));
    assert.ok(i < order.indexOf('kairos-enablement'));
});
