// Track 27 T27.6 — Review tab human-required gate landing-surface contract tests.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const {
    ReviewPanel,
    aggregateParity,
    applyReviewFilters,
    isOutstanding
} = require('../lib/browser/components/omni/panels/ReviewPanel.js');
const {
    IOD17ParityReadout,
    IOD17ParityStatusBadge
} = require('../lib/browser/components/omni/review/IOD17ParityReadout.js');
const { ReviewActionControls } = require('../lib/browser/components/omni/review/ReviewActionControls.js');
const {
    enforceHumanGate,
    checkReviewGate,
    assertCapabilityParity,
    isCommittalReviewDecision,
    normalizeReviewSessionTabState,
    normalizeReviewItem
} = require('../lib/common/omnipanel-runtime.js');
const {
    patternPacketToBlock,
    reviewItemDeepToBlocks,
    toolStreamEventToBlock
} = require('../lib/common/review-block-projection.js');
// The pure routing gate the ide-shell ReviewPaneWidget consumes — same module,
// proving the two layouts compute an identical human-required gate.
const {
    enforcePiReviewRoutingGate
} = require('@pratibimba/m-extension-runtime/lib/common/recursive-self-review-gate.js');

const __dirname = dirname(fileURLToPath(import.meta.url));

const PARITY_OK = {
    inParity: true,
    capabilityMatrixState: 'in-sync',
    agentContractState: 'in-sync',
    widgetState: 'in-sync'
};

const PARITY_DRIFT = {
    inParity: false,
    capabilityMatrixState: 'route+annotate+defer',
    agentContractState: 'route+annotate',
    widgetState: 'route+annotate+defer+approve',
    drift: ['agentContractState missing approve']
};

function humanRequiredItem(overrides = {}) {
    return {
        id: 'rev-human-1',
        title: 'Promote candidate Form to canon',
        status: 'pending',
        humanRequired: true,
        reviewerRequired: true,
        recursiveSelfReview: false,
        actor: 'anima',
        mediator: 'anima',
        privacyClass: 'public',
        originatingDispatchNodeId: 'node-anima',
        evidencePacketRef: 'pkt-27-6',
        iod17Parity: PARITY_OK,
        depositedAtMs: 1000,
        sessionKey: 'sess-27-6',
        dayNowContext: '13-06-2026::now',
        coordinate: 'M5-3',
        summary: 'Awaiting human final-validation before applied verdict.',
        evidence: {
            packetRef: 'pkt-27-6',
            verdict: 'REVIEW',
            verificationState: 'pending',
            summary: 'evidence summary',
            privacyClass: 'public',
            sourcePaths: ['Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/ReviewPanel.tsx']
        },
        genealogy: {
            originatingNodeId: 'node-anima',
            chain: [
                { id: 'node-pi', label: 'Pi', role: 'root', status: 'completed' },
                { id: 'node-anima', label: 'Anima', role: 'orchestrator', status: 'completed' }
            ]
        },
        history: [],
        ...overrides
    };
}

// ---------------------------------------------------------------------------
// 1. IOD-17 red-banner test with a mismatched fixture.
// ---------------------------------------------------------------------------

test('IOD-17 readout renders a red drift banner for a mismatched parity fixture', () => {
    const drifted = renderToStaticMarkup(
        React.createElement(IOD17ParityReadout, { parity: PARITY_DRIFT })
    );
    assert.match(drifted, /data-test="iod17-parity-drift-banner"/);
    assert.match(drifted, /data-in-parity="false"/);
    assert.match(drifted, /IOD-17 parity drift/);
    assert.match(drifted, /agentContractState missing approve/);
    // Three cells are always present.
    assert.match(drifted, /data-test="iod17-parity-cell-capabilityMatrixState"/);
    assert.match(drifted, /data-test="iod17-parity-cell-agentContractState"/);
    assert.match(drifted, /data-test="iod17-parity-cell-widgetState"/);

    const inParity = renderToStaticMarkup(
        React.createElement(IOD17ParityReadout, { parity: PARITY_OK })
    );
    assert.match(inParity, /data-in-parity="true"/);
    assert.doesNotMatch(inParity, /iod17-parity-drift-banner/);
});

test('IOD-17 header status indicator is green for parity and red for drift', () => {
    const green = renderToStaticMarkup(React.createElement(IOD17ParityStatusBadge, { parity: PARITY_OK }));
    assert.match(green, /data-in-parity="true"/);
    assert.match(green, /IOD-17: parity/);

    const red = renderToStaticMarkup(React.createElement(IOD17ParityStatusBadge, { parity: PARITY_DRIFT }));
    assert.match(red, /data-in-parity="false"/);
    assert.match(red, /IOD-17: drift/);
});

