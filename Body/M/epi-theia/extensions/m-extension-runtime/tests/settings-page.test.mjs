import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const { PreferenceScope } = require('@theia/core/lib/common/preferences/preference-scope');
const schema = require('../lib/common/preferences-schema.js');
const settings = require('../lib/browser/settings/epi-logos-settings-page.js');

test('settings page renders all six Epi-Logos sections', () => {
    const html = renderToStaticMarkup(
        React.createElement(settings.EpiLogosSettingsPage, {
            executeCommand: () => undefined,
            setPreference: () => undefined
        })
    );

    assert.equal(settings.EPI_LOGOS_SETTINGS_SECTIONS.length, 6);
    for (const section of ['layout', 'privacy', 'motion', 'identity', 'diagnostics', 'theming']) {
        assert.match(html, new RegExp(`data-section="${section}"`));
    }
    for (const title of ['Layout', 'Privacy', 'Motion', 'Identity', 'Diagnostics', 'Theming']) {
        assert.match(html, new RegExp(`>${title}<`));
    }
    assert.match(html, /Edit PASU\.md identity/);
    assert.match(html, /Replay onboarding walkthrough/);
    assert.match(html, /Re-run cold-start orchestrator/);
});

test('preference schema declares every required default value', () => {
    const properties = schema.EpiLogosPreferenceSchema.properties;
    const defaults = schema.EPI_LOGOS_PREFERENCE_DEFAULTS;

    assert.equal(Object.keys(properties).length, schema.EPI_LOGOS_PREFERENCE_NAMES.length);
    for (const preferenceName of schema.EPI_LOGOS_PREFERENCE_NAMES) {
        assert.deepEqual(properties[preferenceName].default, defaults[preferenceName], preferenceName);
    }

    assert.equal(defaults['epi-logos.layout.active'], 'daily-0-1');
    assert.equal(defaults['epi-logos.layout.zero-one-default'], '0');
    assert.equal(defaults['epi-logos.omnipanel.first-launch-collapsed'], true);
    assert.equal(defaults['epi-logos.coordinate.first-launch'], '#0');
    assert.equal(defaults['epi-logos.privacy.default-class'], 'protected_local');
    assert.equal(defaults['epi-logos.privacy.kairos-enabled'], false);
    assert.deepEqual(defaults['epi-logos.privacy.public-bridge-opt-in'], []);
    assert.equal(defaults['epi-logos.motion.reduced'], schema.EPI_LOGOS_MOTION_REDUCED_DEFAULT);
    assert.equal(defaults['epi-logos.profile.tick.visible'], true);
    assert.equal(defaults['epi-logos.motion.lemniscate-transition-duration-ms'], 420);
    assert.equal(defaults['epi-logos.motion.xor-ceremony-duration-ms'], 1800);
    assert.equal(defaults['epi-logos.identity.kairos.provider'], 'kerykeion');
    assert.deepEqual(defaults['epi-logos.identity.atlas-sync.consents'], []);
    assert.equal(defaults['epi-logos.diagnostics.readiness.visible'], true);
    assert.equal(defaults['epi-logos.diagnostics.dispatch.trace.verbosity'], 'info');
    assert.deepEqual(defaults['epi-logos.diagnostics.cold-start-state'], []);
    assert.equal(defaults['epi-logos.diagnostics.reset-enabled'], false);
    assert.equal(defaults['epi-logos.theming.mode'], 'auto');
    assert.deepEqual(defaults['epi-logos.theming.family-tier.palette'], {
        p: true,
        s: true,
        t: true,
        m: true,
        l: true,
        c: true
    });
});

test('preference schema scopes match User vs Workspace contract', () => {
    const workspacePreferences = new Set([
        'epi-logos.diagnostics.readiness.visible',
        'epi-logos.diagnostics.dispatch.trace.verbosity',
        'epi-logos.diagnostics.cold-start-state',
        'epi-logos.diagnostics.reset-enabled'
    ]);

    for (const preferenceName of schema.EPI_LOGOS_PREFERENCE_NAMES) {
        const expectedScope = workspacePreferences.has(preferenceName)
            ? PreferenceScope.Workspace
            : PreferenceScope.User;
        assert.equal(schema.getEpiLogosPreferenceScope(preferenceName), expectedScope, preferenceName);
        assert.equal(schema.EpiLogosPreferenceSchema.properties[preferenceName].scope, expectedScope, preferenceName);
    }

    for (const section of settings.EPI_LOGOS_SETTINGS_SECTIONS) {
        const expectedScope = section.id === 'diagnostics' ? PreferenceScope.Workspace : PreferenceScope.User;
        assert.equal(section.scope, expectedScope, section.id);
    }
});

test('read-only preference rows are display-only in schema and render output controls', () => {
    for (const preferenceName of [
        'epi-logos.privacy.public-bridge-opt-in',
        'epi-logos.identity.atlas-sync.consents',
        'epi-logos.diagnostics.cold-start-state'
    ]) {
        assert.equal(settings.isReadonlyPreference(preferenceName), true, preferenceName);
    }

    const html = renderToStaticMarkup(React.createElement(settings.EpiLogosSettingsPage));
    assert.match(html, /data-readonly="true"/);
    assert.match(html, /Public bridge opt-in handles/);
    assert.match(html, /Atlas sync consents/);
    assert.match(html, /Cold-start completed stages/);
});

test('settings actions dispatch the real command ids and edit-mode PASU payload', () => {
    const calls = [];
    settings.editPasuIdentity((command, ...args) => calls.push({ command, args }));
    settings.replayOnboardingWalkthrough((command, ...args) => calls.push({ command, args }));
    settings.rerunColdStartOrchestrator({
        executeCommand: (command, ...args) => calls.push({ command, args })
    });

    assert.deepEqual(calls, [
        {
            command: settings.OPEN_PASU_WIZARD_COMMAND,
            args: [{ mode: 'edit' }]
        },
        {
            command: settings.OPEN_WALKTHROUGH_COMMAND,
            args: []
        },
        {
            command: settings.RERUN_COLD_START_ORCHESTRATOR_COMMAND,
            args: []
        }
    ]);
});

test('frontend module registers the Epi-Logos PreferenceContribution', () => {
    const source = readFileSync(
        new URL('../src/browser/frontend-module.ts', import.meta.url),
        'utf8'
    );
    assert.match(source, /PreferenceContribution/);
    assert.match(source, /EpiLogosSettingsPreferenceContribution/);
    assert.match(source, /bind\(PreferenceContribution\)\.toService\(EpiLogosSettingsPreferenceContribution\)/);

    const contribution = new settings.EpiLogosSettingsPreferenceContribution();
    assert.equal(contribution.schema, schema.EpiLogosPreferenceSchema);
});

test('source grep anchors stay discoverable for tranche verification', () => {
    const source = readFileSync(
        new URL('../src/browser/settings/epi-logos-settings-page.tsx', import.meta.url),
        'utf8'
    );
    assert.match(source, /EpiLogosSettingsPreferenceContribution/);

    const common = readFileSync(
        new URL('../src/common/preferences-schema.ts', import.meta.url),
        'utf8'
    );
    assert.match(common, /EpiLogosPreferenceSchema/);
});
