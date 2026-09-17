import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const reset = require('../lib/browser/settings/reset-section.js');

const enabledGate = {
    resetEnabled: true,
    enabledSource: 'settings-json-manual',
    nodeEnv: 'development'
};

function renderResetSection(props = {}) {
    return renderToStaticMarkup(
        React.createElement(reset.ResetSection, {
            resetEnabled: true,
            enabledSource: 'settings-json-manual',
            nodeEnv: 'development',
            invokeGatewayRpc: async () => ({ ok: true }),
            setPreference: () => undefined,
            ...props
        })
    );
}

test('reset section is hidden unless reset-enabled is manually enabled', () => {
    assert.equal(reset.RESET_ENABLED_PREFERENCE, 'epi-logos.diagnostics.reset-enabled');
    assert.equal(reset.RESET_ENABLED_DEFAULT, false);

    assert.equal(reset.shouldRenderResetSection({ resetEnabled: false }), false);
    assert.equal(reset.shouldRenderResetSection({ resetEnabled: true, enabledSource: 'cli' }), false);
    assert.equal(reset.shouldRenderResetSection({ resetEnabled: true, enabledSource: 'environment' }), false);
    assert.equal(reset.shouldRenderResetSection({ resetEnabled: true, enabledSource: 'programmatic-api' }), false);
    assert.equal(reset.shouldRenderResetSection(enabledGate), true);

    const html = renderResetSection({ resetEnabled: false });
    assert.equal(html, '');
});

test('typed confirmation is exact before a reset action can enable', () => {
    assert.equal(reset.isConfirmationExact('clear-pasu', reset.CLEAR_PASU_CONFIRMATION), true);
    assert.equal(reset.isConfirmationExact(' clear-pasu', reset.CLEAR_PASU_CONFIRMATION), false);
    assert.equal(reset.isConfirmationExact('CLEAR-PASU', reset.CLEAR_PASU_CONFIRMATION), false);

    const blocked = renderResetSection({
        initialConfirmations: {
            pasu: 'clear-pas',
            onboarding: 'clear-onboarding',
            cache: 'clear-cache'
        }
    });
    assert.match(blocked, /disabled="" aria-disabled="true" data-confirmation-required="clear-pasu"/);
    assert.match(blocked, /data-confirmation-required="clear-onboarding"/);
    assert.match(blocked, /data-confirmation-required="clear-cache"/);

    const allowed = renderResetSection({
        initialConfirmations: {
            pasu: 'clear-pasu',
            onboarding: 'clear-onboarding',
            cache: 'clear-cache'
        }
    });
    assert.match(allowed, /aria-disabled="false" data-confirmation-required="clear-pasu"/);
});

test('production build disables every reset path regardless of preference', () => {
    assert.equal(reset.areResetActionsDisabled({ ...enabledGate, nodeEnv: 'production' }), true);

    const html = renderResetSection({
        nodeEnv: 'production',
        initialConfirmations: {
            pasu: 'clear-pasu',
            onboarding: 'clear-onboarding',
            cache: 'clear-cache'
        }
    });

    assert.equal((html.match(/disabled=""/g) ?? []).length, 3);
    assert.match(html, /data-production-disabled="true"/);
});

test('PASU clear calls gateway RPC and requires backup before delete in the audit payload', async () => {
    const calls = [];
    const result = await reset.runClearPasu(
        {
            invokeGatewayRpc: async (method, params) => {
                calls.push({ method, params });
                return {
                    backupPath: 'Idea/Empty/_backups/PASU-2026-06-11T15-00-00.000Z.md',
                    event: reset.CLEAR_PASU_EVENT,
                    operations: ['backup', 'delete', 'event']
                };
            }
        },
        enabledGate,
        'clear-pasu'
    );

    assert.deepEqual(calls, [
        {
            method: reset.CLEAR_PASU_RPC,
            params: {
                backupPathTemplate: reset.PASU_BACKUP_TEMPLATE,
                requiredEvent: reset.CLEAR_PASU_EVENT,
                auditLaw: 'DR-WC-OB-5'
            }
        }
    ]);
    assert.equal(result.backupPath, 'Idea/Empty/_backups/PASU-2026-06-11T15-00-00.000Z.md');
    assert.throws(
        () => reset.assertPasuBackupBeforeDelete({ operations: ['delete', 'backup'] }),
        /delete before backup/
    );
});

test('clear onboarding state resets all onboarding ledgers to empty arrays', async () => {
    const preferences = new Map();
    const result = await reset.runClearOnboardingState(
        {
            setPreference: (key, value) => preferences.set(key, value)
        },
        enabledGate,
        'clear-onboarding'
    );

    assert.equal(result.path, 'onboarding');
    assert.deepEqual(preferences.get(reset.ONBOARDING_COMPLETED_STEPS_PREFERENCE), []);
    assert.deepEqual(preferences.get(reset.ONBOARDING_PASU_SKIPPED_PREFERENCE), []);
    assert.deepEqual(preferences.get(reset.ONBOARDING_SKIPPED_STEPS_PREFERENCE), []);
});

test('clear local cache preserves vault and preferences and does not request protected-boundary cleanup', async () => {
    const requests = [];
    const result = await reset.runClearLocalCache(
        {
            invokeGatewayRpc: async () => undefined,
            clearLocalCache: request => requests.push(request)
        },
        enabledGate,
        'clear-cache'
    );

    assert.equal(result.path, 'cache');
    assert.deepEqual(requests, [
        {
            cachePath: reset.LOCAL_CACHE_PATH,
            preserveVault: true,
            preservePreferences: true,
            forbiddenOperations: ['git', 'public-bridge-cleanup'],
            auditLaw: 'DR-WC-OB-5'
        }
    ]);
});

test('rendering the section never auto-executes destructive actions', () => {
    const calls = [];
    const html = renderResetSection({
        initialConfirmations: {
            pasu: 'clear-pasu',
            onboarding: 'clear-onboarding',
            cache: 'clear-cache'
        },
        invokeGatewayRpc: async (method, params) => {
            calls.push({ method, params });
            return {};
        },
        setPreference: (key, value) => calls.push({ key, value }),
        clearLocalCache: request => calls.push(request)
    });

    assert.match(html, /DR-WC-OB-5/);
    assert.deepEqual(calls, []);
});
