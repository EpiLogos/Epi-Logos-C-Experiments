import { describe, expect, it } from 'vitest';
import {
    BRIDGE_READINESS_IDS,
    classifyReadiness,
    EMPTY_READINESS_SNAPSHOT,
    needsWrappingShell,
    readinessSeverity,
    readinessTier,
    type BridgeReadinessId,
    type MExtensionReadinessSnapshot
} from './bridgeReadiness';

describe('bridgeReadiness — nine-id taxonomy (mirrors S0 @epi-logos/ql-schema readiness.ts)', () => {
    it('declares exactly the nine canonical ids in S0 order', () => {
        expect(BRIDGE_READINESS_IDS).toEqual([
            'bridge_unavailable',
            'profile_missing_field',
            's2_graph_blocked',
            's3_subscription_blocked',
            's5_review_blocked',
            'authority_payload_missing',
            'privacy_blocked',
            'degraded_but_readable',
            'ready_public_current'
        ]);
    });

    it('has no duplicate ids', () => {
        expect(new Set(BRIDGE_READINESS_IDS).size).toBe(9);
    });
});

describe('readinessSeverity — lockstep with S0 readinessSeverity (Rust BridgeReadinessState::severity)', () => {
    it('ready_public_current is ok', () => {
        expect(readinessSeverity('ready_public_current')).toBe('ok');
    });
    it('degraded_but_readable is degraded', () => {
        expect(readinessSeverity('degraded_but_readable')).toBe('degraded');
    });
    it('every other id is blocked', () => {
        const blocked = BRIDGE_READINESS_IDS.filter(
            id => id !== 'ready_public_current' && id !== 'degraded_but_readable'
        );
        for (const id of blocked) {
            expect(readinessSeverity(id)).toBe('blocked');
        }
    });
});

describe('readinessTier — the 28.11(c) visual tier (distinct from severity)', () => {
    it('green for the two readable states', () => {
        expect(readinessTier('ready_public_current')).toBe('green');
        expect(readinessTier('degraded_but_readable')).toBe('green');
    });
    it('amber for the five recoverable dimensional blocks', () => {
        for (const id of [
            'profile_missing_field',
            'authority_payload_missing',
            's2_graph_blocked',
            's3_subscription_blocked',
            's5_review_blocked'
        ] as BridgeReadinessId[]) {
            expect(readinessTier(id)).toBe('amber');
        }
    });
    it('red for the two hard refusals', () => {
        expect(readinessTier('bridge_unavailable')).toBe('red');
        expect(readinessTier('privacy_blocked')).toBe('red');
    });
    it('assigns a tier to every id (total function)', () => {
        for (const id of BRIDGE_READINESS_IDS) {
            expect(['green', 'amber', 'red']).toContain(readinessTier(id));
        }
    });
});

describe('needsWrappingShell — ONLY bridge_unavailable keeps the pending shell (28.11a)', () => {
    it('is true only for bridge_unavailable', () => {
        for (const id of BRIDGE_READINESS_IDS) {
            expect(needsWrappingShell(id)).toBe(id === 'bridge_unavailable');
        }
    });
});

describe('classifyReadiness — per-binding readiness from a snapshot', () => {
    const snapshot: MExtensionReadinessSnapshot = {
        lastTick: 42,
        bindings: {
            's2.graph.node': { state: 's2_graph_blocked', reason: 'neo4j unreachable' },
            "s5'.review.inbox": { state: 'ready_public_current' }
        }
    };

    it('returns the reported state for a known binding, carrying its reason as a blocker', () => {
        const b = classifyReadiness(snapshot, 's2.graph.node');
        expect(b.readinessId).toBe('s2_graph_blocked');
        expect(b.blockers).toEqual(['neo4j unreachable']);
        expect(b.lastTickObserved).toBe(42);
        expect(b.bindingKey).toBe('s2.graph.node');
    });

    it('carries no blockers when the reported state has no reason', () => {
        const b = classifyReadiness(snapshot, "s5'.review.inbox");
        expect(b.readinessId).toBe('ready_public_current');
        expect(b.blockers).toEqual([]);
    });

    it('an unreported binding is bridge_unavailable, not faked-ready', () => {
        const b = classifyReadiness(snapshot, 'never.reported');
        expect(b.readinessId).toBe('bridge_unavailable');
        expect(b.lastTickObserved).toBe(42);
    });

    it('a null snapshot is bridge_unavailable at tick -1 (bridge has said nothing)', () => {
        const b = classifyReadiness(null, 's2.graph.node');
        expect(b.readinessId).toBe('bridge_unavailable');
        expect(b.lastTickObserved).toBe(-1);
    });

    it('EMPTY_READINESS_SNAPSHOT reports every binding as bridge_unavailable', () => {
        expect(EMPTY_READINESS_SNAPSHOT.bindings).toEqual({});
        expect(classifyReadiness(EMPTY_READINESS_SNAPSHOT, 'any').readinessId).toBe('bridge_unavailable');
    });
});
