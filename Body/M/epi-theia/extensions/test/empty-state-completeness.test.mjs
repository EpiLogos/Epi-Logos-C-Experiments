import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { installBrowserShim } from './browser-shim.mjs';

const require = createRequire(import.meta.url);
installBrowserShim('empty-state-completeness-test');
const repoRoot = '/Users/admin/Documents/Epi-Logos C Experiments';
const extensionsRoot = join(repoRoot, 'Body/M/epi-theia/extensions');

const extensions = Object.freeze([
    {
        packageName: '@pratibimba/m0-anuttara',
        extensionId: 'm0-anuttara',
        viewId: 'm0-anuttara.primary',
        dir: 'm0-anuttara',
        exportName: 'M0AnuttaraEmptyStateWidget',
        componentName: 'M0AnuttaraEmptyState',
        title: 'Anuttara waits — the implicate ground.',
        body: 'The language map is not yet populated. The bimba graph is still binding. Onboarding hint: begin a session to thread the first inscription into Anuttara\'s quiet.',
        state: 's2_graph_blocked'
    },
    {
        packageName: '@pratibimba/m1-paramasiva',
        extensionId: 'm1-paramasiva',
        viewId: 'm1-paramasiva.primary',
        dir: 'm1-paramasiva',
        exportName: 'M1ParamasivaEmptyStateWidget',
        componentName: 'M1ParamasivaEmptyState',
        title: 'K² torus rests — profile-tick has not fired.',
        body: 'The played torus comes alive when the first profile-tick advances. Cold-start orchestrator is at step 3.',
        state: 'bridge_unavailable',
        blockerIds: Object.freeze(['cold_start.step.3', 'profile_tick.pending']),
        extra: 'omnipanel.gateway'
    },
    {
        packageName: '@pratibimba/m2-parashakti',
        extensionId: 'm2-parashakti',
        viewId: 'm2-parashakti.primary',
        dir: 'm2-parashakti',
        exportName: 'M2ParashaktiEmptyStateWidget',
        componentName: 'M2ParashaktiEmptyState',
        title: 'Cymatic surface unmodulated — awaiting M1 profile.',
        body: 'M1 → audio_bus → cymatic_field',
        state: 'authority_payload_missing',
        missingDataset: '3 outer planets',
        payloadOwner: 'M2 Parashakti',
        extra: 'pending-dataset'
    },
    {
        packageName: '@pratibimba/m3-mahamaya',
        extensionId: 'm3-mahamaya',
        viewId: 'm3-mahamaya.primary',
        dir: 'm3-mahamaya',
        exportName: 'M3MahamayaEmptyStateWidget',
        componentName: 'M3MahamayaEmptyState',
        title: 'Cosmic clock at noon — awaiting first tick.',
        body: 'The wheel begins to rotate when M1 first advances. 64 codons stand waiting.',
        state: 'bridge_unavailable',
        extra: 'readiness.ledger'
    },
    {
        packageName: '@pratibimba/m4-nara',
        extensionId: 'm4-nara',
        viewId: 'm4-nara.primary',
        dir: 'm4-nara',
        exportName: 'M4NaraEmptyStateWidget',
        componentName: 'M4NaraEmptyState',
        title: 'Day not yet begun.',
        body: 'Today\'s day folder is fresh. No NOW.md, no inscriptions, no oracle. Begin where you are.',
        state: 'privacy_blocked',
        extra: 'Start session'
    },
    {
        packageName: '@pratibimba/m5-epii',
        extensionId: 'm5-epii',
        viewId: 'm5-epii.primary',
        dir: 'm5-epii',
        exportName: 'M5EpiiEmptyStateWidget',
        componentName: 'M5EpiiEmptyState',
        title: 'Atelier quiet.',
        body: 'No pending review. No dispatch in flight. The atelier listens.',
        state: 's5_review_blocked',
        extra: 'dispatch-history-empty'
    }
]);

function snapshot(config) {
    return Object.freeze({
        fetchedAt: Date.UTC(2026, 5, 17, 12, 0, 0),
        state: config.state,
        reason: `blocked readiness for ${config.extensionId}`,
        profileGeneration: null,
        bridgeReachable: config.state !== 'bridge_unavailable',
        blockerIds: Object.freeze([
            `${config.extensionId}.source.pending`,
            `${config.extensionId}.payload.pending`
        ]),
        ...(config.blockerIds ? { blockerIds: config.blockerIds } : {}),
        missingDataset: config.missingDataset,
        payloadOwner: config.payloadOwner,
        privacyClass: config.state === 'privacy_blocked' ? 'protected_local' : undefined
    });
}

function buildPackage(packageName) {
    const result = spawnSync('pnpm', ['--filter', packageName, 'build'], {
        cwd: join(repoRoot, 'Body/M/epi-theia'),
        encoding: 'utf8'
    });
    assert.equal(
        result.status,
        0,
        `${packageName} build failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
    );
}

function sourcePath(config, suffix) {
    return join(extensionsRoot, config.dir, suffix);
}

function assertIncludes(html, expected, label) {
    const encoded = expected
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#x27;');
    assert.ok(
        html.includes(expected) || html.includes(encoded),
        `${label} missing "${expected}" in rendered markup:\n${html}`
    );
}

test('every M-extension declares an empty-state component and registers it in its frontend module', () => {
    for (const config of extensions) {
        const emptyStatePath = sourcePath(config, 'src/browser/empty-state.tsx');
        const frontendModulePath = sourcePath(config, 'src/browser/frontend-module.ts');

        assert.equal(existsSync(emptyStatePath), true, `${config.extensionId} empty-state.tsx is missing`);

        const emptyStateSource = readFileSync(emptyStatePath, 'utf8');
        assert.match(emptyStateSource, new RegExp(`class ${config.exportName} extends ReactWidget`));
        assert.match(emptyStateSource, /MExtensionReadinessSnapshot/);
        assert.match(emptyStateSource, /readinessGrammarOf/);
        assert.match(emptyStateSource, /missing-contributors/);
        assert.match(emptyStateSource, /reasons-table/);

        const frontendModuleSource = readFileSync(frontendModulePath, 'utf8');
        assert.match(frontendModuleSource, /EmptyStateRegistry/);
        assert.match(frontendModuleSource, new RegExp(`register\\([\\s\\S]*extensionId:\\s*EXTENSION_ID[\\s\\S]*viewId:\\s*['"]${config.viewId}['"]`));
        assert.match(frontendModuleSource, new RegExp(config.exportName));
    }
});

test('every M-extension empty state renders its blocked readiness grammar without demo data', () => {
    for (const config of extensions) {
        buildPackage(config.packageName);
        const modulePath = sourcePath(config, 'lib/browser/empty-state.js');
        const moduleExports = require(modulePath);
        const Component = moduleExports[config.componentName];
        const readiness = snapshot(config);
        const html = renderToStaticMarkup(
            React.createElement(Component, {
                snapshot: readiness,
                missingContributors: [`${config.extensionId}.authority`]
            })
        );

        assertIncludes(html, config.title, config.extensionId);
        assertIncludes(html, config.body, config.extensionId);
        assertIncludes(html, `${config.extensionId}.authority`, config.extensionId);
        assertIncludes(html, readiness.reason, config.extensionId);
        assertIncludes(html, readiness.blockerIds[0], config.extensionId);
        assertIncludes(html, `mext-banner-state-${readiness.state}`, config.extensionId);
        assert.doesNotMatch(html, /lorem|demo|placeholder|mock/i);
        if (config.extra) {
            assertIncludes(html, config.extra, config.extensionId);
        }
    }
});
