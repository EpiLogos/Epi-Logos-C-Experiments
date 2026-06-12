// Track 27 T27.5 - Evidence tab landing-surface contract tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const {
    EvidencePanel,
    evidencePacketsFromSnapshot,
    resolveEvidenceDispatchSelection
} = require('../lib/browser/components/omni/panels/EvidencePanel.js');
const {
    normalizeDispatchGenealogy
} = require('../lib/common/dispatch-genealogy.js');
const {
    createOmniPanelDefaultState,
    normalizeOmniPanelSessionState
} = require('../lib/common/omnipanel-session-state.js');

function snapshot() {
    return normalizeDispatchGenealogy({
        sessionKey: 'sess-evidence',
        dispatchGenealogy: {
            id: 'dispatch-genealogy:evidence',
            sessionKey: 'sess-evidence',
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
                    provenance: { sessionKey: 'sess-evidence' },
                    capabilityGates: [],
                    evidenceRef: {
                        id: 'pkt-public',
                        label: 'Public deposition',
                        artifactUri: 'logs://anima/public',
                        sourceAnchor: 'Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/OmniPanel.tsx'
                    },
                    sourceRef: {
                        coordinate: 'M-27.5',
                        sourceAnchor: 'Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/OmniPanel.tsx'
                    }
                }
            ],
            events: [
                {
                    id: 'event-anima',
                    dispatchNodeId: 'node-anima',
                    emittedAtMs: 1050,
                    kind: 'tool.end',
                    tool: 'anima_orchestrate',
                    actor: 'anima',
                    evidencePacketRef: 'pkt-public',
                    privacyClass: 'public',
                    payload: { result: 'ok' }
                }
            ]
        }
    }, null, 1200);
}

function packet(overrides = {}) {
    return {
        id: overrides.id ?? 'pkt-public',
        runId: overrides.runId ?? 'run-27-5',
        taskId: overrides.taskId ?? '27.T27.5',
        mediator: overrides.mediator ?? 'codex',
        verdict: overrides.verdict ?? 'PASS',
        evidence: overrides.evidence ?? ['test-output://omnipanel/evidence'],
        acceptanceCriteria: overrides.acceptanceCriteria ?? ['packet renders'],
        passedCriteria: overrides.passedCriteria ?? ['packet renders'],
        timestamp: overrides.timestamp ?? 1100,
        provenance: overrides.provenance ?? 'ledger',
        dispatchNodeId: overrides.dispatchNodeId ?? 'node-anima',
        actor: overrides.actor ?? 'anima',
        privacyClass: overrides.privacyClass ?? 'public',
        summary: overrides.summary ?? 'Evidence packet landed in the tab surface.',
        confidenceScore: overrides.confidenceScore ?? 0.91,
        artifacts: overrides.artifacts ?? [
            {
                id: 'artifact-test',
                type: 'test-output',
                label: 'test output',
                dispatchNodeId: 'node-anima',
                timestampMs: 1100,
                sizeBytes: 42,
                body: 'visible public body'
            }
        ],
        sourceAnchor: overrides.sourceAnchor ?? 'Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/EvidencePanel.tsx'
    };
}

test('EvidencePanel renders MediatedRunEvidencePacket header, summary, artifacts, cross references, and status', () => {
    const html = renderToStaticMarkup(React.createElement(EvidencePanel, {
        snapshot: snapshot(),
        selectedNodeId: 'node-anima',
        packets: [packet()],
        onActivateDispatchTrace: () => {},
        onOpenSource: () => {}
    }));

    assert.match(html, /MediatedRunEvidencePacket/);
    assert.match(html, /packet pkt-public/);
    assert.match(html, /run run-27-5/);
    assert.match(html, /Evidence packet landed in the tab surface/);
    assert.match(html, /confidence 91%/);
    assert.match(html, /data-test="evidence-artifact-row-artifact-test"/);
    assert.match(html, /data-open-dispatch-node-id="node-anima"/);
    assert.match(html, /Dispatch Trace: node-anima/);
    assert.match(html, /green checkmark verified/);
});