// ---------------------------------------------------------------------------
// 2. Human-gate refuse test (agent approve on humanRequired:true → blocked).
// ---------------------------------------------------------------------------

test('an agent Approve on a human-required item is blocked (gate refuses)', () => {
    const item = humanRequiredItem();

    const agentGate = checkReviewGate(item, 'approve', /* actorIsHuman */ false);
    assert.equal(agentGate.ok, false);
    assert.match(agentGate.reason, /human-gate enforced/);

    const humanGate = checkReviewGate(item, 'approve', /* actorIsHuman */ true);
    assert.equal(humanGate.ok, true);

    // Reject and Revise are likewise committal and blocked for an agent.
    assert.equal(checkReviewGate(item, 'reject', false).ok, false);
    assert.equal(checkReviewGate(item, 'revise', false).ok, false);
});

test('ReviewActionControls disables Approve/Reject/Revise for an agent on a human-required item', () => {
    const html = renderToStaticMarkup(
        React.createElement(ReviewActionControls, {
            item: humanRequiredItem(),
            actorIsHuman: false,
            reviseFormOpen: false,
            annotateDraft: '',
            onDecision: () => {},
            onToggleReviseForm: () => {},
            onAnnotateDraftChange: () => {}
        })
    );
    assert.match(html, /data-test="review-action-approve"[^>]*data-gated="true"/);
    assert.match(html, /disabled=""[^>]*data-test="review-action-approve"/);
    assert.match(html, /data-test="review-action-reject"[^>]*data-gated="true"/);
    assert.match(html, /data-test="review-action-revise"[^>]*data-gated="true"/);
    assert.match(html, /data-test="review-action-human-required-banner"/);
});

test('ReviewActionControls enables committal verdicts for a human reviewer', () => {
    const html = renderToStaticMarkup(
        React.createElement(ReviewActionControls, {
            item: humanRequiredItem(),
            actorIsHuman: true,
            reviseFormOpen: false,
            annotateDraft: '',
            onDecision: () => {},
            onToggleReviseForm: () => {},
            onAnnotateDraftChange: () => {}
        })
    );
    assert.match(html, /data-test="review-action-approve"[^>]*data-gated="false"/);
    assert.doesNotMatch(html, /review-action-human-required-banner/);
});

test('IOD-17 parity drift blocks an applied verdict even for a human reviewer', () => {
    const item = humanRequiredItem({ humanRequired: false, iod17Parity: PARITY_DRIFT });
    const gate = checkReviewGate(item, 'approve', true);
    assert.equal(gate.ok, false);
    assert.equal(gate.parityInSync, false);
    assert.match(gate.reason, /parity drift/);
});

// ---------------------------------------------------------------------------
// 3. Defer-always-allowed test.
// ---------------------------------------------------------------------------

test('Defer and Annotate are always allowed, even for an agent on a human-required item', () => {
    const item = humanRequiredItem();
    assert.equal(checkReviewGate(item, 'defer', false).ok, true);
    assert.equal(checkReviewGate(item, 'annotate', false).ok, true);
    assert.equal(isCommittalReviewDecision('defer'), false);
    assert.equal(isCommittalReviewDecision('annotate'), false);
    assert.equal(isCommittalReviewDecision('approve'), true);

    const html = renderToStaticMarkup(
        React.createElement(ReviewActionControls, {
            item,
            actorIsHuman: false,
            reviseFormOpen: false,
            annotateDraft: '',
            onDecision: () => {},
            onToggleReviseForm: () => {},
            onAnnotateDraftChange: () => {}
        })
    );
    assert.match(html, /data-test="review-action-defer"[^>]*data-gated="false"/);
    assert.match(html, /data-test="review-action-annotate"[^>]*data-gated="false"/);
});

// ---------------------------------------------------------------------------
// 4. Landing-surface render (NO overlay) — inbox + item view + embeds.
// ---------------------------------------------------------------------------

