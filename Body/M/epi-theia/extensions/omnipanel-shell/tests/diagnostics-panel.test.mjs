// Track 27 T27.8 - Diagnostics telemetry fold tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

if (!globalThis.Element) {
    globalThis.Element = class Element {
        matches() {
            return false;
        }
    };
}
if (!globalThis.document) {
    globalThis.document = {
        createElement: () => new globalThis.Element(),
        querySelectorAll: () => []
    };
}

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const {
    DiagnosticsPanel
} = require('../lib/browser/components/omni/panels/DiagnosticsPanel.js');
const {
    CrossLayoutIntentLog,
    createIntentLogEntry,
    reduceIntentLog
} = require('../lib/browser/components/omni/diagnostics/CrossLayoutIntentLog.js');
const {
    KernelBridgeReadinessSummary,
    summarizeReadinessLedger
} = require('../lib/browser/components/omni/diagnostics/KernelBridgeReadinessSummary.js');
const {
    ProfileTickSubscriptionState
} = require('../lib/browser/components/omni/diagnostics/ProfileTickSubscriptionState.js');

const READY = {
    fetchedAt: Date.parse('2026-06-17T12:00:00.000Z'),
    state: 'ready_public_current',
    reason: 'all bridge fields current',
    profileGeneration: 12,
    bridgeReachable: true,
    blockerIds: []
};

const PROFILE_PENDING = {
    fetchedAt: Date.parse('2026-06-17T12:00:01.000Z'),
    state: 'profile_missing_field',
    reason: 'profile-field pending',
    profileGeneration: 13,
    bridgeReachable: true,
    blockerIds: ['matheme.profile.kleinFlipState', 'matheme.profile.authorityPayload']
};

function intent(index, overrides = {}) {
    return {
        coordinate: `#5.${index}`,
        artifactUri: `file:///tmp/${index}.md`,
        reviewId: index % 2 === 0 ? `review-${index}` : null,
        dayNow: '2026-06-17',
        sessionKey: `session-${index}`,
        profileGeneration: index,
        privacyClass: 'public',
        requestedLayout: index % 2 === 0 ? 'daily-0-1' : 'ide-deep',
        requestedExtensionId: index % 2 === 0 ? 'm5-epii' : 'm0-anuttara',
        requestedContributionId: index % 2 === 0 ? 'review' : 'graph',
        reason: `synthetic intent ${index}`,
        ...overrides
    };
}

test('KernelBridgeReadinessSummary counts every readiness taxonomy state from a ledger fixture', () => {
    const ledger = [
        READY,
        PROFILE_PENDING,
        { ...PROFILE_PENDING, state: 's2_graph_blocked', blockerIds: ['s2.graph_services.ping'] },
        { ...PROFILE_PENDING, state: 'privacy_blocked', blockerIds: ['privacy.redacted'] },
        { ...READY, state: 'degraded_but_readable', reason: 'profile readable with lag' }
    ];
    const summary = summarizeReadinessLedger(ledger);

    assert.equal(summary.ready_public_current.count, 1);
    assert.equal(summary.profile_missing_field.count, 1);
    assert.equal(summary.s2_graph_blocked.count, 1);
    assert.equal(summary.privacy_blocked.count, 1);
    assert.equal(summary.degraded_but_readable.count, 1);
    assert.equal(summary.bridge_unavailable.count, 0);

    const html = renderToStaticMarkup(React.createElement(KernelBridgeReadinessSummary, {
        ledger,
        onDrillDown: () => {}
    }));
    assert.match(html, /data-test="kernel-bridge-readiness-summary"/);
    assert.match(html, /profile_missing_field/);
    assert.match(html, /matheme\.profile\.kleinFlipState/);
});

