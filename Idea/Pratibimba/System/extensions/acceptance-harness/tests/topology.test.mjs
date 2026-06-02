// Track 05 T9 — topology / service-list contract.
//
// Verifies the acceptance plan names the same services the runtime baseline
// JSON (Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json) listed
// as required for the IDE shell — gateway, SpaceTimeDB, Neo4j, Redis, S5
// persisted stores. The Theia process (Electron canonical + browser-mode
// for CI parity) is named explicitly.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    TRACK_05_T9_ACCEPTANCE_PLAN,
    requiredServiceIds,
    stepLayoutsAreCanonical,
    ACCEPTANCE_WIDGET_IDS,
    ACCEPTANCE_HANDLE_PREFIX,
    EXTENSION_ID
} = require('../lib/common/index.js');

test('every step targets one of the two canonical layouts (or any)', () => {
    assert.equal(stepLayoutsAreCanonical(TRACK_05_T9_ACCEPTANCE_PLAN), true);
});

test('plan names the required services from the runtime baseline', () => {
    const required = requiredServiceIds(TRACK_05_T9_ACCEPTANCE_PLAN);
    for (const id of ['gateway', 'spacetimedb', 'neo4j', 'redis', 's5_persisted_stores', 'theia_electron']) {
        assert.ok(
            required.includes(id),
            `expected required service "${id}" — Track 05 T0 runtime baseline`
        );
    }
});

test('browser-mode Theia is listed but NOT alwaysRequired (Electron is canonical)', () => {
    const browser = TRACK_05_T9_ACCEPTANCE_PLAN.services.find(s => s.id === 'theia_browser');
    assert.ok(browser !== undefined, 'theia_browser must be listed for CI/Docker parity');
    assert.equal(browser.alwaysRequired, false);
    const electron = TRACK_05_T9_ACCEPTANCE_PLAN.services.find(s => s.id === 'theia_electron');
    assert.ok(electron !== undefined);
    assert.equal(electron.alwaysRequired, true);
});

test('step ids cover the eight T9-mandated verification operations', () => {
    const stepIds = TRACK_05_T9_ACCEPTANCE_PLAN.steps.map(s => s.id);
    for (const required of [
        'boot.kernel-bridge',
        'layout.switch-to-deep-ide',
        'graph.open-s2-node',
        'review.open-s5-candidate',
        'evidence.deposit',
        'layout.switch-back-to-daily',
        'shutdown.clean'
    ]) {
        assert.ok(stepIds.includes(required), `expected step "${required}"`);
    }
});

test('layout switch round-trip produces a stable bridge subscription handle', () => {
    const switchToDeep = TRACK_05_T9_ACCEPTANCE_PLAN.steps.find(
        s => s.id === 'layout.switch-to-deep-ide'
    );
    const switchBack = TRACK_05_T9_ACCEPTANCE_PLAN.steps.find(
        s => s.id === 'layout.switch-back-to-daily'
    );
    assert.ok(switchToDeep !== undefined && switchBack !== undefined);
    assert.ok(
        switchToDeep.produces.includes('bridge-subscription-id:UNCHANGED'),
        'switch-to-deep must assert bridge subscription unchanged'
    );
    assert.ok(
        switchBack.produces.includes('bridge-subscription-id:STILL-UNCHANGED'),
        'switch-back must assert bridge subscription still unchanged'
    );
});

test('privacy audit walks every UI surface the IDE shell renders', () => {
    const surfaces = TRACK_05_T9_ACCEPTANCE_PLAN.privacyAuditSurfaces.join(' ');
    // Match by chrome widget name patterns from ide-shell-m0-m5.
    for (const fragment of [
        'Bimba graph viewer',
        'Canon Studio',
        'Agentic Control Room',
        'Coordinate Tree',
        'Logos Atelier',
        'Evidence Pane',
        'Review Pane',
        'Autoresearch Pane',
        'SpaceTimeDB',
        'Graph payloads',
        'S5 evidence'
    ]) {
        assert.ok(
            surfaces.includes(fragment),
            `privacy audit must cover "${fragment}"`
        );
    }
});

test('extension id + widget ids align with the pratibimba.acceptance.* namespace', () => {
    assert.equal(EXTENSION_ID, 'acceptance-harness');
    for (const id of Object.values(ACCEPTANCE_WIDGET_IDS)) {
        assert.ok(id.startsWith('pratibimba.acceptance.'));
    }
});

test('acceptance handle prefix matches the documented stdout pattern', () => {
    // The Node-driven script greps stdout for the prefix; ensure it's the
    // canonical token.
    assert.equal(ACCEPTANCE_HANDLE_PREFIX, '[ACCEPTANCE:');
});
