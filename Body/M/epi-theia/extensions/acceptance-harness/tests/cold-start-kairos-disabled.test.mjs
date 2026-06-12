import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertFixturePrivacy,
    createColdStartFixture,
    readJsonFixture,
    require
} from './onboarding-harness.mjs';

const {
    INITIAL_RELAY_STATE,
    KAIROS_ENABLED_DEFAULT,
    KAIROS_ENABLED_PREFERENCE,
    relayIndicatorLabel
} = require('../../m-extension-runtime/lib/browser/onboarding/kairos-enablement-step.js');

test('kairos-disabled FR-3 path mounts graceful stub and never probes kerykeion', async () => {
    const coldStart = readJsonFixture('cold-start-ledger.json');
    const disabled = readJsonFixture('kairos-disabled.json');
    assertFixturePrivacy(disabled);

    assert.equal(disabled.preferences[KAIROS_ENABLED_PREFERENCE], KAIROS_ENABLED_DEFAULT);

    const run = await createColdStartFixture({
        preferences: disabled.preferences,
        initialReadiness: coldStart.readinessSnapshots.bridgeUnavailable
    });

    await run.emitReadiness(coldStart.readinessSnapshots.bridgeReachable);
    await run.emitStatus(coldStart.connectionStatuses.connected);
    await run.emitReadiness(coldStart.readinessSnapshots.readyPublicCurrent);

    assert.equal(run.orchestrator.currentStage(), 'kairos-enablement');
    assert.equal(run.gateway.rpcCalls.some(call => call.method === 'nara.kairos.refresh'), false);
    assert.equal(run.gateway.kerykeionProbeCount, 0);
    assert.equal(relayIndicatorLabel(INITIAL_RELAY_STATE), disabled.relay.expectedLabel);
    assert.equal(disabled.relay.expectedTone, 'grey');

    run.subscription.dispose();
    run.orchestrator.dispose();
});
