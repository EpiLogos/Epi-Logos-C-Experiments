// Track 27 T27.11 — OmniPanel durable session-state contract tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
    createOmniPanelDefaultState,
    persistOmniPanelState,
    readOmniPanelState,
    omniPanelStatePath,
    normalizeOmniPanelSessionState
} = require('../lib/common/omnipanel-session-state.js');

test('default OmniPanel session state allocates one object slot per canonical tab', () => {
    const state = createOmniPanelDefaultState();

    assert.equal(state.activeTab, 'pi-chat');
    assert.equal(state.omniState, 'normal');
    assert.equal(state.lastPiChatMessageTimestamp, null);
    assert.deepEqual(Object.keys(state.perTabState), [
        'pi-chat',
        'sessions',
        'dispatch-trace',
        'tool-stream',
        'evidence',
        'review',
        'gateway',
        'diagnostics'
    ]);
    assert.deepEqual(state.perTabState['tool-stream'], {
        filters: {},
        selectedEventId: null,
        scrollOffset: 0,
        live: true
    });
    assert.deepEqual(state.perTabState.evidence, {
        selectedPacketId: null,
        filters: {},
        scrollOffset: 0,
        depositFormOpen: false
    });
});

test('persistOmniPanelState writes and readOmniPanelState restores ~/.epi-logos/ui-state/omnipanel.json', async () => {
    const previousHome = process.env.EPI_LOGOS_HOME;
    const tempHome = await mkdtemp(join(tmpdir(), 'omnipanel-state-'));
    process.env.EPI_LOGOS_HOME = tempHome;

    try {
        const persisted = {
            ...createOmniPanelDefaultState(),
            activeTab: 'evidence',
            omniState: 'fullscreen',
            lastPiChatMessageTimestamp: 1729,
            perTabState: {
                ...createOmniPanelDefaultState().perTabState,
                evidence: {
                    selectedPacketId: 'pkt-XYZ',
                    scrollOffset: 144
                },
                'pi-chat': {
                    draftMessage: 'carry this through the fold'
                }
            }
        };

        await persistOmniPanelState(persisted);

        const statePath = await omniPanelStatePath();
        assert.equal(statePath, join(tempHome, 'ui-state', 'omnipanel.json'));
        assert.match(await readFile(statePath, 'utf8'), /"activeTab": "evidence"/);

        const restored = await readOmniPanelState();
        assert.equal(restored.activeTab, 'evidence');
        assert.equal(restored.omniState, 'fullscreen');
        assert.equal(restored.lastPiChatMessageTimestamp, 1729);
        assert.deepEqual(restored.perTabState.evidence, {
            selectedPacketId: 'pkt-XYZ',
            filters: {},
            scrollOffset: 144,
            depositFormOpen: false
        });
        assert.deepEqual(restored.perTabState['pi-chat'], {
            draftMessage: 'carry this through the fold'
        });
    } finally {
        if (previousHome === undefined) {
            delete process.env.EPI_LOGOS_HOME;
        } else {
            process.env.EPI_LOGOS_HOME = previousHome;
        }
        await rm(tempHome, { recursive: true, force: true });
    }
});

test('readOmniPanelState returns defaults when no durable file exists', async () => {
    const previousHome = process.env.EPI_LOGOS_HOME;
    const tempHome = await mkdtemp(join(tmpdir(), 'omnipanel-empty-'));
    process.env.EPI_LOGOS_HOME = tempHome;

    try {
        assert.deepEqual(await readOmniPanelState(), createOmniPanelDefaultState());
    } finally {
        if (previousHome === undefined) {
            delete process.env.EPI_LOGOS_HOME;
        } else {
            process.env.EPI_LOGOS_HOME = previousHome;
        }
        await rm(tempHome, { recursive: true, force: true });
    }
});

test('normalization keeps tab-owned schemas and upgrades legacy minimal state', () => {
    const normalized = normalizeOmniPanelSessionState({
        activeTab: 'gateway',
        omniState: 'minimal',
        lastPiChatMessageTimestamp: Number.POSITIVE_INFINITY,
        perTabState: {
            gateway: {
                activeSubView: 'skills'
            },
            diagnostics: null
        }
    });

    assert.equal(normalized.activeTab, 'gateway');
    assert.equal(normalized.omniState, 'minimized');
    assert.equal(normalized.lastPiChatMessageTimestamp, null);
        assert.deepEqual(normalized.perTabState.gateway, { activeSubView: 'skills' });
    assert.deepEqual(normalized.perTabState['tool-stream'], {
        filters: {},
        selectedEventId: null,
        scrollOffset: 0,
        live: true
    });
    assert.deepEqual(normalized.perTabState.diagnostics, {});
    assert.deepEqual(normalized.perTabState.review, {});
});
