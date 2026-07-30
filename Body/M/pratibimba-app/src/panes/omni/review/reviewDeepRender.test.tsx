/**
 * Coordinate: M' M5' chrome (Review deep-render tests — rerun 28.T28.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni/review
 * Actualises: the behavioural half of tranche 28.9 —
 *   (a) `ReviewItemDeep` is a PROJECTION, not a shape with hopeful fields: the
 *       evidence-packet id appears exactly when an anchored deposit backs the
 *       row, the genealogy ref exactly when the surface holds the run, and the
 *       parity object is ABSENT (never a red readout) until the live capability
 *       matrix has answered;
 *   (b) the three-cell IOD-17 matrix marks a cell green only on `human-required`
 *       and raises the spec's verbatim banner on an aggregate violation;
 *   (c)/(d) the two click-throughs carry the ref they name, and are absent or
 *       disabled — never dead-but-enabled — when the ref is not there;
 *   (e) the human-required banner carries a parity status LINE whose content
 *       differs by folding, because the two foldings genuinely know different
 *       amounts;
 *   DR-WC-IS-2 — the abbreviated `/` folding and the deep governance folding are
 *       ONE component over ONE producer, and the deep half is the only one that
 *       renders the parity audit.
 *
 *   The seam register is held against the REAL tree in both directions: every
 *   `available: true` gateway method must exist under `Body/S`, the live routing
 *   table must really carry both click-through routes, and the ONE unavailable
 *   target must really fail to promote `agenticControlRoom` into `ide-deep`.
 *   All three go RED the day the missing arm or row lands.
 * Does NOT own: the ACR governance law (`panes/acr/acrGovernance.test.ts`), the
 *   evidence packet producer (`evidence/evidenceDeepRender.test.tsx`), the fold
 *   body (`panes/omni/reviewBlocks.test.tsx`), the gate law
 *   (`panes/m5ReviewGate.test.ts`).
 */

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { intentTarget } from '../../../commands/crossLayoutIntent';
import { computeIod17Parity } from '../../acr/acrGovernance';
import type { AcrReviewItem } from '../../acr/acrReviewInbox';
import type { DispatchGenealogyRecord } from '../dispatchGenealogy';
import type { EvidenceDeposit } from '../evidence/evidenceDeposits';
import {
    evidencePacketsFromDeposits,
    iod17GateParityFrom,
    type EvidencePacketContext
} from '../evidence/evidencePacketProducer';
import { omniPanelIntentRouter } from '../omnipanelIntentRouter';
import type { MediationCapabilitySnapshot } from '../omnipanelCapabilities';
import { ReviewItemDeepView } from './ReviewItemDeepView';
import { reviewItemDeepById, reviewItemsDeep, type ReviewItemDeep } from './reviewItemDeep';
import {
    REVIEW_DISPATCH_TREE_ROUTE,
    REVIEW_EVIDENCE_ROUTE,
    REVIEW_PANE_SEAMS,
    reviewPaneSeam
} from './reviewPaneSeams';

afterEach(cleanup);

const REPO_ROOT = resolve(__dirname, '../../../../../../..');

/** Does any Rust source under `Body/S` register this method name? The same
 *  substrate probe 28.T28.5 / 28.T28.8 used — a real `git grep` over the live
 *  tree, so a claim here dies the day the substrate contradicts it. */
function registeredInSubstrate(method: string): boolean {
    try {
        const out = execFileSync(
            'git',
            ['grep', '-l', '--fixed-strings', `"${method}"`, '--', 'Body/S/**/*.rs'],
            { cwd: REPO_ROOT, encoding: 'utf8' }
        );
        return out.trim().length > 0;
    } catch {
        return false;
    }
}

function snapshot(
    capabilities: MediationCapabilitySnapshot['capabilities'] = []
): MediationCapabilitySnapshot {
    return {
        owner: "S4'",
        method: "s4'.mediation.capabilities.list",
        routesThrough: "s4'.mediation.route",
        dispatchTools: [],
        aletheiaModeInternalTools: [],
        capabilities
    };
}

function item(overrides: Partial<AcrReviewItem> = {}): AcrReviewItem {
    return {
        itemId: 'rev-1',
        title: 'promote the axiom candidate',
        source: 'aletheia',
        priority: 'high',
        status: 'open',
        requiresHuman: true,
        coordinate: 'M5-4',
        createdAtMs: 1_000,
        ...overrides
    };
}

