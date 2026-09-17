/**
 * Coordinate: M' M5' chrome (Evidence deep-render tests — rerun 28.T28.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Actualises: the behavioural half of tranche 28.8 —
 *   (a) the packet's `GateLanding.iod17Parity` is POPULATED from the ACR's live
 *       three-face computation, and stays absent while the matrix has not
 *       answered (26.10 declared the field; nothing filled it before this);
 *   (b) the mediator badge carries per-mediator and per-subagent identity;
 *   (c) the dispatch-trace mini-graph is collapsible, collapsed by default, and
 *       each node carries actor + method + tickAtInvoke + psyche-facet badge;
 *   (d/e/f) the close-paths — the tool-stream cross-link, the axiom-translation
 *       seam DISABLED with the missing target named, the contemplation link;
 *   DR-WC-IS-2 — the abbreviated `/` folding and the deep governance folding are
 *       one component, and the deep half is the only one that renders the audit.
 *
 *   The seam register is held against the REAL tree in both directions: every
 *   `available: true` gateway method must exist under `Body/S`, and the one
 *   unavailable intent target must really be unresolvable by the live
 *   `intentTarget` ledger. Both go RED the day the missing arm or row lands.
 * Does NOT own: the fold body (`EvidencePanel.test.tsx`), the ACR governance law
 *   (`panes/acr/acrGovernance.test.ts`), the deposit write path
 *   (`evidenceTails.test.tsx`), the packet schema (`evidenceShapes.test.ts`).
 */

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { intentTarget } from '../../../commands/crossLayoutIntent';
import { computeIod17Parity } from '../../acr/acrGovernance';
import type { MediationCapabilitySnapshot } from '../omnipanelCapabilities';
import { EvidencePacketView } from '../EvidencePacketView';
import { DispatchTraceMiniGraph } from '../DispatchTraceMiniGraph';
import type { DispatchGenealogyRecord } from '../dispatchGenealogy';
import type { MediatedRunEvidencePacket } from '../evidenceShapes';
import { validateEvidencePacket } from '../evidenceShapes';
import type { EvidenceDeposit } from './evidenceDeposits';
import {
    evidencePacketsFromDeposits,
    iod17GateParityFrom,
    type EvidencePacketContext
} from './evidencePacketProducer';
import {
    EVIDENCE_PANE_SEAMS,
    evidencePaneSeam,
    EVIDENCE_DEEP_RENDER_SURFACE
} from './evidencePaneSeams';

afterEach(cleanup);

const REPO_ROOT = resolve(__dirname, '../../../../../../..');

/** Does any Rust source under `Body/S` register this method name? The same
 *  substrate probe 28.T28.5 used — a real `git grep` over the live tree. */
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

function deposit(overrides: Partial<EvidenceDeposit> = {}): EvidenceDeposit {
    return {
        itemId: 'dep-1',
        depositType: 'evidence',
        title: 'Run one',
        body: '',
        status: 'open',
        requiresHuman: true,
        createdAtMs: 1000,
        sourceAgent: 'anima',
        sourceCoordinate: 'M5-4',
        sessionKey: 'agent:anima:main',
        artifactPath: 'Idea/Empty/Present/x.md',
        evidenceAnchors: {
            candidateId: 'cand-1',
            graphAnchor: 'bimba://M5-4/evidence',
            reviewId: 'rev-1',
            testAnchor: 'tests/x.spec.ts',
            privacyClass: 'protected-local'
        },
        ...overrides
    };
}

function context(overrides: Partial<EvidencePacketContext> = {}): EvidencePacketContext {
    return {
        sessionKey: 'agent:anima:main',
        dayNowContext: '30-07-2026',
        profileGeneration: 12,
        bridgeReadinessHandle: 'ready_public_current',
        currentProfile: {},
        sessionRuntime: {},
        ...overrides
    };
}

const RECORDS: readonly DispatchGenealogyRecord[] = [];

