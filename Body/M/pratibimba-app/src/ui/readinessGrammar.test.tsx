// @vitest-environment jsdom
/**
 * 32.T32.5 validator — the grammar contract's own gate.
 *
 * Three laws, each asserted rather than described: every contract state has a
 * grammar row; every flavour hangs off a parent state within the nine; and the
 * checked-in JSON contract still says what the code says. The renderer block
 * proves all nine states and all five flavours reach the DOM distinctly, so a
 * grammar row that nothing renders cannot pass as landed.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    BRIDGE_READINESS_IDS,
    needsWrappingShell,
    readinessRecovery,
    readinessSeverity,
    readinessTier,
    type BridgeReadinessBinding,
    type BridgeReadinessId,
    type MExtensionReadinessSnapshot
} from './bridgeReadiness';
import {
    flavourOf,
    grammarFor,
    READINESS_FLAVOUR_ENTRIES,
    READINESS_FLAVOURS,
    READINESS_GRAMMAR,
    type MExtensionReadinessFlavour
} from './readinessGrammar';
import { BridgeReadinessBadgeView } from './BridgeReadinessBadge';

// vitest runs from the carrier root, so the contract resolves off cwd; the
// module-relative URL form is not a file: URL under the transform.
const CONTRACT_PATH = resolve(process.cwd(), 'contracts/readiness-state-grammar.json');

function binding(
    readinessId: BridgeReadinessId,
    over: Partial<BridgeReadinessBinding> = {}
): BridgeReadinessBinding {
    return { bindingKey: 's2.graph.node', readinessId, blockers: [], lastTickObserved: 0, ...over };
}

function snapshot(lastTick: number): MExtensionReadinessSnapshot {
    return { bindings: {}, lastTick };
}

afterEach(cleanup);

describe('32.T32.5 — every contract state has a grammar entry', () => {
    it('covers the nine ids exactly once, in canonical S0 order', () => {
        expect(READINESS_GRAMMAR.map(entry => entry.state)).toEqual([...BRIDGE_READINESS_IDS]);
    });

    it('every row carries non-empty copy', () => {
        for (const entry of READINESS_GRAMMAR) {
            expect(entry.copy.trim().length).toBeGreaterThan(0);
        }
    });

    it('does NOT re-declare the landed readiness laws — it computes them', () => {
        // The whole point: one severity/tier/shell/recovery authority. If the
        // grammar ever hard-codes its own copy of these, this fails.
        for (const entry of READINESS_GRAMMAR) {
            expect(entry.shell).toBe(needsWrappingShell(entry.state) ? 'wrapping' : 'inline');
            expect(entry.tier).toBe(readinessTier(entry.state));
            expect(entry.severity).toBe(readinessSeverity(entry.state));
            expect(entry.recovery).toEqual(readinessRecovery(entry.state));
        }
    });
});

describe('32.T32.5 — every flavour has a parent contract state (DR-WC-OB-1)', () => {
    it('declares exactly the five flavours', () => {
        expect(READINESS_FLAVOUR_ENTRIES.map(entry => entry.flavour)).toEqual([
            ...READINESS_FLAVOURS
        ]);
    });

    it('no flavour is free-standing — each parent is one of the nine', () => {
        for (const entry of READINESS_FLAVOUR_ENTRIES) {
            expect(BRIDGE_READINESS_IDS).toContain(entry.parentState);
        }
    });

    it('each flavour appears on its parent row and on no other', () => {
        for (const entry of READINESS_FLAVOUR_ENTRIES) {
            const owners = READINESS_GRAMMAR.filter(row => row.flavours.includes(entry.flavour));
            expect(owners.map(row => row.state)).toEqual([entry.parentState]);
        }
    });
});

describe('32.T32.5 — the checked-in contract matches the code', () => {
    it('readiness-state-grammar.json is a faithful snapshot, not a second source of truth', () => {
        const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8'));
        expect(contract.states).toEqual(
            READINESS_GRAMMAR.map(entry => ({
                state: entry.state,
                shell: entry.shell,
                tier: entry.tier,
                severity: entry.severity,
                copy: entry.copy,
                recovery: { label: entry.recovery.label, commandId: entry.recovery.commandId },
                flavours: [...entry.flavours]
            }))
        );
        expect(contract.flavours).toEqual(
            READINESS_FLAVOUR_ENTRIES.map(entry => ({
                flavour: entry.flavour,
                parentState: entry.parentState,
                copy: entry.copy,
                render: entry.render
            }))
        );
    });
});

describe('32.T32.5 — flavourOf derives the render variant from real context', () => {
    it('the two pure aliases fire on their state alone', () => {
        expect(flavourOf('s3_subscription_blocked', snapshot(4))).toBe('s3_gateway_unreachable');
        expect(flavourOf('s5_review_blocked', snapshot(4))).toBe('s5_atelier_blocked');
    });

    it('pending_first_tick needs a CONNECTED bridge and no tick — not merely an absent binding', () => {
        expect(flavourOf('bridge_unavailable', snapshot(-1), { bridgeConnected: true })).toBe(
            'pending_first_tick'
        );
        // A real outage is not a "starting" shimmer.
        expect(flavourOf('bridge_unavailable', snapshot(-1), { bridgeConnected: false })).toBeNull();
        // Ticks are flowing, so the binding is genuinely unavailable.
        expect(flavourOf('bridge_unavailable', snapshot(7), { bridgeConnected: true })).toBeNull();
    });

    it('pending_dataset fires only when a payload owner is actually named', () => {
        expect(
            flavourOf('authority_payload_missing', snapshot(3), { blockers: ['3 outer planets'] })
        ).toBe('pending_dataset');
        expect(flavourOf('authority_payload_missing', snapshot(3), { blockers: [] })).toBeNull();
        // A blank reason names nothing — a chip carrying '' is worse than none.
        expect(flavourOf('authority_payload_missing', snapshot(3), { blockers: ['  '] })).toBeNull();
    });

    it('ready_protected_local fires on a protected privacy class and not on a public one', () => {
        expect(
            flavourOf('ready_public_current', snapshot(3), { privacyClass: 'protected-local' })
        ).toBe('ready_protected_local');
        expect(
            flavourOf('ready_public_current', snapshot(3), {
                privacyClass: 'safe-public-current-kernel-tick'
            })
        ).toBeNull();
        expect(flavourOf('ready_public_current', snapshot(3), { privacyClass: null })).toBeNull();
    });

    it('states with no flavour return null rather than inventing one', () => {
        for (const state of ['profile_missing_field', 's2_graph_blocked', 'privacy_blocked', 'degraded_but_readable'] as const) {
            expect(flavourOf(state, snapshot(3), { bridgeConnected: true })).toBeNull();
            expect(grammarFor(state).flavours).toEqual([]);
        }
    });
});

describe('32.T32.5 — the renderer distinguishes all nine states and all five flavours', () => {
    it('every contract state reaches the DOM with its own state class', () => {
        const seen = new Set<string>();
        for (const state of BRIDGE_READINESS_IDS) {
            const { unmount } = render(<BridgeReadinessBadgeView binding={binding(state)} />);
            const node = screen.getByTestId(
                needsWrappingShell(state) ? 'bridge-readiness-shell' : 'bridge-readiness-border'
            );
            expect(node.className).toContain(`bridge-readiness-state-${state}`);
            seen.add(state);
            unmount();
        }
        expect(seen.size).toBe(BRIDGE_READINESS_IDS.length);
    });

    it('every flavour reaches the DOM as its own sub-class, layered over its parent state', () => {
        for (const entry of READINESS_FLAVOUR_ENTRIES) {
            const { unmount } = render(
                <BridgeReadinessBadgeView
                    binding={binding(entry.parentState)}
                    flavour={entry.flavour}
                />
            );
            const node = screen.getByTestId(
                needsWrappingShell(entry.parentState)
                    ? 'bridge-readiness-shell'
                    : 'bridge-readiness-border'
            );
            expect(node.className).toContain(`bridge-readiness-state-${entry.parentState}`);
            expect(node.className).toContain(`bridge-readiness-flavour-${entry.flavour}`);
            expect(node.getAttribute('data-flavour')).toBe(entry.flavour);
            unmount();
        }
    });

    it('no flavour class appears when the state renders plainly', () => {
        const { container } = render(<BridgeReadinessBadgeView binding={binding('ready_public_current')} />);
        expect(container.innerHTML).not.toContain('bridge-readiness-flavour-');
        expect(
            screen.getByTestId('bridge-readiness-border').getAttribute('data-flavour')
        ).toBeNull();
    });

    it('the five flavour classes are distinct from one another', () => {
        const classes = new Set<MExtensionReadinessFlavour>(READINESS_FLAVOURS);
        expect(classes.size).toBe(5);
    });
});