function deposit(overrides: Partial<EvidenceDeposit> = {}): EvidenceDeposit {
    return {
        itemId: 'rev-1',
        depositType: 'review_item',
        title: 'promote the axiom candidate',
        body: 'anchors',
        status: 'open',
        requiresHuman: true,
        createdAtMs: 1_000,
        sourceAgent: 'human',
        sourceCoordinate: 'M5-4',
        sessionKey: 'sess-a',
        artifactPath: 'Idea/Empty/Present/x.md',
        evidenceAnchors: {
            candidateId: 'cand-1',
            graphAnchor: 'bimba://M5-4/evidence',
            reviewId: 'rev-1',
            testAnchor: 'src/panes/omni/review/reviewDeepRender.test.tsx',
            privacyClass: 'protected'
        },
        ...overrides
    };
}

function record(overrides: Partial<DispatchGenealogyRecord> = {}): DispatchGenealogyRecord {
    return {
        id: 'sess-a:root',
        parentId: null,
        actor: { actor: 'pi', role: 'pi' },
        route: { method: "s4'.mediation.route", capability: 'dispatch' },
        status: 'succeeded',
        startedAtMs: 10,
        endedAtMs: 20,
        gate: { capability: 'dispatch', allowed: true },
        evidenceRef: null,
        sourceRef: null,
        ...overrides
    };
}

const packetContext: EvidencePacketContext = {
    sessionKey: 'sess-a',
    dayNowContext: '07-30-2026',
    profileGeneration: 3,
    bridgeReadinessHandle: 'ready_public_current',
    currentProfile: {},
    sessionRuntime: { sessionCount: 1 },
    capabilitySnapshot: null
};

describe('28.9 (a) — ReviewItemDeep is a projection of real reads', () => {
    it('the evidence-packet id appears exactly when an ANCHORED deposit backs the row', () => {
        const rows = reviewItemsDeep({
            items: [item({ itemId: 'rev-1' }), item({ itemId: 'rev-2' }), item({ itemId: 'rev-3' })],
            deposits: [
                deposit({ itemId: 'rev-1' }),
                // filed, but not evidence for a run — no packet is composed
                deposit({ itemId: 'rev-2', evidenceAnchors: null })
            ],
            genealogy: [],
            snapshot: null
        });

        expect(rows[0].mediatedRunEvidencePacketId).toBe('rev-1');
        expect(
            rows[1].mediatedRunEvidencePacketId,
            'an anchorless deposit composes no packet, so there is no id to link to'
        ).toBeUndefined();
        expect(
            rows[2].mediatedRunEvidencePacketId,
            'a row with no deposit at all carries no evidence id'
        ).toBeUndefined();
    });

    it('the genealogy ref names the SAME node the evidence packet folds as its trace root', () => {
        // The join must not drift from the packet producer's own matching rule;
        // if it ever does, the dispatch click-through and the evidence trace
        // disagree about which run the review item is about.
        const deposits = [deposit()];
        const genealogy = [record(), record({ id: 'sess-a:child', parentId: 'sess-a:root' })];
        const rows = reviewItemsDeep({
            items: [item()],
            deposits,
            genealogy,
            snapshot: null
        });
        const packets = evidencePacketsFromDeposits(deposits, genealogy, packetContext);

        expect(packets).toHaveLength(1);
        expect(rows[0].dispatchGenealogyRef).toBe(packets[0].dispatchTrace.id);
        expect(rows[0].dispatchGenealogyRef).toBe('sess-a:root');
    });

    it('a surface holding no genealogy gets null — never a guessed node id', () => {
        const rows = reviewItemsDeep({
            items: [item()],
            deposits: [deposit()],
            genealogy: [],
            snapshot: null
        });
        expect(rows[0].dispatchGenealogyRef).toBeNull();
        // …and a run belonging to a DIFFERENT session is never borrowed.
        const other = reviewItemsDeep({
            items: [item()],
            deposits: [deposit()],
            genealogy: [record({ id: 'sess-z:root' })],
            snapshot: null
        });
        expect(other[0].dispatchGenealogyRef).toBeNull();
    });

    it('parity is ABSENT until the capability matrix answers, and equals the ACR computation once it has', () => {
        const unread = reviewItemsDeep({
            items: [item()],
            deposits: [],
            genealogy: [],
            snapshot: null
        });
        expect(
            unread[0].iod17Parity,
            'a readout from an unloaded matrix would render a violation that is really a spinner'
        ).toBeNull();

        const answered = reviewItemsDeep({
            items: [item()],
            deposits: [],
            genealogy: [],
            snapshot: snapshot()
        });
        // DR-WC-IS-1: the law is CONSUMED from the ACR, never restated here.
        expect(answered[0].iod17Parity).toEqual(
            iod17GateParityFrom(
                computeIod17Parity({
                    humanRequired: true,
                    decision: 'approve',
                    snapshot: snapshot()
                })
            )
        );
        expect(answered[0].iod17Parity?.inParity).toBe(true);
    });

    it('an agent-permitted capability flips the first face and breaks parity', () => {
        const rows = reviewItemsDeep({
            items: [item()],
            deposits: [],
            genealogy: [],
            snapshot: snapshot([
                { name: 'resolve_epii_review_gate', entitlementClass: 'standard' }
            ])
        });
        expect(rows[0].iod17Parity?.capabilityMatrixState).toBe('agent-allowed');
        expect(rows[0].iod17Parity?.inParity).toBe(false);
    });

    it('lookup by the shared selection id resolves the row the other folding renders', () => {
        const rows = reviewItemsDeep({
            items: [item({ itemId: 'rev-1' }), item({ itemId: 'rev-2' })],
            deposits: [],
            genealogy: [],
            snapshot: null
        });
        expect(reviewItemDeepById(rows, 'rev-2')?.itemId).toBe('rev-2');
        expect(reviewItemDeepById(rows, null)).toBeNull();
        expect(reviewItemDeepById(rows, 'rev-404')).toBeNull();
    });
});

