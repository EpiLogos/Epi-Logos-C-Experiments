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
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
    comparePngToRenderedBaseline,
    decodePngRgba,
    sha256
} from '../scripts/visual-regression-renderer.mjs';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(__dirname, '..', 'fixtures', 'visual-regression');

const { findNamedLayout } = require('../../integrated-composition/lib/common/layout-claim.js');
const { OMNIPANEL_TABS, OMNIPANEL_WIDGET_ID } = require('../../omnipanel-shell/lib/common/omnipanel-types.js');

const CANONICAL_TAB_IDS = OMNIPANEL_TABS.map(tab => tab.id);
const T15_DIFF_THRESHOLD = 0.02;

const FIXTURES = [
    {
        dir: 'integrated-1-2-3',
        pluginId: 'plugin-integrated-1-2-3',
        namedLayoutId: 'cosmic-engine.integrated',
        activeLayout: 'daily-0-1',
        requiredFrames: ['electron-default', 'browser-ci']
    },
    {
        dir: 'integrated-4-5-0',
        pluginId: 'plugin-integrated-4-5-0',
        namedLayoutId: 'jiva-siva.integrated',
        activeLayout: 'ide-deep',
        requiredFrames: ['electron-default', 'browser-ci']
    },
    {
        dir: 'lemniscate-transition',
        fixtureId: 'visual-regression/lemniscate-transition',
        requiredFrames: ['phase-000', 'phase-025', 'phase-050', 'phase-075', 'phase-100']
    },
    {
        dir: 'six-matrix-tick-choreography',
        fixtureId: 'visual-regression/six-matrix-tick-choreography',
        requiredFrames: Array.from({ length: 12 }, (_, tick) => `tick-${String(tick).padStart(2, '0')}`)
    }
];

function readJson(...segments) {
    return JSON.parse(readFileSync(join(FIXTURE_ROOT, ...segments), 'utf8'));
}

function visualFrames(manifest, screenshotManifest) {
    if (Array.isArray(screenshotManifest.frames)) {
        return screenshotManifest.frames;
    }
    return screenshotManifest.screenshots.map(shot => ({
        id: shot.frameId ?? shot.viewport,
        screenshot: shot.file,
        viewport: shot.viewport,
        width: shot.width,
        height: shot.height,
        deviceScaleFactor: shot.deviceScaleFactor,
        captured: shot.captured,
        sha256: shot.sha256,
        tolerance: shot.tolerance
    }));
}

for (const fixture of FIXTURES.filter(entry => entry.pluginId)) {
    test(`${fixture.dir}: manifest matches the canonical composition contract`, () => {
        const manifest = readJson(fixture.dir, 'manifest.json');
        assert.equal(manifest.fixtureId, `visual-regression/${fixture.dir}`);
        assert.equal(manifest.tranche, '15.T15.12');
        assert.equal(manifest.privacyClass, 'protected-local-synthetic-fixture');
        assert.equal(manifest.diffThreshold.pixelRatio, T15_DIFF_THRESHOLD);
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

test('15.12 fixture families have committed PNG baselines within the documented diff threshold', () => {
    for (const fixture of FIXTURES) {
        const manifest = readJson(fixture.dir, 'manifest.json');
        const shots = readJson(fixture.dir, 'screenshots', 'baseline.manifest.json');
        assert.equal(manifest.fixtureId, fixture.fixtureId ?? `visual-regression/${fixture.dir}`);
        assert.equal(manifest.tranche, '15.T15.12');
        assert.equal(manifest.status, 'baseline-committed');
        assert.equal(manifest.privacyClass, 'protected-local-synthetic-fixture');
        assert.equal(manifest.diffThreshold.pixelRatio, T15_DIFF_THRESHOLD);
        assert.equal(shots.diffThreshold.pixelRatio, T15_DIFF_THRESHOLD);

        const frames = visualFrames(manifest, shots);
        assert.deepEqual(frames.map(frame => frame.id), fixture.requiredFrames);

        for (const frame of frames) {
            assert.equal(frame.captured, true, `${fixture.dir}/${frame.id} must be captured`);
            assert.match(frame.screenshot, /\.png$/);
            assert.match(frame.sha256, /^[a-f0-9]{64}$/);

            const screenshotPath = join(FIXTURE_ROOT, fixture.dir, 'screenshots', frame.screenshot);
            assert.ok(existsSync(screenshotPath), `${screenshotPath} must exist`);
            const actualPng = readFileSync(screenshotPath);
            assert.equal(sha256(actualPng), frame.sha256);

            const decoded = decodePngRgba(actualPng);
            assert.equal(decoded.width, frame.width);
            assert.equal(decoded.height, frame.height);

            const diff = comparePngToRenderedBaseline(actualPng, manifest, frame);
            assert.ok(
                diff.pixelRatio <= frame.tolerance.pixelRatio,
                `${fixture.dir}/${frame.id} diff ${diff.pixelRatio} exceeds ${frame.tolerance.pixelRatio}`
            );
            assert.ok(
                diff.pixelRatio <= T15_DIFF_THRESHOLD,
                `${fixture.dir}/${frame.id} diff ${diff.pixelRatio} exceeds tranche threshold`
            );
        }
    }
});

test('15.12 choreography fixture metadata covers the requested transition and six-matrix ticks', () => {
    const lemniscate = readJson('lemniscate-transition', 'manifest.json');
    assert.deepEqual(
        lemniscate.coverage,
        ['15.5 lemniscate transition', '0/1 toggle choreography']
    );
    assert.deepEqual(lemniscate.framePhases, [0, 0.25, 0.5, 0.75, 1]);

    const ticks = readJson('six-matrix-tick-choreography', 'manifest.json');
    assert.deepEqual(
        ticks.coverage,
        ['15.9 six-matrix tick choreography', 'profile-tick visual grammar']
    );
    assert.deepEqual(ticks.matrices, ['M0', 'M1', 'M2', 'M3', 'M4', 'M5']);
    assert.equal(ticks.tickCount, 12);
});

test('15.12 fixture sets are indexed in the README', () => {
    const readme = readFileSync(join(FIXTURE_ROOT, 'README.md'), 'utf8');
    for (const fixture of FIXTURES) {
        assert.ok(readme.includes(`${fixture.dir}/`), `README indexes ${fixture.dir}`);
    }
});
