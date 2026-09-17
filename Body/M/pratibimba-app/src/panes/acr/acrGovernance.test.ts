// @vitest-environment node
/**
 * Coordinate: M' M5' chrome (ACR governance law validator — 28.T28.5)
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Actualises: the pure half of the tranche, and the half a jsdom render cannot
 *   prove. Four claims:
 *     (a) the method register is HONEST in both directions — an `unwired` seam
 *         states a reason and a `live` one does not excuse itself; and the two
 *         methods the 28.5 spec named are held against the REAL substrate
 *         sources, not against a comment. `s5'.review.transition` and
 *         `s5'.epii.runtime_control` must be absent from `Body/S`, and the
 *         replacements must be present, or this tranche's central correction is
 *         wrong and the test says so;
 *     (b) IOD-17 parity is three INDEPENDENT faces — same reading is green,
 *         a disagreement is red and names the disagreeing face, and an unloaded
 *         snapshot is `unknown` rather than an optimistic green;
 *     (c) the DR-M5-1 roster collapse: Pi + Anima + exactly the six Aletheia
 *         techne guardians are executable, and none of the six Psyche aspect
 *         registers is — Sophia included, by name;
 *     (d) the surface identity the reframe must NOT break: the widget id is
 *         preserved while the label changes.
 * Does NOT own: the pane render (`AgenticControlRoomPane.test.tsx`) or the deep
 *   mount (`ui/deepPaneSet.test.ts` + the e2e).
 */

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    ACR_FOLD_ROUTES,
    ACR_METHOD_BINDINGS,
    ACR_PANE_TITLE,
    ACR_SURFACE_ID,
    ACR_TAB_LABEL,
    ACR_UNWIRED_METHODS,
    ACR_WIDGET_ID,
    AGENT_REVIEW_COMMIT_CAPABILITIES,
    IOD17_PARITY_FACES,
    IOD17_PARITY_VIOLATION_MESSAGE,
    PI_RUNTIME_MONITOR_BANNER,
    acrFoldRoute,
    acrMethodBinding,
    acrRoster,
    computeIod17Parity
} from './acrGovernance';
import { omniPanelIntentRouter } from '../omni/omnipanelIntentRouter';
import { ACR_REVIEW_DECISIONS, parseReviewInbox, reviewResolveRequest } from './acrReviewInbox';
import {
    ALETHEIA_TECHNE_GUARDIANS,
    PSYCHE_ASPECT_REGISTERS,
    type MediationCapabilitySnapshot
} from '../omni/omnipanelCapabilities';

const REPO_ROOT = resolve(__dirname, '../../../../../..');

/**
 * Does any Rust source under `Body/S` register this method name? `git grep -c`
 * over the real substrate — the same probe that found the two corrections. The
 * FROZEN `Body/M/epi-theia` tree is deliberately out of scope: it still names
 * both methods and it is dead plumbing.
 */
function registeredInSubstrate(method: string): boolean {
    try {
        const out = execFileSync(
            'git',
            ['grep', '-l', '--fixed-strings', `"${method}"`, '--', 'Body/S/**/*.rs'],
            { cwd: REPO_ROOT, encoding: 'utf8' }
        );
        return out.trim().length > 0;
    } catch {
        // git grep exits 1 on no match
        return false;
    }
}

