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
import { PSYCHE_ASPECT_REGISTERS } from './omnipanelCapabilities';

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

/**
 * 26.T26.8 — DR-WC-M5-3 is a property of the FOLD, not a comment beside it.
 *
 * The decision reads "constitutional-agent roster renders as psyche-facet
 * badges on Pi dispatch traces (not peer agent rows); Sophia surfaces only as
 * facet". Before this tranche the only machine-held statement of that claim was
 * `acrGovernance.test.ts`, which asserts over a STATIC projection of a frozen
 * constant — so it was true by construction and could never have caught the
 * live path. This producer, the one place a session identity becomes a rendered
 * actor, derived the actor straight from the session key: a real
 * `agent:sophia:main` session minted `{ actor: 'sophia', role: 'pi' }` — the
 * peer actor row the decision forbids, with the facet badge sitting redundantly
 * beside it. These cases fail against that fold.
 */
describe('26.T26.8 — a psyche aspect register can never occupy an actor row', () => {
    it('folds a Sophia-attributed session onto the Pi harness row carrying a Sophia facet', () => {
        const [record] = dispatchGenealogyFromSessions([session({ sessionKey: 'agent:sophia:main' })]);
        // The row is Pi's; Sophia is the VOICE, per DR-WC-M5-3.
        expect(record.actor.actor).toBe('pi');
        expect(record.actor.role).toBe('pi');
        expect(record.psycheFacet).toBe('sophia');
        // Nothing is dropped — the session still folds to exactly one visible run.
        const trees = foldGenealogyTree([record]);
        expect(trees).toHaveLength(1);
        expect(trees[0].actor.actor).toBe('pi');
        expect(trees[0].psycheFacet).toBe('sophia');
    });

    it('holds for every one of the six non-dispatch registers, not just Sophia', () => {
        const records = dispatchGenealogyFromSessions(
            PSYCHE_ASPECT_REGISTERS.map(register => session({ sessionKey: `agent:${register}:main` }))
        );
        expect(records).toHaveLength(PSYCHE_ASPECT_REGISTERS.length);
        for (const [index, register] of PSYCHE_ASPECT_REGISTERS.entries()) {
            expect(records[index].actor.actor, `${register} took an actor row`).toBe('pi');
            expect(records[index].psycheFacet).toBe(register);
        }
        const actors = new Set(records.map(r => r.actor.actor));
        for (const register of PSYCHE_ASPECT_REGISTERS) {
            expect(actors.has(register), `${register} is an actor`).toBe(false);
        }
    });

    it('leaves Anima its own row — it IS the dispatcher (DR-M5-1), and speaks in its facet', () => {
        const [record] = dispatchGenealogyFromSessions([session({ sessionKey: 'agent:anima:main' })]);
        expect(record.actor.actor).toBe('anima');
        expect(record.actor.role).toBe('anima');
        expect(record.psycheFacet).toBe('anima');
    });

    it('leaves Pi and the Aletheia guardians untouched — they carry no psyche facet', () => {
        const records = dispatchGenealogyFromSessions([
            session({ sessionKey: 'agent:pi:main' }),
            session({ sessionKey: 'agent:anima:subagent:moirai', spawnedBy: 'agent:anima:main' })
        ]);
        expect(records[0].actor.actor).toBe('pi');
        expect(records[0].psycheFacet).toBeUndefined();
        expect(records[1].actor.actor).toBe('moirai');
        expect(records[1].actor.role).toBe('subagent');
        expect(records[1].psycheFacet).toBeUndefined();
    });
});