function packetFixture(overrides: Partial<MediatedRunEvidencePacket> = {}): MediatedRunEvidencePacket {
    return {
        id: 'packet-1',
        title: 'Run one',
        mediatedBy: { kind: 'aletheia', subagent: 'moirai' },
        candidateId: 'cand-1',
        coordinate: 'M5-4',
        sourceAnchor: 'src://a',
        graphAnchor: 'graph://a',
        reviewId: 'rev-1',
        testAnchor: 'test://a',
        privacyClass: 'protected-local',
        dispatchTrace: {
            id: 'node-1',
            parentId: null,
            actor: { kind: 'pi' },
            methodOrSkill: "s4'.mediation.route",
            invokedAt: 1000,
            tickAtInvoke: 42,
            psycheFacet: 'logos',
            children: [
                {
                    id: 'node-2',
                    parentId: 'node-1',
                    actor: { kind: 'aletheia', subagent: 'moirai' },
                    methodOrSkill: 'aletheia.cast',
                    invokedAt: 1100,
                    tickAtInvoke: 43,
                    children: []
                }
            ]
        },
        toolStream: [],
        gateLandings: [],
        axiomTranslationSteps: [],
        sessionKey: 'agent:anima:main',
        dayNowContext: '30-07-2026',
        profileGeneration: 12,
        bridgeReadinessHandle: 'ready_public_current',
        currentProfile: {},
        graphContext: {},
        sessionRuntime: {},
        semanticCandidates: [],
        s5Refs: ['rev-1'],
        ...overrides
    };
}

describe('28.T28.8 (a) — GateLanding.iod17Parity is populated, and only from a read matrix', () => {
    it('emits NO parity landing while the capability projection has not answered', () => {
        const [packet] = evidencePacketsFromDeposits([deposit()], RECORDS, context());
        expect(packet.gateLandings.some(gate => gate.iod17Parity)).toBe(false);
        // …and the human gate is still recorded: silence about parity is not
        // silence about the deposit.
        expect(packet.gateLandings.map(gate => gate.gateType)).toContain('human-required');
    });

    it('fills all three faces from the live readout once the matrix answers', () => {
        const [packet] = evidencePacketsFromDeposits(
            [deposit()],
            RECORDS,
            context({ capabilitySnapshot: snapshot() })
        );
        const landing = packet.gateLandings.find(gate => gate.iod17Parity);
        expect(landing?.gateType).toBe('iod17-parity');
        expect(landing?.iod17Parity).toEqual({
            capabilityMatrixState: 'human-required',
            agentContractState: 'human-required',
            widgetState: 'human-required',
            inParity: true
        });
        // An open review item has not transitioned; parity does not resolve it.
        expect(landing?.state).toBe('pending');
        expect(validateEvidencePacket(packet)).toEqual([]);
    });

    it('BLOCKS the landing when a face disagrees — the substrate would refuse the transition', () => {
        const drifted = snapshot([
            {
                name: 'resolve_epii_review_gate',
                entitlementClass: 'standard',
                description: 'drift: an agent acquired a review-commit path'
            } as MediationCapabilitySnapshot['capabilities'][number]
        ]);
        const [packet] = evidencePacketsFromDeposits(
            [deposit({ status: 'resolved' })],
            RECORDS,
            context({ capabilitySnapshot: drifted })
        );
        const landing = packet.gateLandings.find(gate => gate.iod17Parity);
        expect(landing?.iod17Parity?.capabilityMatrixState).toBe('agent-allowed');
        expect(landing?.iod17Parity?.inParity).toBe(false);
        expect(landing?.state).toBe('blocked');
        expect(landing?.transitionedBy).toBeUndefined();
    });

    it('projects an unanswered face as `unset`, never as agreement', () => {
        const parity = iod17GateParityFrom(
            computeIod17Parity({ humanRequired: true, decision: 'approve', snapshot: null })
        );
        expect(parity.capabilityMatrixState).toBe('unset');
        expect(parity.inParity).toBe(false);
    });

    it('the schema refuses a half-filled readout off the wire', () => {
        const errors = validateEvidencePacket(
            packetFixture({
                gateLandings: [
                    {
                        gateId: 'g1',
                        gateType: 'iod17-parity',
                        state: 'pending',
                        iod17Parity: {
                            capabilityMatrixState: 'human-required',
                            // a face nobody measured, smuggled in as a verdict
                            agentContractState: 'agreed' as never,
                            widgetState: 'human-required',
                            inParity: true
                        }
                    }
                ]
            })
        );
        expect(errors.join('; ')).toContain('agentContractState');
    });
});

