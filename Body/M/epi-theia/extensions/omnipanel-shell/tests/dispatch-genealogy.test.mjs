// Track 15 T15.11 — Dispatch genealogy tab contract tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const {
    normalizeDispatchGenealogy,
    flattenDispatchGenealogyEvents,
    selectDispatchGenealogyNode
} = require('../lib/common/dispatch-genealogy.js');
const {
    DispatchTracePanel
} = require('../lib/browser/components/omni/panels/DispatchTracePanel.js');
const {
    ToolStreamPanel
} = require('../lib/browser/components/omni/panels/ToolStreamPanel.js');

function syntheticPiAnimaMoiraiDispatch() {
    return {
        sessionKey: 'sess-pi-anima-moirai',
        dispatchGenealogy: {
            id: 'dispatch-genealogy:test-moirai',
            sessionKey: 'sess-pi-anima-moirai',
            nodes: [
                {
                    id: 'node-pi',
                    parentId: null,
                    role: 'Pi',
                    agentId: 'pi',
                    label: 'Pi',
                    status: 'completed',
                    toolName: 'vak_evaluate',
                    startedAtMs: 1000,
                    endedAtMs: 1100,
                    capabilityGates: [
                        { id: 'vak-address', label: 'VAK address', status: 'allowed' }
                    ],
                    provenance: { sessionKey: 'sess-pi-anima-moirai', dayId: '2026-06-11' },
                    evidenceRef: { id: 'ev-pi', coordinate: 'S4', sourceAnchor: 'Body/S/S4/ta-onta' },
                    sourceRef: { coordinate: 'S4', sourceAnchor: 'Body/S/S4/ta-onta' }
                },
                {
                    id: 'node-anima',
                    parentId: 'node-pi',
                    role: 'Anima',
                    agentId: 'anima',
                    label: 'Anima',
                    status: 'completed',
                    toolName: 'anima_orchestrate',
                    startedAtMs: 1110,
                    endedAtMs: 1200,
                    capabilityGates: [
                        { id: 'capability-matrix', label: 'Capability matrix', status: 'allowed' }
                    ],
                    provenance: { sessionKey: 'sess-pi-anima-moirai', teamRole: 'anima' },
                    evidenceRef: { id: 'ev-anima', coordinate: 'S4-4p', sourceAnchor: 'Body/S/S4/ta-onta/S4-4p-anima' },
                    sourceRef: { coordinate: 'S4-4p', sourceAnchor: 'Body/S/S4/ta-onta/S4-4p-anima' }
                },
                {
                    id: 'node-moirai',
                    parentId: 'node-anima',
                    role: 'Moirai',
                    agentId: 'moirai',
                    label: 'Moirai',
                    status: 'completed',
                    toolName: 'dispatch_moirai_night_pass',
                    startedAtMs: 1210,
                    endedAtMs: 1400,
                    capabilityGates: [
                        { id: 'night-pass', label: "Night' pass", status: 'required' }
                    ],
                    provenance: { sessionKey: 'sess-pi-anima-moirai', orchestrationKind: 'dispatch_moirai_night_pass' },
                    evidenceRef: {
                        id: 'ev-moirai',
                        coordinate: 'S4-5p',
                        artifactUri: 'evidence://moirai/night-pass',
                        sourceAnchor: 'Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts'
                    },
                    sourceRef: {
                        coordinate: 'S4-5p',
                        sourceAnchor: 'Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts'
                    }
                }
            ],
            events: [
                {
                    id: 'event-moirai',
                    nodeId: 'node-moirai',
                    emittedAtMs: 1210,
                    kind: 'tool.end',
                    tool: 'dispatch_moirai_night_pass',
                    label: 'Moirai dispatch completed',
                    status: 'completed'
                },
                {
                    id: 'event-pi',
                    nodeId: 'node-pi',
                    emittedAtMs: 1000,
                    kind: 'route.start',
                    tool: 'vak_evaluate',
                    label: 'Pi VAK gate',
                    status: 'completed'
                },
                {
                    id: 'event-anima',
                    nodeId: 'node-anima',
                    emittedAtMs: 1110,
                    kind: 'tool.end',
                    tool: 'anima_orchestrate',
                    label: 'Anima route selected',
                    status: 'completed'
                }
            ]
        }
    };
}

test('synthetic Pi -> Anima -> Moirai dispatch renders in Trace and Stream with consistent ids', () => {
    const snapshot = normalizeDispatchGenealogy(syntheticPiAnimaMoiraiDispatch(), null, 1500);

    assert.equal(snapshot.rootIds[0], 'node-pi');
    assert.equal(snapshot.nodes[0].children[0].id, 'node-anima');
    assert.equal(snapshot.nodes[0].children[0].children[0].id, 'node-moirai');
    assert.deepEqual(flattenDispatchGenealogyEvents(snapshot).map((event) => event.id), [
        'event-pi',
        'event-anima',
        'event-moirai'
    ]);

    const callbacks = {
        onRefresh: () => {},
        onSelectNode: () => {},
        onOpenEvidence: () => {},
        onOpenSource: () => {},
    };
    const traceHtml = renderToStaticMarkup(React.createElement(DispatchTracePanel, {
        snapshot,
        selectedNodeId: 'node-moirai',
        loading: false,
        error: null,
        ...callbacks
    }));
    const streamHtml = renderToStaticMarkup(React.createElement(ToolStreamPanel, {
        snapshot,
        selectedNodeId: 'node-moirai',
        loading: false,
        error: null,
        ...callbacks
    }));

    assert.match(traceHtml, /data-test="dispatch-genealogy-node-node-pi"/);
    assert.match(traceHtml, /data-test="dispatch-genealogy-node-node-anima"/);
    assert.match(traceHtml, /data-test="dispatch-genealogy-node-node-moirai"/);
    assert.match(streamHtml, /data-test="dispatch-genealogy-event-event-pi"/);
    assert.match(streamHtml, /data-test="dispatch-genealogy-event-event-anima"/);
    assert.match(streamHtml, /data-test="dispatch-genealogy-event-event-moirai"/);
});

test('Trace selection deep-links to Evidence and Backend Studio source payloads', () => {
    const snapshot = normalizeDispatchGenealogy(syntheticPiAnimaMoiraiDispatch(), null, 1500);
    const selection = selectDispatchGenealogyNode(snapshot, 'node-moirai');

    assert.ok(selection);
    assert.equal(selection.evidenceTabPayload.selectedEvidenceId, 'ev-moirai');
    assert.equal(selection.evidenceTabPayload.selectedNodeId, 'node-moirai');
    assert.deepEqual(selection.sourceCommand, {
        coordinate: 'S4-5p',
        sourceAnchor: 'Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts',
        label: null
    });
});
