import { describe, expect, it } from 'vitest';
import { useTickStore } from '../state/stores';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import {
    BIMBA_SUBSTRATE,
    M0_GRAPH_VIEW,
    MATHEME_SPINE_TOTAL,
    OWNED_BINDINGS,
    THREE_RENDERINGS,
    crossSurfacePropagation,
    ownedBinding
} from './compositionContract';

describe('plugin-integrated-1-2-3 composition contract (09.T9.5)', () => {
    it('explicitly names and owns B-8, B-9, B-12', () => {
        // design-recon Verify: "composition contract names B-8/B-9/B-12 explicitly".
        expect(OWNED_BINDINGS.map(b => b.id)).toEqual(['B-8', 'B-9', 'B-12']);
        expect(OWNED_BINDINGS.every(b => b.owner === 'plugin-integrated-1-2-3')).toBe(true);
        expect(ownedBinding('B-8').name).toContain('solar');
        expect(ownedBinding('B-9').name).toContain('planetary');
        expect(ownedBinding('B-12').name).toContain('propagation');
    });

    it('the three renderings are the M1/M2/M3 body poles composing 137 = 64 + 72 + 1', () => {
        expect(THREE_RENDERINGS.map(r => r.pole)).toEqual(['M1', 'M2', 'M3']);
        expect(THREE_RENDERINGS.every(r => r.parentAttribution === 'M1-5')).toBe(true);
        const byPole = Object.fromEntries(THREE_RENDERINGS.map(r => [r.pole, r]));
        expect(byPole.M1.geometry).toBe('torus-knot/klein');
        expect(byPole.M2.count).toBe(72);
        expect(byPole.M3.count).toBe(64);
        expect(byPole.M1.count + byPole.M2.count + byPole.M3.count).toBe(MATHEME_SPINE_TOTAL);
        expect(MATHEME_SPINE_TOTAL).toBe(137);
    });

    it('M0′ is the structural graph view of the SAME substrate, never a fourth body pole', () => {
        expect(M0_GRAPH_VIEW.isBodyRendering).toBe(false);
        expect(M0_GRAPH_VIEW.affordance).toBe('structural-graph-view');
        // the six data-layers are how the Bimba map is surfaced, not extra poles.
        expect(M0_GRAPH_VIEW.layers).toEqual(['lang', 'ql', 'rel', 'time', 'pers', 'pedag']);
        expect((THREE_RENDERINGS as ReadonlyArray<{ pole: string }>).some(r => r.pole === 'M0')).toBe(false);
    });

    it('B-8 non-fork: one Neo4j :Bimba substrate under every rendering', () => {
        expect(BIMBA_SUBSTRATE.label).toBe(':Bimba');
        expect(BIMBA_SUBSTRATE.coordinateProperty).toBe('coordinate');
        expect(BIMBA_SUBSTRATE.nonFork).toBe(true);
    });

    describe('B-12 cross-surface edit propagation law', () => {
        it('a graph-revision advance carries an edit across all renderings on the next generation', () => {
            const decision = crossSurfacePropagation(
                { generation: 4, graphRevision: 'rev-a' },
                { generation: 5, graphRevision: 'rev-b' }
            );
            expect(decision.reRead).toBe(true);
            expect(decision.carriesEdit).toBe(true);
            expect(decision.reason).toBe('revision-advanced');
        });

        it('a bare clock tick (same revision) re-reads but carries no edit', () => {
            const decision = crossSurfacePropagation(
                { generation: 4, graphRevision: 'rev-a' },
                { generation: 5, graphRevision: 'rev-a' }
            );
            expect(decision.reRead).toBe(true);
            expect(decision.carriesEdit).toBe(false);
            expect(decision.reason).toBe('clock-tick');
        });

        it('a stale/equal generation propagates nothing — the one generation gate refuses it', () => {
            const stale = crossSurfacePropagation(
                { generation: 5, graphRevision: 'rev-a' },
                { generation: 5, graphRevision: 'rev-b' }
            );
            expect(stale.reRead).toBe(false);
            expect(stale.carriesEdit).toBe(false);
            expect(stale.reason).toBe('stale-generation');
        });

        it('is grounded in the real tick store: only a strictly-advancing generation lands the new revision', () => {
            // The propagation law must agree with stores.ts setProfile — no
            // per-surface cache, one monotonic generation gate for all renderings.
            const profileAt = (generation: number, graphRevision: string): KernelBridgeCachedProfile =>
                ({ generation, profile: { graphRevision } } as unknown as KernelBridgeCachedProfile);

            useTickStore.setState({ profile: null, generation: null });
            useTickStore.getState().setProfile(profileAt(5, 'rev-a'));
            expect(useTickStore.getState().generation).toBe(5);

            // stale governed write — rejected by the gate exactly as the law says
            const staleDecision = crossSurfacePropagation(
                { generation: 5, graphRevision: 'rev-a' },
                { generation: 5, graphRevision: 'rev-b' }
            );
            useTickStore.getState().setProfile(profileAt(5, 'rev-b'));
            expect(staleDecision.reRead).toBe(false);
            expect(useTickStore.getState().generation).toBe(5);

            // advancing governed write — lands and propagates to every rendering
            const liveDecision = crossSurfacePropagation(
                { generation: 5, graphRevision: 'rev-a' },
                { generation: 6, graphRevision: 'rev-b' }
            );
            useTickStore.getState().setProfile(profileAt(6, 'rev-b'));
            expect(liveDecision.reRead).toBe(true);
            expect(liveDecision.carriesEdit).toBe(true);
            expect(useTickStore.getState().generation).toBe(6);
        });
    });
});
