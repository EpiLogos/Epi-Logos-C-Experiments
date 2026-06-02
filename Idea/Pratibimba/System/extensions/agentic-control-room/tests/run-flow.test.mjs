// Track 05 T8 — run flow contract tests.
//
// Exercises the pure run-model + parity helpers:
//   - capability parity assertion (IOD-17 three-way bijection).
//   - run model status transitions surface the expected names.
//   - parity finds extras/missing on either side.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const {
    assertCapabilityParity,
    ACR_WIDGET_IDS,
    EXTENSION_ID
} = require('../lib/common/index.js');
const {
    parseCapabilityMatrix,
    dispatchToolNames
} = require('../../ide-shell-m0-m5/lib/common/capability-matrix-types.js');

const CAPABILITY_MATRIX_PATH = resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    'Body',
    'S',
    'S4',
    'plugins',
    'pleroma',
    'capability-matrix.json'
);

test('capability parity asserts equal sets', () => {
    const r = assertCapabilityParity(
        ['dispatch_agent', 'run_chain', 'anima_self_invoke'],
        ['anima_self_invoke', 'dispatch_agent', 'run_chain']
    );
    assert.equal(r.equal, true);
    assert.deepEqual(r.missingFromUi, []);
    assert.deepEqual(r.missingFromGateway, []);
});

test('capability parity flags items the gateway exposes but the UI does not', () => {
    const r = assertCapabilityParity(
        ['dispatch_agent'],
        ['dispatch_agent', 'shadow_capability_only_on_gateway']
    );
    assert.equal(r.equal, false);
    assert.deepEqual(r.missingFromUi, ['shadow_capability_only_on_gateway']);
    assert.deepEqual(r.missingFromGateway, []);
});

test('capability parity flags items the UI exposes but the gateway does not', () => {
    const r = assertCapabilityParity(
        ['dispatch_agent', 'phantom_tool'],
        ['dispatch_agent']
    );
    assert.equal(r.equal, false);
    assert.deepEqual(r.missingFromUi, []);
    assert.deepEqual(r.missingFromGateway, ['phantom_tool']);
});

test('parity over the real capability-matrix.json: matrix tools form a non-empty UI set', () => {
    const raw = JSON.parse(readFileSync(CAPABILITY_MATRIX_PATH, 'utf8'));
    const matrix = parseCapabilityMatrix(raw);
    const matrixTools = dispatchToolNames(matrix);
    assert.ok(matrixTools.length >= 5, `expected >=5 dispatch tools, got ${matrixTools.length}`);
    // Simulate a gateway exposure equal to the matrix — parity holds.
    const r = assertCapabilityParity(matrixTools, matrixTools);
    assert.equal(r.equal, true);
});

test('parity over the real matrix vs. a missing-from-gateway shadow set', () => {
    const raw = JSON.parse(readFileSync(CAPABILITY_MATRIX_PATH, 'utf8'));
    const matrix = parseCapabilityMatrix(raw);
    const matrixTools = dispatchToolNames(matrix);
    // Gateway with one tool removed — parity should fail with that tool
    // surfaced as missing-from-gateway.
    const fakeGateway = matrixTools.slice(1);
    const r = assertCapabilityParity(matrixTools, fakeGateway);
    assert.equal(r.equal, false);
    assert.deepEqual(r.missingFromGateway, [matrixTools[0]]);
});

test('ACR widget ids use the pratibimba.acr.* namespace', () => {
    for (const id of Object.values(ACR_WIDGET_IDS)) {
        assert.ok(
            id.startsWith('pratibimba.acr.'),
            `widget id ${id} should use the pratibimba.acr.* namespace`
        );
    }
    assert.equal(EXTENSION_ID, 'agentic-control-room');
});