function snapshot(
    capabilities: MediationCapabilitySnapshot['capabilities']
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

describe('28.T28.5 — the ACR method register is honest in both directions', () => {
    it('an unwired seam states a reason and a live one does not excuse itself', () => {
        expect(ACR_METHOD_BINDINGS.length).toBeGreaterThanOrEqual(5);
        for (const binding of ACR_METHOD_BINDINGS) {
            if (binding.status === 'unwired') {
                expect(binding.unwiredReason ?? '', `${binding.id} is unwired with no reason`).not.toBe('');
                expect((binding.unwiredReason ?? '').length).toBeGreaterThan(80);
            } else {
                expect(binding.unwiredReason, `${binding.id} is live and yet excuses itself`).toBeNull();
            }
            // LAW: a correction exists exactly when the spec named something else
            expect(binding.correction === null).toBe(binding.specNamed === null);
        }
        expect(ACR_UNWIRED_METHODS.map(entry => entry.id)).toEqual(['runtime-control']);
    });

    it("the spec's two methods really are absent from the substrate, and the replacements really are there", () => {
        // If either half of this flips, the tranche's central correction is
        // wrong — better a red test than a surface built on a stale probe.
        expect(
            registeredInSubstrate("s5'.review.transition"),
            "s5'.review.transition — the 28.5 spec's name — must not exist in Body/S"
        ).toBe(false);
        expect(
            registeredInSubstrate("s5'.epii.runtime_control"),
            "s5'.epii.runtime_control must not exist in Body/S; the controls are unwired because of it"
        ).toBe(false);
        for (const method of [
            "s5'.review.inbox",
            "s5'.review.resolve",
            "s5'.review.submit",
            "s5'.epii.deposit"
        ]) {
            expect(registeredInSubstrate(method), `${method} must exist in Body/S`).toBe(true);
        }
    });

    it('the review-decision seam rides `resolve` and carries the correction on its face', () => {
        const decision = acrMethodBinding('review-decision');
        expect(decision.method).toBe("s5'.review.resolve");
        expect(decision.specNamed).toBe("s5'.review.transition");
        expect(decision.correction).toContain('registered nowhere');
        expect(decision.status).toBe('live');
    });

    it('the runtime-control seam names the method it does not have', () => {
        const control = acrMethodBinding('runtime-control');
        expect(control.method).toBe("s5'.epii.runtime_control");
        expect(control.status).toBe('unwired');
        expect(control.unwiredReason).toContain('No such method exists');
    });

    it('refuses an unknown binding id rather than returning a blank', () => {
        expect(() => acrMethodBinding('nope')).toThrow(/unknown ACR method binding/);
    });
});

describe('28.T28.5 — IOD-17 three-cell parity', () => {
    const empty = snapshot([]);

    it('a human-required item reads human-required on all three faces', () => {
        const readout = computeIod17Parity({
            humanRequired: true,
            decision: 'approve',
            snapshot: empty
        });
        expect(readout.cells.map(cell => cell.face)).toEqual([...IOD17_PARITY_FACES]);
        expect(readout.cells.every(cell => cell.state === 'human-required')).toBe(true);
        expect(readout.inParity).toBe(true);
        expect(readout.violation).toBeNull();
        expect(readout.disagreements).toEqual([]);
    });

    it('surfaces the verbatim violation banner and names the disagreeing face', () => {
        // A non-human-gated item: the agent contract admits an agent committal
        // while the matrix exposes no capability that could carry one — a real
        // disagreement, and the banner's claim (the transition would be
        // rejected) is literally true of that state.
        const readout = computeIod17Parity({
            humanRequired: false,
            decision: 'approve',
            snapshot: empty
        });
        expect(readout.inParity).toBe(false);
        expect(readout.violation).toBe(IOD17_PARITY_VIOLATION_MESSAGE);
        expect(readout.disagreements).toEqual(['agent-contract']);
    });

    it('the capability-matrix face flips when the live projection exposes a review-commit tool', () => {
        // The drift IOD-17 exists to catch: a `standard` entitlement on an
        // action `capability-matrix.json` lists as forbidden for every agent.
        const drifted = snapshot([
            { name: AGENT_REVIEW_COMMIT_CAPABILITIES[0], entitlementClass: 'standard' }
        ]);
        const readout = computeIod17Parity({
            humanRequired: true,
            decision: 'approve',
            snapshot: drifted
        });
        const matrix = readout.cells.find(cell => cell.face === 'capability-matrix');
        expect(matrix?.state).toBe('agent-permitted');
        expect(matrix?.source).toContain(AGENT_REVIEW_COMMIT_CAPABILITIES[0]);
        expect(readout.inParity).toBe(false);
        expect(readout.disagreements).toEqual(['capability-matrix']);
    });

    it('an aletheia-mode-internal entitlement is NOT an agent commit path', () => {
        const internal = snapshot([
            { name: AGENT_REVIEW_COMMIT_CAPABILITIES[1], entitlementClass: 'aletheia-mode-internal' }
        ]);
        const readout = computeIod17Parity({
            humanRequired: true,
            decision: 'approve',
            snapshot: internal
        });
        expect(readout.cells.find(cell => cell.face === 'capability-matrix')?.state).toBe(
            'human-required'
        );
        expect(readout.inParity).toBe(true);
    });

    it('an unloaded snapshot is `unknown`, never an optimistic green', () => {
        const readout = computeIod17Parity({
            humanRequired: true,
            decision: 'approve',
            snapshot: null
        });
        expect(readout.cells.find(cell => cell.face === 'capability-matrix')?.state).toBe('unknown');
        expect(readout.inParity).toBe(false);
    });

    it('the widget face is a standing declaration, not a mirror of the others', () => {
        for (const humanRequired of [true, false]) {
            const readout = computeIod17Parity({
                humanRequired,
                decision: 'approve',
                snapshot: empty
            });
            expect(readout.cells.find(cell => cell.face === 'widget')?.state).toBe('human-required');
        }
    });
});

describe('28.T28.5 — DR-M5-1 roster collapse', () => {
    const roster = acrRoster();

    it('Pi + Anima + exactly the six Aletheia techne guardians are executable', () => {
        expect(roster.dispatchTargets.map(target => target.actor)).toEqual([
            'pi',
            'anima',
            ...ALETHEIA_TECHNE_GUARDIANS
        ]);
        expect(roster.dispatchTargets.every(target => target.executable)).toBe(true);
        expect(roster.dispatchTargets.filter(t => t.mode === 'crystallisation')).toHaveLength(6);
        expect(roster.dispatchTargets.filter(t => t.mode === 'harness')).toHaveLength(1);
        expect(roster.dispatchTargets.filter(t => t.mode === 'dispatcher')).toHaveLength(1);
    });

    it('no Psyche aspect register is executable, and Sophia is one of them', () => {
        expect(roster.aspectRegisters.map(entry => entry.register)).toEqual([
            ...PSYCHE_ASPECT_REGISTERS
        ]);
        expect(roster.aspectRegisters.some(entry => entry.executable)).toBe(false);
        const sophia = roster.aspectRegisters.find(entry => entry.register === 'sophia');
        expect(sophia, 'Sophia must be present as a FACET').toBeDefined();
        expect(sophia?.why).toContain('never an actor row');
        // …and never as an actor
        expect(roster.dispatchTargets.some(target => target.actor === 'sophia')).toBe(false);
    });

    it('the two columns are disjoint — no register can be in both', () => {
        const actors = new Set(roster.dispatchTargets.map(target => target.actor));
        for (const aspect of roster.aspectRegisters) {
            expect(actors.has(aspect.register), `${aspect.register} is in both columns`).toBe(false);
        }
    });
});

/**
 * 26.T26.7 — the fold crossings, resolved through the LIVE 27.9 router.
 *
 * The defect this closes was not a missing component: it was a crossing that
 * NAMED one fold and opened another. `agentic-control-room.select-run` resolves
 * to `dispatch-trace` — the structural fold the governance pane renders itself —
 * so the `<ToolStream />` 26.7 (a) lists among the T8 contents was reachable
 * from the control room by no path at all, while the pane's button said it was.
 * A register that merely asserted the intended destination would have been the
 * same class of claim, so every row is resolved through the real router here.
 */
describe('26.T26.7 — the ACR fold-route register is resolved, not asserted', () => {
    it('every declared crossing lands on the fold the register names', () => {
        for (const route of ACR_FOLD_ROUTES) {
            const resolved = omniPanelIntentRouter.route({
                coordinate: null,
                artifactUri: 'node-7',
                reviewId: null,
                dayNow: null,
                sessionKey: null,
                profileGeneration: null,
                privacyClass: null,
                requestedExtensionId: route.extensionId,
                requestedContributionId: route.contributionId
            });
            expect(resolved, `${route.routeKey} resolves to no fold at all`).toBeTruthy();
            expect(resolved?.activateTab, `${route.routeKey} lands elsewhere`).toBe(route.landsOn);
        }
    });

    it('the temporal crossing is the TIME-ORDERED fold, and carries the node as its event id', () => {
        const temporal = acrFoldRoute('temporal-fold');
        expect(temporal.landsOn).toBe('tool-stream');
        expect(temporal.direction).toBe('outbound');
        const resolved = omniPanelIntentRouter.route({
            coordinate: null,
            artifactUri: 'node-7',
            reviewId: null,
            dayNow: null,
            sessionKey: null,
            profileGeneration: null,
            privacyClass: null,
            requestedExtensionId: temporal.extensionId,
            requestedContributionId: temporal.contributionId
        });
        // `ToolStreamPanel` looks `selectedEventId` up in `genealogyIndex` — the
        // SAME map the RunTree indexes by — so carrying the node id under that
        // key is what makes "one node, two foldings" true (15.11).
        expect(resolved?.perTabPayload).toEqual({ selectedEventId: 'node-7' });
    });

    it('the canonical select-run key is INBOUND — it lands on the structural fold', () => {
        const structural = acrFoldRoute('structural-fold-inbound');
        expect(structural.direction).toBe('inbound');
        // The pane renders that fold itself; a crossing to it would be a second
        // copy of the tree on screen, which is precisely the misfire found.
        expect(structural.landsOn).toBe('dispatch-trace');
        expect(structural.landsOn).not.toBe(acrFoldRoute('temporal-fold').landsOn);
    });

    it('an unknown crossing is refused rather than silently resolved', () => {
        expect(() => acrFoldRoute('backend-studio')).toThrow(/unknown ACR fold route/);
    });
});

describe('28.T28.5 — the reframe keeps the surface identity', () => {
    it('renames the label and preserves the widget id + surface id', () => {
        expect(ACR_SURFACE_ID).toBe('agenticControlRoom');
        expect(ACR_WIDGET_ID).toBe('pratibimba.ide-shell.agentic-control-room');
        expect(ACR_PANE_TITLE).toBe('Pi Runtime Monitor (ACR)');
        expect(ACR_TAB_LABEL).toContain('Pi Monitor');
        expect(ACR_TAB_LABEL).toContain('ACR');
        expect(ACR_PANE_TITLE).not.toContain('Agentic Control Room');
    });

    it('the banner states the DR-M5-1 shape, not just a title', () => {
        expect(PI_RUNTIME_MONITOR_BANNER).toContain('Single agent harness');
        expect(PI_RUNTIME_MONITOR_BANNER).toContain('Anima dispatches');
        expect(PI_RUNTIME_MONITOR_BANNER).toContain('crystallisation-mode');
    });
});

describe('28.T28.5 — the review inbox projection', () => {
    it('drops a row that does not state its human gate rather than defaulting it', () => {
        const items = parseReviewInbox({
            items: [
                {
                    item_id: 'a',
                    title: 'gated',
                    requires_human: true,
                    priority: 'blocking',
                    status: 'open',
                    source: 'human_gate',
                    created_at: 7,
                    coordinate_context: { coordinate: 'M5-4' }
                },
                { item_id: 'b', title: 'no gate stated' },
                { item_id: '', title: 'blank id', requires_human: false },
                'not an object'
            ]
        });
        expect(items.map(item => item.itemId)).toEqual(['a']);
        expect(items[0].requiresHuman).toBe(true);
        expect(items[0].coordinate).toBe('M5-4');
        expect(items[0].createdAtMs).toBe(7);
    });

    it('yields nothing from a malformed envelope', () => {
        expect(parseReviewInbox(null)).toEqual([]);
        expect(parseReviewInbox({})).toEqual([]);
        expect(parseReviewInbox({ items: 'nope' })).toEqual([]);
    });

    it('composes a `resolved_by: human` request — there is no agent path from here', () => {
        const request = reviewResolveRequest({
            itemId: 'a',
            decision: 'approve',
            rationale: 'checked'
        });
        expect(request.item_id).toBe('a');
        expect(request.decision).toBe('approve');
        expect(request.resolved_by).toBe('human');
        // S5's four decisions, not the carrier gate's wider vocabulary
        expect([...ACR_REVIEW_DECISIONS]).toEqual(['approve', 'reject', 'revise', 'defer']);
    });
});
