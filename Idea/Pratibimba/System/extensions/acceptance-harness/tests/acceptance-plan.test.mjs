// Track 05 T9 — acceptance plan dry-run.
//
// Drive the acceptance script in --dry-run mode to confirm the plan
// parses, the service list resolves, and the receipt structure matches what
// the operator runbook documents.

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACCEPTANCE_SCRIPT = resolve(__dirname, '..', 'scripts', 'acceptance.mjs');

test('acceptance.mjs --dry-run produces a parseable receipt', () => {
    const result = spawnSync('node', [ACCEPTANCE_SCRIPT, '--dry-run', '--browser'], {
        encoding: 'utf8',
        timeout: 30000
    });
    assert.equal(result.status, 0, `dry-run failed: ${result.stderr}`);
    const receipt = JSON.parse(result.stdout);
    assert.equal(receipt.plan, 'track-05-t9-acceptance');
    assert.equal(receipt.mode, 'browser');
    assert.equal(receipt.result, 'dry-run');
    assert.ok(Array.isArray(receipt.services), 'services must be an array');
    assert.ok(Array.isArray(receipt.steps), 'steps must be an array');
    assert.ok(receipt.services.length >= 6, 'at least 6 services in the plan');
    assert.ok(receipt.steps.length >= 7, 'at least 7 acceptance steps');
    assert.ok(Array.isArray(receipt.privacyAuditSurfaces));
});

test('dry-run electron mode produces the same plan body', () => {
    const result = spawnSync('node', [ACCEPTANCE_SCRIPT, '--dry-run', '--electron'], {
        encoding: 'utf8',
        timeout: 30000
    });
    assert.equal(result.status, 0);
    const receipt = JSON.parse(result.stdout);
    assert.equal(receipt.mode, 'electron');
});

test('every service in the receipt names a real start command', () => {
    const result = spawnSync('node', [ACCEPTANCE_SCRIPT, '--dry-run'], {
        encoding: 'utf8',
        timeout: 30000
    });
    const receipt = JSON.parse(result.stdout);
    for (const service of receipt.services) {
        assert.ok(
            typeof service.start === 'string' && service.start.length > 0,
            `service ${service.id} must name a start command`
        );
    }
});