function deepRow(overrides: Partial<ReviewItemDeep> = {}): ReviewItemDeep {
    return {
        ...item(),
        iod17Parity: {
            capabilityMatrixState: 'human-required',
            agentContractState: 'human-required',
            widgetState: 'human-required',
            inParity: true
        },
        dispatchGenealogyRef: 'sess-a:root',
        mediatedRunEvidencePacketId: 'rev-1',
        ...overrides
    };
}

describe('28.9 (b) — the three-cell parity matrix', () => {
    it('renders three cells green with the aggregate in parity, and no violation banner', () => {
        render(<ReviewItemDeepView item={deepRow()} fold="deep" />);
        for (const face of ['capability-matrix', 'agent-contract', 'widget']) {
            const cell = screen.getByTestId(`review-iod17-cell-${face}`);
            expect(cell.getAttribute('data-state')).toBe('human-required');
            expect(cell.getAttribute('data-agrees')).toBe('true');
        }
        expect(screen.getByTestId('review-iod17-rev-1').getAttribute('data-in-parity')).toBe('true');
        expect(screen.getByTestId('review-iod17-aggregate-rev-1').textContent).toBe('in parity');
        expect(screen.queryByTestId('review-iod17-violation-rev-1')).toBeNull();
    });

    it('a disagreeing face marks red and raises the spec banner as an alert', () => {
        render(
            <ReviewItemDeepView
                item={deepRow({
                    iod17Parity: {
                        capabilityMatrixState: 'agent-allowed',
                        agentContractState: 'human-required',
                        widgetState: 'human-required',
                        inParity: false
                    }
                })}
                fold="deep"
            />
        );
        expect(
            screen.getByTestId('review-iod17-cell-capability-matrix').getAttribute('data-agrees')
        ).toBe('false');
        expect(screen.getByTestId('review-iod17-cell-widget').getAttribute('data-agrees')).toBe(
            'true'
        );
        const banner = screen.getByTestId('review-iod17-violation-rev-1');
        expect(banner.getAttribute('role')).toBe('alert');
        expect(banner.textContent).toBe(
            'IOD-17 parity violated — gateway will reject any transition'
        );
    });

    it('an `unset` face is red too — an unread face is not an agreeing one', () => {
        render(
            <ReviewItemDeepView
                item={deepRow({
                    iod17Parity: {
                        capabilityMatrixState: 'unset',
                        agentContractState: 'human-required',
                        widgetState: 'human-required',
                        inParity: false
                    }
                })}
                fold="deep"
            />
        );
        expect(
            screen.getByTestId('review-iod17-cell-capability-matrix').getAttribute('data-agrees')
        ).toBe('false');
    });

    it('the deep fold with no parity object says which method has not answered — it does not fake a violation', () => {
        render(<ReviewItemDeepView item={deepRow({ iod17Parity: null })} fold="deep" />);
        expect(screen.queryByTestId('review-iod17-rev-1')).toBeNull();
        expect(screen.queryByTestId('review-iod17-violation-rev-1')).toBeNull();
        expect(screen.getByTestId('review-iod17-pending-rev-1').textContent).toContain(
            "s4'.mediation.capabilities.list"
        );
    });
});

