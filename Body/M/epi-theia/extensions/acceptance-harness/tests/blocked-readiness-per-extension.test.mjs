import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertFixturePrivacy,
    readJsonFixture
} from './onboarding-harness.mjs';

const {
    bridgeReadinessColour,
    classifyReadiness
} = await import('../../m-extension-runtime/lib/common/bridge-readiness.js');
const {
    readinessSeverity
} = await import('../../m-extension-runtime/lib/common/readiness.js');

function snapshotFor(extension, state) {
    return {
        fetchedAt: 32014,
        state,
        reason: `${extension.id}:${state}`,
        profileGeneration: state === 'bridge_unavailable' ? null : 14,
        bridgeReachable: state !== 'bridge_unavailable',
        blockerIds: state === 'ready_public_current' ? [] : [`${extension.id}.${state}`]
    };
}

test('84 onboarding empty-state grammar sub-cases render from canonical readiness ids', () => {
    const fixture = readJsonFixture('blocked-readiness-matrix.json');
    assertFixturePrivacy(fixture);

    let assertions = 0;
    const stateSnapshots = new Map();

    for (const extension of fixture.extensions) {
        for (const state of fixture.readinessStates) {
            const snapshot = snapshotFor(extension, state);
            const binding = classifyReadiness(snapshot, extension.id);
            const grammar = fixture.grammarByReadiness[state];

            assert.equal(binding.readinessId, state);
            assert.equal(readinessSeverity(state), grammar.severity);
            assert.equal(bridgeReadinessColour(state), grammar.tone);
            assert.ok(grammar.emptyState.length > 0);
            assert.ok(grammar.action.length > 0);

            stateSnapshots.set(`${extension.id}:${state}`, {
                extensionId: extension.id,
                coordinate: extension.coordinate,
                readinessId: binding.readinessId,
                severity: grammar.severity,
                tone: grammar.tone,
                title: `${extension.surface}: ${grammar.emptyState}`,
                action: grammar.action
            });
            assertions += 1;
        }

        for (const flavour of fixture.uxGrammarFlavours) {
            const grammar = fixture.grammarByFlavour[flavour];
            assert.ok(grammar.region);
            assert.ok(grammar.expectedRole);
            assert.equal(typeof grammar.motionSensitive, 'boolean');
            assertions += 1;
        }
    }

    assert.equal(assertions, 84);
    assert.equal(stateSnapshots.size, 54, 'snapshot per readiness-state/extension pair');
});

