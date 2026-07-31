/**
 * Coordinate: M' M5' chrome (ACR deep pane render proof — 28.T28.5)
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Actualises: what the deep control room really renders over the three live
 *   reads it makes, and — as importantly — what it refuses to render. Every
 *   gateway answer here is the REAL wire shape (`ReviewInbox`, the S4 capability
 *   projection, `sessions.list`), so an assertion that passes here is an
 *   assertion about the contract, not about a convenient fixture.
 * Does NOT own: the pure law (`acrGovernance.test.ts`), the deep mount
 *   (`ui/deepPaneSet.test.ts`), or the through-the-switch proof
 *   (`tests/e2e/agentic-control-room-deep.spec.ts`).
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../../bridge/types';
import { useProvenanceStore } from '../../state/stores';
import {
    S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    S4_MEDIATION_ROUTE_METHOD
} from '../omni/omnipanelCapabilities';
import { DEPOSIT_LIST_METHOD } from '../omni/evidence/evidenceDeposits';
import {
    hydrateOmniPanelSessionState,
    readOmniPanelSessionState
} from '../omni/omnipanelSessionState';
import { useSessionStore } from '../../state/stores';
import { AgenticControlRoomPane } from './AgenticControlRoomPane';
import { REVIEW_INBOX_METHOD, REVIEW_RESOLVE_METHOD } from './acrReviewInbox';

const CAPABILITY_SNAPSHOT = {
    owner: "S4'",
    method: S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    routesThrough: S4_MEDIATION_ROUTE_METHOD,
    dispatchTools: ['dispatch_agent'],
    aletheiaModeInternalTools: ['dispatch_moirai_night_pass'],
    capabilities: [
        { name: 'dispatch_agent', entitlementClass: 'standard' },
        { name: 'dispatch_moirai_night_pass', entitlementClass: 'aletheia-mode-internal' }
    ]
};

/** The real `ReviewInbox` DTO shape (S5 `epii-review-core`). */
const GATED_ITEM = {
    item_id: 'rev-1',
    source: 'human_gate',
    title: 'Promote the Q articulation at M5-4',
    body: 'body',
    priority: 'blocking',
    status: 'open',
    coordinate_context: { coordinate: 'M5-4' },
    requires_human: true,
    created_at: 1700000000000
};

/** Two real subagent sessions under one Pi parent, the lineage shape
 *  `Body/S/S3/gateway/src/subagents.rs` writes. */
const SESSIONS = [
    { sessionKey: 'agent:pi', label: 'pi' },
    { sessionKey: 'agent:anima:subagent:moirai', spawnedBy: 'agent:anima', label: 'moirai' }
];

/** One ANCHORED deposit, as `s5'.epii.deposit.list` projects it back out —
 *  the claim half a MediatedRunEvidencePacket is composed from (28.T28.8). */
const DEPOSIT_LIST = {
    deposits: [
        {
            itemId: 'dep-1',
            depositType: 'evidence',
            title: 'Q articulation evidence',
            status: 'open',
            requiresHuman: true,
            createdAt: 1700000000000,
            sourceAgent: 'human',
            sourceCoordinate: 'M5-4',
            sessionKey: 'agent:pi',
            artifact: { path: 'Idea/Empty/Present/x.md' },
            // snake_case is how S5 really serialises the anchor block; the
            // reader refuses a camelCase one, which is the point of using the
            // wire shape here rather than a convenient fixture.
            evidenceAnchors: {
                candidate_id: 'cand-1',
                graph_anchor: 'bimba://M5-4/evidence',
                review_id: 'rev-1',
                test_anchor: 'tests/e2e/x.spec.ts',
                privacy_class: 'protected-local'
            }
        }
    ]
};