describe('DR-WC-IS-2 — one component, two foldings', () => {
    it('the abbreviated fold renders NO parity matrix, and says whose readout it is', () => {
        render(<ReviewItemDeepView item={deepRow()} fold="abbreviated" />);
        expect(screen.queryByTestId('review-iod17-rev-1')).toBeNull();
        expect(screen.getByTestId('review-item-rev-1').getAttribute('data-fold')).toBe(
            'abbreviated'
        );
        expect(screen.getByTestId('review-item-parity-status-rev-1').textContent).toContain(
            'governance fold'
        );
    });

    it('the crossing INTO the deep pane is disabled on the abbreviated side and names the target', () => {
        render(<ReviewItemDeepView item={deepRow()} fold="abbreviated" />);
        const seam = screen.getByTestId('review-open-governance-audit-rev-1');
        expect(seam.getAttribute('data-wire-state')).toBe('unwired');
        expect(
            screen
                .getByTestId('review-open-governance-audit-rev-1-button')
                .hasAttribute('disabled')
        ).toBe(true);
        expect(seam.textContent).toContain('agenticControlRoom');
        // …and the deep fold does not render a crossing to itself.
        cleanup();
        render(<ReviewItemDeepView item={deepRow()} fold="deep" />);
        expect(screen.queryByTestId('review-open-governance-audit-rev-1')).toBeNull();
    });

    it('the human-required banner carries a parity status line whose content differs by folding', () => {
        render(<ReviewItemDeepView item={deepRow()} fold="deep" />);
        expect(screen.getByTestId('review-item-human-gate-rev-1').textContent).toContain(
            'Human ratification required'
        );
        expect(screen.getByTestId('review-item-parity-status-rev-1').textContent).toContain(
            'all three faces agree'
        );
        cleanup();
        render(<ReviewItemDeepView item={deepRow({ iod17Parity: null })} fold="deep" />);
        expect(screen.getByTestId('review-item-parity-status-rev-1').textContent).toContain(
            'unread'
        );
    });

    it('a row that needs no human carries no gate banner at all', () => {
        render(<ReviewItemDeepView item={deepRow({ requiresHuman: false })} fold="deep" />);
        expect(screen.getByTestId('review-item-rev-1').getAttribute('data-human-required')).toBe(
            'false'
        );
        expect(screen.queryByTestId('review-item-human-gate-rev-1')).toBeNull();
    });
});