test('Evidence artifact dispatch links resolve to the selected Dispatch Trace node', () => {
    const selection = resolveEvidenceDispatchSelection(snapshot(), 'node-anima');

    assert.ok(selection);
    assert.equal(selection.node.id, 'node-anima');
    assert.equal(selection.evidenceTabPayload.selectedNodeId, 'node-anima');
});

test('protected evidence renders handle metadata only and omits protected body fields', () => {
    const html = renderToStaticMarkup(React.createElement(EvidencePanel, {
        snapshot: snapshot(),
        selectedNodeId: 'node-anima',
        packets: [packet({
            id: 'pkt-protected',
            privacyClass: 'protected',
            artifacts: [
                {
                    id: 'artifact-protected',
                    type: 'log',
                    handle: 'graphiti://protected/m4/local/789',
                    namespace: 'm4.protected-local',
                    summary: 'safe summary',
                    body: 'SECRET-BODY',
                    rawBody: 'SECRET-RAW',
                    protectedBody: 'SECRET-PROTECTED',
                    content: 'SECRET-CONTENT',
                    text: 'SECRET-TEXT',
                    payload: 'SECRET-PAYLOAD'
                }
            ]
        })],
        onActivateDispatchTrace: () => {},
        onOpenSource: () => {}
    }));

    assert.match(html, /graphiti:\/\/protected\/m4\/local\/789/);
    assert.match(html, /safe summary/);
    for (const forbidden of ['rawBody', 'protectedBody', 'SECRET-PAYLOAD']) {
        assert.doesNotMatch(html, new RegExp(forbidden));
    }
    for (const secret of ['SECRET-BODY', 'SECRET-RAW', 'SECRET-PROTECTED', 'SECRET-CONTENT', 'SECRET-TEXT', 'SECRET-PAYLOAD']) {
        assert.doesNotMatch(html, new RegExp(secret));
    }
});

test('private evidence shows a redacted banner and omits private artifact body', () => {
    const html = renderToStaticMarkup(React.createElement(EvidencePanel, {
        snapshot: snapshot(),
        selectedNodeId: 'node-anima',
        packets: [packet({
            id: 'pkt-private',
            privacyClass: 'private',
            artifacts: [{ id: 'artifact-private', type: 'log', body: 'PRIVATE-SECRET' }]
        })],
        onActivateDispatchTrace: () => {},
        onOpenSource: () => {}
    }));

    assert.match(html, /data-test="evidence-private-redacted-banner"/);
    assert.match(html, /private evidence redacted/);
    assert.doesNotMatch(html, /PRIVATE-SECRET/);
});

test('OmniPanel session state persists the evidence tab contract', () => {
    assert.deepEqual(createOmniPanelDefaultState().perTabState.evidence, {
        selectedPacketId: null,
        filters: {},
        scrollOffset: 0,
        depositFormOpen: false
    });

    const normalized = normalizeOmniPanelSessionState({
        perTabState: {
            evidence: {
                selectedPacketId: 'pkt-XYZ',
                filters: { privacyClass: 'protected' },
                scrollOffset: 88,
                depositFormOpen: true,
                depositFormDraft: { artifactUri: 'logs://draft' }
            }
        }
    });

    assert.deepEqual(normalized.perTabState.evidence, {
        selectedPacketId: 'pkt-XYZ',
        filters: { privacyClass: 'protected' },
        scrollOffset: 88,
        depositFormOpen: true,
        depositFormDraft: { artifactUri: 'logs://draft' }
    });
});

test('evidencePacketsFromSnapshot derives packet rows from dispatch evidence refs', () => {
    const models = evidencePacketsFromSnapshot(snapshot());

    assert.equal(models.length, 1);
    assert.equal(models[0].dispatchNodeId, 'node-anima');
    assert.equal(models[0].toolEventIds[0], 'event-anima');
    assert.equal(models[0].verificationState, 'verified');
});