describe('28.T28.5 — the Agentic Control Room deep pane', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        invoke.mockImplementation((method: string) => {
            if (method === S4_MEDIATION_CAPABILITIES_LIST_METHOD) {
                return Promise.resolve({ artifact: CAPABILITY_SNAPSHOT });
            }
            if (method === 'sessions.list') {
                return Promise.resolve({ artifact: SESSIONS });
            }
            if (method === REVIEW_INBOX_METHOD) {
                return Promise.resolve({ artifact: { items: [GATED_ITEM] } });
            }
            if (method === REVIEW_RESOLVE_METHOD) {
                return Promise.resolve({ artifact: { resolution: { item_id: 'rev-1' } } });
            }
            if (method === DEPOSIT_LIST_METHOD) {
                return Promise.resolve({ artifact: DEPOSIT_LIST });
            }
            return Promise.reject(new Error(`unexpected method ${method}`));
        });
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        // 28.T28.9 — the review row identity moved into the SHARED per-tab
        // state (the `/` Review fold reads the same one), so a selection made
        // in one test would otherwise survive into the next.
        hydrateOmniPanelSessionState(null);
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
    });

    it('(c) reframes to the Pi Runtime Monitor while preserving the widget id', () => {
        render(<AgenticControlRoomPane />);
        const banner = screen.getByTestId('pi-runtime-monitor-banner');
        expect(banner.getAttribute('data-widget-id')).toBe(
            'pratibimba.ide-shell.agentic-control-room'
        );
        expect(screen.getByTestId('acr-pane-title').textContent).toBe('Pi Runtime Monitor (ACR)');
        expect(banner.textContent).toContain('Single agent harness; Anima dispatches');
        expect(banner.textContent).not.toContain('Agentic Control Room');
    });

    it('(b) renders the collapsed roster — eight executable targets, six non-executable facets', async () => {
        render(<AgenticControlRoomPane />);
        const targets = await screen.findByTestId('acr-dispatch-targets');
        expect(targets.querySelectorAll('li')).toHaveLength(8);
        expect(screen.getByTestId('acr-dispatch-target-pi').getAttribute('data-mode')).toBe('harness');
        expect(screen.getByTestId('acr-dispatch-target-anima').getAttribute('data-mode')).toBe(
            'dispatcher'
        );
        expect(screen.getByTestId('acr-dispatch-target-moirai').getAttribute('data-mode')).toBe(
            'crystallisation'
        );
        // Sophia is a facet badge and is NOT an actor row
        expect(screen.queryByTestId('acr-dispatch-target-sophia')).toBeNull();
        const sophia = screen.getByTestId('acr-aspect-register-sophia');
        expect(sophia.getAttribute('data-executable')).toBe('false');
        expect(screen.getByTestId('acr-aspect-registers').querySelectorAll('li')).toHaveLength(6);
    });

    it('is the IOD-17 capability-matrix source of truth — it reads the live projection', async () => {
        render(<AgenticControlRoomPane />);
        await waitFor(() =>
            expect(screen.getByTestId('acr-capability-source').textContent).toContain(
                '2 capabilities'
            )
        );
        expect(invoke).toHaveBeenCalledWith(S4_MEDIATION_CAPABILITIES_LIST_METHOD, {});
    });

    it('(d) folds the real session lineage into a governance RunTree', async () => {
        render(<AgenticControlRoomPane />);
        await waitFor(() => expect(invoke).toHaveBeenCalledWith('sessions.list', {}));
        // the subagent is nested under its dispatcher, not a top-level peer
        await waitFor(() => expect(screen.getByTestId('acr-run-tree')).toBeTruthy());
        expect(screen.getByTestId('acr-run-tree').textContent).toContain('moirai');
    });

    // 26.T26.7 — 26.7 (a) names `<ToolStream />` among the T8 contents, and the
    // carrier composes it as the ONE `tool-stream` fold rather than a second
    // instance. That composition is only true if the crossing REALLY lands
    // there: before this tranche the pane's "open the temporal fold" button
    // fired `agentic-control-room.select-run`, which the 27.9 table resolves to
    // `dispatch-trace` — the STRUCTURAL fold this pane already renders — so the
    // time-ordered list was reachable from the control room by no path at all.
    // The assertion is therefore on the fold that really activates, through the
    // LIVE router and the real session store, not on the button's existence.
    it('26.7 (a) — the temporal crossing lands on the tool-stream fold carrying the same node', async () => {
        render(<AgenticControlRoomPane />);
        await waitFor(() => expect(screen.getByTestId('acr-run-tree').textContent).toContain('pi'));
        const node = screen
            .getByTestId('acr-run-tree')
            .querySelector('[data-testid="dispatch-tree-node"]');
        expect(node, 'the tree renders a selectable node').toBeTruthy();
        const nodeId = (node as Element).getAttribute('data-node-id');
        expect(nodeId, 'the node carries the genealogy identity both folds index by').toBeTruthy();
        fireEvent.click((node as Element).querySelector(
            '[data-testid="dispatch-tree-node-row"]'
        ) as Element);
        fireEvent.click(await screen.findByTestId('acr-open-tool-stream'));

        const state = readOmniPanelSessionState();
        expect(
            state.activeTab,
            'the TEMPORAL fold is `tool-stream`; `dispatch-trace` is the structural one this pane already renders'
        ).toBe('tool-stream');
        expect(
            state.perTabState['tool-stream'].selectedEventId,
            'ToolStreamPanel resolves `selectedEventId` through `genealogyIndex` — one node identity across both foldings (15.11)'
        ).toBe(nodeId);
        // …and the governance pane still hosts no second tool-stream instance
        expect(screen.queryByTestId('tool-stream-panel')).toBeNull();
    });

    it('(d) reads the open governance queue from the LIVE inbox method', async () => {
        render(<AgenticControlRoomPane />);
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith(REVIEW_INBOX_METHOD, { status: 'open' })
        );
        expect(await screen.findByTestId('review-item-select-rev-1')).toBeTruthy();
    });

    it('the human gate really gates: a human-required item refuses until the human of record signs', async () => {
        render(<AgenticControlRoomPane />);
        fireEvent.click(await screen.findByTestId('review-item-select-rev-1'));
        const controls = await screen.findByTestId('review-decision-controls');
        expect(controls.getAttribute('data-human-required')).toBe('true');
        expect(controls.getAttribute('data-gate-ok')).toBe('false');
        expect(screen.getByTestId('acr-gate-refusal').textContent).toContain('human-gate enforced');

        fireEvent.change(screen.getByTestId('acr-decision-rationale'), {
            target: { value: 'reviewed the evidence' }
        });
        // still refused: rationale is not the gate
        expect(
            (screen.getByTestId('acr-decision-commit') as HTMLButtonElement).disabled
        ).toBe(true);

        fireEvent.click(screen.getByTestId('acr-human-of-record'));
        await waitFor(() =>
            expect(
                (screen.getByTestId('acr-decision-commit') as HTMLButtonElement).disabled
            ).toBe(false)
        );
    });

    it("commits through the LIVE `s5'.review.resolve`, never the spec's absent `transition`", async () => {
        render(<AgenticControlRoomPane />);
        fireEvent.click(await screen.findByTestId('review-item-select-rev-1'));
        fireEvent.change(await screen.findByTestId('acr-decision-rationale'), {
            target: { value: 'reviewed the evidence' }
        });
        fireEvent.click(screen.getByTestId('acr-human-of-record'));
        fireEvent.click(screen.getByTestId('acr-decision-commit'));

        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith(REVIEW_RESOLVE_METHOD, {
                item_id: 'rev-1',
                decision: 'approve',
                rationale: 'reviewed the evidence',
                resolved_by: 'human',
                promotion_destination: null,
                promoted_artifact: null
            })
        );
        const methods = invoke.mock.calls.map(call => call[0]);
        expect(methods).not.toContain("s5'.review.transition");
    });

    it('a human-gated item is IN parity across all three faces', async () => {
        render(<AgenticControlRoomPane />);
        fireEvent.click(await screen.findByTestId('review-item-select-rev-1'));
        const matrix = await screen.findByTestId('iod17-parity-matrix');
        await waitFor(() => expect(matrix.getAttribute('data-in-parity')).toBe('true'));
        for (const face of ['capability-matrix', 'agent-contract', 'widget']) {
            expect(screen.getByTestId(`iod17-cell-${face}`).getAttribute('data-state')).toBe(
                'human-required'
            );
        }
        expect(screen.queryByTestId('iod17-violation')).toBeNull();
    });

    it('a non-gated item surfaces the verbatim parity violation instead of quietly proceeding', async () => {
        invoke.mockImplementation((method: string) => {
            if (method === S4_MEDIATION_CAPABILITIES_LIST_METHOD) {
                return Promise.resolve({ artifact: CAPABILITY_SNAPSHOT });
            }
            if (method === 'sessions.list') {
                return Promise.resolve({ artifact: [] });
            }
            if (method === REVIEW_INBOX_METHOD) {
                return Promise.resolve({
                    artifact: { items: [{ ...GATED_ITEM, item_id: 'rev-2', requires_human: false }] }
                });
            }
            return Promise.reject(new Error(`unexpected method ${method}`));
        });
        render(<AgenticControlRoomPane />);
        fireEvent.click(await screen.findByTestId('review-item-select-rev-2'));
        expect((await screen.findByTestId('iod17-violation')).textContent).toBe(
            'IOD-17 parity violated — gateway will reject any transition'
        );
        expect(screen.getByTestId('iod17-cell-agent-contract').getAttribute('data-agrees')).toBe(
            'false'
        );
    });

    it('(a) the run-lifecycle controls are an honest pending-wire surface, not a fake control', () => {
        render(<AgenticControlRoomPane />);
        const controls = screen.getByTestId('abort-retry-continue-controls');
        expect(controls.getAttribute('data-wire-state')).toBe('unwired');
        for (const action of ['abort', 'retry', 'continue']) {
            expect((screen.getByTestId(`acr-runtime-${action}`) as HTMLButtonElement).disabled).toBe(
                true
            );
        }
        const reason = screen.getByTestId('acr-runtime-pending-wire').textContent ?? '';
        expect(reason).toContain("s5'.epii.runtime_control");
        expect(reason).toContain('No such method exists');
    });

    it('(a) hosts the live evidence deposit rather than a second form over the same method', () => {
        render(<AgenticControlRoomPane />);
        expect(screen.getByTestId('evidence-deposit-form')).toBeTruthy();
    });

    it('the seam register discloses every method, live and unwired, on the surface', () => {
        render(<AgenticControlRoomPane />);
        const register = screen.getByTestId('acr-method-register');
        expect(register.textContent).toContain("s5'.review.resolve");
        expect(register.textContent).toContain("s5'.epii.deposit");
        expect(screen.getByTestId('acr-seam-runtime-control').getAttribute('data-status')).toBe(
            'unwired'
        );
        expect(screen.getByTestId('acr-seam-review-decision').getAttribute('data-status')).toBe(
            'live'
        );
        // the correction is stated where a reader will meet it
        expect(register.textContent).toContain("spec named `s5'.review.transition`");
    });

    it('refuses to fabricate anything while the gateway is down', () => {
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        render(<AgenticControlRoomPane />);
        expect(screen.getByTestId('acr-disconnected')).toBeTruthy();
        expect(invoke).not.toHaveBeenCalled();
        expect(screen.getByTestId('acr-capability-source').textContent).toContain('not loaded');
    });
});

