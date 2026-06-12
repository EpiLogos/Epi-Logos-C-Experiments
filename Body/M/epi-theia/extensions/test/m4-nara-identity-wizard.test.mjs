// Task 32.2 — PASU-absence detection orchestration suite. Proves:
//
//   (1) `nara.pasu.show` response interpretation (present / not-found /
//       natal-chart-missing) across the common gateway shapes.
//   (2) The pre-stage-6 identity gate: PASU-absent suspends stage 6 and fires
//       the wizard command; PASU-found resumes straight to stage 6 without the
//       wizard; an unavailable probe advances on the FR-3 stub.
//   (3) Skip / completion resume semantics — full skip records
//       `epi-logos.onboarding.pasu-skipped: ['wizard']` and resumes with the
//       FR-3 stub; completion resumes with fresh PASU.
//   (4) The 25.4 wizard-launcher seam and the React launch notice.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const wiz = require('../m4-nara/lib/browser/onboarding/identity-wizard.js');

const flush = () => new Promise(resolve => setImmediate(resolve));

test('commands and preference keys are wired to the canonical names', () => {
    assert.equal(wiz.PASU_SHOW_RPC, 'nara.pasu.show');
    assert.equal(wiz.OPEN_PASU_WIZARD_COMMAND, 'm4.openPasuWizard');
    assert.equal(wiz.PASU_SKIPPED_PREFERENCE, 'epi-logos.onboarding.pasu-skipped');
    assert.equal(wiz.PASU_WIZARD_SKIP_TOKEN, 'wizard');
});

test('interpretPasuShowResponse maps the common gateway shapes', () => {
    // not-found shapes
    assert.equal(wiz.interpretPasuShowResponse(undefined), 'not-found');
    assert.equal(wiz.interpretPasuShowResponse(null), 'not-found');
    assert.equal(wiz.interpretPasuShowResponse('not_found'), 'not-found');
    assert.equal(wiz.interpretPasuShowResponse({ status: 'not_found' }), 'not-found');
    assert.equal(wiz.interpretPasuShowResponse({ found: false }), 'not-found');

    // present — PASU object carrying a natal-chart path (any of the aliases)
    assert.equal(
        wiz.interpretPasuShowResponse({ c_0_natal_chart_path: 'Idea/.../natal.json' }),
        'present'
    );
    assert.equal(
        wiz.interpretPasuShowResponse({ pasu: { natal_chart_path: '/x.json' } }),
        'present'
    );

    // natal-chart-missing — PASU exists but no chart path
    assert.equal(
        wiz.interpretPasuShowResponse({ found: true, c_0_birth_date: '1997-01-01' }),
        'natal-chart-missing'
    );
    assert.equal(
        wiz.interpretPasuShowResponse({ pasu: { c_0_natal_chart_path: '   ' } }),
        'natal-chart-missing'
    );
});

test('runPasuAbsenceCheck resolves an unavailable probe instead of throwing', async () => {
    const presence = await wiz.runPasuAbsenceCheck({
        invokeGatewayRpc: async () => {
            throw new Error('gateway down');
        }
    });
    assert.equal(presence, 'unavailable');
});

test('PASU-found resumes stage 6 directly and never opens the wizard', async () => {
    const calls = { rpc: [], resume: [], suspend: 0, wizard: [] };
    const gate = wiz.createPasuIdentityGate({
        invokeGatewayRpc: async (method, params) => {
            calls.rpc.push({ method, params });
            return { c_0_natal_chart_path: '/natal.json' };
        },
        suspendStage6: () => { calls.suspend += 1; },
        resumeStage6: mode => calls.resume.push(mode),
        openWizard: mode => calls.wizard.push(mode)
    });

    gate();
    await flush();

    // The probe fired exactly once against nara.pasu.show…
    assert.deepEqual(calls.rpc, [{ method: 'nara.pasu.show', params: { reason: 'cold-start-stage-5' } }]);
    // …stage 6 was held synchronously, then resumed as PASU-present…
    assert.equal(calls.suspend, 1);
    assert.deepEqual(calls.resume, ['pasu-present']);
    // …and the wizard never opened.
    assert.deepEqual(calls.wizard, []);
});

