// Track 29.T29.12 — visual-regression fixture contract.
//
// Validates that the visual-regression baseline fixtures for both integrated
// compositions parse, agree with the canonical named-layout owner map
// (integrated-composition) and the canonical OmniPanel tab set
// (omnipanel-shell), and carry the synthetic-fixture privacy class. The PNG
// bytes are captured by the harness on first green run; this test guards the
// structural contract the bytes must satisfy.
//
// Submodules are required directly (not via the package barrel) because the
// integrated-composition index pulls in browser-only deps — same pattern as
// topology.test.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(__dirname, '..', 'fixtures', 'visual-regression');

const { findNamedLayout } = require('../../integrated-composition/lib/common/layout-claim.js');
const { OMNIPANEL_TABS, OMNIPANEL_WIDGET_ID } = require('../../omnipanel-shell/lib/common/omnipanel-types.js');

const CANONICAL_TAB_IDS = OMNIPANEL_TABS.map(tab => tab.id);

const FIXTURES = [
    {
        dir: 'integrated-1-2-3',
        pluginId: 'plugin-integrated-1-2-3',
        namedLayoutId: 'cosmic-engine.integrated',
        activeLayout: 'daily-0-1'
    },
    {
        dir: 'integrated-4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        namedLayoutId: 'jiva-siva.integrated',
        activeLayout: 'ide-deep'
    }
];

function readJson(...segments) {
    return JSON.parse(readFileSync(join(FIXTURE_ROOT, ...segments), 'utf8'));
}

for (const fixture of FIXTURES) {
    test(`${fixture.dir}: manifest matches the canonical composition contract`, () => {
        const manifest = readJson(fixture.dir, 'manifest.json');
        assert.equal(manifest.fixtureId, `visual-regression/${fixture.dir}`);
        assert.equal(manifest.privacyClass, 'protected-local-synthetic-fixture');
        assert.equal(manifest.composition.pluginId, fixture.pluginId);
        assert.equal(manifest.composition.namedLayoutId, fixture.namedLayoutId);
        assert.equal(manifest.composition.activeLayout, fixture.activeLayout);

        // Owner map must match the canonical named layout (single source of truth).
        const layout = findNamedLayout(fixture.pluginId);
        assert.equal(manifest.layoutOwners['center-stage'], layout.centerStageOwner);
        assert.equal(manifest.layoutOwners['side-panel'], layout.sidePanelOwner);
        assert.equal(manifest.layoutOwners['evidence-panel'], layout.evidencePanelOwner);
        assert.equal(manifest.layoutOwners['audio-bus'], layout.audioBusOwner);
        assert.equal(manifest.layoutOwners['selection'], layout.selectionOwner);
        assert.deepEqual(manifest.layoutOwners['mini-inspector'], [...layout.miniInspectorOwners]);
        assert.deepEqual([...manifest.composition.contributorIds].sort(), [...manifest.composition.contributorIds].sort());

        // OmniPanel must expose exactly the canonical eight tabs in order.
        assert.equal(manifest.omniPanel.widgetId, OMNIPANEL_WIDGET_ID);
        assert.deepEqual(manifest.omniPanel.tabs, CANONICAL_TAB_IDS);
        assert.ok(CANONICAL_TAB_IDS.includes(manifest.omniPanel.activeTab));

        // Every named artifact + baseline has at least one viewport.
        assert.ok(manifest.viewports.length >= 1);
        assert.equal(manifest.baselines.length, manifest.viewports.length);
        for (const baseline of manifest.baselines) {
            assert.ok(manifest.viewports.some(v => v.id === baseline.viewport));
        }
    });

    test(`${fixture.dir}: expected-state agrees with the manifest`, () => {
        const manifest = readJson(fixture.dir, 'manifest.json');
        const state = readJson(fixture.dir, 'expected-state.json');
        assert.equal(state.fixtureId, manifest.fixtureId);
        assert.equal(state.privacyClass, 'protected-local-synthetic-fixture');
        assert.equal(state.activeLayout, fixture.activeLayout);
        assert.equal(state.compositionState.compositionId, fixture.namedLayoutId);
        assert.deepEqual(Object.keys(state.omniPanel.perTabState).sort(), [...CANONICAL_TAB_IDS].sort());
        assert.ok(Array.isArray(state.invariants) && state.invariants.length > 0);
    });

    test(`${fixture.dir}: screenshot baseline manifest names a PNG per viewport`, () => {
        const manifest = readJson(fixture.dir, 'manifest.json');
        const shots = readJson(fixture.dir, 'screenshots', 'baseline.manifest.json');
        assert.equal(shots.fixtureId, manifest.fixtureId);
        assert.equal(shots.screenshots.length, manifest.viewports.length);
        for (const shot of shots.screenshots) {
            assert.match(shot.file, /\.png$/);
            assert.ok(manifest.viewports.some(v => v.id === shot.viewport));
        }
    });

    test(`${fixture.dir}: DOM snapshot pins the owner -> slot skeleton`, () => {
        const layout = findNamedLayout(fixture.pluginId);
        const html = readFileSync(join(FIXTURE_ROOT, fixture.dir, 'dom-snapshot.html'), 'utf8');
        assert.match(html, new RegExp(`data-plugin-id="${fixture.pluginId}"`));
        assert.match(html, new RegExp(`data-active-layout="${fixture.activeLayout}"`));
        assert.match(html, new RegExp(`data-slot="center-stage"[\\s\\S]*?data-owner="${layout.centerStageOwner}"`));
        for (const tabId of CANONICAL_TAB_IDS) {
            assert.match(html, new RegExp(`data-tab="${tabId}"`));
        }
    });
}

test('both compositions have visual-regression fixture sets indexed in the README', () => {
    const readme = readFileSync(join(FIXTURE_ROOT, 'README.md'), 'utf8');
    for (const fixture of FIXTURES) {
        assert.ok(readme.includes(`${fixture.dir}/`), `README indexes ${fixture.dir}`);
    }
});