/**
 * 28.T28.8 — the DEEP evidence render DR-WC-IS-2 gives to this surface. The `/`
 * membrane keeps the abbreviated folding; the full packet audit is here, and
 * both read ONE record identity.
 */
describe('28.T28.8 — the deep evidence audit', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        invoke.mockImplementation((method: string) => {
            if (method === S4_MEDIATION_CAPABILITIES_LIST_METHOD) {
                return Promise.resolve({ artifact: CAPABILITY_SNAPSHOT });
            }
            if (method === 'sessions.list') {
                return Promise.resolve({ artifact: SESSIONS });
            }
            if (method === REVIEW_INBOX_METHOD) {
                return Promise.resolve({ artifact: { items: [GATED_ITEM] } });
            }
            if (method === DEPOSIT_LIST_METHOD) {
                return Promise.resolve({ artifact: DEPOSIT_LIST });
            }
            return Promise.reject(new Error(`unexpected method ${method}`));
        });
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        useSessionStore.setState({ sessionKey: 'agent:pi', dayNow: '30-07-2026' });
        hydrateOmniPanelSessionState(null);
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        useSessionStore.setState({ sessionKey: null, dayNow: null });
    });

    it('composes the anchored deposit into a packet and renders it in the DEEP folding', async () => {
        render(<AgenticControlRoomPane />);
        const row = await screen.findByTestId('evidence-packet-row');
        expect(row.getAttribute('data-packet-id')).toBe('dep-1');
        // nothing is selected on mount — the audit does not seize the shared
        // evidence selection just because the pane opened
        expect(screen.queryByTestId('evidence-packet-view')).toBeNull();
        expect(readOmniPanelSessionState().perTabState.evidence.selectedPacketId ?? null).toBeNull();

        fireEvent.click(row);
        const view = await screen.findByTestId('evidence-packet-view');
        expect(view.getAttribute('data-fold')).toBe('deep');
        // the selection crossed into the ONE record identity the `/` fold reads
        expect(readOmniPanelSessionState().perTabState.evidence.selectedPacketId).toBe('dep-1');
        // …and the deep half really is the audit: the three-face readout the
        // producer filled from THIS pane's live capability projection.
        const matrix = screen.getByTestId('evidence-iod17-parity');
        expect(matrix.getAttribute('data-in-parity')).toBe('true');
        expect(
            screen.getByTestId('evidence-iod17-cell-capability-matrix').getAttribute('data-state')
        ).toBe('human-required');
        // the dispatch trace opens in the deep folding
        expect(screen.getByTestId('dispatch-mini-graph').getAttribute('data-expanded')).toBe('true');
    });

    it('renders the record the `/` fold already selected — bidirectional identity', async () => {
        hydrateOmniPanelSessionState({
            perTabState: { evidence: { selectedPacketId: 'dep-1' } }
        } as never);
        render(<AgenticControlRoomPane />);
        const view = await screen.findByTestId('evidence-packet-view');
        expect(view.getAttribute('data-packet-id')).toBe('dep-1');
        expect(view.getAttribute('data-fold')).toBe('deep');
    });

    it('composes NO packet without a session/day anchor, and says why', async () => {
        useSessionStore.setState({ sessionKey: null, dayNow: null });
        render(<AgenticControlRoomPane />);
        const note = await screen.findByTestId('acr-evidence-audit-note');
        expect(note.textContent).toContain('cannot name');
        expect(screen.queryByTestId('evidence-packet-row')).toBeNull();
    });
});