test('PASU-absent suspends stage 6 and fires the wizard command (no resume)', async () => {
    const calls = { resume: [], suspend: 0, wizard: [] };
    const gate = wiz.createPasuIdentityGate({
        invokeGatewayRpc: async () => 'not_found',
        suspendStage6: () => { calls.suspend += 1; },
        resumeStage6: mode => calls.resume.push(mode),
        openWizard: mode => calls.wizard.push(mode)
    });

    gate();
    await flush();

    assert.equal(calls.suspend, 1);
    assert.deepEqual(calls.wizard, ['full']);
    // Stage 6 stays suspended — only skip/complete resumes it.
    assert.deepEqual(calls.resume, []);
});

test('PASU present-but-natal-chart-missing opens the wizard in natal-chart-only mode', async () => {
    const calls = { wizard: [], resume: [] };
    const gate = wiz.createPasuIdentityGate({
        invokeGatewayRpc: async () => ({ found: true, c_2_jungian: 'INFJ' }),
        suspendStage6: () => undefined,
        resumeStage6: mode => calls.resume.push(mode),
        openWizard: mode => calls.wizard.push(mode)
    });

    gate();
    await flush();

    assert.deepEqual(calls.wizard, ['natal-chart-only']);
    assert.deepEqual(calls.resume, []);
});

test('an unavailable probe advances stage 6 on the FR-3 stub', async () => {
    const calls = { resume: [], wizard: [] };
    const gate = wiz.createPasuIdentityGate({
        invokeGatewayRpc: async () => { throw new Error('down'); },
        suspendStage6: () => undefined,
        resumeStage6: mode => calls.resume.push(mode),
        openWizard: mode => calls.wizard.push(mode)
    });

    gate();
    await flush();

    assert.deepEqual(calls.resume, ['fr3-stub']);
    assert.deepEqual(calls.wizard, []);
});

test('full-wizard skip records the ledger token and resumes with the FR-3 stub', async () => {
    const prefs = new Map();
    const resumed = [];
    const result = await wiz.runPasuWizardSkip({
        setPreference: (key, value) => prefs.set(key, value),
        getSkippedSteps: () => [],
        resumeStage6: mode => resumed.push(mode)
    });

    assert.equal(result.outcome, 'skipped');
    assert.deepEqual(prefs.get(wiz.PASU_SKIPPED_PREFERENCE), ['wizard']);
    assert.deepEqual(resumed, ['fr3-stub']);
});

test('skip de-duplicates the wizard token against an existing ledger', async () => {
    const prefs = new Map();
    await wiz.runPasuWizardSkip({
        setPreference: (key, value) => prefs.set(key, value),
        getSkippedSteps: () => ['wizard'],
        resumeStage6: () => undefined
    });
    assert.deepEqual(prefs.get(wiz.PASU_SKIPPED_PREFERENCE), ['wizard']);
});

test('wizard completion resumes stage 6 with fresh PASU data', async () => {
    const resumed = [];
    const result = await wiz.runPasuWizardComplete({
        setPreference: () => undefined,
        resumeStage6: mode => resumed.push(mode)
    });
    assert.equal(result.outcome, 'completed');
    assert.deepEqual(resumed, ['fresh-pasu']);
});

test('the 25.4 launcher seam reports presence and consumes the launch context', () => {
    assert.equal(wiz.hasPasuWizardLauncher(), false);
    // No launcher → launch returns false so the caller can FR-3 stub.
    assert.equal(wiz.launchPasuWizard({ mode: 'full', skip: async () => {}, complete: async () => {} }), false);

    const seen = [];
    const disposer = wiz.setPasuWizardLauncher(ctx => seen.push(ctx.mode));
    assert.equal(wiz.hasPasuWizardLauncher(), true);
    assert.equal(wiz.launchPasuWizard({ mode: 'natal-chart-only', skip: async () => {}, complete: async () => {} }), true);
    assert.deepEqual(seen, ['natal-chart-only']);

    disposer.dispose();
    assert.equal(wiz.hasPasuWizardLauncher(), false);
});

test('the launch notice narrates each wizard mode', () => {
    const full = renderToStaticMarkup(React.createElement(wiz.PasuWizardLaunchNotice, { mode: 'full' }));
    assert.match(full, /Setting up your PASU identity profile/);
    assert.match(full, /data-mode="full"/);

    const natal = renderToStaticMarkup(React.createElement(wiz.PasuWizardLaunchNotice, { mode: 'natal-chart-only' }));
    assert.match(natal, /opening the natal-chart step/);
});
