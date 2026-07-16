// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BRIDGE_READINESS_IDS, type BridgeReadinessBinding, type BridgeReadinessId } from './bridgeReadiness';
import { BridgeReadinessBadge, BridgeReadinessBadgeView } from './BridgeReadinessBadge';
import { useReadinessStore } from '../state/readinessStore';
import { useTickStore } from '../state/stores';

function binding(readinessId: BridgeReadinessId, over: Partial<BridgeReadinessBinding> = {}): BridgeReadinessBinding {
    return { bindingKey: 's2.graph.node', readinessId, blockers: [], lastTickObserved: 0, ...over };
}

function setTick(tick12: number): void {
    act(() => {
        useTickStore.setState({
            generation: 1,
            profile: { generation: 1, profile: { tick12, degree720: tick12 * 60 }, graphRevision: 0 } as never
        });
    });
}

afterEach(() => {
    cleanup();
    act(() => {
        useReadinessStore.getState().clear();
        useTickStore.setState({ generation: null, profile: null });
    });
});

describe('BridgeReadinessBadgeView — pure per-binding rendering across the nine ids', () => {
    it('bridge_unavailable is the ONLY id that renders the wrapping pending shell (28.11a)', () => {
        for (const id of BRIDGE_READINESS_IDS) {
            const { unmount } = render(<BridgeReadinessBadgeView binding={binding(id)} />);
            if (id === 'bridge_unavailable') {
                expect(screen.getByTestId('bridge-readiness-shell')).toBeTruthy();
                expect(screen.queryByTestId('bridge-readiness-border')).toBeNull();
            } else {
                expect(screen.queryByTestId('bridge-readiness-shell')).toBeNull();
                expect(screen.getByTestId('bridge-readiness-border')).toBeTruthy();
            }
            unmount();
        }
    });

    it('every non-shell id renders its tier as a border class + carries readinessId + tier + severity', () => {
        const expectTier: Record<BridgeReadinessId, string> = {
            bridge_unavailable: 'red',
            privacy_blocked: 'red',
            profile_missing_field: 'amber',
            authority_payload_missing: 'amber',
            s2_graph_blocked: 'amber',
            s3_subscription_blocked: 'amber',
            s5_review_blocked: 'amber',
            degraded_but_readable: 'green',
            ready_public_current: 'green'
        };
        for (const id of BRIDGE_READINESS_IDS) {
            if (id === 'bridge_unavailable') continue;
            const { unmount } = render(<BridgeReadinessBadgeView binding={binding(id)} />);
            const el = screen.getByTestId('bridge-readiness-border');
            expect(el.getAttribute('data-readiness')).toBe(id);
            expect(el.getAttribute('data-tier')).toBe(expectTier[id]);
            expect(el.className).toContain(`bridge-readiness-tier-${expectTier[id]}`);
            unmount();
        }
    });

    it('red states (privacy_blocked) render a blocked overlay; green states do not', () => {
        const red = render(<BridgeReadinessBadgeView binding={binding('privacy_blocked')} />);
        expect(screen.getByTestId('blocked-overlay')).toBeTruthy();
        red.unmount();
        render(<BridgeReadinessBadgeView binding={binding('ready_public_current')} />);
        expect(screen.queryByTestId('blocked-overlay')).toBeNull();
    });

    it('green states render no inline pending indicator (readable = quiet)', () => {
        render(<BridgeReadinessBadgeView binding={binding('ready_public_current')} />);
        expect(screen.queryByTestId('readiness-indicator')).toBeNull();
    });

    it('amber states render an inline readiness indicator with the readinessId', () => {
        render(<BridgeReadinessBadgeView binding={binding('s2_graph_blocked')} />);
        const indicator = screen.getByTestId('readiness-indicator');
        expect(indicator.textContent).toContain('s2_graph_blocked');
    });

    it('renders human-readable blockers inline when present', () => {
        render(<BridgeReadinessBadgeView binding={binding('s2_graph_blocked', { blockers: ['neo4j unreachable'] })} />);
        expect(screen.getByTestId('bridge-readiness-blockers').textContent).toContain('neo4j unreachable');
    });
});

describe('BridgeReadinessBadge — live seam: shared store + profile clock', () => {
    beforeEach(() => {
        act(() => useReadinessStore.getState().clear());
    });

    it('an unreported binding renders bridge_unavailable until the bridge reports it', () => {
        render(<BridgeReadinessBadge bindingKey="s2.graph.node" />);
        expect(screen.getByTestId('bridge-readiness-shell')).toBeTruthy();
    });

    it('reporting a binding on the shared store re-renders the badge inline (no shell)', () => {
        render(<BridgeReadinessBadge bindingKey="s2.graph.node" />);
        act(() => {
            useReadinessStore.getState().reportBinding('s2.graph.node', {
                state: 's2_graph_blocked',
                reason: 'neo4j unreachable'
            });
        });
        expect(screen.queryByTestId('bridge-readiness-shell')).toBeNull();
        const el = screen.getByTestId('bridge-readiness-border');
        expect(el.getAttribute('data-readiness')).toBe('s2_graph_blocked');
        expect(screen.getByTestId('bridge-readiness-blockers').textContent).toContain('neo4j unreachable');
    });

    it('the profile tick is the observed clock — lastTickObserved tracks the tick store (15.6)', () => {
        setTick(7);
        act(() => useReadinessStore.getState().reportBinding('s2.graph.node', { state: 'ready_public_current' }));
        render(<BridgeReadinessBadge bindingKey="s2.graph.node" />);
        expect(screen.getByTestId('bridge-readiness-border').getAttribute('data-tick')).toBe('7');
        setTick(9);
        expect(screen.getByTestId('bridge-readiness-border').getAttribute('data-tick')).toBe('9');
    });

    it('two bindings resolve independently from the same shared source', () => {
        act(() => {
            useReadinessStore.getState().reportBinding('s2.graph.node', { state: 'ready_public_current' });
            useReadinessStore.getState().reportBinding("s5'.review.inbox", { state: 's5_review_blocked' });
        });
        render(
            <>
                <BridgeReadinessBadge bindingKey="s2.graph.node" />
                <BridgeReadinessBadge bindingKey="s5'.review.inbox" />
            </>
        );
        const borders = screen.getAllByTestId('bridge-readiness-border');
        const states = borders.map(b => b.getAttribute('data-readiness')).sort();
        expect(states).toEqual(['ready_public_current', 's5_review_blocked']);
    });
});

describe('ingestReadinessEvent — honest adapter over the gateway readiness channel', () => {
    beforeEach(() => act(() => useReadinessStore.getState().clear()));

    it('maps a per-binding readiness frame into the shared store', () => {
        act(() => useReadinessStore.getState().ingestReadinessEvent({
            binding: 's2.graph.node',
            state: 's2_graph_blocked',
            reason: 'neo4j unreachable'
        }));
        expect(useReadinessStore.getState().bindings['s2.graph.node']).toEqual({
            state: 's2_graph_blocked',
            reason: 'neo4j unreachable'
        });
    });

    it('ignores overall/health frames that name no binding (no faking per-binding data)', () => {
        act(() => useReadinessStore.getState().ingestReadinessEvent({ state: 'degraded_but_readable', reason: 'slow' }));
        expect(Object.keys(useReadinessStore.getState().bindings)).toHaveLength(0);
    });

    it('ignores frames with an unknown state id', () => {
        act(() => useReadinessStore.getState().ingestReadinessEvent({ binding: 'x', state: 'not_a_real_state' }));
        expect(Object.keys(useReadinessStore.getState().bindings)).toHaveLength(0);
    });
});
