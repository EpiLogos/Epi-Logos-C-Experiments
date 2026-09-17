import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    EmptyState,
    LoadingPulse,
    PendingBadge,
    BlockedOverlay,
    ProfileTickInlineBinding,
    ReadinessIndicator,
    blockedOverlayActionFor,
    readinessTooltip,
    readinessIdTokenPath
} = require('../lib/browser/design-primitives/index.js');

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../../..');
const contractPath = path.join(
    repoRoot,
    'Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json'
);
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const readinessTaxonomy = contract.readinessTaxonomy;

function snapshotFor(entry, overrides = {}) {
    return Object.freeze({
        fetchedAt: 3006,
        state: entry.id,
        reason: `synthetic reason for ${entry.id}`,
        profileGeneration: entry.id === 'bridge_unavailable' ? null : 12,
        bridgeReachable: entry.id !== 'bridge_unavailable',
        blockerIds: Object.freeze(entry.severity === 'ready' ? [] : [entry.id]),
        reasons: Object.freeze({
            [entry.id]: Object.freeze({
                reason: `routed reason for ${entry.id}`,
                ownerTrack: entry.ownerTrack
            })
        }),
        ...overrides
    });
}

function renderPrimitiveMatrix(entry) {
    const readiness = snapshotFor(entry);
    return [
        renderToStaticMarkup(
            React.createElement(EmptyState, {
                title: 'No day entries',
                hint: 'Begin by opening the current day.',
                readiness,
                familyLetter: 'm',
                archetype: 4,
                action: React.createElement('button', { type: 'button' }, 'Begin')
            })
        ),
        renderToStaticMarkup(
            React.createElement(LoadingPulse, {
                label: 'Awaiting profile payload',
                readiness,
                tick12: 6
            })
        ),
        renderToStaticMarkup(
            React.createElement(PendingBadge, {
                readiness,
                pendingId: entry.id
            })
        ),
        renderToStaticMarkup(
            React.createElement(BlockedOverlay, {
                readiness
            })
        ),
        renderToStaticMarkup(
            React.createElement(ReadinessIndicator, {
                readiness,
                mode: 'icon'
            })
        )
    ];
}

test('state-grammar primitives render the nine readiness ids across the five primitive surfaces', () => {
    assert.equal(readinessTaxonomy.length, 9);
    let assertionCount = 0;

    for (const entry of readinessTaxonomy) {
        const rendered = renderPrimitiveMatrix(entry);
        for (const html of rendered) {
            assertionCount += 1;
            assert.match(html, new RegExp(`data-readiness-id="${entry.id}"`));
            assert.match(html, new RegExp(`epilogos\\.colour\\.readiness\\.id\\.${entry.id}`));
        }
    }

    assert.equal(assertionCount, 45);
});

test('profile tick inline data binding renders provenance inline for every readiness class', () => {
    const profileTick = Object.freeze({
        generation: 72,
        tick12: 6,
        profile: Object.freeze({
            generation: 72,
            pointerAnchor: 'profile:72',
            capabilities: Object.freeze([]),
            payload: Object.freeze({ tick12: 6 })
        })
    });

    for (const entry of readinessTaxonomy) {
        const html = renderToStaticMarkup(
            React.createElement(
                ProfileTickInlineBinding,
                {
                    bindingKey: `fixture.${entry.id}`,
                    label: `Fixture ${entry.id}`,
                    value: 'stable datum',
                    readiness: snapshotFor(entry),
                    profileTick
                },
                React.createElement('span', null, 'stable datum')
            )
        );
        const provenanceState = entry.severity === 'ready'
            ? 'ready'
            : entry.severity === 'blocked'
                ? 'blocked'
                : 'pending';

        assert.match(html, new RegExp(`data-binding-key="fixture\\.${entry.id}"`));
        assert.match(html, /data-binding-value="stable datum"/);
        assert.match(html, /data-profile-generation="72"/);
        assert.match(html, /data-profile-tick12="6"/);
        assert.match(html, new RegExp(`data-provenance-state="${provenanceState}"`));
        assert.match(html, new RegExp(`data-readiness-id="${entry.id}"`));
        assert.match(html, new RegExp(`epilogos\\.colour\\.readiness\\.id\\.${entry.id}`));
        if (entry.severity === 'blocked') {
            assert.match(html, /epilogos-blocked-overlay/);
        } else if (entry.severity !== 'ready') {
            assert.match(html, /epilogos-pending-badge/);
        } else {
            assert.doesNotMatch(html, /epilogos-blocked-overlay|epilogos-pending-badge/);
        }
    }
});