describe('28.9 (c)/(d) — the two click-throughs', () => {
    it('the dispatch click-through carries the genealogy ref it names', () => {
        const onOpenDispatchTree = vi.fn();
        render(
            <ReviewItemDeepView
                item={deepRow()}
                fold="deep"
                onOpenDispatchTree={onOpenDispatchTree}
            />
        );
        const button = screen.getByTestId('review-open-dispatch-rev-1');
        expect(button.getAttribute('data-dispatch-ref')).toBe('sess-a:root');
        fireEvent.click(button);
        expect(onOpenDispatchTree).toHaveBeenCalledWith('sess-a:root');
    });

    it('without a genealogy ref there is no button — the surface explains the absence instead', () => {
        const onOpenDispatchTree = vi.fn();
        render(
            <ReviewItemDeepView
                item={deepRow({ dispatchGenealogyRef: null })}
                fold="deep"
                onOpenDispatchTree={onOpenDispatchTree}
            />
        );
        expect(screen.queryByTestId('review-open-dispatch-rev-1')).toBeNull();
        expect(screen.getByTestId('review-no-dispatch-rev-1').textContent).toContain(
            'no genealogy field on the wire'
        );
        expect(onOpenDispatchTree).not.toHaveBeenCalled();
    });

    it('the evidence click-through carries the packet id, and is absent when no packet exists', () => {
        const onOpenEvidence = vi.fn();
        render(
            <ReviewItemDeepView item={deepRow()} fold="deep" onOpenEvidence={onOpenEvidence} />
        );
        fireEvent.click(screen.getByTestId('review-open-evidence-rev-1'));
        expect(onOpenEvidence).toHaveBeenCalledWith('rev-1');
        cleanup();
        render(
            <ReviewItemDeepView
                item={deepRow({ mediatedRunEvidencePacketId: undefined })}
                fold="deep"
                onOpenEvidence={onOpenEvidence}
            />
        );
        expect(screen.queryByTestId('review-open-evidence-rev-1')).toBeNull();
    });

    it('selecting a row reports the id the shared per-tab state keys on', () => {
        const onSelect = vi.fn();
        render(<ReviewItemDeepView item={deepRow()} fold="abbreviated" onSelect={onSelect} />);
        fireEvent.click(screen.getByTestId('review-item-select-rev-1'));
        expect(onSelect).toHaveBeenCalledWith('rev-1');
    });
});

describe('28.9 seam register — held against the real tree', () => {
    it('every seam this surface claims as a live gateway method really exists in Body/S', () => {
        const methods = REVIEW_PANE_SEAMS.filter(
            seam => seam.kind === 'gateway-method' && seam.available
        );
        expect(methods.length).toBeGreaterThanOrEqual(3);
        for (const seam of methods) {
            // A corrected seam is claimed under the CARRIER's name, never the
            // spec's — that is exactly what `carrierName` records.
            const claimed = seam.carrierName ?? seam.name;
            expect(registeredInSubstrate(claimed), `${claimed} must exist in Body/S`).toBe(true);
        }
    });

    it("`s5'.review.transition` is still registered nowhere — this reddens the day it lands", () => {
        expect(registeredInSubstrate("s5'.review.transition")).toBe(false);
        const seam = reviewPaneSeam("s5'.review.transition");
        expect(seam?.carrierName).toBe("s5'.review.resolve");
        expect(registeredInSubstrate("s5'.review.resolve")).toBe(true);
    });

    it('both click-through routes really resolve through the live 27.9 routing table', () => {
        const dispatch = omniPanelIntentRouter.route({
            coordinate: null,
            artifactUri: 'sess-a:root',
            reviewId: null,
            dayNow: null,
            sessionKey: null,
            profileGeneration: null,
            privacyClass: null,
            ...REVIEW_DISPATCH_TREE_ROUTE
        });
        expect(dispatch?.activateTab).toBe('dispatch-trace');
        expect(dispatch?.perTabPayload).toEqual({ selectedNodeId: 'sess-a:root' });

        const evidence = omniPanelIntentRouter.route({
            coordinate: null,
            artifactUri: 'rev-1',
            reviewId: null,
            dayNow: null,
            sessionKey: null,
            profileGeneration: null,
            privacyClass: null,
            ...REVIEW_EVIDENCE_ROUTE
        });
        expect(evidence?.activateTab).toBe('evidence');
        // The SAME per-tab key both evidence foldings read (28.T28.8) — which is
        // what makes (d) land in the abbreviated fold and the deep audit at once.
        expect(evidence?.perTabPayload).toEqual({ selectedPacketId: 'rev-1' });
    });

    it('the control-room target still cannot promote into `ide-deep` — this reddens the day it can', () => {
        // The behaviour, not the file text: the live ledger's own resolver. If a
        // future row promotes `agenticControlRoom`, the disabled crossing seam
        // above becomes a lie and this test says so first.
        const target = intentTarget({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'agentic-control-room'
        });
        expect(target?.component).toBe('omniDispatchTrace');
        expect(target?.preferredLayout).toBeNull();
        expect(
            reviewPaneSeam('ide-shell-m0-m5/agentic-control-room → agenticControlRoom')?.available
        ).toBe(false);
    });
});