test('ReviewPanel renders the inbox, outstanding count, parity status, and the selected item view', () => {
    const item = humanRequiredItem();
    const html = renderToStaticMarkup(
        React.createElement(ReviewPanel, {
            items: [item, humanRequiredItem({ id: 'rev-2', status: 'approved', humanRequired: false })],
            selectedItem: item,
            history: [
                {
                    id: 'h1',
                    reviewId: 'rev-human-1',
                    fromStatus: null,
                    toStatus: 'pending',
                    decision: 'defer',
                    actor: 'anima',
                    actorIsHuman: false,
                    reason: 'awaiting human',
                    transitionAtMs: 1000
                }
            ],
            actorIsHuman: false,
            nowMs: 4000,
            onSelectItem: () => {},
            onDecision: () => {},
            onAnnotate: () => {}
        })
    );
    assert.match(html, /data-test="review-panel"/);
    assert.match(html, /data-test="review-inbox"[^>]*data-virtualized="true"/);
    assert.match(html, /data-test="review-inbox-row-rev-human-1"/);
    assert.match(html, /data-test="review-outstanding-count"/);
    assert.match(html, /data-test="iod17-parity-status-indicator"/);
    // Item view + the two embeds + action controls + history.
    assert.match(html, /data-test="review-item-view"/);
    assert.match(html, /data-test="review-evidence-embed"[^>]*data-evidence-packet-view="true"/);
    assert.match(html, /data-test="review-dispatch-genealogy-embed"[^>]*data-dispatch-trace-mini-graph="true"/);
    assert.match(html, /data-test="block-host"/);
    assert.match(html, /data-block-type="review-item"/);
    assert.match(html, /data-block-type="evidence"/);
    assert.match(html, /data-block-type="dispatch-genealogy"/);
    assert.match(html, /data-test="review-action-controls"/);
    assert.match(html, /data-test="review-history-list"/);
    assert.match(html, /data-test="review-history-entry-h1"/);
    // Row badges: dispatch node, evidence, reviewer-required, parity, privacy.
    assert.match(html, /data-test="review-row-dispatch-rev-human-1"/);
    assert.match(html, /data-test="review-row-evidence-rev-human-1"/);
    assert.match(html, /data-test="review-row-reviewer-required-rev-human-1"/);
    assert.match(html, /data-test="review-row-parity-rev-human-1"/);
    assert.match(html, /data-test="review-row-privacy-rev-human-1"/);
});

test('ReviewItemDeep, PatternPacket, and tool events project into accepted block-kit blocks', () => {
    const item = humanRequiredItem();
    const reviewBlocks = reviewItemDeepToBlocks(item);
    assert.deepEqual(reviewBlocks.map(block => block.type), [
        'review-item',
        'evidence',
        'dispatch-genealogy'
    ]);
    assert.deepEqual(reviewBlocks.map(block => block.privacyClass), [
        'public',
        'public',
        'public'
    ]);
    assert.equal(reviewBlocks[0].data.id, item.id);
    assert.equal(reviewBlocks[1].data.packetRef, item.evidence.packetRef);
    assert.equal(reviewBlocks[2].data.originatingNodeId, item.genealogy.originatingNodeId);
    assert.deepEqual(reviewBlocks[0].affordances, ['verdict', 'annotate', 'select']);
    assert.deepEqual(reviewBlocks[1].affordances, ['navigate']);
    assert.deepEqual(reviewBlocks[2].affordances, ['navigate']);

    const patternBlock = patternPacketToBlock({
        id: 'pattern-44-3',
        coordinate: "M4'",
        privacyClass: 'protected-local',
        summary: 'packet summary',
        evidenceRefs: ['ev-1'],
        packet: { kind: 'PatternPacket', qActivityDelta: 0.2 }
    });
    assert.equal(patternBlock.type, 'pattern-packet');
    assert.equal(patternBlock.id, 'block:pattern-packet:pattern-44-3');
    assert.equal(patternBlock.data.summary, 'packet summary');
    assert.deepEqual(patternBlock.affordances, ['select', 'navigate']);

    const toolBlock = toolStreamEventToBlock({
        id: 'tool-44-3',
        emittedAtMs: 4403,
        tool: 'gitnexus_impact',
        kind: 'tool.end',
        privacyClass: 'protected',
        actor: 'codex',
        dispatchNodeId: 'node-codex',
        sessionKey: 'sess-44-3',
        tickAtEmit: 10,
        evidencePacketRef: 'evidence-44-3'
    });
    assert.equal(toolBlock.type, 'tool-stream-event');
    assert.equal(toolBlock.data.tool, 'gitnexus_impact');
    assert.equal(toolBlock.provenance.handle, 'tool-44-3');
});

test('aggregateParity reports drift when any item is out of parity', () => {
    assert.equal(aggregateParity([humanRequiredItem()]).inParity, true);
    const drifted = aggregateParity([humanRequiredItem({ iod17Parity: PARITY_DRIFT })]);
    assert.equal(drifted.inParity, false);
    assert.equal(drifted.drift.length, 1);
});

