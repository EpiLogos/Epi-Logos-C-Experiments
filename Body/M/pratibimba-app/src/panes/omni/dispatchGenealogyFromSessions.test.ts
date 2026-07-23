/**
 * Coordinate: M' `/` membrane (dispatch-genealogy live feed — Track 27.T27.3)
 * Actualises: the fold that turns REAL session lineage (sessions.list +
 *   subagents.rs spawnedBy/lineage) into DispatchGenealogyRecords, so the
 *   Dispatch tab renders the Pi -> subagent genealogy — the ONE allowed
 *   agentic path — never a genealogy-blind composition timeline.
 */

import { describe, expect, it } from 'vitest';
import type { SessionRecord } from '../../bridge/sessionClient';
import { dispatchGenealogyFromSessions } from './dispatchGenealogyFromSessions';
import { foldGenealogyTree } from './dispatchGenealogy';

const session = (fields: Record<string, unknown> & { sessionKey: string }): SessionRecord => ({
    ...fields
});

describe('dispatchGenealogyFromSessions — real Pi -> subagent lineage', () => {
    it('roots a Pi/Anima session with no parent and derives its actor from the key', () => {
        const [record] = dispatchGenealogyFromSessions([session({ sessionKey: 'agent:pi:main' })]);
        expect(record.parentId).toBeNull();
        expect(record.actor.role).toBe('pi');
        expect(record.actor.actor).toBe('pi');
    });

    it('nests a subagent UNDER its dispatcher via spawnedBy — never a top-level peer (DR-B-3)', () => {
        const records = dispatchGenealogyFromSessions([
            session({ sessionKey: 'agent:anima:main' }),
            session({ sessionKey: 'agent:anima:subagent:moirai', spawnedBy: 'agent:anima:main' })
        ]);
        const trees = foldGenealogyTree(records);
        // Exactly one root (Anima); the subagent is NOT a top-level peer.
        expect(trees).toHaveLength(1);
        expect(trees[0].id).toBe('agent:anima:main');
        expect(trees[0].children.map(c => c.id)).toEqual(['agent:anima:subagent:moirai']);
        expect(trees[0].children[0].actor.role).toBe('subagent');
    });

    it('routes every subagent through s4\'.mediation.route — the only allowed dispatch path', () => {
        const records = dispatchGenealogyFromSessions([
            session({ sessionKey: 'agent:anima:main' }),
            session({ sessionKey: 'agent:anima:subagent:anansi', spawnedBy: 'agent:anima:main' })
        ]);
        const sub = records.find(r => r.id === 'agent:anima:subagent:anansi')!;
        expect(sub.route.method).toBe("s4'.mediation.route");
        // The subagent id surfaces as the capability, honestly namespaced.
        expect(sub.route.capability).toContain('anansi');
    });

    it('synthesises nothing — unknown timing/status default honestly, no fabricated fields', () => {
        const [record] = dispatchGenealogyFromSessions([session({ sessionKey: 'agent:pi:main' })]);
        expect(record.evidenceRef).toBeNull();
        expect(record.sourceRef).toBeNull();
        // A live session with no close timestamp is running, not fabricated-complete.
        expect(record.endedAtMs).toBeNull();
        expect(record.status).toBe('running');
    });

    it('reads real session status + timing when the record carries them', () => {
        const [record] = dispatchGenealogyFromSessions([
            session({
                sessionKey: 'agent:pi:main',
                status: 'succeeded',
                startedAtMs: 1000,
                endedAtMs: 1500
            })
        ]);
        expect(record.status).toBe('succeeded');
        expect(record.startedAtMs).toBe(1000);
        expect(record.endedAtMs).toBe(1500);
    });

    it('drops nothing and orphans stay visible when a parent is absent from the list', () => {
        const records = dispatchGenealogyFromSessions([
            session({ sessionKey: 'agent:anima:subagent:janus', spawnedBy: 'agent:anima:main' })
        ]);
        // parentId is preserved even though the parent session is not in the list;
        // foldGenealogyTree surfaces it as a visible root rather than dropping it.
        expect(records[0].parentId).toBe('agent:anima:main');
        expect(foldGenealogyTree(records)).toHaveLength(1);
    });
});
