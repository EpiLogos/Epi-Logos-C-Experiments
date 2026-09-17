import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    COMPOSITION_ROUTES,
    buildCompositionIntent,
    buildCompositionCrossLayoutIntent,
    dispatchCompositionIntent,
    resolveCompositionRoute
} = require('../lib/common/integrated-deep-links.js');

function targetCommandId(intent) {
    return `pratibimba.${intent.requestedExtensionId}.${intent.requestedContributionId}.open`;
}

test('cosmicComposition resolves to the integrated-1-2-3 layout route', () => {
    const resolution = resolveCompositionRoute(COMPOSITION_ROUTES.cosmicComposition);

    assert.equal(resolution.layoutRange, 'integrated-1-2-3');
    assert.equal(resolution.requestedLayout, 'daily-0-1');
    assert.equal(resolution.requestedExtensionId, 'plugin-integrated-1-2-3');
    assert.equal(resolution.requestedContributionId, 'cosmic-composition');
    assert.equal(resolution.compositionId, 'cosmic-engine.integrated');
    assert.equal(resolution.canMount, true);
});

test('personalComposition resolves to the jiva-siva.integrated composition layout', () => {
    const resolution = resolveCompositionRoute(COMPOSITION_ROUTES.personalComposition);

    assert.equal(resolution.layoutRange, 'integrated-4-5-0');
    assert.equal(resolution.requestedLayout, 'daily-0-1');
    assert.equal(resolution.requestedExtensionId, 'plugin-integrated-4-5-0');
    assert.equal(resolution.requestedContributionId, 'personal-composition');
    assert.equal(resolution.compositionId, 'jiva-siva.integrated');
    assert.equal(resolution.canMount, true);
});

test('route resolution checks composition readiness before mounting', () => {
    const resolution = resolveCompositionRoute(COMPOSITION_ROUTES.cosmicComposition, {
        overall: 's3_subscription_blocked',
        contributorReadinesses: [
            {
                extensionId: 'm2-parashakti',
                state: 's3_subscription_blocked',
                reason: 'S3 stream is not attached'
            }
        ],
        blockingContributorIds: ['m2-parashakti']
    });

    assert.equal(resolution.canMount, false);
    assert.deepEqual(resolution.blockedBy, ['m2-parashakti']);
});

test('buildCompositionIntent maps composition ids to stable routes and preserves hints', () => {
    const intent = buildCompositionIntent('cosmic-engine.integrated', {
        compositionId: 'cosmic-engine.integrated',
        pinnedMatrixFamily: 3,
        cosmicSelectedCoordinate: '#1-2-3'
    });

    assert.equal(intent.route, COMPOSITION_ROUTES.cosmicComposition);
    assert.equal(intent.compositionId, 'cosmic-engine.integrated');
    assert.deepEqual(intent.stateHints, {
        compositionId: 'cosmic-engine.integrated',
        pinnedMatrixFamily: 3,
        cosmicSelectedCoordinate: '#1-2-3'
    });
    assert.equal(Object.isFrozen(intent.stateHints), true);
});

test('buildCompositionIntent rejects mismatched persisted-state hints', () => {
    assert.throws(
        () =>
            buildCompositionIntent('jiva-siva.integrated', {
                compositionId: 'cosmic-engine.integrated'
            }),
        /does not match jiva-siva\.integrated/
    );
});

test('OmniPanel intent dispatch envelope targets the correct cosmic layout command', () => {
    const compositionIntent = buildCompositionIntent('cosmic-engine.integrated', {
        pinnedMatrixFamily: 3
    });
    const crossLayoutIntent = buildCompositionCrossLayoutIntent(compositionIntent);

    assert.equal(crossLayoutIntent.requestedLayout, 'daily-0-1');
    assert.equal(crossLayoutIntent.requestedExtensionId, 'plugin-integrated-1-2-3');
    assert.equal(crossLayoutIntent.requestedContributionId, 'cosmic-composition');
    assert.equal(
        targetCommandId(crossLayoutIntent),
        'pratibimba.plugin-integrated-1-2-3.cosmic-composition.open'
    );
    assert.deepEqual(crossLayoutIntent.stateHints, { pinnedMatrixFamily: 3 });
});

test('OmniPanel intent dispatch envelope targets the correct personal layout command', () => {
    const compositionIntent = buildCompositionIntent('jiva-siva.integrated', {
        personalSelectedDayId: '2026-06-12',
        personalReviewQueueFilter: 'unread'
    });
    const crossLayoutIntent = buildCompositionCrossLayoutIntent(compositionIntent);

    assert.equal(crossLayoutIntent.requestedLayout, 'daily-0-1');
    assert.equal(crossLayoutIntent.requestedExtensionId, 'plugin-integrated-4-5-0');
    assert.equal(crossLayoutIntent.requestedContributionId, 'personal-composition');
    assert.equal(crossLayoutIntent.compositionId, 'jiva-siva.integrated');
    assert.equal(
        targetCommandId(crossLayoutIntent),
        'pratibimba.plugin-integrated-4-5-0.personal-composition.open'
    );
    assert.deepEqual(crossLayoutIntent.stateHints, {
        personalSelectedDayId: '2026-06-12',
        personalReviewQueueFilter: 'unread'
    });
});

test('dispatchCompositionIntent publishes the composition route for bridge consumers', async () => {
    const published = [];
    const bridge = {
        publish(event) {
            published.push(event);
        }
    };
    const compositionIntent = buildCompositionIntent('cosmic-engine.integrated', {
        pinnedMatrixFamily: 5
    });

    await dispatchCompositionIntent(bridge, compositionIntent);

    assert.equal(published.length, 1);
    assert.equal(published[0].type, 'composition.intent.dispatch');
    assert.equal(published[0].extensionId, 'integrated-composition');
    assert.equal(published[0].payload.route, COMPOSITION_ROUTES.cosmicComposition);
    assert.equal(
        published[0].payload.crossLayoutIntent.requestedContributionId,
        'cosmic-composition'
    );
    assert.deepEqual(published[0].payload.stateHints, { pinnedMatrixFamily: 5 });
});