describe('28.T28.8 (c) — the dispatch-trace mini-graph', () => {
    it('is collapsed by default and expands on click, carrying tick + facet per node', () => {
        const packet = packetFixture();
        render(<DispatchTraceMiniGraph root={packet.dispatchTrace} />);
        const graph = screen.getByTestId('dispatch-mini-graph');
        expect(graph.getAttribute('data-expanded')).toBe('false');
        expect(graph.getAttribute('data-node-count')).toBe('2');
        expect(screen.queryByTestId('dispatch-mini-node')).toBeNull();

        fireEvent.click(screen.getByTestId('dispatch-mini-expand'));
        const nodes = screen.getAllByTestId('dispatch-mini-node');
        expect(nodes.map(node => node.getAttribute('data-node-id'))).toEqual(['node-1', 'node-2']);
        expect(nodes[0].getAttribute('data-tick')).toBe('42');
        expect(nodes[0].getAttribute('data-psyche-facet')).toBe('logos');
        // the facet badge rides the ONE facet vocabulary's colour class
        expect(screen.getByTestId('dispatch-mini-facet').className).toContain('facet-logos');
        // a node without a facet gets no badge rather than an invented one
        expect(nodes[1].getAttribute('data-psyche-facet')).toBe('');
        expect(screen.getAllByTestId('dispatch-mini-facet')).toHaveLength(1);
    });

    it('deep-links to the full Dispatch tab at the ROOT node id', () => {
        const onOpen = vi.fn();
        render(<DispatchTraceMiniGraph root={packetFixture().dispatchTrace} onOpen={onOpen} />);
        fireEvent.click(screen.getByTestId('dispatch-mini-open'));
        expect(onOpen).toHaveBeenCalledWith('node-1');
    });
});