test('applyReviewFilters + isOutstanding scope the inbox', () => {
    const items = [
        humanRequiredItem({ id: 'a', status: 'pending', mediator: 'anima', sessionKey: 's1' }),
        humanRequiredItem({ id: 'b', status: 'approved', mediator: 'sophia', sessionKey: 's2' })
    ];
    assert.equal(applyReviewFilters(items, { outstandingOnly: true }).length, 1);
    assert.equal(applyReviewFilters(items, { mediator: 'sophia' }).length, 1);
    assert.equal(applyReviewFilters(items, { sessionKey: 's1' })[0].id, 'a');
    assert.equal(isOutstanding(items[0]), true);
    assert.equal(isOutstanding(items[1]), false);
});

// ---------------------------------------------------------------------------
// 5. Cross-layout sync with the ide-shell review-pane-widget.
// ---------------------------------------------------------------------------

test('the OmniPanel human-gate matches the s5 routing gate the ide-shell review pane uses', () => {
    const item = humanRequiredItem();
    const cases = [
        { decision: 'approve', actorIsHuman: false, expectOk: false },
        { decision: 'approve', actorIsHuman: true, expectOk: true },
        { decision: 'reject', actorIsHuman: false, expectOk: false },
        { decision: 'defer', actorIsHuman: false, expectOk: true }
    ];
    for (const { decision, actorIsHuman, expectOk } of cases) {
        const ours = enforceHumanGate({
            decision,
            humanRequired: item.humanRequired,
            actorIsHuman,
            recursiveSelfReview: item.recursiveSelfReview,
            actor: item.actor
        });
        const widget = enforcePiReviewRoutingGate({
            decision,
            humanRequired: item.humanRequired,
            actorIsHuman,
            recursiveSelfReview: item.recursiveSelfReview,
            actor: item.actor
        });
        assert.equal(ours.ok, expectOk, `our gate for ${decision}/${actorIsHuman}`);
        assert.equal(widget.ok, expectOk, `widget gate for ${decision}/${actorIsHuman}`);
        assert.equal(ours.ok, widget.ok, `gates agree for ${decision}/${actorIsHuman}`);
    }
});

test('normalizeReviewItem yields a row structurally compatible with the ide-shell ReviewItem', () => {
    const item = normalizeReviewItem({
        id: 'rev-x',
        title: 'shared item',
        status: 'pending',
        humanRequired: true,
        privacyClass: 'protected',
        actor: 'sophia'
    });
    assert.ok(item);
    // The ide-shell ReviewPaneWidget.ReviewItem load-bearing fields.
    for (const key of ['id', 'title', 'status', 'humanRequired', 'privacyClass']) {
        assert.ok(key in item, `missing cross-layout field ${key}`);
    }
    assert.equal(item.humanRequired, true);
});

// ---------------------------------------------------------------------------
// 6. IOD-17 capability parity assertion (matrix ↔ gateway bijection).
// ---------------------------------------------------------------------------

test('assertCapabilityParity flags drift between the matrix and gateway tool sets', () => {
    assert.equal(assertCapabilityParity(['a', 'b'], ['a', 'b']).equal, true);
    const drift = assertCapabilityParity(['a', 'b'], ['a', 'c']);
    assert.equal(drift.equal, false);
    assert.deepEqual([...drift.missingFromUi], ['c']);
    assert.deepEqual([...drift.missingFromGateway], ['b']);
});

// ---------------------------------------------------------------------------
// 7. Durable per-tab state contract for the `review` tab.
// ---------------------------------------------------------------------------

test('normalizeReviewSessionTabState round-trips the review tab contract', () => {
    assert.deepEqual(normalizeReviewSessionTabState(undefined), {
        selectedReviewId: null,
        filters: {},
        scrollOffset: 0,
        reviseFormOpen: false
    });
    assert.deepEqual(
        normalizeReviewSessionTabState({
            selectedReviewId: 'rev-1',
            filters: { mediator: 'anima', outstandingOnly: true },
            scrollOffset: 120,
            reviseFormOpen: true,
            annotateDraft: 'note'
        }),
        {
            selectedReviewId: 'rev-1',
            filters: { mediator: 'anima', outstandingOnly: true },
            scrollOffset: 120,
            reviseFormOpen: true,
            annotateDraft: 'note'
        }
    );
});

// ---------------------------------------------------------------------------
// 8. NO MODAL — the review sub-components carry no overlay affordances.
// ---------------------------------------------------------------------------

test('the omni/review components contain no Dialog/Modal overlay affordances', async () => {
    const reviewDir = join(__dirname, '..', 'src', 'browser', 'components', 'omni', 'review');
    const files = (await readdir(reviewDir)).filter((name) => name.endsWith('.tsx'));
    assert.ok(files.length >= 3, 'expected the three review sub-components');
    for (const name of files) {
        const source = await readFile(join(reviewDir, name), 'utf8');
        assert.doesNotMatch(source, /Dialog|Modal/, `${name} must not use Dialog/Modal overlays`);
    }
});