test('ProfileTickSubscriptionState renders subscriber count, tick history, and lag', () => {
    const html = renderToStaticMarkup(React.createElement(ProfileTickSubscriptionState, {
        subscriberCount: 6,
        tickHistory: [
            { generation: 10, emittedAt: 1000, advanced: true },
            { generation: 11, emittedAt: 1500, advanced: true },
            { generation: 12, emittedAt: 2000, advanced: true }
        ],
        lastTickProcessedAt: 2100,
        laggingSubscribers: [
            { subscriberId: 'review-tab', lagMs: 700 }
        ]
    }));

    assert.match(html, /data-test="profile-tick-subscription-state"/);
    assert.match(html, /subscribers: 6/);
    assert.match(html, /history: 10 -&gt; 11 -&gt; 12/);
    assert.match(html, /ticks\/sec: 2/);
    assert.match(html, /review-tab/);
});

test('CrossLayoutIntentLog keeps the newest 32 envelopes and renders expanded detail', () => {
    let entries = [];
    for (let index = 0; index < 35; index += 1) {
        entries = reduceIntentLog(entries, createIntentLogEntry(intent(index), {
            timestamp: Date.parse(`2026-06-17T12:${String(index).padStart(2, '0')}:00.000Z`),
            status: index % 3 === 0 ? 'failure' : 'success',
            error: index % 3 === 0 ? `failure-${index}` : null
        }));
    }

    assert.equal(entries.length, 32);
    assert.equal(entries[0].intent.coordinate, '#5.3');
    assert.equal(entries[31].intent.coordinate, '#5.34');

    const html = renderToStaticMarkup(React.createElement(CrossLayoutIntentLog, {
        entries,
        expandedEntryId: entries[31].id,
        onToggleEntry: () => {}
    }));
    assert.match(html, /data-test="cross-layout-intent-log"/);
    assert.match(html, /#5\.34/);
    assert.doesNotMatch(html, /#5\.0/);
    assert.match(html, /failure-33/);
    assert.match(html, /requestedExtensionId[\s\S]*m5-epii/);
});

test('DiagnosticsPanel composes readiness, S2, gateway, active layout, profile generation, and intent log telemetry', () => {
    const entries = [
        createIntentLogEntry(intent(1), {
            timestamp: Date.parse('2026-06-17T12:01:00.000Z'),
            status: 'success'
        })
    ];
    const html = renderToStaticMarkup(React.createElement(DiagnosticsPanel, {
        readinessLedger: [READY, PROFILE_PENDING],
        profileGeneration: 13,
        profileTickHistory: [
            { generation: 12, emittedAt: 1000, advanced: true },
            { generation: 13, emittedAt: 2000, advanced: true }
        ],
        subscriberCount: 2,
        lastTickProcessedAt: 2000,
        laggingSubscribers: [],
        pendingProfileFields: [
            {
                fieldName: 'kleinFlipState',
                gatingTranche: '10.x',
                state: 'pending'
            }
        ],
        s2Graph: {
            bimbaReachable: true,
            gnosisReachable: false,
            embeddingDimensions: 3072,
            checkedAt: 2000,
            reason: 'gnosis namespace pending'
        },
        gatewayWebSocket: {
            state: 'disconnected',
            url: 'ws://127.0.0.1:18794',
            lastPingAt: null,
            latencyMs: null,
            reconnectHistory: [
                { timestamp: 1000, state: 'connecting', reason: 'boot' },
                { timestamp: 1500, state: 'disconnected', reason: 'closed' }
            ]
        },
        activeLayout: {
            layoutId: 'daily-0-1',
            dailyToggle: 'personal',
            activeOmniPanelTab: 'diagnostics',
            activeActivityBarMode: '0/1'
        },
        intentLogEntries: entries,
        privacyDropAggregate: {
            byWidget: { review: 2 },
            byClass: { private: 2 },
            total: 2
        }
    }));

    assert.match(html, /data-test="diagnostics-panel"/);
    assert.match(html, /Gateway blocked/);
    assert.match(html, /kernel-bridge-readiness-summary/);
    assert.match(html, /profile-generation-display/);
    assert.match(html, /s2-graph-reachability/);
    assert.match(html, /gateway-websocket-state/);
    assert.match(html, /active-layout-display/);
    assert.match(html, /cross-layout-intent-log/);
    assert.match(html, /GEMINI_EMBED_DIMS=3072/);
});