describe('28.T28.8 — DR-WC-IS-2: one component, two foldings', () => {
    it('the abbreviated fold renders the record and its close-paths, and NO governance audit', () => {
        const packet = packetFixture({
            gateLandings: [
                {
                    gateId: 'g1',
                    gateType: 'iod17-parity',
                    state: 'pending',
                    iod17Parity: {
                        capabilityMatrixState: 'human-required',
                        agentContractState: 'human-required',
                        widgetState: 'human-required',
                        inParity: true
                    }
                }
            ]
        });
        render(<EvidencePacketView packet={packet} fold="abbreviated" />);
        expect(screen.getByTestId('evidence-packet-view').getAttribute('data-fold')).toBe(
            'abbreviated'
        );
        expect(screen.getByTestId('evidence-open-tools')).toBeTruthy();
        expect(screen.getByTestId('dispatch-mini-graph').getAttribute('data-expanded')).toBe('false');
        // the audit half belongs to the deep surface
        expect(screen.queryByTestId('evidence-iod17-parity')).toBeNull();
        expect(screen.queryByTestId('evidence-axiom-link')).toBeNull();
    });

    it('the deep fold renders the three-cell readout the packet carries, trace open', () => {
        const packet = packetFixture({
            gateLandings: [
                {
                    gateId: 'g1',
                    gateType: 'iod17-parity',
                    state: 'pending',
                    iod17Parity: {
                        capabilityMatrixState: 'human-required',
                        agentContractState: 'human-required',
                        widgetState: 'human-required',
                        inParity: true
                    }
                }
            ]
        });
        render(<EvidencePacketView packet={packet} fold="deep" />);
        const matrix = screen.getByTestId('evidence-iod17-parity');
        expect(matrix.getAttribute('data-in-parity')).toBe('true');
        for (const face of ['capability-matrix', 'agent-contract', 'widget']) {
            expect(screen.getByTestId(`evidence-iod17-cell-${face}`).getAttribute('data-state')).toBe(
                'human-required'
            );
        }
        expect(screen.queryByTestId('evidence-iod17-violation')).toBeNull();
        expect(screen.getByTestId('dispatch-mini-graph').getAttribute('data-expanded')).toBe('true');
        // the deep fold is the ONE that must not offer a click-through to itself
        expect(screen.queryByTestId('evidence-open-governance-audit')).toBeNull();
    });

    it('the deep fold shows the violation banner when a face disagrees', () => {
        render(
            <EvidencePacketView
                fold="deep"
                packet={packetFixture({
                    gateLandings: [
                        {
                            gateId: 'g1',
                            gateType: 'iod17-parity',
                            state: 'blocked',
                            iod17Parity: {
                                capabilityMatrixState: 'agent-allowed',
                                agentContractState: 'human-required',
                                widgetState: 'human-required',
                                inParity: false
                            }
                        }
                    ]
                })}
            />
        );
        expect(screen.getByTestId('evidence-iod17-violation').textContent).toBe(
            'IOD-17 parity violated — gateway will reject any transition'
        );
    });

    it('the deep fold says so when the packet carries no readout at all', () => {
        render(<EvidencePacketView packet={packetFixture()} fold="deep" />);
        expect(screen.getByTestId('evidence-iod17-pending').textContent).toContain(
            "s4'.mediation.capabilities.list"
        );
        expect(screen.queryByTestId('evidence-iod17-parity')).toBeNull();
    });
});

describe('28.T28.8 (b/d/e/f) — the badge and the close-paths', () => {
    it('the mediator badge carries kind AND subagent identity (26.9)', () => {
        render(<EvidencePacketView packet={packetFixture()} />);
        const badge = screen.getByTestId('evidence-mediator');
        expect(badge.textContent).toBe('Aletheia · moirai');
        expect(badge.getAttribute('data-mediator')).toBe('aletheia');
        expect(badge.getAttribute('data-subagent')).toBe('moirai');
        expect(badge.className).toContain('mediator-aletheia-moirai');
        cleanup();

        render(<EvidencePacketView packet={packetFixture({ mediatedBy: { kind: 'pi' } })} />);
        const pi = screen.getByTestId('evidence-mediator');
        expect(pi.className).toContain('mediator-pi');
        expect(pi.getAttribute('data-subagent')).toBe('');
    });

    it('(d) the tool-stream cross-link fires with THIS record id', () => {
        const onOpenToolStream = vi.fn();
        render(<EvidencePacketView packet={packetFixture()} onOpenToolStream={onOpenToolStream} />);
        const link = screen.getByTestId('evidence-open-tools');
        expect(link.getAttribute('data-cross-link')).toBe('omnipanel.tool-stream');
        expect(link.getAttribute('data-evidence-id')).toBe('packet-1');
        fireEvent.click(link);
        expect(onOpenToolStream).toHaveBeenCalledWith('packet-1');
    });

    it('(e) the axiom link is DISABLED and names the target the ledger cannot resolve', () => {
        render(
            <EvidencePacketView
                fold="deep"
                packet={packetFixture({
                    axiomTranslationSteps: [
                        {
                            id: 'ax-1',
                            fromForm: 'philosophical-english',
                            toForm: 'formal-notation',
                            inputText: 'a',
                            outputText: 'b',
                            reasoningTrace: 'c'
                        }
                    ]
                })}
            />
        );
        const seam = screen.getByTestId('evidence-axiom-link');
        expect(seam.getAttribute('data-wire-state')).toBe('unwired');
        expect(seam.textContent).toContain('ide-shell-m0-m5/axiom-translation-inspector');
        expect((screen.getByTestId('evidence-axiom-link-button') as HTMLButtonElement).disabled).toBe(
            true
        );
        // the steps themselves still render — the data is real, the ROUTE is not
        expect(screen.getByTestId('evidence-axiom-steps').textContent).toContain('formal-notation');
    });

    it('(f) the contemplation close-path appears ONLY when the run landed one', () => {
        const onOpenContemplation = vi.fn();
        render(
            <EvidencePacketView packet={packetFixture()} onOpenContemplation={onOpenContemplation} />
        );
        expect(screen.queryByTestId('evidence-open-contemplation')).toBeNull();
        cleanup();

        render(
            <EvidencePacketView
                packet={packetFixture({ contemplationObjectRef: 'contemplation://run-1' })}
                onOpenContemplation={onOpenContemplation}
            />
        );
        fireEvent.click(screen.getByTestId('evidence-open-contemplation'));
        expect(onOpenContemplation).toHaveBeenCalledWith('contemplation://run-1');
    });

    it('the abbreviated fold discloses the click-through it cannot route', () => {
        render(<EvidencePacketView packet={packetFixture()} />);
        const seam = screen.getByTestId('evidence-open-governance-audit');
        expect(seam.getAttribute('data-wire-state')).toBe('unwired');
        expect(
            (screen.getByTestId('evidence-open-governance-audit-button') as HTMLButtonElement).disabled
        ).toBe(true);
        expect(seam.textContent).toContain(EVIDENCE_DEEP_RENDER_SURFACE);
    });
});

