import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertFixturePrivacy,
    createColdStartFixture,
    readJsonFixture
} from './onboarding-harness.mjs';

test('PASU pre-populated cold-start detects identity and skips wizard mount', async () => {
    const coldStart = readJsonFixture('cold-start-ledger.json');
    const pasu = readJsonFixture('pasu-prepopulated.json');
    assertFixturePrivacy(pasu);

    const run = await createColdStartFixture({
        initialReadiness: coldStart.readinessSnapshots.bridgeUnavailable,
        gatewayOptions: {
            pasuRecord: pasu.record
        }
    });

    const detectedPasu = await run.adapter.invokeGatewayRpc(pasu.pasuRpc, {});
    assert.deepEqual(detectedPasu, pasu.record);
    assert.ok(run.gateway.rpcCalls.some(call => call.method === 'nara.pasu.show'));
    assert.equal(pasu.wizardMountExpected, false);

    await run.emitReadiness(coldStart.readinessSnapshots.bridgeReachable);
    await run.emitStatus(coldStart.connectionStatuses.connected);
    await run.emitReadiness(coldStart.readinessSnapshots.renderableReadiness);

    assert.equal(run.orchestrator.currentStage(), pasu.expectedStageAfterReadiness);
    assert.equal(run.gateway.rpcCalls.some(call => call.method === 'nara.kairos.refresh'), false);

    run.subscription.dispose();
    run.orchestrator.dispose();
});

