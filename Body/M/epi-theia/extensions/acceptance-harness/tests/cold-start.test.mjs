import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

import {
    assertFixturePrivacy,
    createColdStartFixture,
    readJsonFixture,
    require
} from './onboarding-harness.mjs';

const { ColdStartSplash, MATHEME_GLYPH } = require('../../m-extension-runtime/lib/browser/cold-start-splash.js');

test('full cold-start sequence advances deterministically and surfaces first-session affordance', async () => {
    const fixture = readJsonFixture('cold-start-ledger.json');
    assertFixturePrivacy(fixture);

    const run = await createColdStartFixture({
        initialReadiness: fixture.readinessSnapshots.bridgeUnavailable
    });

    await run.emitReadiness(fixture.readinessSnapshots.bridgeReachable);
    await run.emitStatus(fixture.connectionStatuses.bridgeOnly);
    await run.emitStatus(fixture.connectionStatuses.connected);
    await run.emitReadiness(fixture.readinessSnapshots.blockedReadiness);
    await run.emitReadiness(fixture.readinessSnapshots.renderableReadiness);
    run.orchestrator.completeKairosEnablement();

    assert.deepEqual(run.stages, fixture.stageSequence);
    assert.equal(run.orchestrator.currentStage(), 'dismissed');

    const splash = renderToStaticMarkup(
        React.createElement(ColdStartSplash, {
            stage: 'awaiting-readiness',
            onDismiss: () => undefined
        })
    );
    assert.match(splash, /Matheme Harmonic Profile/);
    assert.match(splash, new RegExp(`>${MATHEME_GLYPH}<`));
    assert.match(splash, /data-stage="awaiting-readiness"/);

    assert.equal(fixture.walkthrough.mountsAfterStage, 'dismissed');
    assert.equal(fixture.walkthrough.steps.length, 6);
    assert.deepEqual(
        fixture.walkthrough.steps.map(step => step.id),
        [
            'walkthrough.0-1-toggle',
            'walkthrough.omnipanel',
            'walkthrough.activity-bar',
            'walkthrough.status-bar',
            'walkthrough.day-now-anchor',
            'walkthrough.cosmic-personal'
        ]
    );
    assert.equal(fixture.firstSessionAffordance.surfacesAfterWalkthrough, true);
    assert.equal(fixture.firstSessionAffordance.command, 'khora.session_start');

    run.subscription.dispose();
    run.orchestrator.dispose();
});