describe('28.T28.8 — the seam register is held against the real tree', () => {
    it('every declared seam states a reason, and a rename is recorded not substituted', () => {
        expect(EVIDENCE_PANE_SEAMS.length).toBeGreaterThanOrEqual(6);
        for (const seam of EVIDENCE_PANE_SEAMS) {
            expect(seam.reason.length, `${seam.name} has no reason`).toBeGreaterThan(80);
            expect(seam.deliverable).toMatch(/^28\.8 /);
        }
        expect(evidencePaneSeam('m5-epii/contemplationObject')?.carrierName).toBe(
            'm5-epii/contemplationObject'
        );
    });

    it('every seam this pane claims as a live gateway method really exists in Body/S', () => {
        const methods = EVIDENCE_PANE_SEAMS.filter(
            seam => seam.kind === 'gateway-method' && seam.available
        );
        expect(methods.length).toBeGreaterThanOrEqual(3);
        for (const seam of methods) {
            expect(registeredInSubstrate(seam.name), `${seam.name} must exist in Body/S`).toBe(true);
        }
    });

    it('the axiom-inspector target really is unresolvable — this reddens the day a row lands', () => {
        // The behaviour, not the file text: the live ledger's own resolver.
        expect(
            intentTarget({
                requestedExtensionId: 'ide-shell-m0-m5',
                requestedContributionId: 'axiom-translation-inspector'
            })
        ).toBeNull();
        expect(evidencePaneSeam('ide-shell-m0-m5/axiom-translation-inspector')?.available).toBe(
            false
        );
        // …while the contemplation close-path DOES resolve, under the carrier's
        // own contribution id — the correction the register records.
        expect(
            intentTarget({
                requestedExtensionId: 'm5-epii',
                requestedContributionId: 'contemplationObject'
            })?.component
            // …and it lands on the Review fold, which is where the carrier
            // really mounts `ContemplationObjectViewer` (ReviewBlocksPane).
        ).toBe('omniReview');
    });

    it('the evidence-panel target still resolves to the `/` fold and does NOT promote to depth', () => {
        // DR-WC-IS-2's deep half is reached by shared record identity, not by an
        // ide-deep promotion nobody licensed (52.T3). If that ever changes, the
        // disabled click-through above is a lie and this test says so.
        const target = intentTarget({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'evidence-panel'
        });
        expect(target?.component).toBe('omniEvidence');
        expect(target?.preferredLayout).toBeNull();
    });
});