test('readiness tooltip routes reason text with ownerTrack for every contract id', () => {
    for (const entry of readinessTaxonomy) {
        const tooltip = readinessTooltip(snapshotFor(entry), entry.id);
        assert.match(tooltip, new RegExp(`routed reason for ${entry.id}`));
        assert.match(tooltip, new RegExp(`ownerTrack: ${entry.ownerTrack}`));
    }
});

test('blocked overlay deep-link action maps review blocker to the OmniPanel Review tab', () => {
    const entry = readinessTaxonomy.find(candidate => candidate.id === 's5_review_blocked');
    assert.ok(entry);

    const readiness = snapshotFor(entry);
    const action = blockedOverlayActionFor(readiness);
    const html = renderToStaticMarkup(React.createElement(BlockedOverlay, { readiness }));

    assert.deepEqual(action, {
        label: 'Open Review tab',
        deepLink: 'omnipanel.review',
        command: 'omnipanel.openTab',
        argument: 'review'
    });
    assert.match(html, /data-deep-link="omnipanel\.review"/);
    assert.match(html, /Open Review tab/);
});

test('loading pulse uses profile tick when bridge is reachable and local timer only while bridge_unavailable', () => {
    const readyEntry = readinessTaxonomy.find(candidate => candidate.id === 'ready_public_current');
    const bridgeEntry = readinessTaxonomy.find(candidate => candidate.id === 'bridge_unavailable');
    assert.ok(readyEntry);
    assert.ok(bridgeEntry);

    const profileTickHtml = renderToStaticMarkup(
        React.createElement(LoadingPulse, {
            label: 'Loading from bridge',
            readiness: snapshotFor(readyEntry),
            tick12: 3
        })
    );
    const localTimerHtml = renderToStaticMarkup(
        React.createElement(LoadingPulse, {
            label: 'Loading without bridge',
            readiness: snapshotFor(bridgeEntry),
            tick12: 3
        })
    );

    assert.match(profileTickHtml, /data-pulse-source="profile_tick"/);
    assert.match(profileTickHtml, /data-tick12="3"/);
    assert.doesNotMatch(profileTickHtml, /data-local-period-ms="200"/);
    assert.match(localTimerHtml, /data-pulse-source="local_timer"/);
    assert.match(localTimerHtml, /data-local-period-ms="200"/);
});

test('readiness id token paths are sourced from the 07-t0 readiness ids', () => {
    for (const entry of readinessTaxonomy) {
        assert.equal(readinessIdTokenPath(entry.id), `epilogos.colour.readiness.id.${entry.id}`);
    }
});

test('M-extension browser packages do not reimplement pending badge or blocked overlay primitives locally', () => {
    const extensionRoots = [
        'm0-anuttara',
        'm1-paramasiva',
        'm2-parashakti',
        'm3-mahamaya',
        'm4-nara',
        'm5-epii',
        'plugin-integrated-1-2-3',
        'plugin-integrated-4-5-0'
    ].map(name => path.join(repoRoot, 'Body/M/epi-theia/extensions', name, 'src/browser'));
    const offenders = [];

    for (const root of extensionRoots) {
        if (!fs.existsSync(root)) {
            continue;
        }
        for (const file of walkSourceFiles(root)) {
            const content = fs.readFileSync(file, 'utf8');
            if (/\b(?:const|function)\s+(?:PendingBadge|BlockedOverlay)\b|epilogos-(?:pending-badge|blocked-overlay)/.test(content)) {
                offenders.push(path.relative(repoRoot, file));
            }
        }
    }

    assert.deepEqual(offenders, []);
});

function walkSourceFiles(root) {
    const files = [];
    for (const entry of fs.readdirSync(root)) {
        const full = path.join(root, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            files.push(...walkSourceFiles(full));
        } else if (/\.(?:ts|tsx|js|mjs)$/.test(entry)) {
            files.push(full);
        }
    }
    return files;
}
