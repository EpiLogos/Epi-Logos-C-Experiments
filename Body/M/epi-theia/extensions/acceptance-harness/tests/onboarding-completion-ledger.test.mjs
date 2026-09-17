import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    assertFixturePrivacy,
    readJsonFixture
} from './onboarding-harness.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEDGER_PATH = resolve(__dirname, '../../contracts/onboarding-completion-ledger.json');

function reachableByPrefix(id, prefixes) {
    return prefixes.some(prefix => id.startsWith(prefix));
}

test('onboarding-completion-ledger step ids and skip paths are reachable', () => {
    const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));
    const reachability = readJsonFixture('onboarding-completion-ledger-reachability.json');
    assertFixturePrivacy(reachability);

    const ids = new Set(ledger.ledger.map(entry => entry.id));
    assert.equal(ids.size, ledger.ledger.length, 'ledger step ids must be unique');

    for (const entry of ledger.ledger) {
        const reachable =
            reachableByPrefix(entry.id, reachability.orchestratorStepPrefixes) ||
            reachability.walkthroughStepIds.includes(entry.id) ||
            reachability.pasuStepIds.includes(entry.id) ||
            reachability.settingsStepIds.includes(entry.id) ||
            reachability.kairosStepIds.includes(entry.id) ||
            reachability.firstSessionStepIds.includes(entry.id);

        assert.equal(reachable, true, `${entry.id} must be reachable through an onboarding state machine`);

        for (const dep of entry.dependsOn ?? []) {
            assert.ok(ids.has(dep), `${entry.id} dependency ${dep} must exist`);
        }

        const skipPath = entry.skipPath ?? '';
        if (skipPath.startsWith('not skippable')) {
            assert.match(skipPath, /required|not a user-discretionary|not marked complete|liveness gate/);
        } else {
            assert.ok(
                reachability.skipPreferences.some(pref => skipPath.includes(pref)),
                `${entry.id} skip path must name a reachable preference ledger`
            );
        }
    }
});
