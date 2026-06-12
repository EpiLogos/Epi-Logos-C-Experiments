import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertFixturePrivacy,
    createColdStartFixture,
    readJsonFixture,
    require,
    settle
} from './onboarding-harness.mjs';

const {
    INITIAL_RELAY_STATE,
    MERCURIUS_REFRESH_RPC,
    relayIndicatorLabel,
    relayReducer
} = require('../../m-extension-runtime/lib/browser/onboarding/kairos-enablement-step.js');

test('kairos-enabled path refreshes Mercurius and activates the relay indicator', async () => {
    const coldStart = readJsonFixture('cold-start-ledger.json');
    const kairos = readJsonFixture('kairos-enabled.json');
    assertFixturePrivacy(kairos);

    const run = await createColdStartFixture({
        preferences: kairos.preferences,
        initialReadiness: coldStart.readinessSnapshots.bridgeUnavailable,
        gatewayOptions: {
            mercuriusResponse: kairos.mercurius
        }
    });

    await run.emitReadiness(coldStart.readinessSnapshots.bridgeReachable);
    await run.emitStatus(coldStart.connectionStatuses.connected);
    await run.emitReadiness(coldStart.readinessSnapshots.readyPublicCurrent);
    await settle();

    const refresh = run.gateway.rpcCalls.find(call => call.method === MERCURIUS_REFRESH_RPC);
    assert.ok(refresh, 'orchestrator must request Mercurius refresh');
    assert.equal(refresh.params.reason, 'cold-start-stage-6');
    assert.equal(run.gateway.kerykeionProbeCount, 1);
    assert.notEqual(kairos.mercurius.M4_Temporal_Now.planet_degrees[10], 0);

    const relay = relayReducer(INITIAL_RELAY_STATE, {
        type: 'refresh-success',
        refreshedAt: kairos.mercurius.refreshedAt
    });
    assert.equal(relay.phase, kairos.relay.expectedPhase);
    assert.match(relayIndicatorLabel(relay), new RegExp(kairos.relay.expectedLabelFragment));

    run.subscription.dispose();
    run.orchestrator.dispose();
});
