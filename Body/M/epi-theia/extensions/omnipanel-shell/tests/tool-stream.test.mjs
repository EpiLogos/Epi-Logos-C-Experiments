// Track 27 T27.4 - Tool Stream tab contract tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const {
    filterToolStreamEvents,
    resolveToolStreamDispatchLink,
    findFirstToolStreamEventForNode
} = require('../lib/browser/components/omni/tool-stream/toolStreamModel.js');
const {
    ToolStreamRenderer
} = require('../lib/browser/components/omni/tool-stream/ToolStreamRenderer.js');
const {
    ToolEventDetail
} = require('../lib/browser/components/omni/tool-stream/ToolEventDetail.js');
const {
    ToolStreamPanel
} = require('../lib/browser/components/omni/panels/ToolStreamPanel.js');
const {
    normalizeDispatchGenealogy
} = require('../lib/common/dispatch-genealogy.js');

function event(overrides = {}) {
    const id = overrides.id ?? 'event-0';
    const index = Number(id.replace(/\D+/g, '')) || 0;
    return {
        id,
        emittedAtMs: 1_800_000 + index * 10,
        actor: overrides.actor ?? 'pi',
        dispatchNodeId: overrides.dispatchNodeId ?? `node-${index}`,
        sessionKey: overrides.sessionKey ?? 'sess-tool-stream',
        tickAtEmit: overrides.tickAtEmit ?? 42,
        tool: overrides.tool ?? 'vak_evaluate',
        kind: overrides.kind ?? 'tool.end',
        privacyClass: overrides.privacyClass ?? 'public',
        args: overrides.args ?? { prompt: `prompt-${index}` },
        result: overrides.result ?? { ok: true, index },
        latencyMs: overrides.latencyMs ?? 12,
        inputDigest: overrides.inputDigest ?? `in-${index}`,
        outputDigest: overrides.outputDigest ?? `out-${index}`,
        evidencePacketRef: overrides.evidencePacketRef ?? `pkt-${index}`
    };
}

test('actor, tool, time-range, event-kind, and privacy filters select real ToolStreamEvent rows', () => {
    const events = [
        event({ id: 'event-1', actor: 'pi', tool: 'vak_evaluate', kind: 'route.start', privacyClass: 'public' }),
        event({ id: 'event-2', actor: 'anima', tool: 'anima_orchestrate', kind: 'tool.end', privacyClass: 'protected' }),
        event({ id: 'event-3', actor: 'moirai', tool: 'dispatch_moirai_night_pass', kind: 'tool.error', privacyClass: 'private' })
    ];

    const filtered = filterToolStreamEvents(events, {
        actor: 'anima',
        toolName: 'orchestrate',
        timeRange: { fromMs: 1_800_015, toMs: 1_800_030 },
        eventKind: 'tool.end',
        privacyClass: 'protected'
    });

    assert.deepEqual(filtered.map(row => row.id), ['event-2']);
});

test('ToolStreamRenderer virtualizes 1000+ events into a bounded first-frame row set', () => {
    const events = Array.from({ length: 1200 }, (_, index) => event({ id: `event-${index}` }));

    const html = renderToStaticMarkup(React.createElement(ToolStreamRenderer, {
        events,
        selectedEventId: null,
        scrollOffset: 0,
        height: 560,
        rowHeight: 56,
        onSelectEvent: () => {}
    }));

    const rowCount = (html.match(/data-test="tool-stream-row-/g) ?? []).length;
    assert.equal(rowCount, 12);
    assert.match(html, /data-test="tool-stream-row-event-0"/);
    assert.match(html, /data-test="tool-stream-row-event-11"/);
    assert.doesNotMatch(html, /data-test="tool-stream-row-event-12"/);
    assert.doesNotMatch(html, /data-test="tool-stream-row-event-500"/);
});

test('Tool Stream events resolve same-event links to Dispatch Trace nodes and reverse lookup', () => {
    const explicitEvent = event({ id: 'event-anima', actor: 'anima', dispatchNodeId: 'node-anima' });
    const snapshot = normalizeDispatchGenealogy({
        sessionKey: 'sess-cross-link',
        dispatchGenealogy: {
            id: 'dispatch-genealogy:cross-link',
            sessionKey: 'sess-cross-link',
            nodes: [
                {
                    id: 'node-anima',
                    parentId: null,
                    role: 'Anima',
                    agentId: 'anima',
                    label: 'Anima',
                    status: 'completed',
                    toolName: 'anima_orchestrate',
                    startedAtMs: 1000,
                    endedAtMs: 1100,
                    capabilityGates: [],
                    provenance: { sessionKey: 'sess-cross-link' }
                }
            ],
            events: [explicitEvent]
        }
    }, null, 1200);
    const events = [explicitEvent];

    const link = resolveToolStreamDispatchLink(events[0], snapshot);
    assert.equal(link?.tabId, 'dispatch-trace');
    assert.equal(link?.selection.node.id, 'node-anima');
    assert.equal(findFirstToolStreamEventForNode(events, 'node-anima')?.id, 'event-anima');

    const html = renderToStaticMarkup(React.createElement(ToolStreamPanel, {
        snapshot,
        selectedNodeId: 'node-anima',
        loading: false,
        error: null,
        onRefresh: () => {},
        onSelectNode: () => {},
        onOpenEvidence: () => {},
        onOpenSource: () => {}
    }));
    assert.match(html, /data-test="tool-stream-row-event-anima"/);
    assert.match(html, /data-dispatch-node-id="node-anima"/);
    assert.match(html, /data-selected="true"/);
});

test('protected ToolEventDetail renders handle metadata only and omits protected body fields', () => {
    const html = renderToStaticMarkup(React.createElement(ToolEventDetail, {
        event: event({
            id: 'event-protected',
            privacyClass: 'protected',
            args: {
                handle: 'graphiti://protected/m4/local/123',
                namespace: 'm4.protected-local',
                privacyClass: 'protected',
                summary: 'safe summary',
                body: 'SECRET-BODY',
                rawBody: 'SECRET-RAW',
                protectedBody: 'SECRET-PROTECTED',
                content: 'SECRET-CONTENT',
                text: 'SECRET-TEXT',
                payload: 'SECRET-PAYLOAD'
            },
            result: {
                handle: 'graphiti://protected/m4/local/456',
                namespace: 'm4.protected-local',
                privacyClass: 'protected',
                summary: 'return summary',
                body: 'RETURN-SECRET'
            }
        }),
        onOpenDispatchTrace: () => {},
        onOpenEvidence: () => {}
    }));

    assert.match(html, /graphiti:\/\/protected\/m4\/local\/123/);
    assert.match(html, /safe summary/);
    for (const forbidden of ['body', 'rawBody', 'protectedBody', 'content', 'text', 'payload']) {
        assert.doesNotMatch(html, new RegExp(forbidden));
    }
    for (const secret of ['SECRET-BODY', 'SECRET-RAW', 'SECRET-PROTECTED', 'SECRET-CONTENT', 'SECRET-TEXT', 'SECRET-PAYLOAD', 'RETURN-SECRET']) {
        assert.doesNotMatch(html, new RegExp(secret));
    }
});
